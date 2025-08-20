# Rimac Reto - API RESTful con Serverless Framework

## Descripción

API RESTful desarrollada con Node.js 20, TypeScript y Serverless Framework, desplegada en AWS Lambda. La API integra datos de la API de Star Wars (SWAPI) con información meteorológica para crear un modelo fusionado de datos.

## Características

### 🚀 Funcionalidades Principales

- **GET /people**: Obtiene información de personajes de Star Wars
- **POST /people**: Crea nuevos personajes personalizados
- **GET /people/{id}**: Obtiene un personaje específico por ID
- **PUT /people/{id}**: Actualiza un personaje existente
- **DELETE /people/{id}**: Elimina un personaje

### 🛡️ Seguridad y Autenticación

- Autenticación JWT para endpoints protegidos
- Autorización personalizada con AWS Lambda Authorizer
- Validación de datos con Joi
- CORS configurado para desarrollo

### ⚡ Optimización y Performance

- Sistema de caché con DynamoDB
- Timeout optimizado a 30 segundos
- Memoria Lambda configurada a 128MB
- Retry automático en caso de errores

### 🧪 Calidad de Código

- TypeScript para tipado estático
- Pruebas unitarias con Jest
- Linting con ESLint
- Arquitectura limpia y modular

## Arquitectura

```
├── src/
│   ├── handlers/          # Lambda handlers
│   │   ├── getPeople.ts   # GET /people
│   │   ├── createPerson.ts # POST /people
│   │   ├── getPerson.ts   # GET /people/{id}
│   │   ├── updatePerson.ts # PUT /people/{id}
│   │   ├── deletePerson.ts # DELETE /people/{id}
│   │   └── authorizer.ts  # JWT Authorizer
│   ├── services/          # Servicios de negocio
│   │   ├── swapiService.ts
│   │   ├── dynamoService.ts
│   │   └── authService.ts
│   ├── types/             # Definiciones TypeScript
│   ├── utils/             # Utilidades
│   │   ├── response.ts
│   │   ├── validation.ts
│   │   └── logger.ts
│   └── __tests__/         # Pruebas unitarias
├── serverless.yml         # Configuración Serverless
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
AWS_REGION=us-east-1
STAGE=dev
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

- **Local**: `http://localhost:3000`
- **AWS**: `https://{api-id}.execute-api.{region}.amazonaws.com/{stage}`

### Autenticación

Para endpoints protegidos, incluir el token JWT en el header:

```bash
Authorization: Bearer <tu-jwt-token>
```

### Endpoints

#### GET /people

Obtiene la lista de personajes de Star Wars.

```bash
curl -X GET https://tu-api-gateway-url/dev/people
```

**Respuesta:**
```json
{
  "statusCode": 200,
  "message": "Success",
  "data": [
    {
      "id": "1",
      "name": "Luke Skywalker",
      "height": "172",
      "mass": "77",
      "hair_color": "blond",
      "skin_color": "fair",
      "eye_color": "blue",
      "birth_year": "19BBY",
      "gender": "male",
      "homeworld": "https://swapi.py4e.com/api/planets/1/",
      "created": "2014-12-09T13:50:51.644000Z",
      "edited": "2014-12-20T21:17:56.891000Z"
    }
  ]
}
```

#### POST /people

Crea un nuevo personaje personalizado (requiere autenticación).

```bash
curl -X POST https://tu-api-gateway-url/dev/people \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nuevo Personaje",
    "height": "180",
    "mass": "80",
    "hair_color": "brown",
    "skin_color": "light",
    "eye_color": "brown",
    "birth_year": "10BBY",
    "gender": "male"
  }'
```

#### GET /people/{id}

Obtiene un personaje específico por ID.

```bash
curl -X GET https://tu-api-gateway-url/dev/people/1
```

#### PUT /people/{id}

Actualiza un personaje existente (requiere autenticación).

```bash
curl -X PUT https://tu-api-gateway-url/dev/people/1 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Luke Skywalker Updated",
    "height": "175"
  }'
```

#### DELETE /people/{id}

Elimina un personaje (requiere autenticación).

```bash
curl -X DELETE https://tu-api-gateway-url/dev/people/1 \
  -H "Authorization: Bearer <token>"
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

- **getPeople**: Handler para listar personajes
- **createPerson**: Handler para crear personajes
- **getPerson**: Handler para obtener personaje por ID
- **updatePerson**: Handler para actualizar personajes
- **deletePerson**: Handler para eliminar personajes
- **authorizer**: Función de autorización JWT

### Recursos AWS

#### DynamoDB Tables

- **PeopleTable**: Almacena personajes personalizados
  - Partition Key: `id` (String)
  - Modo de facturación: Pay-per-request
  - Eliminación automática en stack removal

#### API Gateway

- **Configuración CORS**: Habilitada para desarrollo
- **Autorización**: JWT personalizada para endpoints protegidos
- **Validación**: Schemas de request/response

### Variables de Entorno por Función

```yaml
environment:
  PEOPLE_TABLE: !Ref PeopleTable
  JWT_SECRET: ${env:JWT_SECRET}
  STAGE: ${self:provider.stage}
```

## Pruebas

```bash
# Ejecutar todas las pruebas
npm test

# Pruebas específicas
npm test -- --testPathPattern=handlers

# Cobertura de código
npm run test:coverage

# Modo interactivo
npm run test:watch
```

## Monitoreo y Logs

### Ver logs de funciones

```bash
# Logs de una función específica
serverless logs -f getPeople --tail

# Logs de todas las funciones
npm run logs
```

### CloudWatch

Las métricas y logs están disponibles en AWS CloudWatch:
- Duración de ejecución
- Errores y timeouts
- Invocaciones por minuto
- Memoria utilizada

## Tecnologías Utilizadas

- **Runtime**: Node.js 20.x
- **Lenguaje**: TypeScript
- **Framework**: Serverless Framework v3
- **Cloud Provider**: AWS
- **Servicios AWS**: Lambda, API Gateway, DynamoDB, CloudWatch
- **APIs Externas**: Star Wars API (SWAPI)
- **Testing**: Jest
- **Linting**: ESLint
- **Validación**: Joi
- **Autenticación**: JWT

## Variables de Entorno

| Variable | Descripción | Requerida | Default |
|----------|-------------|-----------|---------|
| `JWT_SECRET` | Clave secreta para JWT | Sí | - |
| `AWS_REGION` | Región de AWS | No | us-east-1 |
| `STAGE` | Entorno de despliegue | No | dev |

## Optimización de Costos

- **DynamoDB**: Modo pay-per-request (solo pagas por uso)
- **Lambda**: Timeout de 30s y memoria de 128MB optimizada
- **API Gateway**: Sin costos adicionales en tier gratuito
- **CloudWatch**: Logs con retención automática

## Seguridad

- **IAM Roles**: Permisos mínimos necesarios
- **JWT**: Tokens con expiración
- **CORS**: Configurado para desarrollo seguro
- **Validación**: Schemas estrictos para requests
- **Encriptación**: En tránsito y en reposo

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

3. **Error de compilación TypeScript**
   ```bash
   npm run build
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
