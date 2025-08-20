import { APIGatewayProxyHandler } from 'aws-lambda';
import { createResponse } from '../utils/helpers';
import * as path from 'path';
import * as fs from 'fs';

export const serveDocs: APIGatewayProxyHandler = async () => {
  try {
    const swaggerUIHTML = `<!DOCTYPE html>
<html>
<head>
  <title>Rimac Reto API - Documentación</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui.css" />
  <style>
    html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
    *, *:before, *:after { box-sizing: inherit; }
    body { margin:0; background: #fafafa; }
    .swagger-ui .topbar { display: none; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      const ui = SwaggerUIBundle({
        url: '/dev/openapi.json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout",
        tryItOutEnabled: true,
        supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch'],
        displayRequestDuration: true
      });
    };
  </script>
</body>
</html>`;

    // Retornar directamente el objeto de respuesta sin usar createResponse para HTML
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: swaggerUIHTML
    };
  } catch (error) {
    console.error('Error serving docs:', error);
    return createResponse(500, { 
      success: false, 
      error: 'Error al servir documentación' 
    });
  }
};

export const serveOpenAPI: APIGatewayProxyHandler = async () => {
  try {
    // Find the openapi.json file from the project root
    const projectRoot = process.cwd();
    const openApiPath = path.join(projectRoot, 'openapi.json');
    
    // Check if file exists
    if (!fs.existsSync(openApiPath)) {
      throw new Error(`OpenAPI file not found at: ${openApiPath}`);
    }
    
    // Read the file content
    const openApiContent = fs.readFileSync(openApiPath, 'utf8');
    const openApiSpec = JSON.parse(openApiContent);
    
    return createResponse(200, openApiSpec, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
  } catch (error) {
    console.error('Error serving OpenAPI spec:', error);
    return createResponse(500, { 
      success: false, 
      error: 'Error al servir especificación OpenAPI',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};