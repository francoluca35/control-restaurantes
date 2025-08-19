# Guía de Migración - Home Master Dashboard

## 📋 Resumen

Este directorio contiene todo el módulo `home-master` extraído del proyecto principal `comandas-multiples`, listo para ser migrado a un nuevo repositorio de GitHub.

## 🗂️ Archivos Incluidos

### Estructura Principal
```
temp-home-master-migration/
├── src/
│   ├── app/
│   │   ├── home-master/          # Módulo completo
│   │   ├── api/                  # APIs necesarias
│   │   ├── layout.js             # Layout principal
│   │   ├── page.js               # Página de inicio
│   │   └── globals.css           # Estilos globales
│   ├── hooks/                    # Hooks personalizados
│   ├── context/                  # Contextos de React
│   ├── store/                    # Estado global (Zustand)
│   ├── providers/                # Proveedores
│   ├── schemas/                  # Validaciones
│   └── lib/                      # Configuraciones
├── package.json                  # Dependencias
├── next.config.mjs              # Configuración Next.js
├── tailwind.config.js           # Configuración Tailwind
├── eslint.config.mjs            # Configuración ESLint
├── README.md                     # Documentación
├── setup-repo.sh                # Script de inicialización
└── env.example                  # Variables de entorno
```

### APIs Incluidas
- `/api/registrar-restaurante` - Registro de restaurantes
- `/api/restaurants` - Gestión de restaurantes
- `/api/metrics` - Métricas del sistema

### Hooks Incluidos
- `useMasterAPI.js` - APIs del dashboard master
- `useDashboardStats.js` - Estadísticas del dashboard
- `useRestaurantMonitoring.js` - Monitoreo de restaurantes
- `useErrorHandler.js` - Manejo de errores
- `useAPIErrorHandler.js` - Manejo de errores de API

## 🚀 Pasos para Migrar a GitHub

### 1. Crear Nuevo Repositorio en GitHub
1. Ve a GitHub.com
2. Haz clic en "New repository"
3. Nombra el repositorio (ej: `home-master-dashboard`)
4. No inicialices con README, .gitignore o licencia
5. Haz clic en "Create repository"

### 2. Inicializar el Repositorio Local
```bash
# Navegar al directorio de migración
cd temp-home-master-migration

# Ejecutar el script de inicialización
./setup-repo.sh
```

### 3. Conectar con GitHub
```bash
# Reemplaza TU_USUARIO y TU_REPO con tus datos
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git branch -M main
git push -u origin main
```

### 4. Configurar Variables de Entorno
```bash
# Copiar el archivo de ejemplo
cp env.example .env.local

# Editar con tus credenciales reales
nano .env.local
```

### 5. Instalar Dependencias y Ejecutar
```bash
npm install
npm run dev
```

## 🔧 Configuración Requerida

### Variables de Entorno Necesarias
```env
# Firebase (obligatorio)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Cloudinary (opcional, para imágenes)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### Dependencias Principales
- Next.js 15.4.4
- React 19.1.0
- Firebase 12.0.0
- TanStack Query 5.84.1
- Zustand 5.0.7
- Tailwind CSS 3.4.17

## 📁 Archivos Modificados

### Importaciones
Algunos archivos pueden necesitar ajustes en las rutas de importación, especialmente:
- Rutas relativas en componentes
- Importaciones de hooks
- Referencias a APIs

### Configuraciones
- Firebase: Verificar que `lib/firebase.js` tenga la configuración correcta
- Cloudinary: Verificar que `lib/cloudinary.js` esté configurado
- Tailwind: Verificar que `tailwind.config.js` incluya las rutas correctas

## 🐛 Solución de Problemas

### Error de Importación
Si hay errores de importación, verifica:
1. Rutas relativas correctas
2. Archivos existentes en las ubicaciones esperadas
3. Configuración de jsconfig.json

### Error de Firebase
Si hay errores de Firebase:
1. Verifica las variables de entorno
2. Confirma que el proyecto Firebase existe
3. Verifica las reglas de Firestore

### Error de Build
Si hay errores de build:
1. Ejecuta `npm run lint` para ver errores
2. Verifica que todas las dependencias estén instaladas
3. Revisa la consola para errores específicos

## 📞 Soporte

Si encuentras problemas durante la migración:
1. Revisa los logs de error
2. Verifica la configuración de Firebase
3. Confirma que todas las variables de entorno estén configuradas
4. Revisa la documentación de Next.js y Firebase

## ✅ Checklist de Migración

- [ ] Repositorio GitHub creado
- [ ] Archivos copiados al nuevo directorio
- [ ] Git inicializado y conectado a GitHub
- [ ] Variables de entorno configuradas
- [ ] Dependencias instaladas
- [ ] Aplicación ejecutándose localmente
- [ ] Funcionalidades principales probadas
- [ ] Documentación actualizada
