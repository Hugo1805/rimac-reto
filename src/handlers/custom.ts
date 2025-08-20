import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import Joi from 'joi';
import { DynamoDBService } from '../services/dynamodbService';
import { ApiResponse, CustomData, StoreCustomDataRequest, AuthorizerContext } from '../types';

const dbService = new DynamoDBService();

// Validation schema
const storeDataSchema = Joi.object({
  data: Joi.object().required(),
  metadata: Joi.object({
    source: Joi.string().optional(),
    tags: Joi.array().items(Joi.string()).optional(),
    category: Joi.string().optional(),
  }).optional(),
});

export const almacenarDatos = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log('Event:', JSON.stringify(event, null, 2));

  try {
    // Get user context from authorizer
    const authContext = event.requestContext.authorizer as AuthorizerContext;
    console.log('Auth context:', authContext);

    // Parse request body
    if (!event.body) {
      return createErrorResponse(400, 'Cuerpo de la petición es requerido');
    }

    let requestData: StoreCustomDataRequest;
    try {
      requestData = JSON.parse(event.body);
    } catch (error) {
      return createErrorResponse(400, 'Formato JSON inválido');
    }

    // Validate request data
    const { error, value } = storeDataSchema.validate(requestData);
    if (error) {
      return createErrorResponse(400, `Datos inválidos: ${error.details[0].message}`);
    }

    // Create custom data object
    const customData: CustomData = {
      id: uuidv4(),
      timestamp: Date.now(),
      data: value.data,
      metadata: {
        ...value.metadata,
        userId: authContext.userId,
        createdBy: authContext.email || authContext.userId,
      },
    };

    // Save to database
    await dbService.saveCustomData(customData);

    const response: ApiResponse = {
      success: true,
      data: {
        id: customData.id,
        timestamp: customData.timestamp,
      },
      message: 'Datos almacenados exitosamente',
    };

    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.error('Error in almacenarDatos:', error);

    return createErrorResponse(500, 'Error interno del servidor');
  }
};

function createErrorResponse(statusCode: number, message: string): APIGatewayProxyResult {
  const response: ApiResponse = {
    success: false,
    error: message,
  };

  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify(response),
  };
}
