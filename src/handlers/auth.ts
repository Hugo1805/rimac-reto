import { 
  APIGatewayRequestAuthorizerEvent, 
  APIGatewayAuthorizerResult, 
  PolicyDocument,
  APIGatewayProxyEvent,
  APIGatewayProxyResult
} from 'aws-lambda';
import jwt from 'jsonwebtoken';
import { JWTPayload } from '../types';

export const authorize = async (
  event: APIGatewayRequestAuthorizerEvent
): Promise<APIGatewayAuthorizerResult> => {
  console.log('Authorization event:', JSON.stringify(event, null, 2));

  try {
    // Extract token from Authorization header
    const token = extractTokenFromEvent(event);
    
    if (!token) {
      throw new Error('No token provided');
    }

    // Verify JWT token
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-here';
    const payload = jwt.verify(token, jwtSecret) as JWTPayload;

    console.log('JWT payload:', payload);

    // Generate policy
    const policy = generatePolicy(payload.userId, 'Allow', event.methodArn);
    
    // Add user context
    policy.context = {
      userId: payload.userId,
      email: payload.email || '',
    };

    return policy;
  } catch (error) {
    console.error('Authorization error:', error);
    
    // Return deny policy
    return generatePolicy('user', 'Deny', event.methodArn);
  }
};

function extractTokenFromEvent(event: APIGatewayRequestAuthorizerEvent): string | null {
  // Check Authorization header
  const authHeader = event.headers?.Authorization || event.headers?.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Check query parameters
  const token = event.queryStringParameters?.token;
  if (token) {
    return token;
  }

  return null;
}

function generatePolicy(
  principalId: string, 
  effect: 'Allow' | 'Deny', 
  resource: string
): APIGatewayAuthorizerResult {
  const policyDocument: PolicyDocument = {
    Version: '2012-10-17',
    Statement: [
      {
        Action: 'execute-api:Invoke',
        Effect: effect,
        Resource: resource,
      },
    ],
  };

  return {
    principalId,
    policyDocument,
  };
}

// Helper function to generate JWT tokens (for testing)
export const generateToken = (userId: string, email?: string): string => {
  const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-here';
  const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
    userId,
    email,
  };

  return jwt.sign(payload, jwtSecret, { 
    expiresIn: '24h',
    issuer: 'rimac-reto-api',
  });
};

// Agregar esta función al final del archivo
export const getToken = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { username, password } = body;

    console.log('Login attempt for username:', username);

    // Validación simple de credenciales
    if (username === 'admin' && password === 'rimac2025') {
      const token = generateToken('user-123', 'admin@rimac.com');

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        },
        body: JSON.stringify({ 
          token,
          message: 'Authentication successful',
          expiresIn: '24h'
        })
      };
    }

    return {
      statusCode: 401,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ 
        error: 'Invalid credentials',
        message: 'Use username: admin, password: rimac2024'
      })
    };
  } catch (error) {
    console.error('Token generation error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: 'Failed to generate token'
      })
    };
  }
};
