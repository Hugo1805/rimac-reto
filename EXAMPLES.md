# Ejemplos de Uso de la API

## 1. Obtener Datos Fusionados

### Solicitud
```bash
curl -X GET "https://your-api-gateway-url/dev/fusionados" \
  -H "Content-Type: application/json"
```

### Respuesta de Ejemplo
```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "timestamp": 1692464400000,
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
  },
  "message": "Datos fusionados obtenidos exitosamente"
}
```

## 2. Almacenar Datos Personalizados

### Generar Token JWT (para pruebas)
```bash
node scripts/generateToken.js
```

### Solicitud
```bash
curl -X POST "https://your-api-gateway-url/dev/almacenar" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "titulo": "Reporte de Ventas Q3",
      "monto": 150000,
      "moneda": "USD",
      "fecha": "2024-08-19",
      "region": "LATAM"
    },
    "metadata": {
      "source": "CRM",
      "tags": ["ventas", "quarterly", "latam"],
      "category": "financial"
    }
  }'
```

### Respuesta de Ejemplo
```json
{
  "success": true,
  "data": {
    "id": "456e7890-e89b-12d3-a456-426614174001",
    "timestamp": 1692464500000
  },
  "message": "Datos almacenados exitosamente"
}
```

## 3. Consultar Historial

### Historial de Datos Fusionados
```bash
curl -X GET "https://your-api-gateway-url/dev/historial?page=1&limit=5&type=fusion" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json"
```

### Historial de Datos Personalizados
```bash
curl -X GET "https://your-api-gateway-url/dev/historial?page=1&limit=10&type=custom" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json"
```

### Respuesta de Ejemplo
```json
{
  "success": true,
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "timestamp": 1692464400000,
      "character": {
        "name": "Leia Organa",
        "height": 150,
        "mass": 49
      },
      "planet": {
        "name": "Alderaan",
        "climate": "temperate"
      },
      "weather": {
        "temperature": 18.2,
        "description": "partly cloudy"
      },
      "fusionScore": 82.3
    }
  ],
  "message": "Historial obtenido exitosamente",
  "pagination": {
    "page": 1,
    "limit": 5,
    "total": 25,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## 4. Casos de Error

### Error de Autenticación
```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "Token inválido o expirado"
}
```

### Error de Validación
```json
{
  "success": false,
  "error": "Datos inválidos: \"data\" is required"
}
```

### Error del Servidor
```json
{
  "success": false,
  "error": "Error interno del servidor",
  "message": "No se pudieron obtener los datos fusionados"
}
```

## 5. Ejemplos con JavaScript/Node.js

### Cliente para Datos Fusionados
```javascript
const axios = require('axios');

const apiClient = axios.create({
  baseURL: 'https://your-api-gateway-url/dev',
  headers: {
    'Content-Type': 'application/json'
  }
});

async function getFusionData() {
  try {
    const response = await apiClient.get('/fusionados');
    console.log('Datos fusionados:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}
```

### Cliente para Almacenar Datos
```javascript
async function storeCustomData(token, customData) {
  try {
    const response = await apiClient.post('/almacenar', customData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('Datos almacenados:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}
```

### Cliente para Historial
```javascript
async function getHistory(token, page = 1, limit = 10, type = 'fusion') {
  try {
    const response = await apiClient.get('/historial', {
      params: { page, limit, type },
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('Historial:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}
```

## 6. Ejemplos con Python

```python
import requests
import json

BASE_URL = "https://your-api-gateway-url/dev"

def get_fusion_data():
    """Obtener datos fusionados"""
    response = requests.get(f"{BASE_URL}/fusionados")
    return response.json()

def store_custom_data(token, data):
    """Almacenar datos personalizados"""
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    response = requests.post(f"{BASE_URL}/almacenar", json=data, headers=headers)
    return response.json()

def get_history(token, page=1, limit=10, data_type="fusion"):
    """Obtener historial"""
    headers = {"Authorization": f"Bearer {token}"}
    params = {"page": page, "limit": limit, "type": data_type}
    response = requests.get(f"{BASE_URL}/historial", headers=headers, params=params)
    return response.json()

# Ejemplo de uso
if __name__ == "__main__":
    # Obtener datos fusionados
    fusion_data = get_fusion_data()
    print("Fusion Data:", json.dumps(fusion_data, indent=2))
    
    # Almacenar datos (necesita token JWT válido)
    # token = "your-jwt-token"
    # custom_data = {
    #     "data": {"key": "value"},
    #     "metadata": {"category": "test"}
    # }
    # result = store_custom_data(token, custom_data)
```

## 7. Rate Limiting y Mejores Prácticas

### Caché Inteligente
- Los datos fusionados se cachean por 30 minutos
- Si solicitas datos dentro de este período, obtienes la respuesta cacheada
- Esto reduce latencia y costos de APIs externas

### Paginación
- Siempre usa paginación para el historial
- Límite máximo de 50 elementos por página
- Incluye parámetros `page` y `limit` en las consultas

### Manejo de Errores
- Siempre verifica el campo `success` en la respuesta
- Implementa retry logic para errores temporales
- Maneja tokens JWT expirados renovándolos automáticamente

### Optimización
```javascript
// Ejemplo de cliente con retry y manejo de errores
class RimacAPIClient {
  constructor(baseURL, token) {
    this.baseURL = baseURL;
    this.token = token;
    this.client = axios.create({
      baseURL,
      timeout: 30000
    });
  }

  async withRetry(operation, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
      }
    }
  }

  async getFusionData() {
    return this.withRetry(async () => {
      const response = await this.client.get('/fusionados');
      return response.data;
    });
  }
}
```
