const express = require('express');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

// Leer el archivo OpenAPI
const openApiPath = path.join(__dirname, '../openapi.json');
const swaggerDocument = JSON.parse(fs.readFileSync(openApiPath, 'utf8'));

// Configurar Swagger UI
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  customSiteTitle: "Rimac Reto API - Documentación",
  customCss: '.swagger-ui .topbar { display: none }'
}));

// Servir el archivo OpenAPI
app.get('/openapi.json', (req, res) => {
  res.json(swaggerDocument);
});

// Redirección de la raíz a docs
app.get('/', (req, res) => {
  res.redirect('/docs');
});

app.listen(PORT, () => {
  console.log(`📚 Documentación disponible en: http://localhost:${PORT}/docs`);
  console.log(`📄 OpenAPI JSON en: http://localhost:${PORT}/openapi.json`);
});