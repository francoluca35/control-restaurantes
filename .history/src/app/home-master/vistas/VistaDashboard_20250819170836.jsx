"use client";
import { useState } from "react";
import TituloSeccion from "./VistaDashboard/TituloSeccion";
import ResumenCards from "./VistaDashboard/ResumenCard";
import GraficosDashboard from "./VistaDashboard/GraficosDashboard";
import BotonesDashboard from "./VistaDashboard/BotonesDashboard";
import CrearResto from "./VistaDashboard/CrearResto";
import VistaActivacion from "./VistaActivacion";
import VistaPagos from "./VistaPagos";
import VistaHistorial from "./VistaHistorial";
import VistaRestaurantes from "./VistaRestaurantes";

export default function VistaDashboard() {
  const [vistaActual, setVistaActual] = useState("inicio");

  const renderVista = () => {
    switch (vistaActual) {
      case "activacion":
        return <VistaActivacion />;
      case "pagos":
        return <VistaPagos />;
      case "historial":
        return <VistaHistorial />;
      case "restaurantes":
        return <VistaRestaurantes />;
      default:
        return (
          <div className="p-8">
            {/* Header Section */}
            <div className="mb-8">
              <TituloSeccion />
            </div>

            {/* Main Content */}
            <div className="space-y-8">
              {/* Stats Cards */}
              <div className="mb-8">
                <ResumenCards />
              </div>

              {/* Quick Actions */}
              <div className="mb-8">
                <CrearResto onChangeVista={setVistaActual} />
              </div>

              {/* Charts and Analytics */}
              <div className="mb-8">
                <GraficosDashboard />
              </div>
            </div>
          </div>
        );
    }
  };

  return renderVista();
}
