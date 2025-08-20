import { 
  APIGatewayRequestAuthorizerEvent, 
  APIGatewayAuthorizerResult, 
  PolicyDocument 
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
