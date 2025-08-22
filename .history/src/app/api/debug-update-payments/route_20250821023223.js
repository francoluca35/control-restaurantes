import { NextResponse } from "next/server";
import { db } from "../../../lib/firebase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";

export async function POST(request) {
  try {
    console.log("🔄 Iniciando actualización de pagos existentes...");

    // Obtener todos los pagos de Mercado Pago
    const paymentsRef = collection(db, "paymentTransactions");
    const snapshot = await getDocs(paymentsRef);
    
    let updatedCount = 0;
    let errorCount = 0;

    for (const docSnapshot of snapshot.docs) {
      const paymentData = docSnapshot.data();
      
      // Solo actualizar pagos de Mercado Pago que no tengan el campo es_usd
      if (paymentData.paymentMethod === "mercadopago" && paymentData.es_usd === undefined) {
        try {
          // Determinar si es USD basándose en la moneda
          const isUSD = paymentData.moneda === "USD" || paymentData.currency === "USD";
          
          // Actualizar el documento
          await updateDoc(doc(db, "paymentTransactions", docSnapshot.id), {
            es_usd: isUSD
          });
          
          console.log(`✅ Pago ${docSnapshot.id} actualizado: es_usd = ${isUSD}`);
          updatedCount++;
        } catch (error) {
          console.error(`❌ Error actualizando pago ${docSnapshot.id}:`, error);
          errorCount++;
        }
      }
    }

    console.log(`📊 Actualización completada: ${updatedCount} pagos actualizados, ${errorCount} errores`);

    return NextResponse.json({
      success: true,
      message: `Actualización completada: ${updatedCount} pagos actualizados, ${errorCount} errores`,
      updatedCount,
      errorCount
    });

  } catch (error) {
    console.error("❌ Error en actualización:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
