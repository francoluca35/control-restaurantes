import { NextResponse } from "next/server";
import mercadopago from "mercadopago";

export async function POST(request) {
  try {
    const { accessToken, publicKey, restaurantId } = await request.json();

    // Validaciones básicas
    if (!accessToken || !publicKey || !restaurantId) {
      return NextResponse.json(
        { error: "Faltan credenciales requeridas" },
        { status: 400 }
      );
    }

    // Validar formato de las credenciales
    if (
      !accessToken.startsWith("APP_USR-") &&
      !accessToken.startsWith("TEST-")
    ) {
      return NextResponse.json(
        { error: "Formato de Access Token inválido" },
        { status: 400 }
      );
    }

    if (!publicKey.startsWith("APP_USR-") && !publicKey.startsWith("TEST-")) {
      return NextResponse.json(
        { error: "Formato de Public Key inválido" },
        { status: 400 }
      );
    }

    // Configurar Mercado Pago con las credenciales a validar (v1.5.14)
    mercadopago.configure({
      access_token: accessToken,
    });

    try {
      // Intentar obtener información de la cuenta para validar las credenciales
      // En v1.5.8 usamos el método directo 'get'
      const accountInfo = await mercadopago.get("/users/me");

      // Si llegamos aquí, las credenciales son válidas
      return NextResponse.json({
        isValid: true,
        accountInfo: {
          id: accountInfo.response.id,
          nickname: accountInfo.response.nickname,
          email: accountInfo.response.email,
          accountType: accessToken.startsWith("TEST-")
            ? "sandbox"
            : "production",
        },
        message: "Credenciales válidas",
      });
    } catch (mpError) {
      console.error("Error validando credenciales con Mercado Pago:", mpError);

      // Determinar el tipo de error
      let errorMessage = "Credenciales inválidas";

      if (mpError.status === 401) {
        errorMessage = "Access Token inválido o expirado";
      } else if (mpError.status === 403) {
        errorMessage = "Sin permisos para acceder a la cuenta";
      } else if (mpError.status === 404) {
        errorMessage = "Cuenta no encontrada";
      }

      return NextResponse.json(
        {
          isValid: false,
          error: errorMessage,
          details: mpError.message,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error en validación de credenciales:", error);
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        isValid: false,
      },
      { status: 500 }
    );
  }
}
