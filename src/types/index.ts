// Star Wars API Types
export interface SWAPIPerson {
  name: string;
  height: string;
  mass: string;
  hair_color: string;
  skin_color: string;
  eye_color: string;
  birth_year: string;
  gender: string;
  homeworld: string;
  films: string[];
  species: string[];
  vehicles: string[];
  starships: string[];
  created: string;
  edited: string;
  url: string;
}

export interface SWAPIPlanet {
  name: string;
  rotation_period: string;
  orbital_period: string;
  diameter: string;
  climate: string;
  gravity: string;
  terrain: string;
  surface_water: string;
  population: string;
  residents: string[];
  films: string[];
  created: string;
  edited: string;
  url: string;
}

// Weather API Types
export interface WeatherData {
  coord: {
    lon: number;
    lat: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  base: string;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  visibility: number;
  wind: {
    speed: number;
    deg: number;
  };
  clouds: {
    all: number;
  };
  dt: number;
  sys: {
    type: number;
    id: number;
    country: string;
    sunrise: number;
    sunset: number;
  };
  timezone: number;
  id: number;
  name: string;
  cod: number;
}

// Fusion Data Types
export interface FusionData {
  id: string;
  timestamp: number;
  character: {
    name: string;
    height: number; // cm
    mass: number; // kg
    hairColor: string;
    skinColor: string;
    eyeColor: string;
    birthYear: string;
    gender: string;
  };
  planet: {
    name: string;
    climate: string;
    terrain: string;
    population: number;
    gravity: number; // Earth gravities
    diameter: number; // km
  };
  weather: {
    temperature: number; // Celsius
    feelsLike: number; // Celsius
    humidity: number; // percentage
    pressure: number; // hPa
    windSpeed: number; // m/s
    description: string;
    visibility: number; // meters
  };
  fusionScore: number; // Custom metric combining multiple factors
}

// Custom Data Types
export interface CustomData {
  id: string;
  timestamp: number;
  data: Record<string, any>;
  metadata?: {
    source?: string;
    tags?: string[];
    category?: string;
  };
}

// Cache Types
export interface CacheEntry {
  cacheKey: string;
  data: any;
  ttl: number;
  createdAt: number;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Request Types
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface StoreCustomDataRequest {
  data: Record<string, any>;
  metadata?: {
    source?: string;
    tags?: string[];
    category?: string;
  };
}

// JWT Types
export interface JWTPayload {
  userId: string;
  email?: string;
  iat: number;
  exp: number;
}

// Lambda Types
export interface AuthorizerContext {
  userId?: string;
  email?: string;
}
