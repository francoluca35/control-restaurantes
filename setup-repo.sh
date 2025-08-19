#!/bin/bash

# Script para inicializar el repositorio Git y prepararlo para GitHub

echo "🚀 Inicializando repositorio Git para Home Master Dashboard..."

# Inicializar Git
git init

# Agregar todos los archivos
git add .

# Commit inicial
git commit -m "🎉 Initial commit: Home Master Dashboard

- Módulo completo de administración master
- Dashboard con métricas y estadísticas
- Gestión de restaurantes
- APIs necesarias incluidas
- Hooks personalizados
- Configuración completa de Next.js"

echo "✅ Repositorio Git inicializado correctamente"
echo ""
echo "📋 Próximos pasos:"
echo "1. Crea un nuevo repositorio en GitHub"
echo "2. Ejecuta: git remote add origin https://github.com/francoluca35/control-restaurantes.git"
echo "3. Ejecuta: git branch -M main"
echo "4. Ejecuta: git push -u origin main"
echo ""
echo "🔧 Configuración adicional:"
echo "- Crea un archivo .env.local con las variables de Firebase y Cloudinary"
echo "- Ejecuta: npm install"
echo "- Ejecuta: npm run dev"
