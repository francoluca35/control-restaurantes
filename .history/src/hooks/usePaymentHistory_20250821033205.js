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

  // Descargar contrato
  const downloadContract = useCallback(
    async (paymentData, restaurantData) => {
      try {
        // Crear el contenido del contrato
        const contractContent = generateContractHTML(
          paymentData,
          restaurantData
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
    const contractNumber = `CON-${paymentData.id || Date.now()}`;
    
    // Manejar fechas de diferentes formatos
    let paymentDate;
    if (paymentData.date) {
      if (paymentData.date.toDate) {
        paymentDate = paymentData.date.toDate();
      } else if (typeof paymentData.date === 'string') {
        paymentDate = new Date(paymentData.date);
      } else {
        paymentDate = new Date(paymentData.date);
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
          body { 
            font-family: Arial, sans-serif; 
            margin: 40px; 
            line-height: 1.6;
            color: #333;
          }
          .header { 
            text-align: center; 
            border-bottom: 3px solid #007bff; 
            padding-bottom: 20px; 
            margin-bottom: 30px;
          }
          .contract-number { 
            font-size: 18px; 
            font-weight: bold; 
            color: #007bff; 
          }
          .section { 
            margin: 20px 0; 
          }
          .section-title { 
            font-size: 16px; 
            font-weight: bold; 
            color: #007bff; 
            margin-bottom: 10px;
          }
          .info-grid { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 20px; 
            margin: 15px 0;
          }
          .info-item { 
            margin: 5px 0; 
          }
          .info-label { 
            font-weight: bold; 
            color: #666; 
          }
          .terms-list { 
            list-style-type: decimal; 
            margin: 15px 0; 
            padding-left: 20px;
          }
          .footer { 
            margin-top: 40px; 
            text-align: center; 
            font-size: 12px; 
            color: #666;
          }
          .signature-section {
            margin-top: 50px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
          }
          .signature-box {
            border-top: 1px solid #333;
            padding-top: 10px;
            text-align: center;
          }
          @media print {
            body { margin: 20px; }
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
                restaurantData.codigoActivacion || restaurantData.activationCode || "N/A"
              }
            </div>
            <div class="info-item">
              <span class="info-label">Contraseña:</span> ${
                restaurantData.password || restaurantData.contraseña || "N/A"
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
          <div class="signature-box">
            <p><strong>Firma del Representante</strong></p>
            <p>Control Restaurantes</p>
          </div>
        </div>

        <div class="footer">
          <p>Este contrato es válido desde la fecha de pago y se renueva automáticamente cada 30 días.</p>
          <p>Para cualquier consulta, contactar a soporte@controlrestaurantes.com</p>
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
