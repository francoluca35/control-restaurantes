"use client";
import { useEffect, useState } from "react";
import { useUIStore } from "../store";
import { toast } from "react-hot-toast";
import { X, CheckCircle, AlertCircle, DollarSign, Bug, Wifi, WifiOff } from "lucide-react";

const NotificationPanel = () => {
  const { notifications, removeNotification, clearNotifications } =
    useUIStore();
  const [isOpen, setIsOpen] = useState(false);
  const [showDebug, setShowDebug] = useState(false);

  // Auto-remove notifications after 10 seconds
  useEffect(() => {
    notifications.forEach((notification) => {
      if (notification.autoRemove !== false) {
        setTimeout(() => {
          removeNotification(notification.id);
        }, 10000);
      }
    });
  }, [notifications, removeNotification]);

  // Show toast for new payment notifications
  useEffect(() => {
    const newPaymentNotifications = notifications.filter(
      (n) => n.type === "payment" && !n.toastShown
    );

    newPaymentNotifications.forEach((notification) => {
      toast.success(`💰 Pago recibido: ${notification.title}`, {
        duration: 5000,
        icon: "💰",
        style: {
          background: "#10b981",
          color: "white",
        },
      });

      // Mark as shown
      notification.toastShown = true;
    });
  }, [notifications]);

  // Función para crear notificación de prueba
  const createTestNotification = () => {
    const { addNotification } = useUIStore();
    addNotification({
      type: "payment",
      title: "Pago de prueba - Restaurante Test",
      message: "Se acreditó el pago de $10 ARS para el restaurante Test",
      data: {
        restaurantId: "test",
        amount: 10,
        currency: "ARS",
        paymentId: "test-payment-id",
      },
    });
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
      {/* Notification counter badge */}
      <div className="flex justify-end mb-2 space-x-2">
        {/* Debug button */}
        <button
          onClick={() => setShowDebug(!showDebug)}
          className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium hover:bg-purple-700 transition-colors flex items-center space-x-1"
          title="Debug notificaciones"
        >
          <Bug className="w-3 h-3" />
          <span>Debug</span>
        </button>

        {/* Test notification button */}
        <button
          onClick={createTestNotification}
          className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium hover:bg-green-700 transition-colors flex items-center space-x-1"
          title="Crear notificación de prueba"
        >
          <DollarSign className="w-3 h-3" />
          <span>Test</span>
        </button>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          {notifications.length} notificación
          {notifications.length !== 1 ? "es" : ""}
        </button>
      </div>

      {/* Debug panel */}
      {showDebug && (
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 mb-2 text-xs text-slate-300">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold">Debug Notificaciones</h4>
            <button
              onClick={() => setShowDebug(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span>Total notificaciones:</span>
              <span className="font-mono">{notifications.length}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span>Errores:</span>
              <span className="font-mono text-red-400">
                {notifications.filter(n => n.type === "error").length}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span>Pagos:</span>
              <span className="font-mono text-green-400">
                {notifications.filter(n => n.type === "payment").length}
              </span>
            </div>

            {/* Mostrar detalles de errores */}
            {notifications.filter(n => n.type === "error").length > 0 && (
              <div className="mt-2 p-2 bg-red-900/20 border border-red-500/30 rounded">
                <div className="font-semibold text-red-400 mb-1">Errores detectados:</div>
                {notifications
                  .filter(n => n.type === "error")
                  .map((error, index) => (
                    <div key={index} className="text-xs">
                      <div className="font-mono">{error.message}</div>
                      {error.data?.errorCode && (
                        <div className="text-red-300">Código: {error.data.errorCode}</div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notifications panel */}
      {isOpen && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-600">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Notificaciones
            </h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={clearNotifications}
                className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Limpiar todo
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 mb-2 rounded-lg border-l-4 ${
                  notification.type === "payment"
                    ? "bg-green-50 border-green-400 dark:bg-green-900/20 dark:border-green-500"
                    : notification.type === "error"
                    ? "bg-red-50 border-red-400 dark:bg-red-900/20 dark:border-red-500"
                    : "bg-blue-50 border-blue-400 dark:bg-blue-900/20 dark:border-blue-500"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="flex-shrink-0 mt-0.5">
                      {notification.type === "payment" ? (
                        <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                      ) : notification.type === "error" ? (
                        <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                      ) : (
                        <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {notification.title}
                      </p>
                      {notification.message && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          {notification.message}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {new Date(notification.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeNotification(notification.id)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 ml-2"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;
