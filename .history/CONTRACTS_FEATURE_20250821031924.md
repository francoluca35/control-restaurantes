# Funcionalidad de Descarga de Contratos

## Descripción

Se ha implementado una nueva funcionalidad en el historial de pagos que permite descargar contratos de activación para pagos aprobados. Esta funcionalidad es especialmente útil cuando un restaurante no descargó el contrato durante el proceso de activación.

## Características Principales

### 1. Vista de Historial Mejorada
- **Tabla completa de pagos**: Muestra todos los pagos y transacciones con información detallada
- **Filtrado por restaurante**: Permite filtrar el historial por restaurante específico
- **Estadísticas en tiempo real**: Muestra total de pagos, pagos aprobados, monto total y tasa de aprobación

### 2. Descarga de Contratos
- **Botón de descarga**: Disponible solo para pagos con estado "Aprobado"
- **Formato HTML**: Los contratos se descargan en formato HTML con estilos profesionales
- **Información completa**: Incluye datos del restaurante, detalles del pago y términos y condiciones

### 3. Resumen de Contratos
- **Vista general**: Muestra todos los contratos disponibles agrupados por restaurante
- **Información de pagos**: Detalla cada pago aprobado con su monto y fecha
- **Estado visual**: Indica claramente qué contratos están disponibles para descarga

## Componentes Creados

### 1. `usePaymentHistory.js`
Hook personalizado que maneja:
- Carga del historial de pagos desde la API
- Descarga de contratos con generación de HTML
- Manejo de errores y estados de carga

### 2. `PaymentHistoryTable.jsx`
Componente principal que muestra:
- Tabla de pagos con filtros
- Botones de descarga de contratos
- Notificaciones de éxito/error
- Estadísticas de pagos

### 3. `ContractSummary.jsx`
Componente que muestra:
- Resumen de contratos disponibles
- Agrupación por restaurante
- Información de pagos aprobados

### 4. `NotificationToast.jsx`
Componente de notificaciones que:
- Muestra mensajes de éxito/error
- Se auto-oculta después de un tiempo
- Tiene diferentes estilos según el tipo de mensaje

## Estructura del Contrato

Los contratos descargados incluyen:

### Información del Restaurante
- Nombre del restaurante
- Propietario
- Dirección
- Teléfono
- Email

### Información del Pago
- Monto pagado
- Método de pago
- Fecha de pago
- ID de transacción
- Estado del pago

### Términos y Condiciones
- Duración del servicio (30 días)
- Servicios incluidos
- Política de cancelación
- Soporte técnico
- Confidencialidad de datos

### Sección de Firmas
- Firma del cliente
- Firma del representante

## Uso de la Funcionalidad

### Para Administradores
1. Navegar a la sección "Historial" en el dashboard
2. Ver el resumen de contratos disponibles
3. Usar la tabla de pagos para filtrar por restaurante
4. Hacer clic en "📄 Descargar Contrato" para pagos aprobados
5. El archivo se descargará automáticamente

### Para Restaurantes
1. Los contratos se pueden descargar desde el historial de pagos
2. Cada pago aprobado tiene su propio contrato
3. Los contratos incluyen toda la información relevante

## Archivos Modificados

### API
- `src/app/api/pagos/history/route.js`: Modificado para soportar consultas sin filtro de restaurante

### Componentes
- `src/app/home-master/vistas/VistaHistorial.jsx`: Actualizado con nueva interfaz
- `src/components/ContractPrinter.jsx`: Ya existía, se mantiene para compatibilidad

### Hooks
- `src/hooks/usePagos.js`: Ya existía, se mantiene para compatibilidad

## Consideraciones Técnicas

### Formato de Descarga
- Los contratos se descargan como archivos HTML
- Incluyen estilos CSS embebidos para impresión
- Son compatibles con navegadores modernos

### Rendimiento
- Los datos se cargan de forma asíncrona
- Se implementa paginación para grandes volúmenes de datos
- Las notificaciones no bloquean la interfaz

### Seguridad
- Solo se pueden descargar contratos de pagos aprobados
- Se valida la existencia de datos del restaurante
- Se manejan errores de forma segura

## Próximas Mejoras

1. **Formato PDF**: Implementar descarga en formato PDF
2. **Firma digital**: Agregar funcionalidad de firma digital
3. **Plantillas personalizables**: Permitir personalizar el contenido del contrato
4. **Envío por email**: Opción para enviar contratos por email
5. **Almacenamiento**: Guardar contratos descargados en la base de datos

## Soporte

Para cualquier consulta sobre esta funcionalidad, contactar al equipo de desarrollo o revisar la documentación técnica del proyecto.
