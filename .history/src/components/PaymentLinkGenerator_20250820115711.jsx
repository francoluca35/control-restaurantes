import React, { useState } from "react";
import { useMercadoPago } from "../hooks/useMercadoPago";

const PaymentLinkGenerator = ({ restaurantData, amount, onPaymentCreated }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [paymentLink, setPaymentLink] = useState(null);
  const [error, setError] = useState(null);
  const { createPaymentPreference } = useMercadoPago();

  const generatePaymentLink = async () => {
    if (!restaurantData?.id || !amount) {
      setError("Datos del restaurante y monto son requeridos");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const paymentData = {
        restaurantId: restaurantData.id,
        amount: parseFloat(amount),
        title: `Activación de Restaurante - ${restaurantData.nombre || restaurantData.name}`,
        externalReference: restaurantData.id,
        currency: restaurantData.moneda || "ARS",
      };

      const preference = await createPaymentPreference(paymentData);
      
      // Generar el link de pago (usar init_point para producción)
      const paymentUrl = preference.initPoint || preference.sandboxInitPoint;
      
      setPaymentLink(paymentUrl);
      
      // Notificar al componente padre que se creó el pago
      if (onPaymentCreated) {
        onPaymentCreated({
          preferenceId: preference.id,
          paymentUrl: paymentUrl,
          restaurantId: restaurantData.id,
          amount: amount
        });
      }

      console.log("✅ Link de pago generado:", paymentUrl);
    } catch (err) {
      console.error("Error generando link de pago:", err);
      setError(err.message || "Error al generar el link de pago");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    if (paymentLink) {
      try {
        await navigator.clipboard.writeText(paymentLink);
        alert("Link copiado al portapapeles");
      } catch (err) {
        console.error("Error copiando al portapapeles:", err);
      }
    }
  };

  const sendWhatsApp = () => {
    if (paymentLink) {
      const message = `Hola! Aquí tienes el link para activar tu restaurante: ${paymentLink}`;
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  const sendEmail = () => {
    if (paymentLink) {
      const subject = "Link de Pago - Activación de Restaurante";
      const body = `Hola,\n\nAquí tienes el link para activar tu restaurante:\n\n${paymentLink}\n\nSaludos.`;
      const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.open(mailtoUrl);
    }
  };

  return (
    <div className="space-y-4">
      {/* Botón para generar el link */}
      <div className="flex gap-2">
        <button
          onClick={generatePaymentLink}
          disabled={isGenerating}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isGenerating ? "Generando..." : "Generar Link de Pago"}
        </button>
      </div>

      {/* Mostrar error si existe */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Mostrar el link generado */}
      {paymentLink && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-medium text-green-800 mb-2">
            ✅ Link de Pago Generado
          </h3>
          
          <div className="space-y-3">
            {/* Link */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Link de Pago:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={paymentLink}
                  readOnly
                  className="flex-1 p-2 border border-gray-300 rounded text-sm bg-gray-50"
                />
                <button
                  onClick={copyToClipboard}
                  className="px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
                >
                  Copiar
                </button>
              </div>
            </div>

            {/* Botones de envío */}
            <div className="flex gap-2">
              <button
                onClick={sendWhatsApp}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
              >
                📱 Enviar por WhatsApp
              </button>
              <button
                onClick={sendEmail}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              >
                📧 Enviar por Email
              </button>
            </div>

            {/* Información adicional */}
            <div className="text-xs text-gray-600 bg-white p-2 rounded">
              <p><strong>Instrucciones:</strong></p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Envía este link al cliente</li>
                <li>El cliente debe completar el pago</li>
                <li>Una vez pagado, el restaurante se activará automáticamente</li>
                <li>Recibirás una notificación cuando el pago se complete</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentLinkGenerator;
