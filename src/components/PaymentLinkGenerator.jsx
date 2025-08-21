import React, { useState } from "react";
import { useMercadoPago } from "../hooks/useMercadoPago";

const PaymentLinkGenerator = ({ restaurantData, amount, onPaymentCreated }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [paymentLink, setPaymentLink] = useState(null);
  const [error, setError] = useState(null);
  const [selectedCurrency, setSelectedCurrency] = useState(restaurantData?.moneda || "ARS");
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
        title: `Activación de Restaurante - ${
          restaurantData.nombre || restaurantData.name
        }`,
        externalReference: restaurantData.id,
        currency: selectedCurrency, // Usar la moneda seleccionada
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
          amount: amount,
          currency: selectedCurrency,
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
      const currencySymbol = selectedCurrency === "USD" ? "$" : "$";
      const message = `Hola! Aquí tienes el link para activar tu restaurante por ${currencySymbol}${amount} ${selectedCurrency}: ${paymentLink}`;
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, "_blank");
    }
  };

  const sendEmail = () => {
    if (paymentLink) {
      const currencySymbol = selectedCurrency === "USD" ? "$" : "$";
      const subject = "Link de Pago - Activación de Restaurante";
      const body = `Hola,\n\nAquí tienes el link para activar tu restaurante por ${currencySymbol}${amount} ${selectedCurrency}:\n\n${paymentLink}\n\nSaludos.`;
      const mailtoUrl = `mailto:?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(body)}`;
      window.open(mailtoUrl);
    }
  };

  return (
    <div className="space-y-4">
      {/* Selector de moneda */}
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Moneda de Pago
          </label>
          <select
            value={selectedCurrency}
            onChange={(e) => setSelectedCurrency(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="ARS">Pesos Argentinos (ARS)</option>
            <option value="USD">Dólares Estadounidenses (USD)</option>
          </select>
        </div>
        
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Monto ({selectedCurrency})
          </label>
          <div className="flex items-center">
            <span className="text-gray-500 mr-2">
              {selectedCurrency === "USD" ? "$" : "$"}
            </span>
            <input
              type="number"
              value={amount}
              readOnly
              className="flex-1 p-2 border border-gray-300 rounded bg-gray-50"
            />
          </div>
        </div>
      </div>

      {/* Botón para generar el link */}
      <div className="flex gap-2">
        <button
          onClick={generatePaymentLink}
          disabled={isGenerating}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isGenerating ? "Generando..." : `Generar Link de Pago (${selectedCurrency})`}
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
            {/* Información del pago */}
            <div className="bg-white p-3 rounded border">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Monto:</span>
                <span className="font-medium">
                  {selectedCurrency === "USD" ? "$" : "$"}{amount} {selectedCurrency}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Moneda:</span>
                <span className="font-medium">{selectedCurrency}</span>
              </div>
            </div>

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
              <p>
                <strong>Instrucciones:</strong>
              </p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Envía este link al cliente</li>
                <li>El cliente debe completar el pago en {selectedCurrency}</li>
                <li>
                  Una vez pagado, el restaurante se activará automáticamente
                </li>
                <li>Recibirás una notificación cuando el pago se complete</li>
                <li>El pago se procesará en {selectedCurrency === "USD" ? "dólares" : "pesos argentinos"}</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentLinkGenerator;
