"use client";
import React from "react";
import {
  FaServer,
  FaMemory,
  FaNetworkWired,
  FaClock,
  FaThermometerHalf,
  FaExclamationTriangle,
} from "react-icons/fa";

export default function SystemDashboard({ stats }) {
  if (!stats) {
    return (
      <div className="bg-slate-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <FaServer className="mr-2" />
          System Dashboard
        </h3>
        <p className="text-slate-400">Sin datos del sistema disponibles</p>
      </div>
    );
  }

  const formatUptime = (uptime) => {
    const hours = Math.floor(uptime / (1000 * 60 * 60));
    const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const formatMemory = (bytes) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const getMemoryUsagePercentage = () => {
    if (!stats.memory) return 0;
    return (stats.memory.used / stats.memory.limit) * 100;
  };

  const getMemoryStatus = (percentage) => {
    if (percentage < 50)
      return { status: "Excelente", color: "text-green-400" };
    if (percentage < 80) return { status: "Bueno", color: "text-yellow-400" };
    return { status: "Crítico", color: "text-red-400" };
  };

  const getNetworkStatus = (responseTime) => {
    if (responseTime < 500)
      return { status: "Excelente", color: "text-green-400" };
    if (responseTime < 1000)
      return { status: "Bueno", color: "text-yellow-400" };
    return { status: "Lento", color: "text-red-400" };
  };

  const memoryUsagePercentage = getMemoryUsagePercentage();
  const memoryStatus = getMemoryStatus(memoryUsagePercentage);
  const networkStatus = getNetworkStatus(stats.network.avgResponseTime);

  return (
    <div className="space-y-6">
      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Uptime */}
        <div className="bg-slate-800 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <FaClock className="text-green-400" />
            <span className="text-xs text-green-400">🟢 Activo</span>
          </div>
          <div className="text-white text-2xl font-bold">
            {formatUptime(stats.uptime)}
          </div>
          <div className="text-slate-400 text-sm">Tiempo activo</div>
          <div className="text-xs text-slate-500 mt-1">Sin interrupciones</div>
        </div>

        {/* Memoria */}
        <div className="bg-slate-800 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <FaMemory className="text-blue-400" />
            <span className={`text-xs ${memoryStatus.color}`}>
              {memoryStatus.status}
            </span>
          </div>
          <div className="text-white text-2xl font-bold">
            {stats.memory ? formatMemory(stats.memory.used) : "N/A"}
          </div>
          <div className="text-slate-400 text-sm">Memoria usada</div>
          <div className="text-xs text-slate-500 mt-1">
            {memoryUsagePercentage.toFixed(1)}% del total
          </div>
        </div>

        {/* Red */}
        <div className="bg-slate-800 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <FaNetworkWired className="text-purple-400" />
            <span className={`text-xs ${networkStatus.color}`}>
              {networkStatus.status}
            </span>
          </div>
          <div className="text-white text-2xl font-bold">
            {stats.network.requests}
          </div>
          <div className="text-slate-400 text-sm">Requests</div>
          <div className="text-xs text-slate-500 mt-1">
            {stats.network.avgResponseTime.toFixed(0)}ms avg
          </div>
        </div>

        {/* Errores de red */}
        <div className="bg-slate-800 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <FaExclamationTriangle className="text-red-400" />
            <span className="text-xs text-red-400">⚠️ Errores</span>
          </div>
          <div className="text-white text-2xl font-bold">
            {stats.network.errors}
          </div>
          <div className="text-slate-400 text-sm">Errores de red</div>
          <div className="text-xs text-slate-500 mt-1">
            {stats.network.requests > 0
              ? `${(
                  (stats.network.errors / stats.network.requests) *
                  100
                ).toFixed(1)}% tasa`
              : "Sin requests"}
          </div>
        </div>
      </div>

      {/* Análisis detallado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Análisis de memoria */}
        <div className="bg-slate-800 rounded-lg p-4">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
            <FaMemory className="mr-2" />
            Análisis de Memoria
          </h4>

          {stats.memory ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Memoria usada</span>
                <span className="text-white font-semibold">
                  {formatMemory(stats.memory.used)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">Memoria total</span>
                <span className="text-white font-semibold">
                  {formatMemory(stats.memory.total)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">Límite</span>
                <span className="text-white font-semibold">
                  {formatMemory(stats.memory.limit)}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-700">
                <div className="text-xs text-slate-400 mb-2">
                  Uso de memoria
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      memoryUsagePercentage < 50
                        ? "bg-green-500"
                        : memoryUsagePercentage < 80
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${memoryUsagePercentage}%` }}
                  ></div>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {memoryUsagePercentage < 50
                    ? "Uso óptimo"
                    : memoryUsagePercentage < 80
                    ? "Uso moderado"
                    : "Uso crítico"}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-slate-400">
              Información de memoria no disponible
            </p>
          )}
        </div>

        {/* Análisis de red */}
        <div className="bg-slate-800 rounded-lg p-4">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
            <FaNetworkWired className="mr-2" />
            Análisis de Red
          </h4>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Requests totales</span>
              <span className="text-white font-semibold">
                {stats.network.requests}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400">Errores</span>
              <span className="text-red-400 font-semibold">
                {stats.network.errors}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400">Tiempo promedio</span>
              <span className="text-white font-semibold">
                {stats.network.avgResponseTime.toFixed(0)}ms
              </span>
            </div>

            <div className="pt-2 border-t border-slate-700">
              <div className="text-xs text-slate-400 mb-2">Tasa de éxito</div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    stats.network.requests > 0 &&
                    stats.network.errors / stats.network.requests < 0.05
                      ? "bg-green-500"
                      : stats.network.requests > 0 &&
                        stats.network.errors / stats.network.requests < 0.1
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                  style={{
                    width: `${
                      stats.network.requests > 0
                        ? Math.max(
                            ((stats.network.requests - stats.network.errors) /
                              stats.network.requests) *
                              100,
                            0
                          )
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {stats.network.requests > 0
                  ? `${(
                      ((stats.network.requests - stats.network.errors) /
                        stats.network.requests) *
                      100
                    ).toFixed(1)}% exitosos`
                  : "Sin requests"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estado del sistema */}
      <div className="bg-slate-800 rounded-lg p-4">
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
          <FaServer className="mr-2" />
          Estado del Sistema
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Estado general */}
          <div className="p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-400 font-semibold">
                Estado General
              </span>
              <span className="text-green-400">🟢</span>
            </div>
            <div className="text-green-300 text-sm">Sistema operativo</div>
            <div className="text-xs text-green-400 mt-1">
              Sin problemas críticos
            </div>
          </div>

          {/* Estado de memoria */}
          <div
            className={`p-3 border rounded-lg ${
              memoryUsagePercentage < 50
                ? "bg-green-900/20 border-green-500/30"
                : memoryUsagePercentage < 80
                ? "bg-yellow-900/20 border-yellow-500/30"
                : "bg-red-900/20 border-red-500/30"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className={`font-semibold ${
                  memoryUsagePercentage < 50
                    ? "text-green-400"
                    : memoryUsagePercentage < 80
                    ? "text-yellow-400"
                    : "text-red-400"
                }`}
              >
                Memoria
              </span>
              <span
                className={
                  memoryUsagePercentage < 50
                    ? "text-green-400"
                    : memoryUsagePercentage < 80
                    ? "text-yellow-400"
                    : "text-red-400"
                }
              >
                {memoryUsagePercentage < 50
                  ? "🟢"
                  : memoryUsagePercentage < 80
                  ? "🟡"
                  : "🔴"}
              </span>
            </div>
            <div
              className={`text-sm ${
                memoryUsagePercentage < 50
                  ? "text-green-300"
                  : memoryUsagePercentage < 80
                  ? "text-yellow-300"
                  : "text-red-300"
              }`}
            >
              {memoryUsagePercentage.toFixed(1)}% utilizada
            </div>
            <div
              className={`text-xs mt-1 ${
                memoryUsagePercentage < 50
                  ? "text-green-400"
                  : memoryUsagePercentage < 80
                  ? "text-yellow-400"
                  : "text-red-400"
              }`}
            >
              {memoryStatus.status}
            </div>
          </div>

          {/* Estado de red */}
          <div
            className={`p-3 border rounded-lg ${
              stats.network.avgResponseTime < 500
                ? "bg-green-900/20 border-green-500/30"
                : stats.network.avgResponseTime < 1000
                ? "bg-yellow-900/20 border-yellow-500/30"
                : "bg-red-900/20 border-red-500/30"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className={`font-semibold ${
                  stats.network.avgResponseTime < 500
                    ? "text-green-400"
                    : stats.network.avgResponseTime < 1000
                    ? "text-yellow-400"
                    : "text-red-400"
                }`}
              >
                Red
              </span>
              <span
                className={
                  stats.network.avgResponseTime < 500
                    ? "text-green-400"
                    : stats.network.avgResponseTime < 1000
                    ? "text-yellow-400"
                    : "text-red-400"
                }
              >
                {stats.network.avgResponseTime < 500
                  ? "🟢"
                  : stats.network.avgResponseTime < 1000
                  ? "🟡"
                  : "🔴"}
              </span>
            </div>
            <div
              className={`text-sm ${
                stats.network.avgResponseTime < 500
                  ? "text-green-300"
                  : stats.network.avgResponseTime < 1000
                  ? "text-yellow-300"
                  : "text-red-300"
              }`}
            >
              {stats.network.avgResponseTime.toFixed(0)}ms avg
            </div>
            <div
              className={`text-xs mt-1 ${
                stats.network.avgResponseTime < 500
                  ? "text-green-400"
                  : stats.network.avgResponseTime < 1000
                  ? "text-yellow-400"
                  : "text-red-400"
              }`}
            >
              {networkStatus.status}
            </div>
          </div>
        </div>
      </div>

      {/* Alertas del sistema */}
      <div className="bg-slate-800 rounded-lg p-4">
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
          <FaExclamationTriangle className="mr-2" />
          Alertas del Sistema
        </h4>

        <div className="space-y-3">
          {memoryUsagePercentage > 80 && (
            <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
              <div className="text-red-400 font-semibold text-sm mb-1">
                🚨 Uso de memoria crítico
              </div>
              <div className="text-red-300 text-xs">
                La memoria está al {memoryUsagePercentage.toFixed(1)}%.
                Considera reiniciar la aplicación.
              </div>
            </div>
          )}

          {stats.network.errors > 5 && (
            <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
              <div className="text-red-400 font-semibold text-sm mb-1">
                🌐 Errores de red
              </div>
              <div className="text-red-300 text-xs">
                Hay {stats.network.errors} errores de red. Verifica la
                conectividad.
              </div>
            </div>
          )}

          {stats.network.avgResponseTime > 2000 && (
            <div className="p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
              <div className="text-yellow-400 font-semibold text-sm mb-1">
                ⚠️ Respuesta lenta
              </div>
              <div className="text-yellow-300 text-xs">
                El tiempo de respuesta promedio es{" "}
                {stats.network.avgResponseTime.toFixed(0)}ms. Considera
                optimizar.
              </div>
            </div>
          )}

          {memoryUsagePercentage < 50 &&
            stats.network.avgResponseTime < 500 &&
            stats.network.errors === 0 && (
              <div className="p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                <div className="text-green-400 font-semibold text-sm mb-1">
                  ✅ Sistema saludable
                </div>
                <div className="text-green-300 text-xs">
                  Todos los sistemas están funcionando de manera óptima.
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
