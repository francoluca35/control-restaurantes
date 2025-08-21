import React, { useState, useEffect } from "react";
import { useMercadoPago } from "../hooks/useMercadoPago";

const PaymentMonitor = ({
  preferenceId,
  restaurantId,
  onPaymentComplete,
  onPrintContract,
}) => {
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState(null);
  const [lastCheck, setLastCheck] = useState(null);
  const { checkPaymentStatus } = useMercadoPago();

  // Verificar estado del pago
  const checkPayment = async () => {
    if (!preferenceId || !restaurantId) return;

    setIsChecking(true);
    setError(null);

    try {
      const status = await checkPaymentStatus(preferenceId, restaurantId);
      setPaymentStatus(status);
      setLastCheck(new Date().toISOString());

      // Si el pago fue aprobado, notificar al componente padre
      if (status.status === "approved") {
        if (onPaymentComplete) {
          onPaymentComplete(status);
        }
      }

      console.log("✅ Estado del pago verificado:", status);
    } catch (err) {
      console.error("Error verificando pago:", err);
      setError(err.message || "Error al verificar el estado del pago");
    } finally {
      setIsChecking(false);
    }
  };

  // Verificar automáticamente cada 30 segundos
  useEffect(() => {
    if (!preferenceId || !restaurantId) return;

    // Verificar inmediatamente
    checkPayment();

    // Configurar verificación automática
    const interval = setInterval(() => {
      checkPayment();
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [preferenceId, restaurantId]);

  // Función para imprimir contrato
  const handlePrintContract = () => {
    if (onPrintContract) {
      onPrintContract({
        restaurantId,
        paymentStatus,
        preferenceId,
      });
    }
  };

  // Función para verificar manualmente
  const handleManualCheck = () => {
    checkPayment();
  };

  if (!preferenceId || !restaurantId) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-700 text-sm">Esperando datos del pago...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Estado actual */}
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-2">Estado del Pago</h3>

        <div className="space-y-2">
          {/* Estado del pago */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Estado:</span>
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${
                paymentStatus?.status === "approved"
                  ? "bg-green-100 text-green-800"
                  : paymentStatus?.status === "pending"
                  ? "bg-yellow-100 text-yellow-800"
                  : paymentStatus?.status === "rejected"
                  ? "bg-red-100 text-red-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {paymentStatus?.status || "Verificando..."}
            </span>
          </div>

          {/* Detalle del estado */}
          {paymentStatus?.status_detail && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Detalle:</span>
              <span className="text-sm text-gray-800">
                {paymentStatus.status_detail}
              </span>
            </div>
          )}

          {/* Monto */}
          {paymentStatus?.transaction_amount && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Monto:</span>
              <span className="text-sm font-medium text-gray-800">
                ${paymentStatus.transaction_amount}
              </span>
            </div>
          )}

          {/* Método de pago */}
          {paymentStatus?.payment_method?.type && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Método:</span>
              <span className="text-sm text-gray-800">
                {paymentStatus.payment_method.type}
              </span>
            </div>
          )}

          {/* Última verificación */}
          {lastCheck && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                Última verificación:
              </span>
              <span className="text-xs text-gray-500">
                {new Date(lastCheck).toLocaleTimeString()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Acciones */}
      <div className="flex gap-2">
        <button
          onClick={handleManualCheck}
          disabled={isChecking}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
        >
          {isChecking ? "Verificando..." : "Verificar Ahora"}
        </button>

        {paymentStatus?.status === "approved" && (
          <button
            onClick={handlePrintContract}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
          >
            🖨️ Imprimir Contrato
          </button>
        )}
      </div>

      {/* Mensajes de estado */}
      {paymentStatus?.status === "approved" && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="font-medium text-green-800 mb-1">✅ Pago Aprobado</h4>
          <p className="text-green-700 text-sm">
            El pago se ha completado exitosamente. El restaurante está activo y
            listo para funcionar.
          </p>
        </div>
      )}

      {paymentStatus?.status === "pending" && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-medium text-yellow-800 mb-1">
            ⏳ Pago Pendiente
          </h4>
          <p className="text-yellow-700 text-sm">
            El pago está siendo procesado. Espera la confirmación o verifica
            manualmente.
          </p>
        </div>
      )}

      {paymentStatus?.status === "rejected" && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h4 className="font-medium text-red-800 mb-1">❌ Pago Rechazado</h4>
          <p className="text-red-700 text-sm">
            El pago fue rechazado. Contacta al cliente para generar un nuevo
            link de pago.
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Información adicional */}
      <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded">
        <p>
          <strong>Información:</strong>
        </p>
        <ul className="list-disc list-inside mt-1 space-y-1">
          <li>El estado se verifica automáticamente cada 30 segundos</li>
          <li>Puedes verificar manualmente en cualquier momento</li>
          <li>Una vez aprobado, podrás imprimir el contrato</li>
          <li>
            El restaurante se activará automáticamente al completar el pago
          </li>
        </ul>
      </div>
    </div>
  );
};

export default PaymentMonitor;
