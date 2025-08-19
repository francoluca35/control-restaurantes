"use client";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useMutation,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, useEffect } from "react";
import { useErrorHandler } from "../hooks/useErrorHandler";
import toast from "react-hot-toast";

// Configuración optimizada para React Query
const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Tiempo que los datos se consideran "fresh"
        staleTime: 5 * 60 * 1000, // 5 minutos

        // Tiempo que los datos se mantienen en cache
        gcTime: 10 * 60 * 1000, // 10 minutos (antes cacheTime)

        // Reintentos automáticos
        retry: (failureCount, error) => {
          // No reintentar en errores de validación o autorización
          if (
            error?.status === 400 ||
            error?.status === 401 ||
            error?.status === 403
          ) {
            return false;
          }
          // Máximo 3 reintentos
          return failureCount < 3;
        },

        // Función de retry con backoff exponencial
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

        // Refetch automático cuando la ventana vuelve a estar activa
        refetchOnWindowFocus: true,

        // Refetch automático cuando se reconecta la red
        refetchOnReconnect: true,

        // Refetch automático cuando se monta el componente
        refetchOnMount: true,

        // Mostrar datos stale mientras se refetch
        keepPreviousData: true,

        // Configuración de suspense (para SSR)
        suspense: false,

        // Configuración de placeholder data
        placeholderData: undefined,
      },
      mutations: {
        // Reintentos para mutaciones
        retry: 1,

        // Tiempo de retry para mutaciones
        retryDelay: 1000,

        // Configuración de optimistic updates
        onMutate: undefined,
        onError: undefined,
        onSuccess: undefined,
        onSettled: undefined,
      },
    },
  });
};

// Hook personalizado para manejar errores de React Query
const useQueryErrorHandler = () => {
  const { handleError } = useErrorHandler();

  useEffect(() => {
    // Solo ejecutar en el cliente
    if (typeof window === "undefined") return;

    const handleUnhandledRejection = (event) => {
      if (event.reason?.message?.includes("Query")) {
        handleError(event.reason, "react-query", {
          showToast: true,
          duration: 8000,
        });
      }
    };

    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    return () => {
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection
      );
    };
  }, [handleError]);
};

// Componente principal del provider
export const QueryProvider = ({ children }) => {
  const [queryClient] = useState(() => createQueryClient());

  // Configurar manejo de errores global
  useQueryErrorHandler();

  // Configurar listeners para optimizaciones
  useEffect(() => {
    // Solo ejecutar en el cliente
    if (typeof window === "undefined") return;

    // Prefetch de datos críticos cuando la app se carga
    const prefetchCriticalData = async () => {
      try {
        // Prefetch de configuración del usuario
        await queryClient.prefetchQuery({
          queryKey: ["user-config"],
          queryFn: () => Promise.resolve({}),
          staleTime: 30 * 60 * 1000, // 30 minutos
        });
      } catch (error) {
        console.warn("Error prefetching critical data:", error);
      }
    };

    prefetchCriticalData();
  }, [queryClient]);

  // Configurar listeners para optimizaciones de red
  useEffect(() => {
    // Solo ejecutar en el cliente
    if (typeof window === "undefined") return;

    const handleOnline = () => {
      // Refetch todas las queries cuando se reconecta
      queryClient.refetchQueries();
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Refetch queries stale cuando la ventana vuelve a estar visible
        queryClient.refetchQueries({ stale: true });
      }
    };

    window.addEventListener("online", handleOnline);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("online", handleOnline);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* DevTools solo en desarrollo */}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools
          initialIsOpen={false}
          position="bottom-right"
          buttonPosition="bottom-right"
        />
      )}
    </QueryClientProvider>
  );
};

// Hook personalizado para queries comunes
export const useOptimizedQuery = (queryKey, queryFn, options = {}) => {
  const { handleError } = useErrorHandler();

  return useQuery({
    queryKey,
    queryFn,
    ...options,
    onError: (error) => {
      handleError(error, "query", {
        showToast: options.showErrorToast !== false,
        duration: options.errorDuration || 5000,
      });
      options.onError?.(error);
    },
  });
};

// Hook personalizado para mutaciones
export const useOptimizedMutation = (mutationFn, options = {}) => {
  const { handleError } = useErrorHandler();

  return useMutation({
    mutationFn,
    ...options,
    onError: (error, variables, context) => {
      handleError(error, "mutation", {
        showToast: options.showErrorToast !== false,
        duration: options.errorDuration || 5000,
      });
      options.onError?.(error, variables, context);
    },
    onSuccess: (data, variables, context) => {
      // Mostrar toast de éxito si está configurado
      if (options.showSuccessToast) {
        toast.success(
          options.successMessage || "Operación completada exitosamente"
        );
      }
      options.onSuccess?.(data, variables, context);
    },
  });
};

// Configuración de queries predefinidas
export const queryConfigs = {
  // Configuración para datos que cambian frecuentemente
  frequent: {
    staleTime: 30 * 1000, // 30 segundos
    gcTime: 5 * 60 * 1000, // 5 minutos
    refetchInterval: 30 * 1000, // Refetch cada 30 segundos
  },

  // Configuración para datos que cambian ocasionalmente
  occasional: {
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    refetchInterval: 5 * 60 * 1000, // Refetch cada 5 minutos
  },

  // Configuración para datos que cambian raramente
  rare: {
    staleTime: 30 * 60 * 1000, // 30 minutos
    gcTime: 60 * 60 * 1000, // 1 hora
    refetchInterval: false, // No refetch automático
  },

  // Configuración para datos estáticos
  static: {
    staleTime: Infinity, // Nunca se considera stale
    gcTime: 24 * 60 * 60 * 1000, // 24 horas
    refetchInterval: false, // No refetch automático
  },
};

// Función helper para invalidar queries relacionadas
export const invalidateRelatedQueries = (queryClient, patterns) => {
  patterns.forEach((pattern) => {
    queryClient.invalidateQueries({ queryKey: pattern });
  });
};

// Función helper para actualizar cache optimísticamente
export const updateQueryCache = (queryClient, queryKey, updater) => {
  queryClient.setQueryData(queryKey, updater);
};

// Función helper para prefetch de datos
export const prefetchData = async (queryClient, queryKey, queryFn) => {
  await queryClient.prefetchQuery({
    queryKey,
    queryFn,
    staleTime: 5 * 60 * 1000,
  });
};
