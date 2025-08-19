import { db } from "../../../../lib/firebase";
import {
  setDoc,
  doc,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { NextResponse } from "next/server";

// Función helper para generar ID del restaurante
const generarRestauranteId = (nombre) => {
  return nombre
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
};

export async function POST(req) {
  try {
    const {
      restaurante,
      email,
      password,
      codActivacion,
      cantUsuarios,
      finanzas,
    } = await req.json();

    const timestamp = new Date().toISOString();

    // Generar ID del restaurante usando la función helper
    const restauranteId = generarRestauranteId(restaurante);

    console.log("🏪 Creando restaurante con ID:", restauranteId);
    console.log("📝 Nombre original:", restaurante);

    // 1. Guardar en codigosactivacion
    await setDoc(doc(db, "codigosactivacion", codActivacion), {
      codActivacion,
      email,
      password,
      cantUsuarios,
      finanzas,
      resto: restaurante, // Guardar el nombre original
      restauranteId: restauranteId, // Guardar también el ID generado
      timestamp,
    });

    // 2. Crear documento del restaurante usando el ID generado
    await setDoc(doc(db, "restaurantes", restauranteId), {
      creadoEn: timestamp,
      nombre: restaurante, // Guardar el nombre original
      restauranteId: restauranteId, // Guardar también el ID generado
    });

    // 3. Crear subcolección users usando el ID generado
    await setDoc(doc(db, "restaurantes", restauranteId, "users", "admin"), {
      email,
      password,
      usuario: restaurante,
      codActivacion,
    });

    // 4. Crear subcolección tables con un doc por defecto usando el ID generado
    await setDoc(doc(db, "restaurantes", restauranteId, "tables", "default"), {
      mesa: 0,
      estado: "libre",
    });

    // 5. Crear caja registradora inicial usando el ID generado
    const cajaRef = collection(
      db,
      "restaurantes",
      restauranteId,
      "CajaRegistradora"
    );
    await addDoc(cajaRef, {
      Apertura: "0",
      Cierre: "",
      Extraccion: {},
      Ingresos: {},
      ultimaActualizacion: serverTimestamp(),
    });

    // 6. Crear documento de dinero virtual inicial usando el ID generado
    const dineroRef = collection(db, "restaurantes", restauranteId, "Dinero");
    await addDoc(dineroRef, {
      Virtual: "0",
      IngresosVirtual: {},
      EgresosVirtual: {},
      ultimaActualizacion: serverTimestamp(),
    });

    console.log(
      "✅ Restaurante registrado con caja registradora y dinero virtual inicial"
    );

    return NextResponse.json({
      status: "ok",
      restauranteId: restauranteId,
      nombre: restaurante,
    });
  } catch (err) {
    console.error("❌ Error registrando restaurante:", err);
    return NextResponse.json(
      { error: err.message || "Error inesperado" },
      { status: 500 }
    );
  }
}
