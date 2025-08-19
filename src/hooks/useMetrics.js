"use client";
import { useState, useEffect, useCallback } from "react";
import metricsCollector from "../lib/metrics.js";

export const useMetrics = () => {
  const [metrics, setMetrics] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Generar métricas para todos los restaurantes
  const generateMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("🔄 Generando métricas...");
      await metricsCollector.generateAllRestaurantMetrics();

      // Obtener métricas generadas
      const freshMetrics = await metricsCollector.getMetricsFromFirestore();
      setMetrics(freshMetrics);
      setLastUpdate(new Date());

      console.log("✅ Métricas generadas exitosamente");
    } catch (err) {
      console.error("❌ Error generando métricas:", err);
      setError("Error al generar métricas");
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener métricas existentes (sin generar nuevas)
  const loadExistingMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const existingMetrics = await metricsCollector.getMetricsFromFirestore();
      setMetrics(existingMetrics);
      setLastUpdate(new Date());
    } catch (err) {
      console.error("❌ Error cargando métricas existentes:", err);
      setError("Error al cargar métricas");
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener métricas de un restaurante específico
  const getRestaurantMetrics = useCallback(async (restaurantId) => {
    try {
      return await metricsCollector.getRestaurantMetrics(restaurantId);
    } catch (err) {
      console.error(
        `❌ Error obteniendo métricas del restaurante ${restaurantId}:`,
        err
      );
      return null;
    }
  }, []);

  // Eliminar colección metrics
  const deleteMetricsCollection = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await metricsCollector.deleteMetricsCollection();
      if (result.success) {
        setMetrics({});
        setLastUpdate(new Date());
        console.log("✅ Colección metrics eliminada exitosamente");
        return result; // Retornar el resultado para el manejo en el componente
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      console.error("❌ Error eliminando colección metrics:", err);
      setError("Error al eliminar colección metrics");
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Calcular estadísticas generales
  const getGeneralStats = useCallback(() => {
    const restaurants = Object.keys(metrics);
    const totalRestaurants = restaurants.length;

    if (totalRestaurants === 0) {
      return {
        totalRestaurants: 0,
        totalOrders: 0,
        totalRevenue: 0,
        averagePerformance: 0,
        activeUsers: 0,
        lowStockItems: 0,
      };
    }

    const stats = restaurants.reduce(
      (acc, restaurantId) => {
        const restaurantMetrics = metrics[restaurantId];
        if (!restaurantMetrics) return acc;

        const business = restaurantMetrics.business || {};
        const orders = business.orders || {};
        const inventory = business.inventory || {};
        const users = business.users || {};

        return {
          totalOrders: acc.totalOrders + (orders.total || 0),
          totalRevenue:
            acc.totalRevenue + (orders.averageValue || 0) * (orders.total || 0),
          activeUsers: acc.activeUsers + (users.active || 0),
          lowStockItems: acc.lowStockItems + (inventory.lowStock || 0),
        };
      },
      {
        totalOrders: 0,
        totalRevenue: 0,
        activeUsers: 0,
        lowStockItems: 0,
      }
    );

    return {
      totalRestaurants,
      ...stats,
      averagePerformance:
        totalRestaurants > 0 ? stats.totalOrders / totalRestaurants : 0,
    };
  }, [metrics]);

  // Obtener alertas basadas en métricas
  const getAlerts = useCallback(() => {
    const alerts = [];

    Object.entries(metrics).forEach(([restaurantId, restaurantMetrics]) => {
      const business = restaurantMetrics.business || {};
      const inventory = business.inventory || {};
      const orders = business.orders || {};
      const tables = business.tables || {};

      // Alertas de inventario
      if (inventory.outOfStock > 0) {
        alerts.push({
          type: "error",
          restaurantId,
          message: `${inventory.outOfStock} productos sin stock`,
          category: "inventory",
        });
      }

      if (inventory.lowStock > 0) {
        alerts.push({
          type: "warning",
          restaurantId,
          message: `${inventory.lowStock} productos con stock bajo`,
          category: "inventory",
        });
      }

      // Alertas de pedidos
      if (orders.pending > 5) {
        alerts.push({
          type: "warning",
          restaurantId,
          message: `${orders.pending} pedidos pendientes`,
          category: "orders",
        });
      }

      // Alertas de mesas
      if (tables.occupied > 0 && tables.averageOccupancy > 90) {
        alerts.push({
          type: "info",
          restaurantId,
          message: "Alta ocupación de mesas",
          category: "tables",
        });
      }
    });

    return alerts;
  }, [metrics]);

  // Cargar métricas al montar el hook
  useEffect(() => {
    loadExistingMetrics();
  }, [loadExistingMetrics]);

  return {
    metrics,
    loading,
    error,
    lastUpdate,
    generateMetrics,
    loadExistingMetrics,
    getRestaurantMetrics,
    deleteMetricsCollection,
    getGeneralStats,
    getAlerts,
  };
};
