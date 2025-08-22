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
      label: "Ingresos Totales Anuales",
      valor: loading
        ? "..."
        : `$${(
            (stats.ingresosAnuales?.USD || 0) +
            (stats.ingresosAnuales?.ARS || 0)
          ).toLocaleString()}`,
      subtitle: "Pagos anuales",
      color: "from-green-500 to-emerald-600",
      bgColor: "from-gray-800 to-gray-900",
      borderColor: "border-green-500/30",
      textColor: "text-green-400",
      change: "+12.5%",
      changeType: "positive",
    },
  ];

  // Tarjetas adicionales para ingresos separados por tipo
  const ingresosCards = [
    {
      icon: FaMoneyBillAlt,
      label: "Ingresos Anuales (USD)",
      valor: loading
        ? "..."
        : `$${stats.ingresosAnuales?.USD?.toLocaleString() || "0"}`,
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
      label: "Ingresos Anuales (ARS)",
      valor: loading
        ? "..."
        : `$${stats.ingresosAnuales?.ARS?.toLocaleString() || "0"}`,
      subtitle: "Pesos argentinos",
      color: "from-green-500 to-teal-600",
      bgColor: "from-gray-800 to-gray-900",
      borderColor: "border-green-500/30",
      textColor: "text-green-400",
      change: "+18.7%",
      changeType: "positive",
    },
    {
      icon: FaMoneyBillAlt,
      label: "Ingresos Mensuales (USD)",
      valor: loading
        ? "..."
        : `$${stats.ingresosMensuales?.USD?.toLocaleString() || "0"}`,
      subtitle: "Dólares estadounidenses",
      color: "from-blue-500 to-cyan-600",
      bgColor: "from-gray-800 to-gray-900",
      borderColor: "border-blue-500/30",
      textColor: "text-blue-400",
      change: "+15.3%",
      changeType: "positive",
    },
    {
      icon: FaMoneyBillAlt,
      label: "Ingresos Mensuales (ARS)",
      valor: loading
        ? "..."
        : `$${stats.ingresosMensuales?.ARS?.toLocaleString() || "0"}`,
      subtitle: "Pesos argentinos",
      color: "from-purple-500 to-pink-600",
      bgColor: "from-gray-800 to-gray-900",
      borderColor: "border-purple-500/30",
      textColor: "text-purple-400",
      change: "+18.7%",
      changeType: "positive",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Tarjetas principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
        {resumen.map((item, idx) => (
          <CardEstadistica key={idx} {...item} />
        ))}
      </div>

      {/* Tarjetas de ingresos separados por tipo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
        {ingresosCards.map((item, idx) => (
          <CardEstadistica key={`ingresos-${idx}`} {...item} />
        ))}
      </div>
    </div>
  );
}
