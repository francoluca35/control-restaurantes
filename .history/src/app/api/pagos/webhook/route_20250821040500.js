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

    // Solo procesar pagos aprobados
    if (paymentData.status !== "approved") {
      console.log(`⚠️ Pago no aprobado, estado: ${paymentData.status}`);
      return NextResponse.json({ status: "ignored" });
    }

    // Extraer información del restaurante
    const activationCode = paymentData.external_reference; // Código de activación
    const orderTotal = paymentData.transaction_amount;

    console.log("🏪 Información del restaurante:", {
      activationCode,
      orderTotal,
    });

    if (!activationCode) {
      console.error(
        "❌ No se encontró código de activación en external_reference"
      );
      return NextResponse.json(
        { error: "Activation code not found in external_reference" },
        { status: 400 }
      );
    }

    // Buscar el restaurante por código de activación
    console.log(
      "🔍 Buscando restaurante por código de activación:",
      activationCode
    );
    const restaurantsRef = collection(db, "restaurantes");
    const q = query(
      restaurantsRef,
      where("codigoActivacion", "==", activationCode)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.error(
        "❌ Restaurante no encontrado con código de activación:",
        activationCode
      );
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

    // Determinar si es USD basándose en la información del pago
    const currency = paymentData.currency_id || "ARS";
    const esUSD = currency === "USD";

    console.log("💰 Información de moneda del pago:", {
      currency_id: paymentData.currency_id,
      currency: currency,
      esUSD: esUSD,
      paymentData: {
        id: paymentData.id,
        amount: paymentData.transaction_amount,
        external_reference: paymentData.external_reference,
      },
    });

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
      // Agregar campo para diferenciar moneda
      es_usd: esUSD,
    });
    console.log(
      "✅ Estado del restaurante actualizado - Notificación debería aparecer"
    );
    console.log("📊 Campo es_usd guardado en restaurante:", {
      restaurantId,
      es_usd: esUSD,
      currency: currency,
    });

    // Registrar la transacción básica
    await recordPaymentTransaction(
      paymentData,
      restaurantId,
      restaurantData.nombre
    );

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function recordPaymentTransaction(
  paymentData,
  restaurantId,
  restaurantName
) {
  try {
    // Determinar la moneda basándose en la información del pago
    const currency = paymentData.currency_id || "ARS";
    const esUSD = currency === "USD";

    // Determinar si es mensual o anual basándose en la descripción o external_reference
    const isAnnual =
      paymentData.external_reference &&
      paymentData.external_reference.toLowerCase().includes("anual");

    // Generar paymentId con formato consistente para pagos virtuales
    const virtualPaymentId = `VIRTUAL${currency === "USD" ? "USD" : "ARS"}_${
      paymentData.id
    }_${Date.now()}`;

    const transaction = {
      restaurantId,
      restaurantName,
      paymentId: virtualPaymentId, // Usar formato consistente
      mercadopagoPaymentId: paymentData.id, // Mantener el ID original de Mercado Pago
      externalReference: paymentData.external_reference,
      amount: paymentData.transaction_amount,
      status: paymentData.status,
      date: new Date(),
      processed: true,
      moneda: currency,
      periodicidad: isAnnual ? "anual" : "mensual",
      paymentMethod: "mercadopago",
      // Campo OBLIGATORIO para diferenciar moneda
      es_usd: esUSD,
    };

    await addDoc(collection(db, "paymentTransactions"), transaction);
    console.log("✅ Transacción registrada exitosamente");
    console.log("📊 Campo de moneda guardado:", {
      es_usd: transaction.es_usd,
      currency: transaction.moneda,
      paymentId: transaction.paymentId,
      restaurantName: transaction.restaurantName,
    });
  } catch (error) {
    console.error("Error recording payment transaction:", error);
  }
}
