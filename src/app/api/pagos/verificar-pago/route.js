import { NextResponse } from "next/server";
import mercadopago from "mercadopago";
import { db } from "../../../../../lib/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
} from "firebase/firestore";

export async function POST(request) {
  try {
    const body = await request.json();
    const { paymentId, restaurantId, externalReference } = body;

    if (!paymentId || !restaurantId) {
      return NextResponse.json(
        { error: "paymentId y restaurantId son requeridos" },
        { status: 400 }
      );
    }

    console.log("🔍 Verificando pago:", {
      paymentId,
      restaurantId,
      externalReference,
    });

    // Obtener las credenciales del restaurante
    const restaurantDoc = await getDoc(doc(db, "restaurantes", restaurantId));
    if (!restaurantDoc.exists()) {
      return NextResponse.json(
        { error: "Restaurante no encontrado" },
        { status: 404 }
      );
    }

    const restaurantData = restaurantDoc.data();
    if (!restaurantData?.mercadopago?.accessToken) {
      return NextResponse.json(
        { error: "Restaurante no tiene Mercado Pago configurado" },
        { status: 400 }
      );
    }

    // Configurar Mercado Pago
    mercadopago.configure({
      access_token: restaurantData.mercadopago.accessToken,
    });

    // Obtener información del pago
    const payment = await mercadopago.payment.get(paymentId);
    const paymentData = payment.response;

    console.log("📋 Estado del pago:", paymentData.status);

    // Si el pago está aprobado, liberar la mesa
    if (paymentData.status === "approved") {
      try {
        await liberarMesa(
          restaurantId,
          externalReference,
          paymentData.additional_info
        );

        return NextResponse.json({
          success: true,
          status: "approved",
          message: "Pago aprobado y mesa liberada",
          paymentData: {
            id: paymentData.id,
            status: paymentData.status,
            amount: paymentData.transaction_amount,
            externalReference: paymentData.external_reference,
          },
        });
      } catch (error) {
        console.error("❌ Error liberando mesa:", error);
        return NextResponse.json({
          success: true,
          status: "approved",
          message: "Pago aprobado pero error liberando mesa",
          error: error.message,
        });
      }
    } else {
      return NextResponse.json({
        success: true,
        status: paymentData.status,
        message: `Pago en estado: ${paymentData.status}`,
        paymentData: {
          id: paymentData.id,
          status: paymentData.status,
          amount: paymentData.transaction_amount,
          externalReference: paymentData.external_reference,
        },
      });
    }
  } catch (error) {
    console.error("❌ Error verificando pago:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

async function liberarMesa(restaurantId, externalRef, additionalInfo) {
  try {
    console.log("🔍 Liberando mesa desde verificación:", {
      restaurantId,
      externalRef,
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
    } else if (mesaInfo && mesaInfo.mesa) {
      // Buscar la mesa por número
      console.log("🔍 Buscando mesa por número:", mesaInfo.mesa);

      const tablesRef = collection(db, "restaurantes", restaurantId, "tables");
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
  } catch (error) {
    console.error("❌ Error en liberación de mesa:", error);
    throw error;
  }
}
