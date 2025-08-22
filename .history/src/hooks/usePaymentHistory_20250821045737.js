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
  const generateContractHTML = (paymentData, restaurantData, logoBase64) => {
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
            margin: 40px; 
            line-height: 1.6;
            color: #333;
            background: white;
            font-size: 14px;
          }
          .header { 
            text-align: center; 
            border-bottom: 2px solid #007bff; 
            padding-bottom: 20px; 
            margin-bottom: 30px;
          }
          .contract-number { 
            font-size: 16px; 
            font-weight: bold; 
            color: #007bff; 
            margin-top: 10px;
          }
          .section { 
            margin: 40px 0; 
          }
          .section-title { 
            font-size: 16px; 
            font-weight: bold; 
            color: #333; 
            margin-bottom: 15px;
            text-transform: uppercase;
          }
          .info-grid { 
            display: block; 
            margin: 20px 0;
          }
          .info-item { 
            margin: 0; 
            padding: 15px 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #ddd;
          }
          .info-item:last-child {
            border-bottom: none;
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
            margin-top: 80px; 
            text-align: center; 
            font-size: 12px; 
            color: #666;
            border-top: 2px solid #007bff;
            padding-top: 30px;
          }
          .signature-section {
            margin-top: 100px;
            display: grid;
            grid-template-columns: 1fr auto 1fr;
            gap: 50px;
            align-items: center;
          }
          .signature-box {
            text-align: center;
            min-height: 100px;
          }
          .signature-name {
            font-family: 'Times New Roman', serif;
            font-size: 20px;
            color: #8B5CF6;
            margin-bottom: 8px;
            font-weight: bold;
          }
          .signature-line {
            border-top: 2px solid #007bff;
            margin-top: 5px;
            margin-bottom: 10px;
          }
          .signature-title {
            font-size: 14px;
            color: #666;
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
          <div class="contract-number">${
            restaurantData.nombre || restaurantData.name || "N/A"
          }</div>
          <div>Fecha: ${date} - Hora: ${time}</div>
        </div>

        <div class="section">
          <div class="section-title">INFORMACIÓN DEL RESTAURANTE</div>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Nombre:</span>
              <span>${
                restaurantData.nombre || restaurantData.name || "N/A"
              }</span>
            </div>
            <div class="info-item">
              <span class="info-label">Propietario:</span>
              <span>${
                restaurantData.propietario || restaurantData.owner || "N/A"
              }</span>
            </div>
            <div class="info-item">
              <span class="info-label">Dirección:</span>
              <span>${
                restaurantData.direccion || restaurantData.address || "N/A"
              }</span>
            </div>
            <div class="info-item">
              <span class="info-label">Teléfono:</span>
              <span>${
                restaurantData.telefono || restaurantData.phone || "N/A"
              }</span>
            </div>
            <div class="info-item">
              <span class="info-label">Email:</span>
              <span>${restaurantData.email || "N/A"}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Código de Activación:</span>
              <span>${restaurantData.codigoActivacion || "N/A"}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Contraseña:</span>
              <span>${restaurantData.password || "N/A"}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Cantidad de Usuarios:</span>
              <span>${restaurantData.cantUsuarios || "1"}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Con Finanzas:</span>
              <span>${restaurantData.finanzas ? "Sí" : "No"}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Tipo de Servicio:</span>
              <span>${restaurantData.tipoServicio || "sinFinanzas"}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Logo:</span>
              <span>${restaurantData.logo || "No especificado"}</span>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">INFORMACIÓN DEL PAGO</div>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Monto:</span>
              <span>$${
                paymentData.amount || paymentData.transaction_amount || 0
              } ${
      paymentData.currency || paymentData.currency_id || "ARS"
    }</span>
            </div>
            <div class="info-item">
              <span class="info-label">Método:</span>
              <span>${
                paymentData.payment_method?.type ||
                paymentData.paymentMethod ||
                "MercadoPago"
              }</span>
            </div>
            <div class="info-item">
              <span class="info-label">Periodicidad:</span>
              <span>${
                restaurantData.periodicidad ||
                paymentData.periodicidad ||
                "Mensual"
              }</span>
            </div>
            <div class="info-item">
              <span class="info-label">Fecha de Pago:</span>
              <span>${date}</span>
            </div>
            <div class="info-item">
              <span class="info-label">ID de Transacción:</span>
              <span>${
                paymentData.id || paymentData.transactionId || "N/A"
              }</span>
            </div>
            <div class="info-item">
              <span class="info-label">Estado:</span>
              <span>${
                paymentData.status === "approved"
                  ? "Aprobado"
                  : paymentData.status || "N/A"
              }</span>
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
          <div class="signature-box"><div class="signature-name">&nbsp;</div>
            <div class="signature-line">  </div>
             <div class="signature-title">Firma del Cliente</div>
          </div>
          <div class="logo-container">
            <div class="logo">
              ${
                logoBase64
                  ? `<img src="${logoBase64}" alt="DeamonDD Logo" />`
                  : '<div style="width: 100%; height: 100%; background: linear-gradient(135deg, #8B5CF6, #A855F7); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 32px; color: white;">CW</div>'
              }
            </div>
            <div class="logo-text">Francomputer<br>Comandas Multiples</div>
          </div>
          <div class="signature-box">
            
            <div class="signature-name">Franco Luca Parera</div>
            <div class="signature-line"></div>
            <div class="signature-title">Firma del Representante</div>
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
