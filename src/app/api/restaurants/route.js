import { NextResponse } from "next/server";
import { db } from "../../../lib/firebase";
import { collection, addDoc, doc, setDoc } from "firebase/firestore";

// Función helper para generar ID del restaurante
const generarRestauranteId = (nombre) => {
  return nombre
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
};

// FUNCIÓN ELIMINADA COMPLETAMENTE
// NO se crean colecciones iniciales - el cliente creará TODO después
// NO se crean usuarios, mesas, menús, caja, dinero, NADA
// SOLO se crea el documento básico del restaurante

// POST - Crear un nuevo restaurante
export async function POST(request) {
  try {
    const body = await request.json();
    console.log("📥 Datos recibidos en /api/restaurants:", body);

    const {
      nombre,
      nombreCompleto,
      dni,
      email,
      telefono,
      direccion,
      codigoActivacion,
      cantidadUsuarios,
      conFinanzas,
      password,
      logo,
      tipoServicio,
      formaPago,
      periodicidad,
      moneda,
      precio,
      fechaActivacion,
      estadoPago,
      proximoPago,
    } = body;

    // Validar datos requeridos
    if (
      !nombre ||
      !email ||
      !telefono ||
      !direccion ||
      !codigoActivacion ||
      !cantidadUsuarios ||
      !password
    ) {
      return NextResponse.json(
        { error: "Todos los campos son requeridos, incluyendo la contraseña" },
        { status: 400 }
      );
    }

    // Crear el documento del restaurante
    const restauranteData = {
      nombre,
      nombreCompleto: nombreCompleto || "N/A",
      dni: dni || "N/A",
      email,
      telefono,
      direccion,
      codigoActivacion,
      cantidadUsuarios: parseInt(cantidadUsuarios),
      conFinanzas: Boolean(conFinanzas),
      estado: "activo",
      fechaCreacion: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString(),
      // Nuevos campos de pago
      tipoServicio: tipoServicio || "sinFinanzas",
      formaPago: formaPago || "efectivo",
      periodicidad: periodicidad || "mensual",
      moneda: moneda || "USD", // Moneda por defecto
      precio: precio || 0,
      fechaActivacion: fechaActivacion || new Date().toISOString(),
      estadoPago: estadoPago || "pendiente",
      fechaPago: null,
      ingresosMensuales: 0,
      proximoPago: proximoPago || new Date().toISOString(),
      cuotasPagadas: 0,
      cuotasTotales: periodicidad === "anual" ? 1 : 12,
    };

    // Crear un ID único basado en el nombre del restaurante
    const restauranteId = generarRestauranteId(nombre);

    console.log("🏪 Creando restaurante con ID:", restauranteId);
    console.log("📊 Datos del restaurante:", restauranteData);

    // Usar setDoc con el ID personalizado en lugar de addDoc
    await setDoc(doc(db, "restaurantes", restauranteId), restauranteData);

    // NO se crean colecciones iniciales - el cliente creará todo después
    // NO se llama a crearColeccionesIniciales - ELIMINADA COMPLETAMENTE
    
    // NO se crean menús - el cliente los creará después
    // NO se crean subcategorías - el cliente las creará después
    // NO se crean mesas - el cliente las creará después
    // NO se crea NADA - SOLO el documento básico del restaurante

    // Crear documento en codigosactivacion
    await setDoc(doc(db, "codigosactivacion", codigoActivacion), {
      resto: nombre,
      email: email,
      codActivacion: codigoActivacion,
      cantUsuarios: cantidadUsuarios.toString(),
      finanzas: conFinanzas,
      password: password,
      logo: logo || "",
      timestamp: new Date().toISOString(),
    });

    // NO se crean usuarios - el cliente los creará después
    // El único usuario de acceso previo es el que está en codigosactivacion
    // para poder activar el restaurante, pero NO se crea como usuario del sistema

    // Crear documento en paymentTransactions con TODOS los datos del formulario
    const paymentTransactionData = {
      // Datos del restaurante
      restaurantId: restauranteId,
      restaurantName: nombre,
      email: email,
      telefono: telefono,
      direccion: direccion,
      codigoActivacion: codigoActivacion,
      cantidadUsuarios: parseInt(cantidadUsuarios),
      conFinanzas: Boolean(conFinanzas),
      password: password,
      logo: logo || "",

      // Datos del propietario
      nombreCompleto: nombreCompleto || "N/A",
      dni: dni || "N/A",

      // Datos del servicio
      tipoServicio: tipoServicio || "sinFinanzas",
      formaPago: formaPago || "efectivo",
      periodicidad: periodicidad || "mensual",
      moneda: moneda || "USD",

      // Datos del pago
      amount: precio || 0,
      status: estadoPago || "approved", // Los restaurantes nuevos se consideran aprobados
      date: fechaActivacion || new Date(),
      paymentMethod: formaPago || "efectivo",
      currency: moneda || "USD",

      // Datos adicionales
      externalReference: codigoActivacion, // Usar el código de activación como referencia
      processed: true,
      transactionType: "restaurant_activation",

      // Información de contacto
      propietario: nombreCompleto || "Propietario",

      // Timestamps
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log(
      "💰 Guardando transacción de pago con todos los datos:",
      paymentTransactionData
    );

    const paymentDocRef = await addDoc(
      collection(db, "paymentTransactions"),
      paymentTransactionData
    );
    console.log("✅ Documento de pago creado con ID:", paymentDocRef.id);

    return NextResponse.json({
      success: true,
      message:
        "Restaurante creado exitosamente con todas las colecciones iniciales",
      restaurante: {
        id: restauranteId,
        ...restauranteData,
      },
    });
  } catch (error) {
    console.error("Error al crear restaurante:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// GET - Obtener restaurantes
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "Usuario no autenticado" },
        { status: 401 }
      );
    }

    // Aquí podrías implementar la lógica para obtener restaurantes
    // Por ahora retornamos un array vacío
    return NextResponse.json({
      success: true,
      restaurantes: [],
    });
  } catch (error) {
    console.error("Error al obtener restaurantes:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
