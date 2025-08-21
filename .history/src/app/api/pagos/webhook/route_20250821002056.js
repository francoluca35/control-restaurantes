import { NextResponse } from "next/server";
import mercadopago from "mercadopago";
import { db } from "../../../../lib/firebase";
import {
  doc,
  updateDoc,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";

export async function POST(request) {
  try {
    console.log("🔔 Webhook recibido de Mercado Pago");

    const body = await request.json();

    // Verificar que tenemos datos básicos del webhook
    if (!body || !body.type) {
      console.log("❌ Webhook inválido: datos faltantes");
      return NextResponse.json(
        { error: "Invalid webhook data" },
        { status: 400 }
      );
    }

    console.log("📋 Datos del webhook:", body);

    // Verificar que es una notificación de Mercado Pago
    if (body.type !== "payment") {
      console.log("❌ Tipo de notificación ignorado:", body.type);
      return NextResponse.json({ status: "ignored" });
    }

    const paymentId = body.data.id;
    console.log("🆔 ID de pago recibido:", paymentId);

    // Obtener información del pago usando las credenciales globales
    mercadopago.configure({
      access_token: process.env.MERCADOPAGO_ACCESS_TOKEN,
    });

    console.log("🔧 Configurando Mercado Pago con credenciales globales");

    const payment = await mercadopago.payment.get(paymentId);
    const paymentData = payment.response;

    console.log("📊 Datos del pago obtenidos:", {
      id: paymentData.id,
      status: paymentData.status,
      external_reference: paymentData.external_reference,
      amount: paymentData.transaction_amount,
    });

    // Extraer información del restaurante
    const activationCode = paymentData.external_reference; // Código de activación
    const orderTotal = paymentData.transaction_amount;

    console.log("🏪 Información del restaurante:", {
      activationCode,
      orderTotal,
    });

    if (!activationCode) {
      console.error("❌ No se encontró código de activación en external_reference");
      return NextResponse.json(
        { error: "Activation code not found in external_reference" },
        { status: 400 }
      );
    }

    // Buscar el restaurante por código de activación
    console.log("🔍 Buscando restaurante por código de activación:", activationCode);
    const restaurantsRef = collection(db, "restaurantes");
    const q = query(restaurantsRef, where("codigoActivacion", "==", activationCode));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.error("❌ Restaurante no encontrado con código de activación:", activationCode);
      return NextResponse.json(
        { error: "Restaurant not found with activation code" },
        { status: 404 }
      );
    }

    // Tomar el primer restaurante encontrado
    const restaurantDoc = querySnapshot.docs[0];
    const restaurantId = restaurantDoc.id;
    const restaurantData = restaurantDoc.data();

    console.log("✅ Restaurante encontrado:", restaurantData.nombre);

    // Procesar el pago según su estado
    console.log("🔄 Procesando pago con estado:", paymentData.status);

    switch (paymentData.status) {
      case "approved":
        // ACTUALIZAR EL ESTADO DEL RESTAURANTE PARA TRIGGER NOTIFICACIÓN
        console.log("🔄 Actualizando estado del restaurante para notificación...");
        await updateDoc(doc(db, "restaurantes", restaurantId), {
          estadoPago: "pagado",
          fechaPago: serverTimestamp(),
          ultimoPago: {
            monto: orderTotal,
            fecha: serverTimestamp(),
            paymentId: paymentData.id,
            externalReference: paymentData.external_reference,
          },
        });
        console.log("✅ Estado del restaurante actualizado - Notificación debería aparecer");

        // Registrar la transacción en Firestore
        await recordPaymentTransaction(paymentData, restaurantId, restaurantData.nombre);
        break;

      case "rejected":
        await handleRejectedPayment(paymentData, restaurantId);
        break;

      case "pending":
        await handlePendingPayment(paymentData, restaurantId);
        break;

      case "cancelled":
        await handleCancelledPayment(paymentData, restaurantId);
        break;

      default:
        console.log(`⚠️ Estado de pago no manejado: ${paymentData.status}`);
    }

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function handleRejectedPayment(paymentData, restaurantId) {
  try {
    const paymentRecord = {
      restaurantId,
      paymentId: paymentData.id,
      externalReference: paymentData.external_reference,
      status: "rejected",
      reason: paymentData.status_detail,
      date: new Date(),
      isIndividualAccount: true,
    };

    await addDoc(collection(db, "payments"), paymentRecord);
    console.log(`Payment rejected for restaurant ${restaurantId}: ${paymentData.status_detail}`);
  } catch (error) {
    console.error("Error handling rejected payment:", error);
  }
}

async function handlePendingPayment(paymentData, restaurantId) {
  try {
    const paymentRecord = {
      restaurantId,
      paymentId: paymentData.id,
      externalReference: paymentData.external_reference,
      status: "pending",
      date: new Date(),
      isIndividualAccount: true,
    };

    await addDoc(collection(db, "payments"), paymentRecord);
    console.log(`Payment pending for restaurant ${restaurantId}`);
  } catch (error) {
    console.error("Error handling pending payment:", error);
  }
}

async function handleCancelledPayment(paymentData, restaurantId) {
  try {
    const paymentRecord = {
      restaurantId,
      paymentId: paymentData.id,
      externalReference: paymentData.external_reference,
      status: "cancelled",
      date: new Date(),
      isIndividualAccount: true,
    };

    await addDoc(collection(db, "payments"), paymentRecord);
    console.log(`Payment cancelled for restaurant ${restaurantId}`);
  } catch (error) {
    console.error("Error handling cancelled payment:", error);
  }
}

async function recordPaymentTransaction(paymentData, restaurantId, restaurantName) {
  try {
    const transaction = {
      restaurantId,
      restaurantName,
      paymentId: paymentData.id,
      externalReference: paymentData.external_reference,
      amount: paymentData.transaction_amount,
      status: paymentData.status,
      statusDetail: paymentData.status_detail,
      paymentMethod: paymentData.payment_method?.type || "unknown",
      date: new Date(),
      processed: true,
      isIndividualAccount: true,
    };

    await addDoc(collection(db, "paymentTransactions"), transaction);
    console.log("✅ Transacción registrada exitosamente");
  } catch (error) {
    console.error("Error recording payment transaction:", error);
  }
}
