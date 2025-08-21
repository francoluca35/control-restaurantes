"use client";
import { useEffect } from "react";
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

  useEffect(() => {
    // Escuchar cambios en restaurantes con pagos aprobados
    const restaurantsQuery = query(
      collection(db, "restaurantes"),
      where("estadoPago", "==", "pagado"),
      orderBy("fechaPago", "desc")
    );

    const unsubscribe = onSnapshot(
      restaurantsQuery,
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
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
        console.error("Error escuchando notificaciones de pago:", error);
        addNotification({
          type: "error",
          title: "Error en notificaciones",
          message:
            "No se pueden recibir notificaciones de pagos en tiempo real",
          autoRemove: false,
        });
      }
    );

    return () => unsubscribe();
  }, [addNotification]);

  // Función para crear notificación manual (para testing)
  const createTestNotification = () => {
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

  return { createTestNotification };
};
