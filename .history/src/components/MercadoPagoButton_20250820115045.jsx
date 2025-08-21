import React, { useState, useEffect } from 'react';
import { useMercadoPago } from '../hooks/useMercadoPago';

const MercadoPagoButton = ({ 
  restaurantData, 
  amount, 
  title = "Activación de Restaurante",
  className = "",
  disabled = false 
}) => {
  const [preferenceId, setPreferenceId] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const { createPaymentPreference, initializeCheckout, isLoading, error } = useMercadoPago();

  // Crear preferencia de pago cuando se monta el componente
  useEffect(() => {
    const createPreference = async () => {
      if (!restaurantData?.id || !amount) return;

      try {
        const paymentData = {
          restaurantId: restaurantData.id,
          amount: parseFloat(amount),
          title: `${title} - ${restaurantData.nombre || restaurantData.name}`,
          externalReference: restaurantData.id,
          currency: restaurantData.moneda || "ARS",
        };

        const preference = await createPaymentPreference(paymentData);
        setPreferenceId(preference.id);
      } catch (err) {
        console.error('Error creando preferencia:', err);
      }
    };

    createPreference();
  }, [restaurantData, amount, title, createPaymentPreference]);

  // Inicializar el checkout cuando tengamos el preferenceId
  useEffect(() => {
    if (preferenceId && !isInitialized) {
      const initCheckout = async () => {
        try {
          await initializeCheckout(preferenceId, 'mercadopago-checkout');
          setIsInitialized(true);
        } catch (err) {
          console.error('Error inicializando checkout:', err);
        }
      };

      initCheckout();
    }
  }, [preferenceId, isInitialized, initializeCheckout]);

  if (error) {
    return (
      <div className="text-red-600 text-sm p-2 bg-red-50 rounded">
        Error: {error}
      </div>
    );
  }

  if (isLoading || !preferenceId) {
    return (
      <button 
        disabled 
        className={`px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed ${className}`}
      >
        Cargando...
      </button>
    );
  }

  return (
    <div className="w-full">
      <div 
        id="mercadopago-checkout" 
        className="w-full"
      />
      {!isInitialized && (
        <div className="text-center text-sm text-gray-600 mt-2">
          Inicializando MercadoPago...
        </div>
      )}
    </div>
  );
};

export default MercadoPagoButton;
