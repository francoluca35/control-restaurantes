import { NextResponse } from "next/server";
import { testMercadoPagoConnection, getMercadoPagoInfo } from "../../../lib/mercadopago-config";

// GET - Probar configuración de MercadoPago
export async function GET() {
  try {
    // Obtener información de configuración
    const configInfo = getMercadoPagoInfo();
    
    // Probar conexión
    const connectionTest = await testMercadoPagoConnection();

    return NextResponse.json({
      success: true,
      configInfo,
      connectionTest,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error probando configuración de MercadoPago:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Error interno del servidor",
        details: error.message 
      },
      { status: 500 }
    );
  }
}
