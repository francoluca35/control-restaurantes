"use client";
import React from "react";
import { usePaymentHistory } from "../hooks/usePaymentHistory";
import { usePagos } from "../hooks/usePagos";

const ContractSummary = () => {
  const { paymentHistory } = usePaymentHistory();
  const { restaurants } = usePagos();
  if (
    !paymentHistory ||
    !paymentHistory.payments ||
    !paymentHistory.transactions
  ) {
    return null;
  }

  // Combinar pagos y transacciones aprobadas
  const allPayments = [
    ...(paymentHistory.payments || []),
    ...(paymentHistory.transactions || []),
  ].filter((payment) => payment.status === "approved");

  // Agrupar por restaurante
  const contractsByRestaurant = allPayments.reduce((acc, payment) => {
    const restaurantId = payment.restaurantId;
    if (!acc[restaurantId]) {
      acc[restaurantId] = [];
    }
    acc[restaurantId].push(payment);
    return acc;
  }, {});

  const getRestaurantName = (restaurantId) => {
    const restaurant = restaurants.find((r) => r.id === restaurantId);
    return restaurant
      ? restaurant.nombre || restaurant.name
      : "Restaurante Desconocido";
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString("es-AR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const formatAmount = (amount, currency = "ARS") => {
    if (!amount) return "$0";
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          📄 Resumen de Contratos Disponibles
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Contratos de pagos aprobados que pueden ser descargados
        </p>
      </div>

      <div className="p-6">
        {Object.keys(contractsByRestaurant).length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">
              <svg
                className="mx-auto h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <p className="text-gray-500">
              No hay contratos disponibles para descargar
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Los contratos aparecerán aquí cuando haya pagos aprobados
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(contractsByRestaurant).map(
              ([restaurantId, payments]) => (
                <div
                  key={restaurantId}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-md font-medium text-gray-900">
                      {getRestaurantName(restaurantId)}
                    </h4>
                    <span className="text-sm text-gray-500">
                      {payments.length} contrato{payments.length > 1 ? "s" : ""}{" "}
                      disponible{payments.length > 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {payments.map((payment, index) => (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 text-sm font-medium">
                                  {index + 1}
                                </span>
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900">
                                Pago #
                                {payment.id || payment.transactionId || "N/A"}
                              </p>
                              <p className="text-sm text-gray-500">
                                {formatDate(
                                  payment.date ||
                                    payment.date_approved ||
                                    payment.created_at
                                )}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">
                              {formatAmount(
                                payment.amount || payment.transaction_amount,
                                payment.currency || payment.currency_id
                              )}
                            </p>
                            <p className="text-xs text-gray-500">
                              {payment.payment_method?.type ||
                                payment.paymentMethod ||
                                "MercadoPago"}
                            </p>
                          </div>

                          <div className="flex-shrink-0">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Aprobado
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Total de pagos:</span>
                      <span className="font-medium text-gray-900">
                        {formatAmount(
                          payments.reduce(
                            (sum, p) =>
                              sum + (p.amount || p.transaction_amount || 0),
                            0
                          ),
                          payments[0]?.currency ||
                            payments[0]?.currency_id ||
                            "ARS"
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContractSummary;
