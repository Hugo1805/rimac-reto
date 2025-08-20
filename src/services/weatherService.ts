import axios, { AxiosInstance } from 'axios';
import { WeatherData } from '../types';

export class WeatherService {
  private client: AxiosInstance;
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.WEATHER_API_KEY || '';
    this.client = axios.create({
      baseURL: process.env.WEATHER_BASE_URL || 'https://api.openweathermap.org/data/2.5',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async getWeatherByCity(city: string): Promise<WeatherData> {
    try {
      const response = await this.client.get<WeatherData>('/weather', {
        params: {
          q: city,
          appid: this.apiKey,
          units: 'metric', // Celsius
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(`Error fetching weather for ${city}: ${error}`);
    }
  }

  async getWeatherByCoordinates(lat: number, lon: number): Promise<WeatherData> {
    try {
      const response = await this.client.get<WeatherData>('/weather', {
        params: {
          lat,
          lon,
          appid: this.apiKey,
          units: 'metric', // Celsius
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(`Error fetching weather for coordinates ${lat}, ${lon}: ${error}`);
    }
  }

  // Map Star Wars planets to real Earth cities for weather data
  mapPlanetToCity(planetName: string): string {
    const planetCityMap: Record<string, string> = {
      'Tatooine': 'Phoenix', // Desert planet -> Desert city
      'Alderaan': 'Vienna', // Peaceful, temperate planet -> European city
      'Yavin IV': 'Manaus', // Jungle moon -> Amazon city
      'Hoth': 'Reykjavik', // Ice planet -> Cold city
      'Dagobah': 'Miami', // Swamp planet -> Humid city
      'Bespin': 'Denver', // Cloud city -> High altitude city
      'Endor': 'Seattle', // Forest moon -> Forest city
      'Naboo': 'Florence', // Beautiful, peaceful -> Renaissance city
      'Coruscant': 'Tokyo', // City planet -> Megacity
      'Kamino': 'Bergen', // Ocean planet -> Rainy city
      'Geonosis': 'Las Vegas', // Desert planet -> Desert city
      'Utapau': 'Salt Lake City', // Sinkhole planet -> Basin city
      'Mustafar': 'Catania', // Volcanic planet -> City near volcano
      'Kashyyyk': 'Vancouver', // Forest planet -> Forest city
      'Polis Massa': 'Anchorage', // Asteroid -> Remote city
      'Mygeeto': 'Zurich', // Crystal planet -> Alpine city
      'Felucia': 'Singapore', // Jungle planet -> Tropical city
      'Cato Neimoidia': 'Hong Kong', // Bridge cities -> Harbor city
      'Saleucami': 'Perth', // Desert planet -> Isolated city
      'Stewjon': 'Edinburgh', // Obi-Wan's homeworld -> Scottish city
      'Eriadu': 'Birmingham', // Industrial planet -> Industrial city
    };

    return planetCityMap[planetName] || 'London'; // Default to London
  }
}
