import { useDashboardStats } from "../../../../hooks/useDashboardStats.js";

export default function GraficosDashboard() {
  const { stats, loading, error } = useDashboardStats();

  // Valores por defecto para evitar errores
  const defaultStats = {
    localesNuevosEsteMes: 0,
    crecimientoAnual: {
      ganancias: 0,
      perdidas: 0,
      localesTotales: 0,
      ingresosMensuales: 0,
    },
  };

  // Usar stats si está disponible, sino usar valores por defecto
  const safeStats = stats || defaultStats;

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Locales nuevos este mes */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6 rounded-2xl shadow-2xl border border-gray-700 hover:shadow-3xl transition-all duration-300">
        <div className="flex items-center justify-center mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg mr-3">
            <span className="text-white text-lg">📊</span>
          </div>
          <h3 className="text-white text-lg font-semibold">
            Locales nuevos este mes
          </h3>
        </div>
        <div className="h-48 rounded-xl bg-gradient-to-br from-blue-900/30 to-blue-700/30 border border-blue-500/20 flex items-center justify-center text-white backdrop-blur-sm">
          <div className="text-center">
            <div className="text-5xl font-bold mb-2 text-blue-300">
              {loading ? "..." : safeStats.localesNuevosEsteMes || 0}
            </div>
            <div className="text-sm text-blue-200 opacity-80">
              nuevos restaurantes
            </div>
          </div>
        </div>
      </div>

      {/* Crecimiento anual */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6 rounded-2xl shadow-2xl border border-gray-700 hover:shadow-3xl transition-all duration-300">
        <div className="flex items-center justify-center mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg mr-3">
            <span className="text-white text-lg">📈</span>
          </div>
          <h3 className="text-white text-lg font-semibold">
            Crecimiento anual
          </h3>
        </div>
        <div className="h-48 rounded-xl bg-gradient-to-br from-gray-700/30 to-gray-800/30 border border-gray-600/20 p-4 backdrop-blur-sm">
          {loading ? (
            <div className="flex items-center justify-center h-full text-white">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                <span className="text-sm text-gray-300">Cargando...</span>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full text-white">
              <div className="text-center">
                <div className="text-red-400 mb-2">⚠️</div>
                <span className="text-sm text-gray-300">Error al cargar datos</span>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Ganancias */}
              <div className="flex justify-between items-center p-2 rounded-lg bg-green-900/20 border border-green-500/20">
                <span className="text-gray-300 text-sm flex items-center">
                  <span className="text-green-400 mr-2">💰</span>
                  Ganancias:
                </span>
                <span className="text-green-400 font-semibold">
                  ${(safeStats.crecimientoAnual?.ganancias || 0).toLocaleString()}
                </span>
              </div>

              {/* Pérdidas */}
              <div className="flex justify-between items-center p-2 rounded-lg bg-red-900/20 border border-red-500/20">
                <span className="text-gray-300 text-sm flex items-center">
                  <span className="text-red-400 mr-2">💸</span>
                  Pérdidas:
                </span>
                <span className="text-red-400 font-semibold">
                  ${(safeStats.crecimientoAnual?.perdidas || 0).toLocaleString()}
                </span>
              </div>

              {/* Locales totales */}
              <div className="flex justify-between items-center p-2 rounded-lg bg-blue-900/20 border border-blue-500/20">
                <span className="text-gray-300 text-sm flex items-center">
                  <span className="text-blue-400 mr-2">🏪</span>
                  Locales totales:
                </span>
                <span className="text-blue-400 font-semibold">
                  {safeStats.crecimientoAnual?.localesTotales || 0}
                </span>
              </div>

              {/* Ingresos mensuales */}
              <div className="flex justify-between items-center p-2 rounded-lg bg-yellow-900/20 border border-yellow-500/20">
                <span className="text-gray-300 text-sm flex items-center">
                  <span className="text-yellow-400 mr-2">📊</span>
                  Ingresos mensuales:
                </span>
                <span className="text-yellow-400 font-semibold">
                  ${(safeStats.crecimientoAnual?.ingresosMensuales || 0).toLocaleString()}
                </span>
              </div>

              {/* Barra de progreso neto */}
              <div className="mt-4 p-3 rounded-lg bg-gray-800/50 border border-gray-600/20">
                <div className="flex justify-between text-xs text-gray-300 mb-2">
                  <span className="flex items-center">
                    <span className="text-green-400 mr-1">📈</span>
                    Neto:
                  </span>
                  <span className="text-green-400 font-semibold">
                    $
                    {(
                      (safeStats.crecimientoAnual?.ganancias || 0) -
                      (safeStats.crecimientoAnual?.perdidas || 0)
                    ).toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full transition-all duration-500 shadow-lg"
                    style={{
                      width: `${Math.min(
                        100,
                        ((safeStats.crecimientoAnual?.ganancias || 0) /
                          ((safeStats.crecimientoAnual?.ganancias || 0) +
                            (safeStats.crecimientoAnual?.perdidas || 0))) *
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