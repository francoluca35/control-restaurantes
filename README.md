# Home Master Dashboard

Este es el módulo de administración master para el sistema de comandas múltiples. Permite gestionar restaurantes, monitorear métricas y administrar el sistema desde una interfaz centralizada.

## Características

- **Dashboard Principal**: Vista general con estadísticas del sistema
- **Gestión de Restaurantes**: Crear, editar y monitorear restaurantes
- **Métricas del Sistema**: Monitoreo de rendimiento y actividad
- **Activación de Restaurantes**: Proceso de activación de nuevos locales
- **Historial de Pagos**: Seguimiento de transacciones
- **Monitoreo en Tiempo Real**: Estado de restaurantes y alertas

## Estructura del Proyecto

```
src/
├── app/
│   ├── home-master/          # Módulo principal
│   │   ├── components/       # Componentes específicos
│   │   ├── dashboard/        # Dashboard principal
│   │   ├── login/           # Autenticación
│   │   ├── metrics/         # Métricas del sistema
│   │   └── vistas/          # Vistas principales
│   └── api/                 # APIs necesarias
├── hooks/                   # Hooks personalizados
├── context/                 # Contextos de React
├── store/                   # Estado global (Zustand)
├── providers/               # Proveedores de contexto
└── lib/                     # Configuraciones (Firebase, Cloudinary)
```

## Configuración

### 1. Variables de Entorno

Crear un archivo `.env.local` con las siguientes variables:

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

### 2. Instalación

```bash
npm install
```

### 3. Desarrollo

```bash
npm run dev
```

### 4. Build

```bash
npm run build
npm start
```

## Hooks Principales

- `useMasterAPI`: Gestión de APIs del dashboard master
- `useDashboardStats`: Estadísticas del dashboard
- `useRestaurantMonitoring`: Monitoreo de restaurantes

## APIs Incluidas

- `/api/registrar-restaurante`: Registro de nuevos restaurantes
- `/api/restaurants`: Gestión de restaurantes
- `/api/metrics`: Métricas del sistema

## Dependencias Principales

- **Next.js 15**: Framework de React
- **Firebase**: Base de datos y autenticación
- **TanStack Query**: Gestión de estado del servidor
- **Zustand**: Estado global
- **Tailwind CSS**: Estilos
- **React Hook Form**: Formularios
- **SweetAlert2**: Alertas y modales

## Funcionalidades

### Dashboard Principal
- Estadísticas generales del sistema
- Gráficos de rendimiento
- Alertas y notificaciones

### Gestión de Restaurantes
- Lista de restaurantes activos
- Estado de cada restaurante
- Acciones rápidas (activar, suspender, etc.)

### Métricas del Sistema
- Rendimiento general
- Uso de recursos
- Alertas del sistema

### Activación de Restaurantes
- Proceso de registro
- Configuración inicial
- Validación de datos

## Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto es privado y confidencial.
