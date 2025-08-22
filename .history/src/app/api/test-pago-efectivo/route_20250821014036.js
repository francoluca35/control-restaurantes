import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export async function POST(request) {
  try {
    console.log("🧪 Endpoint de prueba /api/test-pago-efectivo llamado");
    
    const body = await request.json();
    console.log("📦 Body recibido:", body);
    
    const { restaurantId, restaurantName, amount, description } = body;

    // Crear documento de pago en efectivo de prueba
    const paymentData = {
      restaurantId: restaurantId || "test_restaurant",
      restaurantName: restaurantName || "Restaurante de Prueba",
      amount: parseFloat(amount) || 100,
      paymentMethod: "efectivo",
      status: "approved",
      description: description || "Pago de prueba en efectivo",
      date: serverTimestamp(),
      paymentId: `TEST_CASH_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: "cash",
      transactionType: "test",
    };

    console.log("📝 Datos del pago de prueba:", paymentData);

    // Guardar en la colección paymentTransactions
    console.log("💾 Guardando en Firebase...");
    const paymentRef = await addDoc(collection(db, "paymentTransactions"), paymentData);
    console.log("✅ Documento de prueba guardado con ID:", paymentRef.id);

    return NextResponse.json({
      success: true,
      paymentId: paymentRef.id,
      message: "Pago de prueba en efectivo registrado exitosamente",
      data: paymentData
    });

  } catch (error) {
    console.error("❌ Error en pago de prueba:", error);
    return NextResponse.json(
      { error: "Error interno del servidor", details: error.message },
      { status: 500 }
    );
  }
}
