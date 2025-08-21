"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useMercadoPago } from "../../../hooks/useMercadoPago.js";
import { Suspense } from "react";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { checkPaymentStatus } = useMercadoPago();
  const [loading, setLoading] = useState(true);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const paymentId = searchParams.get("payment_id");
        const restaurantId = searchParams.get("restaurantId");

        if (!paymentId) {
          setError("No se encontró información del pago");
          setLoading(false);
          return;
        }

        const status = await checkPaymentStatus(paymentId, restaurantId);
        setPaymentInfo(status);
      } catch (error) {
        console.error("Error verificando pago:", error);
        setError("Error al verificar el pago");
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams, checkPaymentStatus]);

  const handleContinue = () => {
    router.push("/home-master");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Verificando pago...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-red-400 mb-2">
            Error en el Pago
          </h1>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={handleContinue}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="text-green-500 text-6xl mb-4">✅</div>
        <h1 className="text-2xl font-bold text-green-400 mb-2">
          ¡Pago Exitoso!
        </h1>
        <p className="text-gray-300 mb-6">
          Tu restaurante ha sido activado correctamente.
        </p>

        {paymentInfo && (
          <div className="bg-gray-800 rounded-lg p-4 mb-6 text-left">
            <h3 className="text-lg font-semibold text-white mb-3">
              Detalles del Pago
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">ID del Pago:</span>
                <span className="text-white">{paymentInfo.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Estado:</span>
                <span className="text-green-400 capitalize">
                  {paymentInfo.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Monto:</span>
                <span className="text-white">
                  ${paymentInfo.transaction_amount}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Método:</span>
                <span className="text-white capitalize">
                  {paymentInfo.payment_method?.type || "N/A"}
                </span>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleContinue}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold"
        >
          Continuar al Dashboard
        </button>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-300">Cargando...</p>
          </div>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
