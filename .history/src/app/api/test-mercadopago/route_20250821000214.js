import { NextResponse } from "next/server";
import mercadopago from "mercadopago";

export async function GET() {
  try {
    console.log("🧪 Probando configuración de Mercado Pago...");

    // Verificar que tenemos el access token
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

    if (!accessToken) {
      console.error("❌ MERCADOPAGO_ACCESS_TOKEN no está configurado");
      return NextResponse.json(
        {
          success: false,
          error: "MERCADOPAGO_ACCESS_TOKEN no está configurado",
          hasToken: false,
        },
        { status: 500 }
      );
    }

    console.log(
      "✅ Access token encontrado:",
      accessToken.substring(0, 10) + "..."
    );

    // Configurar Mercado Pago
    mercadopago.configure({
      access_token: accessToken,
    });

    console.log("✅ Mercado Pago configurado correctamente");

    // Intentar hacer una consulta simple para verificar la conexión
    try {
      // Intentar obtener información de la cuenta
      const accountInfo = await mercadopago.users.get();
      console.log("✅ Conexión exitosa con Mercado Pago");

      return NextResponse.json({
        success: true,
        message: "Mercado Pago configurado correctamente",
        hasToken: true,
        tokenPrefix: accessToken.substring(0, 10),
        accountInfo: accountInfo.body,
      });
    } catch (mpError) {
      console.error("❌ Error conectando con Mercado Pago:", mpError);
      return NextResponse.json(
        {
          success: false,
          error: "Error conectando con Mercado Pago",
          hasToken: true,
          tokenPrefix: accessToken.substring(0, 10),
          mpError: mpError.message,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("❌ Error en test de Mercado Pago:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
