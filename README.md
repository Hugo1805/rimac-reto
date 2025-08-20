# Rimac Reto - API RESTful con Serverless Framework

## Descripción

API RESTful desarrollada con Node.js 20, TypeScript y Serverless Framework, desplegada en AWS Lambda. La API integra datos de la API de Star Wars (SWAPI) con información meteorológica para crear un modelo fusionado de datos.

## Características

### 🚀 Funcionalidades Principales

- **GET /fusionados**: Combina datos de Star Wars con información meteorológica
- **POST /almacenar**: Almacena datos personalizados en la base de datos
- **GET /historial**: Consulta el historial paginado de datos almacenados

### 🛡️ Seguridad y Autenticación

- Autenticación JWT para endpoints protegidos
- Autorización personalizada con AWS Lambda Authorizer
- Validación de datos con Joi

### ⚡ Optimización y Performance

- Sistema de caché con DynamoDB (TTL de 30 minutos)
- Paginación eficiente
- Timeout optimizado a 30 segundos
- Memoria Lambda configurada a 256MB

### 🧪 Calidad de Código

- TypeScript para tipado estático
- Pruebas unitarias con Jest
- Linting con ESLint
- Cobertura de código

## Arquitectura

```
├── src/
│   ├── handlers/          # Lambda handlers
│   │   ├── fusion.ts      # GET /fusionados
│   │   ├── custom.ts      # POST /almacenar
│   │   ├── history.ts     # GET /historial
│   │   └── auth.ts        # JWT Authorizer
│   ├── services/          # Servicios de negocio
│   │   ├── swapiService.ts
│   │   ├── weatherService.ts
│   │   ├── dynamodbService.ts
│   │   └── fusionService.ts
│   ├── types/             # Definiciones TypeScript
│   ├── utils/             # Utilidades
│   └── __tests__/         # Pruebas unitarias
├── serverless.yml         # Configuración Serverless
└── package.json
```

## Instalación y Configuración

### Prerrequisitos

- Node.js 20+
- AWS CLI configurado
- Serverless Framework CLI
- API Key de OpenWeatherMap

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
JWT_SECRET=tu-clave-secreta-muy-segura
WEATHER_API_KEY=tu-api-key-de-openweathermap
```

### 3. Desarrollo local

```bash
# Instalar DynamoDB Local
npm run dynamodb:install

# Iniciar servicios locales
npm run offline
```

### 4. Despliegue

```bash
# Desarrollo
npm run deploy:dev

# Producción
npm run deploy:prod
```

## Uso de la API

### Autenticación

Para endpoints protegidos, incluir el token JWT en el header:

```bash
Authorization: Bearer <tu-jwt-token>
```

### Endpoints

#### GET /fusionados

Obtiene datos fusionados de Star Wars y meteorológicos.

```bash
curl -X GET https://tu-api-gateway-url/dev/fusionados
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "timestamp": 1635768000000,
    "character": {
      "name": "Luke Skywalker",
      "height": 172,
      "mass": 77,
      "hairColor": "blond",
      "skinColor": "fair",
      "eyeColor": "blue",
      "birthYear": "19BBY",
      "gender": "Male"
    },
    "planet": {
      "name": "Tatooine",
      "climate": "arid",
      "terrain": "desert",
      "population": 200000,
      "gravity": 1,
      "diameter": 10465
    },
    "weather": {
      "temperature": 35.5,
      "feelsLike": 34.8,
      "humidity": 25,
      "pressure": 1013,
      "windSpeed": 2.5,
      "description": "clear sky",
      "visibility": 10000
    },
    "fusionScore": 75.5
  }
}
```

#### POST /almacenar

Almacena datos personalizados (requiere autenticación).

```bash
curl -X POST https://tu-api-gateway-url/dev/almacenar \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "titulo": "Mi dato personalizado",
      "valor": 42
    },
    "metadata": {
      "category": "test",
      "tags": ["ejemplo", "prueba"]
    }
  }'
```

#### GET /historial

Consulta el historial paginado (requiere autenticación).

```bash
curl -X GET "https://tu-api-gateway-url/dev/historial?page=1&limit=10&type=fusion" \
  -H "Authorization: Bearer <token>"
```

**Parámetros de consulta:**
- `page`: Número de página (default: 1)
- `limit`: Elementos por página (default: 10, max: 50)
- `type`: Tipo de datos ('fusion' o 'custom', default: 'fusion')

## Pruebas

```bash
# Ejecutar todas las pruebas
npm test

# Pruebas en modo watch
npm run test:watch

# Cobertura de código
npm run test:coverage
```

## Datos Fusionados

### Mapeo de Planetas a Ciudades

La API mapea planetas de Star Wars a ciudades terrestres para obtener datos meteorológicos:

- **Tatooine** → Phoenix (desierto)
- **Hoth** → Reykjavik (frío)
- **Coruscant** → Tokyo (metrópolis)
- **Dagobah** → Miami (pantanoso)
- **Endor** → Seattle (bosque)
- Y más...

### Fusion Score

Métrica personalizada que evalúa la "compatibilidad" entre el personaje, su planeta y el clima actual:

- **Factores del personaje** (0-30 pts): altura, peso, características
- **Factores del planeta** (0-30 pts): población, tamaño, gravedad
- **Factores meteorológicos** (0-40 pts): temperatura, humedad, viento, visibilidad

## Tecnologías Utilizadas

- **Backend**: Node.js 20, TypeScript
- **Framework**: Serverless Framework
- **Cloud**: AWS Lambda, API Gateway, DynamoDB
- **APIs Externas**: SWAPI, OpenWeatherMap API
- **Testing**: Jest
- **Linting**: ESLint
- **Validación**: Joi
- **Autenticación**: JWT

## Variables de Entorno

| Variable | Descripción | Requerida |
|----------|-------------|-----------|
| `JWT_SECRET` | Clave secreta para JWT | Sí |
| `WEATHER_API_KEY` | API Key de OpenWeatherMap | Sí |
| `STAGE` | Entorno de despliegue | No |

## Recursos AWS

### DynamoDB Tables

1. **Fusion Table**: Almacena datos fusionados
2. **Custom Table**: Almacena datos personalizados
3. **Cache Table**: Sistema de caché con TTL

### Lambda Functions

1. **getDatosFusionados**: Handler para datos fusionados
2. **almacenarDatos**: Handler para almacenar datos
3. **getHistorial**: Handler para consultar historial
4. **authorizerFunc**: Autorización JWT

## Optimización de Costos

- **Pay-per-request** para DynamoDB
- **Timeout optimizado** a 30 segundos
- **Memoria mínima** necesaria (256MB)
- **Caché inteligente** para reducir llamadas a APIs externas
- **Paginación** para limitar transferencia de datos

## Contribución

1. Fork el proyecto
2. Crear una rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit los cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## Contacto

- **Autor**: Hugo Ponce de León
- **Email**: hugoponcedeleon@rimac.com
- **GitHub**: [@Hugo1805](https://github.com/Hugo1805)

---

Desarrollado con ❤️ para el reto técnico de Rimac
