import { NextResponse } from "next/server";
import { db } from "../../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const transactionId = searchParams.get('id') || '0bPqHAQQHJtgNvr975fZ';
    
    console.log("🔍 Verificando transacción:", transactionId);

    // Obtener la transacción específica
    const transactionDoc = await getDoc(doc(db, "paymentTransactions", transactionId));
    
    if (!transactionDoc.exists()) {
      return NextResponse.json({
        success: false,
        message: "Transacción no encontrada"
      });
    }

    const transactionData = transactionDoc.data();
    
    console.log("📊 Datos de la transacción:", {
      id: transactionId,
      restaurantId: transactionData.restaurantId,
      paymentId: transactionData.paymentId,
      amount: transactionData.amount,
      paymentMethod: transactionData.paymentMethod,
      moneda: transactionData.moneda,
      currency: transactionData.currency,
      es_usd: transactionData.es_usd,
      status: transactionData.status,
    });

    return NextResponse.json({
      success: true,
      transaction: {
        id: transactionId,
        restaurantId: transactionData.restaurantId,
        paymentId: transactionData.paymentId,
        amount: transactionData.amount,
        paymentMethod: transactionData.paymentMethod,
        moneda: transactionData.moneda,
        currency: transactionData.currency,
        es_usd: transactionData.es_usd,
        status: transactionData.status,
      }
    });

  } catch (error) {
    console.error("❌ Error verificando transacción:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
