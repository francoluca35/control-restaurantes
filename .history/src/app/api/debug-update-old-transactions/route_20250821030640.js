import { NextResponse } from "next/server";
import { db } from "../../../lib/firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";

export async function GET(request) {
  try {
    console.log("🔧 Actualizando transacciones antiguas con campo es_usd...");

    // Obtener todas las transacciones
    const paymentsRef = collection(db, "paymentTransactions");
    const paymentsSnapshot = await getDocs(paymentsRef);

    let updatedCount = 0;
    let skippedCount = 0;
    const results = [];

    for (const docSnapshot of paymentsSnapshot.docs) {
      const paymentData = docSnapshot.data();
      const docId = docSnapshot.id;

      // Solo actualizar si NO tiene el campo es_usd
      if (paymentData.es_usd === undefined) {
        // Determinar si es USD basándose en la moneda
        const isUSD =
          paymentData.moneda === "USD" || paymentData.currency === "USD";

        // Actualizar el documento
        await updateDoc(doc(db, "paymentTransactions", docId), {
          es_usd: isUSD,
        });

        updatedCount++;
        results.push({
          id: docId,
          restaurantName: paymentData.restaurantName,
          moneda: paymentData.moneda,
          es_usd: isUSD,
          status: "updated",
        });

        console.log(`✅ Actualizado: ${docId} - es_usd: ${isUSD}`);
      } else {
        skippedCount++;
        results.push({
          id: docId,
          restaurantName: paymentData.restaurantName,
          moneda: paymentData.moneda,
          es_usd: paymentData.es_usd,
          status: "already_updated",
        });
      }
    }

    console.log(
      `📊 Resumen: ${updatedCount} actualizadas, ${skippedCount} ya tenían es_usd`
    );

    return NextResponse.json({
      success: true,
      summary: {
        total: paymentsSnapshot.docs.length,
        updated: updatedCount,
        skipped: skippedCount,
      },
      results: results,
    });
  } catch (error) {
    console.error("❌ Error actualizando transacciones:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
