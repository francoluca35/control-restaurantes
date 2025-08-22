import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export async function POST(request) {
  try {
    console.log("💰 Endpoint /api/pagos/efectivo llamado");
    
    const body = await request.json();
    console.log("📦 Body recibido:", body);
    
    const { restaurantId, restaurantName, amount, description } = body;

    console.log("🔍 Validando datos:");
    console.log("- restaurantId:", restaurantId);
    console.log("- restaurantName:", restaurantName);
    console.log("- amount:", amount);
    console.log("- description:", description);

    // Validar datos requeridos
    if (!restaurantId || !restaurantName || !amount) {
      console.error("❌ Faltan datos requeridos");
      return NextResponse.json(
        { error: "Faltan datos requeridos" },
        { status: 400 }
      );
    }

    // Crear documento de pago en efectivo
    const paymentData = {
      restaurantId,
      restaurantName,
      amount: parseFloat(amount),
      paymentMethod: "efectivo",
      status: "approved", // Los pagos en efectivo se consideran aprobados inmediatamente
      description: description || "Pago en efectivo",
      date: serverTimestamp(),
      paymentId: `CASH_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`,
      type: "cash",
      transactionType: "restaurant_activation",
    };

    console.log("📝 Datos del pago a guardar:", paymentData);

    // Guardar en la colección paymentTransactions
    console.log("💾 Guardando en Firebase...");
    const paymentRef = await addDoc(
      collection(db, "paymentTransactions"),
      paymentData
    );
    console.log("✅ Documento guardado con ID:", paymentRef.id);

    console.log("💰 Pago en efectivo registrado:", {
      id: paymentRef.id,
      restaurantId,
      amount,
      paymentMethod: "efectivo",
    });

    return NextResponse.json({
      success: true,
      paymentId: paymentRef.id,
      message: "Pago en efectivo registrado exitosamente",
    });
  } catch (error) {
    console.error("❌ Error registrando pago en efectivo:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
