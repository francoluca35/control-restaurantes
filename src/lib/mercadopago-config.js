// Configuración y validación de MercadoPago
import mercadopago from "mercadopago";

// Validar que todas las credenciales estén configuradas
export const validateMercadoPagoConfig = () => {
  const requiredEnvVars = [
    "MERCADOPAGO_ACCESS_TOKEN",
    "MERCADOPAGO_PUBLIC_KEY",
    "MERCADOPAGO_CLIENT_ID",
    "MERCADOPAGO_CLIENT_SECRET",
  ];

  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingVars.length > 0) {
    console.error(
      "❌ Variables de entorno faltantes para MercadoPago:",
      missingVars
    );
    return false;
  }

  console.log("✅ Todas las credenciales de MercadoPago están configuradas");
  return true;
};

// Configurar MercadoPago
export const configureMercadoPago = () => {
  if (!validateMercadoPagoConfig()) {
    return false;
  }

  try {
    mercadopago.configure({
      access_token: process.env.MERCADOPAGO_ACCESS_TOKEN,
    });
    console.log("✅ MercadoPago configurado correctamente (PRODUCCIÓN)");
    return true;
  } catch (error) {
    console.error("❌ Error configurando MercadoPago:", error);
    return false;
  }
};

// Verificar conexión con MercadoPago
export const testMercadoPagoConnection = async () => {
  if (!configureMercadoPago()) {
    return { success: false, error: "MercadoPago no está configurado" };
  }

  try {
    // Intentar obtener información de la cuenta
    const response = await mercadopago.users.get();
    console.log("✅ Conexión con MercadoPago exitosa");
    return {
      success: true,
      accountInfo: response.body,
      message: "Conexión exitosa con MercadoPago",
    };
  } catch (error) {
    console.error("❌ Error conectando con MercadoPago:", error);
    return {
      success: false,
      error: error.message || "Error desconocido",
    };
  }
};

// Obtener información de las credenciales (sin mostrar datos sensibles)
export const getMercadoPagoInfo = () => {
  return {
    isConfigured: validateMercadoPagoConfig(),
    publicKey: process.env.MERCADOPAGO_PUBLIC_KEY
      ? "Configurado"
      : "No configurado",
    clientId: process.env.MERCADOPAGO_CLIENT_ID
      ? "Configurado"
      : "No configurado",
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN
      ? "Configurado"
      : "No configurado",
    clientSecret: process.env.MERCADOPAGO_CLIENT_SECRET
      ? "Configurado"
      : "No configurado",
    environment: "PRODUCCIÓN",
  };
};

export default {
  validateMercadoPagoConfig,
  configureMercadoPago,
  testMercadoPagoConnection,
  getMercadoPagoInfo,
};
