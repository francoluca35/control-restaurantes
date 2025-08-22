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
      gananciaMensualUSD: 0,
      gananciaAnualUSD: 0,
      gananciaMensualARS: 0,
      gananciaAnualARS: 0,
      netoPesos: 0,
      netoDolares: 0,
    },
  };

  // Usar stats si está disponible, sino usar valores por defecto
  const safeStats = stats || defaultStats;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      {/* Locales nuevos este mes */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-4 sm:p-6 rounded-2xl shadow-2xl border border-gray-700 hover:shadow-3xl transition-all duration-300">
        <div className="flex items-center justify-center mb-3 sm:mb-4">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg mr-2 sm:mr-3">
            <span className="text-white text-sm sm:text-lg">📊</span>
          </div>
          <h3 className="text-white text-sm sm:text-lg font-semibold">
            Locales nuevos este mes
          </h3>
        </div>
        <div className="h-32 sm:h-48 rounded-xl bg-gradient-to-br from-blue-900/30 to-blue-700/30 border border-blue-500/20 flex items-center justify-center text-white backdrop-blur-sm">
          <div className="text-center">
            <div className="text-3xl sm:text-5xl font-bold mb-1 sm:mb-2 text-blue-300">
              {loading ? "..." : safeStats.localesNuevosEsteMes || 0}
            </div>
            <div className="text-xs sm:text-sm text-blue-200 opacity-80">
              nuevos restaurantes
            </div>
          </div>
        </div>
      </div>

      {/* Crecimiento anual */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-4 sm:p-6 rounded-2xl shadow-2xl border border-gray-700 hover:shadow-3xl transition-all duration-300">
        <div className="flex items-center justify-center mb-3 sm:mb-4">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg mr-2 sm:mr-3">
            <span className="text-white text-sm sm:text-lg">📈</span>
          </div>
          <h3 className="text-white text-sm sm:text-lg font-semibold">
            Crecimiento anual
          </h3>
        </div>
        <div className="h-32 sm:h-48 rounded-xl bg-gradient-to-br from-gray-700/30 to-gray-800/30 border border-gray-600/20 p-3 sm:p-4 backdrop-blur-sm overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full text-white">
              <div className="text-center">
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                <span className="text-xs sm:text-sm text-gray-300">
                  Cargando...
                </span>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full text-white">
              <div className="text-center">
                <div className="text-red-400 mb-2">⚠️</div>
                <span className="text-xs sm:text-sm text-gray-300">
                  Error al cargar datos
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {/* Locales totales */}
              <div className="flex justify-between items-center p-2 rounded-lg bg-blue-900/20 border border-blue-500/20">
                <span className="text-gray-300 text-xs sm:text-sm flex items-center">
                  <span className="text-blue-400 mr-1 sm:mr-2">🏪</span>
                  Locales totales:
                </span>
                <span className="text-blue-400 font-semibold text-xs sm:text-sm">
                  {safeStats.crecimientoAnual?.localesTotales || 0}
                </span>
              </div>

              {/* Ganancia mensual USD */}
              <div className="flex justify-between items-center p-2 rounded-lg bg-yellow-900/20 border border-yellow-500/20">
                <span className="text-gray-300 text-xs sm:text-sm flex items-center">
                  <span className="text-yellow-400 mr-1 sm:mr-2">💵</span>
                  Ganancia mensual USD:
                </span>
                <span className="text-yellow-400 font-semibold text-xs sm:text-sm">
                  $
                  {(
                    safeStats.crecimientoAnual?.gananciaMensualUSD || 0
                  ).toLocaleString()}
                </span>
              </div>

              {/* Ganancia anual USD */}
              <div className="flex justify-between items-center p-2 rounded-lg bg-orange-900/20 border border-orange-500/20">
                <span className="text-gray-300 text-xs sm:text-sm flex items-center">
                  <span className="text-orange-400 mr-1 sm:mr-2">💰</span>
                  Ganancia anual USD:
                </span>
                <span className="text-orange-400 font-semibold text-xs sm:text-sm">
                  $
                  {(
                    safeStats.crecimientoAnual?.gananciaAnualUSD || 0
                  ).toLocaleString()}
                </span>
              </div>

              {/* Ganancia mensual ARS */}
              <div className="flex justify-between items-center p-2 rounded-lg bg-green-900/20 border border-green-500/20">
                <span className="text-gray-300 text-xs sm:text-sm flex items-center">
                  <span className="text-green-400 mr-1 sm:mr-2">🇦🇷</span>
                  Ganancia mensual ARS:
                </span>
                <span className="text-green-400 font-semibold text-xs sm:text-sm">
                  $
                  {(
                    safeStats.crecimientoAnual?.gananciaMensualARS || 0
                  ).toLocaleString()}
                </span>
              </div>

              {/* Ganancia anual ARS */}
              <div className="flex justify-between items-center p-2 rounded-lg bg-emerald-900/20 border border-emerald-500/20">
                <span className="text-gray-300 text-xs sm:text-sm flex items-center">
                  <span className="text-emerald-400 mr-1 sm:mr-2">💎</span>
                  Ganancia anual ARS:
                </span>
                <span className="text-emerald-400 font-semibold text-xs sm:text-sm">
                  $
                  {(
                    safeStats.crecimientoAnual?.gananciaAnualARS || 0
                  ).toLocaleString()}
                </span>
              </div>

              {/* Neto en pesos */}
              <div className="flex justify-between items-center p-2 rounded-lg bg-purple-900/20 border border-purple-500/20">
                <span className="text-gray-300 text-xs sm:text-sm flex items-center">
                  <span className="text-purple-400 mr-1 sm:mr-2">🇦🇷</span>
                  Neto en pesos:
                </span>
                <span className="text-purple-400 font-semibold text-xs sm:text-sm">
                  $
                  {(
                    safeStats.crecimientoAnual?.netoPesos || 0
                  ).toLocaleString()}
                </span>
              </div>

              {/* Neto en dólares */}
              <div className="flex justify-between items-center p-2 rounded-lg bg-indigo-900/20 border border-indigo-500/20">
                <span className="text-gray-300 text-xs sm:text-sm flex items-center">
                  <span className="text-indigo-400 mr-1 sm:mr-2">💲</span>
                  Neto en dólares:
                </span>
                <span className="text-indigo-400 font-semibold text-xs sm:text-sm">
                  $
                  {(
                    safeStats.crecimientoAnual?.netoDolares || 0
                  ).toLocaleString()}
                </span>
              </div>

              {/* Barra de progreso neto total */}
              <div className="mt-3 sm:mt-4 p-2 sm:p-3 rounded-lg bg-gray-800/50 border border-gray-600/20">
                <div className="flex justify-between text-xs text-gray-300 mb-2">
                  <span className="flex items-center">
                    <span className="text-green-400 mr-1">📈</span>
                    Total Neto:
                  </span>
                  <span className="text-green-400 font-semibold text-xs">
                    $
                    {(
                      (safeStats.crecimientoAnual?.netoDolares || 0) +
                      (safeStats.crecimientoAnual?.netoPesos || 0)
                    ).toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 sm:h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 sm:h-3 rounded-full transition-all duration-500 shadow-lg"
                    style={{
                      width: `${Math.min(
                        100,
                        (safeStats.crecimientoAnual?.netoDolares || 0) +
                          (safeStats.crecimientoAnual?.netoPesos || 0) >
                          0
                          ? 100
                          : 0
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
