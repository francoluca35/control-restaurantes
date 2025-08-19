"use client";
import React from "react";
import {
  FaTachometerAlt,
  FaDatabase,
  FaExclamationTriangle,
  FaChartLine,
} from "react-icons/fa";

export default function PerformanceDashboard({ stats }) {
  if (!stats) {
    return (
      <div className="bg-slate-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <FaTachometerAlt className="mr-2" />
          Performance Dashboard
        </h3>
        <p className="text-slate-400">Sin datos de performance disponibles</p>
      </div>
    );
  }

  const getTrendColor = (trend) => {
    if (trend > 0) return "text-green-400";
    if (trend < 0) return "text-red-400";
    return "text-slate-400";
  };

  const getTrendIcon = (trend) => {
    if (trend > 0) return "↗";
    if (trend < 0) return "↘";
    return "→";
  };

  const getPerformanceStatus = (avgTime) => {
    if (avgTime < 1000) return { status: "Excelente", color: "text-green-400" };
    if (avgTime < 2000) return { status: "Bueno", color: "text-yellow-400" };
    return { status: "Lento", color: "text-red-400" };
  };

  const getCacheStatus = (hitRate) => {
    if (hitRate > 80) return { status: "Excelente", color: "text-green-400" };
    if (hitRate > 60) return { status: "Bueno", color: "text-yellow-400" };
    return { status: "Bajo", color: "text-red-400" };
  };

  const pageLoadStatus = getPerformanceStatus(stats.pageLoads.avgTime);
  const cacheStatus = getCacheStatus(stats.cache.hitRate);

  return (
    <div className="space-y-6">
      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Cargas de página */}
        <div className="bg-slate-800 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <FaTachometerAlt className="text-blue-400" />
            <span className={`text-xs ${getTrendColor(stats.pageLoads.trend)}`}>
              {getTrendIcon(stats.pageLoads.trend)}{" "}
              {Math.abs(stats.pageLoads.trend).toFixed(1)}%
            </span>
          </div>
          <div className="text-white text-2xl font-bold">
            {stats.pageLoads.total}
          </div>
          <div className="text-slate-400 text-sm">Cargas de página</div>
          <div className="text-xs text-slate-500 mt-1">
            Promedio: {stats.pageLoads.avgTime.toFixed(0)}ms
          </div>
          <div className={`text-xs mt-1 ${pageLoadStatus.color}`}>
            {pageLoadStatus.status}
          </div>
        </div>

        {/* Llamadas API */}
        <div className="bg-slate-800 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <FaDatabase className="text-purple-400" />
            <span className={`text-xs ${getTrendColor(stats.apiCalls.trend)}`}>
              {getTrendIcon(stats.apiCalls.trend)}{" "}
              {Math.abs(stats.apiCalls.trend).toFixed(1)}%
            </span>
          </div>
          <div className="text-white text-2xl font-bold">
            {stats.apiCalls.total}
          </div>
          <div className="text-slate-400 text-sm">Llamadas API</div>
          <div className="text-xs text-slate-500 mt-1">
            Promedio: {stats.apiCalls.avgResponseTime.toFixed(0)}ms
          </div>
        </div>

        {/* Cache */}
        <div className="bg-slate-800 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <FaDatabase className="text-green-400" />
            <span className={`text-xs ${getTrendColor(stats.cache.trend)}`}>
              {getTrendIcon(stats.cache.trend)}{" "}
              {Math.abs(stats.cache.trend).toFixed(1)}%
            </span>
          </div>
          <div className="text-white text-2xl font-bold">
            {stats.cache.hitRate.toFixed(1)}%
          </div>
          <div className="text-slate-400 text-sm">Tasa de cache</div>
          <div className="text-xs text-slate-500 mt-1">
            Hits: {stats.cache.hits} | Misses: {stats.cache.misses}
          </div>
          <div className={`text-xs mt-1 ${cacheStatus.color}`}>
            {cacheStatus.status}
          </div>
        </div>

        {/* Errores */}
        <div className="bg-slate-800 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <FaExclamationTriangle className="text-red-400" />
            <span className={`text-xs ${getTrendColor(stats.errors.trend)}`}>
              {getTrendIcon(stats.errors.trend)}{" "}
              {Math.abs(stats.errors.trend).toFixed(1)}%
            </span>
          </div>
          <div className="text-white text-2xl font-bold">
            {stats.errors.total}
          </div>
          <div className="text-slate-400 text-sm">Errores</div>
          <div className="text-xs text-slate-500 mt-1">Últimas 24h</div>
        </div>
      </div>

      {/* Análisis detallado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Análisis de performance */}
        <div className="bg-slate-800 rounded-lg p-4">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
            <FaChartLine className="mr-2" />
            Análisis de Performance
          </h4>

          <div className="space-y-4">
            {/* Tiempo de carga */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-400">Tiempo de carga promedio</span>
                <span className="text-white font-semibold">
                  {stats.pageLoads.avgTime.toFixed(0)}ms
                </span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    stats.pageLoads.avgTime < 1000
                      ? "bg-green-500"
                      : stats.pageLoads.avgTime < 2000
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                  style={{
                    width: `${Math.min(
                      (stats.pageLoads.avgTime / 3000) * 100,
                      100
                    )}%`,
                  }}
                ></div>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {stats.pageLoads.avgTime < 1000
                  ? "Excelente"
                  : stats.pageLoads.avgTime < 2000
                  ? "Bueno"
                  : "Necesita optimización"}
              </div>
            </div>

            {/* Tiempo de respuesta API */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-400">Tiempo de respuesta API</span>
                <span className="text-white font-semibold">
                  {stats.apiCalls.avgResponseTime.toFixed(0)}ms
                </span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    stats.apiCalls.avgResponseTime < 500
                      ? "bg-green-500"
                      : stats.apiCalls.avgResponseTime < 1000
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                  style={{
                    width: `${Math.min(
                      (stats.apiCalls.avgResponseTime / 2000) * 100,
                      100
                    )}%`,
                  }}
                ></div>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {stats.apiCalls.avgResponseTime < 500
                  ? "Muy rápido"
                  : stats.apiCalls.avgResponseTime < 1000
                  ? "Aceptable"
                  : "Lento"}
              </div>
            </div>

            {/* Eficiencia de cache */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-400">Eficiencia de cache</span>
                <span className="text-white font-semibold">
                  {stats.cache.hitRate.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    stats.cache.hitRate > 80
                      ? "bg-green-500"
                      : stats.cache.hitRate > 60
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                  style={{ width: `${stats.cache.hitRate}%` }}
                ></div>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {stats.cache.hitRate > 80
                  ? "Excelente"
                  : stats.cache.hitRate > 60
                  ? "Bueno"
                  : "Necesita mejora"}
              </div>
            </div>
          </div>
        </div>

        {/* Recomendaciones */}
        <div className="bg-slate-800 rounded-lg p-4">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
            <FaChartLine className="mr-2" />
            Recomendaciones
          </h4>

          <div className="space-y-3">
            {stats.pageLoads.avgTime > 2000 && (
              <div className="p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                <div className="text-yellow-400 font-semibold text-sm mb-1">
                  ⚡ Optimizar tiempo de carga
                </div>
                <div className="text-yellow-300 text-xs">
                  El tiempo de carga promedio es lento. Considera implementar
                  lazy loading y optimizar imágenes.
                </div>
              </div>
            )}

            {stats.apiCalls.avgResponseTime > 1000 && (
              <div className="p-3 bg-orange-900/20 border border-orange-500/30 rounded-lg">
                <div className="text-orange-400 font-semibold text-sm mb-1">
                  🔧 Optimizar APIs
                </div>
                <div className="text-orange-300 text-xs">
                  Las respuestas de API son lentas. Revisa la optimización de
                  consultas y caching.
                </div>
              </div>
            )}

            {stats.cache.hitRate < 60 && (
              <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <div className="text-blue-400 font-semibold text-sm mb-1">
                  💾 Mejorar estrategia de cache
                </div>
                <div className="text-blue-300 text-xs">
                  La tasa de cache es baja. Implementa cache más agresivo para
                  recursos estáticos.
                </div>
              </div>
            )}

            {stats.errors.total > 5 && (
              <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                <div className="text-red-400 font-semibold text-sm mb-1">
                  🐛 Revisar errores
                </div>
                <div className="text-red-300 text-xs">
                  Hay muchos errores. Revisa los logs y corrige los problemas
                  identificados.
                </div>
              </div>
            )}

            {stats.pageLoads.avgTime < 1000 && stats.cache.hitRate > 80 && (
              <div className="p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                <div className="text-green-400 font-semibold text-sm mb-1">
                  ✅ Performance excelente
                </div>
                <div className="text-green-300 text-xs">
                  La aplicación está funcionando de manera óptima. ¡Buen
                  trabajo!
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
