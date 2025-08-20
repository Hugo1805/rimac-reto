#!/bin/bash

# Script de despliegue para diferentes entornos

set -e  # Exit on any error

STAGE=${1:-dev}
REGION=${2:-us-east-1}

echo "🚀 Desplegando Rimac Reto API en stage: $STAGE, region: $REGION"

# Verificar que estamos en el directorio correcto
if [ ! -f "serverless.yml" ]; then
    echo "❌ Error: No se encontró serverless.yml"
    echo "Ejecuta este script desde la raíz del proyecto"
    exit 1
fi

# Verificar variables de entorno críticas
if [ "$STAGE" = "prod" ]; then
    if [ -z "$JWT_SECRET" ] || [ "$JWT_SECRET" = "test-secret-key-for-development" ]; then
        echo "❌ Error: JWT_SECRET debe estar configurado para producción"
        echo "Configura JWT_SECRET como variable de entorno"
        exit 1
    fi
    
    if [ -z "$WEATHER_API_KEY" ] || [ "$WEATHER_API_KEY" = "your-openweathermap-api-key-here" ]; then
        echo "❌ Error: WEATHER_API_KEY debe estar configurado para producción"
        echo "Obtén una API key gratuita en https://openweathermap.org/api"
        exit 1
    fi
fi

# Compilar TypeScript
echo "📦 Compilando TypeScript..."
npm run build

# Ejecutar pruebas
echo "🧪 Ejecutando pruebas..."
npm test

# Validar configuración de Serverless
echo "✅ Validando configuración de Serverless..."
npx serverless print --stage $STAGE

# Desplegar
echo "🚀 Desplegando en AWS..."
npx serverless deploy --stage $STAGE --region $REGION --verbose

# Obtener información del despliegue
echo ""
echo "📋 Información del despliegue:"
npx serverless info --stage $STAGE --region $REGION

echo ""
echo "🎉 Despliegue completado exitosamente!"
echo ""
echo "📝 Próximos pasos:"
echo "1. Anota las URLs de los endpoints mostrados arriba"
echo "2. Configura las variables de entorno en AWS Lambda si es necesario"
echo "3. Genera un token JWT para pruebas: node scripts/generateToken.js"
echo "4. Prueba los endpoints con los ejemplos en EXAMPLES.md"
echo ""

if [ "$STAGE" = "dev" ]; then
    echo "💡 Para desarrollo local, ejecuta: npm run offline"
fi
