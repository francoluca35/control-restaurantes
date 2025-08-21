import { NextResponse } from "next/server";
import mercadopago from "mercadopago";

export async function GET() {
  try {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

    if (!accessToken) {
      return NextResponse.json(
        {
          success: false,
          error: "MERCADOPAGO_ACCESS_TOKEN no configurado",
          configStatus: "missing_token",
        },
        { status: 400 }
      );
    }

    // Verificar que no sea el token de ejemplo
    if (
      accessToken ===
      "APP_USR-3805637089394876-062320-da82ba95333079012f1e0776e1963bba-740803134"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "MERCADOPAGO_ACCESS_TOKEN es un token de ejemplo",
          configStatus: "example_token",
        },
        { status: 400 }
      );
    }

    // Configurar MercadoPago con la nueva API (v2.8.0+)
    mercadopago.setAccessToken(accessToken);

    // Intentar hacer una llamada de prueba a la API de MercadoPago
    try {
      // Crear una preferencia de prueba simple
      const preference = {
        items: [
          {
            title: "Test Item",
            unit_price: 100,
            quantity: 1,
            currency_id: "ARS",
          },
        ],
        back_urls: {
          success: "http://localhost:3000/test-success",
          failure: "http://localhost:3000/test-failure",
        },
        auto_return: "approved",
        expires: true,
        expiration_date_to: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hora
      };

      const response = await mercadopago.preferences.create(preference);

      return NextResponse.json({
        success: true,
        message: "MercadoPago configurado correctamente",
        preferenceId: response.body.id,
        configStatus: "working",
        accessTokenPrefix: accessToken.substring(0, 15) + "...",
      });
    } catch (apiError) {
      console.error("Error en API de MercadoPago:", apiError);

      return NextResponse.json(
        {
          success: false,
          error: "Error al conectar con la API de MercadoPago",
          apiError: apiError.message,
          configStatus: "api_error",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error general:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
        details: error.message,
        configStatus: "server_error",
      },
      { status: 500 }
    );
  }
}
