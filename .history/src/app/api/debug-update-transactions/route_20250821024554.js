import { NextResponse } from "next/server";
import { db } from "../../../lib/firebase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";

export async function POST(request) {
  try {
    console.log("🔄 Iniciando actualización de transacciones existentes...");

    // Obtener todas las transacciones
    const paymentsRef = collection(db, "paymentTransactions");
    const paymentsSnapshot = await getDocs(paymentsRef);
    
    let updatedCount = 0;
    let errorCount = 0;

    for (const docSnapshot of paymentsSnapshot.docs) {
      const paymentData = docSnapshot.data();
      const transactionId = docSnapshot.id;
      
      // Solo actualizar transacciones que no tengan el campo es_usd
      if (paymentData.es_usd === undefined) {
        try {
          // Determinar si es USD basándose en la información del pago
          let isUSD = false;
          
          if (paymentData.paymentMethod === "mercadopago") {
            // Para pagos de Mercado Pago, usar la moneda del pago
            isUSD = paymentData.moneda === "USD" || paymentData.currency === "USD";
          } else if (paymentData.paymentMethod === "efectivo") {
            // Para pagos en efectivo, usar el ID del pago
            isUSD = paymentData.paymentId && 
                   typeof paymentData.paymentId === "string" && 
                   paymentData.paymentId.toUpperCase().includes("USD");
          }
          
          // Actualizar el documento de la transacción
          await updateDoc(doc(db, "paymentTransactions", transactionId), {
            es_usd: isUSD
          });
          
          console.log(`✅ Transacción ${transactionId} actualizada: es_usd = ${isUSD}`);
          updatedCount++;
        } catch (error) {
          console.error(`❌ Error actualizando transacción ${transactionId}:`, error);
          errorCount++;
        }
      }
    }

    console.log(`📊 Actualización completada: ${updatedCount} transacciones actualizadas, ${errorCount} errores`);

    return NextResponse.json({
      success: true,
      message: `Actualización completada: ${updatedCount} transacciones actualizadas, ${errorCount} errores`,
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
