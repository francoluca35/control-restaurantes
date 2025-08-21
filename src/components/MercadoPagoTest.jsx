import React, { useState, useEffect } from "react";

const MercadoPagoTest = () => {
  const [testResult, setTestResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const testConfiguration = async () => {
    setIsLoading(true);
    setError(null);
    setTestResult(null);

    try {
      const response = await fetch("/api/mercadopago-test");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al probar la configuración");
      }

      setTestResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    testConfiguration();
  }, []);

  if (isLoading) {
    return (
      <div className="p-4 bg-blue-50 rounded-lg">
        <div className="text-blue-600 font-medium">
          Probando configuración de MercadoPago...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 rounded-lg">
        <div className="text-red-600 font-medium">Error: {error}</div>
        <button
          onClick={testConfiguration}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!testResult) {
    return null;
  }

  const { configInfo, connectionTest } = testResult;

  return (
    <div className="space-y-4">
      {/* Información de configuración */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-2">
          Configuración de MercadoPago
        </h3>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Estado:</span>
            <span
              className={
                configInfo.isConfigured ? "text-green-600" : "text-red-600"
              }
            >
              {configInfo.isConfigured ? "✅ Configurado" : "❌ No configurado"}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Entorno:</span>
            <span className="text-blue-600">{configInfo.environment}</span>
          </div>
          <div className="flex justify-between">
            <span>Public Key:</span>
            <span
              className={
                configInfo.publicKey === "Configurado"
                  ? "text-green-600"
                  : "text-red-600"
              }
            >
              {configInfo.publicKey}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Client ID:</span>
            <span
              className={
                configInfo.clientId === "Configurado"
                  ? "text-green-600"
                  : "text-red-600"
              }
            >
              {configInfo.clientId}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Access Token:</span>
            <span
              className={
                configInfo.accessToken === "Configurado"
                  ? "text-green-600"
                  : "text-red-600"
              }
            >
              {configInfo.accessToken}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Client Secret:</span>
            <span
              className={
                configInfo.clientSecret === "Configurado"
                  ? "text-green-600"
                  : "text-red-600"
              }
            >
              {configInfo.clientSecret}
            </span>
          </div>
        </div>
      </div>

      {/* Resultado de la conexión */}
      <div
        className={`p-4 rounded-lg ${
          connectionTest.success ? "bg-green-50" : "bg-red-50"
        }`}
      >
        <h3 className="font-medium mb-2">
          {connectionTest.success
            ? "✅ Conexión Exitosa"
            : "❌ Error de Conexión"}
        </h3>
        <div className="text-sm">
          {connectionTest.success ? (
            <div>
              <p className="text-green-700">{connectionTest.message}</p>
              {connectionTest.accountInfo && (
                <div className="mt-2 p-2 bg-white rounded text-xs">
                  <strong>Información de la cuenta:</strong>
                  <pre className="mt-1 overflow-auto">
                    {JSON.stringify(connectionTest.accountInfo, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <p className="text-red-700">{connectionTest.error}</p>
          )}
        </div>
      </div>

      {/* Botón para reintentar */}
      <button
        onClick={testConfiguration}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Probar de nuevo
      </button>
    </div>
  );
};

export default MercadoPagoTest;
