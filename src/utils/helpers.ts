import { APIGatewayProxyResult } from 'aws-lambda';

export const createResponse = (
  statusCode: number,
  body: any,
  headers: Record<string, string> = {}
): APIGatewayProxyResult => {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      ...headers,
    },
    body: JSON.stringify(body),
  };
};

export const createSuccessResponse = (data: any, message?: string): APIGatewayProxyResult => {
  return createResponse(200, {
    success: true,
    data,
    message,
  });
};

export const createErrorResponse = (
  statusCode: number,
  error: string,
  message?: string
): APIGatewayProxyResult => {
  return createResponse(statusCode, {
    success: false,
    error,
    message,
  });
};

export const parseJsonBody = <T = any>(body: string | null): T => {
  if (!body) {
    throw new Error('Request body is required');
  }

  try {
    return JSON.parse(body) as T;
  } catch (error) {
    throw new Error('Invalid JSON format');
  }
};

export const validateRequired = (value: any, fieldName: string): void => {
  if (value === undefined || value === null || value === '') {
    throw new Error(`${fieldName} is required`);
  }
};

export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      console.warn(`Attempt ${attempt} failed:`, error);
      
      if (attempt < maxRetries) {
        await delay(delayMs * attempt); // Exponential backoff
      }
    }
  }

  throw lastError!;
};

export const sanitizeString = (str: string): string => {
  return str.trim().replace(/[<>\"']/g, '');
};

export const formatTimestamp = (timestamp: number): string => {
  return new Date(timestamp).toISOString();
};

export const calculateAge = (birthYear: string): number | null => {
  const currentYear = new Date().getFullYear();
  
  // Handle Star Wars years (BBY/ABY format)
  if (birthYear.includes('BBY')) {
    const years = parseFloat(birthYear.replace('BBY', ''));
    return currentYear - (1977 - years); // 1977 is when A New Hope takes place
  }
  
  if (birthYear.includes('ABY')) {
    const years = parseFloat(birthYear.replace('ABY', ''));
    return currentYear - (1977 + years);
  }
  
  return null;
};
