"use client";

import { useState, useEffect, useCallback } from "react";
import { db } from "../../lib/firebase";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  updateDoc,
  setDoc,
} from "firebase/firestore";

export const useRestaurantMonitoring = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [monitoringData, setMonitoringData] = useState({
    totalRestaurants: 0,
    activeRestaurants: 0,
    restaurantsWithIssues: 0,
    criticalIssues: 0,
    warnings: 0,
    lastScan: null,
    scanDuration: 0,
  });
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Detectar problemas comunes
  const detectIssues = useCallback(async (restaurantId, restaurantData) => {
    const restaurantIssues = [];
    const startTime = Date.now();

    try {
      // 1. Verificar estructura básica
      if (!restaurantData.nombre || !restaurantData.estado) {
        restaurantIssues.push({
          type: "critical",
          category: "structure",
          message: "Estructura de datos incompleta",
          details: "Faltan campos obligatorios (nombre, estado)",
        });
      }

      // 2. Verificar usuarios
      const usuariosRef = collection(
        db,
        "restaurantes",
        restaurantId,
        "usuarios"
      );
      const usuariosSnap = await getDocs(usuariosRef);

      if (usuariosSnap.empty) {
        restaurantIssues.push({
          type: "warning",
          category: "users",
          message: "Sin usuarios registrados",
          details: "El restaurante no tiene usuarios activos",
        });
      } else {
        // Verificar usuarios sin actividad reciente
        const usuarios = usuariosSnap.docs.map((doc) => doc.data());
        const inactiveUsers = usuarios.filter((user) => {
          const lastActivity = user.ultimaActividad?.toDate?.() || new Date(0);
          const daysSinceActivity =
            (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24);
          return daysSinceActivity > 30;
        });

        if (inactiveUsers.length > 0) {
          restaurantIssues.push({
            type: "warning",
            category: "users",
            message: `${inactiveUsers.length} usuarios inactivos`,
            details: "Usuarios sin actividad en más de 30 días",
          });
        }
      }

      // 3. Verificar mesas
      const mesasRef = collection(db, "restaurantes", restaurantId, "mesas");
      const mesasSnap = await getDocs(mesasRef);

      if (mesasSnap.empty) {
        restaurantIssues.push({
          type: "warning",
          category: "tables",
          message: "Sin mesas configuradas",
          details: "El restaurante no tiene mesas definidas",
        });
      } else {
        // Verificar mesas con estado inconsistente
        const mesas = mesasSnap.docs.map((doc) => doc.data());
        const inconsistentTables = mesas.filter((mesa) => {
          return (
            mesa.estado === "desconocido" ||
            (mesa.estado === "ocupado" &&
              (!mesa.productos || mesa.productos.length === 0)) ||
            (mesa.estado === "libre" &&
              mesa.productos &&
              mesa.productos.length > 0)
          );
        });

        if (inconsistentTables.length > 0) {
          restaurantIssues.push({
            type: "critical",
            category: "tables",
            message: `${inconsistentTables.length} mesas con estado inconsistente`,
            details: "Mesas con estado 'desconocido' o inconsistente",
          });
        }
      }

      // 4. Verificar productos
      const menuRef = collection(db, "restaurantes", restaurantId, "menus");
      const menuSnap = await getDocs(menuRef);

      if (menuSnap.empty) {
        restaurantIssues.push({
          type: "warning",
          category: "products",
          message: "Sin productos en menú",
          details: "El restaurante no tiene productos configurados",
        });
      }

      // 5. Verificar pedidos recientes (últimas 24h)
      const pedidosRef = collection(
        db,
        "restaurantes",
        restaurantId,
        "pedidos"
      );
      const pedidosQuery = query(
        pedidosRef,
        where("fecha", ">=", new Date(Date.now() - 24 * 60 * 60 * 1000)),
        orderBy("fecha", "desc"),
        limit(10)
      );

      try {
        const pedidosSnap = await getDocs(pedidosQuery);
        const pedidos = pedidosSnap.docs.map((doc) => doc.data());

        // Verificar pedidos sin completar
        const incompleteOrders = pedidos.filter(
          (pedido) =>
            pedido.estado === "pendiente" || pedido.estado === "en_proceso"
        );

        if (incompleteOrders.length > 5) {
          restaurantIssues.push({
            type: "warning",
            category: "orders",
            message: `${incompleteOrders.length} pedidos sin completar`,
            details: "Muchos pedidos pendientes en las últimas 24h",
          });
        }
      } catch (error) {
        // Si hay error al consultar pedidos, puede ser un problema de permisos o estructura
        restaurantIssues.push({
          type: "critical",
          category: "orders",
          message: "Error al consultar pedidos",
          details: "Problema de permisos o estructura de datos",
        });
      }

      // 6. Verificar configuración de pagos
      const pagosRef = doc(
        db,
        "restaurantes",
        restaurantId,
        "configuracion",
        "pagos"
      );
      try {
        const pagosSnap = await getDoc(pagosRef);
        if (!pagosSnap.exists()) {
          restaurantIssues.push({
            type: "warning",
            category: "payments",
            message: "Sin configuración de pagos",
            details: "No hay configuración de métodos de pago",
          });
        }
      } catch (error) {
        restaurantIssues.push({
          type: "warning",
          category: "payments",
          message: "Error en configuración de pagos",
          details: "Problema al acceder a configuración de pagos",
        });
      }

      // 7. Verificar rendimiento (tiempo de respuesta)
      const scanTime = Date.now() - startTime;
      if (scanTime > 5000) {
        restaurantIssues.push({
          type: "critical",
          category: "performance",
          message: "Rendimiento lento",
          details: `Tiempo de escaneo: ${scanTime}ms (más de 5 segundos)`,
        });
      }
    } catch (error) {
      restaurantIssues.push({
        type: "critical",
        category: "system",
        message: "Error de sistema",
        details: `Error al escanear restaurante: ${error.message}`,
      });
    }

    return restaurantIssues;
  }, []);

  // Escanear todos los restaurantes
  const scanAllRestaurants = useCallback(async () => {
    setLoading(true);
    setError(null);
    const startTime = Date.now();

    try {
      console.log("🔍 Iniciando escaneo de restaurantes...");

      const restaurantsRef = collection(db, "restaurantes");
      const restaurantsSnap = await getDocs(restaurantsRef);

      const restaurantsData = [];
      const allIssues = [];
      let activeCount = 0;
      let issuesCount = 0;
      let criticalCount = 0;
      let warningsCount = 0;

      for (const doc of restaurantsSnap.docs) {
        const restaurantData = doc.data();
        const restaurantId = doc.id;

        // Verificar si el restaurante está activo
        const isActive =
          restaurantData.estado === "activo" ||
          restaurantData.estado === "habilitado";
        if (isActive) activeCount++;

        // Detectar problemas
        const restaurantIssues = await detectIssues(
          restaurantId,
          restaurantData
        );

        if (restaurantIssues.length > 0) {
          issuesCount++;
          restaurantIssues.forEach((issue) => {
            if (issue.type === "critical") criticalCount++;
            if (issue.type === "warning") warningsCount++;
          });
        }

        // Agregar datos del restaurante (sin información sensible)
        restaurantsData.push({
          id: restaurantId,
          nombre: restaurantData.nombre || "Sin nombre",
          estado: restaurantData.estado || "desconocido",
          fechaCreacion: restaurantData.fechaCreacion?.toDate?.() || new Date(),
          ultimaActividad:
            restaurantData.ultimaActividad?.toDate?.() || new Date(),
          issues: restaurantIssues,
          hasIssues: restaurantIssues.length > 0,
          criticalIssues: restaurantIssues.filter((i) => i.type === "critical")
            .length,
          warnings: restaurantIssues.filter((i) => i.type === "warning").length,
        });

        allIssues.push(
          ...restaurantIssues.map((issue) => ({
            ...issue,
            restaurantId,
            restaurantName: restaurantData.nombre || "Sin nombre",
          }))
        );
      }

      const scanDuration = Date.now() - startTime;

      setRestaurants(restaurantsData);
      setIssues(allIssues);
      setMonitoringData({
        totalRestaurants: restaurantsSnap.size,
        activeRestaurants: activeCount,
        restaurantsWithIssues: issuesCount,
        criticalIssues: criticalCount,
        warnings: warningsCount,
        lastScan: new Date(),
        scanDuration,
      });

      console.log("✅ Escaneo completado:", {
        total: restaurantsSnap.size,
        active: activeCount,
        withIssues: issuesCount,
        critical: criticalCount,
        warnings: warningsCount,
        duration: scanDuration,
      });
    } catch (error) {
      console.error("❌ Error en escaneo:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [detectIssues]);

  // Escanear restaurante específico
  const scanRestaurant = useCallback(
    async (restaurantId) => {
      try {
        const restaurantRef = doc(db, "restaurantes", restaurantId);
        const restaurantSnap = await getDoc(restaurantRef);

        if (!restaurantSnap.exists()) {
          throw new Error("Restaurante no encontrado");
        }

        const restaurantData = restaurantSnap.data();
        const issues = await detectIssues(restaurantId, restaurantData);

        return {
          id: restaurantId,
          nombre: restaurantData.nombre || "Sin nombre",
          estado: restaurantData.estado || "desconocido",
          issues,
          hasIssues: issues.length > 0,
          criticalIssues: issues.filter((i) => i.type === "critical").length,
          warnings: issues.filter((i) => i.type === "warning").length,
        };
      } catch (error) {
        console.error("Error escaneando restaurante:", error);
        throw error;
      }
    },
    [detectIssues]
  );

  // Obtener estadísticas por categoría
  const getIssuesByCategory = useCallback(() => {
    const categories = {};
    issues.forEach((issue) => {
      if (!categories[issue.category]) {
        categories[issue.category] = { critical: 0, warning: 0 };
      }
      categories[issue.category][issue.type]++;
    });
    return categories;
  }, [issues]);

  // Obtener restaurantes con problemas críticos
  const getCriticalRestaurants = useCallback(() => {
    return restaurants.filter((restaurant) => restaurant.criticalIssues > 0);
  }, [restaurants]);

  // Obtener restaurantes sin problemas
  const getHealthyRestaurants = useCallback(() => {
    return restaurants.filter((restaurant) => restaurant.issues.length === 0);
  }, [restaurants]);

  // Analizar y resolver problemas
  const analyzeAndResolveIssue = useCallback(async (restaurantId, issue) => {
    try {
      console.log(
        `🔧 Analizando problema: ${issue.category} - ${issue.message}`
      );

      switch (issue.category) {
        case "structure":
          return await resolveStructureIssue(restaurantId, issue);
        case "users":
          return await resolveUsersIssue(restaurantId, issue);
        case "tables":
          return await resolveTablesIssue(restaurantId, issue);
        case "products":
          return await resolveProductsIssue(restaurantId, issue);
        case "orders":
          return await resolveOrdersIssue(restaurantId, issue);
        case "payments":
          return await resolvePaymentsIssue(restaurantId, issue);
        case "performance":
          return await resolvePerformanceIssue(restaurantId, issue);
        case "system":
          return await resolveSystemIssue(restaurantId, issue);
        default:
          return {
            success: false,
            message: "Tipo de problema no reconocido",
            solution: "Contactar al administrador del sistema",
          };
      }
    } catch (error) {
      console.error("Error analizando problema:", error);
      return {
        success: false,
        message: "Error al analizar el problema",
        solution: "Verificar permisos y conexión a la base de datos",
      };
    }
  }, []);

  // Resolver problemas de estructura
  const resolveStructureIssue = async (restaurantId, issue) => {
    try {
      const restaurantRef = doc(db, "restaurantes", restaurantId);
      const restaurantSnap = await getDoc(restaurantRef);

      if (!restaurantSnap.exists()) {
        return {
          success: false,
          message: "Restaurante no encontrado",
          solution: "Verificar que el restaurante existe en la base de datos",
        };
      }

      const restaurantData = restaurantSnap.data();
      const updates = {};

      // Verificar y corregir campos obligatorios
      if (!restaurantData.nombre) {
        updates.nombre = "Restaurante " + restaurantId;
      }
      if (!restaurantData.estado) {
        updates.estado = "activo";
      }
      if (!restaurantData.fechaCreacion) {
        updates.fechaCreacion = new Date();
      }

      if (Object.keys(updates).length > 0) {
        await updateDoc(restaurantRef, updates);
        return {
          success: true,
          message: "Estructura de datos corregida",
          solution: `Campos agregados: ${Object.keys(updates).join(", ")}`,
        };
      }

      return {
        success: true,
        message: "Estructura de datos verificada",
        solution: "Todos los campos obligatorios están presentes",
      };
    } catch (error) {
      return {
        success: false,
        message: "Error al corregir estructura",
        solution: "Verificar permisos de escritura en la base de datos",
      };
    }
  };

  // Resolver problemas de usuarios
  const resolveUsersIssue = async (restaurantId, issue) => {
    try {
      const usuariosRef = collection(
        db,
        "restaurantes",
        restaurantId,
        "usuarios"
      );
      const usuariosSnap = await getDocs(usuariosRef);

      if (usuariosSnap.empty) {
        // Crear usuario administrador por defecto
        const defaultUser = {
          usuario: "admin",
          password: "admin123",
          rol: "admin",
          fechaCreacion: new Date(),
          ultimaActividad: new Date(),
          activo: true,
        };

        await addDoc(usuariosRef, defaultUser);
        return {
          success: true,
          message: "Usuario administrador creado",
          solution:
            "Usuario: admin, Contraseña: admin123 (cambiar inmediatamente)",
        };
      }

      // Verificar usuarios inactivos
      const usuarios = usuariosSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      const inactiveUsers = usuarios.filter((user) => {
        const lastActivity = user.ultimaActividad?.toDate?.() || new Date(0);
        const daysSinceActivity =
          (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceActivity > 30;
      });

      if (inactiveUsers.length > 0) {
        return {
          success: false,
          message: `${inactiveUsers.length} usuarios inactivos detectados`,
          solution:
            "Contactar a los usuarios para reactivar sus cuentas o eliminarlas",
        };
      }

      return {
        success: true,
        message: "Usuarios verificados",
        solution: "Todos los usuarios están activos",
      };
    } catch (error) {
      return {
        success: false,
        message: "Error al verificar usuarios",
        solution: "Verificar permisos de acceso a la colección de usuarios",
      };
    }
  };

  // Resolver problemas de mesas
  const resolveTablesIssue = async (restaurantId, issue) => {
    try {
      const mesasRef = collection(db, "restaurantes", restaurantId, "mesas");
      const mesasSnap = await getDocs(mesasRef);

      if (mesasSnap.empty) {
        // Crear mesas por defecto
        const defaultTables = [];
        for (let i = 1; i <= 10; i++) {
          defaultTables.push({
            numero: i.toString().padStart(2, "0"),
            estado: "libre",
            capacidad: 4,
            ubicacion: "salon",
            activa: true,
            fechaCreacion: new Date(),
          });
        }

        for (const mesa of defaultTables) {
          await addDoc(mesasRef, mesa);
        }

        return {
          success: true,
          message: "10 mesas por defecto creadas",
          solution: "Mesas 01-10 configuradas automáticamente",
        };
      }

      // Corregir estados inconsistentes
      const mesas = mesasSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      const inconsistentTables = mesas.filter(
        (mesa) =>
          mesa.estado === "desconocido" ||
          (mesa.estado === "ocupado" &&
            (!mesa.productos || mesa.productos.length === 0)) ||
          (mesa.estado === "libre" &&
            mesa.productos &&
            mesa.productos.length > 0)
      );

      if (inconsistentTables.length > 0) {
        // Corregir estados
        for (const mesa of inconsistentTables) {
          const mesaRef = doc(
            db,
            "restaurantes",
            restaurantId,
            "mesas",
            mesa.id
          );
          let newEstado = "libre";

          if (
            mesa.estado === "ocupado" &&
            (!mesa.productos || mesa.productos.length === 0)
          ) {
            newEstado = "libre";
          } else if (
            mesa.estado === "libre" &&
            mesa.productos &&
            mesa.productos.length > 0
          ) {
            newEstado = "ocupado";
          } else if (mesa.estado === "desconocido") {
            newEstado = "libre";
          }

          await updateDoc(mesaRef, { estado: newEstado });
        }

        return {
          success: true,
          message: `${inconsistentTables.length} estados de mesas corregidos`,
          solution: "Estados de mesas normalizados automáticamente",
        };
      }

      return {
        success: true,
        message: "Mesas verificadas",
        solution: "Todos los estados de mesas son consistentes",
      };
    } catch (error) {
      return {
        success: false,
        message: "Error al corregir mesas",
        solution: "Verificar permisos de escritura en la colección de mesas",
      };
    }
  };

  // Resolver problemas de productos
  const resolveProductsIssue = async (restaurantId, issue) => {
    try {
      const menuRef = collection(db, "restaurantes", restaurantId, "menus");
      const menuSnap = await getDocs(menuRef);

      if (menuSnap.empty) {
        // Crear categorías y productos por defecto
        const defaultCategories = [
          { nombre: "Bebidas", tipo: "bebidas" },
          { nombre: "Comidas", tipo: "comidas" },
        ];

        for (const categoria of defaultCategories) {
          const categoriaRef = await addDoc(menuRef, categoria);

          // Agregar productos por defecto según la categoría
          const productosRef = collection(
            db,
            "restaurantes",
            restaurantId,
            "menus",
            categoriaRef.id,
            "productos"
          );

          if (categoria.tipo === "bebidas") {
            await addDoc(productosRef, {
              nombre: "Agua",
              precio: 2.0,
              descripcion: "Agua mineral",
              activo: true,
            });
          } else {
            await addDoc(productosRef, {
              nombre: "Plato del día",
              precio: 15.0,
              descripcion: "Plato especial del día",
              activo: true,
            });
          }
        }

        return {
          success: true,
          message: "Menú básico creado",
          solution: "Categorías y productos por defecto agregados",
        };
      }

      return {
        success: true,
        message: "Productos verificados",
        solution: "El menú está configurado correctamente",
      };
    } catch (error) {
      return {
        success: false,
        message: "Error al configurar productos",
        solution: "Verificar permisos de escritura en la colección de menús",
      };
    }
  };

  // Resolver problemas de pedidos
  const resolveOrdersIssue = async (restaurantId, issue) => {
    try {
      const pedidosRef = collection(
        db,
        "restaurantes",
        restaurantId,
        "pedidos"
      );
      const pedidosQuery = query(
        pedidosRef,
        where("estado", "in", ["pendiente", "en_proceso"]),
        orderBy("fecha", "desc"),
        limit(20)
      );

      const pedidosSnap = await getDocs(pedidosQuery);
      const incompleteOrders = pedidosSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      if (incompleteOrders.length > 5) {
        return {
          success: false,
          message: `${incompleteOrders.length} pedidos sin completar`,
          solution: "Revisar y completar pedidos pendientes manualmente",
        };
      }

      return {
        success: true,
        message: "Pedidos verificados",
        solution: "Cantidad de pedidos pendientes es normal",
      };
    } catch (error) {
      return {
        success: false,
        message: "Error al verificar pedidos",
        solution: "Verificar permisos de acceso a la colección de pedidos",
      };
    }
  };

  // Resolver problemas de pagos
  const resolvePaymentsIssue = async (restaurantId, issue) => {
    try {
      const pagosRef = doc(
        db,
        "restaurantes",
        restaurantId,
        "configuracion",
        "pagos"
      );
      const pagosSnap = await getDoc(pagosRef);

      if (!pagosSnap.exists()) {
        // Crear configuración de pagos por defecto
        const defaultPaymentConfig = {
          efectivo: true,
          tarjeta: true,
          transferencia: false,
          moneda: "USD",
          iva: 12,
          fechaCreacion: new Date(),
        };

        await setDoc(pagosRef, defaultPaymentConfig);
        return {
          success: true,
          message: "Configuración de pagos creada",
          solution: "Métodos de pago básicos configurados (efectivo y tarjeta)",
        };
      }

      return {
        success: true,
        message: "Configuración de pagos verificada",
        solution: "La configuración de pagos está correcta",
      };
    } catch (error) {
      return {
        success: false,
        message: "Error al configurar pagos",
        solution: "Verificar permisos de escritura en la configuración",
      };
    }
  };

  // Resolver problemas de rendimiento
  const resolvePerformanceIssue = async (restaurantId, issue) => {
    return {
      success: false,
      message: "Problema de rendimiento detectado",
      solution:
        "Optimizar consultas de base de datos y verificar conexión a internet",
    };
  };

  // Resolver problemas de sistema
  const resolveSystemIssue = async (restaurantId, issue) => {
    return {
      success: false,
      message: "Error de sistema detectado",
      solution: "Contactar al administrador del sistema para revisión técnica",
    };
  };

  useEffect(() => {
    // Escanear automáticamente al montar el componente
    scanAllRestaurants();
  }, [scanAllRestaurants]);

  return {
    restaurants,
    monitoringData,
    issues,
    loading,
    error,
    scanAllRestaurants,
    scanRestaurant,
    getIssuesByCategory,
    getCriticalRestaurants,
    getHealthyRestaurants,
    analyzeAndResolveIssue,
    setRestaurants,
  };
};
