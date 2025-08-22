import { FaChartLine, FaCalendarAlt } from "react-icons/fa";

export default function TituloSeccion() {
  const currentDate = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-6 lg:p-8 border border-gray-700">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <FaChartLine className="text-white text-xl lg:text-2xl" />
          </div>
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
              Dashboard
            </h1>
            <p className="text-gray-300 text-sm lg:text-base">
              Resumen general del sistema y estadísticas en tiempo real
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-gray-300">
          <FaCalendarAlt className="text-lg lg:text-xl" />
          <span className="text-sm lg:text-base font-medium capitalize">
            {currentDate}
          </span>
        </div>
      </div>

      {/* Quick Stats Bar */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
        <div className="bg-gradient-to-r from-blue-900/50 to-blue-800/50 rounded-xl p-4 lg:p-6 border border-blue-700/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-300 text-sm lg:text-base font-medium">
                Sistema
              </p>
              <p className="text-blue-100 text-lg lg:text-xl font-bold">
                Activo
              </p>
            </div>
            <div className="w-3 h-3 lg:w-4 lg:h-4 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-900/50 to-green-800/50 rounded-xl p-4 lg:p-6 border border-green-700/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-300 text-sm lg:text-base font-medium">
                Restaurantes
              </p>
              <p className="text-green-100 text-lg lg:text-xl font-bold">12</p>
            </div>
            <div className="w-3 h-3 lg:w-4 lg:h-4 bg-green-500 rounded-full"></div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-900/50 to-yellow-800/50 rounded-xl p-4 lg:p-6 border border-yellow-700/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-300 text-sm lg:text-base font-medium">
                Pagos
              </p>
              <p className="text-yellow-100 text-lg lg:text-xl font-bold">8</p>
            </div>
            <div className="w-3 h-3 lg:w-4 lg:h-4 bg-yellow-500 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
