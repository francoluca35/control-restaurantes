"use client";
import React from "react";
import {
  FaShoppingCart,
  FaUsers,
  FaStore,
  FaBoxes,
  FaDollarSign,
  FaExclamationTriangle,
  FaChartLine,
} from "react-icons/fa";

export default function BusinessDashboard({ stats }) {
  if (!stats) {
    return (
      <div className="bg-slate-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <FaShoppingCart className="mr-2" />
          Business Dashboard
        </h3>
        <p className="text-slate-400">Sin datos de negocio disponibles</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pedidos */}
        <div className="bg-slate-800 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <FaShoppingCart className="text-blue-400" />
            <span className="text-xs text-green-400">↗ +12.5%</span>
          </div>
          <div className="text-white text-2xl font-bold">
            {stats.orders.total}
          </div>
          <div className="text-slate-400 text-sm">Pedidos totales</div>
          <div className="text-xs text-slate-500 mt-1">
            Promedio: ${stats.orders.avgValue.toFixed(2)}
          </div>
        </div>

        {/* Usuarios activos */}
        <div className="bg-slate-800 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <FaUsers className="text-green-400" />
            <span className="text-xs text-green-400">↗ +8.3%</span>
          </div>
          <div className="text-white text-2xl font-bold">
            {stats.users.active}
          </div>
          <div className="text-slate-400 text-sm">Usuarios activos</div>
          <div className="text-xs text-slate-500 mt-1">En línea ahora</div>
        </div>

        {/* Restaurantes activos */}
        <div className="bg-slate-800 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <FaStore className="text-purple-400" />
            <span className="text-xs text-green-400">↗ +5.2%</span>
          </div>
          <div className="text-white text-2xl font-bold">
            {stats.restaurants.active}
          </div>
          <div className="text-slate-400 text-sm">Restaurantes activos</div>
          <div className="text-xs text-slate-500 mt-1">Operando</div>
        </div>

        {/* Valor del inventario */}
        <div className="bg-slate-800 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <FaDollarSign className="text-yellow-400" />
            <span className="text-xs text-green-400">↗ +15.7%</span>
          </div>
          <div className="text-white text-2xl font-bold">
            ${stats.inventory.totalValue.toLocaleString()}
          </div>
          <div className="text-slate-400 text-sm">Valor en inventario</div>
          <div className="text-xs text-slate-500 mt-1">Stock total</div>
        </div>
      </div>

      {/* Análisis detallado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Análisis de pedidos */}
        <div className="bg-slate-800 rounded-lg p-4">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
            <FaShoppingCart className="mr-2" />
            Análisis de Pedidos
          </h4>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Total de pedidos</span>
              <span className="text-white font-semibold">
                {stats.orders.total}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400">Valor promedio</span>
              <span className="text-white font-semibold">
                ${stats.orders.avgValue.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400">Valor total</span>
              <span className="text-white font-semibold">
                ${(stats.orders.total * stats.orders.avgValue).toLocaleString()}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-700">
              <div className="text-xs text-slate-400 mb-2">
                Tendencia de pedidos
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{
                    width: `${Math.min(
                      (stats.orders.total / 100) * 100,
                      100
                    )}%`,
                  }}
                ></div>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {stats.orders.total > 50
                  ? "Alto volumen"
                  : stats.orders.total > 20
                  ? "Volumen medio"
                  : "Volumen bajo"}
              </div>
            </div>
          </div>
        </div>

        {/* Análisis de inventario */}
        <div className="bg-slate-800 rounded-lg p-4">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
            <FaBoxes className="mr-2" />
            Estado del Inventario
          </h4>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Items sin stock</span>
              <span className="text-red-400 font-semibold">
                {stats.inventory.outOfStock}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400">Items con stock bajo</span>
              <span className="text-yellow-400 font-semibold">
                {stats.inventory.lowStock}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400">Valor total</span>
              <span className="text-white font-semibold">
                ${stats.inventory.totalValue.toLocaleString()}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-700">
              <div className="text-xs text-slate-400 mb-2">Estado general</div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    stats.inventory.outOfStock > 10
                      ? "bg-red-500"
                      : stats.inventory.outOfStock > 5
                      ? "bg-yellow-500"
                      : "bg-green-500"
                  }`}
                  style={{
                    width: `${Math.max(
                      100 - stats.inventory.outOfStock * 10,
                      20
                    )}%`,
                  }}
                ></div>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {stats.inventory.outOfStock > 10
                  ? "Necesita reabastecimiento urgente"
                  : stats.inventory.outOfStock > 5
                  ? "Algunos items necesitan stock"
                  : "Inventario saludable"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alertas de negocio */}
      <div className="bg-slate-800 rounded-lg p-4">
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
          <FaExclamationTriangle className="mr-2" />
          Alertas de Negocio
        </h4>

        <div className="space-y-3">
          {stats.inventory.outOfStock > 5 && (
            <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
              <div className="text-red-400 font-semibold text-sm mb-1">
                🚨 Items sin stock
              </div>
              <div className="text-red-300 text-xs">
                Hay {stats.inventory.outOfStock} items sin stock. Revisa el
                inventario urgentemente.
              </div>
            </div>
          )}

          {stats.inventory.lowStock > 10 && (
            <div className="p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
              <div className="text-yellow-400 font-semibold text-sm mb-1">
                ⚠️ Stock bajo
              </div>
              <div className="text-yellow-300 text-xs">
                {stats.inventory.lowStock} items tienen stock bajo. Considera
                reabastecer.
              </div>
            </div>
          )}

          {stats.orders.total === 0 && (
            <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
              <div className="text-blue-400 font-semibold text-sm mb-1">
                📊 Sin actividad
              </div>
              <div className="text-blue-300 text-xs">
                No hay pedidos registrados. Verifica la actividad de los
                restaurantes.
              </div>
            </div>
          )}

          {stats.users.active === 0 && (
            <div className="p-3 bg-orange-900/20 border border-orange-500/30 rounded-lg">
              <div className="text-orange-400 font-semibold text-sm mb-1">
                👥 Sin usuarios activos
              </div>
              <div className="text-orange-300 text-xs">
                No hay usuarios activos en este momento. Verifica la
                conectividad.
              </div>
            </div>
          )}

          {stats.inventory.outOfStock === 0 && stats.orders.total > 0 && (
            <div className="p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
              <div className="text-green-400 font-semibold text-sm mb-1">
                ✅ Negocio saludable
              </div>
              <div className="text-green-300 text-xs">
                El inventario está bien abastecido y hay actividad de pedidos.
                ¡Excelente!
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recomendaciones */}
      <div className="bg-slate-800 rounded-lg p-4">
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
          <FaChartLine className="mr-2" />
          Recomendaciones de Negocio
        </h4>

        <div className="space-y-3">
          {stats.inventory.outOfStock > 5 && (
            <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
              <div className="text-red-400 font-semibold text-sm mb-1">
                🔄 Reabastecimiento urgente
              </div>
              <div className="text-red-300 text-xs">
                • Contacta a los proveedores para los items sin stock
                <br />
                • Prioriza los items más vendidos
                <br />• Considera aumentar el stock mínimo
              </div>
            </div>
          )}

          {stats.orders.avgValue < 20 && (
            <div className="p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
              <div className="text-yellow-400 font-semibold text-sm mb-1">
                💰 Optimizar valor promedio
              </div>
              <div className="text-yellow-300 text-xs">
                • Revisa la estrategia de precios
                <br />
                • Considera ofertas de combos
                <br />• Analiza los items más vendidos
              </div>
            </div>
          )}

          {stats.users.active < 5 && (
            <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
              <div className="text-blue-400 font-semibold text-sm mb-1">
                👥 Fomentar uso de la aplicación
              </div>
              <div className="text-blue-300 text-xs">
                • Capacita al personal en el uso del sistema
                <br />
                • Promociona las funcionalidades
                <br />• Considera incentivos por uso
              </div>
            </div>
          )}

          {stats.inventory.totalValue > 10000 && (
            <div className="p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
              <div className="text-green-400 font-semibold text-sm mb-1">
                📈 Negocio en crecimiento
              </div>
              <div className="text-green-300 text-xs">
                • El valor del inventario es alto, indica buena inversión
                <br />
                • Considera expandir las operaciones
                <br />• Analiza la rotación de inventario
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
