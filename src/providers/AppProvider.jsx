"use client";
import React, { useEffect } from "react";
import { QueryProvider } from "./QueryProvider";
import { Toaster } from "react-hot-toast";
import { useAuth, AuthProvider } from "../app/context/AuthContext";
import { useErrorHandler } from "../hooks/useErrorHandler";
import { TurnoProvider } from "../app/context/TurnoContext";
import { RoleProvider } from "../app/context/RoleContext";
import { RestaurantProvider } from "../app/context/RestaurantContext";
import { ProviderFallback } from "../components/ProviderFallback";
import metricsCollector from "../lib/metrics";

// Configuración de toast notifications
const toastConfig = {
  duration: 5000,
  position: "top-right",
  style: {
    background: "#1f2937",
    color: "#f9fafb",
    border: "1px solid #374151",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
  },
  success: {
    iconTheme: {
      primary: "#10b981",
      secondary: "#f9fafb",
    },
    style: {
      background: "#064e3b",
      color: "#f9fafb",
      border: "1px solid #065f46",
    },
  },
  error: {
    iconTheme: {
      primary: "#ef4444",
      secondary: "#f9fafb",
    },
    style: {
      background: "#7f1d1d",
      color: "#f9fafb",
      border: "1px solid #991b1b",
    },
  },
  loading: {
    iconTheme: {
      primary: "#3b82f6",
      secondary: "#f9fafb",
    },
    style: {
      background: "#1e3a8a",
      color: "#f9fafb",
      border: "1px solid #1e40af",
    },
  },
};

// Componente para manejar autenticación global
const AuthHandler = ({ children }) => {
  const authData = useAuth();
  const { handleError } = useErrorHandler();

  // Extraer datos de autenticación de forma segura
  const usuario = authData?.usuario;
  const loading = authData?.loading;

  useEffect(() => {
    // Solo ejecutar en el cliente
    if (typeof window === "undefined") return;

    // Verificar sesión expirada solo si hay usuario y no está cargando
    if (!loading && usuario) {
      const checkSessionExpiry = () => {
        // Verificar si estamos en el sistema de restaurantes
        const currentPath = window.location.pathname;
        const isRestaurantSystem = currentPath.includes("/home-comandas");

        if (isRestaurantSystem) {
          // Para el sistema de restaurantes, verificamos restauranteId
          const restauranteId = localStorage.getItem("restauranteId");
          const usuarioLocal = localStorage.getItem("usuario");

          if (!restauranteId || !usuarioLocal) {
            console.log("🔍 Sesión de restaurante expirada - datos faltantes");
            handleError(new Error("Sesión expirada"), "authentication", {
              showToast: true,
            });

            // Limpiar localStorage del restaurante
            localStorage.removeItem("usuario");
            localStorage.removeItem("rol");
            localStorage.removeItem("usuarioId");
            localStorage.removeItem("restauranteId");
            localStorage.removeItem("nombreResto");
            localStorage.removeItem("emailResto");
            localStorage.removeItem("cantUsuarios");
            localStorage.removeItem("finanzas");
            localStorage.removeItem("logo");

            // Redirigir al prelogin de restaurantes
            window.location.href = "/comandas/prelogin";
          }
        }
        // Para superadmin, confiamos completamente en AuthContext
      };

      checkSessionExpiry();

      // Verificar cada 5 minutos
      const interval = setInterval(checkSessionExpiry, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [usuario, loading, handleError]);

  // Siempre renderizar children, la verificación de sesión se hace en useEffect
  return children;
};

// Componente para manejar errores globales
const GlobalErrorHandler = ({ children }) => {
  const { handleError } = useErrorHandler();

  useEffect(() => {
    // Solo ejecutar en el cliente
    if (typeof window === "undefined") return;

    // Manejar errores no capturados
    const handleUnhandledError = (event) => {
      handleError(event.error || new Error(event.message), "global", {
        showToast: true,
        duration: 8000,
      });
    };

    // Manejar promesas rechazadas no capturadas
    const handleUnhandledRejection = (event) => {
      handleError(event.reason, "global", {
        showToast: true,
        duration: 8000,
      });
    };

    window.addEventListener("error", handleUnhandledError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleUnhandledError);
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection
      );
    };
  }, [handleError]);

  return children;
};

// Provider principal de la aplicación
export const AppProvider = ({ children }) => {
  // Las métricas ahora se generan solo cuando se accede a la sección de métricas
  // No se inician automáticamente para evitar carga constante
  React.useEffect(() => {
    // Solo registrar que el sistema está disponible
    if (typeof window !== "undefined") {
      console.log("📊 Sistema de métricas disponible (se genera bajo demanda)");
    }
  }, []);

  return (
    <ProviderFallback>
      <QueryProvider>
        <AuthProvider>
          <RestaurantProvider>
            <GlobalErrorHandler>
              <AuthHandler>
                <RoleProvider>
                  <TurnoProvider>
                    {children}
                    <Toaster {...toastConfig} />
                  </TurnoProvider>
                </RoleProvider>
              </AuthHandler>
            </GlobalErrorHandler>
          </RestaurantProvider>
        </AuthProvider>
      </QueryProvider>
    </ProviderFallback>
  );
};

// Hook para acceso fácil a todos los providers
export const useApp = () => {
  return {
    // Aquí puedes agregar hooks adicionales si es necesario
  };
};
