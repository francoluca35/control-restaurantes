import { NextResponse } from "next/server";

// GET - Obtener tasa de cambio USD a ARS
export async function GET() {
  try {
    // Usar la API de exchangerate-api.com (gratuita y confiable)
    const response = await fetch(
      "https://api.exchangerate-api.com/v4/latest/USD",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        // Cache por 1 hora para evitar demasiadas llamadas
        next: { revalidate: 3600 },
      }
    );

    if (!response.ok) {
      throw new Error("Error al obtener tasa de cambio");
    }

    const data = await response.json();
    const usdToArs = data.rates.ARS;

    return NextResponse.json({
      success: true,
      rates: {
        USD: 1,
        ARS: usdToArs,
      },
      lastUpdated: data.time_last_updated_utc,
      base: data.base,
    });
  } catch (error) {
    console.error("Error obteniendo tasa de cambio:", error);

    // Fallback con tasa aproximada si la API falla
    return NextResponse.json({
      success: true,
      rates: {
        USD: 1,
        ARS: 850, // Tasa aproximada como fallback
      },
      lastUpdated: new Date().toISOString(),
      base: "USD",
      fallback: true,
    });
  }
}
