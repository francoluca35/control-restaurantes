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

## Flujo Completo de Activación de Restaurantes

### 🎯 Proceso de 3 Pasos

El sistema implementa un flujo completo para la activación de restaurantes:

#### **Paso 1: Generar Link de Pago**
- Se crea una preferencia de pago única para cada restaurante
- Se genera un link de pago que se puede enviar al cliente
- Opciones de envío: copiar link, WhatsApp, email

#### **Paso 2: Monitorear Pago**
- Verificación automática cada 30 segundos del estado del pago
- Verificación manual disponible
- Estados: pendiente, aprobado, rechazado

#### **Paso 3: Imprimir Contrato**
- Generación automática de contrato profesional
- Incluye toda la información del restaurante y pago
- Opciones de impresión y descarga PDF

### 🔄 Activación Automática

Cuando el cliente completa el pago:

1. **Webhook recibe notificación** de MercadoPago
2. **Restaurante se activa automáticamente** en la base de datos
3. **Estado cambia a "activo"** inmediatamente
4. **Contrato se puede imprimir** con toda la información

## Componentes Disponibles

### 1. Flujo Completo
```jsx
import RestaurantPaymentFlow from '../components/RestaurantPaymentFlow';

<RestaurantPaymentFlow 
  restaurantData={restaurant}
  amount={1000}
/>
```

### 2. Generador de Links
```jsx
import PaymentLinkGenerator from '../components/PaymentLinkGenerator';

<PaymentLinkGenerator
  restaurantData={restaurant}
  amount={1000}
  onPaymentCreated={(paymentData) => {
    console.log('Pago creado:', paymentData);
  }}
/>
```

### 3. Monitor de Pagos
```jsx
import PaymentMonitor from '../components/PaymentMonitor';

<PaymentMonitor
  preferenceId="preference-id"
  restaurantId="restaurant-id"
  onPaymentComplete={(status) => {
    console.log('Pago completado:', status);
  }}
  onPrintContract={(data) => {
    console.log('Imprimir contrato:', data);
  }}
/>
```

### 4. Impresor de Contratos
```jsx
import ContractPrinter from '../components/ContractPrinter';

<ContractPrinter
  restaurantData={restaurant}
  paymentData={paymentStatus}
  onPrintComplete={(contractData) => {
    console.log('Contrato impreso:', contractData);
  }}
/>
```

## Página de Ejemplo

Visita `/restaurant-payment` para ver el flujo completo en acción:

```jsx
// src/app/restaurant-payment/page.jsx
import RestaurantPaymentFlow from '../../components/RestaurantPaymentFlow';

// Página completa con formulario de datos del restaurante
// y flujo de pago integrado
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
- ✅ **Activación Automática**: Restaurante se activa al completar el pago
- ✅ **Monitoreo en Tiempo Real**: Verificación automática cada 30 segundos
- ✅ **Contrato Automático**: Generación e impresión de contrato profesional

## Seguridad

- 🔒 Las credenciales están en variables de entorno
- 🔒 El Access Token solo se usa en el backend
- 🔒 La Public Key se puede usar en el frontend de forma segura
- 🔒 Validación de configuración antes de cada operación
- 🔒 Verificación de webhooks para evitar fraudes

## Monitoreo

El sistema incluye logs detallados para monitorear:

- ✅ Configuración exitosa
- ✅ Creación de preferencias
- ✅ Notificaciones recibidas
- ✅ Errores de configuración
- ✅ Errores de conexión
- ✅ Estado de pagos en tiempo real
- ✅ Activación automática de restaurantes

## Flujo de Trabajo Completo

### Para el Administrador:
1. **Ingresar datos del restaurante** en el formulario
2. **Generar link de pago** con un clic
3. **Enviar link al cliente** (WhatsApp, email, copiar)
4. **Monitorear estado** automáticamente
5. **Imprimir contrato** cuando se complete el pago

### Para el Cliente:
1. **Recibir link de pago** del administrador
2. **Completar pago** con tarjeta, transferencia, etc.
3. **Recibir confirmación** automática
4. **Restaurante activado** inmediatamente

### Automático:
1. **Webhook recibe notificación** de MercadoPago
2. **Restaurante se activa** en la base de datos
3. **Estado cambia a "activo"**
4. **Sistema listo** para funcionar

## Próximos Pasos

1. **Configurar Firebase**: Asegúrate de tener las credenciales de Firebase configuradas
2. **Probar Pagos**: Usa el componente de prueba para verificar la configuración
3. **Configurar Webhooks**: Asegúrate de que las URLs de webhook sean accesibles desde internet
4. **Monitorear Logs**: Revisa los logs del servidor para verificar el funcionamiento
5. **Personalizar Contratos**: Modifica el template del contrato según tus necesidades
6. **Configurar Notificaciones**: Implementa notificaciones por email/SMS cuando se complete un pago

## Soporte

Si encuentras algún problema:

1. Verifica que el archivo `.env.local` esté creado correctamente
2. Revisa los logs del servidor
3. Usa el endpoint `/api/mercadopago-test` para diagnosticar problemas
4. Verifica que las credenciales sean válidas en el panel de MercadoPago
5. Comprueba que el webhook esté configurado correctamente
6. Revisa la conectividad de red para las notificaciones
