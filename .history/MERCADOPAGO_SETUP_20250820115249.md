# Configuración de MercadoPago - PRODUCCIÓN

## Credenciales Configuradas

Se han configurado las siguientes credenciales de **PRODUCCIÓN** de MercadoPago:

- **Public Key**: `APP_USR-6452aa8c-531d-4aff-9a29-bbeb27ca1f2c`
- **Access Token**: `APP_USR-3805637089394876-062320-da82ba95333079012f1e0776e1963bba-740803134`
- **Client ID**: `3805637089394876`
- **Client Secret**: `F0cHd68cqaU8NSk390rVADAApJOgtScM`

## Configuración del Entorno

### 1. Crear archivo `.env.local`

Crea un archivo `.env.local` en la raíz del proyecto con el siguiente contenido:

```env
# Mercado Pago Configuration - PRODUCCIÓN
MERCADOPAGO_ACCESS_TOKEN=APP_USR-3805637089394876-062320-da82ba95333079012f1e0776e1963bba-740803134
MERCADOPAGO_PUBLIC_KEY=APP_USR-6452aa8c-531d-4aff-9a29-bbeb27ca1f2c
MERCADOPAGO_CLIENT_ID=3805637089394876
MERCADOPAGO_CLIENT_SECRET=F0cHd68cqaU8NSk390rVADAApJOgtScM

# Para el frontend (opcional)
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=APP_USR-6452aa8c-531d-4aff-9a29-bbeb27ca1f2c

# Base URL para la aplicación
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 2. Verificar la configuración

Puedes verificar que todo esté funcionando correctamente visitando:

```
http://localhost:3000/api/mercadopago-test
```

O usando el componente de prueba:

```jsx
import MercadoPagoTest from '../components/MercadoPagoTest';

// En tu componente
<MercadoPagoTest />
```

## Funcionalidades Implementadas

### 1. Creación de Preferencias de Pago

```javascript
import { createPaymentPreference } from '../lib/mercadopago';

const preference = await createPaymentPreference({
  restaurantId: 'restaurant-id',
  amount: 1000,
  title: 'Activación de Restaurante',
  currency: 'ARS'
});
```

### 2. Componente de Botón de Pago

```jsx
import MercadoPagoButton from '../components/MercadoPagoButton';

<MercadoPagoButton 
  restaurantData={restaurant}
  amount={1000}
  title="Activación de Restaurante"
/>
```

### 3. Hook Personalizado

```jsx
import { useMercadoPago } from '../hooks/useMercadoPago';

const { createPaymentPreference, checkPaymentStatus, isLoading, error } = useMercadoPago();
```

## Endpoints Disponibles

### 1. Crear Preferencia de Pago
```
POST /api/payments/mercadopago
```

### 2. Verificar Estado de Pago
```
GET /api/payments/mercadopago?paymentId={id}&restaurantId={id}
```

### 3. Webhook de Notificaciones
```
POST /api/webhooks/mercadopago
```

### 4. Probar Configuración
```
GET /api/mercadopago-test
```

## Características de Producción

- ✅ **Modo Binario**: Solo acepta pagos aprobados o rechazados
- ✅ **Descripción en Resumen**: Aparece "RESTAURANTE" en el resumen de la tarjeta
- ✅ **Expiración**: Las preferencias expiran en 24 horas
- ✅ **Notificaciones**: Webhook configurado para recibir notificaciones
- ✅ **URLs de Retorno**: Configuradas para éxito, fallo y pendiente

## Seguridad

- 🔒 Las credenciales están en variables de entorno
- 🔒 El Access Token solo se usa en el backend
- 🔒 La Public Key se puede usar en el frontend de forma segura
- 🔒 Validación de configuración antes de cada operación

## Monitoreo

El sistema incluye logs detallados para monitorear:

- ✅ Configuración exitosa
- ✅ Creación de preferencias
- ✅ Notificaciones recibidas
- ✅ Errores de configuración
- ✅ Errores de conexión

## Próximos Pasos

1. **Configurar Firebase**: Asegúrate de tener las credenciales de Firebase configuradas
2. **Probar Pagos**: Usa el componente de prueba para verificar la configuración
3. **Configurar Webhooks**: Asegúrate de que las URLs de webhook sean accesibles desde internet
4. **Monitorear Logs**: Revisa los logs del servidor para verificar el funcionamiento

## Soporte

Si encuentras algún problema:

1. Verifica que el archivo `.env.local` esté creado correctamente
2. Revisa los logs del servidor
3. Usa el endpoint `/api/mercadopago-test` para diagnosticar problemas
4. Verifica que las credenciales sean válidas en el panel de MercadoPago
