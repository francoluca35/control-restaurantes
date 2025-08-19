import CardEstadistica from "./CardEstadistica";
import { FaMoneyBillAlt, FaStore } from "react-icons/fa";
import { useDashboardStats } from "../../../../hooks/useDashboardStats";

export default function ResumenCards() {
  const { stats, loading } = useDashboardStats();

  const resumen = [
    {
      icon: FaMoneyBillAlt,
      label: "Pagos",
      valor: loading ? "..." : `$${stats.pagosTotales.toLocaleString()}`,
      color: "text-green-400",
    },
    {
      icon: FaStore,
      label: "Restaurantes",
      valor: loading ? "..." : stats.restaurantesActivos,
      color: "text-red-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {resumen.map((item, idx) => (
        <CardEstadistica key={idx} {...item} />
      ))}
    </div>
  );
}
