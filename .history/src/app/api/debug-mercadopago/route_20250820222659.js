import { NextResponse } from "next/server";
import mercadopago from "mercadopago";

export async function GET() {
  try {
    console.log("🔍 Iniciando debug detallado de MercadoPago...");

    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

    if (!accessToken) {
      return NextResponse.json({
        success: false,
        error: "Token no encontrado",
        step: "token_check",
      });
    }

    console.log("✅ Token encontrado:", accessToken.substring(0, 20) + "...");

    // Paso 1: Configurar MercadoPago
    try {
      mercadopago.configure({
        access_token: accessToken,
      });
      console.log("✅ MercadoPago configurado");
    } catch (configError) {
      return NextResponse.json({
        success: false,
        error: "Error configurando MercadoPago",
        details: configError.message,
        step: "configuration",
      });
    }

    // Paso 2: Probar conexión básica
    try {
      console.log("🔍 Probando conexión básica...");
      const accountInfo = await mercadopago.get("/users/me");
      console.log("✅ Conexión básica exitosa");
    } catch (connectionError) {
      return NextResponse.json({
        success: false,
        error: "Error en conexión básica",
        details: connectionError.message,
        status: connectionError.status,
        step: "basic_connection",
      });
    }

    // Paso 3: Crear preferencia de prueba
    try {
      console.log("🔍 Creando preferencia de prueba...");
      const preference = {
        items: [
          {
            title: "Test Payment",
            unit_price: 100,
            quantity: 1,
            currency_id: "ARS",
          },
        ],
        back_urls: {
          success: "http://localhost:3001/test-success",
          failure: "http://localhost:3001/test-failure",
        },
        auto_return: "approved",
        expires: true,
        expiration_date_to:
          new Date(Date.now() + 60 * 60 * 1000).toISOString().split(".")[0] +
          "Z",
      };

      const response = await mercadopago.preferences.create(preference);
      console.log("✅ Preferencia creada exitosamente");

      return NextResponse.json({
        success: true,
        message: "MercadoPago funciona correctamente",
        preferenceId: response.body.id,
        initPoint: response.body.init_point,
        sandboxInitPoint: response.body.sandbox_init_point,
        step: "preference_creation",
      });
    } catch (preferenceError) {
      console.error("❌ Error creando preferencia:", preferenceError);

      return NextResponse.json({
        success: false,
        error: "Error creando preferencia de pago",
        details: preferenceError.message,
        status: preferenceError.status,
        step: "preference_creation",
      });
    }
  } catch (error) {
    console.error("❌ Error general:", error);

    return NextResponse.json({
      success: false,
      error: "Error interno del servidor",
      details: error.message,
      step: "general_error",
    });
  }
}
