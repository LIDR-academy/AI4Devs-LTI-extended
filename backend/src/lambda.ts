import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import serverless from 'serverless-http';
import { app } from './index';

// Crear el handler de serverless-http
const serverlessHandler = serverless(app);

// Handler principal de Lambda
export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  // Asegurarse de que el contexto de Lambda se mantenga vivo
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    // Procesar la solicitud usando serverless-http
    const result = await serverlessHandler(event, context) as APIGatewayProxyResult;
    return result;
  } catch (error) {
    console.error('Error en el handler de Lambda:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
}; 