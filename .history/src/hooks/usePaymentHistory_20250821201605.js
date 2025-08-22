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

        // Definir colores del diseño empresarial
        const primaryColor = [0, 32, 96]; // Azul corporativo
        const secondaryColor = [64, 64, 64]; // Gris oscuro
        const accentColor = [0, 123, 255]; // Azul claro
        const textColor = [51, 51, 51]; // Gris texto

        // ===== HEADER CORPORATIVO =====
        // Fondo del header
        doc.setFillColor(...primaryColor);
        doc.rect(0, 0, 210, 35, "F");

        // Logo/Iniciales de la empresa
        doc.setFillColor(255, 255, 255);
        doc.circle(25, 17.5, 8, "F");
        doc.setTextColor(...primaryColor);
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("CW", 25, 22, { align: "center" });

        // Información de la empresa
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text("CONTRATO DE SERVICIOS TECNOLÓGICOS", 105, 15, {
          align: "center",
        });

        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.text("Sistema de Gestión para Restaurantes", 105, 25, {
          align: "center",
        });
        doc.text("DeamonDD By FranComputer", 105, 32, { align: "center" });

        // Línea separadora
        doc.setDrawColor(...accentColor);
        doc.setLineWidth(1);
        doc.line(20, 45, 190, 45);

        // ===== INFORMACIÓN DEL CONTRATO =====
        let currentY = 60;

        // Número de contrato
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...primaryColor);
        doc.text("CONTRATO N°:", 20, currentY);

        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...textColor);
        const contractNumber = `CW-${new Date().getFullYear()}-${String(
          restaurantData.codigoActivacion || Date.now()
        ).padStart(6, "0")}`;
        doc.text(contractNumber, 50, currentY);

        currentY += 15;
        doc.text(
          `Fecha de Emisión: ${new Date().toLocaleDateString("es-AR", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}`,
          20,
          currentY
        );

        currentY += 15;
        doc.text(
          `Vigencia: 30 días desde la fecha de activación`,
          20,
          currentY
        );

        // Línea separadora
        currentY += 20;
        doc.setDrawColor(...secondaryColor);
        doc.setLineWidth(0.5);
        doc.line(20, currentY, 190, currentY);

        // ===== PARTES CONTRATANTES =====
        currentY += 20;
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...primaryColor);
        doc.text("PARTES CONTRATANTES", 20, currentY);

        currentY += 15;
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...secondaryColor);
        doc.text("PRESTADOR DE SERVICIOS:", 20, currentY);

        currentY += 10;
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...textColor);
        doc.text("Razón Social: DeamonDD By FranComputer", 25, currentY);
        currentY += 8;
        doc.text("Representante Legal: Franco Luca Parera", 25, currentY);
        currentY += 8;
        doc.text(
          "Dirección: Av. Principal 123, Buenos Aires, Argentina",
          25,
          currentY
        );
        currentY += 8;
        doc.text("Email: contacto@deamondd.com", 25, currentY);
        currentY += 8;
        doc.text("Teléfono: (11) 1234-5678", 25, currentY);
        currentY += 8;
        doc.text("CUIT: 20-42", 25, currentY);

        currentY += 15;
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...secondaryColor);
        doc.text("CLIENTE:", 20, currentY);

        currentY += 10;
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...textColor);
        doc.text(
          `Razón Social: ${
            restaurantData.nombre || restaurantData.name || "N/A"
          }`,
          25,
          currentY
        );
        currentY += 8;
        doc.text(
          `Representante: ${
            restaurantData.propietario || restaurantData.nombreCompleto || "N/A"
          }`,
          25,
          currentY
        );
        currentY += 8;
        doc.text(`DNI: ${restaurantData.dni || "N/A"}`, 25, currentY);
        currentY += 8;
        doc.text(
          `Dirección: ${
            restaurantData.direccion || restaurantData.address || "N/A"
          }`,
          25,
          currentY
        );
        currentY += 8;
        doc.text(`Email: ${restaurantData.email || "N/A"}`, 25, currentY);
        currentY += 8;
        doc.text(
          `Teléfono: ${
            restaurantData.telefono || restaurantData.phone || "N/A"
          }`,
          25,
          currentY
        );

        // Línea separadora
        currentY += 20;
        doc.setDrawColor(...secondaryColor);
        doc.setLineWidth(0.5);
        doc.line(20, currentY, 190, currentY);

        // ===== OBJETO DEL CONTRATO =====
        currentY += 20;
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...primaryColor);
        doc.text("OBJETO DEL CONTRATO", 20, currentY);

        currentY += 15;
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...textColor);

        const objectText = [
          "El presente contrato tiene por objeto la prestación de servicios tecnológicos",
          "para la gestión integral de restaurantes, incluyendo:",
          "",
          "• Sistema de comandas y pedidos en tiempo real",
          "• Gestión de inventario y stock",
          "• Reportes de ventas y análisis de datos",
          "• Módulo de finanzas y control de caja",
          "• Soporte técnico especializado",
          "• Acceso multiplataforma (web y móvil)",
        ];

        objectText.forEach((line) => {
          if (currentY > 250) {
            doc.addPage();
            currentY = 20;
          }
          doc.text(line, line.startsWith("•") ? 30 : 20, currentY);
          currentY += 8;
        });

        // Línea separadora
        currentY += 15;
        doc.setDrawColor(...secondaryColor);
        doc.setLineWidth(0.5);
        doc.line(20, currentY, 190, currentY);

        // ===== ESPECIFICACIONES TÉCNICAS =====
        currentY += 20;
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...primaryColor);
        doc.text("ESPECIFICACIONES TÉCNICAS", 20, currentY);

        currentY += 15;
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...textColor);

        doc.text(
          `Código de Activación: ${restaurantData.codigoActivacion || "N/A"}`,
          20,
          currentY
        );
        currentY += 8;
        doc.text(
          `Cantidad de Usuarios: ${restaurantData.cantUsuarios || "1"}`,
          20,
          currentY
        );
        currentY += 8;
        doc.text(
          `Tipo de Servicio: ${restaurantData.tipoServicio || "Básico"}`,
          20,
          currentY
        );
        currentY += 8;
        doc.text(
          `Módulo de Finanzas: ${
            restaurantData.finanzas ? "Incluido" : "No incluido"
          }`,
          20,
          currentY
        );
        currentY += 8;
        doc.text(
          `Periodicidad: ${restaurantData.periodicidad || "Mensual"}`,
          20,
          currentY
        );

        // Línea separadora
        currentY += 20;
        doc.setDrawColor(...secondaryColor);
        doc.setLineWidth(0.5);
        doc.line(20, currentY, 190, currentY);

        // ===== CONDICIONES ECONÓMICAS =====
        currentY += 20;
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...primaryColor);
        doc.text("CONDICIONES ECONÓMICAS", 20, currentY);

        currentY += 15;
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...textColor);

        // Manejar fecha de pago
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

        doc.text(
          `Monto del Servicio: $${
            paymentData.amount || paymentData.transaction_amount || "0"
          } ${paymentData.currency || paymentData.currency_id || "ARS"}`,
          20,
          currentY
        );
        currentY += 8;
        doc.text(
          `Método de Pago: ${
            paymentData.payment_method?.type ||
            paymentData.paymentMethod ||
            "MercadoPago"
          }`,
          20,
          currentY
        );
        currentY += 8;
        doc.text(
          `ID de Transacción: ${
            paymentData.id || paymentData.transactionId || "N/A"
          }`,
          20,
          currentY
        );
        currentY += 8;
        doc.text(
          `Estado del Pago: ${
            paymentData.status === "approved" ? "Aprobado" : "Pendiente"
          }`,
          20,
          currentY
        );
        currentY += 8;
        doc.text(
          `Fecha de Pago: ${paymentDate.toLocaleDateString("es-AR")}`,
          20,
          currentY
        );
        currentY += 8;
        doc.text(`Forma de Pago: Anticipado`, 20, currentY);

        // Línea separadora
        currentY += 20;
        doc.setDrawColor(...secondaryColor);
        doc.setLineWidth(0.5);
        doc.line(20, currentY, 190, currentY);

        // ===== OBLIGACIONES Y RESPONSABILIDADES =====
        currentY += 20;
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...primaryColor);
        doc.text("OBLIGACIONES Y RESPONSABILIDADES", 20, currentY);

        currentY += 15;
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...textColor);

        const obligations = [
          "OBLIGACIONES DEL PRESTADOR:",
          "• Proporcionar acceso al sistema las 24 horas del día",
          "• Mantener la confidencialidad de los datos del cliente",
          "• Brindar soporte técnico en horario comercial",
          "• Realizar mantenimiento preventivo del sistema",
          "• Notificar con anticipación cualquier interrupción programada",
          "",
          "OBLIGACIONES DEL CLIENTE:",
          "• Utilizar el sistema de manera responsable y legal",
          "• Mantener la confidencialidad de sus credenciales de acceso",
          "• Realizar el pago en los términos acordados",
          "• Notificar cualquier problema técnico en tiempo oportuno",
          "• Respetar los términos de uso del sistema",
        ];

        obligations.forEach((line) => {
          if (currentY > 250) {
            doc.addPage();
            currentY = 20;
          }
          if (line.startsWith("OBLIGACIONES")) {
            doc.setFont("helvetica", "bold");
            doc.setTextColor(...secondaryColor);
            doc.text(line, 20, currentY);
            currentY += 8;
            doc.setFont("helvetica", "normal");
            doc.setTextColor(...textColor);
          } else if (line.startsWith("•")) {
            doc.text(line, 25, currentY);
            currentY += 8;
          } else {
            doc.text(line, 20, currentY);
            currentY += 8;
          }
        });

        // Línea separadora
        currentY += 15;
        doc.setDrawColor(...secondaryColor);
        doc.setLineWidth(0.5);
        doc.line(20, currentY, 190, currentY);

        // ===== TÉRMINOS Y CONDICIONES LEGALES =====
        currentY += 20;
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...primaryColor);
        doc.text("TÉRMINOS Y CONDICIONES LEGALES", 20, currentY);

        currentY += 15;
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...textColor);

        const legalTerms = [
          "1. DURACIÓN Y RENOVACIÓN:",
          "   El contrato tiene una duración de 30 días desde la fecha de activación.",
          "   Se renueva automáticamente por períodos iguales salvo cancelación.",
          "",
          "2. CONFIDENCIALIDAD:",
          "   Ambas partes se comprometen a mantener la confidencialidad de la",
          "   información compartida durante la prestación del servicio.",
          "",
          "3. PROPIEDAD INTELECTUAL:",
          "   El sistema y su software son propiedad exclusiva del prestador.",
          "   El cliente adquiere únicamente el derecho de uso.",
          "",
          "4. LIMITACIÓN DE RESPONSABILIDAD:",
          "   El prestador no será responsable por daños indirectos o consecuenciales.",
          "   La responsabilidad máxima será el monto pagado por el servicio.",
          "",
          "5. FORCE MAJEURE:",
          "   Ninguna parte será responsable por incumplimiento debido a causas",
          "   de fuerza mayor o eventos fuera de su control.",
          "",
          "6. RESOLUCIÓN:",
          "   Cualquiera de las partes puede rescindir el contrato con 30 días",
          "   de anticipación por escrito.",
          "",
          "7. JURISDICCIÓN:",
          "   Este contrato se rige por las leyes de la República Argentina.",
          "   Los conflictos se resolverán en los tribunales de Buenos Aires.",
          "",
          "8. MODIFICACIONES:",
          "   Cualquier modificación debe ser acordada por escrito por ambas partes.",
          "",
          "9. NOTIFICACIONES:",
          "   Las notificaciones deben realizarse por email o correo certificado.",
          "",
          "10. INTEGRIDAD:",
          "    Este documento constituye el acuerdo completo entre las partes.",
        ];

        legalTerms.forEach((line) => {
          if (currentY > 250) {
            doc.addPage();
            currentY = 20;
          }
          if (line.match(/^\d+\./)) {
            doc.setFont("helvetica", "bold");
            doc.setTextColor(...secondaryColor);
            doc.text(line, 20, currentY);
            currentY += 8;
            doc.setFont("helvetica", "normal");
            doc.setTextColor(...textColor);
          } else {
            doc.text(line, 20, currentY);
            currentY += 8;
          }
        });

        // ===== FIRMAS =====
        if (currentY > 200) {
          doc.addPage();
          currentY = 20;
        }

        currentY += 30;
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...primaryColor);
        doc.text("FIRMAS", 105, currentY, { align: "center" });

        currentY += 30;

        // Firma del cliente
        doc.setDrawColor(...primaryColor);
        doc.setLineWidth(1);
        doc.line(20, currentY, 90, currentY);

        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...secondaryColor);
        doc.text("Firma del Cliente", 55, currentY + 10, { align: "center" });

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...textColor);
        doc.text(
          `${
            restaurantData.propietario ||
            restaurantData.nombreCompleto ||
            "Cliente"
          }`,
          55,
          currentY + 20,
          { align: "center" }
        );
        doc.text(`DNI: ${restaurantData.dni || "N/A"}`, 55, currentY + 28, {
          align: "center",
        });

        // Logo central
        doc.setFillColor(...primaryColor);
        doc.circle(105, currentY - 5, 15, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(20);
        doc.setFont("helvetica", "bold");
        doc.text("CW", 105, currentY + 2, { align: "center" });

        doc.setFontSize(8);
        doc.text("DeamonDD", 105, currentY + 12, { align: "center" });

        // Firma del prestador
        doc.setDrawColor(...primaryColor);
        doc.setLineWidth(1);
        doc.line(120, currentY, 190, currentY);

        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...secondaryColor);
        doc.text("Firma del Prestador", 155, currentY + 10, {
          align: "center",
        });

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...textColor);
        doc.text("Franco Luca Parera", 155, currentY + 20, { align: "center" });
        doc.text("DeamonDD By FranComputer", 155, currentY + 28, {
          align: "center",
        });

        // ===== FOOTER =====
        const footerY = 280;
        doc.setDrawColor(...accentColor);
        doc.setLineWidth(0.5);
        doc.line(20, footerY, 190, footerY);

        doc.setFontSize(8);
        doc.setTextColor(...secondaryColor);
        doc.text(
          "Este documento es generado automáticamente y tiene validez legal",
          105,
          footerY + 8,
          { align: "center" }
        );
        doc.text(
          "Para consultas: contacto@deamondd.com | Tel: (11) 1234-5678",
          105,
          footerY + 15,
          { align: "center" }
        );
        doc.text(
          `Generado el: ${new Date().toLocaleDateString(
            "es-AR"
          )} a las ${new Date().toLocaleTimeString("es-AR")}`,
          105,
          footerY + 22,
          { align: "center" }
        );

        // Generar nombre del archivo
        const restaurantName = (
          restaurantData.nombre ||
          restaurantData.name ||
          "restaurante"
        )
          .replace(/[^a-zA-Z0-9]/g, "_")
          .toLowerCase();
        const fileName = `contrato-empresarial-${restaurantName}-${contractNumber}.pdf`;

        // Guardar PDF
        doc.save(fileName);

        return {
          success: true,
          message: "Contrato empresarial descargado exitosamente",
        };
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
