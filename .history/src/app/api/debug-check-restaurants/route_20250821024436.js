import { NextResponse } from "next/server";
import { db } from "../../../lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export async function GET(request) {
  try {
    console.log("🔍 Verificando datos de restaurantes...");

    // Obtener todos los restaurantes
    const restaurantsRef = collection(db, "restaurantes");
    const restaurantsSnapshot = await getDocs(restaurantsRef);
    
    const restaurants = [];
    
    restaurantsSnapshot.docs.forEach((doc) => {
      const restaurantData = doc.data();
      restaurants.push({
        id: doc.id,
        nombre: restaurantData.nombre,
        es_usd: restaurantData.es_usd,
        estadoPago: restaurantData.estadoPago,
        ultimoPago: restaurantData.ultimoPago,
      });
    });

    console.log("📊 Restaurantes encontrados:", restaurants.length);
    console.log("📋 Datos de restaurantes:", restaurants);

    return NextResponse.json({
      success: true,
      total: restaurants.length,
      restaurants: restaurants
    });

  } catch (error) {
    console.error("❌ Error verificando restaurantes:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
