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
          <div className="text-white p-6">
            <TituloSeccion />
            <div className="mt-6 grid gap-6">
              <ResumenCards />
              <CrearResto onChangeVista={setVistaActual} />
              <GraficosDashboard />
            </div>
          </div>
        );
    }
  };

  return renderVista();
}
