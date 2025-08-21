import { NextResponse } from "next/server";
import {
  createPaymentPreference,
  checkPaymentStatus,
} from "../../../../lib/mercadopago";
import { db } from "../../../../lib/firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";

// POST - Crear preferencia de pago
export async function POST(request) {
  try {
    const { restaurantId, amount, title, externalReference, currency } =
      await request.json();

    if (!restaurantId || !amount) {
      return NextResponse.json(
        { error: "restaurantId y amount son requeridos" },
        { status: 400 }
      );
    }

    // Verificar que el restaurante existe
    const restaurantRef = doc(db, "restaurantes", restaurantId);
    const restaurantSnap = await getDoc(restaurantRef);

    if (!restaurantSnap.exists()) {
      return NextResponse.json(
        { error: "Restaurante no encontrado" },
        { status: 404 }
      );
    }

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

    // Actualizar el restaurante con la información del pago (solo si no es de prueba)
    if (!isTestRestaurant) {
      const restaurantRef = doc(db, "restaurantes", restaurantId);
      await updateDoc(restaurantRef, {
        mercadopagoPreferenceId: preference.id,
        mercadopagoInitPoint: preference.init_point,
        mercadopagoSandboxInitPoint: preference.sandbox_init_point,
        fechaActualizacion: new Date().toISOString(),
      });
    }

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
