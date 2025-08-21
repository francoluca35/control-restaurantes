// Configuración de Mercado Pago
import mercadopago from "mercadopago";

// Configurar Mercado Pago con las credenciales del entorno
const configureMercadoPago = () => {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  const publicKey = process.env.MERCADOPAGO_PUBLIC_KEY;

  if (!accessToken) {
    console.warn("⚠️ MERCADOPAGO_ACCESS_TOKEN no configurado");
    return false;
  }

  if (!publicKey) {
    console.warn("⚠️ MERCADOPAGO_PUBLIC_KEY no configurado");
    return false;
  }

  try {
    mercadopago.configure({
      access_token: accessToken,
    });
    console.log("✅ Mercado Pago configurado correctamente (PRODUCCIÓN)");
    return true;
  } catch (error) {
    console.error("❌ Error configurando Mercado Pago:", error);
    return false;
  }
};

// Obtener la clave pública para el frontend
export const getPublicKey = () => {
  return (
    process.env.MERCADOPAGO_PUBLIC_KEY ||
    process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY
  );
};

// Crear preferencia de pago
export const createPaymentPreference = async (paymentData) => {
  const isConfigured = configureMercadoPago();

  // Verificar que esté configurado para producción
  if (!isConfigured) {
    throw new Error(
      "Mercado Pago no está configurado. Verifica las credenciales en .env.local"
    );
  }

  try {
    const preference = {
      items: [
        {
          title: paymentData.title || "Activación de Restaurante",
          unit_price: paymentData.amount,
          quantity: 1,
          currency_id: paymentData.currency || "ARS", // Usar moneda especificada o ARS por defecto
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
      ).toISOString(), // 24 horas
      // Configuraciones adicionales para producción
      binary_mode: true, // Solo acepta pagos aprobados o rechazados
      statement_descriptor: "RESTAURANTE", // Descripción que aparece en el resumen de la tarjeta
    };

    const response = await mercadopago.preferences.create(preference);
    console.log("✅ Preferencia de pago creada:", response.body.id);
    return response.body;
  } catch (error) {
    console.error("Error creando preferencia de pago:", error);
    throw new Error("Error al crear la preferencia de pago");
  }
};

// Procesar notificación de pago
export const processPaymentNotification = async (notificationData) => {
  const isConfigured = configureMercadoPago();

  if (!isConfigured) {
    throw new Error("Mercado Pago no está configurado");
  }

  try {
    const { data } = notificationData;

    if (data.type === "payment") {
      const payment = await mercadopago.payment.findById(data.id);
      return payment.body;
    }

    return null;
  } catch (error) {
    console.error("Error procesando notificación de pago:", error);
    throw new Error("Error al procesar la notificación de pago");
  }
};

// Obtener información de un pago
export const getPaymentInfo = async (paymentId) => {
  const isConfigured = configureMercadoPago();

  if (!isConfigured) {
    throw new Error("Mercado Pago no está configurado");
  }

  try {
    const payment = await mercadopago.payment.findById(paymentId);
    return payment.body;
  } catch (error) {
    console.error("Error obteniendo información del pago:", error);
    throw new Error("Error al obtener información del pago");
  }
};

// Verificar estado de un pago
export const checkPaymentStatus = async (paymentId) => {
  try {
    const payment = await getPaymentInfo(paymentId);
    return {
      id: payment.id,
      status: payment.status,
      status_detail: payment.status_detail,
      external_reference: payment.external_reference,
      transaction_amount: payment.transaction_amount,
      payment_method: payment.payment_method,
      payment_type_id: payment.payment_type_id,
      date_approved: payment.date_approved,
    };
  } catch (error) {
    console.error("Error verificando estado del pago:", error);
    throw error;
  }
};

export default {
  configureMercadoPago,
  createPaymentPreference,
  processPaymentNotification,
  getPaymentInfo,
  checkPaymentStatus,
};
