"use client";
import React, { useState, useEffect } from "react";
import { usePaymentHistory } from "../hooks/usePaymentHistory";
import { usePagos } from "../hooks/usePagos";
import NotificationToast from "./NotificationToast";

const PaymentHistoryTable = ({ restaurantId = null }) => {
  const {
    paymentHistory,
    loading,
    error,
    loadPaymentHistory,
    downloadContract,
  } = usePaymentHistory();
  const { restaurants } = usePagos();
  const [selectedRestaurant, setSelectedRestaurant] = useState(restaurantId);
  const [downloadingContract, setDownloadingContract] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (selectedRestaurant) {
      loadPaymentHistory(selectedRestaurant);
    } else {
      loadPaymentHistory();
    }
  }, [selectedRestaurant, loadPaymentHistory]);

  const handleDownloadContract = async (payment) => {
    try {
      setDownloadingContract(payment.id);

      // Buscar datos del restaurante
      const restaurant = restaurants.find((r) => r.id === payment.restaurantId);
      if (!restaurant) {
        throw new Error("No se encontraron datos del restaurante");
      }

      const result = await downloadContract(payment, restaurant);

      if (result.success) {
        setNotification({
          message: "Contrato descargado exitosamente",
          type: "success",
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error("Error al descargar contrato:", error);
      setNotification({
        message: "Error al descargar el contrato",
        type: "error",
      });
    } finally {
      setDownloadingContract(null);
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString("es-AR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAmount = (amount, currency = "ARS") => {
    if (!amount) return "$0";
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      approved: { text: "Aprobado", class: "bg-green-100 text-green-800" },
      pending: { text: "Pendiente", class: "bg-yellow-100 text-yellow-800" },
      rejected: { text: "Rechazado", class: "bg-red-100 text-red-800" },
      cancelled: { text: "Cancelado", class: "bg-gray-100 text-gray-800" },
    };

    const config = statusConfig[status] || {
      text: status,
      class: "bg-gray-100 text-gray-800",
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${config.class}`}
      >
        {config.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Cargando historial...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  const allPayments = [
    ...(paymentHistory.payments || []),
    ...(paymentHistory.transactions || []),
  ].sort((a, b) => {
    const dateA = new Date(a.date || a.date_approved || a.created_at);
    const dateB = new Date(b.date || b.date_approved || b.created_at);
    return dateB - dateA;
  });

  return (
    <div className="space-y-6">
      {/* Notificación Toast */}
      {notification && (
        <NotificationToast
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      {/* Filtro de restaurante */}
      {!restaurantId && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <label
            htmlFor="restaurant-filter"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Filtrar por restaurante:
          </label>
          <select
            id="restaurant-filter"
            value={selectedRestaurant || ""}
            onChange={(e) => setSelectedRestaurant(e.target.value || null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los restaurantes</option>
            {restaurants.map((restaurant) => (
              <option key={restaurant.id} value={restaurant.id}>
                {restaurant.nombre || restaurant.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Estadísticas */}
      {paymentHistory.statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow border">
            <h3 className="text-sm font-medium text-gray-500">
              Total de Pagos
            </h3>
            <p className="text-2xl font-bold text-gray-900">
              {paymentHistory.statistics.totalPayments}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <h3 className="text-sm font-medium text-gray-500">
              Pagos Aprobados
            </h3>
            <p className="text-2xl font-bold text-green-600">
              {paymentHistory.statistics.approvedPayments}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <h3 className="text-sm font-medium text-gray-500">Monto Total</h3>
            <p className="text-2xl font-bold text-blue-600">
              {formatAmount(paymentHistory.statistics.totalAmount)}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <h3 className="text-sm font-medium text-gray-500">
              Tasa de Aprobación
            </h3>
            <p className="text-2xl font-bold text-purple-600">
              {paymentHistory.statistics.approvalRate.toFixed(1)}%
            </p>
          </div>
        </div>
      )}

      {/* Tabla de pagos */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Historial de Pagos
          </h2>
        </div>

        {allPayments.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">
              No se encontraron pagos en el historial
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Restaurante
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Método
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID Transacción
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contrato
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allPayments.map((payment) => {
                  const restaurant = restaurants.find(
                    (r) => r.id === payment.restaurantId
                  );
                  return (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(
                          payment.date ||
                            payment.date_approved ||
                            payment.created_at
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {restaurant
                          ? restaurant.nombre || restaurant.name
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatAmount(
                          payment.amount || payment.transaction_amount,
                          payment.currency || payment.currency_id
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.payment_method?.type ||
                          payment.paymentMethod ||
                          "MercadoPago"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(payment.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payment.id || payment.transactionId || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {payment.status === "approved" && (
                          <button
                            onClick={() => handleDownloadContract(payment)}
                            disabled={downloadingContract === payment.id}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                          >
                            {downloadingContract === payment.id ? (
                              <>
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                                Descargando...
                              </>
                            ) : (
                              <>📄 Descargar Contrato</>
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentHistoryTable;
