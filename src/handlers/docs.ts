import { APIGatewayProxyHandler } from 'aws-lambda';
import { createResponse } from '../utils/helpers';

export const serveDocs: APIGatewayProxyHandler = async () => {
  try {
    const swaggerUIHTML = `
<!DOCTYPE html>
<html>
<head>
  <title>Rimac Reto API - Documentación</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@3.25.0/swagger-ui.css" />
  <style>
    html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
    *, *:before, *:after { box-sizing: inherit; }
    body { margin:0; background: #fafafa; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@3.25.0/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@3.25.0/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      const ui = SwaggerUIBundle({
        url: './openapi.json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout"
      });
    };
  </script>
</body>
</html>`;

    return createResponse(200, swaggerUIHTML, {
      'Content-Type': 'text/html'
    });
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
    // Importar el archivo openapi.json
    const openApiSpec = require('../../openapi.json');
    
    return createResponse(200, openApiSpec, {
      'Content-Type': 'application/json'
    });
  } catch (error) {
    console.error('Error serving OpenAPI spec:', error);
    return createResponse(500, { 
      success: false, 
      error: 'Error al servir especificación OpenAPI' 
    });
  }
};