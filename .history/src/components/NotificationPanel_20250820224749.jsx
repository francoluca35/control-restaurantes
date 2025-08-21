"use client";
import { useEffect, useState } from "react";
import { useUIStore } from "../store";
import { toast } from "react-hot-toast";
import { X, CheckCircle, AlertCircle, DollarSign } from "lucide-react";

const NotificationPanel = () => {
  const { notifications, removeNotification, clearNotifications } =
    useUIStore();
  const [isOpen, setIsOpen] = useState(false);

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

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
      {/* Notification counter badge */}
      <div className="flex justify-end mb-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          {notifications.length} notificación
          {notifications.length !== 1 ? "es" : ""}
        </button>
      </div>

      {/* Notifications panel */}
      {isOpen && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Notificaciones
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={clearNotifications}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm"
              >
                Limpiar todo
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X size={16} />
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
                    className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    <X size={14} />
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
