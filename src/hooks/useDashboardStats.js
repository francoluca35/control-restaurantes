import { useState, useEffect, useCallback } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "../../lib/firebase";

export const useDashboardStats = () => {
  const [stats, setStats] = useState({
    restaurantesActivos: 0,
    pagosTotales: 0,
    localesNuevosEsteMes: 0,
    crecimientoAnual: {
      ganancias: 0,
      perdidas: 0,
      localesTotales: 0,
      ingresosMensuales: 0,
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

      // Obtener todos los restaurantes
      const restaurantsRef = collection(db, "restaurantes");
      const restaurantsSnapshot = await getDocs(restaurantsRef);

      let restaurantesActivos = 0;
      let pagosTotales = 0;
      let localesNuevosEsteMes = 0;
      let ingresosMensuales = 0;

      const firstDayOfMonth = getFirstDayOfMonth();
      const firstDayOfYear = getFirstDayOfYear();

      restaurantsSnapshot.docs.forEach((doc) => {
        const restaurantData = doc.data();

        // Contar restaurantes activos
        if (restaurantData.estado !== "suspendido") {
          restaurantesActivos++;
        }

        // Sumar pagos totales
        if (restaurantData.precio) {
          pagosTotales += restaurantData.precio;
          ingresosMensuales += restaurantData.precio;
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

      // Calcular datos de crecimiento anual (simulado por ahora)
      const crecimientoAnual = {
        ganancias: ingresosMensuales * 12, // Proyección anual
        perdidas: ingresosMensuales * 0.1, // 10% de pérdidas estimadas
        localesTotales: restaurantesActivos,
        ingresosMensuales: ingresosMensuales,
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
