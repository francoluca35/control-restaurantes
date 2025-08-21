"use client";

import React, { useState } from "react";
import RestaurantPaymentFlow from "../../components/RestaurantPaymentFlow";

const RestaurantPaymentPage = () => {
  const [restaurantData, setRestaurantData] = useState({
    id: "restaurant-123",
    nombre: "Restaurante Ejemplo",
    propietario: "Juan Pérez",
    direccion: "Av. Corrientes 1234, Buenos Aires",
    telefono: "+54 11 1234-5678",
    email: "juan@restaurante.com",
    precio: 1000,
    moneda: "ARS",
  });

  const [amount, setAmount] = useState(1000);
  const [selectedCurrency, setSelectedCurrency] = useState("ARS");

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Sistema de Activación de Restaurantes
          </h1>
          <p className="text-gray-600">
            Genera links de pago, monitorea el estado y activa restaurantes
            automáticamente
          </p>
        </div>

        {/* Información del restaurante */}
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Datos del Restaurante
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Restaurante
              </label>
              <input
                type="text"
                value={restaurantData.nombre}
                onChange={(e) =>
                  setRestaurantData({
                    ...restaurantData,
                    nombre: e.target.value,
                  })
                }
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Propietario
              </label>
              <input
                type="text"
                value={restaurantData.propietario}
                onChange={(e) =>
                  setRestaurantData({
                    ...restaurantData,
                    propietario: e.target.value,
                  })
                }
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dirección
              </label>
              <input
                type="text"
                value={restaurantData.direccion}
                onChange={(e) =>
                  setRestaurantData({
                    ...restaurantData,
                    direccion: e.target.value,
                  })
                }
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <input
                type="text"
                value={restaurantData.telefono}
                onChange={(e) =>
                  setRestaurantData({
                    ...restaurantData,
                    telefono: e.target.value,
                  })
                }
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={restaurantData.email}
                onChange={(e) =>
                  setRestaurantData({
                    ...restaurantData,
                    email: e.target.value,
                  })
                }
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Moneda de Pago
              </label>
              <select
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ARS">Pesos Argentinos (ARS)</option>
                <option value="USD">Dólares Estadounidenses (USD)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monto de Activación ({selectedCurrency})
              </label>
              <div className="flex items-center">
                <span className="text-gray-500 mr-2">
                  {selectedCurrency === "USD" ? "$" : "$"}
                </span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Información sobre monedas */}
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">
              💰 Información sobre Monedas
            </h3>
            <div className="text-sm text-blue-800 space-y-1">
              <p><strong>Pesos Argentinos (ARS):</strong> Ideal para clientes locales en Argentina</p>
              <p><strong>Dólares Estadounidenses (USD):</strong> Ideal para clientes internacionales o pagos en dólares</p>
              <p><strong>Nota:</strong> El cliente podrá pagar con tarjetas locales o internacionales según la moneda seleccionada</p>
            </div>
          </div>
        </div>

        {/* Flujo de pago */}
        <RestaurantPaymentFlow
          restaurantData={{
            ...restaurantData,
            moneda: selectedCurrency,
          }}
          amount={amount}
        />

        {/* Información adicional */}
        <div className="mt-8 bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-blue-900 mb-3">
            ¿Cómo funciona este sistema?
          </h3>
          <div className="space-y-2 text-sm text-blue-800">
            <p>
              <strong>1. Generar Link:</strong> Se crea un link de pago único
              para el restaurante usando MercadoPago en {selectedCurrency}.
            </p>
            <p>
              <strong>2. Enviar al Cliente:</strong> Puedes copiar el link,
              enviarlo por WhatsApp o email al cliente.
            </p>
            <p>
              <strong>3. Cliente Paga:</strong> El cliente completa el pago
              usando el link en {selectedCurrency} (tarjeta, transferencia, etc.).
            </p>
            <p>
              <strong>4. Monitoreo Automático:</strong> El sistema verifica el
              estado del pago cada 30 segundos.
            </p>
            <p>
              <strong>5. Activación Automática:</strong> Cuando el pago se
              completa, el restaurante se activa automáticamente.
            </p>
            <p>
              <strong>6. Imprimir Contrato:</strong> Se genera un contrato
              profesional con toda la información del pago en {selectedCurrency}.
            </p>
          </div>
        </div>

        {/* Características */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
            <div className="text-2xl mb-2">🔗</div>
            <h4 className="font-medium text-gray-900 mb-1">Links Únicos</h4>
            <p className="text-sm text-gray-600">
              Cada restaurante tiene su propio link de pago seguro
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
            <div className="text-2xl mb-2">💱</div>
            <h4 className="font-medium text-gray-900 mb-1">
              Múltiples Monedas
            </h4>
            <p className="text-sm text-gray-600">
              Soporte para ARS y USD según las necesidades del cliente
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
            <div className="text-2xl mb-2">⚡</div>
            <h4 className="font-medium text-gray-900 mb-1">
              Activación Automática
            </h4>
            <p className="text-sm text-gray-600">
              El restaurante se activa inmediatamente al completar el pago
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
            <div className="text-2xl mb-2">📄</div>
            <h4 className="font-medium text-gray-900 mb-1">
              Contrato Profesional
            </h4>
            <p className="text-sm text-gray-600">
              Contrato automático con toda la información del pago
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
            <div className="text-2xl mb-2">🌍</div>
            <h4 className="font-medium text-gray-900 mb-1">
              Pagos Internacionales
            </h4>
            <p className="text-sm text-gray-600">
              Acepta tarjetas internacionales y transferencias
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
            <div className="text-2xl mb-2">🔒</div>
            <h4 className="font-medium text-gray-900 mb-1">
              Seguro y Confiable
            </h4>
            <p className="text-sm text-gray-600">
              Procesado por MercadoPago con máxima seguridad
            </p>
          </div>
        </div>

        {/* Información sobre MercadoPago */}
        <div className="mt-6 bg-green-50 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-green-900 mb-3">
            🚀 Ventajas de MercadoPago
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-800">
            <div>
              <h4 className="font-medium mb-2">Para Clientes Locales (ARS):</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Tarjetas de crédito y débito argentinas</li>
                <li>Transferencias bancarias</li>
                <li>Pago en efectivo (Rapipago, PagoFácil)</li>
                <li>Billeteras digitales (MercadoPago, Ualá)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Para Clientes Internacionales (USD):</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Tarjetas internacionales (Visa, Mastercard, Amex)</li>
                <li>Transferencias internacionales</li>
                <li>Pagos con PayPal</li>
                <li>Conversión automática de monedas</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantPaymentPage;
