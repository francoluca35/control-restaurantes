import { FaArrowUp, FaArrowDown } from "react-icons/fa";

export default function CardEstadistica({
  icon: Icon,
  label,
  valor,
  subtitle,
  color,
  bgColor,
  borderColor,
  textColor,
  change,
  changeType,
}) {
  return (
    <div
      className={`bg-gradient-to-br ${bgColor} rounded-2xl p-6 border ${borderColor} shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1 backdrop-blur-sm`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-4">
            <div
              className={`w-12 h-12 bg-gradient-to-r ${color} rounded-xl flex items-center justify-center shadow-lg`}
            >
              <Icon size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-gray-300 text-sm font-medium">{label}</h3>
              {subtitle && <p className="text-gray-500 text-xs">{subtitle}</p>}
            </div>
          </div>

          <div className="mb-3">
            <p className={`text-3xl font-bold ${textColor}`}>{valor}</p>
          </div>

          {change && (
            <div className="flex items-center space-x-2">
              <div
                className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                  changeType === "positive"
                    ? "bg-green-900/50 text-green-300 border border-green-500/30"
                    : "bg-red-900/50 text-red-300 border border-red-500/30"
                }`}
              >
                {changeType === "positive" ? (
                  <FaArrowUp size={10} />
                ) : (
                  <FaArrowDown size={10} />
                )}
                <span>{change}</span>
              </div>
              <span className="text-gray-500 text-xs">vs mes anterior</span>
            </div>
          )}
        </div>
      </div>

      {/* Decorative element */}
      <div
        className={`absolute top-4 right-4 w-16 h-16 bg-gradient-to-r ${color} rounded-full opacity-10`}
      ></div>
    </div>
  );
}
