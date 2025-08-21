"use client";

import React, { useState } from "react";
import PaymentModal from "../../components/PaymentModal";

const DemoPaymentPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [restaurantData, setRestaurantData] = useState({
    id: "demo-restaurant-123",
    nombre: "Restaurante Demo",
    propietario: "Juan Pérez",
    direccion: "Av. Corrientes 1234, Buenos Aires",
    telefono: "+54 11 1234-5678",
    email: "juan@restaurantedemo.com",
    moneda: "ARS",
  });

  const [amount, setAmount] = useState(1000);

  const handlePaymentSuccess = (paymentLink) => {
    console.log("✅ Pago configurado exitosamente:", paymentLink);
    alert(
      "¡Link de pago generado exitosamente! Revisa la consola para ver el link."
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🎯 Demo: Modal de Pago MercadoPago
          </h1>
          <p className="text-gray-600">
            Demostración del modal que se abre al registrar un restaurante con
            MercadoPago
          </p>
        </div>

        {/* Información del restaurante */}
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Datos del Restaurante Demo
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
                Moneda
              </label>
              <select
                value={restaurantData.moneda}
                onChange={(e) =>
                  setRestaurantData({
                    ...restaurantData,
                    moneda: e.target.value,
                  })
                }
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ARS">Pesos Argentinos (ARS)</option>
                <option value="USD">Dólares Estadounidenses (USD)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monto ({restaurantData.moneda})
              </label>
              <div className="flex items-center">
                <span className="text-gray-500 mr-2">
                  {restaurantData.moneda === "USD" ? "$" : "$"}
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
        </div>

        {/* Botón para abrir el modal */}
        <div className="text-center">
          <button
            onClick={() => setShowModal(true)}
            className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
          >
            🚀 Simular Registro con MercadoPago
          </button>
        </div>

        {/* Información sobre el flujo */}
        <div className="mt-8 bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-blue-900 mb-3">
            🔄 Flujo del Modal de Pago
          </h3>
          <div className="space-y-2 text-sm text-blue-800">
            <p>
              <strong>
                1. Al hacer clic en "Registrar y Generar Link de Pago":
              </strong>
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Se registra el restaurante en la base de datos</li>
              <li>Se abre automáticamente el modal de pago</li>
              <li>Se muestra un spinner de "Procesando Pago"</li>
            </ul>

            <p>
              <strong>2. Durante el procesamiento:</strong>
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Se crea la preferencia de pago en MercadoPago</li>
              <li>Se genera el link único de pago</li>
              <li>Se muestra la información del restaurante</li>
            </ul>

            <p>
              <strong>3. Una vez generado el link:</strong>
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Se muestra el link de pago</li>
              <li>Botón para copiar el link al portapapeles</li>
              <li>Botones para enviar por WhatsApp o Email</li>
              <li>Instrucciones para el cliente</li>
            </ul>

            <p>
              <strong>4. El cliente puede pagar usando:</strong>
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Tarjetas de crédito/débito</li>
              <li>Transferencias bancarias</li>
              <li>Billeteras digitales</li>
              <li>Pago en efectivo (Rapipago, PagoFácil)</li>
            </ul>
          </div>
        </div>

        {/* Características del sistema */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
            <div className="text-2xl mb-2">⚡</div>
            <h4 className="font-medium text-gray-900 mb-1">Automático</h4>
            <p className="text-sm text-gray-600">
              El modal se abre automáticamente al registrar con MercadoPago
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
            <div className="text-2xl mb-2">🔗</div>
            <h4 className="font-medium text-gray-900 mb-1">Link Único</h4>
            <p className="text-sm text-gray-600">
              Cada restaurante tiene su propio link de pago seguro
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
            <div className="text-2xl mb-2">📱</div>
            <h4 className="font-medium text-gray-900 mb-1">Fácil Envío</h4>
            <p className="text-sm text-gray-600">
              Copiar, WhatsApp o Email con un solo clic
            </p>
          </div>
        </div>

        {/* Modal de Pago */}
        {showModal && (
          <PaymentModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            restaurantData={restaurantData}
            amount={amount}
            onPaymentSuccess={handlePaymentSuccess}
          />
        )}
      </div>
    </div>
  );
};

export default DemoPaymentPage;
