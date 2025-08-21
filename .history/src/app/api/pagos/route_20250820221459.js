import { NextResponse } from "next/server";
import mercadopago from "mercadopago";
import { db } from "../../../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export async function POST(request) {
  try {
    console.log("API de pagos: Iniciando procesamiento");

    const body = await request.json();
    console.log("API de pagos: Datos recibidos:", body);

    const { orderData, restaurantId, restaurantName } = body;

    // Validaciones básicas
    if (!orderData || !restaurantId || !restaurantName) {
      console.error("API de pagos: Datos faltantes", {
        orderData,
        restaurantId,
        restaurantName,
      });
      return NextResponse.json(
        { error: "Datos de pedido y restaurante son requeridos" },
        { status: 400 }
      );
    }

    // Obtener las credenciales de Mercado Pago del restaurante
    const restaurantDoc = await getDoc(doc(db, "restaurantes", restaurantId));

    if (!restaurantDoc.exists()) {
      return NextResponse.json(
        { error: "Restaurante no encontrado" },
        { status: 404 }
      );
    }

    const restaurantData = restaurantDoc.data();

    // Validar configuración de Mercado Pago
    if (!restaurantData?.mercadopago?.accessToken) {
      return NextResponse.json(
        {
          error:
            "Restaurante no tiene Mercado Pago configurado. Por favor, configura las credenciales en la sección de configuración.",
        },
        { status: 400 }
      );
    }

    if (!restaurantData.mercadopago.isActive) {
      return NextResponse.json(
        {
          error:
            "Configuración de Mercado Pago inactiva. Por favor, verifica la configuración.",
        },
        { status: 400 }
      );
    }

    // Configurar Mercado Pago con las credenciales del restaurante (v2.8.0+)
    mercadopago.setAccessToken(restaurantData.mercadopago.accessToken);

    // Crear preferencia de pago con información del restaurante
    const preference = {
      items: [
        {
          title: `${restaurantName} - ${
            orderData.title || `Mesa ${orderData.mesa}`
          }`,
          unit_price: orderData.unit_price || orderData.monto,
          quantity: orderData.quantity || 1,
          currency_id: "ARS",
          category_id: "restaurants",
          description: `Pedido de ${restaurantName}`,
        },
      ],
      external_reference: `${restaurantId}_${Date.now()}`,
      back_urls: {
        success: "https://comandas-multiples.vercel.app/pago-confirmado",
        failure: "https://comandas-multiples.vercel.app/pago-confirmado",
        pending: "https://comandas-multiples.vercel.app/pago-confirmado",
      },
      notification_url:
        "https://comandas-multiples.vercel.app/api/pagos/webhook",
      // Información del restaurante para el webhook (debe ser string)
      additional_info: JSON.stringify({
        restaurant_id: restaurantId,
        restaurant_name: restaurantName,
        order_total:
          (orderData.unit_price || orderData.monto) * (orderData.quantity || 1),
        // Información adicional para liberar la mesa
        mesa: orderData.mesa,
        cliente: orderData.cliente,
        productos: orderData.productos,
        mesaId: orderData.mesaId,
      }),
    };

    console.log("API de pagos: Creando preferencia con Mercado Pago");
    const response = await mercadopago.preferences.create(preference);
    console.log("API de pagos: Preferencia creada:", response.response);

    return NextResponse.json({
      preferenceId: response.response.id,
      initPoint: response.response.init_point,
      sandboxInitPoint: response.response.sandbox_init_point,
      externalReference: preference.external_reference,
    });
  } catch (error) {
    console.error("API de pagos: Error creating payment preference:", error);
    return NextResponse.json(
      {
        error: "Error al crear la preferencia de pago",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get("payment_id");
    const restaurantId = searchParams.get("restaurant_id");

    if (!paymentId || !restaurantId) {
      return NextResponse.json(
        { error: "Payment ID and Restaurant ID are required" },
        { status: 400 }
      );
    }

    // Obtener las credenciales del restaurante
    const restaurantDoc = await getDoc(doc(db, "restaurantes", restaurantId));

    if (!restaurantDoc.exists()) {
      return NextResponse.json(
        { error: "Restaurante no encontrado" },
        { status: 404 }
      );
    }

    const restaurantData = restaurantDoc.data();

    if (!restaurantData?.mercadopago?.accessToken) {
      return NextResponse.json(
        { error: "Restaurante no tiene Mercado Pago configurado" },
        { status: 400 }
      );
    }

    if (!restaurantData.mercadopago.isActive) {
      return NextResponse.json(
        { error: "Configuración de Mercado Pago inactiva" },
        { status: 400 }
      );
    }

    // Configurar Mercado Pago con las credenciales del restaurante
    if (typeof mercadopago.configure === "function") {
      mercadopago.configure({
        access_token: restaurantData.mercadopago.accessToken,
      });
    } else {
      // Fallback para versiones más nuevas
      mercadopago.setAccessToken(restaurantData.mercadopago.accessToken);
    }

    const payment = await mercadopago.payment.get(paymentId);

    return NextResponse.json({
      status: payment.response.status,
      status_detail: payment.response.status_detail,
      external_reference: payment.response.external_reference,
      transaction_amount: payment.response.transaction_amount,
      payment_method: payment.response.payment_method,
      date_created: payment.response.date_created,
      // Información del restaurante
      restaurant_id: payment.response.additional_info?.restaurant_id,
      restaurant_name: payment.response.additional_info?.restaurant_name,
    });
  } catch (error) {
    console.error("Error getting payment status:", error);
    return NextResponse.json(
      { error: "Error al obtener el estado del pago" },
      { status: 500 }
    );
  }
}
