"use client";

// Sistema de Métricas por Restaurante - Solo se ejecuta cuando se accede a métricas
class MetricsCollector {
  constructor() {
    this.metrics = {};
    this.isCollecting = false;
    this.restaurants = [];
  }

  // Inicializar métricas para un restaurante específico
  initializeRestaurantMetrics(restaurantId) {
    this.metrics[restaurantId] = {
      performance: {
        pageLoads: 0,
        apiCalls: 0,
        cacheHits: 0,
        cacheMisses: 0,
        errors: [],
        responseTime: 0,
      },
      business: {
        orders: {
          total: 0,
          byHour: {},
          byDay: {},
          averageValue: 0,
          pending: 0,
          completed: 0,
        },
        inventory: {
          lowStock: 0,
          outOfStock: 0,
          totalValue: 0,
          totalItems: 0,
          movements: [],
        },
        tables: {
          total: 0,
          occupied: 0,
          free: 0,
          averageOccupancy: 0,
        },
        users: {
          active: 0,
          byRole: {},
          sessions: [],
        },
      },
      system: {
        lastUpdate: new Date().toISOString(),
        uptime: Date.now(),
        memory: 0,
        database: {
          queries: 0,
          slowQueries: [],
          errors: 0,
        },
      },
    };
  }

  // Generar métricas para todos los restaurantes
  async generateAllRestaurantMetrics() {
    if (this.isCollecting) return;

    this.isCollecting = true;
    console.log("📊 Generando métricas para todos los restaurantes...");

    try {
      // Obtener todos los restaurantes
      const restaurants = await this.getAllRestaurants();
      this.restaurants = restaurants;

      // Limpiar métricas anteriores
      this.metrics = {};

      // Generar métricas para cada restaurante
      for (const restaurant of restaurants) {
        await this.generateRestaurantMetrics(restaurant.id);
      }

      // Guardar métricas en Firestore
      await this.saveMetricsToFirestore();

      console.log("✅ Métricas generadas y guardadas exitosamente");
    } catch (error) {
      console.error("❌ Error generando métricas:", error);
    } finally {
      this.isCollecting = false;
    }
  }

  // Obtener todos los restaurantes
  async getAllRestaurants() {
    try {
      const { collection, getDocs } = await import("firebase/firestore");
      const { db } = await import("../lib/firebase");

      const restaurantsRef = collection(db, "restaurantes");
      const snapshot = await getDocs(restaurantsRef);

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error obteniendo restaurantes:", error);
      return [];
    }
  }

  // Generar métricas para un restaurante específico
  async generateRestaurantMetrics(restaurantId) {
    console.log(`📊 Generando métricas para restaurante: ${restaurantId}`);

    // Inicializar métricas del restaurante
    this.initializeRestaurantMetrics(restaurantId);

    try {
      // Obtener datos del restaurante
      const restaurantData = await this.getRestaurantData(restaurantId);

      // Generar métricas de performance
      await this.generatePerformanceMetrics(restaurantId, restaurantData);

      // Generar métricas de negocio
      await this.generateBusinessMetrics(restaurantId, restaurantData);

      // Generar métricas del sistema
      await this.generateSystemMetrics(restaurantId, restaurantData);
    } catch (error) {
      console.error(`Error generando métricas para ${restaurantId}:`, error);
    }
  }

  // Obtener datos del restaurante
  async getRestaurantData(restaurantId) {
    try {
      const { collection, getDocs } = await import("firebase/firestore");
      const { db } = await import("../lib/firebase");

      const data = {
        orders: [],
        inventory: [],
        tables: [],
        users: [],
        apiCalls: 0,
        errors: [],
      };

      // Obtener pedidos
      const ordersRef = collection(db, "restaurantes", restaurantId, "pedidos");
      const ordersSnapshot = await getDocs(ordersRef);
      data.orders = ordersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Obtener inventario
      const stockRef = collection(db, "restaurantes", restaurantId, "stock");
      const stockSnapshot = await getDocs(stockRef);
      data.inventory = stockSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Obtener mesas
      const tablesRef = collection(db, "restaurantes", restaurantId, "tables");
      const tablesSnapshot = await getDocs(tablesRef);
      data.tables = tablesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Obtener usuarios
      const usersRef = collection(db, "restaurantes", restaurantId, "users");
      const usersSnapshot = await getDocs(usersRef);
      data.users = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return data;
    } catch (error) {
      console.error(
        `Error obteniendo datos del restaurante ${restaurantId}:`,
        error
      );
      return {
        orders: [],
        inventory: [],
        tables: [],
        users: [],
        apiCalls: 0,
        errors: [],
      };
    }
  }

  // Generar métricas de performance
  async generatePerformanceMetrics(restaurantId, data) {
    const metrics = this.metrics[restaurantId].performance;

    // Calcular métricas de performance
    metrics.apiCalls = data.apiCalls || 0;
    metrics.errors = data.errors || [];
    metrics.responseTime = this.calculateAverageResponseTime(data.orders);
  }

  // Generar métricas de negocio
  async generateBusinessMetrics(restaurantId, data) {
    const metrics = this.metrics[restaurantId].business;

    // Métricas de pedidos
    metrics.orders.total = data.orders.length;
    metrics.orders.pending = data.orders.filter(
      (order) => order.estado === "pendiente"
    ).length;
    metrics.orders.completed = data.orders.filter(
      (order) => order.estado === "completado"
    ).length;
    metrics.orders.averageValue = this.calculateAverageOrderValue(data.orders);
    metrics.orders.byHour = this.groupOrdersByHour(data.orders);
    metrics.orders.byDay = this.groupOrdersByDay(data.orders);

    // Métricas de inventario
    metrics.inventory.totalItems = data.inventory.length;
    metrics.inventory.lowStock = data.inventory.filter(
      (item) => item.cantidad <= (item.minimo || 10)
    ).length;
    metrics.inventory.outOfStock = data.inventory.filter(
      (item) => item.cantidad <= 0
    ).length;
    metrics.inventory.totalValue = this.calculateInventoryValue(data.inventory);

    // Métricas de mesas
    metrics.tables.total = data.tables.length;
    metrics.tables.occupied = data.tables.filter(
      (table) => table.estado === "ocupada"
    ).length;
    metrics.tables.free = data.tables.filter(
      (table) => table.estado === "libre"
    ).length;
    metrics.tables.averageOccupancy =
      data.tables.length > 0
        ? (metrics.tables.occupied / data.tables.length) * 100
        : 0;

    // Métricas de usuarios
    metrics.users.active = data.users.filter((user) => user.activo).length;
    metrics.users.byRole = this.groupUsersByRole(data.users);
  }

  // Generar métricas del sistema
  async generateSystemMetrics(restaurantId, data) {
    const metrics = this.metrics[restaurantId].system;

    metrics.lastUpdate = new Date().toISOString();
    metrics.memory = this.getMemoryUsage();
    metrics.database.queries = data.apiCalls || 0;
    metrics.database.errors = data.errors.length;
  }

  // Métodos auxiliares
  calculateAverageResponseTime(orders) {
    if (!orders || orders.length === 0) return 0;
    const responseTimes = orders
      .map((order) => order.responseTime || 0)
      .filter((time) => time > 0);
    return responseTimes.length > 0
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      : 0;
  }

  calculateAverageOrderValue(orders) {
    if (!orders || orders.length === 0) return 0;
    const values = orders.map((order) => order.total || 0);
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  calculateInventoryValue(inventory) {
    if (!inventory || inventory.length === 0) return 0;
    return inventory.reduce((total, item) => {
      const value = (item.precio || 0) * (item.cantidad || 0);
      return total + value;
    }, 0);
  }

  groupOrdersByHour(orders) {
    const byHour = {};
    orders.forEach((order) => {
      const hour = new Date(order.fechaCreacion).getHours();
      byHour[hour] = (byHour[hour] || 0) + 1;
    });
    return byHour;
  }

  groupOrdersByDay(orders) {
    const byDay = {};
    orders.forEach((order) => {
      const day = new Date(order.fechaCreacion).toLocaleDateString();
      byDay[day] = (byDay[day] || 0) + 1;
    });
    return byDay;
  }

  groupUsersByRole(users) {
    const byRole = {};
    users.forEach((user) => {
      const role = user.rol || "usuario";
      byRole[role] = (byRole[role] || 0) + 1;
    });
    return byRole;
  }

  getMemoryUsage() {
    if (
      typeof window !== "undefined" &&
      window.performance &&
      window.performance.memory
    ) {
      return window.performance.memory.usedJSHeapSize;
    }
    return 0;
  }

  // Guardar métricas en Firestore
  async saveMetricsToFirestore() {
    try {
      const { doc, setDoc, deleteDoc, collection, getDocs } = await import(
        "firebase/firestore"
      );
      const { db } = await import("../lib/firebase");

      // Primero, eliminar métricas anteriores
      const metricsRef = collection(db, "metrics");
      const oldMetricsSnapshot = await getDocs(metricsRef);

      for (const docSnapshot of oldMetricsSnapshot.docs) {
        await deleteDoc(doc(db, "metrics", docSnapshot.id));
      }

      // Guardar nuevas métricas
      for (const [restaurantId, metrics] of Object.entries(this.metrics)) {
        await setDoc(doc(db, "metrics", restaurantId), {
          ...metrics,
          generatedAt: new Date().toISOString(),
          restaurantId,
        });
      }

      console.log("✅ Métricas guardadas en Firestore");
    } catch (error) {
      console.error("❌ Error guardando métricas en Firestore:", error);
    }
  }

  // Eliminar completamente la colección metrics
  async deleteMetricsCollection() {
    try {
      const { collection, getDocs, deleteDoc } = await import(
        "firebase/firestore"
      );
      const { db } = await import("../lib/firebase");

      console.log("🗑️ Eliminando colección metrics...");

      const metricsRef = collection(db, "metrics");
      const snapshot = await getDocs(metricsRef);

      if (snapshot.empty) {
        console.log("✅ La colección metrics ya está vacía");
        return { success: true, message: "Colección metrics eliminada" };
      }

      // Eliminar todos los documentos de la colección
      const deletePromises = snapshot.docs.map((doc) => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      console.log(
        `✅ Eliminados ${snapshot.docs.length} documentos de metrics`
      );
      return {
        success: true,
        message: `Eliminados ${snapshot.docs.length} documentos`,
      };
    } catch (error) {
      console.error("❌ Error eliminando colección metrics:", error);
      return { success: false, message: error.message };
    }
  }

  // Obtener métricas de Firestore
  async getMetricsFromFirestore() {
    try {
      const { collection, getDocs } = await import("firebase/firestore");
      const { db } = await import("../lib/firebase");

      const metricsRef = collection(db, "metrics");
      const snapshot = await getDocs(metricsRef);

      const metrics = {};
      snapshot.docs.forEach((doc) => {
        metrics[doc.id] = doc.data();
      });

      return metrics;
    } catch (error) {
      console.error("❌ Error obteniendo métricas de Firestore:", error);
      return {};
    }
  }

  // Obtener métricas de un restaurante específico
  async getRestaurantMetrics(restaurantId) {
    try {
      const { doc, getDoc } = await import("firebase/firestore");
      const { db } = await import("../lib/firebase");

      const metricDoc = await getDoc(doc(db, "metrics", restaurantId));
      return metricDoc.exists() ? metricDoc.data() : null;
    } catch (error) {
      console.error(
        `❌ Error obteniendo métricas del restaurante ${restaurantId}:`,
        error
      );
      return null;
    }
  }
}

// Singleton instance
const metricsCollector = new MetricsCollector();

// Hacer disponible globalmente para debugging
if (typeof window !== "undefined") {
  window.metricsCollector = metricsCollector;
}

export default metricsCollector;
