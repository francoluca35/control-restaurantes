import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export async function POST(request) {
  try {
    const body = await request.json();
    const { restaurantId, restaurantName, amount, description } = body;

    // Validar datos requeridos
    if (!restaurantId || !restaurantName || !amount) {
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
      paymentId: `CASH_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: "cash",
      transactionType: "restaurant_activation",
    };

    // Guardar en la colección paymentTransactions
    const paymentRef = await addDoc(collection(db, "paymentTransactions"), paymentData);

    console.log("💰 Pago en efectivo registrado:", {
      id: paymentRef.id,
      restaurantId,
      amount,
      paymentMethod: "efectivo"
    });

    return NextResponse.json({
      success: true,
      paymentId: paymentRef.id,
      message: "Pago en efectivo registrado exitosamente"
    });

  } catch (error) {
    console.error("❌ Error registrando pago en efectivo:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
