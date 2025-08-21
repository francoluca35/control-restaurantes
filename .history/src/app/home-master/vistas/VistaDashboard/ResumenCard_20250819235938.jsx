import CardEstadistica from "./CardEstadistica";
import {
  FaMoneyBillAlt,
  FaStore,
  FaUsers,
  FaChartLine,
  FaClock,
  FaExclamationTriangle,
} from "react-icons/fa";
import { useDashboardStats } from "../../../../hooks/useDashboardStats.js";

export default function ResumenCards() {
  const { stats, loading } = useDashboardStats();

  const resumen = [
    {
      icon: FaMoneyBillAlt,
      label: "Ingresos Totales",
      valor: loading
        ? "..."
        : `$${stats.pagosTotales?.toLocaleString() || "0"}`,
      subtitle: "Este mes",
      color: "from-green-500 to-emerald-600",
      bgColor: "from-gray-800 to-gray-900",
      borderColor: "border-green-500/30",
      textColor: "text-green-400",
      change: "+12.5%",
      changeType: "positive",
    },
    {
      icon: FaStore,
      label: "Restaurantes Activos",
      valor: loading ? "..." : stats.restaurantesActivos || "0",
      subtitle: "De 15 totales",
      color: "from-blue-500 to-cyan-600",
      bgColor: "from-gray-800 to-gray-900",
      borderColor: "border-blue-500/30",
      textColor: "text-blue-400",
      change: "+2",
      changeType: "positive",
    },
    {
      icon: FaUsers,
      label: "Usuarios Activos",
      valor: loading ? "..." : "156",
      subtitle: "En línea ahora",
      color: "from-purple-500 to-pink-600",
      bgColor: "from-gray-800 to-gray-900",
      borderColor: "border-purple-500/30",
      textColor: "text-purple-400",
      change: "+8.2%",
      changeType: "positive",
    },
    {
      icon: FaExclamationTriangle,
      label: "Alertas Pendientes",
      valor: loading ? "..." : "3",
      subtitle: "Requieren atención",
      color: "from-orange-500 to-red-600",
      bgColor: "from-gray-800 to-gray-900",
      borderColor: "border-orange-500/30",
      textColor: "text-orange-400",
      change: "-1",
      changeType: "negative",
    },
  ];

  // Tarjetas adicionales para ingresos mensuales en ambas monedas
  const ingresosMensualesCards = [
    {
      icon: FaMoneyBillAlt,
      label: "Ingresos Mensuales (USD)",
      valor: loading
        ? "..."
        : `$${stats.crecimientoAnual?.ingresosMensuales?.USD?.toLocaleString() || "0"}`,
      subtitle: "Dólares estadounidenses",
      color: "from-yellow-500 to-orange-600",
      bgColor: "from-gray-800 to-gray-900",
      borderColor: "border-yellow-500/30",
      textColor: "text-yellow-400",
      change: "+15.3%",
      changeType: "positive",
    },
    {
      icon: FaMoneyBillAlt,
      label: "Ingresos Mensuales (ARS)",
      valor: loading
        ? "..."
        : `$${stats.crecimientoAnual?.ingresosMensuales?.ARS?.toLocaleString() || "0"}`,
      subtitle: "Pesos argentinos",
      color: "from-green-500 to-teal-600",
      bgColor: "from-gray-800 to-gray-900",
      borderColor: "border-green-500/30",
      textColor: "text-green-400",
      change: "+18.7%",
      changeType: "positive",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
      {resumen.map((item, idx) => (
        <CardEstadistica key={idx} {...item} />
      ))}
    </div>
  );
}
