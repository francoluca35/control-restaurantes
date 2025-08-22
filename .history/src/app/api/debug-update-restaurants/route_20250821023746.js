import { NextResponse } from "next/server";
import { db } from "../../../lib/firebase";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  query,
  where,
} from "firebase/firestore";

export async function POST(request) {
  try {
    console.log("🔄 Iniciando actualización de restaurantes existentes...");

    // Obtener todos los restaurantes
    const restaurantsRef = collection(db, "restaurantes");
    const restaurantsSnapshot = await getDocs(restaurantsRef);

    // Obtener todas las transacciones de pagos
    const paymentsRef = collection(db, "paymentTransactions");
    const paymentsSnapshot = await getDocs(paymentsRef);

    // Crear un mapa de restaurantes con sus pagos
    const restaurantPayments = new Map();

    paymentsSnapshot.docs.forEach((doc) => {
      const paymentData = doc.data();
      if (paymentData.restaurantId && paymentData.status === "approved") {
        if (!restaurantPayments.has(paymentData.restaurantId)) {
          restaurantPayments.set(paymentData.restaurantId, []);
        }
        restaurantPayments.get(paymentData.restaurantId).push(paymentData);
      }
    });

    let updatedCount = 0;
    let errorCount = 0;

    for (const docSnapshot of restaurantsSnapshot.docs) {
      const restaurantData = docSnapshot.data();
      const restaurantId = docSnapshot.id;

      // Solo actualizar restaurantes que no tengan el campo es_usd
      if (restaurantData.es_usd === undefined) {
        try {
          // Buscar pagos de este restaurante
          const payments = restaurantPayments.get(restaurantId) || [];

          // Determinar si es USD basándose en los pagos
          let isUSD = false;

          for (const payment of payments) {
            if (payment.paymentMethod === "mercadopago") {
              // Para pagos de Mercado Pago, usar la moneda del pago
              if (payment.moneda === "USD" || payment.currency === "USD") {
                isUSD = true;
                break;
              } else if (
                payment.moneda === "ARS" ||
                payment.currency === "ARS"
              ) {
                isUSD = false;
                break;
              }
            } else if (payment.paymentMethod === "efectivo") {
              // Para pagos en efectivo, usar el ID del pago
              if (
                payment.paymentId &&
                payment.paymentId.toUpperCase().includes("USD")
              ) {
                isUSD = true;
                break;
              } else if (
                payment.paymentId &&
                payment.paymentId.toUpperCase().includes("ARS")
              ) {
                isUSD = false;
                break;
              }
            }
          }

          // Actualizar el documento del restaurante
          await updateDoc(doc(db, "restaurantes", restaurantId), {
            es_usd: isUSD,
          });

          console.log(
            `✅ Restaurante ${restaurantId} actualizado: es_usd = ${isUSD}`
          );
          updatedCount++;
        } catch (error) {
          console.error(
            `❌ Error actualizando restaurante ${restaurantId}:`,
            error
          );
          errorCount++;
        }
      }
    }

    console.log(
      `📊 Actualización completada: ${updatedCount} restaurantes actualizados, ${errorCount} errores`
    );

    return NextResponse.json({
      success: true,
      message: `Actualización completada: ${updatedCount} restaurantes actualizados, ${errorCount} errores`,
      updatedCount,
      errorCount,
    });
  } catch (error) {
    console.error("❌ Error en actualización:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
