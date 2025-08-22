"use client";
import React from "react";
import PaymentHistoryTable from "../../../components/PaymentHistoryTable";

export default function VistaHistorial() {
  return (
    <div className="text-gray-900 p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Historial de Pagos
          </h1>
          <p className="text-gray-600">
            Gestiona y revisa el historial completo de pagos, transacciones y
            contratos de todos los restaurantes.
          </p>
        </div>

        {/* Información adicional */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Funcionalidades del Historial
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Visualiza todos los pagos y transacciones realizadas</li>
                  <li>Filtra por restaurante específico</li>
                  <li>Descarga contratos de pagos aprobados</li>
                  <li>Revisa estadísticas de pagos y tasas de aprobación</li>
                  <li>Accede a información detallada de cada transacción</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Tabla de historial de pagos */}
        <PaymentHistoryTable />
      </div>
    </div>
  );
}
