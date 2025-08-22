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

// Función para crear todas las colecciones iniciales del restaurante
const crearColeccionesIniciales = async (restauranteId) => {
  const timestamp = new Date().toISOString();

  console.log(
    "📁 Creando colecciones iniciales para restaurante:",
    restauranteId
  );

  // 1. CajaRegistradora - Documento inicial de caja
  await setDoc(
    doc(
      db,
      "restaurantes",
      restauranteId,
      "CajaRegistradora",
      "caja_principal"
    ),
    {
      nombre: "Caja Principal",
      saldo: 0,
      estado: "activa",
      fechaCreacion: timestamp,
      fechaActualizacion: timestamp,
    }
  );

  // 2. Dinero - Documento inicial de dinero
  await setDoc(
    doc(db, "restaurantes", restauranteId, "Dinero", "dinero_actual"),
    {
      monto: 0,
      moneda: "ARS",
      fechaCreacion: timestamp,
      fechaActualizacion: timestamp,
    }
  );

  // 3. Ingresos - Colección vacía (se llenará con transacciones)
  await setDoc(doc(db, "restaurantes", restauranteId, "Ingresos", "inicial"), {
    tipo: "inicial",
    monto: 0,
    descripcion: "Inicialización del sistema",
    fechaCreacion: timestamp,
  });

  // 4. Mpagos - Colección para pagos de MercadoPago
  await setDoc(
    doc(db, "restaurantes", restauranteId, "Mpagos", "configuracion"),
    {
      activo: false,
      accessToken: "",
      publicKey: "",
      fechaCreacion: timestamp,
      fechaActualizacion: timestamp,
    }
  );

  // 5. ServiciosComercio - Documento inicial de servicios
  await setDoc(
    doc(
      db,
      "restaurantes",
      restauranteId,
      "ServiciosComercio",
      "servicios_basicos"
    ),
    {
      nombre: "Servicios Básicos",
      servicios: [
        { nombre: "WiFi", activo: true, precio: 0 },
        { nombre: "Estacionamiento", activo: false, precio: 0 },
        { nombre: "Delivery", activo: true, precio: 0 },
      ],
      fechaCreacion: timestamp,
    }
  );

  // 6. SueldoEmpleados - Colección para empleados
  await setDoc(
    doc(db, "restaurantes", restauranteId, "SueldoEmpleados", "empleado_admin"),
    {
      nombre: "Administrador",
      sueldo: 0,
      fechaContratacion: timestamp,
      activo: true,
      fechaCreacion: timestamp,
    }
  );

  // 7. bebidas - Colección para bebidas
  await setDoc(
    doc(db, "restaurantes", restauranteId, "bebidas", "bebida_ejemplo"),
    {
      nombre: "Agua",
      precio: 500,
      categoria: "Sin Alcohol",
      stock: 100,
      activo: true,
      fechaCreacion: timestamp,
    }
  );

  // 8. mensajes - Colección para mensajes del sistema
  await setDoc(
    doc(db, "restaurantes", restauranteId, "mensajes", "bienvenida"),
    {
      titulo: "Bienvenido al Sistema",
      contenido: "Tu restaurante ha sido configurado exitosamente",
      tipo: "sistema",
      leido: false,
      fechaCreacion: timestamp,
    }
  );

  // 9. menus - Ya existe, pero agregamos más categorías
  await setDoc(doc(db, "restaurantes", restauranteId, "menus", "postres"), {
    nombre: "Postres",
    activo: true,
    fechaCreacion: timestamp,
  });

  await setDoc(doc(db, "restaurantes", restauranteId, "menus", "adicionales"), {
    nombre: "Adicionales",
    activo: true,
    fechaCreacion: timestamp,
  });

  // 10. pedidosCocina - Colección para pedidos de cocina
  await setDoc(
    doc(db, "restaurantes", restauranteId, "pedidosCocina", "configuracion"),
    {
      activo: true,
      notificaciones: true,
      fechaCreacion: timestamp,
    }
  );

  // 11. stock - Colección para inventario
  await setDoc(
    doc(db, "restaurantes", restauranteId, "stock", "producto_ejemplo"),
    {
      nombre: "Producto Ejemplo",
      cantidad: 0,
      unidad: "unidad",
      minimo: 10,
      activo: true,
      fechaCreacion: timestamp,
    }
  );

  // 12. tables - Ya existe, pero agregamos más mesas
  for (let i = 3; i <= 10; i++) {
    await setDoc(doc(db, "restaurantes", restauranteId, "tables", `mesa${i}`), {
      numero: i,
      estado: "libre",
      cliente: "",
      productos: [],
      total: 0,
      fechaCreacion: timestamp,
    });
  }

  // 13. users - Colección para usuarios del restaurante
  await setDoc(doc(db, "restaurantes", restauranteId, "users", "admin"), {
    email: "",
    rol: "admin",
    activo: true,
    fechaCreacion: timestamp,
  });

  // 14. usuarios - Colección adicional para usuarios
  await setDoc(
    doc(db, "restaurantes", restauranteId, "usuarios", "usuario_admin"),
    {
      nombre: "Administrador",
      email: "",
      rol: "admin",
      activo: true,
      fechaCreacion: timestamp,
    }
  );

  console.log("✅ Todas las colecciones creadas exitosamente");
};

// POST - Crear un nuevo restaurante
export async function POST(request) {
  try {
    const body = await request.json();
    console.log("📥 Datos recibidos en /api/restaurants:", body);
    
    const {
      nombre,
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

    // Crear todas las colecciones iniciales
    await crearColeccionesIniciales(restauranteId);

    // Crear la estructura inicial del restaurante en Firestore
    // (ya no necesitamos docRef.id porque usamos restauranteId)

    // Crear la estructura de menús
    await setDoc(doc(db, "restaurantes", restauranteId, "menus", "comida"), {
      nombre: "Comida",
      activo: true,
      fechaCreacion: new Date().toISOString(),
    });

    await setDoc(doc(db, "restaurantes", restauranteId, "menus", "bebidas"), {
      nombre: "Bebidas",
      activo: true,
      fechaCreacion: new Date().toISOString(),
    });

    // Crear subcategorías iniciales para comida
    await setDoc(
      doc(
        db,
        "restaurantes",
        restauranteId,
        "menus",
        "comida",
        "subcategorias",
        "platos_principales"
      ),
      {
        nombre: "Platos Principales",
        activo: true,
        fechaCreacion: new Date().toISOString(),
      }
    );

    await setDoc(
      doc(
        db,
        "restaurantes",
        restauranteId,
        "menus",
        "comida",
        "subcategorias",
        "entradas"
      ),
      {
        nombre: "Entradas",
        activo: true,
        fechaCreacion: new Date().toISOString(),
      }
    );

    await setDoc(
      doc(
        db,
        "restaurantes",
        restauranteId,
        "menus",
        "comida",
        "subcategorias",
        "postres"
      ),
      {
        nombre: "Postres",
        activo: true,
        fechaCreacion: new Date().toISOString(),
      }
    );

    // Crear subcategorías iniciales para bebidas
    await setDoc(
      doc(
        db,
        "restaurantes",
        restauranteId,
        "menus",
        "bebidas",
        "subcategorias",
        "con_alcohol"
      ),
      {
        nombre: "Con Alcohol",
        activo: true,
        fechaCreacion: new Date().toISOString(),
      }
    );

    await setDoc(
      doc(
        db,
        "restaurantes",
        restauranteId,
        "menus",
        "bebidas",
        "subcategorias",
        "sin_alcohol"
      ),
      {
        nombre: "Sin Alcohol",
        activo: true,
        fechaCreacion: new Date().toISOString(),
      }
    );

    // Crear colección de mesas
    await setDoc(doc(db, "restaurantes", restauranteId, "tables", "mesa1"), {
      numero: 1,
      estado: "libre",
      cliente: "",
      productos: [],
      total: 0,
      fechaCreacion: new Date().toISOString(),
    });

    await setDoc(doc(db, "restaurantes", restauranteId, "tables", "mesa2"), {
      numero: 2,
      estado: "libre",
      cliente: "",
      productos: [],
      total: 0,
      fechaCreacion: new Date().toISOString(),
    });

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

    // Crear colección de usuarios
    await setDoc(doc(db, "usuarios", email), {
      email,
      rol: "admin",
      restauranteId,
      activo: true,
      fechaCreacion: new Date().toISOString(),
    });

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
      propietario: "Propietario", // Se puede agregar al formulario si es necesario

      // Timestamps
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log(
      "💰 Guardando transacción de pago con todos los datos:",
      paymentTransactionData
    );

    const paymentDocRef = await addDoc(collection(db, "paymentTransactions"), paymentTransactionData);
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
