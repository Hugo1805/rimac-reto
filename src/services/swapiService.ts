import axios, { AxiosInstance } from 'axios';
import { SWAPIPerson, SWAPIPlanet } from '../types';

export class SWAPIService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.SWAPI_BASE_URL || 'https://swapi.py4e.com/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async getPerson(id: number): Promise<SWAPIPerson> {
    try {
      const response = await this.client.get<SWAPIPerson>(`/people/${id}/`);
      return response.data;
    } catch (error) {
      throw new Error(`Error fetching person ${id}: ${error}`);
    }
  }

  async getRandomPerson(): Promise<SWAPIPerson> {
    // SWAPI has around 82 people, so we'll pick a random one
    const randomId = Math.floor(Math.random() * 82) + 1;
    return this.getPerson(randomId);
  }

  async getPlanet(url: string): Promise<SWAPIPlanet> {
    try {
      const response = await axios.get<SWAPIPlanet>(url, { timeout: 10000 });
      return response.data;
    } catch (error) {
      throw new Error(`Error fetching planet from ${url}: ${error}`);
    }
  }

  async getPlanetById(id: number): Promise<SWAPIPlanet> {
    try {
      const response = await this.client.get<SWAPIPlanet>(`/planets/${id}/`);
      return response.data;
    } catch (error) {
      throw new Error(`Error fetching planet ${id}: ${error}`);
    }
  }

  extractIdFromUrl(url: string): number {
    const matches = url.match(/\/(\d+)\/$/);
    return matches ? parseInt(matches[1], 10) : 1;
  }

  async getPersonByName(name: string): Promise<SWAPIPerson | null> {
    try {
      const response = await this.client.get(
        `/people/?search=${encodeURIComponent(name)}`,
      );
      const data = response.data;

      if (data.results && data.results.length > 0) {
        // Return the first match (you could also implement fuzzy matching)
        return data.results[0];
      }

      return null;
    } catch (error) {
      throw new Error(`Error searching for person ${name}: ${error}`);
    }
  }
}
