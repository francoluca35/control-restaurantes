"use client";

import { useState } from "react";
import {
  FaStore,
  FaExclamationTriangle,
  FaCheckCircle,
  FaSync,
  FaBug,
  FaUsers,
  FaTable,
  FaBox,
  FaCreditCard,
  FaClock,
  FaChartBar,
  FaFilter,
  FaSearch,
  FaEye,
  FaEyeSlash,
  FaDownload,
  FaBell,
} from "react-icons/fa";
import { useRestaurantMonitoring } from "../../../hooks/useRestaurantMonitoring";
import { useMetrics } from "../../../hooks/useMetrics";

export default function VistaRestaurantes() {
  const {
    restaurants,
    monitoringData,
    issues,
    loading,
    error,
    scanAllRestaurants,
    scanRestaurant,
    getIssuesByCategory,
    getCriticalRestaurants,
    getHealthyRestaurants,
    analyzeAndResolveIssue,
    setRestaurants,
  } = useRestaurantMonitoring();

  const { deleteMetricsCollection } = useMetrics();

  const [selectedFilter, setSelectedFilter] = useState("all");
  const [showDetails, setShowDetails] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [analyzingIssue, setAnalyzingIssue] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [resolvingAllIssues, setResolvingAllIssues] = useState(false);
  const [deletingMetrics, setDeletingMetrics] = useState(false);

  // Filtrar restaurantes según el filtro seleccionado
  const getFilteredRestaurants = () => {
    let filtered = restaurants;

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter((restaurant) =>
        restaurant.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por tipo
    switch (selectedFilter) {
      case "critical":
        return filtered.filter((restaurant) => restaurant.criticalIssues > 0);
      case "warnings":
        return filtered.filter(
          (restaurant) =>
            restaurant.warnings > 0 && restaurant.criticalIssues === 0
        );
      case "healthy":
        return filtered.filter((restaurant) => restaurant.issues.length === 0);
      case "active":
        return filtered.filter(
          (restaurant) =>
            restaurant.estado === "activo" || restaurant.estado === "habilitado"
        );
      default:
        return filtered;
    }
  };

  // Obtener estadísticas por categoría
  const issuesByCategory = getIssuesByCategory();

  // Obtener restaurantes filtrados
  const filteredRestaurants = getFilteredRestaurants();

  // Función para obtener el color del estado
  const getStatusColor = (estado) => {
    switch (estado) {
      case "activo":
      case "habilitado":
        return "text-green-400";
      case "inactivo":
      case "deshabilitado":
        return "text-red-400";
      case "pendiente":
        return "text-yellow-400";
      default:
        return "text-gray-400";
    }
  };

  // Función para obtener el icono del estado
  const getStatusIcon = (restaurant) => {
    if (restaurant.criticalIssues > 0) {
      return <FaExclamationTriangle className="text-red-500" />;
    } else if (restaurant.warnings > 0) {
      return <FaExclamationTriangle className="text-yellow-500" />;
    } else {
      return <FaCheckCircle className="text-green-500" />;
    }
  };

  // Función para formatear fecha
  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Función para obtener el tiempo transcurrido
  const getTimeAgo = (date) => {
    if (!date) return "N/A";
    const now = new Date();
    const diff = now - new Date(date);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h`;
    return "Reciente";
  };

  // Función para analizar y resolver un problema
  const handleAnalyzeIssue = async (restaurantId, issue) => {
    setAnalyzingIssue(true);
    setAnalysisResult(null);

    try {
      const result = await analyzeAndResolveIssue(restaurantId, issue);
      setAnalysisResult(result);

      // Si la resolución fue exitosa, actualizar inmediatamente el estado
      if (result.success) {
        // Actualizar el restaurante específico en la lista
        const updatedRestaurant = await scanRestaurant(restaurantId);

        setRestaurants((prevRestaurants) =>
          prevRestaurants.map((restaurant) =>
            restaurant.id === restaurantId ? updatedRestaurant : restaurant
          )
        );

        // Si el restaurante seleccionado es el que se actualizó, actualizar también el modal
        if (selectedRestaurant && selectedRestaurant.id === restaurantId) {
          setSelectedRestaurant(updatedRestaurant);
        }

        // Limpiar el resultado después de 3 segundos
        setTimeout(() => {
          setAnalysisResult(null);
        }, 3000);
      }
    } catch (error) {
      setAnalysisResult({
        success: false,
        message: "Error al analizar el problema",
        solution: error.message,
      });
    } finally {
      setAnalyzingIssue(false);
    }
  };

  // Función para eliminar métricas
  const handleDeleteMetrics = async () => {
    const confirmed = confirm(
      "⚠️ ADVERTENCIA: ¿Estás seguro de que quieres eliminar completamente todas las métricas?\n\n" +
        "• Se eliminarán todas las métricas históricas de todos los restaurantes\n" +
        "• Esta acción no se puede deshacer\n" +
        "• Los datos se perderán permanentemente\n\n" +
        "¿Continuar con la eliminación?"
    );

    if (confirmed) {
      setDeletingMetrics(true);
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
      } finally {
        setDeletingMetrics(false);
      }
    }
  };

  // Función para resolver todos los problemas de un restaurante
  const handleResolveAllIssues = async (restaurantId) => {
    setResolvingAllIssues(true);
    setAnalysisResult(null);

    try {
      const restaurant = restaurants.find((r) => r.id === restaurantId);
      if (!restaurant || restaurant.issues.length === 0) {
        setAnalysisResult({
          success: false,
          message: "No hay problemas para resolver",
          solution: "Este restaurante no tiene problemas detectados",
        });
        return;
      }

      let resolvedCount = 0;
      let failedCount = 0;
      const results = [];

      // Resolver cada problema uno por uno
      for (const issue of restaurant.issues) {
        try {
          const result = await analyzeAndResolveIssue(restaurantId, issue);
          results.push(result);
          if (result.success) {
            resolvedCount++;
          } else {
            failedCount++;
          }
        } catch (error) {
          failedCount++;
          results.push({
            success: false,
            message: `Error resolviendo ${issue.category}`,
            solution: error.message,
          });
        }
      }

      // Mostrar resultado general
      if (resolvedCount > 0) {
        setAnalysisResult({
          success: true,
          message: `${resolvedCount} de ${restaurant.issues.length} problemas resueltos`,
          solution:
            failedCount > 0
              ? `${failedCount} problemas requieren atención manual`
              : "Todos los problemas han sido resueltos automáticamente",
        });

        // Actualizar el restaurante después de resolver todos los problemas
        const updatedRestaurant = await scanRestaurant(restaurantId);

        setRestaurants((prevRestaurants) =>
          prevRestaurants.map((r) =>
            r.id === restaurantId ? updatedRestaurant : r
          )
        );

        if (selectedRestaurant && selectedRestaurant.id === restaurantId) {
          setSelectedRestaurant(updatedRestaurant);
        }
      } else {
        setAnalysisResult({
          success: false,
          message: "No se pudieron resolver problemas automáticamente",
          solution: "Todos los problemas requieren intervención manual",
        });
      }

      // Limpiar el resultado después de 5 segundos
      setTimeout(() => {
        setAnalysisResult(null);
      }, 5000);
    } catch (error) {
      setAnalysisResult({
        success: false,
        message: "Error al resolver problemas",
        solution: error.message,
      });
    } finally {
      setResolvingAllIssues(false);
    }
  };

  return (
    <div className="text-white p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2">Monitoreo de Restaurantes</h2>
          <p className="text-gray-400">
            Sistema de monitoreo y detección de problemas en tiempo real
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={scanAllRestaurants}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <FaSync className={`${loading ? "animate-spin" : ""}`} />
            <span>{loading ? "Escaneando..." : "Escanear Todo"}</span>
          </button>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            {showDetails ? <FaEyeSlash /> : <FaEye />}
            <span>{showDetails ? "Ocultar Detalles" : "Mostrar Detalles"}</span>
          </button>
          <button
            onClick={handleDeleteMetrics}
            disabled={deletingMetrics}
            className="bg-red-600 hover:bg-red-700 disabled:bg-red-800 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            title="Eliminar todas las métricas históricas de la base de datos"
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
              {deletingMetrics ? "Eliminando..." : "Eliminar Métricas"}
            </span>
          </button>
        </div>
      </div>

      {/* Estadísticas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Restaurantes</p>
              <p className="text-2xl font-bold">
                {monitoringData.totalRestaurants}
              </p>
            </div>
            <FaStore className="text-blue-500 text-2xl" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Activos</p>
              <p className="text-2xl font-bold text-green-400">
                {monitoringData.activeRestaurants}
              </p>
            </div>
            <FaCheckCircle className="text-green-500 text-2xl" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Con Problemas</p>
              <p className="text-2xl font-bold text-red-400">
                {monitoringData.restaurantsWithIssues}
              </p>
            </div>
            <FaExclamationTriangle className="text-red-500 text-2xl" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Último Escaneo</p>
              <p className="text-sm font-medium">
                {monitoringData.lastScan
                  ? formatDate(monitoringData.lastScan)
                  : "N/A"}
              </p>
              <p className="text-xs text-gray-500">
                {monitoringData.scanDuration > 0
                  ? `${monitoringData.scanDuration}ms`
                  : ""}
              </p>
            </div>
            <FaClock className="text-purple-500 text-2xl" />
          </div>
        </div>
      </div>

      {/* Problemas por Categoría */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
          <FaBug />
          <span>Problemas por Categoría</span>
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries(issuesByCategory).map(([category, counts]) => (
            <div key={category} className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                {category === "users" && <FaUsers className="text-blue-500" />}
                {category === "tables" && (
                  <FaTable className="text-green-500" />
                )}
                {category === "products" && (
                  <FaBox className="text-yellow-500" />
                )}
                {category === "payments" && (
                  <FaCreditCard className="text-purple-500" />
                )}
                {category === "orders" && (
                  <FaChartBar className="text-orange-500" />
                )}
                {category === "structure" && <FaBug className="text-red-500" />}
                {category === "performance" && (
                  <FaClock className="text-indigo-500" />
                )}
                {category === "system" && (
                  <FaExclamationTriangle className="text-gray-500" />
                )}
                <span className="font-medium capitalize">{category}</span>
              </div>
              <div className="space-y-1">
                {counts.critical > 0 && (
                  <div className="text-red-400 text-sm">
                    {counts.critical} críticos
                  </div>
                )}
                {counts.warning > 0 && (
                  <div className="text-yellow-400 text-sm">
                    {counts.warning} advertencias
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar restaurante..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setSelectedFilter("all")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedFilter === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Todos ({restaurants.length})
          </button>
          <button
            onClick={() => setSelectedFilter("critical")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedFilter === "critical"
                ? "bg-red-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Críticos ({getCriticalRestaurants().length})
          </button>
          <button
            onClick={() => setSelectedFilter("warnings")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedFilter === "warnings"
                ? "bg-yellow-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Advertencias (
            {
              restaurants.filter(
                (r) => r.warnings > 0 && r.criticalIssues === 0
              ).length
            }
            )
          </button>
          <button
            onClick={() => setSelectedFilter("healthy")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedFilter === "healthy"
                ? "bg-green-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Saludables ({getHealthyRestaurants().length})
          </button>
        </div>
      </div>

      {/* Lista de Restaurantes */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Restaurante
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Problemas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Última Actividad
                </th>
                {showDetails && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Acciones
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredRestaurants.map((restaurant) => (
                <tr
                  key={restaurant.id}
                  className="hover:bg-gray-700 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(restaurant)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-white">
                        {restaurant.nombre}
                      </div>
                      <div className="text-sm text-gray-400">
                        ID: {restaurant.id}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        restaurant.estado
                      )}`}
                    >
                      {restaurant.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      {restaurant.criticalIssues > 0 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-900 text-red-200">
                          {restaurant.criticalIssues} críticos
                        </span>
                      )}
                      {restaurant.warnings > 0 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-900 text-yellow-200">
                          {restaurant.warnings} advertencias
                        </span>
                      )}
                      {restaurant.issues.length === 0 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-900 text-green-200">
                          Sin problemas
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {getTimeAgo(restaurant.ultimaActividad)}
                  </td>
                  {showDetails && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedRestaurant(restaurant)}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        Ver Detalles
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Detalles del Restaurante */}
      {selectedRestaurant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">
                Detalles: {selectedRestaurant.nombre}
              </h3>
              <button
                onClick={() => setSelectedRestaurant(null)}
                className="text-gray-400 hover:text-white"
              >
                <FaEyeSlash />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="font-semibold mb-2">Información General</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-400">ID:</span>{" "}
                    {selectedRestaurant.id}
                  </div>
                  <div>
                    <span className="text-gray-400">Estado:</span>{" "}
                    {selectedRestaurant.estado}
                  </div>
                  <div>
                    <span className="text-gray-400">Fecha Creación:</span>{" "}
                    {formatDate(selectedRestaurant.fechaCreacion)}
                  </div>
                  <div>
                    <span className="text-gray-400">Última Actividad:</span>{" "}
                    {formatDate(selectedRestaurant.ultimaActividad)}
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Resumen de Problemas</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-400">Total Problemas:</span>{" "}
                    {selectedRestaurant.issues.length}
                  </div>
                  <div>
                    <span className="text-red-400">Críticos:</span>{" "}
                    {selectedRestaurant.criticalIssues}
                  </div>
                  <div>
                    <span className="text-yellow-400">Advertencias:</span>{" "}
                    {selectedRestaurant.warnings}
                  </div>
                </div>
              </div>
            </div>

            {selectedRestaurant.issues.length > 0 ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold">Problemas Detectados</h4>
                  <button
                    onClick={() =>
                      handleResolveAllIssues(selectedRestaurant.id)
                    }
                    disabled={resolvingAllIssues || analyzingIssue}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      resolvingAllIssues || analyzingIssue
                        ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700 text-white"
                    }`}
                  >
                    {resolvingAllIssues ? (
                      <span className="flex items-center space-x-2">
                        <FaSync className="animate-spin" />
                        <span>Resolviendo...</span>
                      </span>
                    ) : (
                      <span className="flex items-center space-x-2">
                        <FaCheckCircle />
                        <span>Resolver Todos</span>
                      </span>
                    )}
                  </button>
                </div>
                <div className="space-y-3">
                  {selectedRestaurant.issues.map((issue, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${
                        issue.type === "critical"
                          ? "bg-red-900/20 border-red-700"
                          : "bg-yellow-900/20 border-yellow-700"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            {issue.type === "critical" ? (
                              <FaExclamationTriangle className="text-red-500" />
                            ) : (
                              <FaExclamationTriangle className="text-yellow-500" />
                            )}
                            <span
                              className={`font-medium ${
                                issue.type === "critical"
                                  ? "text-red-400"
                                  : "text-yellow-400"
                              }`}
                            >
                              {issue.message}
                            </span>
                            <span className="text-xs text-gray-400 capitalize">
                              ({issue.category})
                            </span>
                          </div>
                          <p className="text-sm text-gray-300">
                            {issue.details}
                          </p>

                          {/* Botón de análisis */}
                          <div className="mt-3">
                            <button
                              onClick={() =>
                                handleAnalyzeIssue(selectedRestaurant.id, issue)
                              }
                              disabled={analyzingIssue || resolvingAllIssues}
                              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                                analyzingIssue || resolvingAllIssues
                                  ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                                  : "bg-blue-600 hover:bg-blue-700 text-white"
                              }`}
                            >
                              {analyzingIssue ? (
                                <span className="flex items-center space-x-1">
                                  <FaSync className="animate-spin" />
                                  <span>Analizando...</span>
                                </span>
                              ) : (
                                <span className="flex items-center space-x-1">
                                  <FaBug />
                                  <span>Analizar y Resolver</span>
                                </span>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Resultado del análisis */}
                {analysisResult && (
                  <div
                    className={`mt-4 p-4 rounded-lg border ${
                      analysisResult.success
                        ? "bg-green-900/20 border-green-700"
                        : "bg-red-900/20 border-red-700"
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      {analysisResult.success ? (
                        <FaCheckCircle className="text-green-500 mt-1" />
                      ) : (
                        <FaExclamationTriangle className="text-red-500 mt-1" />
                      )}
                      <div className="flex-1">
                        <h5
                          className={`font-medium ${
                            analysisResult.success
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {analysisResult.message}
                        </h5>
                        <p className="text-sm text-gray-300 mt-1">
                          {analysisResult.solution}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <FaCheckCircle className="text-green-500 text-4xl mx-auto mb-4" />
                <p className="text-green-400 font-medium">
                  Sin problemas detectados
                </p>
                <p className="text-gray-400 text-sm">
                  Este restaurante está funcionando correctamente
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mensaje de Error */}
      {error && (
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <FaExclamationTriangle className="text-red-500" />
            <span className="text-red-400 font-medium">
              Error en el escaneo:
            </span>
          </div>
          <p className="text-red-300 mt-2">{error}</p>
        </div>
      )}

      {/* Estado de Carga */}
      {loading && (
        <div className="text-center py-8">
          <FaSync className="animate-spin text-blue-500 text-2xl mx-auto mb-4" />
          <p className="text-blue-400">Escaneando restaurantes...</p>
        </div>
      )}
    </div>
  );
}
