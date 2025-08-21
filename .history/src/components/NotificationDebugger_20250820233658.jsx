"use client";
import { useState, useEffect } from "react";
import { useUIStore } from "../store";
import { db } from "../lib/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import {
  Bug,
  Wifi,
  WifiOff,
  AlertCircle,
  CheckCircle,
  DollarSign,
  RefreshCw,
} from "lucide-react";

const NotificationDebugger = () => {
  const { addNotification, notifications, clearNotifications } = useUIStore();
  const [isOpen, setIsOpen] = useState(false);
  const [debugInfo, setDebugInfo] = useState({
    firebaseStatus: "checking",
    restaurantsCount: 0,
    paidRestaurantsCount: 0,
    lastError: null,
    paidRestaurantsDetails: [],
  });
  const [isLoading, setIsLoading] = useState(false);

  // Verificar estado de Firebase y restaurantes
  const checkSystemStatus = async () => {
    setIsLoading(true);
    setDebugInfo((prev) => ({ ...prev, firebaseStatus: "checking" }));

    try {
      // Verificar si Firebase está disponible
      if (!db) {
        setDebugInfo({
          firebaseStatus: "error",
          restaurantsCount: 0,
          paidRestaurantsCount: 0,
          lastError: "Firebase no está inicializado",
        });
        return;
      }

      // Contar restaurantes totales
      const restaurantsQuery = query(collection(db, "restaurantes"));
      const restaurantsSnapshot = await getDocs(restaurantsQuery);
      const totalRestaurants = restaurantsSnapshot.size;

      // Contar restaurantes con pagos aprobados
      const paidRestaurantsQuery = query(
        collection(db, "restaurantes"),
        where("estadoPago", "==", "pagado")
      );
      const paidRestaurantsSnapshot = await getDocs(paidRestaurantsQuery);
      const paidRestaurants = paidRestaurantsSnapshot.size;

      // Obtener detalles de restaurantes con pagos aprobados
      const paidRestaurantsDetails = paidRestaurantsSnapshot.docs.map(
        (doc) => ({
          id: doc.id,
          ...doc.data(),
        })
      );

      console.log(
        "🔍 Restaurantes con pagos aprobados:",
        paidRestaurantsDetails
      );

      setDebugInfo({
        firebaseStatus: "connected",
        restaurantsCount: totalRestaurants,
        paidRestaurantsCount: paidRestaurants,
        lastError: null,
        paidRestaurantsDetails: paidRestaurantsDetails,
      });

      console.log("✅ Debug info actualizada:", {
        totalRestaurants,
        paidRestaurants,
        details: paidRestaurantsDetails,
      });
    } catch (error) {
      console.error("❌ Error verificando sistema:", error);
      setDebugInfo({
        firebaseStatus: "error",
        restaurantsCount: 0,
        paidRestaurantsCount: 0,
        lastError: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Verificar estado al abrir el debugger
  useEffect(() => {
    if (isOpen) {
      checkSystemStatus();
    }
  }, [isOpen]);

  // Crear notificación de prueba
  const createTestNotification = () => {
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

  // Crear notificación de error de prueba
  const createTestErrorNotification = () => {
    addNotification({
      type: "error",
      title: "Error de prueba",
      message: "Este es un error de prueba para verificar el sistema",
      autoRemove: false,
    });
  };

  // Limpiar todas las notificaciones
  const clearAllNotifications = () => {
    clearNotifications();
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 transition-colors z-50"
        title="Debug Notificaciones"
      >
        <Bug className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-slate-800 border border-slate-600 rounded-lg shadow-xl p-4 w-80 max-h-96 overflow-y-auto z-50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
          <Bug className="w-4 h-4" />
          <span>Debug Notificaciones</span>
        </h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-slate-400 hover:text-white"
        >
          ×
        </button>
      </div>

      {/* Estado del sistema */}
      <div className="space-y-3">
        <div className="bg-slate-700 rounded p-3">
          <h4 className="text-xs font-semibold text-slate-300 mb-2">
            Estado del Sistema
          </h4>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Firebase:</span>
              <div className="flex items-center space-x-1">
                {debugInfo.firebaseStatus === "connected" ? (
                  <Wifi className="w-3 h-3 text-green-400" />
                ) : debugInfo.firebaseStatus === "error" ? (
                  <WifiOff className="w-3 h-3 text-red-400" />
                ) : (
                  <RefreshCw className="w-3 h-3 text-yellow-400 animate-spin" />
                )}
                <span
                  className={
                    debugInfo.firebaseStatus === "connected"
                      ? "text-green-400"
                      : debugInfo.firebaseStatus === "error"
                      ? "text-red-400"
                      : "text-yellow-400"
                  }
                >
                  {debugInfo.firebaseStatus === "connected"
                    ? "Conectado"
                    : debugInfo.firebaseStatus === "error"
                    ? "Error"
                    : "Verificando..."}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">Restaurantes totales:</span>
              <span className="text-white font-mono">
                {debugInfo.restaurantsCount}
              </span>
            </div>

                         <div className="flex items-center justify-between">
               <span className="text-slate-400">Con pagos aprobados:</span>
               <span className="text-green-400 font-mono">
                 {debugInfo.paidRestaurantsCount}
               </span>
             </div>

             {/* Mostrar detalles de restaurantes con pagos aprobados */}
             {debugInfo.paidRestaurantsDetails.length > 0 && (
               <div className="mt-2 p-2 bg-green-900/20 border border-green-500/30 rounded">
                 <div className="text-green-400 font-semibold mb-1">Restaurantes con pagos:</div>
                 {debugInfo.paidRestaurantsDetails.map((restaurant, index) => (
                   <div key={index} className="text-xs text-green-300 mb-1">
                     <div className="font-mono">ID: {restaurant.id}</div>
                     <div>Nombre: {restaurant.nombre}</div>
                     <div>Precio: ${restaurant.precio} {restaurant.moneda}</div>
                     <div>Fecha: {restaurant.fechaPago}</div>
                   </div>
                 ))}
               </div>
             )}
          </div>

          {debugInfo.lastError && (
            <div className="mt-2 p-2 bg-red-900/20 border border-red-500/30 rounded text-xs">
              <div className="text-red-400 font-semibold">Último error:</div>
              <div className="text-red-300">{debugInfo.lastError}</div>
            </div>
          )}
        </div>

        {/* Notificaciones actuales */}
        <div className="bg-slate-700 rounded p-3">
          <h4 className="text-xs font-semibold text-slate-300 mb-2">
            Notificaciones Actuales
          </h4>

          <div className="space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Total:</span>
              <span className="text-white font-mono">
                {notifications.length}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">Errores:</span>
              <span className="text-red-400 font-mono">
                {notifications.filter((n) => n.type === "error").length}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">Pagos:</span>
              <span className="text-green-400 font-mono">
                {notifications.filter((n) => n.type === "payment").length}
              </span>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="space-y-2">
          <button
            onClick={checkSystemStatus}
            disabled={isLoading}
            className="w-full bg-blue-600 text-white px-3 py-2 rounded text-xs font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-1"
          >
            <RefreshCw
              className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`}
            />
            <span>Verificar Sistema</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={createTestNotification}
              className="bg-green-600 text-white px-2 py-2 rounded text-xs font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-1"
            >
              <DollarSign className="w-3 h-3" />
              <span>Test Pago</span>
            </button>

            <button
              onClick={createTestErrorNotification}
              className="bg-red-600 text-white px-2 py-2 rounded text-xs font-medium hover:bg-red-700 transition-colors flex items-center justify-center space-x-1"
            >
              <AlertCircle className="w-3 h-3" />
              <span>Test Error</span>
            </button>
          </div>

          <button
            onClick={clearAllNotifications}
            className="w-full bg-slate-600 text-white px-3 py-2 rounded text-xs font-medium hover:bg-slate-700 transition-colors"
          >
            Limpiar Todas
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationDebugger;
