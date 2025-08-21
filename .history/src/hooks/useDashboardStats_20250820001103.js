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
    localesNuevosEsteMes: 0,
    crecimientoAnual: {
      ganancias: 0,
      perdidas: 0,
      localesTotales: 0,
      ingresosMensuales: {
        USD: 0,
        ARS: 0,
      },
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

      let restaurantesActivos = 0;
      let pagosTotales = 0;
      let localesNuevosEsteMes = 0;
      let ingresosMensualesUSD = 0;
      let ingresosMensualesARS = 0;

      const firstDayOfMonth = getFirstDayOfMonth();
      const firstDayOfYear = getFirstDayOfYear();

      // Obtener tasas de cambio
      const rates = await getExchangeRates();

      restaurantsSnapshot.docs.forEach((doc) => {
        const restaurantData = doc.data();

        // Contar restaurantes activos
        if (restaurantData.estado !== "suspendido") {
          restaurantesActivos++;
        }

        // Sumar pagos totales e ingresos mensuales
        if (restaurantData.precio) {
          pagosTotales += restaurantData.precio;
        }

        // Calcular ingresos mensuales según la moneda del restaurante
        let ingresosMensualesRestaurante = 0;
        if (restaurantData.ingresosMensuales) {
          ingresosMensualesRestaurante = restaurantData.ingresosMensuales;
        } else if (restaurantData.precio) {
          // Si no hay ingresos mensuales registrados, calcular basado en periodicidad
          if (restaurantData.periodicidad === "mensual") {
            ingresosMensualesRestaurante = restaurantData.precio;
          } else {
            ingresosMensualesRestaurante = restaurantData.precio / 12;
          }
        }

        // Sumar según la moneda del restaurante (sin conversiones)
        if (restaurantData.moneda === "ARS") {
          ingresosMensualesARS += ingresosMensualesRestaurante;
        } else {
          // Por defecto USD o si no tiene moneda especificada
          ingresosMensualesUSD += ingresosMensualesRestaurante;
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

      // Los ingresos mensuales ya están calculados por moneda individual

      // Calcular datos de crecimiento anual (simulado por ahora)
      const crecimientoAnual = {
        ganancias: ingresosMensualesUSD * 12, // Proyección anual
        perdidas: ingresosMensualesUSD * 0.1, // 10% de pérdidas estimadas
        localesTotales: restaurantesActivos,
        ingresosMensuales: {
          USD: ingresosMensualesUSD,
          ARS: ingresosMensualesARS,
        },
      };

      setStats({
        restaurantesActivos,
        pagosTotales,
        localesNuevosEsteMes,
        crecimientoAnual,
      });
    } catch (err) {
      console.error("Error loading dashboard stats:", err);
      setError("Error al cargar estadísticas del dashboard");

      // En caso de error, usar datos de ejemplo
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
