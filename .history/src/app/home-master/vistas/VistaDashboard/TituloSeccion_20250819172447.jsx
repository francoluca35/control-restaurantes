import { FaChartLine, FaCalendarAlt } from "react-icons/fa";

export default function TituloSeccion() {
  const currentDate = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-4 sm:p-6 border border-gray-700">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <FaChartLine className="text-white text-lg sm:text-xl" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Dashboard</h1>
            <p className="text-gray-300 text-xs sm:text-sm">
              Resumen general del sistema y estadísticas en tiempo real
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3 text-gray-300">
          <FaCalendarAlt className="text-base sm:text-lg" />
          <span className="text-xs sm:text-sm font-medium capitalize">{currentDate}</span>
        </div>
      </div>

      {/* Quick Stats Bar */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-gradient-to-r from-blue-900/50 to-blue-800/50 rounded-xl p-3 sm:p-4 border border-blue-700/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-300 text-xs sm:text-sm font-medium">Sistema</p>
              <p className="text-blue-100 text-sm sm:text-lg font-bold">Activo</p>
            </div>
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-900/50 to-green-800/50 rounded-xl p-3 sm:p-4 border border-green-700/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-300 text-xs sm:text-sm font-medium">Restaurantes</p>
              <p className="text-green-100 text-sm sm:text-lg font-bold">12</p>
            </div>
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-900/50 to-yellow-800/50 rounded-xl p-3 sm:p-4 border border-yellow-700/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-300 text-xs sm:text-sm font-medium">Pagos</p>
              <p className="text-yellow-100 text-sm sm:text-lg font-bold">8</p>
            </div>
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-500 rounded-full"></div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-900/50 to-purple-800/50 rounded-xl p-3 sm:p-4 border border-purple-700/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-300 text-xs sm:text-sm font-medium">Alertas</p>
              <p className="text-purple-100 text-sm sm:text-lg font-bold">2</p>
            </div>
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
