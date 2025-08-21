"use client";

import React, { useState } from "react";
import PaymentModal from "../../components/PaymentModal";

const TestProduccionRealPage = () => {
  const [showModal, setShowModal] = useState(false);

  // Datos de prueba reales
  const testRestaurantData = {
    id: "restaurante-real-123",
    nombre: "Restaurante Real",
    propietario: "Carlos López",
    direccion: "Av. Real 789, Buenos Aires",
    telefono: "+54 11 5555-1234",
    email: "carlos@restaurantereal.com",
    moneda: "ARS",
  };

  const testAmount = 3000;

  const handlePaymentSuccess = (paymentLink) => {
    console.log("✅ Pago configurado exitosamente:", paymentLink);
    alert("¡Link de pago generado exitosamente!");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🚀 Sistema de Pagos - Producción
          </h1>
          <p className="text-gray-600">
            Sistema completamente funcional con MercadoPago
          </p>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>✅ Estado:</strong> Producción con credenciales reales
            </p>
          </div>
        </div>

        {/* Información */}
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Datos de Prueba
          </h2>
          
          <div className="space-y-2 text-sm">
            <p><strong>Restaurante:</strong> {testRestaurantData.nombre}</p>
            <p><strong>ID:</strong> {testRestaurantData.id}</p>
            <p><strong>Monto:</strong> ${testAmount} {testRestaurantData.moneda}</p>
            <p><strong>Email:</strong> {testRestaurantData.email}</p>
          </div>
        </div>

        {/* Botón para abrir el modal */}
        <div className="text-center">
          <button
            onClick={() => setShowModal(true)}
            className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
          >
            🚀 Generar Link de Pago
          </button>
        </div>

        {/* Información del sistema */}
        <div className="mt-8 bg-green-50 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-green-900 mb-3">
            ✅ Sistema Completamente Funcional
          </h3>
          <div className="space-y-2 text-sm text-green-800">
            <p>• Credenciales de MercadoPago configuradas</p>
            <p>• Webhooks configurados para actualización automática</p>
            <p>• Activación automática del restaurante al pagar</p>
            <p>• Soporte para múltiples monedas (ARS/USD)</p>
            <p>• Generación automática de contratos</p>
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

export default TestProduccionRealPage;
