import { NextResponse } from "next/server";
import { db } from "../../../lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export async function GET(request) {
  try {
    console.log("🔍 Verificando transacciones de pagos...");

    // Obtener todas las transacciones
    const paymentsRef = collection(db, "paymentTransactions");
    const paymentsSnapshot = await getDocs(paymentsRef);
    
    const payments = [];
    
    paymentsSnapshot.docs.forEach((doc) => {
      const paymentData = doc.data();
      payments.push({
        id: doc.id,
        restaurantId: paymentData.restaurantId,
        restaurantName: paymentData.restaurantName,
        paymentId: paymentData.paymentId,
        amount: paymentData.amount,
        paymentMethod: paymentData.paymentMethod,
        moneda: paymentData.moneda,
        currency: paymentData.currency,
        es_usd: paymentData.es_usd,
        status: paymentData.status,
      });
    });

    console.log("📊 Transacciones encontradas:", payments.length);
    console.log("📋 Datos de transacciones:", payments);

    return NextResponse.json({
      success: true,
      total: payments.length,
      payments: payments
    });

  } catch (error) {
    console.error("❌ Error verificando transacciones:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
