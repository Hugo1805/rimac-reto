import { WeatherService } from '../services/weatherService';
import { WeatherData } from '../types';

// Mock axios
jest.mock('axios');

describe('WeatherService', () => {
  let weatherService: WeatherService;

  beforeEach(() => {
    weatherService = new WeatherService();
    jest.clearAllMocks();
  });

  describe('getWeatherByCity', () => {
    it('should fetch weather data for a city', async () => {
      const mockWeatherData: WeatherData = {
        coord: { lon: -0.13, lat: 51.51 },
        weather: [
          {
            id: 800,
            main: 'Clear',
            description: 'clear sky',
            icon: '01d',
          },
        ],
        base: 'stations',
        main: {
          temp: 20.5,
          feels_like: 19.8,
          temp_min: 18.0,
          temp_max: 23.0,
          pressure: 1013,
          humidity: 65,
        },
        visibility: 10000,
        wind: {
          speed: 3.5,
          deg: 230,
        },
        clouds: {
          all: 0,
        },
        dt: 1635768000,
        sys: {
          type: 2,
          id: 2019646,
          country: 'GB',
          sunrise: 1635746400,
          sunset: 1635782400,
        },
        timezone: 0,
        id: 2643743,
        name: 'London',
        cod: 200,
      };

      const mockAxiosInstance = {
        get: jest.fn().mockResolvedValue({ data: mockWeatherData }),
      };
      
      (weatherService as any).client = mockAxiosInstance;

      const result = await weatherService.getWeatherByCity('London');

      expect(result).toEqual(mockWeatherData);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/weather', {
        params: {
          q: 'London',
          appid: '',
          units: 'metric',
        },
      });
    });

    it('should throw error when weather fetch fails', async () => {
      const mockAxiosInstance = {
        get: jest.fn().mockRejectedValue(new Error('API error')),
      };
      
      (weatherService as any).client = mockAxiosInstance;

      await expect(weatherService.getWeatherByCity('InvalidCity')).rejects.toThrow('Error fetching weather for InvalidCity');
    });
  });

  describe('mapPlanetToCity', () => {
    it('should map known Star Wars planets to Earth cities', () => {
      expect(weatherService.mapPlanetToCity('Tatooine')).toBe('Phoenix');
      expect(weatherService.mapPlanetToCity('Alderaan')).toBe('Vienna');
      expect(weatherService.mapPlanetToCity('Hoth')).toBe('Reykjavik');
      expect(weatherService.mapPlanetToCity('Coruscant')).toBe('Tokyo');
    });

    it('should return London as default for unknown planets', () => {
      expect(weatherService.mapPlanetToCity('UnknownPlanet')).toBe('London');
    });
  });

  describe('getWeatherByCoordinates', () => {
    it('should fetch weather data by coordinates', async () => {
      const mockWeatherData: Partial<WeatherData> = {
        name: 'Test Location',
        main: {
          temp: 15.0,
          feels_like: 14.5,
          temp_min: 12.0,
          temp_max: 18.0,
          pressure: 1020,
          humidity: 70,
        },
      };

      const mockAxiosInstance = {
        get: jest.fn().mockResolvedValue({ data: mockWeatherData }),
      };
      
      (weatherService as any).client = mockAxiosInstance;

      const result = await weatherService.getWeatherByCoordinates(51.5074, -0.1278);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/weather', {
        params: {
          lat: 51.5074,
          lon: -0.1278,
          appid: '',
          units: 'metric',
        },
      });
    });
  });
});
