# Rimac Reto - API RESTful con Serverless Framework

## 🌐 API Endpoints

**Base URL de Producción**: `https://2323hhqgu4.execute-api.us-east-1.amazonaws.com/dev/`

**SWAGGER URL** `https://2323hhqgu4.execute-api.us-east-1.amazonaws.com/dev/docs`

### Endpoints Disponibles

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| `POST` | `/auth/token` | Obtener token JWT | ❌ No |
| `GET` | `/fusionados` | Datos fusionados aleatorios | ❌ No |
| `GET` | `/fusion/{characterName}` | Datos fusionados por personaje | ❌ No |
| `POST` | `/almacenar` | Almacenar datos personalizados | ✅ Sí |
| `GET` | `/historial` | Consultar historial paginado | ✅ Sí |
| `GET` | `/openapi.json` | Especificación OpenAPI | ❌ No |
| `GET` | `/docs` | Documentación interactiva | ❌ No |

### 🚀 Prueba rápida

```bash
# Obtener datos fusionados
curl https://2323hhqgu4.execute-api.us-east-1.amazonaws.com/dev/fusionados

# Obtener token de autenticación
curl -X POST https://2323hhqgu4.execute-api.us-east-1.amazonaws.com/dev/auth/token \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "rimac2025"}'
```

---

## Descripción

API RESTful desarrollada con Node.js 20, TypeScript y Serverless Framework, desplegada en AWS Lambda. La API integra datos de la API de Star Wars (SWAPI) con información meteorológica para crear un modelo fusionado de datos.

## Características

### 🚀 Funcionalidades Principales

- **GET /fusionados**: Obtiene datos fusionados de Star Wars y meteorológicos
- **GET /fusion/{characterName}**: Obtiene datos fusionados específicos por personaje
- **POST /almacenar**: Almacena datos personalizados (requiere autenticación)
- **GET /historial**: Consulta historial paginado (requiere autenticación)
- **POST /auth/token**: Genera token JWT para autenticación

### 🛡️ Seguridad y Autenticación

- Autenticación JWT para endpoints protegidos
- Autorización personalizada con AWS Lambda Authorizer
- CORS configurado para desarrollo
- Rate limiting y throttling configurado

### ⚡ Optimización y Performance

- Sistema de caché con DynamoDB (TTL automático)
- Timeout optimizado a 10 segundos
- Memoria Lambda configurada a 256MB
- Point-in-time recovery habilitado
- X-Ray tracing activado

### 🧪 Calidad de Código

- TypeScript para tipado estático
- Arquitectura limpia y modular
- Documentación OpenAPI automática
- Monitoreo con CloudWatch Dashboard

## Arquitectura

```
├── src/
│   ├── handlers/          # Lambda handlers
│   │   ├── auth.ts        # Autenticación y autorización
│   │   ├── fusion.ts      # Datos fusionados
│   │   ├── custom.ts      # Almacenamiento personalizado
│   │   ├── history.ts     # Historial
│   │   └── docs.ts        # Documentación
│   ├── services/          # Servicios de negocio
│   │   ├── swapiService.ts
│   │   ├── weatherService.ts
│   │   ├── dynamoService.ts
│   │   └── authService.ts
│   ├── types/             # Definiciones TypeScript
│   ├── utils/             # Utilidades
│   │   ├── response.ts
│   │   ├── validation.ts
│   │   └── logger.ts
│   └── __tests__/         # Pruebas unitarias
├── serverless.yml         # Configuración Serverless
├── openapi.json          # Especificación OpenAPI
├── jest.config.js         # Configuración Jest
├── tsconfig.json          # Configuración TypeScript
└── package.json
```

## Instalación y Configuración

### Prerrequisitos

- Node.js 20+
- AWS CLI configurado
- Serverless Framework CLI (`npm install -g serverless`)
- Cuenta AWS con permisos apropiados

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
JWT_SECRET=tu-clave-secreta-muy-segura-aqui
WEATHER_API_KEY=tu-api-key-de-openweathermap
LOG_LEVEL=info
IS_OFFLINE=false
```

### 3. Desarrollo local

```bash
# Instalar DynamoDB Local
serverless dynamodb install

# Iniciar servicios locales
npm run dev
# o
serverless offline start
```

### 4. Despliegue

```bash
# Desarrollo
npm run deploy:dev
# o
serverless deploy --stage dev

# Producción
npm run deploy:prod
# o
serverless deploy --stage prod
```

## Uso de la API

### Base URL

- **Local**: `http://localhost:3000/dev`
- **AWS**: `https://2323hhqgu4.execute-api.us-east-1.amazonaws.com/dev`

### Documentación Interactive

- **OpenAPI Spec**: `GET /openapi.json`
- **Docs**: `GET /docs`

### Autenticación

Para endpoints protegidos, primero obtén un token:

```bash
curl -X POST https://2323hhqgu4.execute-api.us-east-1.amazonaws.com/dev/auth/token \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "rimac2025"
  }'
```

Incluir el token JWT en el header para endpoints protegidos:

```bash
Authorization: Bearer <tu-jwt-token>
```

### Endpoints

#### POST /auth/token

Genera un token JWT para autenticación.

```bash
curl -X POST https://2323hhqgu4.execute-api.us-east-1.amazonaws.com/dev/auth/token \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "rimac2025"
  }'
```

**Respuesta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Token generado exitosamente",
  "expiresIn": "1h"
}
```

#### GET /fusionados

Obtiene datos fusionados de Star Wars con información meteorológica.

```bash
curl -X GET https://2323hhqgu4.execute-api.us-east-1.amazonaws.com/dev/fusionados
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": "c366eccd-5fc5-48db-a600-c9aeecc8c8f0",
    "timestamp": 1755715395659,
    "character": {
      "name": "Yarael Poof",
      "height": 264,
      "mass": 0,
      "hairColor": "none",
      "skinColor": "white",
      "eyeColor": "yellow",
      "birthYear": "unknown",
      "gender": "Male"
    },
    "planet": {
      "name": "Quermia",
      "climate": "unknown",
      "terrain": "unknown",
      "population": 0,
      "gravity": 1,
      "diameter": 0
    },
    "weather": {
      "temperature": 18.5,
      "feelsLike": 17.8,
      "humidity": 54,
      "pressure": 1017,
      "windSpeed": 4.1,
      "description": "few clouds",
      "visibility": 10000
    },
    "fusionScore": 70
  },
  "message": "Datos fusionados obtenidos exitosamente"
}
```

#### GET /fusion/{characterName}

Obtiene datos fusionados para un personaje específico.

```bash
curl -X GET https://2323hhqgu4.execute-api.us-east-1.amazonaws.com/dev/fusion/luke-skywalker
```

#### POST /almacenar

Almacena datos personalizados (requiere autenticación).

```bash
curl -X POST https://2323hhqgu4.execute-api.us-east-1.amazonaws.com/dev/almacenar \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "nombre": "Datos personalizados",
      "tipo": "ejemplo"
    }
  }'
```

#### GET /historial

Consulta el historial paginado de datos (requiere autenticación).

```bash
curl -X GET https://2323hhqgu4.execute-api.us-east-1.amazonaws.com/dev/historial?page=1&limit=10 \
  -H "Authorization: Bearer <token>"
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "e6bd24dc-2fe3-4cf6-be31-15cd75fb93f2",
      "timestamp": 1755709481209,
      "character": {
        "name": "Leia Organa",
        "height": 150,
        "mass": 49,
        "hairColor": "brown",
        "skinColor": "light",
        "eyeColor": "brown",
        "birthYear": "19BBY",
        "gender": "Female"
      },
      "planet": {
        "name": "Alderaan",
        "climate": "temperate",
        "terrain": "grasslands, mountains",
        "population": 2000000000,
        "gravity": 1,
        "diameter": 12500
      },
      "weather": {
        "temperature": 28.1,
        "feelsLike": 27.7,
        "humidity": 39,
        "pressure": 1005,
        "windSpeed": 2.1,
        "description": "clear sky",
        "visibility": 10000
      },
      "fusionScore": 67.4
    }
  ],
  "message": "Historial obtenido exitosamente",
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 4,
    "hasNext": false,
    "hasPrev": false
  }
}
```

## Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Inicia servidor local
npm run build            # Compila TypeScript
npm run deploy:dev       # Despliega a desarrollo
npm run deploy:prod      # Despliega a producción

# Testing
npm test                 # Ejecuta pruebas
npm run test:watch       # Pruebas en modo watch
npm run test:coverage    # Cobertura de código

# Calidad de código
npm run lint             # Ejecuta ESLint
npm run lint:fix         # Corrige errores de linting

# Utilidades
npm run remove:dev       # Elimina stack de desarrollo
npm run remove:prod      # Elimina stack de producción
npm run logs             # Ver logs de funciones
```

## Configuración Serverless

### Funciones Lambda

- **getToken**: Genera tokens JWT
- **authorizerFunc**: Función de autorización personalizada
- **getDatosFusionados**: Obtiene datos fusionados aleatorios
- **getFusionDataByCharacter**: Datos fusionados por personaje específico
- **almacenarDatos**: Almacena datos personalizados (protegido)
- **getHistorial**: Consulta historial paginado (protegido)
- **serveOpenAPI**: Sirve especificación OpenAPI
- **docs**: Sirve documentación interactiva

### Recursos AWS

#### DynamoDB Tables

1. **FusionTable** (`rimac-reto-api-fusion-{stage}`)
   - Partition Key: `id` (String)
   - GSI: `TimestampIndex` por timestamp
   - Point-in-time recovery habilitado

2. **CustomTable** (`rimac-reto-api-custom-{stage}`)
   - Partition Key: `id` (String)
   - GSI: `TimestampIndex` por timestamp
   - Point-in-time recovery habilitado

3. **CacheTable** (`rimac-reto-api-cache-{stage}`)
   - Partition Key: `cacheKey` (String)
   - TTL habilitado para expiración automática
   - Point-in-time recovery habilitado

#### API Gateway

- **Rate Limiting**: 5 requests/segundo, burst 10
- **CORS**: Habilitado para todos los endpoints
- **Autorización**: JWT personalizada para endpoints protegidos
- **Documentación**: OpenAPI 3.0 integrada

#### CloudWatch Dashboard

Dashboard automático con métricas de:
- Invocaciones Lambda
- Errores y duración
- Consumo DynamoDB
- Métricas de performance

### Variables de Entorno por Función

```yaml
environment:
  IS_OFFLINE: ${env:IS_OFFLINE, 'false'}
  STAGE: ${self:provider.stage}
  DYNAMODB_TABLE_FUSION: rimac-reto-api-fusion-${stage}
  DYNAMODB_TABLE_CUSTOM: rimac-reto-api-custom-${stage}
  DYNAMODB_TABLE_CACHE: rimac-reto-api-cache-${stage}
  JWT_SECRET: ${env:JWT_SECRET}
  SWAPI_BASE_URL: https://swapi.dev/api
  WEATHER_API_KEY: ${env:WEATHER_API_KEY}
  WEATHER_BASE_URL: https://api.openweathermap.org/data/2.5
  LOG_LEVEL: ${env:LOG_LEVEL, 'info'}
```

## Monitoreo y Observabilidad

### CloudWatch Dashboard

Accede al dashboard automático en:
```
https://us-east-1.console.aws.amazon.com/cloudwatch/home?region=us-east-1#dashboards:name=rimac-reto-api-{stage}-dashboard
```

### X-Ray Tracing

- Tracing habilitado para Lambda y API Gateway
- Seguimiento de requests distribuidos
- Análisis de performance end-to-end

### Logs Estructurados

```bash
# Ver logs de función específica
serverless logs -f getDatosFusionados --tail

# Ver logs de todas las funciones
npm run logs
```

## Tecnologías Utilizadas

- **Runtime**: Node.js 20.x
- **Lenguaje**: TypeScript
- **Framework**: Serverless Framework v3
- **Cloud Provider**: AWS
- **Servicios AWS**: Lambda, API Gateway, DynamoDB, CloudWatch, X-Ray
- **APIs Externas**: 
  - Star Wars API (SWAPI) - `https://swapi.dev/api`
  - OpenWeatherMap API - `https://api.openweathermap.org/data/2.5`
- **Autenticación**: JWT
- **Documentación**: OpenAPI 3.0
- **Plugins Serverless**:
  - `serverless-plugin-typescript`
  - `serverless-offline`
  - `serverless-dynamodb-local`
  - `serverless-dotenv-plugin`
  - `serverless-openapi-documenter`

## Variables de Entorno

| Variable | Descripción | Requerida | Default |
|----------|-------------|-----------|---------|
| `JWT_SECRET` | Clave secreta para JWT | Sí | - |
| `WEATHER_API_KEY` | API Key de OpenWeatherMap | Sí | - |
| `LOG_LEVEL` | Nivel de logging | No | info |
| `IS_OFFLINE` | Indica si está en modo offline | No | false |

## Optimización de Costos

- **DynamoDB**: Modo pay-per-request (solo pagas por uso)
- **Lambda**: Timeout de 10s y memoria de 256MB optimizada
- **API Gateway**: Rate limiting para controlar costos
- **CloudWatch**: Dashboard automático incluido
- **Cache**: TTL automático para reducir llamadas a APIs externas

## Seguridad

- **IAM Roles**: Permisos mínimos necesarios por función
- **JWT**: Tokens con expiración de 1 hora
- **CORS**: Configurado para desarrollo seguro
- **Rate Limiting**: 5 RPS por API Key
- **Encriptación**: En tránsito y en reposo
- **Point-in-Time Recovery**: Habilitado en todas las tablas

## Documentación API

### OpenAPI Specification

La especificación completa está disponible en:
- **JSON**: `GET /openapi.json`
- **Docs Interactivos**: `GET /docs`

### Modelos de Datos

La API incluye modelos completamente documentados para:
- Requests de autenticación
- Respuestas de datos fusionados
- Paginación de historial
- Manejo de errores

## Troubleshooting

### Errores comunes

1. **Error de permisos AWS**
   ```bash
   aws configure list
   serverless config credentials --provider aws --key YOUR_KEY --secret YOUR_SECRET
   ```

2. **DynamoDB Local no inicia**
   ```bash
   serverless dynamodb install
   serverless dynamodb start
   ```

3. **Error con Weather API**
   ```bash
   # Verificar que WEATHER_API_KEY esté configurado
   echo $WEATHER_API_KEY
   ```

4. **Token JWT inválido**
   ```bash
   # Verificar que JWT_SECRET esté configurado
   echo $JWT_SECRET
   ```

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
