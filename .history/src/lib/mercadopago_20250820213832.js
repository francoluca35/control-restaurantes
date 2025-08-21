import mercadopago from "mercadopago";

// Configurar Mercado Pago con las credenciales del entorno
const configureMercadoPago = () => {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

  if (!accessToken) {
    console.warn("⚠️ MERCADOPAGO_ACCESS_TOKEN no configurado en .env.local");
    return false;
  }

  // Verificar que no sea el token de ejemplo
  if (
    accessToken ===
    "APP_USR-3805637089394876-062320-da82ba95333079012f1e0776e1963bba-740803134"
  ) {
    console.warn(
      "⚠️ MERCADOPAGO_ACCESS_TOKEN parece ser un token de ejemplo. Por favor, usa tus credenciales reales de MercadoPago"
    );
    return false;
  }

  try {
    mercadopago.configure({
      access_token: accessToken,
    });
    console.log("✅ Mercado Pago configurado correctamente");
    return true;
  } catch (error) {
    console.error("❌ Error configurando Mercado Pago:", error);
    return false;
  }
};

// Obtener la clave pública para el frontend
export const getPublicKey = () => {
  return process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY || null;
};

// Crear preferencia de pago
export const createPaymentPreference = async (paymentData) => {
  const isConfigured = configureMercadoPago();

  if (!isConfigured) {
    throw new Error(
      "Mercado Pago no está configurado. Verifica MERCADOPAGO_ACCESS_TOKEN en .env.local"
    );
  }

  try {
    const preference = {
      items: [
        {
          title: paymentData.title || "Activación de Restaurante",
          unit_price: paymentData.amount,
          quantity: 1,
          currency_id: paymentData.currency || "ARS",
        },
      ],
      back_urls: {
        success:
          paymentData.successUrl ||
          `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success`,
        failure:
          paymentData.failureUrl ||
          `${process.env.NEXT_PUBLIC_BASE_URL}/payment/failure`,
        pending:
          paymentData.pendingUrl ||
          `${process.env.NEXT_PUBLIC_BASE_URL}/payment/pending`,
      },
      auto_return: "approved",
      external_reference: paymentData.externalReference,
      notification_url:
        paymentData.notificationUrl ||
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhooks/mercadopago`,
      expires: true,
      expiration_date_to: new Date(
        Date.now() + 24 * 60 * 60 * 1000
      ).toISOString(),
      binary_mode: true,
      statement_descriptor: "RESTAURANTE",
    };

    const response = await mercadopago.preferences.create(preference);
    console.log("✅ Preferencia de pago creada:", response.body.id);
    return response.body;
  } catch (error) {
    console.error("Error creando preferencia de pago:", error);
    throw new Error("Error al crear la preferencia de pago");
  }
};
