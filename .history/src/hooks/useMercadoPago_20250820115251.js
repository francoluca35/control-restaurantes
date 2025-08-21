import { useState, useEffect } from "react";

export const useMercadoPago = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar el SDK de MercadoPago
  useEffect(() => {
    const loadMercadoPagoSDK = () => {
      if (typeof window !== "undefined" && !window.Mercadopago) {
        const script = document.createElement("script");
        script.src = "https://sdk.mercadopago.com/js/v2";
        script.onload = () => {
          console.log("✅ SDK de MercadoPago cargado");
        };
        script.onerror = () => {
          console.error("❌ Error cargando SDK de MercadoPago");
        };
        document.head.appendChild(script);
      }
    };

    loadMercadoPagoSDK();
  }, []);

  // Crear preferencia de pago
  const createPaymentPreference = async (paymentData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/payments/mercadopago", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al crear la preferencia de pago");
      }

      return data.preference;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Verificar estado de un pago
  const checkPaymentStatus = async (paymentId, restaurantId) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/payments/mercadopago?paymentId=${paymentId}&restaurantId=${restaurantId}`,
        {
          method: "GET",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al verificar el estado del pago");
      }

      return data.paymentStatus;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Inicializar el checkout de MercadoPago
  const initializeCheckout = (
    preferenceId,
    containerId = "mercadopago-checkout"
  ) => {
    return new Promise((resolve, reject) => {
      if (typeof window === "undefined" || !window.Mercadopago) {
        reject(new Error("SDK de MercadoPago no disponible"));
        return;
      }

      const mp = new window.Mercadopago(
        process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY
      );

      mp.checkout({
        preference: {
          id: preferenceId,
        },
        render: {
          container: `#${containerId}`,
          label: "Pagar con MercadoPago",
        },
        theme: {
          elementsColor: "#007bff",
          headerColor: "#007bff",
        },
      });

      resolve();
    });
  };

  // Procesar pago con tarjeta
  const processCardPayment = async (cardData, preferenceId) => {
    setIsLoading(true);
    setError(null);

    try {
      if (typeof window === "undefined" || !window.Mercadopago) {
        throw new Error("SDK de MercadoPago no disponible");
      }

      const mp = new window.Mercadopago(
        process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY
      );

      const cardForm = mp.cardForm({
        amount: cardData.amount,
        form: {
          id: "form-checkout",
          cardNumber: {
            id: "form-checkout__cardNumber",
            placeholder: "Número de tarjeta",
          },
          expirationDate: {
            id: "form-checkout__expirationDate",
            placeholder: "MM/YY",
          },
          securityCode: {
            id: "form-checkout__securityCode",
            placeholder: "CVC",
          },
          cardholderName: {
            id: "form-checkout__cardholderName",
            placeholder: "Titular de la tarjeta",
          },
        },
        callbacks: {
          onFormMounted: (error) => {
            if (error) console.error("Form Mounted handling error: ", error);
          },
          onSubmit: (event) => {
            event.preventDefault();
            const {
              paymentMethod,
              issuer,
              cardholderName: formCardholderName,
              amount,
              token,
              installments,
            } = cardForm.getCardFormData();

            // Aquí puedes enviar los datos al backend para procesar el pago
            console.log("Datos del formulario:", {
              paymentMethod,
              issuer,
              cardholderName: formCardholderName,
              amount,
              token,
              installments,
            });
          },
          onBinChange: (event) => {
            console.log("BIN change! ", event);
          },
          onError: (error) => {
            console.error("Error: ", error);
            setError(error.message);
          },
        },
      });

      return cardForm;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    createPaymentPreference,
    checkPaymentStatus,
    initializeCheckout,
    processCardPayment,
  };
};
