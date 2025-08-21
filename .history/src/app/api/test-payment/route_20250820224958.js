import { NextResponse } from "next/server";
import { createPaymentPreference } from "../../../lib/mercadopago";

export async function POST() {
  try {
    console.log("🧪 Creando pago de prueba de $1 ARS...");

    const paymentData = {
      title: "Pago de Prueba - 1 Peso",
      amount: 1,
      currency: "ARS",
      externalReference: "TEST-PAYMENT-001",
      successUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success?restaurantId=TEST-PAYMENT-001`,
      failureUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/failure?restaurantId=TEST-PAYMENT-001`,
      pendingUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/pending?restaurantId=TEST-PAYMENT-001`,
      notificationUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhooks/mercadopago`,
    };

    const preference = await createPaymentPreference(paymentData);

    console.log("✅ Pago de prueba creado:", preference.id);

    return NextResponse.json({
      success: true,
      message: "Pago de prueba creado exitosamente",
      preference: {
        id: preference.id,
        initPoint: preference.init_point,
        sandboxInitPoint: preference.sandbox_init_point,
      },
      testInfo: {
        amount: 1,
        currency: "ARS",
        description: "Pago de Prueba - 1 Peso",
        reference: "TEST-PAYMENT-001",
      },
    });
  } catch (error) {
    console.error("❌ Error creando pago de prueba:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al crear el pago de prueba",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// GET - Información del endpoint de prueba
export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Endpoint de pagos de prueba funcionando",
    testInfo: {
      amount: 1,
      currency: "ARS",
      description: "Pago de Prueba - 1 Peso",
      reference: "TEST-PAYMENT-001",
    },
    endpoints: {
      createPayment: "POST /api/test-payment",
      webhook: `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhooks/mercadopago`,
      success: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success`,
      failure: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/failure`,
    },
  });
}
