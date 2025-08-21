import { NextResponse } from "next/server";
import { db } from "../../../../../../lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

// POST - Confirmar pago simple (solo registro)
export async function POST(request) {
  console.log("🚀 POST /api/pagos/pos-externo/simple iniciado");

  try {
    const body = await request.json();
    console.log("📦 Request body:", body);

    const { restauranteId, mesaId, monto, externalReference } = body;

    // Validar datos requeridos
    if (!restauranteId || !mesaId || !monto) {
      return NextResponse.json(
        { error: "Faltan datos requeridos: restauranteId, mesaId, monto" },
        { status: 400 }
      );
    }

    console.log("✅ Datos válidos, registrando pago simple...");

    // Registrar solo el pago (sin dinero virtual ni liberar mesa)
    const pagoData = {
      restauranteId,
      mesaId,
      monto: parseFloat(monto),
      metodoPago: "tarjeta",
      externalReference: externalReference || `${restauranteId}_${Date.now()}`,
      estado: "approved",
      fechaCreacion: serverTimestamp(),
      fechaActualizacion: serverTimestamp(),
      tipo: "pos_externo_simple",
      additional_info: {
        mesaId,
        mesa: mesaId,
      },
    };

    // Guardar en la colección de pagos
    await setDoc(doc(db, "pagos", pagoData.externalReference), pagoData);

    console.log(`✅ Pago simple registrado: ${pagoData.externalReference}`);

    return NextResponse.json({
      success: true,
      message: "Pago simple registrado exitosamente",
      pago: pagoData,
    });
  } catch (error) {
    console.error("❌ Error en pago simple:", error);
    console.error("❌ Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: error.code,
    });

    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: error.message,
        code: error.code || "UNKNOWN_ERROR",
      },
      { status: 500 }
    );
  }
}
