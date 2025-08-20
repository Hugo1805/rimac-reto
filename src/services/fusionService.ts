import { v4 as uuidv4 } from 'uuid';
import { SWAPIService } from './swapiService';
import { WeatherService } from './weatherService';
import { DynamoDBService } from './dynamodbService';
import { FusionData, SWAPIPerson, SWAPIPlanet, WeatherData } from '../types';

export class FusionService {
  private swapiService: SWAPIService;
  private weatherService: WeatherService;
  private dbService: DynamoDBService;

  constructor() {
    this.swapiService = new SWAPIService();
    this.weatherService = new WeatherService();
    this.dbService = new DynamoDBService();
  }

  async createFusionData(): Promise<FusionData> {
    // Check cache first
    const cacheKey = this.dbService.generateCacheKey('fusion', 'random');
    const cachedData = await this.dbService.getCacheEntry(cacheKey);
    
    if (cachedData) {
      console.log('Returning cached fusion data');
      return cachedData.data as FusionData;
    }

    try {
      // Get random Star Wars character
      const person = await this.swapiService.getRandomPerson();
      
      // Get character's homeworld
      const planet = await this.swapiService.getPlanet(person.homeworld);
      
      // Get weather data for mapped city
      const cityName = this.weatherService.mapPlanetToCity(planet.name);
      const weather = await this.weatherService.getWeatherByCity(cityName);
      
      // Create fusion data
      const fusionData = this.createFusedData(person, planet, weather);
      
      // Save to database
      await this.dbService.saveFusionData(fusionData);
      
      // Cache the result
      await this.dbService.setCacheEntry(cacheKey, fusionData, 30);
      
      return fusionData;
    } catch (error) {
      throw new Error(`Error creating fusion data: ${error}`);
    }
  }

  private createFusedData(person: SWAPIPerson, planet: SWAPIPlanet, weather: WeatherData): FusionData {
    const id = uuidv4();
    const timestamp = Date.now();

    // Normalize and process data
    const character = {
      name: person.name,
      height: this.parseNumeric(person.height, 0), // cm
      mass: this.parseNumeric(person.mass, 0), // kg
      hairColor: this.normalizeColor(person.hair_color),
      skinColor: this.normalizeColor(person.skin_color),
      eyeColor: this.normalizeColor(person.eye_color),
      birthYear: person.birth_year,
      gender: this.normalizeGender(person.gender),
    };

    const planetData = {
      name: planet.name,
      climate: this.normalizeClimate(planet.climate),
      terrain: this.normalizeTerrain(planet.terrain),
      population: this.parseNumeric(planet.population, 0),
      gravity: this.parseGravity(planet.gravity),
      diameter: this.parseNumeric(planet.diameter, 0), // km
    };

    const weatherData = {
      temperature: Math.round(weather.main.temp * 10) / 10,
      feelsLike: Math.round(weather.main.feels_like * 10) / 10,
      humidity: weather.main.humidity,
      pressure: weather.main.pressure,
      windSpeed: Math.round(weather.wind.speed * 10) / 10,
      description: weather.weather[0]?.description || 'unknown',
      visibility: weather.visibility,
    };

    // Calculate fusion score (custom metric)
    const fusionScore = this.calculateFusionScore(character, planetData, weatherData);

    return {
      id,
      timestamp,
      character,
      planet: planetData,
      weather: weatherData,
      fusionScore,
    };
  }

  private parseNumeric(value: string, defaultValue: number): number {
    if (value === 'unknown' || value === 'n/a') return defaultValue;
    const parsed = parseFloat(value.replace(/,/g, ''));
    return isNaN(parsed) ? defaultValue : parsed;
  }

  private parseGravity(gravity: string): number {
    if (gravity === 'unknown' || gravity === 'N/A') return 1;
    
    // Handle formats like "1 standard", "0.5 standard", "2.5"
    const match = gravity.match(/(\d+\.?\d*)/);
    if (match) {
      return parseFloat(match[1]);
    }
    return 1;
  }

  private normalizeColor(color: string): string {
    return color.toLowerCase().replace(/,\s*/g, ', ').trim();
  }

  private normalizeGender(gender: string): string {
    const genderMap: Record<string, string> = {
      'male': 'Male',
      'female': 'Female',
      'hermaphrodite': 'Hermaphrodite',
      'n/a': 'Not Applicable',
      'none': 'None',
    };
    return genderMap[gender.toLowerCase()] || gender;
  }

  private normalizeClimate(climate: string): string {
    return climate.toLowerCase().replace(/,\s*/g, ', ').trim();
  }

  private normalizeTerrain(terrain: string): string {
    return terrain.toLowerCase().replace(/,\s*/g, ', ').trim();
  }

  private calculateFusionScore(
    character: any,
    planet: any,
    weather: any
  ): number {
    let score = 0;

    // Character factors (0-30 points)
    if (character.height > 0) score += Math.min(character.height / 200 * 10, 10);
    if (character.mass > 0) score += Math.min(character.mass / 100 * 10, 10);
    if (character.name.length > 5) score += 5;
    if (character.eyeColor !== 'unknown') score += 5;

    // Planet factors (0-30 points)
    if (planet.population > 1000000) score += 10;
    if (planet.diameter > 10000) score += 10;
    if (planet.gravity >= 0.5 && planet.gravity <= 2) score += 10;

    // Weather factors (0-40 points)
    if (weather.temperature >= 15 && weather.temperature <= 25) score += 15; // Comfortable temp
    if (weather.humidity >= 40 && weather.humidity <= 60) score += 10; // Comfortable humidity
    if (weather.windSpeed < 10) score += 10; // Not too windy
    if (weather.visibility > 5000) score += 5; // Good visibility

    return Math.round(score * 10) / 10;
  }
}
