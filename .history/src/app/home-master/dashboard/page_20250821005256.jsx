"use client";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import SidebarMaster from "../components/SidebarMaster";
import VistaDashboard from "../vistas/VistaDashboard";
import VistaRestaurantes from "../vistas/VistaRestaurantes";
import VistaPagos from "../vistas/VistaPagos";
import VistaHistorial from "../vistas/VistaHistorial";
import VistaActivacion from "../vistas/VistaActivacion";
import VistaConfirmaciones from "../vistas/VistaConfirmaciones";
import ErrorBoundary from "../../../components/ErrorBoundary";
import { usePaymentNotifications } from "../../../hooks/usePaymentNotifications";
import NotificationPanel from "../../../components/NotificationPanel";

import { useUIStore } from "../../../store";

export default function DashboardMaster() {
  const { usuario, rol, loading } = useAuth();
  const router = useRouter();
  const [vista, setVista] = useState("inicio");
  const [sidebarAbierto, setSidebarAbierto] = useState(true);

  // Inicializar sistema de notificaciones de pagos con debug
  const { isConnected, connectionError, checkConnectionStatus } =
    usePaymentNotifications();

  useEffect(() => {
    if (!loading && (!usuario || rol !== "superadmin")) {
      console.log("🔍 DashboardMaster - Redirigiendo a login:", {
        loading,
        hasUsuario: !!usuario,
        rol,
        usuario,
      });
      router.push("/home-master/login");
    }
  }, [usuario, rol, loading, router]);

  // Loading screen
  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-6"></div>
            <div
              className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-500 rounded-full animate-spin mx-auto"
              style={{ animationDelay: "0.5s" }}
            ></div>
          </div>
          <h2 className="text-white text-xl font-semibold mb-2">
            Cargando Dashboard
          </h2>
          <p className="text-gray-400 text-sm">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  if (!usuario || rol !== "superadmin") {
    return null;
  }

  const renderVista = () => {
    switch (vista) {
      case "restaurantes":
        return (
          <ErrorBoundary>
            <VistaRestaurantes />
          </ErrorBoundary>
        );
      case "pagos":
        return (
          <ErrorBoundary>
            <VistaPagos />
          </ErrorBoundary>
        );
      case "confirmaciones":
        return (
          <ErrorBoundary>
            <VistaConfirmaciones />
          </ErrorBoundary>
        );
      case "historial":
        return (
          <ErrorBoundary>
            <VistaHistorial />
          </ErrorBoundary>
        );
      case "activacion":
        return (
          <ErrorBoundary>
            <VistaActivacion />
          </ErrorBoundary>
        );
      default:
        return (
          <ErrorBoundary>
            <VistaDashboard />
          </ErrorBoundary>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <SidebarMaster
        onChangeVista={setVista}
        onSidebarToggle={setSidebarAbierto}
      />
      <NotificationPanel />
      <main
        className={`min-h-screen transition-all duration-300 ease-in-out ${
          sidebarAbierto ? "ml-64" : "ml-20"
        }`}
      >
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
          {renderVista()}
        </div>
      </main>
    </div>
  );
}
