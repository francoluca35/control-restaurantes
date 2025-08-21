"use client";
import { useState } from "react";
import { useMercadoPago } from "../../hooks/useMercadoPago";

export default function TestPaymentPage() {
  const [loading, setLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState(null);
  const [error, setError] = useState(null);
  const { createPaymentPreference } = useMercadoPago();

  const handleTestPayment = async () => {
    setLoading(true);
    setError(null);
    setPaymentUrl(null);

    try {
      const preference = await createPaymentPreference({
        restaurantId: "TEST-PAYMENT-001",
        amount: 1,
        title: "Pago de Prueba - 1 Peso",
        currency: "ARS",
        externalReference: "TEST-PAYMENT-001",
      });

      console.log("✅ Preferencia creada:", preference);
      setPaymentUrl(preference.initPoint);
    } catch (err) {
      console.error("❌ Error creando preferencia:", err);
      setError(err.message || "Error al crear el pago de prueba");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🧪</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Pago de Prueba
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Prueba el sistema de pagos con 1 peso argentino
          </p>
        </div>

        <div className="space-y-6">
          {/* Información del pago de prueba */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Detalles del Pago de Prueba
            </h3>
            <div className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
              <p>
                <strong>Monto:</strong> $1.00 ARS
              </p>
              <p>
                <strong>Descripción:</strong> Pago de Prueba - 1 Peso
              </p>
              <p>
                <strong>Referencia:</strong> TEST-PAYMENT-001
              </p>
              <p>
                <strong>Moneda:</strong> Pesos Argentinos
              </p>
            </div>
          </div>

          {/* Botón para crear pago */}
          <button
            onClick={handleTestPayment}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Creando pago...
              </div>
            ) : (
              "💰 Crear Pago de Prueba ($1 ARS)"
            )}
          </button>

          {/* Error */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-800 dark:text-red-200 text-sm">
                ❌ {error}
              </p>
            </div>
          )}

          {/* URL de pago */}
          {paymentUrl && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                ✅ Pago creado exitosamente
              </h3>
              <p className="text-green-800 dark:text-green-200 text-sm mb-3">
                Haz clic en el botón para ir a MercadoPago y completar el pago
                de prueba.
              </p>
              <a
                href={paymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg text-center transition-colors"
              >
                🚀 Ir a MercadoPago
              </a>
            </div>
          )}

          {/* Información adicional */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              ℹ️ Información importante
            </h3>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <li>• Este es un pago de prueba de $1 peso argentino</li>
              <li>• Se usará para verificar el sistema de notificaciones</li>
              <li>• El restaurante de prueba se activará automáticamente</li>
              <li>• Recibirás notificaciones en tiempo real</li>
            </ul>
          </div>

          {/* Enlaces útiles */}
          <div className="flex space-x-2">
            <a
              href="/home-master/dashboard"
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg text-center transition-colors"
            >
              📊 Dashboard
            </a>
            <a
              href="/debug"
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg text-center transition-colors"
            >
              🔧 Debug
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
