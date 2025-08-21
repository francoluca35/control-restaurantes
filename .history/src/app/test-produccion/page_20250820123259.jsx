"use client";

import React, { useState } from "react";
import PaymentModal from "../../components/PaymentModal";

const TestProduccionPage = () => {
  const [showModal, setShowModal] = useState(false);

  // Datos de prueba para producción
  const testRestaurantData = {
    id: "prod-restaurant-123",
    nombre: "Restaurante de Producción",
    propietario: "María González",
    direccion: "Av. Producción 456, Buenos Aires",
    telefono: "+54 11 9876-5432",
    email: "maria@restauranteproduccion.com",
    moneda: "ARS",
  };

  const testAmount = 2500;

  const handlePaymentSuccess = (paymentLink) => {
    console.log("✅ Pago configurado exitosamente:", paymentLink);
    alert("¡Link de pago generado exitosamente en PRODUCCIÓN!");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🚀 Test de Producción - MercadoPago
          </h1>
          <p className="text-gray-600">
            Página de prueba con credenciales reales de MercadoPago
          </p>
          <div className="mt-4 p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>✅ Modo:</strong> Producción con credenciales reales
            </p>
          </div>
        </div>

        {/* Información de prueba */}
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Datos de Prueba - Producción
          </h2>

          <div className="space-y-2 text-sm">
            <p>
              <strong>Restaurante:</strong> {testRestaurantData.nombre}
            </p>
            <p>
              <strong>ID:</strong> {testRestaurantData.id}
            </p>
            <p>
              <strong>Monto:</strong> ${testAmount} {testRestaurantData.moneda}
            </p>
            <p>
              <strong>Email:</strong> {testRestaurantData.email}
            </p>
            <p>
              <strong>Propietario:</strong> {testRestaurantData.propietario}
            </p>
          </div>
        </div>

        {/* Botón para abrir el modal */}
        <div className="text-center">
          <button
            onClick={() => setShowModal(true)}
            className="px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
          >
            🚀 Generar Link de Pago Real
          </button>
        </div>

        {/* Instrucciones */}
        <div className="mt-8 bg-green-50 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-green-900 mb-3">
            📋 Instrucciones de Producción
          </h3>
          <div className="space-y-2 text-sm text-green-800">
            <p>1. Haz clic en "Generar Link de Pago Real"</p>
            <p>
              2. El modal se abrirá y creará una preferencia REAL en MercadoPago
            </p>
            <p>3. Se generará un link de pago funcional</p>
            <p>4. Puedes copiar el link y enviarlo al cliente</p>
            <p>5. El cliente podrá pagar con métodos reales</p>
            <p>
              6. ⚠️ <strong>Este link generará pagos reales</strong>
            </p>
          </div>
        </div>

        {/* Información de seguridad */}
        <div className="mt-6 bg-yellow-50 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-yellow-900 mb-3">
            ⚠️ Información de Seguridad
          </h3>
          <div className="space-y-2 text-sm text-yellow-800">
            <p>• Este es un entorno de PRODUCCIÓN real</p>
            <p>• Los pagos serán procesados por MercadoPago</p>
            <p>• Los fondos se transferirán a tu cuenta de MercadoPago</p>
            <p>• Usa solo para pruebas con clientes reales</p>
            <p>
              • Los webhooks actualizarán automáticamente el estado del
              restaurante
            </p>
          </div>
        </div>

        {/* Modal de Pago */}
        {showModal && (
          <PaymentModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            restaurantData={testRestaurantData}
            amount={testAmount}
            onPaymentSuccess={handlePaymentSuccess}
          />
        )}
      </div>
    </div>
  );
};

export default TestProduccionPage;
