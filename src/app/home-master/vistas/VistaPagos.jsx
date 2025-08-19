"use client";
import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  FaCreditCard,
  FaCalendarAlt,
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock,
  FaSearch,
  FaFilter,
  FaEye,
  FaBell,
  FaDollarSign,
  FaUsers,
  FaStore,
  FaTrash,
  FaBan,
  FaCheck,
} from "react-icons/fa";
import { usePagos } from "../../../hooks/usePagos";

export default function VistaPagos() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Usar el hook de pagos
  const {
    restaurants,
    loading,
    error,
    sendPaymentReminder,
    markPaymentAsPaid,
    deleteRestaurant,
    suspendRestaurant,
    enableRestaurant,
    getPaymentStats,
    filterRestaurants,
  } = usePagos();

  // Filtrar restaurantes usando el hook
  const filteredRestaurants = useMemo(() => {
    return filterRestaurants(searchTerm, filterStatus);
  }, [filterRestaurants, searchTerm, filterStatus]);

  // Estadísticas usando el hook
  const stats = useMemo(() => {
    return getPaymentStats();
  }, [getPaymentStats]);

  // Función para obtener el color del estado
  const getStatusColor = (estado) => {
    switch (estado) {
      case "alDia":
        return "text-green-400";
      case "vencido":
        return "text-red-400";
      case "proximo":
        return "text-yellow-400";
      default:
        return "text-gray-400";
    }
  };

  // Función para obtener el icono del estado
  const getStatusIcon = (estado) => {
    switch (estado) {
      case "alDia":
        return <FaCheckCircle className="text-green-500" />;
      case "vencido":
        return <FaExclamationTriangle className="text-red-500" />;
      case "proximo":
        return <FaClock className="text-yellow-500" />;
      default:
        return <FaClock className="text-gray-500" />;
    }
  };

  // Función para formatear fecha
  const formatDate = (date) => {
    if (!date) return "No disponible";

    try {
      // Si es un timestamp de Firestore, convertirlo
      if (date.toDate) {
        return date.toDate().toLocaleDateString("es-ES", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      }

      // Si es una fecha normal
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        return "Fecha inválida";
      }

      return dateObj.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      return "Error en fecha";
    }
  };

  // Función para calcular días restantes
  const getDaysRemaining = (proximoPago) => {
    const today = new Date();
    const nextPayment = new Date(proximoPago);
    const diffTime = nextPayment - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Función para enviar recordatorio
  const sendReminder = async (restaurantId) => {
    setActionLoading(true);
    try {
      const result = await sendPaymentReminder(restaurantId);
      if (result.success) {
        alert(
          `Recordatorio enviado a ${
            restaurants.find((r) => r.id === restaurantId)?.nombre
          }`
        );
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      alert("Error al enviar recordatorio");
    } finally {
      setActionLoading(false);
    }
  };

  // Función para ver detalles del restaurante
  const viewRestaurantDetails = (restaurant) => {
    setSelectedRestaurant(restaurant);
  };

  // Función para eliminar restaurante
  const handleDeleteRestaurant = async (restaurantId) => {
    const confirmed = confirm(
      "⚠️ ADVERTENCIA: ¿Estás seguro de que quieres eliminar completamente este restaurante?\n\n" +
        "• Se eliminarán todos los datos del restaurante\n" +
        "• Esta acción no se puede deshacer\n" +
        "• Se perderán todos los datos permanentemente\n\n" +
        "¿Continuar con la eliminación?"
    );

    if (confirmed) {
      setActionLoading(true);
      try {
        const result = await deleteRestaurant(restaurantId);
        if (result.success) {
          alert(`✅ ${result.message}`);
          setSelectedRestaurant(null);
        } else {
          alert(`❌ Error: ${result.message}`);
        }
      } catch (error) {
        alert("❌ Error inesperado al eliminar el restaurante");
      } finally {
        setActionLoading(false);
      }
    }
  };

  // Función para suspender restaurante
  const handleSuspendRestaurant = async (restaurantId) => {
    const confirmed = confirm(
      "⚠️ ¿Estás seguro de que quieres suspender este restaurante por falta de pago?\n\n" +
        "• El restaurante quedará inactivo\n" +
        "• No podrá acceder al sistema\n" +
        "• Se puede habilitar nuevamente después\n\n" +
        "¿Continuar con la suspensión?"
    );

    if (confirmed) {
      setActionLoading(true);
      try {
        const result = await suspendRestaurant(restaurantId);
        if (result.success) {
          alert(`✅ ${result.message}`);
          setSelectedRestaurant(null);
        } else {
          alert(`❌ Error: ${result.message}`);
        }
      } catch (error) {
        alert("❌ Error inesperado al suspender el restaurante");
      } finally {
        setActionLoading(false);
      }
    }
  };

  // Función para habilitar restaurante
  const handleEnableRestaurant = async (restaurantId) => {
    const confirmed = confirm(
      "✅ ¿Estás seguro de que quieres habilitar nuevamente este restaurante?\n\n" +
        "• El restaurante volverá a estar activo\n" +
        "• Podrá acceder al sistema normalmente\n\n" +
        "¿Continuar con la habilitación?"
    );

    if (confirmed) {
      setActionLoading(true);
      try {
        const result = await enableRestaurant(restaurantId);
        if (result.success) {
          alert(`✅ ${result.message}`);
          setSelectedRestaurant(null);
        } else {
          alert(`❌ Error: ${result.message}`);
        }
      } catch (error) {
        alert("❌ Error inesperado al habilitar el restaurante");
      } finally {
        setActionLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Error al cargar datos</div>
          <div className="text-gray-400 mb-4">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="text-white p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2">Gestión de Pagos</h2>
          <p className="text-gray-400">
            Administra los pagos de todos los restaurantes
          </p>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Restaurantes</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <FaStore className="text-blue-500 text-2xl" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Al Día</p>
              <p className="text-2xl font-bold text-green-400">{stats.alDia}</p>
            </div>
            <FaCheckCircle className="text-green-500 text-2xl" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Próximos a Vencer</p>
              <p className="text-2xl font-bold text-yellow-400">
                {stats.proximos}
              </p>
            </div>
            <FaClock className="text-yellow-500 text-2xl" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Vencidos</p>
              <p className="text-2xl font-bold text-red-400">
                {stats.vencidos}
              </p>
            </div>
            <FaExclamationTriangle className="text-red-500 text-2xl" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Ingresos Mensuales</p>
              <p className="text-2xl font-bold text-green-400">
                ${stats.ingresosMensuales.toFixed(2)}
              </p>
            </div>
            <FaDollarSign className="text-green-500 text-2xl" />
          </div>
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
            onClick={() => setFilterStatus("all")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filterStatus === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Todos ({stats.total})
          </button>
          <button
            onClick={() => setFilterStatus("alDia")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filterStatus === "alDia"
                ? "bg-green-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Al Día ({stats.alDia})
          </button>
          <button
            onClick={() => setFilterStatus("proximo")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filterStatus === "proximo"
                ? "bg-yellow-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Próximos ({stats.proximos})
          </button>
          <button
            onClick={() => setFilterStatus("vencido")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filterStatus === "vencido"
                ? "bg-red-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Vencidos ({stats.vencidos})
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
                  Fecha Activación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Tipo Servicio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Próximo Pago
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Precio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Cuotas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Acciones
                </th>
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
                      {getStatusIcon(restaurant.estadoPago)}
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {formatDate(restaurant.fechaActivacion)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        restaurant.tipoServicio === "conFinanzas"
                          ? "bg-purple-900 text-purple-200"
                          : "bg-blue-900 text-blue-200"
                      }`}
                    >
                      {restaurant.tipoServicio === "conFinanzas"
                        ? "Con Finanzas"
                        : "Sin Finanzas"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm text-gray-400">
                        {formatDate(restaurant.proximoPago)}
                      </div>
                      <div
                        className={`text-xs ${getStatusColor(
                          restaurant.estadoPago
                        )}`}
                      >
                        {restaurant.diasRestantes > 0
                          ? `${restaurant.diasRestantes} días restantes`
                          : restaurant.diasRestantes < 0
                          ? `${Math.abs(restaurant.diasRestantes)} días vencido`
                          : "Vence hoy"}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    ${restaurant.precio}
                    <div className="text-xs text-gray-500">
                      {restaurant.periodicidad === "mensual"
                        ? "mensual"
                        : "anual"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {restaurant.cuotasPagadas}/{restaurant.cuotasTotales}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => viewRestaurantDetails(restaurant)}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <FaEye />
                      </button>
                      {restaurant.estadoPago === "vencido" && (
                        <button
                          onClick={() => sendReminder(restaurant.id)}
                          disabled={actionLoading}
                          className="text-yellow-400 hover:text-yellow-300 transition-colors disabled:opacity-50"
                          title="Enviar recordatorio"
                        >
                          {actionLoading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-400"></div>
                          ) : (
                            <FaBell />
                          )}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRestaurants.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-400 text-lg mb-2">
              {searchTerm || filterStatus !== "all"
                ? "No se encontraron restaurantes con los filtros aplicados"
                : "No hay restaurantes registrados"}
            </div>
            {(searchTerm || filterStatus !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterStatus("all");
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal de Detalles del Restaurante */}
      {selectedRestaurant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">
                Detalles: {selectedRestaurant.nombre}
              </h3>
              <button
                onClick={() => setSelectedRestaurant(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Información General</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-400">ID:</span>{" "}
                    {selectedRestaurant.id}
                  </div>
                  <div>
                    <span className="text-gray-400">Tipo Servicio:</span>{" "}
                    {selectedRestaurant.tipoServicio === "conFinanzas"
                      ? "Con Finanzas"
                      : "Sin Finanzas"}
                  </div>
                  <div>
                    <span className="text-gray-400">Periodicidad:</span>{" "}
                    {selectedRestaurant.periodicidad === "mensual"
                      ? "Mensual"
                      : "Anual"}
                  </div>
                  <div>
                    <span className="text-gray-400">Precio:</span> $
                    {selectedRestaurant.precio}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Información de Pago</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-400">Estado:</span>{" "}
                    <span
                      className={getStatusColor(selectedRestaurant.estadoPago)}
                    >
                      {selectedRestaurant.estadoPago === "alDia"
                        ? "Al Día"
                        : selectedRestaurant.estadoPago === "vencido"
                        ? "Vencido"
                        : "Próximo a Vencer"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Cuotas:</span>{" "}
                    {selectedRestaurant.cuotasPagadas}/
                    {selectedRestaurant.cuotasTotales}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-700">
              <h4 className="font-semibold mb-4">Fechas Importantes</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">
                    Fecha de Creación
                  </div>
                  <div className="text-white font-medium">
                    {formatDate(selectedRestaurant.fechaActivacion)}
                  </div>
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">Último Pago</div>
                  <div className="text-white font-medium">
                    {formatDate(selectedRestaurant.ultimoPago)}
                  </div>
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">Próximo Pago</div>
                  <div className="text-white font-medium">
                    {formatDate(selectedRestaurant.proximoPago)}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-700">
              <h4 className="font-semibold mb-4">Acciones</h4>

              {/* Acciones de Pago */}
              <div className="mb-4">
                <h5 className="text-sm font-medium text-gray-400 mb-2">
                  Gestión de Pagos
                </h5>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => sendReminder(selectedRestaurant.id)}
                    className="px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm transition-colors flex items-center"
                  >
                    <FaBell className="mr-2" />
                    Enviar Recordatorio
                  </button>
                  <button
                    onClick={async () => {
                      setActionLoading(true);
                      try {
                        const result = await markPaymentAsPaid(
                          selectedRestaurant.id
                        );
                        if (result.success) {
                          alert("Pago marcado como realizado exitosamente");
                          setSelectedRestaurant(null);
                        } else {
                          alert(`Error: ${result.message}`);
                        }
                      } catch (error) {
                        alert("Error al marcar el pago");
                      } finally {
                        setActionLoading(false);
                      }
                    }}
                    disabled={actionLoading}
                    className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors disabled:opacity-50 flex items-center"
                  >
                    <FaCheckCircle className="mr-2" />
                    {actionLoading ? "Procesando..." : "Marcar como Pagado"}
                  </button>
                </div>
              </div>

              {/* Acciones de Estado */}
              <div className="mb-4">
                <h5 className="text-sm font-medium text-gray-400 mb-2">
                  Gestión de Estado
                </h5>
                <div className="flex flex-wrap gap-2">
                  {selectedRestaurant.estado === "suspendido" ? (
                    <button
                      onClick={() =>
                        handleEnableRestaurant(selectedRestaurant.id)
                      }
                      disabled={actionLoading}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors disabled:opacity-50 flex items-center"
                    >
                      <FaCheck className="mr-2" />
                      {actionLoading ? "Procesando..." : "Habilitar Nuevamente"}
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        handleSuspendRestaurant(selectedRestaurant.id)
                      }
                      disabled={actionLoading}
                      className="px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm transition-colors disabled:opacity-50 flex items-center"
                    >
                      <FaBan className="mr-2" />
                      {actionLoading ? "Procesando..." : "Suspender"}
                    </button>
                  )}
                </div>
              </div>

              {/* Acciones Destructivas */}
              <div>
                <h5 className="text-sm font-medium text-gray-400 mb-2">
                  Acciones Destructivas
                </h5>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() =>
                      handleDeleteRestaurant(selectedRestaurant.id)
                    }
                    disabled={actionLoading}
                    className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors disabled:opacity-50 flex items-center"
                  >
                    <FaTrash className="mr-2" />
                    {actionLoading ? "Procesando..." : "Eliminar Restaurante"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
