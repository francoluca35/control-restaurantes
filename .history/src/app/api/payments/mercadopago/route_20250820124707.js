import { NextResponse } from "next/server";
import {
  createPaymentPreference,
  checkPaymentStatus,
} from "../../../../lib/mercadopago";
import { db } from "../../../../lib/firebase";
import {
  doc,
  updateDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

// POST - Crear preferencia de pago
export async function POST(request) {
  try {
    console.log("🚀 POST /api/payments/mercadopago - Iniciando...");

    const { restaurantId, amount, title, externalReference, currency } =
      await request.json();

    console.log("📥 Datos recibidos:", {
      restaurantId,
      amount,
      title,
      externalReference,
      currency,
    });

    if (!restaurantId || !amount) {
      console.log("❌ Datos faltantes:", { restaurantId, amount });
      return NextResponse.json(
        { error: "restaurantId y amount son requeridos" },
        { status: 400 }
      );
    }

    // Para el flujo de activación, no necesitamos buscar el restaurante primero
    // porque se crea después del pago. Usamos el código de activación como referencia.
    console.log(
      "🔍 Creando preferencia para código de activación:",
      restaurantId
    );

    // Crear preferencia de pago
    const paymentData = {
      title: title || "Activación de Restaurante",
      amount: parseFloat(amount),
      currency: currency || "ARS", // Usar moneda especificada o ARS por defecto
      externalReference: externalReference || restaurantId,
      successUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success?restaurantId=${restaurantId}`,
      failureUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/failure?restaurantId=${restaurantId}`,
      pendingUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/pending?restaurantId=${restaurantId}`,
      notificationUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhooks/mercadopago`,
    };

    const preference = await createPaymentPreference(paymentData);

    // No actualizamos el restaurante aquí porque aún no existe
    // Se actualizará cuando se complete el pago y se cree el restaurante
    console.log("✅ Preferencia creada exitosamente:", preference.id);

    return NextResponse.json({
      success: true,
      preference: {
        id: preference.id,
        initPoint: preference.init_point,
        sandboxInitPoint: preference.sandbox_init_point,
      },
    });
  } catch (error) {
    console.error("Error creando preferencia de pago:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// GET - Verificar estado de un pago
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get("paymentId");
    const restaurantId = searchParams.get("restaurantId");

    if (!paymentId) {
      return NextResponse.json(
        { error: "paymentId es requerido" },
        { status: 400 }
      );
    }

    // Verificar estado del pago
    const paymentStatus = await checkPaymentStatus(paymentId);

    // Si el pago fue aprobado y tenemos restaurantId, actualizar el restaurante
    if (paymentStatus.status === "approved" && restaurantId) {
      const restaurantRef = doc(db, "restaurantes", restaurantId);
      const restaurantSnap = await getDoc(restaurantRef);

      if (restaurantSnap.exists()) {
        const restaurantData = restaurantSnap.data();

        await updateDoc(restaurantRef, {
          estadoPago: "pagado",
          fechaPago: new Date().toISOString(),
          ingresosMensuales: restaurantData.precio || 0,
          mercadopagoPaymentId: paymentId,
          mercadopagoPaymentStatus: paymentStatus.status,
          fechaActualizacion: new Date().toISOString(),
        });
      }
    }

    return NextResponse.json({
      success: true,
      paymentStatus,
    });
  } catch (error) {
    console.error("Error verificando estado del pago:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
