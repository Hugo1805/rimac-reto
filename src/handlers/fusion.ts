import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { FusionService } from '../services/fusionService';
import { ApiResponse } from '../types';

const fusionService = new FusionService();

export const getDatosFusionados = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log('Event:', JSON.stringify(event, null, 2));

  try {
    const fusionData = await fusionService.createFusionData();

    const response: ApiResponse = {
      success: true,
      data: fusionData,
      message: 'Datos fusionados obtenidos exitosamente',
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
    console.error('Error in getDatosFusionados:', error);

    const response: ApiResponse = {
      success: false,
      error: 'Error interno del servidor',
      message: 'No se pudieron obtener los datos fusionados',
    };

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(response),
    };
  }
};
