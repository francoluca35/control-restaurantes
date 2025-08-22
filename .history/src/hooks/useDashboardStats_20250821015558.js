import { useState, useEffect, useCallback } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

// Función para obtener tasas de cambio
const getExchangeRates = async () => {
  try {
    const response = await fetch("/api/exchange-rates");
    if (response.ok) {
      const data = await response.json();
      return data.rates;
    }
  } catch (error) {
    console.error("Error obteniendo tasas de cambio:", error);
  }
  // Fallback a tasa fija si falla la API
  return { USD: 1, ARS: 850 };
};

export const useDashboardStats = () => {
  const [stats, setStats] = useState({
    restaurantesActivos: 0,
    pagosTotales: 0,
    alertasTotales: 0,
    localesNuevosEsteMes: 0,
    ingresosAnuales: {
      USD: 0,
      ARS: 0,
    },
    ingresosMensuales: {
      USD: 0,
      ARS: 0,
    },
    crecimientoAnual: {
      ganancias: 0,
      perdidas: 0,
      localesTotales: 0,
      gananciaMensualUSD: 0,
      gananciaAnualUSD: 0,
      gananciaMensualARS: 0,
      gananciaAnualARS: 0,
      netoPesos: 0,
      netoDolares: 0,
    },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para obtener el primer día del mes actual
  const getFirstDayOfMonth = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  };

  // Función para obtener el primer día del año actual
  const getFirstDayOfYear = () => {
    const now = new Date();
    return new Date(now.getFullYear(), 0, 1);
  };

  // Cargar estadísticas del dashboard
  const loadDashboardStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Verificar si Firebase está disponible
      if (!db) {
        console.warn("Firebase no está disponible, usando datos de ejemplo");
        // Usar datos de ejemplo si Firebase no está disponible
        setStats({
          restaurantesActivos: 3,
          pagosTotales: 579.97,
          localesNuevosEsteMes: 2,
          crecimientoAnual: {
            ganancias: 6959.64,
            perdidas: 579.97,
            localesTotales: 3,
            ingresosMensuales: 579.97,
          },
        });
        setLoading(false);
        return;
      }

      // Obtener todos los restaurantes
      const restaurantsRef = collection(db, "restaurantes");
      const restaurantsSnapshot = await getDocs(restaurantsRef);

      // Obtener todas las transacciones de pagos
      const paymentsRef = collection(db, "paymentTransactions");
      const paymentsSnapshot = await getDocs(paymentsRef);

      let restaurantesActivos = 0;
      let pagosTotales = 0;
      let alertasTotales = 0;
      let localesNuevosEsteMes = 0;
      let ingresosMensualesUSD = 0;
      let ingresosMensualesARS = 0;
      let ingresosAnualesUSD = 0;
      let ingresosAnualesARS = 0;

      const firstDayOfMonth = getFirstDayOfMonth();
      const firstDayOfYear = getFirstDayOfYear();

      // Obtener tasas de cambio
      const rates = await getExchangeRates();

      // Procesar restaurantes de forma asíncrona
      for (const doc of restaurantsSnapshot.docs) {
        const restaurantData = doc.data();

        // Contar restaurantes activos (solo los que no están suspendidos)
        if (
          restaurantData.estado !== "suspendido" &&
          restaurantData.estado !== "inactivo"
        ) {
          restaurantesActivos++;
        }

        // Detectar problemas específicos del restaurante (misma lógica que useRestaurantMonitoring)
        const restaurantIssues = [];

        // 1. Verificar estructura básica
        if (!restaurantData.nombre || !restaurantData.estado) {
          restaurantIssues.push({
            type: "critical",
            category: "structure",
            message: "Estructura de datos incompleta",
          });
        }

        // 2. Verificar usuarios
        try {
          const usuariosRef = collection(
            db,
            "restaurantes",
            doc.id,
            "usuarios"
          );
          const usuariosSnap = await getDocs(usuariosRef);

          if (usuariosSnap.empty) {
            restaurantIssues.push({
              type: "warning",
              category: "users",
              message: "Sin usuarios registrados",
            });
          }
        } catch (error) {
          // Si no puede acceder a usuarios, es un problema
          restaurantIssues.push({
            type: "critical",
            category: "users",
            message: "Error al acceder a usuarios",
          });
        }

        // 3. Verificar mesas
        try {
          const mesasRef = collection(db, "restaurantes", doc.id, "mesas");
          const mesasSnap = await getDocs(mesasRef);

          if (mesasSnap.empty) {
            restaurantIssues.push({
              type: "warning",
              category: "tables",
              message: "Sin mesas configuradas",
            });
          }
        } catch (error) {
          restaurantIssues.push({
            type: "critical",
            category: "tables",
            message: "Error al acceder a mesas",
          });
        }

        // 4. Verificar productos
        try {
          const menuRef = collection(db, "restaurantes", doc.id, "menus");
          const menuSnap = await getDocs(menuRef);

          if (menuSnap.empty) {
            restaurantIssues.push({
              type: "warning",
              category: "products",
              message: "Sin productos en menú",
            });
          }
        } catch (error) {
          restaurantIssues.push({
            type: "critical",
            category: "products",
            message: "Error al acceder a productos",
          });
        }

        // 5. Verificar pagos
        try {
          const pagosRef = doc(
            db,
            "restaurantes",
            doc.id,
            "configuracion",
            "pagos"
          );
          const pagosSnap = await getDoc(pagosRef);

          if (!pagosSnap.exists()) {
            restaurantIssues.push({
              type: "warning",
              category: "payments",
              message: "Configuración de pagos incompleta",
            });
          }
        } catch (error) {
          restaurantIssues.push({
            type: "critical",
            category: "payments",
            message: "Error en configuración de pagos",
          });
        }

        // Contar alertas por estado del restaurante
        if (restaurantData.estado === "suspendido") {
          restaurantIssues.push({
            type: "critical",
            category: "system",
            message: "Restaurante suspendido",
          });
        }
        if (restaurantData.estado === "inactivo") {
          restaurantIssues.push({
            type: "warning",
            category: "system",
            message: "Restaurante inactivo",
          });
        }

        // Sumar todas las alertas detectadas
        alertasTotales += restaurantIssues.length;

        // Los ingresos ahora se calculan desde las transacciones de pago reales
        // No desde los datos de los restaurantes

        // Contar locales nuevos este mes
        const fechaActivacion = restaurantData.fechaActivacion;
        if (fechaActivacion) {
          let fechaActivacionDate;

          // Convertir timestamp de Firestore si es necesario
          if (fechaActivacion.toDate) {
            fechaActivacionDate = fechaActivacion.toDate();
          } else {
            fechaActivacionDate = new Date(fechaActivacion);
          }

          if (fechaActivacionDate >= firstDayOfMonth) {
            localesNuevosEsteMes++;
          }
        }
      }

      // Contar pagos totales y calcular ingresos desde paymentTransactions
      paymentsSnapshot.docs.forEach((doc) => {
        const paymentData = doc.data();
        if (paymentData.status === "approved") {
          pagosTotales++;

          // Calcular ingresos basándose en las transacciones reales
          const amount = paymentData.amount || 0;

                     // Determinar si es pago mensual o anual basándose en el ID del pago
           // Si contiene "CASH" es anual (efectivo), sino es mensual (virtual/Mercado Pago)
           const isAnnualPayment =
             paymentData.paymentId &&
             typeof paymentData.paymentId === "string" &&
             paymentData.paymentId.toUpperCase().includes("CASH");

                     // Por defecto, considerar como mensual si no es explícitamente anual
           // Basándose en los datos reales, todos los pagos son en ARS
           if (isAnnualPayment) {
             ingresosAnualesARS += amount;
           } else {
             ingresosMensualesARS += amount;
           }
        }
      });

      console.log(
        `📊 Pagos totales contados desde paymentTransactions: ${pagosTotales}`
      );
      console.log(`🚨 Alertas totales contadas: ${alertasTotales}`);

      // Calcular datos de crecimiento anual
      const netoDolares = ingresosMensualesUSD + ingresosAnualesUSD;
      const netoPesos = ingresosMensualesARS + ingresosAnualesARS;

      const crecimientoAnual = {
        ganancias: netoDolares, // Ganancias totales en USD
        perdidas: 0, // Sin pérdidas por ahora
        localesTotales: restaurantesActivos,
        gananciaMensualUSD: ingresosMensualesUSD,
        gananciaAnualUSD: ingresosAnualesUSD,
        gananciaMensualARS: ingresosMensualesARS,
        gananciaAnualARS: ingresosAnualesARS,
        netoPesos: netoPesos,
        netoDolares: netoDolares,
      };

      console.log(
        `💰 Ingresos totales: USD ${netoDolares.toFixed(
          2
        )} (Mensual: ${ingresosMensualesUSD.toFixed(
          2
        )}, Anual: ${ingresosAnualesUSD.toFixed(2)}), ARS ${netoPesos.toFixed(
          2
        )} (Mensual: ${ingresosMensualesARS.toFixed(
          2
        )}, Anual: ${ingresosAnualesARS.toFixed(2)})`
      );

      setStats({
        restaurantesActivos,
        pagosTotales,
        alertasTotales,
        localesNuevosEsteMes,
        ingresosAnuales: {
          USD: ingresosAnualesUSD,
          ARS: ingresosAnualesARS,
        },
        ingresosMensuales: {
          USD: ingresosMensualesUSD,
          ARS: ingresosMensualesARS,
        },
        crecimientoAnual,
      });
    } catch (err) {
      console.error("Error loading dashboard stats:", err);
      setError("Error al cargar estadísticas del dashboard");

      // En caso de error, usar datos de ejemplo
      setStats({
        restaurantesActivos: 3,
        pagosTotales: 579.97,
        alertasTotales: 2,
        localesNuevosEsteMes: 2,
        crecimientoAnual: {
          ganancias: 6959.64,
          perdidas: 579.97,
          localesTotales: 3,
          ingresosMensuales: 579.97,
        },
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar datos al montar el hook
  useEffect(() => {
    loadDashboardStats();
  }, [loadDashboardStats]);

  return {
    stats,
    loading,
    error,
    loadDashboardStats,
  };
};
