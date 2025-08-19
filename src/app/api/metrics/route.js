import { NextResponse } from "next/server";
import { db } from "../../../../lib/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";

// POST - Recibir métricas del cliente
export async function POST(request) {
  try {
    const body = await request.json();
    const { metrics, summary, timestamp, userAgent, url } = body;

    // Validar que venga del superadmin
    const currentPath = url || "";
    if (!currentPath.includes("/home-master")) {
      return NextResponse.json(
        { error: "Acceso no autorizado" },
        { status: 403 }
      );
    }

    // Preparar documento de métricas
    const metricsDoc = {
      metrics,
      summary,
      timestamp: timestamp || Date.now(),
      userAgent,
      url,
      createdAt: serverTimestamp(),
      version: "2.0",
    };

    // Guardar en Firestore
    const metricsRef = collection(db, "metrics");
    await addDoc(metricsRef, metricsDoc);

    console.log("📊 Métricas guardadas:", {
      timestamp: new Date(timestamp).toISOString(),
      performance: summary.performance,
      business: summary.business,
      system: summary.system,
    });

    return NextResponse.json({
      success: true,
      message: "Métricas guardadas correctamente",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error guardando métricas:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// GET - Obtener métricas históricas
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit")) || 100;
    const hours = parseInt(searchParams.get("hours")) || 24;

    // Calcular timestamp desde hace X horas
    const since = Date.now() - hours * 60 * 60 * 1000;

    // Consultar métricas recientes
    const metricsRef = collection(db, "metrics");
    const q = query(metricsRef, orderBy("timestamp", "desc"), limit(limit));

    const snapshot = await getDocs(q);
    const metrics = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      // Solo incluir métricas dentro del rango de tiempo
      if (data.timestamp >= since) {
        metrics.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp,
          createdAt: data.createdAt?.toDate?.() || new Date(data.timestamp),
        });
      }
    });

    // Calcular agregaciones
    const aggregations = calculateAggregations(metrics);

    return NextResponse.json({
      success: true,
      metrics,
      aggregations,
      total: metrics.length,
      timeRange: {
        since: new Date(since).toISOString(),
        until: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error obteniendo métricas:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// Función para calcular agregaciones de métricas
function calculateAggregations(metrics) {
  if (metrics.length === 0) {
    return {
      performance: {},
      business: {},
      system: {},
    };
  }

  const aggregations = {
    performance: {
      totalPageLoads: 0,
      avgPageLoadTime: 0,
      totalApiCalls: 0,
      avgApiResponseTime: 0,
      totalErrors: 0,
      cacheHitRate: 0,
    },
    business: {
      totalOrders: 0,
      avgOrderValue: 0,
      totalUsers: 0,
      totalRestaurants: 0,
      lowStockItems: 0,
      outOfStockItems: 0,
      totalInventoryValue: 0,
    },
    system: {
      avgUptime: 0,
      avgMemoryUsage: 0,
      totalNetworkRequests: 0,
      totalNetworkErrors: 0,
      avgNetworkResponseTime: 0,
    },
  };

  let totalPageLoads = 0;
  let totalPageLoadTime = 0;
  let totalApiCalls = 0;
  let totalApiResponseTime = 0;
  let totalCacheHits = 0;
  let totalCacheMisses = 0;
  let totalMemoryUsage = 0;
  let memoryCount = 0;

  metrics.forEach((metric) => {
    const { summary } = metric;

    if (summary?.performance) {
      aggregations.performance.totalPageLoads +=
        summary.performance.totalPageLoads || 0;
      totalPageLoadTime += summary.performance.avgPageLoadTime || 0;
      aggregations.performance.totalApiCalls +=
        summary.performance.totalApiCalls || 0;
      totalApiResponseTime += summary.performance.avgApiResponseTime || 0;
      aggregations.performance.totalErrors +=
        summary.performance.totalErrors || 0;
      totalCacheHits += summary.performance.cacheHitRate || 0;
      totalCacheMisses += 1;
    }

    if (summary?.business) {
      aggregations.business.totalOrders += summary.business.totalOrders || 0;
      aggregations.business.avgOrderValue +=
        summary.business.avgOrderValue || 0;
      aggregations.business.totalUsers += summary.business.activeUsers || 0;
      aggregations.business.totalRestaurants +=
        summary.business.activeRestaurants || 0;
      aggregations.business.lowStockItems +=
        summary.business.lowStockItems || 0;
      aggregations.business.outOfStockItems +=
        summary.business.outOfStockItems || 0;
      aggregations.business.totalInventoryValue +=
        summary.business.inventoryValue || 0;
    }

    if (summary?.system) {
      aggregations.system.avgUptime += summary.system.uptime || 0;
      aggregations.system.totalNetworkRequests +=
        summary.system.networkRequests || 0;
      aggregations.system.totalNetworkErrors +=
        summary.system.networkErrors || 0;
      aggregations.system.avgNetworkResponseTime +=
        summary.system.avgNetworkResponseTime || 0;

      if (summary.system.memoryUsage?.used) {
        totalMemoryUsage += summary.system.memoryUsage.used;
        memoryCount++;
      }
    }
  });

  const count = metrics.length;

  // Calcular promedios
  if (count > 0) {
    aggregations.performance.avgPageLoadTime = totalPageLoadTime / count;
    aggregations.performance.avgApiResponseTime = totalApiResponseTime / count;
    aggregations.performance.cacheHitRate =
      (totalCacheHits / Math.max(totalCacheMisses, 1)) * 100;
    aggregations.business.avgOrderValue =
      aggregations.business.avgOrderValue / count;
    aggregations.system.avgUptime = aggregations.system.avgUptime / count;
    aggregations.system.avgNetworkResponseTime =
      aggregations.system.avgNetworkResponseTime / count;
  }

  if (memoryCount > 0) {
    aggregations.system.avgMemoryUsage = totalMemoryUsage / memoryCount;
  }

  return aggregations;
}
