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
        // Importar jsPDF dinámicamente
        const { default: jsPDF } = await import("jspdf");

        // Crear nuevo documento PDF
        const doc = new jsPDF();

        // Configurar fuente y colores
        doc.setFont("helvetica");

        // Definir colores del diseño
        const violetColor = [139, 92, 246]; // Violet-500
        const blackColor = [0, 0, 0];
        const grayColor = [156, 163, 175]; // Gray-400

        // Header con fondo violeta
        doc.setFillColor(...violetColor);
        doc.rect(0, 0, 210, 30, "F");

        // Título principal
        doc.setFontSize(24);
        doc.setTextColor(255, 255, 255);
        doc.text("CONTRATO DE SERVICIOS", 105, 18, { align: "center" });

        // Subtítulo
        doc.setFontSize(12);
        doc.text("Sistema de Control de Restaurantes", 105, 25, {
          align: "center",
        });

        // Línea separadora
        doc.setDrawColor(...grayColor);
        doc.setLineWidth(0.5);
        doc.line(20, 40, 190, 40);

        // Información del contrato
        doc.setFontSize(14);
        doc.setTextColor(...violetColor);
        doc.text("INFORMACIÓN DEL CONTRATO", 20, 55);

        doc.setFontSize(10);
        doc.setTextColor(...blackColor);
        doc.text(`Fecha: ${new Date().toLocaleDateString("es-AR")}`, 20, 65);
        doc.text(`Proveedor: DeamonDD By FranComputer`, 20, 75);
        doc.text(`Contacto: contacto@deamondd.com`, 20, 85);

        // Línea separadora
        doc.setDrawColor(...grayColor);
        doc.setLineWidth(0.5);
        doc.line(20, 95, 190, 95);

        // Datos del cliente
        doc.setFontSize(14);
        doc.setTextColor(...violetColor);
        doc.text("DATOS DEL CLIENTE", 20, 110);

        doc.setFontSize(10);
        doc.setTextColor(...blackColor);
        doc.text(
          `Nombre del Restaurante: ${
            restaurantData.nombre || restaurantData.name || "N/A"
          }`,
          20,
          120
        );
        doc.text(
          `Propietario: ${restaurantData.propietario || "N/A"}`,
          20,
          130
        );
        doc.text(`DNI: ${restaurantData.dni || "N/A"}`, 20, 140);
        doc.text(`Email: ${restaurantData.email || "N/A"}`, 20, 150);
        doc.text(`Teléfono: ${restaurantData.telefono || "N/A"}`, 20, 160);
        doc.text(`Dirección: ${restaurantData.direccion || "N/A"}`, 20, 170);
        doc.text(
          `Código de Activación: ${restaurantData.codigoActivacion || "N/A"}`,
          20,
          180
        );
        doc.text(
          `Cantidad de Usuarios: ${restaurantData.cantUsuarios || "1"}`,
          20,
          190
        );

        // Línea separadora
        doc.line(20, 200, 190, 200);

        // Servicios contratados
        doc.setFontSize(14);
        doc.setTextColor(...violetColor);
        doc.text("SERVICIOS CONTRATADOS", 20, 215);

        doc.setFontSize(10);
        doc.setTextColor(...blackColor);
        doc.text(
          `Tipo de Servicio: ${restaurantData.tipoServicio || "Sin Finanzas"}`,
          20,
          225
        );
        doc.text(
          `Periodicidad: ${restaurantData.periodicidad || "Mensual"}`,
          20,
          235
        );
        doc.text(
          `Cantidad de Usuarios: ${restaurantData.cantUsuarios || "1"}`,
          20,
          245
        );

        // Línea separadora
        doc.line(20, 255, 190, 255);

        // Información del pago
        doc.setFontSize(14);
        doc.setTextColor(...violetColor);
        doc.text("INFORMACIÓN DEL PAGO", 20, 275);

        doc.setFontSize(10);
        doc.setTextColor(...blackColor);
        doc.text(`Monto: $${paymentData.amount || "0"}`, 20, 285);
        doc.text(`Método de Pago: ${paymentData.paymentMethod || "N/A"}`, 20, 295);
        doc.text(`Estado: ${paymentData.status === "approved" ? "Aprobado" : "Pendiente"}`, 20, 305);
        doc.text(`ID de Pago: ${paymentData.paymentId || paymentData.id || "N/A"}`, 20, 315);

        // Fecha de pago
        let paymentDate = new Date();
        if (paymentData.date) {
          if (typeof paymentData.date === "object" && paymentData.date.toDate) {
            paymentDate = paymentData.date.toDate();
          } else if (typeof paymentData.date === "string") {
            paymentDate = new Date(paymentData.date);
          } else if (paymentData.date instanceof Date) {
            paymentDate = paymentData.date;
          }
        }
        doc.text(`Fecha de Pago: ${paymentDate.toLocaleDateString("es-AR")}`, 20, 325);
        
        // Línea separadora
        doc.line(20, 335, 190, 335);

        // Contenido del contrato
        doc.setFontSize(11);
        doc.setTextColor(...blackColor);

        const contractText = [
          `El Proveedor (DeamonDD By FranComputer) se compromete a proporcionar servicios de sistema de control de restaurantes al Cliente (${
            restaurantData.nombre || restaurantData.name || "Restaurante"
          }) según los términos establecidos en este contrato.`,

          `El Cliente se compromete a realizar el pago de $${
            paymentData.amount || "0"
          } por ${restaurantData.periodicidad || "mensual"} de servicios, con ${
            restaurantData.tipoServicio || "Sin Finanzas"
          } incluidos. El servicio incluye acceso completo al sistema, soporte técnico y actualizaciones durante el período contratado.`,

          `Ambas partes acuerdan colaborar de manera profesional para garantizar el éxito del proyecto. El Proveedor proporcionará documentación y capacitación necesaria, mientras que el Cliente se compromete a utilizar el sistema de manera responsable y cumplir con los términos de pago establecidos.`,
        ];

        let yPosition = 345;
        contractText.forEach((paragraph, index) => {
          // Dividir texto en líneas si es muy largo
          const words = paragraph.split(" ");
          let line = "";
          let lines = [];

          words.forEach((word) => {
            const testLine = line + word + " ";
            if (doc.getTextWidth(testLine) < 160) {
              line = testLine;
            } else {
              lines.push(line);
              line = word + " ";
            }
          });
          lines.push(line);

          lines.forEach((lineText) => {
            if (yPosition > 250) {
              doc.text(lineText.trim(), 20, yPosition);
              yPosition += 6;
            } else {
              // Agregar nueva página si no hay espacio
              doc.addPage();
              yPosition = 20;
              doc.text(lineText.trim(), 20, yPosition);
              yPosition += 6;
            }
          });
          yPosition += 8; // Espacio entre párrafos
        });

        // Información de contacto al final
        doc.setFontSize(10);
        doc.setTextColor(...grayColor);
        doc.text(
          "(11) 1234-5678 // contacto@deamondd.com // Av. Principal 123, Buenos Aires",
          20,
          yPosition + 10
        );

        // Términos y condiciones
        doc.setFontSize(16);
        doc.setTextColor(...violetColor);
        doc.text("TÉRMINOS Y CONDICIONES", 20, yPosition + 20);

        doc.setFontSize(10);
        doc.setTextColor(...blackColor);
        const terms = [
          "1. DURACIÓN DEL SERVICIO: El servicio tiene una duración de 30 días desde la fecha de activación.",
          "2. ACCESO AL SISTEMA: El restaurante tendrá acceso completo al sistema de control de restaurantes.",
          "3. SOPORTE TÉCNICO: Se incluye soporte técnico durante el período contratado.",
          "4. CONFIDENCIALIDAD: Los datos del restaurante serán tratados con total confidencialidad.",
          "5. PAGO: El pago debe realizarse antes de la activación del servicio.",
          "6. MODIFICACIONES: Cualquier modificación debe ser notificada por escrito.",
          "7. RESPONSABILIDADES: El cliente es responsable del uso adecuado del sistema.",
          "8. PRIVACIDAD: Se respeta la privacidad de los datos según la ley vigente.",
          "9. CANCELACIÓN: El servicio puede ser cancelado con 30 días de anticipación.",
          "10. RENOVACIÓN: El servicio se renueva automáticamente a menos que se cancele.",
        ];

        let termsYPosition = yPosition + 35;
        terms.forEach((term, index) => {
          if (termsYPosition > 250) {
            // Si hay espacio en la página
            doc.text(term, 20, termsYPosition);
            termsYPosition += 8;
          } else {
            // Agregar nueva página si no hay espacio
            doc.addPage();
            termsYPosition = 20;
            doc.setFontSize(10);
            doc.setTextColor(...blackColor);
            doc.text(term, 20, termsYPosition);
            termsYPosition += 8;
          }
        });

        // Sección de firmas (en la misma página)
        doc.setFontSize(14);
        doc.setTextColor(...blackColor);

        // Líneas de firma
        doc.setDrawColor(...blackColor);
        doc.setLineWidth(1);
        doc.line(20, termsYPosition + 30, 90, termsYPosition + 30);
        doc.line(120, termsYPosition + 30, 190, termsYPosition + 30);

        // Nombres de los firmantes
        doc.setFontSize(12);
        doc.setTextColor(...blackColor);
        doc.text(
          restaurantData.nombre || restaurantData.name || "RESTAURANTE",
          55,
          termsYPosition + 45,
          { align: "center" }
        );
        doc.text("DEAMONDD BY FRANCOMPUTER", 155, termsYPosition + 45, {
          align: "center",
        });

        // Fecha de generación
        doc.setFontSize(10);
        doc.setTextColor(...grayColor);
        doc.text(
          `Generado el: ${new Date().toLocaleDateString("es-AR")}`,
          20,
          280
        );

        // Generar nombre del archivo
        const restaurantName = (
          restaurantData.nombre ||
          restaurantData.name ||
          "restaurante"
        )
          .replace(/[^a-zA-Z0-9]/g, "_")
          .toLowerCase();
        const fileName = `contrato-${restaurantName}.pdf`;

        // Guardar PDF
        doc.save(fileName);

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
              <span class="info-label">Nombre Restaurante:</span>
              <span>${
                restaurantData.nombre || restaurantData.name || "N/A"
              }</span>
            </div>
            <div class="info-item">
              <span class="info-label">Nombre Completo:</span>
              <span>${
                restaurantData.nombreCompleto ||
                paymentData.nombreCompleto ||
                restaurantData.propietario ||
                paymentData.propietario ||
                restaurantData.owner ||
                "N/A"
              }</span>
            </div>
            <div class="info-item">
              <span class="info-label">DNI:</span>
              <span>${restaurantData.dni || paymentData.dni || "N/A"}</span>
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
              <span class="info-label">Periodicidad del pago:</span>
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
              <span class="info-label">Codigo de Transacción:</span>
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
            <li>El soporte técnico está disponible de lunes a sabadós de 08:00 a 17:00</li>
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
