import CardEstadistica from "./CardEstadistica";
import { FaMoneyBillAlt, FaStore, FaUsers, FaChartLine, FaClock, FaExclamationTriangle } from "react-icons/fa";
import { useDashboardStats } from "../../../../hooks/useDashboardStats.js";

export default function ResumenCards() {
  const { stats, loading } = useDashboardStats();

  const resumen = [
    {
      icon: FaMoneyBillAlt,
      label: "Ingresos Totales",
      valor: loading ? "..." : `$${stats.pagosTotales?.toLocaleString() || "0"}`,
      subtitle: "Este mes",
      color: "from-green-500 to-emerald-600",
      bgColor: "from-green-50 to-emerald-50",
      borderColor: "border-green-200",
      textColor: "text-green-700",
      change: "+12.5%",
      changeType: "positive"
    },
    {
      icon: FaStore,
      label: "Restaurantes Activos",
      valor: loading ? "..." : stats.restaurantesActivos || "0",
      subtitle: "De 15 totales",
      color: "from-blue-500 to-cyan-600",
      bgColor: "from-blue-50 to-cyan-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-700",
      change: "+2",
      changeType: "positive"
    },
    {
      icon: FaUsers,
      label: "Usuarios Activos",
      valor: loading ? "..." : "156",
      subtitle: "En línea ahora",
      color: "from-purple-500 to-pink-600",
      bgColor: "from-purple-50 to-pink-50",
      borderColor: "border-purple-200",
      textColor: "text-purple-700",
      change: "+8.2%",
      changeType: "positive"
    },
    {
      icon: FaExclamationTriangle,
      label: "Alertas Pendientes",
      valor: loading ? "..." : "3",
      subtitle: "Requieren atención",
      color: "from-orange-500 to-red-600",
      bgColor: "from-orange-50 to-red-50",
      borderColor: "border-orange-200",
      textColor: "text-orange-700",
      change: "-1",
      changeType: "negative"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {resumen.map((item, idx) => (
        <CardEstadistica key={idx} {...item} />
      ))}
    </div>
  );
}
