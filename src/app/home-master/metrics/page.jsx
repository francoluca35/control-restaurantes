"use client";
import React, { useState } from "react";
import { useMetrics } from "../../../hooks/useMetrics";
import AlertsPanel from "./components/AlertsPanel";
import PerformanceDashboard from "./components/PerformanceDashboard";
import BusinessDashboard from "./components/BusinessDashboard";
import SystemDashboard from "./components/SystemDashboard";

export default function MetricsPage() {
  const {
    metrics,
    loading,
    error,
    lastUpdate,
    generateMetrics,
    loadExistingMetrics,
    deleteMetricsCollection,
    getGeneralStats,
    getAlerts,
  } = useMetrics();

  const [activeTab, setActiveTab] = useState("overview");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateMetrics = async () => {
    setIsGenerating(true);
    try {
      await generateMetrics();
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefreshMetrics = async () => {
    await loadExistingMetrics();
  };

  const handleDeleteMetrics = async () => {
    const confirmed = confirm(
      "⚠️ ADVERTENCIA: ¿Estás seguro de que quieres eliminar completamente todas las métricas?\n\n" +
        "• Se eliminarán todas las métricas históricas\n" +
        "• Esta acción no se puede deshacer\n" +
        "• Los datos se perderán permanentemente\n\n" +
        "¿Continuar con la eliminación?"
    );

    if (confirmed) {
      try {
        const result = await deleteMetricsCollection();
        if (result.success) {
          alert(
            `✅ ${result.message}\n\nLas métricas han sido eliminadas exitosamente.`
          );
          // Recargar la página para actualizar la vista
          window.location.reload();
        } else {
          alert(`❌ Error al eliminar métricas: ${result.message}`);
        }
      } catch (error) {
        alert(`❌ Error inesperado: ${error.message}`);
      }
    }
  };

  const generalStats = getGeneralStats();
  const alerts = getAlerts();

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="text-red-500 text-xl mb-4">
              Error al cargar métricas
            </div>
            <div className="text-gray-400 mb-6">{error}</div>
            <button
              onClick={handleRefreshMetrics}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white">
                Dashboard de Métricas
              </h1>
              <p className="text-gray-400 mt-2">
                Monitoreo en tiempo real de todos los restaurantes
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleRefreshMetrics}
                disabled={loading}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50"
              >
                {loading ? "Cargando..." : "Actualizar"}
              </button>
              <button
                onClick={handleGenerateMetrics}
                disabled={isGenerating}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isGenerating ? "Generando..." : "Generar Nuevas Métricas"}
              </button>
              <button
                onClick={handleDeleteMetrics}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center space-x-2"
                title="Eliminar todas las métricas antiguas de la base de datos"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                <span>
                  {loading ? "Eliminando..." : "Eliminar Métricas Antiguas"}
                </span>
              </button>
            </div>
          </div>

          {lastUpdate && (
            <div className="text-sm text-gray-400">
              Última actualización: {lastUpdate.toLocaleString()}
            </div>
          )}
        </div>

        {/* Estadísticas Generales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-500 rounded-lg">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">
                  Restaurantes
                </p>
                <p className="text-2xl font-semibold text-white">
                  {generalStats.totalRestaurants}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-500 rounded-lg">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">
                  Pedidos Totales
                </p>
                <p className="text-2xl font-semibold text-white">
                  {generalStats.totalOrders}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-500 rounded-lg">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Ingresos</p>
                <p className="text-2xl font-semibold text-white">
                  ${generalStats.totalRevenue.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-500 rounded-lg">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Stock Bajo</p>
                <p className="text-2xl font-semibold text-white">
                  {generalStats.lowStockItems}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            {[
              { id: "overview", label: "Vista General", icon: "📊" },
              { id: "performance", label: "Performance", icon: "⚡" },
              { id: "business", label: "Negocio", icon: "💰" },
              { id: "system", label: "Sistema", icon: "🔧" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Alertas siempre visibles */}
          <AlertsPanel alerts={alerts} />

          {/* Contenido según tab activo */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Restaurantes Activos
                </h3>
                <div className="space-y-3">
                  {Object.keys(metrics).map((restaurantId) => {
                    const restaurantMetrics = metrics[restaurantId];
                    const business = restaurantMetrics?.business || {};
                    const orders = business.orders || {};
                    const inventory = business.inventory || {};

                    return (
                      <div
                        key={restaurantId}
                        className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-white">
                            {restaurantId}
                          </p>
                          <p className="text-sm text-gray-400">
                            {orders.total || 0} pedidos •{" "}
                            {inventory.totalItems || 0} productos
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-green-400">
                            $
                            {(
                              (orders.averageValue || 0) * (orders.total || 0)
                            ).toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-400">ingresos</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Resumen de Actividad
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">
                      Promedio de pedidos por restaurante:
                    </span>
                    <span className="text-white font-medium">
                      {generalStats.averagePerformance.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">
                      Usuarios activos totales:
                    </span>
                    <span className="text-white font-medium">
                      {generalStats.activeUsers}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">
                      Productos con stock bajo:
                    </span>
                    <span className="text-white font-medium">
                      {generalStats.lowStockItems}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "performance" && (
            <PerformanceDashboard metrics={metrics} />
          )}

          {activeTab === "business" && <BusinessDashboard metrics={metrics} />}

          {activeTab === "system" && <SystemDashboard metrics={metrics} />}
        </div>
      </div>
    </div>
  );
}
