#!/bin/bash

# Script para configurar el entorno de desarrollo

echo "🚀 Configurando entorno de desarrollo para Rimac Reto..."

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no encontrado. Por favor instala Node.js 20+"
    exit 1
fi

NODE_VERSION=$(node -v | cut -c 2-3)
if [ "$NODE_VERSION" -lt "20" ]; then
    echo "❌ Se requiere Node.js 20+. Versión actual: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) encontrado"

# Verificar npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm no encontrado"
    exit 1
fi

echo "✅ npm $(npm -v) encontrado"

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

# Verificar si existe .env
if [ ! -f .env ]; then
    echo "⚠️  Archivo .env no encontrado"
    echo "📄 Copiando .env.example a .env..."
    cp .env.example .env
    echo "✏️  Por favor edita el archivo .env con tus configuraciones"
fi

# Verificar AWS CLI
if command -v aws &> /dev/null; then
    echo "✅ AWS CLI encontrado"
    if aws configure list &> /dev/null; then
        echo "✅ AWS configurado"
    else
        echo "⚠️  AWS CLI no configurado. Ejecuta 'aws configure'"
    fi
else
    echo "⚠️  AWS CLI no encontrado. Instálalo para el despliegue"
fi

# Verificar Serverless
if ! command -v serverless &> /dev/null; then
    echo "📦 Instalando Serverless Framework globalmente..."
    npm install -g serverless
fi

echo "✅ Serverless Framework $(serverless -v | head -n1 | cut -d' ' -f3) instalado"

# Crear directorio para logs si no existe
mkdir -p logs

echo ""
echo "🎉 Configuración completada!"
echo ""
echo "📝 Próximos pasos:"
echo "1. Edita el archivo .env con tus configuraciones"
echo "2. Ejecuta 'npm test' para verificar que todo funcione"
echo "3. Ejecuta 'npm run offline' para desarrollo local"
echo "4. Ejecuta 'npm run deploy:dev' para desplegar en AWS"
echo ""
