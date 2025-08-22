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

        // Logo de la empresa
        try {
          const logoBase64 = await convertImageToBase64("/Assets/LogoApp.png");
          if (logoBase64) {
            doc.addImage(logoBase64, "PNG", 20, 10, 20, 20);
          }
        } catch (error) {
          console.log("No se pudo cargar el logo, usando texto");
          doc.setFillColor(255, 255, 255);
          doc.circle(30, 20, 10, "F");
          doc.setTextColor(...primaryColor);
          doc.setFontSize(16);
          doc.setFont("helvetica", "bold");
          doc.text("CW", 30, 25, { align: "center" });
        }

        // Información de la empresa
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text("CONTRATO COMANDAS MULTIPLES", 105, 15, {
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
        let currentY = 50;

        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...textColor);
        const contractNumber = `CW-${new Date().getFullYear()}-${String(
          restaurantData.codigoActivacion || Date.now()
        ).padStart(6, "0")}`;

        currentY += 5;
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
        doc.text(`Vigencia: Desde la fecha de activación`, 20, currentY);

        // Línea separadora
        currentY += 10;
        doc.setDrawColor(...secondaryColor);
        doc.setLineWidth(0.5);
        doc.line(20, currentY, 190, currentY);

        // ===== PARTES CONTRATANTES =====
        currentY += 20;
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
        doc.text("CUIT: 20-42672344-2", 25, currentY);

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
        currentY += 15;
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...secondaryColor);
        doc.text("INFORMACION TECNICA:", 20, currentY);
        currentY += 10;
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
        // ===== PÁGINA 2: OBJETO DEL CONTRATO, ESPECIFICACIONES Y CONDICIONES =====
        doc.addPage();
        currentY = 20;

        // OBJETO DEL CONTRATO
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
          doc.text(line, line.startsWith("•") ? 30 : 20, currentY);
          currentY += 8;
        });

        // Línea separadora
        currentY += 10;
        doc.setDrawColor(...secondaryColor);
        doc.setLineWidth(0.5);
        doc.line(20, currentY, 190, currentY);

        // CONDICIONES ECONÓMICAS
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
            paymentData.status === "pagado" ? "Aprobado" : "Pendiente"
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

        // Línea separadora
        currentY += 10;
        doc.setDrawColor(...secondaryColor);
        doc.setLineWidth(0.5);
        doc.line(20, currentY, 190, currentY);

    

        // ===== PÁGINA 3: TÉRMINOS Y CONDICIONES + FIRMAS =====
        doc.addPage();
        currentY = 20;

        // TÉRMINOS Y CONDICIONES
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...primaryColor);
        doc.text("TÉRMINOS Y CONDICIONES", 20, currentY);

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
          "6. JURISDICCIÓN:",
          "   Este contrato se rige por las leyes de la República Argentina.",
          "   Los conflictos se resolverán en los tribunales de Buenos Aires.",
          "",
          "7. MODIFICACIONES:",
          "   Cualquier modificación debe ser acordada por escrito por ambas partes.",
          "",
          "8. NOTIFICACIONES:",
          "   Las notificaciones deben realizarse por email o correo certificado.",
          "",
          "9. INTEGRIDAD:",
          "   Este documento constituye el acuerdo completo entre las partes.",
        ];

        legalTerms.forEach((line) => {
          if (currentY <= 200) {
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
          }
        });

        // FIRMAS
        currentY += 30;
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...primaryColor);
        doc.text("FIRMAS", 105, currentY, { align: "center" });

        currentY += 30;

        // Firma del cliente (izquierda)
        doc.setDrawColor(...primaryColor);
        doc.setLineWidth(1);
        doc.line(20, currentY, 90, currentY);

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...textColor);
        doc.text("Firma del Cliente", 55, currentY + 10, { align: "center" });

        // Logo central con diseño mejorado
        try {
          const logoBase64 = await convertImageToBase64("/Assets/LogoApp.png");
          if (logoBase64) {
            // Logo real
            doc.addImage(logoBase64, "PNG", 95, currentY - 10, 20, 20);
          } else {
            // Logo fallback con diseño mejorado
            doc.setFillColor(...primaryColor);
            doc.circle(105, currentY, 15, "F");
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text("DEAMON DD", 105, currentY - 3, { align: "center" });
            doc.setFontSize(18);
            doc.text("CM", 105, currentY + 7, { align: "center" });
            doc.setFontSize(8);
            doc.text("Comandas Multiples", 105, currentY + 17, {
              align: "center",
            });
          }
        } catch (error) {
          // Logo fallback con diseño mejorado
          doc.setFillColor(...primaryColor);
          doc.circle(105, currentY, 15, "F");
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(12);
          doc.setFont("helvetica", "bold");
          doc.text("DEAMON DD", 105, currentY - 3, { align: "center" });
          doc.setFontSize(18);
          doc.text("CM", 105, currentY + 7, { align: "center" });
          doc.setFontSize(8);
          doc.text("Comandas Multiples", 105, currentY + 17, {
            align: "center",
          });
        }

        // Firma del representante (derecha)
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...primaryColor);
        doc.text("Franco Luca Parera", 155, currentY - 5, { align: "center" });

        doc.setDrawColor(...primaryColor);
        doc.setLineWidth(1);
        doc.line(120, currentY, 190, currentY);

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...textColor);
        doc.text("Firma del Representante", 155, currentY + 10, {
          align: "center",
        });

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

  // Generar HTML del contrato empresarial
  const generateContractHTML = (paymentData, restaurantData, logoBase64) => {
    const contractNumber = `CW-${new Date().getFullYear()}-${String(
      restaurantData.codigoActivacion || Date.now()
    ).padStart(6, "0")}`;

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
        <title>Contrato Empresarial - ${
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
            background: linear-gradient(135deg, #002060, #0040a0);
            color: white;
            padding: 30px 20px;
            text-align: center;
            border-radius: 8px;
            margin-bottom: 30px;
            position: relative;
          }
          .header::before {
            content: '';
            position: absolute;
            top: 15px;
            left: 20px;
            width: 40px;
            height: 40px;
            background: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            color: #002060;
            font-size: 18px;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: bold;
          }
          .header .subtitle {
            font-size: 16px;
            margin-top: 10px;
            opacity: 0.9;
          }
          .contract-number { 
            font-size: 18px; 
            font-weight: bold; 
            color: #002060; 
            margin-top: 15px;
            background: white;
            padding: 10px 20px;
            border-radius: 5px;
            display: inline-block;
          }
          .section { 
            margin: 40px 0; 
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 25px;
            background: #fafafa;
          }
          .section-title { 
            font-size: 18px; 
            font-weight: bold; 
            color: #002060; 
            margin-bottom: 20px;
            text-transform: uppercase;
            border-bottom: 2px solid #002060;
            padding-bottom: 10px;
          }
          .info-grid { 
            display: block; 
            margin: 20px 0;
          }
          .info-item { 
            margin: 0; 
            padding: 12px 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #e0e0e0;
            background: white;
            padding: 12px 15px;
            margin: 5px 0;
            border-radius: 5px;
          }
          .info-item:last-child {
            border-bottom: none;
          }
          .info-label { 
            font-weight: bold; 
            color: #002060; 
            font-size: 13px;
            min-width: 200px;
          }
          .info-value {
            color: #333;
            font-weight: 500;
          }
          .terms-list { 
            list-style-type: decimal; 
            margin: 15px 0; 
            padding-left: 20px;
          }
          .terms-list li {
            margin: 12px 0;
            font-size: 13px;
            line-height: 1.5;
          }
          .footer { 
            margin-top: 80px; 
            text-align: center; 
            font-size: 12px; 
            color: #666;
            border-top: 2px solid #002060;
            padding-top: 30px;
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
          }
          .signature-section {
            margin-top: 100px;
            display: grid;
            grid-template-columns: 1fr auto 1fr;
            gap: 50px;
            align-items: center;
            background: white;
            padding: 30px;
            border-radius: 8px;
            border: 1px solid #e0e0e0;
          }
          .signature-box {
            text-align: center;
            min-height: 120px;
            padding: 20px;
            border: 2px solid #002060;
            border-radius: 8px;
            background: #f8f9fa;
          }
          .signature-name {
            font-family: 'Times New Roman', serif;
            font-size: 18px;
            color: #002060;
            margin-bottom: 8px;
            font-weight: bold;
          }
          .signature-line {
            border-top: 2px solid #002060;
            margin: 15px 0;
            height: 2px;
          }
          .signature-title {
            font-size: 14px;
            color: #666;
            font-weight: bold;
            text-transform: uppercase;
          }
          .logo-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }
          .logo {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #002060, #0040a0);
            margin-bottom: 15px;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(0, 32, 96, 0.3);
          }
          .logo img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 50%;
          }
          .logo-text {
            font-size: 12px;
            color: #002060;
            font-weight: bold;
            text-align: center;
            text-transform: uppercase;
          }
          .legal-notice {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 5px;
            padding: 15px;
            margin: 20px 0;
            font-size: 12px;
            color: #856404;
          }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
            .header { break-inside: avoid; }
            .section { break-inside: avoid; }
          }
        </style>
      </head>
      <body>
                  <div class="header">
            <h1>CONTRATO COMANDAS MULTIPLES</h1>
            <div class="subtitle">Sistema de Gestión para Restaurantes</div>
            <div class="subtitle">DeamonDD By FranComputer</div>
          </div>

                  <div class="section">
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">PRESTADOR DE SERVICIOS:</span>
                <span class="info-value">DeamonDD By FranComputer</span>
              </div>
            <div class="info-item">
              <span class="info-label">Representante Legal:</span>
              <span class="info-value">Franco Luca Parera</span>
            </div>
            <div class="info-item">
              <span class="info-label">Dirección:</span>
              <span class="info-value">Av. Principal 123, Buenos Aires, Argentina</span>
            </div>
            <div class="info-item">
              <span class="info-label">Email:</span>
              <span class="info-value">contacto@deamondd.com</span>
            </div>
            <div class="info-item">
              <span class="info-label">Teléfono:</span>
              <span class="info-value">(11) 1234-5678</span>
            </div>
            <div class="info-item">
              <span class="info-label">CUIT:</span>
              <span class="info-value">20-12345678-9</span>
            </div>
            <div class="info-item">
              <span class="info-label">CLIENTE:</span>
              <span class="info-value">${
                restaurantData.nombre || restaurantData.name || "N/A"
              }</span>
            </div>
            <div class="info-item">
              <span class="info-label">Representante:</span>
              <span class="info-value">${
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
              <span class="info-value">${
                restaurantData.dni || paymentData.dni || "N/A"
              }</span>
            </div>
            <div class="info-item">
              <span class="info-label">Dirección:</span>
              <span class="info-value">${
                restaurantData.direccion || restaurantData.address || "N/A"
              }</span>
            </div>
            <div class="info-item">
              <span class="info-label">Email:</span>
              <span class="info-value">${restaurantData.email || "N/A"}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Teléfono:</span>
              <span class="info-value">${
                restaurantData.telefono || restaurantData.phone || "N/A"
              }</span>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">OBJETO DEL CONTRATO</div>
          <p>El presente contrato tiene por objeto la prestación de servicios tecnológicos para la gestión integral de restaurantes, incluyendo:</p>
          <ul style="margin: 15px 0; padding-left: 20px;">
            <li>Sistema de comandas y pedidos en tiempo real</li>
            <li>Gestión de inventario y stock</li>
            <li>Reportes de ventas y análisis de datos</li>
            <li>Módulo de finanzas y control de caja</li>
            <li>Soporte técnico especializado</li>
            <li>Acceso multiplataforma (web y móvil)</li>
          </ul>
        </div>

        <div class="section">
          <div class="section-title">ESPECIFICACIONES TÉCNICAS</div>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Código de Activación:</span>
              <span class="info-value">${
                restaurantData.codigoActivacion || "N/A"
              }</span>
            </div>
            <div class="info-item">
              <span class="info-label">Cantidad de Usuarios:</span>
              <span class="info-value">${
                restaurantData.cantUsuarios || "1"
              }</span>
            </div>
            <div class="info-item">
              <span class="info-label">Tipo de Servicio:</span>
              <span class="info-value">${
                restaurantData.tipoServicio || "Básico"
              }</span>
            </div>
            <div class="info-item">
              <span class="info-label">Módulo de Finanzas:</span>
              <span class="info-value">${
                restaurantData.finanzas ? "Incluido" : "No incluido"
              }</span>
            </div>
            <div class="info-item">
              <span class="info-label">Periodicidad:</span>
              <span class="info-value">${
                restaurantData.periodicidad ||
                paymentData.periodicidad ||
                "Mensual"
              }</span>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">CONDICIONES ECONÓMICAS</div>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Monto del Servicio:</span>
              <span class="info-value">$${
                paymentData.amount || paymentData.transaction_amount || 0
              } ${
      paymentData.currency || paymentData.currency_id || "ARS"
    }</span>
            </div>
            <div class="info-item">
              <span class="info-label">Método de Pago:</span>
              <span class="info-value">${
                paymentData.payment_method?.type ||
                paymentData.paymentMethod ||
                "MercadoPago"
              }</span>
            </div>
            <div class="info-item">
              <span class="info-label">ID de Transacción:</span>
              <span class="info-value">${
                paymentData.id || paymentData.transactionId || "N/A"
              }</span>
            </div>
            <div class="info-item">
              <span class="info-label">Estado del Pago:</span>
              <span class="info-value">${
                paymentData.status === "approved"
                  ? "Aprobado"
                  : paymentData.status || "N/A"
              }</span>
            </div>
            <div class="info-item">
              <span class="info-label">Fecha de Pago:</span>
              <span class="info-value">${date}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Forma de Pago:</span>
              <span class="info-value">Anticipado</span>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">TÉRMINOS Y CONDICIONES</div>
          <ol class="terms-list">
            <li><strong>DURACIÓN Y RENOVACIÓN:</strong> El contrato tiene una duración de 30 días desde la fecha de activación. Se renueva automáticamente por períodos iguales salvo cancelación.</li>
            <li><strong>CONFIDENCIALIDAD:</strong> Ambas partes se comprometen a mantener la confidencialidad de la información compartida durante la prestación del servicio.</li>
            <li><strong>PROPIEDAD INTELECTUAL:</strong> El sistema y su software son propiedad exclusiva del prestador. El cliente adquiere únicamente el derecho de uso.</li>
            <li><strong>LIMITACIÓN DE RESPONSABILIDAD:</strong> El prestador no será responsable por daños indirectos o consecuenciales. La responsabilidad máxima será el monto pagado por el servicio.</li>
            <li><strong>FORCE MAJEURE:</strong> Ninguna parte será responsable por incumplimiento debido a causas de fuerza mayor o eventos fuera de su control.</li>
            <li><strong>JURISDICCIÓN:</strong> Este contrato se rige por las leyes de la República Argentina. Los conflictos se resolverán en los tribunales de Buenos Aires.</li>
            <li><strong>MODIFICACIONES:</strong> Cualquier modificación debe ser acordada por escrito por ambas partes.</li>
            <li><strong>NOTIFICACIONES:</strong> Las notificaciones deben realizarse por email o correo certificado.</li>
            <li><strong>INTEGRIDAD:</strong> Este documento constituye el acuerdo completo entre las partes.</li>
          </ol>
        </div>

        <div class="legal-notice">
          <strong>NOTA LEGAL:</strong> Este documento es generado automáticamente y tiene validez legal. Para consultas contactar a contacto@deamondd.com
        </div>

        <div class="signature-section">
          <div class="signature-box">
            <div class="signature-line"></div>
            <div class="signature-title">Firma del Cliente</div>
          </div>
          <div class="logo-container">
            <div class="logo">
              ${
                logoBase64
                  ? `<img src="${logoBase64}" alt="DeamonDD Logo" />`
                  : '<div style="width: 100%; height: 100%; background: linear-gradient(135deg, #002060, #0040a0); border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: white;"><div style="font-size: 12px; font-weight: bold;">DEAMON DD</div><div style="font-size: 18px; font-weight: bold;">CM</div><div style="font-size: 8px;">Comandas Multiples</div></div>'
              }
            </div>
          </div>
          <div class="signature-box">
            <div class="signature-name">Franco Luca Parera</div>
            <div class="signature-line"></div>
            <div class="signature-title">Firma del Representante</div>
          </div>
        </div>

        <div class="footer">
          <p><strong>Este contrato es válido desde la fecha de pago y se renueva automáticamente cada 30 días.</strong></p>
          <p>Para cualquier consulta, contactar a soporte@deamondd.com | Tel: (11) 1234-5678</p>
          <p>Generado el: ${new Date().toLocaleDateString(
            "es-AR"
          )} a las ${new Date().toLocaleTimeString("es-AR")}</p>
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
