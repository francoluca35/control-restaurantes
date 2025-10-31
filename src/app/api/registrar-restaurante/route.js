import { db } from "../../../lib/firebase";
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
    // SOLO se crea el documento básico, SIN usuarios, SIN mesas, SIN nada adicional
    await setDoc(doc(db, "restaurantes", restauranteId), {
      creadoEn: timestamp,
      nombre: restaurante, // Guardar el nombre original
      restauranteId: restauranteId, // Guardar también el ID generado
      activado: false, // Estado inicial: no activado
      email: email,
      codigoActivacion: codActivacion,
    });

    // NO se crean usuarios - el cliente los creará después
    // NO se crean mesas - el cliente las creará después
    // NO se crea caja registradora - el cliente la creará después
    // NO se crea dinero virtual - el cliente lo creará después
    // NO se crea NADA más - todo lo crea el cliente desde cero

    console.log(
      "✅ Restaurante registrado SOLO con datos básicos. El cliente creará usuarios, mesas y configuración después."
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
