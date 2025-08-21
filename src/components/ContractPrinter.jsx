import React, { useState, useEffect } from "react";

const ContractPrinter = ({ restaurantData, paymentData, onPrintComplete }) => {
  const [isPrinting, setIsPrinting] = useState(false);
  const [contractData, setContractData] = useState(null);

  useEffect(() => {
    if (restaurantData && paymentData) {
      generateContractData();
    }
  }, [restaurantData, paymentData]);

  const generateContractData = () => {
    const contract = {
      contractNumber: `CON-${Date.now()}`,
      date: new Date().toLocaleDateString("es-AR"),
      time: new Date().toLocaleTimeString("es-AR"),
      restaurant: {
        name: restaurantData.nombre || restaurantData.name,
        address: restaurantData.direccion || restaurantData.address,
        phone: restaurantData.telefono || restaurantData.phone,
        email: restaurantData.email,
        owner: restaurantData.propietario || restaurantData.owner,
      },
      payment: {
        amount: paymentData.transaction_amount,
        currency: paymentData.currency_id || "ARS",
        method: paymentData.payment_method?.type || "MercadoPago",
        date: paymentData.date_approved
          ? new Date(paymentData.date_approved).toLocaleDateString("es-AR")
          : new Date().toLocaleDateString("es-AR"),
        transactionId: paymentData.id,
      },
      terms: [
        "El restaurante queda activo por 30 días desde la fecha de pago",
        "El servicio incluye gestión de pedidos, inventario y reportes",
        "Se puede cancelar en cualquier momento sin penalización",
        "El soporte técnico está disponible 24/7",
        "Los datos del restaurante están protegidos y son confidenciales",
      ],
    };

    setContractData(contract);
  };

  const printContract = () => {
    if (!contractData) return;

    setIsPrinting(true);

    // Crear el contenido del contrato
    const contractContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Contrato de Activación - ${contractData.restaurant.name}</title>
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
          <div class="contract-number">${contractData.contractNumber}</div>
          <div>Fecha: ${contractData.date} - Hora: ${contractData.time}</div>
        </div>

        <div class="section">
          <div class="section-title">INFORMACIÓN DEL RESTAURANTE</div>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Nombre:</span> ${
                contractData.restaurant.name
              }
            </div>
            <div class="info-item">
              <span class="info-label">Propietario:</span> ${
                contractData.restaurant.owner
              }
            </div>
            <div class="info-item">
              <span class="info-label">Dirección:</span> ${
                contractData.restaurant.address
              }
            </div>
            <div class="info-item">
              <span class="info-label">Teléfono:</span> ${
                contractData.restaurant.phone
              }
            </div>
            <div class="info-item">
              <span class="info-label">Email:</span> ${
                contractData.restaurant.email
              }
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">INFORMACIÓN DEL PAGO</div>
          <div class="info-grid">
                         <div class="info-item">
               <span class="info-label">Monto:</span> ${
                 contractData.payment.currency === "USD" ? "$" : "$"
               }${contractData.payment.amount} ${contractData.payment.currency}
             </div>
            <div class="info-item">
              <span class="info-label">Método:</span> ${
                contractData.payment.method
              }
            </div>
            <div class="info-item">
              <span class="info-label">Fecha de Pago:</span> ${
                contractData.payment.date
              }
            </div>
            <div class="info-item">
              <span class="info-label">ID de Transacción:</span> ${
                contractData.payment.transactionId
              }
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">TÉRMINOS Y CONDICIONES</div>
          <ol class="terms-list">
            ${contractData.terms.map((term) => `<li>${term}</li>`).join("")}
          </ol>
        </div>

        <div class="signature-section">
          <div class="signature-box">
            <p><strong>Firma del Cliente</strong></p>
            <p>${contractData.restaurant.owner}</p>
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

        <div class="no-print" style="margin-top: 30px; text-align: center;">
          <button onclick="window.print()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
            🖨️ Imprimir Contrato
          </button>
          <button onclick="window.close()" style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">
            Cerrar
          </button>
        </div>
      </body>
      </html>
    `;

    // Abrir nueva ventana para imprimir
    const printWindow = window.open("", "_blank");
    printWindow.document.write(contractContent);
    printWindow.document.close();

    // Esperar a que se cargue y imprimir
    printWindow.onload = () => {
      printWindow.print();
      setIsPrinting(false);

      if (onPrintComplete) {
        onPrintComplete(contractData);
      }
    };
  };

  const downloadPDF = () => {
    // Aquí podrías implementar la descarga como PDF
    // Por ahora, solo imprimimos
    printContract();
  };

  if (!contractData) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-700 text-sm">Generando contrato...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Vista previa del contrato */}
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-3">
          📄 Contrato de Activación
        </h3>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Número de Contrato:</span>
            <span className="font-medium">{contractData.contractNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Restaurante:</span>
            <span className="font-medium">{contractData.restaurant.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Propietario:</span>
            <span className="font-medium">{contractData.restaurant.owner}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Monto:</span>
            <span className="font-medium">
              {contractData.payment.currency === "USD" ? "$" : "$"}
              {contractData.payment.amount} {contractData.payment.currency}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Fecha:</span>
            <span className="font-medium">{contractData.date}</span>
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex gap-2">
        <button
          onClick={printContract}
          disabled={isPrinting}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isPrinting ? "Imprimiendo..." : "🖨️ Imprimir Contrato"}
        </button>

        <button
          onClick={downloadPDF}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          📄 Descargar PDF
        </button>
      </div>

      {/* Información adicional */}
      <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded">
        <p>
          <strong>Información del contrato:</strong>
        </p>
        <ul className="list-disc list-inside mt-1 space-y-1">
          <li>El contrato se genera automáticamente al completar el pago</li>
          <li>Incluye toda la información del restaurante y el pago</li>
          <li>Puedes imprimirlo o descargarlo como PDF</li>
          <li>El contrato es válido por 30 días desde la fecha de pago</li>
        </ul>
      </div>
    </div>
  );
};

export default ContractPrinter;
