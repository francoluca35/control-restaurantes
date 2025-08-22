"use client";
import { useState, useEffect, useCallback } from "react";
import { useErrorHandler } from "./useErrorHandler.js";

export const usePaymentHistory = () => {
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { handleError } = useErrorHandler();

  // Cargar historial de pagos
  const loadPaymentHistory = useCallback(
    async (restaurantId = null) => {
      try {
        setLoading(true);
        setError(null);

        let url = "/api/pagos/history";
        if (restaurantId) {
          url += `?restaurant_id=${restaurantId}`;
        }

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Error al cargar el historial de pagos");
        }

        const data = await response.json();
        setPaymentHistory(data);
      } catch (err) {
        console.error("Error loading payment history:", err);
        setError("Error al cargar el historial de pagos");
        handleError(err, "paymentHistory", { showToast: true });
      } finally {
        setLoading(false);
      }
    },
    [handleError]
  );

  // Función para convertir imagen a base64
  const convertImageToBase64 = async (imagePath) => {
    try {
      const response = await fetch(imagePath);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("Error convirtiendo imagen a base64:", error);
      return null;
    }
  };

  // Descargar contrato
  const downloadContract = useCallback(
    async (paymentData, restaurantData) => {
      try {
        // Convertir logo a base64
        const logoBase64 = await convertImageToBase64("/Assets/LogoApp.png");
        
        // Crear el contenido del contrato
        const contractContent = generateContractHTML(
          paymentData,
          restaurantData,
          logoBase64
        );

        // Crear un blob con el contenido HTML
        const blob = new Blob([contractContent], { type: "text/html" });
        const url = URL.createObjectURL(blob);

        // Crear un enlace temporal para descargar
        const link = document.createElement("a");
        link.href = url;
        link.download = `contrato_${
          restaurantData.nombre || restaurantData.name
        }_${paymentData.id || Date.now()}.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Limpiar el URL del blob
        URL.revokeObjectURL(url);

        return { success: true, message: "Contrato descargado exitosamente" };
      } catch (err) {
        console.error("Error downloading contract:", err);
        handleError(err, "contractDownload", { showToast: true });
        return { success: false, message: "Error al descargar el contrato" };
      }
    },
    [handleError]
  );

  // Generar HTML del contrato
  const generateContractHTML = (paymentData, restaurantData) => {
    const contractNumber = `DeamonDD By FranComputer`;

    // Manejar diferentes formatos de fecha
    let paymentDate;
    if (paymentData.date) {
      if (typeof paymentData.date === "object" && paymentData.date.toDate) {
        // Es un Timestamp de Firestore
        paymentDate = paymentData.date.toDate();
      } else if (typeof paymentData.date === "string") {
        // Es una string de fecha
        paymentDate = new Date(paymentData.date);
      } else if (paymentData.date instanceof Date) {
        // Ya es un objeto Date
        paymentDate = paymentData.date;
      } else {
        // Fallback
        paymentDate = new Date();
      }
    } else {
      paymentDate = new Date();
    }

    const date = paymentDate.toLocaleDateString("es-AR");
    const time = paymentDate.toLocaleTimeString("es-AR");

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Contrato de Activación - ${
          restaurantData.nombre || restaurantData.name
        }</title>
        <style>
          @page {
            size: A4;
            margin: 2cm;
          }
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 0; 
            line-height: 1.6;
            color: #333;
            background: white;
            font-size: 14px;
          }
          .header { 
            text-align: center; 
            border-bottom: 3px solid #8B5CF6; 
            padding-bottom: 20px; 
            margin-bottom: 30px;
          }
          .contract-number { 
            font-size: 20px; 
            font-weight: bold; 
            color: #8B5CF6; 
            margin-top: 15px;
          }
          .section { 
            margin: 30px 0; 
          }
          .section-title { 
            font-size: 18px; 
            font-weight: bold; 
            color: #8B5CF6; 
            margin-bottom: 15px;
            border-left: 4px solid #8B5CF6;
            padding-left: 15px;
          }
          .info-grid { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 15px; 
            margin: 15px 0;
          }
          .info-item { 
            margin: 10px 0; 
            padding: 12px;
            background: #f8f9fa;
            border-radius: 6px;
            border-left: 3px solid #8B5CF6;
          }
          .info-label { 
            font-weight: bold; 
            color: #555; 
            font-size: 13px;
          }
          .terms-list { 
            list-style-type: decimal; 
            margin: 15px 0; 
            padding-left: 20px;
          }
          .terms-list li {
            margin: 10px 0;
            font-size: 13px;
          }
          .footer { 
            margin-top: 50px; 
            text-align: center; 
            font-size: 12px; 
            color: #666;
            border-top: 2px solid #8B5CF6;
            padding-top: 20px;
          }
          .signature-section {
            margin-top: 80px;
            display: grid;
            grid-template-columns: 1fr auto 1fr;
            gap: 40px;
            align-items: center;
          }
          .signature-box {
            border-top: 2px solid #8B5CF6;
            padding-top: 20px;
            text-align: center;
            min-height: 100px;
          }
          .signature-name {
            font-family: 'Brush Script MT', cursive;
            font-size: 18px;
            color: #8B5CF6;
            margin-top: 10px;
            font-weight: bold;
          }
          .logo-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }
          .logo {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 6px 12px rgba(139, 92, 246, 0.4);
            margin-bottom: 15px;
            overflow: hidden;
          }
          .logo img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 50%;
          }
          .logo-text {
            font-size: 12px;
            color: #8B5CF6;
            font-weight: bold;
            text-align: center;
          }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>CONTRATO DE ACTIVACIÓN DE RESTAURANTE</h1>
          <div class="contract-number">${contractNumber}</div>
          <div>Fecha: ${date} - Hora: ${time}</div>
        </div>

        <div class="section">
          <div class="section-title">INFORMACIÓN DEL RESTAURANTE</div>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Nombre:</span> ${
                restaurantData.nombre || restaurantData.name || "N/A"
              }
            </div>
            <div class="info-item">
              <span class="info-label">Propietario:</span> ${
                restaurantData.propietario || restaurantData.owner || "N/A"
              }
            </div>
            <div class="info-item">
              <span class="info-label">Dirección:</span> ${
                restaurantData.direccion || restaurantData.address || "N/A"
              }
            </div>
            <div class="info-item">
              <span class="info-label">Teléfono:</span> ${
                restaurantData.telefono || restaurantData.phone || "N/A"
              }
            </div>
            <div class="info-item">
              <span class="info-label">Email:</span> ${
                restaurantData.email || "N/A"
              }
            </div>
            <div class="info-item">
              <span class="info-label">Código de Activación:</span> ${
                restaurantData.codigoActivacion || "N/A"
              }
            </div>
            <div class="info-item">
              <span class="info-label">Contraseña:</span> ${
                restaurantData.password || "N/A"
              }
            </div>
            <div class="info-item">
              <span class="info-label">Cantidad de Usuarios:</span> ${
                restaurantData.cantUsuarios || "1"
              }
            </div>
            <div class="info-item">
              <span class="info-label">Con Finanzas:</span> ${
                restaurantData.finanzas ? "Sí" : "No"
              }
            </div>
            <div class="info-item">
              <span class="info-label">Tipo de Servicio:</span> ${
                restaurantData.tipoServicio || "sinFinanzas"
              }
            </div>
            <div class="info-item">
              <span class="info-label">Logo:</span> ${
                restaurantData.logo || "No especificado"
              }
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">INFORMACIÓN DEL PAGO</div>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Monto:</span> $${
                paymentData.amount || paymentData.transaction_amount || 0
              } ${paymentData.currency || paymentData.currency_id || "ARS"}
            </div>
            <div class="info-item">
              <span class="info-label">Método:</span> ${
                paymentData.payment_method?.type ||
                paymentData.paymentMethod ||
                "MercadoPago"
              }
            </div>
            <div class="info-item">
              <span class="info-label">Periodicidad:</span> ${
                restaurantData.periodicidad ||
                paymentData.periodicidad ||
                "Mensual"
              }
            </div>
            <div class="info-item">
              <span class="info-label">Fecha de Pago:</span> ${date}
            </div>
            <div class="info-item">
              <span class="info-label">ID de Transacción:</span> ${
                paymentData.id || paymentData.transactionId || "N/A"
              }
            </div>
            <div class="info-item">
              <span class="info-label">Estado:</span> ${
                paymentData.status === "approved"
                  ? "Aprobado"
                  : paymentData.status || "N/A"
              }
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">TÉRMINOS Y CONDICIONES</div>
          <ol class="terms-list">
            <li>El restaurante queda activo por 30 días desde la fecha de pago</li>
            <li>El servicio incluye gestión de pedidos, inventario y reportes</li>
            <li>Se puede cancelar en cualquier momento sin penalización</li>
            <li>El soporte técnico está disponible 24/7</li>
            <li>Los datos del restaurante están protegidos y son confidenciales</li>
          </ol>
        </div>

        <div class="signature-section">
          <div class="signature-box">
            <p><strong>Firma del Cliente</strong></p>
            <p>${
              restaurantData.propietario || restaurantData.owner || "N/A"
            }</p>
          </div>
          <div class="logo-container">
            <div class="logo">
              <img src="/Assets/LogoApp.png" alt="DeamonDD Logo" />
            </div>
            <div class="logo-text">DEAMON DD<br>Comandas Multiples</div>
          </div>
          <div class="signature-box">
            <p><strong>Firma del Representante</strong></p>
            <div class="signature-name">Franco Luca Parera</div>
          </div>
        </div>

        <div class="footer">
          <p>Este contrato es válido desde la fecha de pago y se renueva automáticamente cada 30 días.</p>
          <p>Para cualquier consulta, contactar a soporte@deamondd.com</p>
        </div>
      </body>
      </html>
    `;
  };

  return {
    paymentHistory,
    loading,
    error,
    loadPaymentHistory,
    downloadContract,
  };
};
