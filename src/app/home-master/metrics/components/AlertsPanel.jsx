"use client";
import React from "react";

export default function AlertsPanel({ alerts = [] }) {
  if (alerts.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="text-green-500 text-4xl mb-2">✅</div>
            <h3 className="text-lg font-semibold text-white mb-1">
              Sin Alertas
            </h3>
            <p className="text-gray-400 text-sm">
              Todos los restaurantes funcionando correctamente
            </p>
          </div>
        </div>
      </div>
    );
  }

  const getAlertIcon = (type) => {
    switch (type) {
      case "error":
        return "🔴";
      case "warning":
        return "🟡";
      case "info":
        return "🔵";
      default:
        return "ℹ️";
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case "error":
        return "border-red-500 bg-red-500/10";
      case "warning":
        return "border-yellow-500 bg-yellow-500/10";
      case "info":
        return "border-blue-500 bg-blue-500/10";
      default:
        return "border-gray-500 bg-gray-500/10";
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "inventory":
        return "📦";
      case "orders":
        return "📋";
      case "tables":
        return "🪑";
      case "users":
        return "👥";
      default:
        return "📊";
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <span className="mr-2">🚨</span>
          Alertas del Sistema
        </h3>
        <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
          {alerts.length}
        </span>
      </div>

      <div className="space-y-3">
        {alerts.map((alert, index) => (
          <div
            key={`${alert.restaurantId}-${alert.category}-${index}`}
            className={`border-l-4 p-4 rounded-r-lg ${getAlertColor(
              alert.type
            )}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <span className="text-xl">{getAlertIcon(alert.type)}</span>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm font-medium text-white">
                      {alert.restaurantId}
                    </span>
                    <span className="text-xs text-gray-400">
                      {getCategoryIcon(alert.category)} {alert.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300">{alert.message}</p>
                </div>
              </div>
              <div className="text-xs text-gray-400">
                {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {alerts.length > 5 && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-400">
            Mostrando {alerts.length} alertas activas
          </p>
        </div>
      )}
    </div>
  );
}
