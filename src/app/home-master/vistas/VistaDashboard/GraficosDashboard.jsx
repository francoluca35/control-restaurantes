import { useDashboardStats } from "../../../../hooks/useDashboardStats";

export default function GraficosDashboard() {
  const { stats, loading } = useDashboardStats();

  return (
    <div className="grid md:grid-cols-2 gap-6 p-4">
      {/* Locales nuevos este mes */}
      <div className="bg-[#1e293b] p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
        <h3 className="text-white text-lg font-semibold text-center mb-4">
          Locales nuevos este mes
        </h3>
        <div className="h-48 rounded-xl bg-gradient-to-br from-blue-500/30 to-blue-700/30 flex items-center justify-center text-white">
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">
              {loading ? "..." : stats.localesNuevosEsteMes}
            </div>
            <div className="text-sm opacity-70">nuevos restaurantes</div>
          </div>
        </div>
      </div>

      {/* Crecimiento anual */}
      <div className="bg-[#1e293b] p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
        <h3 className="text-white text-lg font-semibold text-center mb-4">
          Crecimiento anual
        </h3>
        <div className="h-48 rounded-xl bg-gradient-to-br from-slate-500/30 to-slate-700/30 p-4">
          {loading ? (
            <div className="flex items-center justify-center h-full text-white">
              <span className="text-sm opacity-70">Cargando...</span>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Ganancias */}
              <div className="flex justify-between items-center">
                <span className="text-white text-sm">Ganancias:</span>
                <span className="text-green-400 font-semibold">
                  ${stats.crecimientoAnual.ganancias.toLocaleString()}
                </span>
              </div>

              {/* Pérdidas */}
              <div className="flex justify-between items-center">
                <span className="text-white text-sm">Pérdidas:</span>
                <span className="text-red-400 font-semibold">
                  ${stats.crecimientoAnual.perdidas.toLocaleString()}
                </span>
              </div>

              {/* Locales totales */}
              <div className="flex justify-between items-center">
                <span className="text-white text-sm">Locales totales:</span>
                <span className="text-blue-400 font-semibold">
                  {stats.crecimientoAnual.localesTotales}
                </span>
              </div>

              {/* Ingresos mensuales */}
              <div className="flex justify-between items-center">
                <span className="text-white text-sm">Ingresos mensuales:</span>
                <span className="text-yellow-400 font-semibold">
                  ${stats.crecimientoAnual.ingresosMensuales.toLocaleString()}
                </span>
              </div>

              {/* Barra de progreso neto */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-white mb-1">
                  <span>Neto:</span>
                  <span className="text-green-400">
                    $
                    {(
                      stats.crecimientoAnual.ganancias -
                      stats.crecimientoAnual.perdidas
                    ).toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        100,
                        (stats.crecimientoAnual.ganancias /
                          (stats.crecimientoAnual.ganancias +
                            stats.crecimientoAnual.perdidas)) *
                          100
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
