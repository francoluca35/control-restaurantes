import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Verificar variables de Firebase
    const firebaseVars = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY
        ? "✅ Configurada"
        : "❌ No configurada",
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
        ? "✅ Configurada"
        : "❌ No configurada",
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
        ? "✅ Configurada"
        : "❌ No configurada",
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
        ? "✅ Configurada"
        : "❌ No configurada",
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
        ? "✅ Configurada"
        : "❌ No configurada",
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
        ? "✅ Configurada"
        : "❌ No configurada",
    };

    // Verificar variables de MercadoPago
    const mercadopagoVars = {
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN
        ? "✅ Configurada"
        : "❌ No configurada",
      publicKey: process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY
        ? "✅ Configurada"
        : "❌ No configurada",
    };

    // Verificar valores reales (sin mostrar las claves completas por seguridad)
    const firebaseValues = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY
        ? `${process.env.NEXT_PUBLIC_FIREBASE_API_KEY.substring(0, 10)}...`
        : "No configurada",
      authDomain:
        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "No configurada",
      projectId:
        process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "No configurada",
      storageBucket:
        process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "No configurada",
      messagingSenderId:
        process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ||
        "No configurada",
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "No configurada",
    };

    const mercadopagoValues = {
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN
        ? `${process.env.MERCADOPAGO_ACCESS_TOKEN.substring(0, 15)}...`
        : "No configurada",
      publicKey:
        process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY || "No configurada",
    };

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      firebase: {
        status: firebaseVars,
        values: firebaseValues,
      },
      mercadopago: {
        status: mercadopagoVars,
        values: mercadopagoValues,
      },
      other: {
        baseUrl: process.env.NEXT_PUBLIC_BASE_URL || "No configurada",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
