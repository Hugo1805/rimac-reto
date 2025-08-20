import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBService } from '../services/dynamodbService';
import { ApiResponse, PaginationParams, AuthorizerContext } from '../types';

const dbService = new DynamoDBService();

export const getHistorial = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log('Event:', JSON.stringify(event, null, 2));

  try {
    // Get user context from authorizer
    const authContext = event.requestContext.authorizer as AuthorizerContext;
    console.log('Auth context:', authContext);

    // Parse query parameters
    const queryParams = event.queryStringParameters || {};
    const page = parseInt(queryParams.page || '1', 10);
    const limit = Math.min(parseInt(queryParams.limit || '10', 10), 50); // Max 50 items per page
    const type = queryParams.type || 'fusion'; // 'fusion' or 'custom'

    if (page < 1 || limit < 1) {
      return createErrorResponse(400, 'Los parámetros page y limit deben ser números positivos');
    }

    const paginationParams: PaginationParams = { page, limit };

    let historyData;
    if (type === 'custom') {
      historyData = await dbService.getCustomHistory(paginationParams);
    } else {
      historyData = await dbService.getFusionHistory(paginationParams);
    }

    const response: ApiResponse = {
      success: true,
      data: historyData.items,
      message: 'Historial obtenido exitosamente',
      pagination: {
        page,
        limit,
        total: historyData.total || historyData.items.length,
        hasNext: historyData.hasNext,
        hasPrev: page > 1,
      },
    };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.error('Error in getHistorial:', error);

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
