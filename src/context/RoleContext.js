"use client";

import { createContext, useContext, useMemo } from "react";
import { useAuth } from "../app/context/AuthContext";

const RoleContext = createContext();

export const RoleProvider = ({ children }) => {
  const { usuario, rol } = useAuth();

  const permissions = useMemo(() => {
    if (!rol) {
      return {};
    }

    switch (rol.toLowerCase()) {
      case "superadmin":
        return {
          // SUPERADMIN: Acceso total al sistema master
          canAccessDashboard: true,
          canAccessRestaurants: true,
          canAccessMetrics: true,
          canAccessPayments: true,
          canAccessHistory: true,
          canAccessActivation: true,
          // Permisos administrativos
          canManageRestaurants: true,
          canManageUsers: true,
          canViewAllData: true,
          canAccessSystemSettings: true,
          canGenerateReports: true,
          canManageBilling: true,
        };

      default:
        // Rol no reconocido, sin permisos
        return {
          canAccessDashboard: false,
          canAccessRestaurants: false,
          canAccessMetrics: false,
          canAccessPayments: false,
          canAccessHistory: false,
          canAccessActivation: false,
          canManageRestaurants: false,
          canManageUsers: false,
          canViewAllData: false,
          canAccessSystemSettings: false,
          canGenerateReports: false,
          canManageBilling: false,
        };
    }
  }, [rol]);

  const roleInfo = useMemo(() => {
    if (!rol) return null;

    const roleConfig = {
      superadmin: {
        name: "Super Administrador",
        description: "Acceso total al sistema master",
        color: "text-purple-400",
        bgColor: "bg-purple-500/20",
        borderColor: "border-purple-500/30",
      },
    };

    return (
      roleConfig[rol.toLowerCase()] || {
        name: "Rol Desconocido",
        description: "Sin permisos definidos",
        color: "text-gray-400",
        bgColor: "bg-gray-500/20",
        borderColor: "border-gray-500/30",
      }
    );
  }, [rol]);

  const value = {
    permissions,
    roleInfo,
    currentRole: rol,
    isSuperAdmin: rol?.toLowerCase() === "superadmin",
  };

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRole debe ser usado dentro de RoleProvider");
  }
  return context;
};
