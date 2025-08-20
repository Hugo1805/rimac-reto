import { FusionService } from '../services/fusionService';
import { SWAPIService } from '../services/swapiService';
import { WeatherService } from '../services/weatherService';
import { DynamoDBService } from '../services/dynamodbService';

// Mock all dependencies
jest.mock('../services/swapiService');
jest.mock('../services/weatherService');
jest.mock('../services/dynamodbService');
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-123'),
}));

describe('FusionService', () => {
  let fusionService: FusionService;
  let mockSwapiService: jest.Mocked<SWAPIService>;
  let mockWeatherService: jest.Mocked<WeatherService>;
  let mockDbService: jest.Mocked<DynamoDBService>;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Create mocked instances
    mockSwapiService = new SWAPIService() as jest.Mocked<SWAPIService>;
    mockWeatherService = new WeatherService() as jest.Mocked<WeatherService>;
    mockDbService = new DynamoDBService() as jest.Mocked<DynamoDBService>;
    
    fusionService = new FusionService();
    
    // Replace the service instances
    (fusionService as any).swapiService = mockSwapiService;
    (fusionService as any).weatherService = mockWeatherService;
    (fusionService as any).dbService = mockDbService;
  });

  describe('createFusionData', () => {
    it('should return cached data if available', async () => {
      const cachedData = {
        id: 'cached-123',
        timestamp: Date.now(),
        character: { name: 'Luke Skywalker' },
        planet: { name: 'Tatooine' },
        weather: { temperature: 25 },
        fusionScore: 75.5,
      };

      mockDbService.generateCacheKey.mockReturnValue('fusion:random');
      mockDbService.getCacheEntry.mockResolvedValue({ 
        cacheKey: 'fusion:random',
        data: cachedData,
        ttl: Date.now() + 1800000,
        createdAt: Date.now(),
      });

      const result = await fusionService.createFusionData();

      expect(result).toEqual(cachedData);
      expect(mockDbService.getCacheEntry).toHaveBeenCalledWith('fusion:random');
      expect(mockSwapiService.getRandomPerson).not.toHaveBeenCalled();
    });

    it('should create new fusion data when cache is empty', async () => {
      const mockPerson = {
        name: 'Luke Skywalker',
        height: '172',
        mass: '77',
        hair_color: 'blond',
        skin_color: 'fair',
        eye_color: 'blue',
        birth_year: '19BBY',
        gender: 'male',
        homeworld: 'https://swapi.dev/api/planets/1/',
        films: [],
        species: [],
        vehicles: [],
        starships: [],
        created: '2014-12-09T13:50:51.644000Z',
        edited: '2014-12-20T21:17:56.891000Z',
        url: 'https://swapi.dev/api/people/1/',
      };

      const mockPlanet = {
        name: 'Tatooine',
        rotation_period: '23',
        orbital_period: '304',
        diameter: '10465',
        climate: 'arid',
        gravity: '1 standard',
        terrain: 'desert',
        surface_water: '1',
        population: '200000',
        residents: [],
        films: [],
        created: '2014-12-09T13:50:49.641000Z',
        edited: '2014-12-20T20:58:18.411000Z',
        url: 'https://swapi.dev/api/planets/1/',
      };

      const mockWeather = {
        coord: { lon: -112.074, lat: 33.4484 },
        weather: [{ id: 800, main: 'Clear', description: 'clear sky', icon: '01d' }],
        base: 'stations',
        main: {
          temp: 35.5,
          feels_like: 34.8,
          temp_min: 32.0,
          temp_max: 38.0,
          pressure: 1013,
          humidity: 25,
        },
        visibility: 10000,
        wind: { speed: 2.5, deg: 230 },
        clouds: { all: 0 },
        dt: 1635768000,
        sys: { type: 2, id: 1234, country: 'US', sunrise: 1635746400, sunset: 1635782400 },
        timezone: -25200,
        id: 5308655,
        name: 'Phoenix',
        cod: 200,
      };

      mockDbService.generateCacheKey.mockReturnValue('fusion:random');
      mockDbService.getCacheEntry.mockResolvedValue(null);
      mockSwapiService.getRandomPerson.mockResolvedValue(mockPerson);
      mockSwapiService.getPlanet.mockResolvedValue(mockPlanet);
      mockWeatherService.mapPlanetToCity.mockReturnValue('Phoenix');
      mockWeatherService.getWeatherByCity.mockResolvedValue(mockWeather);
      mockDbService.saveFusionData.mockResolvedValue();
      mockDbService.setCacheEntry.mockResolvedValue();

      const result = await fusionService.createFusionData();

      expect(result.id).toBe('mock-uuid-123');
      expect(result.character.name).toBe('Luke Skywalker');
      expect(result.planet.name).toBe('Tatooine');
      expect(result.weather.temperature).toBe(35.5);
      expect(result.fusionScore).toBeGreaterThan(0);

      expect(mockSwapiService.getRandomPerson).toHaveBeenCalled();
      expect(mockSwapiService.getPlanet).toHaveBeenCalledWith(mockPerson.homeworld);
      expect(mockWeatherService.mapPlanetToCity).toHaveBeenCalledWith('Tatooine');
      expect(mockWeatherService.getWeatherByCity).toHaveBeenCalledWith('Phoenix');
      expect(mockDbService.saveFusionData).toHaveBeenCalled();
      expect(mockDbService.setCacheEntry).toHaveBeenCalledWith('fusion:random', result, 30);
    });

    it('should handle errors gracefully', async () => {
      mockDbService.generateCacheKey.mockReturnValue('fusion:random');
      mockDbService.getCacheEntry.mockResolvedValue(null);
      mockSwapiService.getRandomPerson.mockRejectedValue(new Error('SWAPI error'));

      await expect(fusionService.createFusionData()).rejects.toThrow('Error creating fusion data');
    });
  });

  describe('data normalization', () => {
    it('should handle unknown values correctly', () => {
      const fusionService = new FusionService();
      
      // Test parseNumeric method
      const parseNumeric = (fusionService as any).parseNumeric;
      expect(parseNumeric('unknown', 0)).toBe(0);
      expect(parseNumeric('n/a', 0)).toBe(0);
      expect(parseNumeric('1,234', 0)).toBe(1234);
      expect(parseNumeric('123.45', 0)).toBe(123.45);
    });

    it('should parse gravity values correctly', () => {
      const fusionService = new FusionService();
      
      const parseGravity = (fusionService as any).parseGravity;
      expect(parseGravity('1 standard')).toBe(1);
      expect(parseGravity('0.5 standard')).toBe(0.5);
      expect(parseGravity('2.5')).toBe(2.5);
      expect(parseGravity('unknown')).toBe(1);
      expect(parseGravity('N/A')).toBe(1);
    });

    it('should normalize color values', () => {
      const fusionService = new FusionService();
      
      const normalizeColor = (fusionService as any).normalizeColor;
      expect(normalizeColor('BLUE,GREEN')).toBe('blue, green');
      expect(normalizeColor('Brown')).toBe('brown');
    });
  });
});
