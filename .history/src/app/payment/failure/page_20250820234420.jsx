"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";

function PaymentFailureContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const handleRetry = () => {
    router.push("/home-master");
  };

  const handleContact = () => {
    // Aquí podrías redirigir a una página de contacto o abrir un modal
    alert("Por favor contacta al soporte técnico para ayuda con el pago.");
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="text-red-500 text-6xl mb-4">❌</div>
        <h1 className="text-2xl font-bold text-red-400 mb-2">
          Pago Fallido
        </h1>
        <p className="text-gray-300 mb-6">
          Lo sentimos, el pago no pudo ser procesado. Esto puede deberse a:
        </p>

        <div className="bg-gray-800 rounded-lg p-4 mb-6 text-left">
          <ul className="text-sm text-gray-300 space-y-2">
            <li>• Fondos insuficientes en la cuenta</li>
            <li>• Tarjeta bloqueada o vencida</li>
            <li>• Error en los datos de la tarjeta</li>
            <li>• Problemas temporales del sistema</li>
          </ul>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleRetry}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Intentar Nuevamente
          </button>
          
          <button
            onClick={handleContact}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Contactar Soporte
          </button>
        </div>
      </div>
    </div>
  );
}
