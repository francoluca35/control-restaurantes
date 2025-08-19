"use client";
import { useState, useCallback } from "react";

export const useAPIErrorHandler = () => {
  const [error, setError] = useState(null);

  const handleAPIError = useCallback((error, context = "API") => {
    console.error(`❌ Error en ${context}:`, error);

    // Manejar diferentes tipos de errores
    if (
      error.name === "TypeError" &&
      error.message.includes("Failed to fetch")
    ) {
      setError("Error de conexión. Verifica tu conexión a internet.");
    } else if (
      error.message &&
      error.message.includes("ERR_TOO_MANY_REDIRECTS")
    ) {
      setError("Error de redirección. Intenta recargar la página.");
    } else if (error.message && error.message.includes("requires an index")) {
      setError("Error de base de datos. Contacta al administrador.");
    } else {
      setError(error.message || "Error inesperado");
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    handleAPIError,
    clearError,
  };
};
