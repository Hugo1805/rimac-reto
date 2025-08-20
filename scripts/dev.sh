#!/bin/bash

# Script para desarrollo local con Serverless Offline

echo "🔧 Iniciando entorno de desarrollo local..."

# Verificar dependencias
if ! command -v serverless &> /dev/null; then
    echo "❌ Serverless Framework no encontrado"
    echo "Instálalo con: npm install -g serverless"
    exit 1
fi

# Verificar archivo .env
if [ ! -f .env ]; then
    echo "⚠️  Archivo .env no encontrado"
    echo "Copiando .env.example..."
    cp .env.example .env
    echo "✏️  Edita .env con tus configuraciones antes de continuar"
    exit 1
fi

# Cargar variables de entorno
export $(cat .env | grep -v ^# | xargs)

# Verificar que las variables críticas estén configuradas
if [ -z "$JWT_SECRET" ]; then
    echo "⚠️  JWT_SECRET no configurado en .env"
fi

if [ -z "$WEATHER_API_KEY" ] || [ "$WEATHER_API_KEY" = "your-openweathermap-api-key-here" ]; then
    echo "⚠️  WEATHER_API_KEY no configurado en .env"
    echo "Obtén una API key gratuita en https://openweathermap.org/api"
fi

# Compilar TypeScript
echo "📦 Compilando TypeScript..."
npm run build

# Iniciar DynamoDB Local en segundo plano si no está ejecutándose
if ! pgrep -f "DynamoDBLocal" > /dev/null; then
    echo "🗄️  Iniciando DynamoDB Local..."
    npx serverless dynamodb start --migrate &
    DYNAMODB_PID=$!
    sleep 5
fi

# Función para limpiar procesos al salir
cleanup() {
    echo ""
    echo "🧹 Limpiando procesos..."
    if [ ! -z "$DYNAMODB_PID" ]; then
        kill $DYNAMODB_PID 2>/dev/null || true
    fi
    pkill -f "DynamoDBLocal" 2>/dev/null || true
    exit 0
}

# Configurar trap para limpiar al salir
trap cleanup INT TERM

echo ""
echo "🚀 Iniciando Serverless Offline..."
echo "📍 API estará disponible en: http://localhost:3000"
echo "🗄️  DynamoDB Local en: http://localhost:8000"
echo ""
echo "💡 Para generar un token JWT: node scripts/generateToken.js"
echo "📖 Ver ejemplos de uso en: EXAMPLES.md"
echo ""
echo "Press Ctrl+C para detener el servidor"
echo ""

# Iniciar Serverless Offline
npx serverless offline --stage dev --host 0.0.0.0
