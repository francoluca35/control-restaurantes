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

      restaurantsSnapshot.docs.forEach((doc) => {
        const restaurantData = doc.data();

        // Contar restaurantes activos (solo los que no están suspendidos)
        if (
          restaurantData.estado !== "suspendido" &&
          restaurantData.estado !== "inactivo"
        ) {
          restaurantesActivos++;
        }

        // Contar alertas del restaurante
        if (restaurantData.alertas && Array.isArray(restaurantData.alertas)) {
          alertasTotales += restaurantData.alertas.length;
        }

        // Contar alertas por estado del restaurante
        if (restaurantData.estado === "suspendido") {
          alertasTotales++;
        }
        if (restaurantData.estado === "inactivo") {
          alertasTotales++;
        }

        // Calcular ingresos según el tipo de pago (anual vs mensual)
        let ingresosRestaurante = restaurantData.precio || 0;
        let esPagoAnual =
          restaurantData.periodicidad === "anual" ||
          restaurantData.tipoPago === "anual";

        // Separar ingresos anuales y mensuales
        if (restaurantData.moneda === "ARS") {
          if (esPagoAnual) {
            ingresosAnualesARS += ingresosRestaurante;
            console.log(
              `📊 Restaurante ${restaurantData.nombre}: ${ingresosRestaurante} ARS (PAGO ANUAL)`
            );
          } else {
            ingresosMensualesARS += ingresosRestaurante;
            console.log(
              `📊 Restaurante ${restaurantData.nombre}: ${ingresosRestaurante} ARS (PAGO MENSUAL)`
            );
          }
        } else {
          // Por defecto USD o si no tiene moneda especificada
          if (esPagoAnual) {
            ingresosAnualesUSD += ingresosRestaurante;
            console.log(
              `📊 Restaurante ${restaurantData.nombre}: ${ingresosRestaurante} USD (PAGO ANUAL)`
            );
          } else {
            ingresosMensualesUSD += ingresosRestaurante;
            console.log(
              `📊 Restaurante ${restaurantData.nombre}: ${ingresosRestaurante} USD (PAGO MENSUAL)`
            );
          }
        }

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
      });

      // Contar pagos totales desde paymentTransactions
      paymentsSnapshot.docs.forEach((doc) => {
        const paymentData = doc.data();
        if (paymentData.status === "approved") {
          pagosTotales++;
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
