"use client";
import { useEffect, useState } from "react";
import { useUIStore } from "../store";
import { db } from "../lib/firebase";
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
} from "firebase/firestore";

export const usePaymentNotifications = () => {
  const { addNotification } = useUIStore();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);

  useEffect(() => {
    // Verificar si Firebase está disponible
    if (!db) {
      console.error("❌ Firebase no está inicializado");
      setConnectionError("Firebase no está configurado correctamente");
      addNotification({
        type: "error",
        title: "Error en notificaciones",
        message:
          "Firebase no está configurado correctamente. Verifica las variables de entorno.",
        autoRemove: false,
      });
      return;
    }

    console.log("🔍 Iniciando sistema de notificaciones de pagos...");

    try {
      // Escuchar cambios en restaurantes con pagos aprobados
      const restaurantsQuery = query(
        collection(db, "restaurantes"),
        where("estadoPago", "==", "pagado"),
        orderBy("fechaPago", "desc")
      );

      console.log("📡 Configurando listener de Firestore...");

      const unsubscribe = onSnapshot(
        restaurantsQuery,
        (snapshot) => {
          console.log("✅ Listener de Firestore conectado exitosamente");
          setIsConnected(true);
          setConnectionError(null);

          snapshot.docChanges().forEach((change) => {
            console.log("📝 Cambio detectado:", change.type, change.doc.id);

            if (change.type === "modified") {
              const restaurantData = change.doc.data();
              const previousData = change.doc.metadata.hasPendingWrites
                ? null
                : change.doc.data();

              // Verificar si el pago fue recién aprobado
              if (
                restaurantData.estadoPago === "pagado" &&
                restaurantData.fechaPago &&
                (!previousData || previousData.estadoPago !== "pagado")
              ) {
                console.log("💰 Pago recién aprobado detectado:", {
                  restaurant: restaurantData.nombre,
                  amount: restaurantData.precio,
                  currency: restaurantData.moneda,
                });

                // Crear notificación de pago
                addNotification({
                  type: "payment",
                  title: `Pago recibido - ${restaurantData.nombre}`,
                  message: `Se acreditó el pago de $${restaurantData.precio} ${restaurantData.moneda} para el restaurante ${restaurantData.nombre}`,
                  data: {
                    restaurantId: change.doc.id,
                    amount: restaurantData.precio,
                    currency: restaurantData.moneda,
                    paymentId: restaurantData.mercadopagoPaymentId,
                  },
                });

                console.log("💰 Notificación de pago creada:", {
                  restaurant: restaurantData.nombre,
                  amount: restaurantData.precio,
                  currency: restaurantData.moneda,
                });
              }
            }
          });
        },
        (error) => {
          console.error("❌ Error en listener de Firestore:", error);
          setIsConnected(false);
          setConnectionError(error.message);

          // Determinar el tipo de error y mostrar mensaje apropiado
          let errorMessage =
            "No se pueden recibir notificaciones de pagos en tiempo real";

          if (error.code === "permission-denied") {
            errorMessage =
              "No tienes permisos para acceder a las notificaciones de pagos";
          } else if (error.code === "unavailable") {
            errorMessage =
              "Servicio de notificaciones temporalmente no disponible";
          } else if (error.code === "unauthenticated") {
            errorMessage = "Debes iniciar sesión para recibir notificaciones";
          }

          addNotification({
            type: "error",
            title: "Error en notificaciones",
            message: errorMessage,
            autoRemove: false,
            data: {
              errorCode: error.code,
              errorMessage: error.message,
            },
          });
        }
      );

      // Función de limpieza
      return () => {
        console.log("🧹 Limpiando listener de notificaciones...");
        unsubscribe();
        setIsConnected(false);
        setConnectionError(null);
      };
    } catch (error) {
      console.error("❌ Error configurando notificaciones:", error);
      setConnectionError(error.message);

      addNotification({
        type: "error",
        title: "Error en notificaciones",
        message: "Error al configurar el sistema de notificaciones",
        autoRemove: false,
        data: {
          errorMessage: error.message,
        },
      });
    }
  }, [addNotification]);

  // Función para crear notificación manual (para testing)
  const createTestNotification = () => {
    console.log("🧪 Creando notificación de prueba...");
    addNotification({
      type: "payment",
      title: "Pago de prueba - Restaurante Test",
      message: "Se acreditó el pago de $29.99 USD para el restaurante Test",
      data: {
        restaurantId: "test",
        amount: 29.99,
        currency: "USD",
        paymentId: "test-payment-id",
      },
    });
  };

  // Función para verificar el estado de la conexión
  const checkConnectionStatus = () => {
    return {
      isConnected,
      connectionError,
      firebaseAvailable: !!db,
    };
  };

  return {
    createTestNotification,
    checkConnectionStatus,
    isConnected,
    connectionError,
  };
};
