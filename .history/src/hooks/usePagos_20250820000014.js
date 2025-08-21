"use client";
import { useState, useEffect, useCallback } from "react";
import { db } from "../lib/firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { useErrorHandler } from "./useErrorHandler.js";

export const usePagos = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { handleError } = useErrorHandler();

  // Cargar restaurantes
  const loadRestaurants = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if Firebase is properly initialized
      if (!db) {
        throw new Error("Firebase no está inicializado correctamente");
      }

      const restaurantesRef = collection(db, "restaurantes");
      const snapshot = await getDocs(restaurantesRef);

      const restaurantesData = snapshot.docs.map((doc) => {
        const data = doc.data();
        const today = new Date();
        const proximoPago = data.proximoPago
          ? new Date(
              data.proximoPago.toDate
                ? data.proximoPago.toDate()
                : data.proximoPago
            )
          : null;

        // Calcular días restantes
        let diasRestantes = 0;
        let estadoPago = "alDia";

        if (proximoPago) {
          const diffTime = proximoPago - today;
          diasRestantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (diasRestantes < 0) {
            estadoPago = "vencido";
          } else if (diasRestantes <= 7) {
            estadoPago = "proximo";
          }
        }

        return {
          id: doc.id,
          ...data,
          diasRestantes,
          estadoPago,
          proximoPago: proximoPago,
          fechaActivacion: data.fechaActivacion?.toDate
            ? data.fechaActivacion.toDate()
            : data.fechaActivacion,
          ultimoPago: data.ultimoPago?.toDate
            ? data.ultimoPago.toDate()
            : data.ultimoPago,
        };
      });

      setRestaurants(restaurantesData);
    } catch (err) {
      console.error("Error loading restaurants:", err);
      setError("Error al cargar los restaurantes");
      handleError(err, "pagos", { showToast: true });
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadRestaurants();
  }, [loadRestaurants]);

  // Enviar recordatorio de pago
  const sendPaymentReminder = useCallback(
    async (restaurantId) => {
      try {
        // Aquí implementarías la lógica para enviar el recordatorio
        // Por ejemplo, enviar un email o notificación
        console.log(
          `Enviando recordatorio de pago a restaurante ${restaurantId}`
        );

        // Simular envío exitoso
        return { success: true, message: "Recordatorio enviado exitosamente" };
      } catch (err) {
        console.error("Error sending payment reminder:", err);
        handleError(err, "pagos", { showToast: true });
        return { success: false, message: "Error al enviar recordatorio" };
      }
    },
    [handleError]
  );

  // Marcar pago como realizado
  const markPaymentAsPaid = useCallback(
    async (restaurantId) => {
      try {
        const restaurant = restaurants.find((r) => r.id === restaurantId);
        if (!restaurant) {
          throw new Error("Restaurante no encontrado");
        }

        const restauranteRef = doc(db, "restaurantes", restaurantId);
        const today = new Date();

        // Calcular próximo pago
        let proximoPago;
        if (restaurant.periodicidad === "mensual") {
          proximoPago = new Date(
            today.getFullYear(),
            today.getMonth() + 1,
            today.getDate()
          );
        } else {
          proximoPago = new Date(
            today.getFullYear() + 1,
            today.getMonth(),
            today.getDate()
          );
        }

        // Actualizar datos del restaurante
        await updateDoc(restauranteRef, {
          ultimoPago: today,
          proximoPago: proximoPago,
          cuotasPagadas: (restaurant.cuotasPagadas || 0) + 1,
          estadoPago: "alDia",
        });

        // Recargar datos
        await loadRestaurants();

        return { success: true, message: "Pago marcado como realizado" };
      } catch (err) {
        console.error("Error marking payment as paid:", err);
        handleError(err, "pagos", { showToast: true });
        return { success: false, message: "Error al marcar el pago" };
      }
    },
    [restaurants, loadRestaurants, handleError]
  );

  // Eliminar restaurante
  const deleteRestaurant = useCallback(
    async (restaurantId) => {
      try {
        const restauranteRef = doc(db, "restaurantes", restaurantId);
        await deleteDoc(restauranteRef);

        // Recargar datos
        await loadRestaurants();

        return { success: true, message: "Restaurante eliminado exitosamente" };
      } catch (err) {
        console.error("Error deleting restaurant:", err);
        handleError(err, "pagos", { showToast: true });
        return { success: false, message: "Error al eliminar el restaurante" };
      }
    },
    [loadRestaurants, handleError]
  );

  // Suspender restaurante
  const suspendRestaurant = useCallback(
    async (restaurantId) => {
      try {
        const restauranteRef = doc(db, "restaurantes", restaurantId);
        await updateDoc(restauranteRef, {
          estado: "suspendido",
          fechaSuspension: new Date(),
        });

        // Recargar datos
        await loadRestaurants();

        return {
          success: true,
          message: "Restaurante suspendido exitosamente",
        };
      } catch (err) {
        console.error("Error suspending restaurant:", err);
        handleError(err, "pagos", { showToast: true });
        return { success: false, message: "Error al suspender el restaurante" };
      }
    },
    [loadRestaurants, handleError]
  );

  // Habilitar restaurante
  const enableRestaurant = useCallback(
    async (restaurantId) => {
      try {
        const restauranteRef = doc(db, "restaurantes", restaurantId);
        await updateDoc(restauranteRef, {
          estado: "activo",
          fechaHabilitacion: new Date(),
        });

        // Recargar datos
        await loadRestaurants();

        return {
          success: true,
          message: "Restaurante habilitado exitosamente",
        };
      } catch (err) {
        console.error("Error enabling restaurant:", err);
        handleError(err, "pagos", { showToast: true });
        return { success: false, message: "Error al habilitar el restaurante" };
      }
    },
    [loadRestaurants, handleError]
  );

  // Filtrar restaurantes
  const filterRestaurants = useCallback(
    (searchTerm, filterStatus) => {
      let filtered = restaurants;

      // Filtrar por término de búsqueda
      if (searchTerm) {
        filtered = filtered.filter(
          (restaurant) =>
            restaurant.nombre
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            restaurant.id?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Filtrar por estado de pago
      if (filterStatus && filterStatus !== "all") {
        filtered = filtered.filter(
          (restaurant) => restaurant.estadoPago === filterStatus
        );
      }

      return filtered;
    },
    [restaurants]
  );

  // Obtener estadísticas
  const getPaymentStats = useCallback(async () => {
    const total = restaurants.length;
    const alDia = restaurants.filter((r) => r.estadoPago === "alDia").length;
    const proximos = restaurants.filter(
      (r) => r.estadoPago === "proximo"
    ).length;
    const vencidos = restaurants.filter(
      (r) => r.estadoPago === "vencido"
    ).length;

    // Obtener tasas de cambio
    let rates = { USD: 1, ARS: 850 };
    try {
      const response = await fetch("/api/exchange-rates");
      if (response.ok) {
        const data = await response.json();
        rates = data.rates;
      }
    } catch (error) {
      console.error("Error obteniendo tasas de cambio:", error);
    }

    // Calcular ingresos mensuales en USD
    let ingresosMensualesUSD = 0;
    restaurants.forEach((restaurant) => {
      let ingresosMensualesRestaurante = 0;

      // Si el restaurante tiene ingresos mensuales registrados, usarlos
      if (restaurant.ingresosMensuales) {
        ingresosMensualesRestaurante = restaurant.ingresosMensuales;
      } else if (restaurant.precio) {
        // Si no, calcular basado en el precio y periodicidad
        if (restaurant.periodicidad === "mensual") {
          ingresosMensualesRestaurante = restaurant.precio;
        } else {
          ingresosMensualesRestaurante = restaurant.precio / 12;
        }
      }

      // Si el restaurante tiene moneda especificada y es ARS, convertir a USD
      if (restaurant.moneda === "ARS" && ingresosMensualesRestaurante > 0) {
        ingresosMensualesUSD += ingresosMensualesRestaurante / rates.ARS;
      } else {
        ingresosMensualesUSD += ingresosMensualesRestaurante;
      }
    });

    // Calcular ingresos mensuales en ARS
    const ingresosMensualesARS = ingresosMensualesUSD * rates.ARS;

    return {
      total,
      alDia,
      proximos,
      vencidos,
      ingresosMensuales: {
        USD: ingresosMensualesUSD,
        ARS: ingresosMensualesARS,
      },
    };
  }, [restaurants]);

  return {
    restaurants,
    loading,
    error,
    sendPaymentReminder,
    markPaymentAsPaid,
    deleteRestaurant,
    suspendRestaurant,
    enableRestaurant,
    getPaymentStats,
    filterRestaurants,
    reload: loadRestaurants,
  };
};
