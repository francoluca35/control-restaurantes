import { NextResponse } from "next/server";
import mercadopago from "mercadopago";
import { db } from "../../../../lib/firebase";
import {
  doc,
  updateDoc,
  collection,
  addDoc,
  getDoc,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";

export async function POST(request) {
  try {
    console.log("🔔 Webhook recibido de Mercado Pago");

    // Verificar la autenticidad del webhook usando la clave secreta
    const signature = request.headers.get("x-signature");
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

    // Obtener información del pago usando las credenciales globales que sabemos que funcionan
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
    const restaurantId = paymentData.external_reference; // Usar external_reference como restaurantId
    const restaurantName =
      paymentData.additional_info?.restaurant_name || "Restaurante";
    const orderTotal = paymentData.transaction_amount;

    console.log("🏪 Información del restaurante:", {
      restaurantId,
      restaurantName,
      orderTotal,
    });

    if (!restaurantId) {
      console.error("❌ No se encontró restaurant ID en external_reference");
      return NextResponse.json(
        { error: "Restaurant ID not found in external_reference" },
        { status: 400 }
      );
    }

    // Obtener datos del restaurante para verificar que existe
    const restaurantDoc = await getDoc(doc(db, "restaurantes", restaurantId));

    if (!restaurantDoc.exists()) {
      console.error("❌ Restaurante no encontrado en Firestore:", restaurantId);
      return NextResponse.json(
        { error: "Restaurant not found in database" },
        { status: 404 }
      );
    }

    const restaurantData = restaurantDoc.data();
    console.log("✅ Restaurante encontrado:", restaurantData.nombre);

    // Procesar el pago según su estado
    console.log("🔄 Procesando pago con estado:", paymentData.status);

    switch (paymentData.status) {
      case "approved":
        await handleApprovedPayment(
          paymentData,
          restaurantId,
          restaurantName,
          orderTotal
        );
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

    // Registrar la transacción en Firestore
    await recordPaymentTransaction(paymentData, restaurantId, restaurantName);

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function handleApprovedPayment(
  paymentData,
  restaurantId,
  restaurantName,
  orderTotal
) {
  try {
    console.log("🔍 Procesando pago aprobado:", {
      paymentId: paymentData.id,
      externalRef: paymentData.external_reference,
      amount: orderTotal,
      additionalInfo: paymentData.additional_info,
    });

    // En este modelo, el restaurante recibe el 100% del pago
    const restaurantAmount = orderTotal;

    // Extraer información del external_reference
    const externalRef = paymentData.external_reference;

    // Intentar liberar la mesa (pero no fallar si no se puede)
    try {
      await liberarMesa(restaurantId, externalRef, paymentData.additional_info);
    } catch (mesaError) {
      console.warn("⚠️ No se pudo liberar la mesa:", mesaError.message);
    }

    // Preparar datos del pedido de forma segura
    let orderData = {
      mesa: "Mesa",
      productos: [
        {
          producto: "Pedido",
          unidades: 1,
          total: orderTotal,
        },
      ],
      monto: orderTotal,
      cliente: "Cliente",
    };

    // Intentar extraer información adicional si está disponible
    if (paymentData.additional_info) {
      try {
        const additionalInfo =
          typeof paymentData.additional_info === "string"
            ? JSON.parse(paymentData.additional_info)
            : paymentData.additional_info;

        orderData = {
          mesa: additionalInfo.mesa || "Mesa",
          productos: additionalInfo.productos || orderData.productos,
          monto: orderTotal,
          cliente: additionalInfo.cliente || "Cliente",
        };
      } catch (parseError) {
        console.warn("⚠️ Error parseando additional_info:", parseError.message);
      }
    }

    // Registrar el pago exitoso
    const paymentRecord = {
      restaurantId,
      restaurantName,
      paymentId: paymentData.id,
      externalReference: externalRef,
      amount: orderTotal,
      restaurantAmount,
      status: "approved",
      paymentMethod: paymentData.payment_method?.type || "unknown",
      date: new Date(),
      transactionId: paymentData.transaction_id,
      mercadopagoAccount: restaurantId,
      isIndividualAccount: true,
      orderData: orderData,
    };

    await addDoc(collection(db, "payments"), paymentRecord);

    // Registrar ingreso automático para MercadoPago
    try {
      await registrarIngresoAutomaticoWebhook(
        restaurantId,
        orderTotal,
        orderData.mesa,
        orderData.cliente,
        externalRef
      );
    } catch (ingresoError) {
      console.warn(
        "⚠️ No se pudo registrar el ingreso automático:",
        ingresoError.message
      );
    }

    console.log(
      `✅ Pago aprobado para restaurante ${restaurantName}: $${restaurantAmount} - Mesa liberada automáticamente`
    );
  } catch (error) {
    console.error("❌ Error procesando pago aprobado:", error);
    // No lanzamos el error para no afectar el webhook
  }
}

async function liberarMesa(restaurantId, externalRef, additionalInfo) {
  try {
    console.log("🔍 Intentando liberar mesa:", {
      restaurantId,
      externalRef,
      additionalInfo,
    });

    // Extraer información de la mesa desde additional_info
    let mesaInfo = null;
    if (additionalInfo) {
      try {
        mesaInfo =
          typeof additionalInfo === "string"
            ? JSON.parse(additionalInfo)
            : additionalInfo;
      } catch (parseError) {
        console.warn("⚠️ Error parseando additional_info:", parseError.message);
      }
    }

    // Si tenemos información específica de la mesa, usarla
    if (mesaInfo && mesaInfo.mesaId) {
      console.log("🎯 Liberando mesa específica:", mesaInfo.mesaId);

      // Actualizar la mesa en Firestore
      const mesaRef = doc(
        db,
        "restaurantes",
        restaurantId,
        "tables",
        mesaInfo.mesaId
      );

      await updateDoc(mesaRef, {
        estado: "libre",
        cliente: "",
        productos: {},
        total: 0,
        fechaPago: new Date(),
        externalReference: externalRef,
        updatedAt: new Date(),
      });

      console.log(`✅ Mesa ${mesaInfo.mesaId} liberada exitosamente`);
    } else {
      // Buscar la mesa por número si no tenemos el ID
      if (mesaInfo && mesaInfo.mesa) {
        console.log("🔍 Buscando mesa por número:", mesaInfo.mesa);

        // Buscar en la colección de mesas del restaurante
        const tablesRef = collection(
          db,
          "restaurantes",
          restaurantId,
          "tables"
        );
        const tablesSnapshot = await getDocs(tablesRef);

        let mesaEncontrada = null;
        tablesSnapshot.forEach((doc) => {
          const mesaData = doc.data();
          if (mesaData.numero == mesaInfo.mesa) {
            mesaEncontrada = { id: doc.id, ...mesaData };
          }
        });

        if (mesaEncontrada) {
          console.log("🎯 Mesa encontrada por número:", mesaEncontrada.id);

          // Actualizar la mesa encontrada
          const mesaRef = doc(
            db,
            "restaurantes",
            restaurantId,
            "tables",
            mesaEncontrada.id
          );

          await updateDoc(mesaRef, {
            estado: "libre",
            cliente: "",
            productos: {},
            total: 0,
            fechaPago: new Date(),
            externalReference: externalRef,
            updatedAt: new Date(),
          });

          console.log(
            `✅ Mesa ${mesaEncontrada.numero} (ID: ${mesaEncontrada.id}) liberada exitosamente`
          );
        } else {
          console.warn("⚠️ No se encontró la mesa por número:", mesaInfo.mesa);
        }
      } else {
        console.warn("⚠️ No hay información suficiente para liberar la mesa");
      }
    }

    // Crear un registro de liberación de mesa para auditoría
    const mesaLiberacionRecord = {
      restaurantId,
      externalReference: externalRef,
      mesaInfo: mesaInfo,
      estado: "pagado",
      fechaLiberacion: new Date(),
      procesado: true,
    };

    await addDoc(collection(db, "mesasLiberadas"), mesaLiberacionRecord);

    console.log(
      `✅ Registro de liberación de mesa creado para restaurante ${restaurantId} con referencia ${externalRef}`
    );
  } catch (error) {
    console.error("❌ Error en liberación de mesa:", error);
    throw error; // Re-lanzamos el error para que el manejador principal lo capture
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
    console.log(
      `Payment rejected for restaurant ${restaurantId}: ${paymentData.status_detail}`
    );
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

async function recordPaymentTransaction(
  paymentData,
  restaurantId,
  restaurantName
) {
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
  } catch (error) {
    console.error("Error recording payment transaction:", error);
  }
}

// Función para registrar ingreso automático desde el webhook
async function registrarIngresoAutomaticoWebhook(
  restaurantId,
  monto,
  mesa,
  cliente,
  externalRef
) {
  try {
    console.log("💰 Registrando ingreso automático desde webhook:", {
      restaurantId,
      monto,
      mesa,
      cliente,
      externalRef,
    });

    // Referencia a la colección Ingresos
    const ingresosRef = collection(
      db,
      "restaurantes",
      restaurantId,
      "Ingresos"
    );

    // Crear el nuevo documento de ingreso
    const nuevoIngreso = {
      tipoIngreso: "Venta Mesa",
      motivo: `Cobranza mesa ${mesa} - ${cliente} (MercadoPago)`,
      monto: monto.toString(),
      formaIngreso: "MercadoPago",
      fecha: new Date(),
      opcionPago: "cuenta_restaurante", // Se suma a dinero virtual
      externalReference: externalRef,
      createdAt: serverTimestamp(),
    };

    // Agregar el documento
    const docRef = await addDoc(ingresosRef, nuevoIngreso);

    console.log(
      "✅ Ingreso registrado automáticamente desde webhook con ID:",
      docRef.id
    );

    // Actualizar dinero virtual
    await actualizarDineroVirtualIngreso(
      restaurantId,
      monto,
      nuevoIngreso.motivo,
      new Date()
    );

    return docRef.id;
  } catch (error) {
    console.error(
      "❌ Error registrando ingreso automático desde webhook:",
      error
    );
    throw error;
  }
}

// Función auxiliar para actualizar el dinero virtual (ingreso)
async function actualizarDineroVirtualIngreso(
  restauranteId,
  monto,
  motivo,
  fecha
) {
  try {
    console.log("💳 Actualizando dinero virtual (ingreso):", {
      restauranteId,
      monto,
      motivo,
    });

    // Obtener el documento de dinero virtual
    const dineroRef = collection(db, "restaurantes", restauranteId, "Dinero");
    const dineroSnapshot = await getDocs(dineroRef);

    if (dineroSnapshot.empty) {
      console.log("⚠️ No hay documentos de dinero virtual disponibles");
      return;
    }

    // Tomar el primer documento de dinero
    const dineroDoc = dineroSnapshot.docs[0];
    const dineroData = dineroDoc.data();

    // Calcular nuevo monto virtual
    const virtualActual = parseFloat(dineroData.Virtual || 0);
    const nuevoVirtual = virtualActual + parseFloat(monto);

    // Preparar datos de ingreso virtual
    const ingresoVirtualData = {
      fecha: new Date(fecha),
      monto: monto.toString(),
      motivo: motivo,
    };

    // Actualizar el documento
    await updateDoc(dineroDoc.ref, {
      Virtual: nuevoVirtual.toString(),
      IngresosVirtual: {
        ...dineroData.IngresosVirtual,
        [new Date().toISOString()]: ingresoVirtualData,
      },
    });

    console.log("✅ Dinero virtual actualizado exitosamente (ingreso)");
  } catch (error) {
    console.error("❌ Error actualizando dinero virtual (ingreso):", error);
    throw error;
  }
}
