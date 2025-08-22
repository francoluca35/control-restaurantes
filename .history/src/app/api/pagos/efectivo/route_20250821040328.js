import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export async function POST(request) {
  try {
    console.log("💰 Endpoint /api/pagos/efectivo llamado");

    const body = await request.json();
    console.log("📦 Body recibido:", body);

    const {
      restaurantId,
      restaurantName,
      amount,
      description,
      moneda,
      periodicidad,
      // Datos adicionales del formulario
      email,
      telefono,
      direccion,
      codigoActivacion,
      cantidadUsuarios,
      conFinanzas,
      password,
      logo,
      tipoServicio,
      formaPago,
    } = body;

    console.log("🔍 Validando datos:");
    console.log("- restaurantId:", restaurantId);
    console.log("- restaurantName:", restaurantName);
    console.log("- amount:", amount);
    console.log("- description:", description);
    console.log("- email:", email);
    console.log("- telefono:", telefono);
    console.log("- direccion:", direccion);
    console.log("- password:", password);
    console.log("- codigoActivacion:", codigoActivacion);

    // Validar datos requeridos
    if (!restaurantId || !restaurantName || !amount) {
      console.error("❌ Faltan datos requeridos");
      return NextResponse.json(
        { error: "Faltan datos requeridos" },
        { status: 400 }
      );
    }

    // Crear documento de pago en efectivo con TODOS los datos del formulario
    const paymentData = {
      // Datos del restaurante
      restaurantId,
      restaurantName,
      email: email || "Email no especificado",
      telefono: telefono || "Teléfono no especificado",
      direccion: direccion || "Dirección no especificada",
      codigoActivacion: codigoActivacion || restaurantId,
      cantidadUsuarios: parseInt(cantidadUsuarios) || 1,
      conFinanzas: Boolean(conFinanzas) || false,
      password: password || "N/A",
      logo: logo || "",

      // Datos del servicio
      tipoServicio: tipoServicio || "sinFinanzas",
      formaPago: formaPago || "efectivo",
      periodicidad: periodicidad || "mensual",
      moneda: moneda || "ARS",

      // Datos del pago
      amount: parseFloat(amount),
      paymentMethod: "efectivo",
      status: "approved", // Los pagos en efectivo se consideran aprobados inmediatamente
      description: description || "Pago en efectivo",
      date: serverTimestamp(),
      paymentId: `CASH${
        moneda === "USD" ? "USD" : "ARS"
      }_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: "cash",
      transactionType: "restaurant_activation",

      // Datos adicionales
      externalReference: codigoActivacion || restaurantId,
      processed: true,

      // Información de contacto
      propietario: "Propietario",

      // Timestamps
      createdAt: new Date(),
      updatedAt: new Date(),
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
      paymentId: paymentData.paymentId,
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
