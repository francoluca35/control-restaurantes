# 🔧 Instrucciones de Configuración

## Problema Identificado

Tienes errores tanto de Firebase como de MercadoPago porque las variables de entorno no están configuradas correctamente. Aunque mencionas que el `.env` está perfecto, el problema es que **no existe un archivo `.env.local`** en tu proyecto.

## Solución

### Paso 1: Crear el archivo `.env.local`

Crea un archivo llamado `.env.local` en la raíz de tu proyecto (al mismo nivel que `package.json`):

```bash
# En la raíz de tu proyecto
touch .env.local
```

### Paso 2: Configurar Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto (o crea uno nuevo)
3. Ve a Configuración del proyecto → Configuración general
4. En la sección "Tus apps", crea una nueva app web si no tienes una
5. Copia las credenciales y agrégalas a tu `.env.local`:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key_real_de_firebase
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_proyecto_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id
```

### Paso 3: Configurar MercadoPago

1. Ve a [MercadoPago Developers](https://www.mercadopago.com.ar/developers)
2. Accede a tu cuenta
3. Ve a Credenciales
4. Copia las credenciales de **PRODUCCIÓN** (no las de prueba):

```env
# Mercado Pago Configuration - PRODUCCIÓN
MERCADOPAGO_ACCESS_TOKEN=APP_USR-tu_access_token_real
MERCADOPAGO_PUBLIC_KEY=APP_USR-tu_public_key_real
MERCADOPAGO_CLIENT_ID=tu_client_id
MERCADOPAGO_CLIENT_SECRET=tu_client_secret

# Para el frontend
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=APP_USR-tu_public_key_real
```

### Paso 4: Otras configuraciones

```env
# Base URL para la aplicación
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Cloudinary Configuration (Opcional)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=tu_cloudinary_cloud_name
CLOUDINARY_API_KEY=tu_cloudinary_api_key
CLOUDINARY_API_SECRET=tu_cloudinary_api_secret
```

### Paso 5: Reiniciar el servidor

Después de crear el archivo `.env.local`, **debes reiniciar tu servidor de desarrollo**:

```bash
# Detén el servidor (Ctrl+C)
# Luego reinicia
npm run dev
```

## Verificación

Para verificar que todo está configurado correctamente:

1. **Firebase**: Deberías ver en la consola: "✅ Firebase initialized successfully"
2. **MercadoPago**: Deberías ver en la consola: "✅ Mercado Pago configurado correctamente"

## Errores Comunes

### Error: "Firebase: Error (auth/api-key-not-valid)"
- **Causa**: API key de Firebase incorrecta o no configurada
- **Solución**: Verifica que `NEXT_PUBLIC_FIREBASE_API_KEY` tenga el valor correcto

### Error: "Mercado Pago no está configurado"
- **Causa**: Access token de MercadoPago incorrecto o no configurado
- **Solución**: Verifica que `MERCADOPAGO_ACCESS_TOKEN` tenga el valor correcto

### Error: "Variables de entorno no encontradas"
- **Causa**: El archivo `.env.local` no existe o está en la ubicación incorrecta
- **Solución**: Asegúrate de que el archivo esté en la raíz del proyecto

## Estructura Final

Tu proyecto debería tener esta estructura:

```
control-restaurantes/
├── .env.local          ← NUEVO ARCHIVO (crear)
├── env.example         ← Archivo de ejemplo
├── package.json
├── src/
└── ...
```

## Notas Importantes

1. **NUNCA** subas el archivo `.env.local` a Git (ya está en `.gitignore`)
2. **SIEMPRE** usa credenciales de **PRODUCCIÓN** para MercadoPago, no las de prueba
3. **REINICIA** el servidor después de crear/modificar `.env.local`
4. Las variables que empiezan con `NEXT_PUBLIC_` son accesibles desde el frontend

## Soporte

Si sigues teniendo problemas después de seguir estos pasos:

1. Verifica que las credenciales sean correctas
2. Revisa la consola del navegador para errores específicos
3. Asegúrate de que el servidor se haya reiniciado correctamente
