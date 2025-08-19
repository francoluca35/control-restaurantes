import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { subscribeWithSelector } from "zustand/middleware";

// Store para autenticación
export const useAuthStore = create(
  persist(
    subscribeWithSelector((set, get) => ({
      // Estado
      user: null,
      role: null,
      isAuthenticated: false,
      isLoading: false,

      // Acciones
      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          isLoading: false,
        }),

      setRole: (role) => set({ role }),

      setLoading: (isLoading) => set({ isLoading }),

      login: (userData, role) =>
        set({
          user: userData,
          role,
          isAuthenticated: true,
          isLoading: false,
        }),

      logout: () =>
        set({
          user: null,
          role: null,
          isAuthenticated: false,
          isLoading: false,
        }),

      // Selectores
      getUser: () => get().user,
      getRole: () => get().role,
      getIsAuthenticated: () => get().isAuthenticated,
      getIsLoading: () => get().isLoading,
    })),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        role: state.role,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Store para restaurantes
export const useRestaurantStore = create(
  persist(
    subscribeWithSelector((set, get) => ({
      // Estado
      restaurants: [],
      currentRestaurant: null,
      isLoading: false,
      error: null,

      // Acciones
      setRestaurants: (restaurants) => set({ restaurants }),

      addRestaurant: (restaurant) =>
        set((state) => ({
          restaurants: [...state.restaurants, restaurant],
        })),

      updateRestaurant: (id, updates) =>
        set((state) => ({
          restaurants: state.restaurants.map((restaurant) =>
            restaurant.id === id ? { ...restaurant, ...updates } : restaurant
          ),
        })),

      removeRestaurant: (id) =>
        set((state) => ({
          restaurants: state.restaurants.filter(
            (restaurant) => restaurant.id !== id
          ),
        })),

      setCurrentRestaurant: (restaurant) =>
        set({ currentRestaurant: restaurant }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      clearError: () => set({ error: null }),

      // Selectores
      getRestaurants: () => get().restaurants,
      getCurrentRestaurant: () => get().currentRestaurant,
      getRestaurantById: (id) => get().restaurants.find((r) => r.id === id),
      getIsLoading: () => get().isLoading,
      getError: () => get().error,
    })),
    {
      name: "restaurant-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        restaurants: state.restaurants,
        currentRestaurant: state.currentRestaurant,
      }),
    }
  )
);

// Store para UI/UX
export const useUIStore = create(
  persist(
    subscribeWithSelector((set, get) => ({
      // Estado
      sidebarExpanded: false,
      currentView: "dashboard",
      theme: "dark",
      notifications: [],
      modals: {
        isOpen: false,
        type: null,
        data: null,
      },

      // Acciones
      toggleSidebar: () =>
        set((state) => ({
          sidebarExpanded: !state.sidebarExpanded,
        })),

      setSidebarExpanded: (expanded) => set({ sidebarExpanded: expanded }),

      setCurrentView: (view) => set({ currentView: view }),

      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === "dark" ? "light" : "dark",
        })),

      setTheme: (theme) => set({ theme }),

      addNotification: (notification) =>
        set((state) => ({
          notifications: [
            ...state.notifications,
            {
              ...notification,
              id: Date.now(),
              timestamp: new Date().toISOString(),
            },
          ],
        })),

      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),

      clearNotifications: () => set({ notifications: [] }),

      openModal: (type, data = null) =>
        set({
          modals: { isOpen: true, type, data },
        }),

      closeModal: () =>
        set({
          modals: { isOpen: false, type: null, data: null },
        }),

      // Selectores
      getSidebarExpanded: () => get().sidebarExpanded,
      getCurrentView: () => get().currentView,
      getTheme: () => get().theme,
      getNotifications: () => get().notifications,
      getModalState: () => get().modals,
    })),
    {
      name: "ui-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        sidebarExpanded: state.sidebarExpanded,
        currentView: state.currentView,
        theme: state.theme,
      }),
    }
  )
);

// Store para datos de dashboard
export const useDashboardStore = create(
  subscribeWithSelector((set, get) => ({
    // Estado
    stats: {
      totalRestaurants: 0,
      activeRestaurants: 0,
      totalUsers: 0,
      totalRevenue: 0,
    },
    recentActivity: [],
    isLoading: false,
    error: null,

    // Acciones
    setStats: (stats) => set({ stats }),

    updateStats: (updates) =>
      set((state) => ({
        stats: { ...state.stats, ...updates },
      })),

    setRecentActivity: (activity) => set({ recentActivity: activity }),

    addActivity: (activity) =>
      set((state) => ({
        recentActivity: [activity, ...state.recentActivity.slice(0, 9)], // Mantener solo 10
      })),

    setLoading: (isLoading) => set({ isLoading }),

    setError: (error) => set({ error }),

    clearError: () => set({ error: null }),

    // Selectores
    getStats: () => get().stats,
    getRecentActivity: () => get().recentActivity,
    getIsLoading: () => get().isLoading,
    getError: () => get().error,
  }))
);

// Store para configuración
export const useConfigStore = create(
  persist(
    subscribeWithSelector((set, get) => ({
      // Estado
      settings: {
        language: "es",
        currency: "ARS",
        timezone: "America/Argentina/Buenos_Aires",
        dateFormat: "DD/MM/YYYY",
        timeFormat: "24h",
        notifications: {
          email: true,
          push: true,
          sms: false,
        },
        security: {
          twoFactorAuth: false,
          sessionTimeout: 30, // minutos
          passwordPolicy: "strong",
        },
      },

      // Acciones
      updateSettings: (updates) =>
        set((state) => ({
          settings: { ...state.settings, ...updates },
        })),

      updateNotificationSettings: (settings) =>
        set((state) => ({
          settings: {
            ...state.settings,
            notifications: { ...state.settings.notifications, ...settings },
          },
        })),

      updateSecuritySettings: (settings) =>
        set((state) => ({
          settings: {
            ...state.settings,
            security: { ...state.settings.security, ...settings },
          },
        })),

      resetSettings: () =>
        set({
          settings: {
            language: "es",
            currency: "ARS",
            timezone: "America/Argentina/Buenos_Aires",
            dateFormat: "DD/MM/YYYY",
            timeFormat: "24h",
            notifications: {
              email: true,
              push: true,
              sms: false,
            },
            security: {
              twoFactorAuth: false,
              sessionTimeout: 30,
              passwordPolicy: "strong",
            },
          },
        }),

      // Selectores
      getSettings: () => get().settings,
      getLanguage: () => get().settings.language,
      getCurrency: () => get().settings.currency,
      getTimezone: () => get().settings.timezone,
      getNotificationSettings: () => get().settings.notifications,
      getSecuritySettings: () => get().settings.security,
    })),
    {
      name: "config-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Store combinado para acceso fácil
export const useStore = () => ({
  auth: useAuthStore(),
  restaurant: useRestaurantStore(),
  ui: useUIStore(),
  dashboard: useDashboardStore(),
  config: useConfigStore(),
});

// Hooks de conveniencia
export const useAuth = () => useAuthStore();
export const useRestaurant = () => useRestaurantStore();
export const useUI = () => useUIStore();
export const useDashboard = () => useDashboardStore();
export const useConfig = () => useConfigStore();
