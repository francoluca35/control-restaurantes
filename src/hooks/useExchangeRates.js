import { useState, useEffect, useCallback } from "react";
import { useErrorHandler } from "./useErrorHandler.js";

export const useExchangeRates = () => {
  const [rates, setRates] = useState({ USD: 1, ARS: 850 });
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const { handleError, clearError } = useErrorHandler();

  // Obtener tasas de cambio
  const fetchExchangeRates = useCallback(async () => {
    try {
      setLoading(true);
      clearError("exchange-rates");

      const response = await fetch("/api/exchange-rates", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al obtener tasas de cambio");
      }

      const data = await response.json();
      
      setRates(data.rates);
      setLastUpdated(data.lastUpdated);
      
      return data.rates;
    } catch (error) {
      console.error("Error obteniendo tasas de cambio:", error);
      handleError(error, "exchange-rates", { showToast: false });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [handleError, clearError]);

  // Convertir USD a ARS
  const convertUsdToArs = useCallback((usdAmount) => {
    return usdAmount * rates.ARS;
  }, [rates.ARS]);

  // Convertir ARS a USD
  const convertArsToUsd = useCallback((arsAmount) => {
    return arsAmount / rates.ARS;
  }, [rates.ARS]);

  // Formatear precio según moneda
  const formatPrice = useCallback((amount, currency) => {
    if (currency === "USD") {
      return `$${amount.toFixed(2)} USD`;
    } else if (currency === "ARS") {
      return `$${amount.toLocaleString("es-AR")} ARS`;
    }
    return `$${amount.toFixed(2)}`;
  }, []);

  // Cargar tasas al montar el hook
  useEffect(() => {
    fetchExchangeRates();
  }, [fetchExchangeRates]);

  return {
    rates,
    loading,
    lastUpdated,
    fetchExchangeRates,
    convertUsdToArs,
    convertArsToUsd,
    formatPrice,
  };
};
