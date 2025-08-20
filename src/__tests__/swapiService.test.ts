import { SWAPIService } from '../services/swapiService';
import { SWAPIPerson, SWAPIPlanet } from '../types';

// Mock axios
jest.mock('axios');

describe('SWAPIService', () => {
  let swapiService: SWAPIService;

  beforeEach(() => {
    swapiService = new SWAPIService();
    jest.clearAllMocks();
  });

  describe('getPerson', () => {
    it('should fetch a person by ID', async () => {
      const mockPerson: SWAPIPerson = {
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

      // Mock the axios.create().get method
      const mockAxiosInstance = {
        get: jest.fn().mockResolvedValue({ data: mockPerson }),
      };

      (swapiService as any).client = mockAxiosInstance;

      const result = await swapiService.getPerson(1);

      expect(result).toEqual(mockPerson);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/people/1/');
    });

    it('should throw error when person fetch fails', async () => {
      const mockAxiosInstance = {
        get: jest.fn().mockRejectedValue(new Error('Network error')),
      };

      (swapiService as any).client = mockAxiosInstance;

      await expect(swapiService.getPerson(1)).rejects.toThrow(
        'Error fetching person 1',
      );
    });
  });

  describe('extractIdFromUrl', () => {
    it('should extract ID from SWAPI URL', () => {
      const url = 'https://swapi.dev/api/people/1/';
      const id = swapiService.extractIdFromUrl(url);

      expect(id).toBe(1);
    });

    it('should return 1 for invalid URL', () => {
      const url = 'invalid-url';
      const id = swapiService.extractIdFromUrl(url);

      expect(id).toBe(1);
    });
  });

  describe('getRandomPerson', () => {
    it('should get a random person', async () => {
      const mockPerson: SWAPIPerson = {
        name: 'Leia Organa',
        height: '150',
        mass: '49',
        hair_color: 'brown',
        skin_color: 'light',
        eye_color: 'brown',
        birth_year: '19BBY',
        gender: 'female',
        homeworld: 'https://swapi.dev/api/planets/2/',
        films: [],
        species: [],
        vehicles: [],
        starships: [],
        created: '2014-12-10T15:20:09.791000Z',
        edited: '2014-12-20T21:17:50.315000Z',
        url: 'https://swapi.dev/api/people/5/',
      };

      const mockAxiosInstance = {
        get: jest.fn().mockResolvedValue({ data: mockPerson }),
      };

      (swapiService as any).client = mockAxiosInstance;

      const result = await swapiService.getRandomPerson();

      expect(result).toEqual(mockPerson);
      expect(mockAxiosInstance.get).toHaveBeenCalled();
    });
  });

  describe('get Person by name', () => {
    it('should get a person by name', async () => {
      const mockPerson : { count: number, next: string | null, previous: string | null, results: SWAPIPerson[] } = {
        count: 1,
        next: null,
        previous: null,
        results: [
          {
            name: 'Leia Organa',
            height: '150',
            mass: '49',
            hair_color: 'brown',
            skin_color: 'light',
            eye_color: 'brown',
            birth_year: '19BBY',
            gender: 'female',
            homeworld: 'https://swapi.dev/api/planets/2/',
            films: [
              'https://swapi.dev/api/films/1/',
              'https://swapi.dev/api/films/2/',
              'https://swapi.dev/api/films/3/',
              'https://swapi.dev/api/films/6/',
            ],
            species: [],
            vehicles: ['https://swapi.dev/api/vehicles/30/'],
            starships: [],
            created: '2014-12-10T15:20:09.791000Z',
            edited: '2014-12-20T21:17:50.315000Z',
            url: 'https://swapi.dev/api/people/5/',
          },
        ],
      };

      const mockAxiosInstance = {
        get: jest.fn().mockResolvedValue({ data: mockPerson }),
      };

      (swapiService as any).client = mockAxiosInstance;

      const result = await swapiService.getPersonByName('leia');

      expect(result).toEqual(mockPerson.results[0]);
      expect(mockAxiosInstance.get).toHaveBeenCalled();
    });
  });
});
