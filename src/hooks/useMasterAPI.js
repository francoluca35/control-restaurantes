"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useErrorHandler } from "./useErrorHandler";
import { useAuthStore, useRestaurantStore, useDashboard } from "../store";
import { schemas, validateForm } from "../schemas/validation";
import toast from "react-hot-toast";

// Configuración base para las APIs
const API_BASE_URL = "/api";

// Función helper para hacer requests con manejo de errores
const apiRequest = async (url, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(errorData.message || `HTTP ${response.status}`);
    error.status = response.status;
    error.data = errorData;
    throw error;
  }

  return response.json();
};

// Hook para obtener estadísticas del dashboard
export const useDashboardStats = () => {
  const { handleError } = useErrorHandler();
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ["dashboard-stats", user?.uid],
    queryFn: async () => {
      const data = await apiRequest("/dashboard/stats");
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    enabled: !!user,
    onError: (error) => {
      handleError(error, "dashboard-stats");
    },
  });
};

// Hook para obtener actividad reciente
export const useRecentActivity = (limit = 10) => {
  const { handleError } = useErrorHandler();
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ["recent-activity", user?.uid, limit],
    queryFn: async () => {
      const data = await apiRequest(`/dashboard/activity?limit=${limit}`);
      return data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
    enabled: !!user,
    onError: (error) => {
      handleError(error, "recent-activity");
    },
  });
};

// Hook para obtener restaurantes
export const useRestaurants = (filters = {}) => {
  const { handleError } = useErrorHandler();
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ["restaurants", user?.uid, filters],
    queryFn: async () => {
      const params = new URLSearchParams(filters);
      const data = await apiRequest(`/restaurants?${params}`);
      return data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos
    enabled: !!user,
    onError: (error) => {
      handleError(error, "restaurants");
    },
  });
};

// Hook para obtener un restaurante específico
export const useRestaurantDetail = (restaurantId) => {
  const { handleError } = useErrorHandler();
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ["restaurant", restaurantId],
    queryFn: async () => {
      const data = await apiRequest(`/restaurants/${restaurantId}`);
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 15 * 60 * 1000, // 15 minutos
    enabled: !!user && !!restaurantId,
    onError: (error) => {
      handleError(error, "restaurant-detail");
    },
  });
};

// Hook para crear restaurante
export const useCreateRestaurant = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();
  const { addRestaurant } = useRestaurantStore();

  return useMutation({
    mutationFn: async (restaurantData) => {
      // Validar datos
      const validation = validateForm(schemas.restaurant, restaurantData);
      if (!validation.isValid) {
        throw new Error("Datos de restaurante inválidos");
      }

      const data = await apiRequest("/restaurants", {
        method: "POST",
        body: JSON.stringify(restaurantData),
      });

      return data;
    },
    onMutate: async (newRestaurant) => {
      // Cancelar queries en curso
      await queryClient.cancelQueries({ queryKey: ["restaurants"] });

      // Snapshot del estado anterior
      const previousRestaurants = queryClient.getQueryData(["restaurants"]);

      // Actualización optimista
      queryClient.setQueryData(["restaurants"], (old) => {
        return old
          ? [...old, { ...newRestaurant, id: "temp-id" }]
          : [newRestaurant];
      });

      // Actualizar store local
      addRestaurant({ ...newRestaurant, id: "temp-id" });

      return { previousRestaurants };
    },
    onError: (error, variables, context) => {
      handleError(error, "create-restaurant");

      // Revertir cambios optimistas
      if (context?.previousRestaurants) {
        queryClient.setQueryData(["restaurants"], context.previousRestaurants);
      }
    },
    onSuccess: (data, variables) => {
      // Actualizar cache con datos reales
      queryClient.setQueryData(["restaurants"], (old) => {
        return old ? old.map((r) => (r.id === "temp-id" ? data : r)) : [data];
      });

      // Actualizar store local
      addRestaurant(data);

      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["recent-activity"] });

      toast.success("Restaurante creado exitosamente");
    },
    onSettled: () => {
      // Refetch para asegurar sincronización
      queryClient.invalidateQueries({ queryKey: ["restaurants"] });
    },
  });
};

// Hook para actualizar restaurante
export const useUpdateRestaurant = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();
  const { updateRestaurant } = useRestaurantStore();

  return useMutation({
    mutationFn: async ({ id, updates }) => {
      // Validar datos
      const validation = validateForm(schemas.restaurantUpdate, updates);
      if (!validation.isValid) {
        throw new Error("Datos de actualización inválidos");
      }

      const data = await apiRequest(`/restaurants/${id}`, {
        method: "PUT",
        body: JSON.stringify(updates),
      });

      return data;
    },
    onMutate: async ({ id, updates }) => {
      // Cancelar queries en curso
      await queryClient.cancelQueries({ queryKey: ["restaurants"] });
      await queryClient.cancelQueries({ queryKey: ["restaurant", id] });

      // Snapshot del estado anterior
      const previousRestaurants = queryClient.getQueryData(["restaurants"]);
      const previousRestaurant = queryClient.getQueryData(["restaurant", id]);

      // Actualización optimista
      queryClient.setQueryData(["restaurants"], (old) => {
        return old
          ? old.map((r) => (r.id === id ? { ...r, ...updates } : r))
          : old;
      });

      queryClient.setQueryData(["restaurant", id], (old) => {
        return old ? { ...old, ...updates } : old;
      });

      // Actualizar store local
      updateRestaurant(id, updates);

      return { previousRestaurants, previousRestaurant };
    },
    onError: (error, variables, context) => {
      handleError(error, "update-restaurant");

      // Revertir cambios optimistas
      if (context?.previousRestaurants) {
        queryClient.setQueryData(["restaurants"], context.previousRestaurants);
      }
      if (context?.previousRestaurant) {
        queryClient.setQueryData(
          ["restaurant", variables.id],
          context.previousRestaurant
        );
      }
    },
    onSuccess: (data, variables) => {
      // Actualizar cache con datos reales
      queryClient.setQueryData(["restaurants"], (old) => {
        return old ? old.map((r) => (r.id === variables.id ? data : r)) : old;
      });

      queryClient.setQueryData(["restaurant", variables.id], data);

      // Actualizar store local
      updateRestaurant(variables.id, data);

      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["recent-activity"] });

      toast.success("Restaurante actualizado exitosamente");
    },
    onSettled: (data, error, variables) => {
      // Refetch para asegurar sincronización
      queryClient.invalidateQueries({ queryKey: ["restaurants"] });
      queryClient.invalidateQueries({ queryKey: ["restaurant", variables.id] });
    },
  });
};

// Hook para eliminar restaurante
export const useDeleteRestaurant = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();
  const { removeRestaurant } = useRestaurantStore();

  return useMutation({
    mutationFn: async (restaurantId) => {
      const data = await apiRequest(`/restaurants/${restaurantId}`, {
        method: "DELETE",
      });

      return data;
    },
    onMutate: async (restaurantId) => {
      // Cancelar queries en curso
      await queryClient.cancelQueries({ queryKey: ["restaurants"] });

      // Snapshot del estado anterior
      const previousRestaurants = queryClient.getQueryData(["restaurants"]);

      // Actualización optimista
      queryClient.setQueryData(["restaurants"], (old) => {
        return old ? old.filter((r) => r.id !== restaurantId) : old;
      });

      // Actualizar store local
      removeRestaurant(restaurantId);

      return { previousRestaurants };
    },
    onError: (error, variables, context) => {
      handleError(error, "delete-restaurant");

      // Revertir cambios optimistas
      if (context?.previousRestaurants) {
        queryClient.setQueryData(["restaurants"], context.previousRestaurants);
      }
    },
    onSuccess: (data, restaurantId) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["recent-activity"] });
      queryClient.removeQueries({ queryKey: ["restaurant", restaurantId] });

      toast.success("Restaurante eliminado exitosamente");
    },
    onSettled: () => {
      // Refetch para asegurar sincronización
      queryClient.invalidateQueries({ queryKey: ["restaurants"] });
    },
  });
};

// Hook para obtener códigos de activación
export const useActivationCodes = (filters = {}) => {
  const { handleError } = useErrorHandler();
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ["activation-codes", user?.uid, filters],
    queryFn: async () => {
      const params = new URLSearchParams(filters);
      const data = await apiRequest(`/activation-codes?${params}`);
      return data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
    enabled: !!user,
    onError: (error) => {
      handleError(error, "activation-codes");
    },
  });
};

// Hook para crear código de activación
export const useCreateActivationCode = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();

  return useMutation({
    mutationFn: async (codeData) => {
      const data = await apiRequest("/activation-codes", {
        method: "POST",
        body: JSON.stringify(codeData),
      });

      return data;
    },
    onError: (error) => {
      handleError(error, "create-activation-code");
    },
    onSuccess: (data) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ["activation-codes"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["recent-activity"] });

      toast.success("Código de activación creado exitosamente");
    },
  });
};

// Hook para obtener reportes
export const useReports = (type, filters = {}) => {
  const { handleError } = useErrorHandler();
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ["reports", type, user?.uid, filters],
    queryFn: async () => {
      const params = new URLSearchParams(filters);
      const data = await apiRequest(`/reports/${type}?${params}`);
      return data;
    },
    staleTime: 15 * 60 * 1000, // 15 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos
    enabled: !!user && !!type,
    onError: (error) => {
      handleError(error, "reports");
    },
  });
};

// Hook para exportar datos
export const useExportData = () => {
  const { handleError } = useErrorHandler();

  return useMutation({
    mutationFn: async ({ type, filters = {} }) => {
      const params = new URLSearchParams(filters);
      const response = await fetch(`${API_BASE_URL}/export/${type}?${params}`);

      if (!response.ok) {
        throw new Error("Error al exportar datos");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${type}-${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      return { success: true };
    },
    onError: (error) => {
      handleError(error, "export-data");
    },
    onSuccess: () => {
      toast.success("Datos exportados exitosamente");
    },
  });
};

// Hook para sincronización de datos
export const useSyncData = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();

  return useMutation({
    mutationFn: async () => {
      const data = await apiRequest("/sync", {
        method: "POST",
      });

      return data;
    },
    onError: (error) => {
      handleError(error, "sync-data");
    },
    onSuccess: () => {
      // Invalidar todas las queries para forzar refetch
      queryClient.invalidateQueries();
      toast.success("Datos sincronizados exitosamente");
    },
  });
};

// Hook para obtener métricas de rendimiento
export const usePerformanceMetrics = (timeRange = "7d") => {
  const { handleError } = useErrorHandler();
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ["performance-metrics", user?.uid, timeRange],
    queryFn: async () => {
      const data = await apiRequest(`/metrics/performance?range=${timeRange}`);
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 15 * 60 * 1000, // 15 minutos
    enabled: !!user,
    onError: (error) => {
      handleError(error, "performance-metrics");
    },
  });
};

// Hook para obtener alertas del sistema
export const useSystemAlerts = () => {
  const { handleError } = useErrorHandler();
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ["system-alerts", user?.uid],
    queryFn: async () => {
      const data = await apiRequest("/alerts");
      return data;
    },
    staleTime: 30 * 1000, // 30 segundos
    gcTime: 2 * 60 * 1000, // 2 minutos
    refetchInterval: 30 * 1000, // Refetch cada 30 segundos
    enabled: !!user,
    onError: (error) => {
      handleError(error, "system-alerts");
    },
  });
};
