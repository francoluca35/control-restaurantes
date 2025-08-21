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
    console.log("📊 Estado inicial - Firebase disponible:", !!db);

    try {
      // Primero intentar con la consulta completa (requiere índice)
      const restaurantsQuery = query(
        collection(db, "restaurantes"),
        where("estadoPago", "==", "pagado"),
        orderBy("fechaPago", "desc")
      );

      console.log("📡 Configurando listener de Firestore...");
      console.log("🔍 Query configurada:", {
        collection: "restaurantes",
        where: "estadoPago == 'pagado'",
        orderBy: "fechaPago desc",
      });

      const unsubscribe = onSnapshot(
        restaurantsQuery,
        (snapshot) => {
          console.log("✅ Listener de Firestore conectado exitosamente");
          console.log("📊 Snapshot recibido:", {
            size: snapshot.size,
            empty: snapshot.empty,
            docs: snapshot.docs.length,
          });

          setIsConnected(true);
          setConnectionError(null);

          snapshot.docChanges().forEach((change) => {
            console.log("📝 Cambio detectado:", {
              type: change.type,
              docId: change.doc.id,
              hasPendingWrites: change.doc.metadata.hasPendingWrites,
            });

            if (change.type === "modified") {
              const restaurantData = change.doc.data();
              const previousData = change.doc.metadata.hasPendingWrites
                ? null
                : change.doc.data();

              console.log("🔍 Datos del restaurante:", {
                nombre: restaurantData.nombre,
                estadoPago: restaurantData.estadoPago,
                fechaPago: restaurantData.fechaPago,
                precio: restaurantData.precio,
                moneda: restaurantData.moneda,
              });

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
                  docId: change.doc.id,
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
              } else {
                console.log(
                  "⚠️ Cambio detectado pero no es un pago recién aprobado:",
                  {
                    estadoPago: restaurantData.estadoPago,
                    fechaPago: restaurantData.fechaPago,
                    previousEstadoPago: previousData?.estadoPago,
                  }
                );
              }
            }
          });
        },
        (error) => {
          console.error("❌ Error en listener de Firestore:", error);
          setIsConnected(false);
          setConnectionError(error.message);

          // Si es un error de índice, mostrar mensaje específico
          if (error.code === "failed-precondition") {
            const errorMessage =
              "Se requiere crear un índice en Firebase. Haz clic en el enlace para crearlo automáticamente.";

            addNotification({
              type: "error",
              title: "Error en notificaciones",
              message: errorMessage,
              autoRemove: false,
              data: {
                errorCode: error.code,
                errorMessage: error.message,
                indexUrl:
                  "https://console.firebase.google.com/v1/r/project/comandas-multiples/firestore/indexes?create_composite=Cldwcm9qZWN0cy9jb21hbmRhcy1tdWx0aXBsZXMvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL3Jlc3RhdXJhbnRlcy9pbmRleGVzL18QARoOCgplc3RhZG9QYWdvEAEaDQoJZmVjaGFQYWdvEAIaDAoIX19uYW1lX18QAg",
              },
            });
          } else {
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
      message: "Se acreditó el pago de $10 ARS para el restaurante Test",
      data: {
        restaurantId: "test",
        amount: 10,
        currency: "ARS",
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
