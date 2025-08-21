"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";

function PaymentPendingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const handleContinue = () => {
    router.push("/home-master");
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="text-yellow-500 text-6xl mb-4">⏳</div>
        <h1 className="text-2xl font-bold text-yellow-400 mb-2">
          Pago en Proceso
        </h1>
        <p className="text-gray-300 mb-6">
          Tu pago está siendo procesado. Esto puede tomar unos minutos.
        </p>

        <div className="bg-gray-800 rounded-lg p-4 mb-6 text-left">
          <h3 className="text-lg font-semibold text-white mb-3">
            ¿Qué está pasando?
          </h3>
          <div className="text-sm text-gray-300 space-y-2">
            <p>
              • Tu pago está siendo revisado por el sistema de Mercado Pago
            </p>
            <p>
              • Recibirás una notificación por email cuando se complete
            </p>
            <p>
              • El restaurante se activará automáticamente una vez confirmado
            </p>
          </div>
        </div>

        <div className="bg-blue-900/20 border border-blue-500/20 rounded-lg p-4 mb-6">
          <h4 className="text-blue-400 font-semibold mb-2">Próximos pasos:</h4>
          <ol className="text-sm text-gray-300 space-y-1">
            <li>1. Espera la confirmación del pago</li>
            <li>2. Recibirás un email de confirmación</li>
            <li>3. El restaurante se activará automáticamente</li>
            <li>4. Podrás acceder al sistema normalmente</li>
          </ol>
        </div>

        <button
          onClick={handleContinue}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
        >
          Volver al Dashboard
        </button>
      </div>
    </div>
  );
}

export default function PaymentPendingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Cargando...</p>
        </div>
      </div>
    }>
      <PaymentPendingContent />
    </Suspense>
  );
}
