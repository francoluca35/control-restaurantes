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
export default function DashboardMaster() {
  const { usuario, rol, loading } = useAuth();
  const router = useRouter();
  const [vista, setVista] = useState("inicio");

  useEffect(() => {
    // Solo redirigir si no está cargando y no hay usuario válido
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

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="flex min-h-screen bg-black items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, no mostrar nada (se redirigirá)
  if (!usuario || rol !== "superadmin") {
    return null;
  }

  const renderVista = () => {
    switch (vista) {
      case "restaurantes":
        return <VistaRestaurantes />;
      case "pagos":
        return <VistaPagos />;
      case "historial":
        return <VistaHistorial />;
      case "activacion":
        return <VistaActivacion />;
      default:
        return <VistaDashboard />;
    }
  };
  return (
    <div className="flex min-h-screen bg-black">
      <SidebarMaster onChangeVista={setVista} />
      <main className="flex-1 overflow-auto">{renderVista()}</main>
    </div>
  );
}
