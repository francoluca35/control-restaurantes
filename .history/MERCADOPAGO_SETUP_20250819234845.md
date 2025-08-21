# Configuración de Mercado Pago

Este documento explica cómo configurar la integración con Mercado Pago para el sistema de activación de restaurantes.

## Requisitos Previos

1. **Cuenta de Mercado Pago**: Necesitas una cuenta de Mercado Pago para desarrolladores
2. **Credenciales de API**: Access Token de Mercado Pago
3. **Configuración de Webhooks**: URL para recibir notificaciones de pago

## Configuración

### 1. Obtener Credenciales de Mercado Pago

1. Ve a [Mercado Pago Developers](https://www.mercadopago.com.ar/developers)
2. Crea una cuenta o inicia sesión
3. Ve a "Tus integraciones" > "Credenciales"
4. Copia tu **Access Token**

### 2. Configurar Variables de Entorno

Agrega las siguientes variables a tu archivo `.env.local`:

```env
# Mercado Pago Configuration
MERCADOPAGO_ACCESS_TOKEN=TEST-xxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

**Nota**: 
- Para desarrollo, usa el Access Token de **TEST**
- Para producción, usa el Access Token de **PRODUCCIÓN**

### 3. Configurar Webhooks (Opcional)

Para recibir notificaciones automáticas de pagos:

1. Ve a tu panel de Mercado Pago
2. Configura la URL del webhook: `https://tu-dominio.com/api/webhooks/mercadopago`
3. Selecciona los eventos: `payment.created`, `payment.updated`

## Flujo de Pago

### 1. Activación de Restaurante

Cuando un usuario selecciona "Mercado Pago" como método de pago:

1. Se crea el restaurante en la base de datos
2. Se genera una preferencia de pago en Mercado Pago
3. Se redirige al usuario a la página de pago de Mercado Pago
4. El usuario completa el pago con su tarjeta

### 2. Confirmación de Pago

Después del pago:

1. **Webhook**: Mercado Pago envía una notificación automática
2. **Página de Retorno**: El usuario es redirigido según el resultado
3. **Actualización**: El restaurante se marca como "pagado" automáticamente

### 3. Estados de Pago

- **approved**: Pago exitoso, restaurante activado
- **pending**: Pago en proceso, esperar confirmación
- **rejected**: Pago rechazado, restaurante no activado

## Páginas de Retorno

### Éxito (`/payment/success`)
- Muestra confirmación del pago exitoso
- Permite continuar al dashboard

### Fallo (`/payment/failure`)
- Explica posibles causas del fallo
- Opciones para reintentar o contactar soporte

### Pendiente (`/payment/pending`)
- Informa que el pago está en proceso
- Instrucciones sobre próximos pasos

## API Endpoints

### Crear Preferencia de Pago
```
POST /api/payments/mercadopago
```

**Body:**
```json
{
  "restaurantId": "restaurante_id",
  "amount": 29.99,
  "title": "Activación de Restaurante",
  "externalReference": "restaurante_id"
}
```

### Verificar Estado de Pago
```
GET /api/payments/mercadopago?paymentId=123&restaurantId=restaurante_id
```

### Webhook
```
POST /api/webhooks/mercadopago
```

## Monitoreo y Debugging

### Logs
Los logs de Mercado Pago se muestran en la consola del servidor:

```
📨 Notificación recibida de Mercado Pago: {...}
💳 Información del pago: {...}
✅ Restaurante actualizado con pago aprobado: restaurante_id
```

### Verificación Manual
Puedes verificar el estado de un pago manualmente:

```javascript
const { checkPaymentStatus } = useMercadoPago();
const status = await checkPaymentStatus(paymentId, restaurantId);
console.log(status);
```

## Solución de Problemas

### Error: "Mercado Pago no está configurado"
- Verifica que `MERCADOPAGO_ACCESS_TOKEN` esté configurado
- Asegúrate de que el token sea válido

### Error: "Error al crear preferencia de pago"
- Verifica que el Access Token tenga permisos suficientes
- Revisa que los datos del pago sean válidos

### Webhook no funciona
- Verifica que la URL del webhook sea accesible públicamente
- Asegúrate de que el endpoint responda correctamente
- Revisa los logs del servidor para errores

### Pago no se actualiza automáticamente
- Verifica que el webhook esté configurado correctamente
- Revisa que el `external_reference` coincida con el ID del restaurante
- Comprueba los logs del webhook

## Testing

### Modo Sandbox
Para pruebas, usa las tarjetas de prueba de Mercado Pago:

- **Visa**: 4509 9535 6623 3704
- **Mastercard**: 5031 4332 1540 6351
- **American Express**: 3711 8030 3257 522

### Datos de Prueba
- **CVV**: 123
- **Fecha de vencimiento**: Cualquier fecha futura
- **Nombre**: Cualquier nombre

## Producción

### Checklist de Producción

- [ ] Cambiar a Access Token de PRODUCCIÓN
- [ ] Configurar URL de producción en `NEXT_PUBLIC_BASE_URL`
- [ ] Configurar webhook con URL de producción
- [ ] Probar con tarjetas reales
- [ ] Verificar que los pagos se procesen correctamente
- [ ] Monitorear logs de producción

### Seguridad

- Nunca expongas el Access Token en el frontend
- Usa HTTPS en producción
- Valida todas las notificaciones del webhook
- Implementa rate limiting si es necesario

## Soporte

Si tienes problemas con la integración:

1. Revisa los logs del servidor
2. Verifica la configuración de Mercado Pago
3. Consulta la [documentación oficial de Mercado Pago](https://www.mercadopago.com.ar/developers/es/docs)
4. Contacta al soporte técnico
