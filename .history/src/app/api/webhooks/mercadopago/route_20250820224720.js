import { NextResponse } from "next/server";
import { processPaymentNotification } from "../../../../lib/mercadopago";
import { db } from "../../../../lib/firebase";
import { doc, updateDoc, getDoc, setDoc } from "firebase/firestore";

// POST - Recibir notificación de Mercado Pago
export async function POST(request) {
  try {
    const notificationData = await request.json();

    console.log("📨 Notificación recibida de Mercado Pago:", notificationData);

    // Procesar la notificación
    const payment = await processPaymentNotification(notificationData);

    if (!payment) {
      console.log("⚠️ No se pudo procesar la notificación");
      return NextResponse.json({
        success: false,
        message: "Notificación no procesada",
      });
    }

    console.log("💳 Información del pago:", {
      id: payment.id,
      status: payment.status,
      external_reference: payment.external_reference,
      amount: payment.transaction_amount,
    });

    // Si el pago fue aprobado, actualizar el restaurante
    if (payment.status === "approved" && payment.external_reference) {
      const restaurantId = payment.external_reference;
      const restaurantRef = doc(db, "restaurantes", restaurantId);
      const restaurantSnap = await getDoc(restaurantRef);

      if (restaurantSnap.exists()) {
        const restaurantData = restaurantSnap.data();

        await updateDoc(restaurantRef, {
          estadoPago: "pagado",
          fechaPago: new Date().toISOString(),
          ingresosMensuales: restaurantData.precio || 0,
          mercadopagoPaymentId: payment.id,
          mercadopagoPaymentStatus: payment.status,
          mercadopagoPaymentMethod: payment.payment_method?.type || "unknown",
          mercadopagoPaymentType: payment.payment_type_id || "unknown",
          fechaActualizacion: new Date().toISOString(),
          // Activar el restaurante automáticamente
          estado: "activo",
          fechaActivacion: new Date().toISOString(),
          activo: true,
        });

        console.log(
          "✅ Restaurante actualizado con pago aprobado:",
          restaurantId
        );

        // Crear notificación en Firestore para el sistema en tiempo real
        try {
          const notificationRef = doc(db, "notificaciones", Date.now().toString());
          await setDoc(notificationRef, {
            type: "payment",
            title: `Pago recibido - ${restaurantData.nombre}`,
            message: `Se acreditó el pago de $${restaurantData.precio} ${restaurantData.moneda}`,
            restaurantId: restaurantId,
            restaurantName: restaurantData.nombre,
            amount: restaurantData.precio,
            currency: restaurantData.moneda,
            paymentId: payment.id,
            timestamp: new Date().toISOString(),
            read: false,
          });
          console.log("📨 Notificación creada en Firestore");
        } catch (notificationError) {
          console.error("Error creando notificación:", notificationError);
        }
      } else {
        console.warn("⚠️ Restaurante no encontrado:", restaurantId);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Notificación procesada correctamente",
      paymentId: payment.id,
      status: payment.status,
    });
  } catch (error) {
    console.error("❌ Error procesando notificación de Mercado Pago:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// GET - Verificar que el webhook está funcionando
export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Webhook de Mercado Pago funcionando correctamente",
  });
}
