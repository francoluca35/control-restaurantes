"use client";

import React, { useState } from "react";
import PaymentModal from "../../components/PaymentModal";

const TestModalPage = () => {
  const [showModal, setShowModal] = useState(false);

  // Datos de prueba simples
  const testRestaurantData = {
    id: "test-restaurant-123",
    nombre: "Restaurante de Prueba",
    propietario: "Juan Pérez",
    direccion: "Av. Test 123",
    telefono: "+54 11 1234-5678",
    email: "test@restaurante.com",
    moneda: "ARS",
  };

  const testAmount = 1000;

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
            🧪 Test del Modal de Pago
          </h1>
          <p className="text-gray-600">
            Página de prueba para verificar que el modal funcione correctamente
          </p>
        </div>

        {/* Información de prueba */}
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
            🚀 Abrir Modal de Pago
          </button>
        </div>

        {/* Instrucciones */}
        <div className="mt-8 bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-blue-900 mb-3">
            📋 Instrucciones de Prueba
          </h3>
          <div className="space-y-2 text-sm text-blue-800">
            <p>1. Haz clic en "Abrir Modal de Pago"</p>
            <p>2. El modal debería abrirse y mostrar "Procesando Pago"</p>
            <p>3. Si hay un error, revisa la consola del navegador</p>
            <p>4. Verifica que los datos se muestren correctamente</p>
            <p>5. Si todo funciona, deberías ver el link de pago generado</p>
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

export default TestModalPage;
