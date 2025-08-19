import { NextResponse } from "next/server";
import { db } from "../../../../../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export async function GET(request, { params }) {
  try {
    const { id: restaurantId } = await params;

    if (!restaurantId) {
      return NextResponse.json(
        { error: "ID de restaurante requerido" },
        { status: 400 }
      );
    }

    // Obtener la configuración del restaurante
    const restaurantDoc = await getDoc(doc(db, "restaurantes", restaurantId));

    if (!restaurantDoc.exists()) {
      return NextResponse.json(
        { error: "Restaurante no encontrado" },
        { status: 404 }
      );
    }

    const restaurantData = restaurantDoc.data();

    // Solo devolver información pública de Mercado Pago
    if (!restaurantData?.mercadopago) {
      return NextResponse.json({
        isConfigured: false,
        message: "Mercado Pago no configurado",
      });
    }

    const mercadopagoConfig = restaurantData.mercadopago;

    return NextResponse.json({
      isConfigured: true,
      isActive: mercadopagoConfig.isActive || false,
      publicKey: mercadopagoConfig.publicKey,
      accountType: mercadopagoConfig.accountType || "production",
      configuredAt: mercadopagoConfig.configuredAt,
      lastValidated: mercadopagoConfig.lastValidated,
      // NO incluir accessToken ni webhookSecret por seguridad
    });
  } catch (error) {
    console.error("Error obteniendo configuración de Mercado Pago:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
