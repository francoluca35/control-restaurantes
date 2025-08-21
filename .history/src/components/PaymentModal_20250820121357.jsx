import React, { useState, useEffect } from "react";
import { useMercadoPago } from "../hooks/useMercadoPago";

const PaymentModal = ({
  isOpen,
  onClose,
  restaurantData,
  amount,
  onPaymentSuccess,
}) => {
  const [step, setStep] = useState("processing"); // processing, success, error
  const [paymentLink, setPaymentLink] = useState(null);
  const [error, setError] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { createPaymentPreference } = useMercadoPago();

  // Generar el link de pago cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      console.log("🚀 Modal abierto con datos:", { restaurantData, amount });
      if (restaurantData && amount) {
        generatePaymentLink();
      } else {
        console.warn("⚠️ Datos faltantes:", { restaurantData, amount });
        setError("Faltan datos del restaurante o monto");
        setStep("error");
      }
    }
  }, [isOpen, restaurantData, amount]);

  const generatePaymentLink = async () => {
    console.log("🔍 Validando datos:", { restaurantData, amount });

    // Validación más detallada
    if (!restaurantData) {
      setError("No se recibieron datos del restaurante");
      setStep("error");
      return;
    }

    if (!restaurantData.id && !restaurantData.nombre) {
      setError("El restaurante debe tener un ID o nombre válido");
      setStep("error");
      return;
    }

    if (!amount || amount <= 0) {
      setError("El monto debe ser mayor a 0");
      setStep("error");
      return;
    }

    setIsGenerating(true);
    setStep("processing");

    try {
      // Usar ID del restaurante o generar uno basado en el nombre
      const restaurantId =
        restaurantData.id ||
        restaurantData.nombre?.replace(/\s+/g, "_").toLowerCase();

      const paymentData = {
        restaurantId: restaurantId,
        amount: parseFloat(amount),
        title: `Activación de Restaurante - ${
          restaurantData.nombre || restaurantData.name || "Restaurante"
        }`,
        externalReference: restaurantId,
        currency: restaurantData.moneda || "ARS",
      };

      console.log("📤 Enviando datos de pago:", paymentData);

      const preference = await createPaymentPreference(paymentData);
      const paymentUrl = preference.initPoint || preference.sandboxInitPoint;

      setPaymentLink(paymentUrl);
      setStep("success");

      console.log("✅ Link de pago generado:", paymentUrl);
    } catch (err) {
      console.error("Error generando link de pago:", err);
      setError(err.message || "Error al generar el link de pago");
      setStep("error");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    if (paymentLink) {
      try {
        await navigator.clipboard.writeText(paymentLink);
        alert("✅ Link copiado al portapapeles");
      } catch (err) {
        console.error("Error copiando al portapapeles:", err);
        alert("❌ Error al copiar el link");
      }
    }
  };

  const sendWhatsApp = () => {
    if (paymentLink) {
      const message = `Hola! Aquí tienes el link para activar tu restaurante por $${amount} ${
        restaurantData.moneda || "ARS"
      }: ${paymentLink}`;
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, "_blank");
    }
  };

  const sendEmail = () => {
    if (paymentLink) {
      const subject = "Link de Pago - Activación de Restaurante";
      const body = `Hola,\n\nAquí tienes el link para activar tu restaurante por $${amount} ${
        restaurantData.moneda || "ARS"
      }:\n\n${paymentLink}\n\nSaludos.`;
      const mailtoUrl = `mailto:?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(body)}`;
      window.open(mailtoUrl);
    }
  };

  const handleClose = () => {
    if (step === "success" && onPaymentSuccess) {
      onPaymentSuccess(paymentLink);
    }
    onClose();
    // Resetear el estado
    setTimeout(() => {
      setStep("processing");
      setPaymentLink(null);
      setError(null);
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {step === "processing" && "🔄 Procesando Pago"}
            {step === "success" && "✅ Link de Pago Generado"}
            {step === "error" && "❌ Error en el Pago"}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === "processing" && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Generando Link de Pago
              </h3>
              <p className="text-gray-600">
                Estamos creando tu link de pago único para{" "}
                <strong>
                  {restaurantData?.nombre || restaurantData?.name}
                </strong>
              </p>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Monto:</strong> ${amount}{" "}
                  {restaurantData?.moneda || "ARS"}
                </p>
              </div>
            </div>
          )}

          {step === "success" && paymentLink && (
            <div className="space-y-4">
              {/* Información del restaurante */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-medium text-green-900 mb-2">
                  ✅ Pago Configurado Correctamente
                </h3>
                <div className="text-sm text-green-800 space-y-1">
                  <p>
                    <strong>Restaurante:</strong>{" "}
                    {restaurantData?.nombre || restaurantData?.name}
                  </p>
                  <p>
                    <strong>Monto:</strong> ${amount}{" "}
                    {restaurantData?.moneda || "ARS"}
                  </p>
                  <p>
                    <strong>Estado:</strong> Listo para enviar al cliente
                  </p>
                </div>
              </div>

              {/* Link de pago */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                  >
                    📋 Copiar
                  </button>
                </div>
              </div>

              {/* Botones de envío */}
              <div className="space-y-2">
                <button
                  onClick={sendWhatsApp}
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                >
                  📱 Enviar por WhatsApp
                </button>
                <button
                  onClick={sendEmail}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  📧 Enviar por Email
                </button>
              </div>

              {/* Instrucciones */}
              <div className="bg-blue-50 p-3 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">
                  📋 Instrucciones:
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Copia el link o envíalo directamente al cliente</li>
                  <li>• El cliente debe completar el pago usando el link</li>
                  <li>
                    • Una vez pagado, el restaurante se activará automáticamente
                  </li>
                  <li>
                    • Recibirás una notificación cuando el pago se complete
                  </li>
                </ul>
              </div>
            </div>
          )}

          {step === "error" && (
            <div className="text-center">
              <div className="text-red-500 text-4xl mb-4">❌</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Error al Generar el Link
              </h3>
              <p className="text-gray-600 mb-4">
                {error ||
                  "Ocurrió un error inesperado al generar el link de pago."}
              </p>

              {/* Información de debug */}
              <div className="bg-gray-50 p-3 rounded-lg mb-4 text-left">
                <h4 className="font-medium text-gray-900 mb-2">
                  📋 Información de Debug:
                </h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    <strong>Restaurante:</strong>{" "}
                    {restaurantData?.nombre ||
                      restaurantData?.name ||
                      "No disponible"}
                  </p>
                  <p>
                    <strong>ID:</strong> {restaurantData?.id || "No disponible"}
                  </p>
                  <p>
                    <strong>Monto:</strong> ${amount || "No disponible"}
                  </p>
                  <p>
                    <strong>Moneda:</strong> {restaurantData?.moneda || "ARS"}
                  </p>
                </div>
              </div>

              <button
                onClick={generatePaymentLink}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                🔄 Reintentar
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-6 border-t">
          {step === "success" && (
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Cerrar
            </button>
          )}
          {step === "error" && (
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Cancelar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
