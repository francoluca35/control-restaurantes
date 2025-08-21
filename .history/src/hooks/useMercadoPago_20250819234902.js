import { useState, useCallback } from "react";
import { useErrorHandler } from "./useErrorHandler.js";

export const useMercadoPago = () => {
  const [loading, setLoading] = useState(false);
  const { handleError, clearError } = useErrorHandler();

  // Crear preferencia de pago
  const createPaymentPreference = useCallback(
    async (paymentData) => {
      try {
        setLoading(true);
        clearError("mercadopago");

        const response = await fetch("/api/payments/mercadopago", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(paymentData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Error al crear preferencia de pago"
          );
        }

        const data = await response.json();
        return data.preference;
      } catch (error) {
        console.error("Error creando preferencia de pago:", error);
        handleError(error, "mercadopago", { showToast: true });
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [handleError, clearError]
  );

  // Verificar estado de un pago
  const checkPaymentStatus = useCallback(
    async (paymentId, restaurantId) => {
      try {
        setLoading(true);
        clearError("mercadopago");

        const response = await fetch(
          `/api/payments/mercadopago?paymentId=${paymentId}&restaurantId=${restaurantId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Error al verificar estado del pago"
          );
        }

        const data = await response.json();
        return data.paymentStatus;
      } catch (error) {
        console.error("Error verificando estado del pago:", error);
        handleError(error, "mercadopago", { showToast: true });
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [handleError, clearError]
  );

  // Redirigir al usuario a Mercado Pago
  const redirectToPayment = useCallback((initPoint) => {
    if (typeof window !== "undefined" && initPoint) {
      window.location.href = initPoint;
    }
  }, []);

  // Procesar pago para un restaurante
  const processRestaurantPayment = useCallback(
    async (restaurantData) => {
      try {
        const paymentData = {
          restaurantId: restaurantData.id || restaurantData.restauranteId,
          amount: restaurantData.precio,
          title: `Activación de Restaurante - ${restaurantData.nombre}`,
          externalReference: restaurantData.id || restaurantData.restauranteId,
        };

        const preference = await createPaymentPreference(paymentData);

        // Redirigir al usuario a Mercado Pago
        const initPoint =
          process.env.NODE_ENV === "production"
            ? preference.initPoint
            : preference.sandboxInitPoint;

        redirectToPayment(initPoint);

        return preference;
      } catch (error) {
        console.error("Error procesando pago del restaurante:", error);
        throw error;
      }
    },
    [createPaymentPreference, redirectToPayment]
  );

  return {
    loading,
    createPaymentPreference,
    checkPaymentStatus,
    redirectToPayment,
    processRestaurantPayment,
  };
};
