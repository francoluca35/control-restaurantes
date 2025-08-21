import React, { useState } from "react";
import PaymentLinkGenerator from "./PaymentLinkGenerator";
import PaymentMonitor from "./PaymentMonitor";
import ContractPrinter from "./ContractPrinter";

const RestaurantPaymentFlow = ({ restaurantData, amount }) => {
  const [currentStep, setCurrentStep] = useState("generate"); // generate, monitor, contract
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);

  // Manejar cuando se crea el pago
  const handlePaymentCreated = (paymentData) => {
    setPaymentInfo(paymentData);
    setCurrentStep("monitor");
    console.log("✅ Pago creado, iniciando monitoreo:", paymentData);
  };

  // Manejar cuando se completa el pago
  const handlePaymentComplete = (status) => {
    setPaymentStatus(status);
    setCurrentStep("contract");
    console.log("✅ Pago completado, mostrando contrato:", status);
  };

  // Manejar cuando se imprime el contrato
  const handlePrintComplete = (contractData) => {
    console.log("✅ Contrato impreso:", contractData);
    // Aquí podrías hacer otras acciones como enviar emails, etc.
  };

  // Función para volver al paso anterior
  const goBack = () => {
    if (currentStep === "monitor") {
      setCurrentStep("generate");
      setPaymentInfo(null);
    } else if (currentStep === "contract") {
      setCurrentStep("monitor");
      setPaymentStatus(null);
    }
  };

  // Función para reiniciar el proceso
  const restart = () => {
    setCurrentStep("generate");
    setPaymentInfo(null);
    setPaymentStatus(null);
  };

  return (
    <div className="space-y-6">
      {/* Header con pasos */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Activación de Restaurante
          </h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              Paso {currentStep === "generate" ? "1" : currentStep === "monitor" ? "2" : "3"} de 3
            </span>
          </div>
        </div>

        {/* Indicador de pasos */}
        <div className="flex items-center space-x-4">
          <div className={`flex items-center ${currentStep === "generate" ? "text-blue-600" : currentStep === "monitor" || currentStep === "contract" ? "text-green-600" : "text-gray-400"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep === "generate" ? "bg-blue-600 text-white" : 
              currentStep === "monitor" || currentStep === "contract" ? "bg-green-600 text-white" : 
              "bg-gray-200 text-gray-500"
            }`}>
              1
            </div>
            <span className="ml-2 text-sm font-medium">Generar Link</span>
          </div>

          <div className={`flex-1 h-1 ${currentStep === "monitor" || currentStep === "contract" ? "bg-green-600" : "bg-gray-200"}`}></div>

          <div className={`flex items-center ${currentStep === "monitor" ? "text-blue-600" : currentStep === "contract" ? "text-green-600" : "text-gray-400"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep === "monitor" ? "bg-blue-600 text-white" : 
              currentStep === "contract" ? "bg-green-600 text-white" : 
              "bg-gray-200 text-gray-500"
            }`}>
              2
            </div>
            <span className="ml-2 text-sm font-medium">Monitorear Pago</span>
          </div>

          <div className={`flex-1 h-1 ${currentStep === "contract" ? "bg-green-600" : "bg-gray-200"}`}></div>

          <div className={`flex items-center ${currentStep === "contract" ? "text-blue-600" : "text-gray-400"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep === "contract" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"
            }`}>
              3
            </div>
            <span className="ml-2 text-sm font-medium">Imprimir Contrato</span>
          </div>
        </div>
      </div>

      {/* Contenido del paso actual */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        {currentStep === "generate" && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Paso 1: Generar Link de Pago
            </h3>
            <PaymentLinkGenerator
              restaurantData={restaurantData}
              amount={amount}
              onPaymentCreated={handlePaymentCreated}
            />
          </div>
        )}

        {currentStep === "monitor" && paymentInfo && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Paso 2: Monitorear Pago
              </h3>
              <button
                onClick={goBack}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                ← Volver
              </button>
            </div>
            <PaymentMonitor
              preferenceId={paymentInfo.preferenceId}
              restaurantId={paymentInfo.restaurantId}
              onPaymentComplete={handlePaymentComplete}
              onPrintContract={() => setCurrentStep("contract")}
            />
          </div>
        )}

        {currentStep === "contract" && paymentStatus && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Paso 3: Imprimir Contrato
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={goBack}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  ← Volver
                </button>
                <button
                  onClick={restart}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  🔄 Reiniciar
                </button>
              </div>
            </div>
            <ContractPrinter
              restaurantData={restaurantData}
              paymentData={paymentStatus}
              onPrintComplete={handlePrintComplete}
            />
          </div>
        )}
      </div>

      {/* Información del restaurante */}
      {restaurantData && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">
            Información del Restaurante
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Nombre:</span>
              <span className="ml-2 font-medium">{restaurantData.nombre || restaurantData.name}</span>
            </div>
            <div>
              <span className="text-gray-600">Propietario:</span>
              <span className="ml-2 font-medium">{restaurantData.propietario || restaurantData.owner}</span>
            </div>
            <div>
              <span className="text-gray-600">Dirección:</span>
              <span className="ml-2 font-medium">{restaurantData.direccion || restaurantData.address}</span>
            </div>
            <div>
              <span className="text-gray-600">Teléfono:</span>
              <span className="ml-2 font-medium">{restaurantData.telefono || restaurantData.phone}</span>
            </div>
            <div>
              <span className="text-gray-600">Monto:</span>
              <span className="ml-2 font-medium text-green-600">${amount}</span>
            </div>
          </div>
        </div>
      )}

      {/* Estado actual */}
      {paymentInfo && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">
            Estado del Proceso
          </h4>
          <div className="text-sm text-blue-800">
            <p><strong>Link generado:</strong> {paymentInfo.paymentUrl ? "✅ Sí" : "❌ No"}</p>
            <p><strong>Preference ID:</strong> {paymentInfo.preferenceId}</p>
            <p><strong>Restaurant ID:</strong> {paymentInfo.restaurantId}</p>
            {paymentStatus && (
              <p><strong>Estado del pago:</strong> {paymentStatus.status}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantPaymentFlow;
