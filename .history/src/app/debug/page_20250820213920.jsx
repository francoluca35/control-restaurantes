"use client";
import { useState, useEffect } from "react";
import ConfigDebugger from "../../components/ConfigDebugger";

const DebugPage = () => {
  const [serverInfo, setServerInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServerInfo();
  }, []);

  const fetchServerInfo = async () => {
    try {
      const response = await fetch("/api/debug-env");
      const data = await response.json();
      setServerInfo(data);
    } catch (error) {
      console.error("Error fetching server info:", error);
      setServerInfo({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔧 Página de Debug
          </h1>
          <p className="text-gray-600">
            Verificación completa de la configuración del sistema
          </p>
        </div>

        {/* Información del servidor */}
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            📊 Información del Servidor
          </h2>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">
                Cargando información del servidor...
              </p>
            </div>
          ) : serverInfo ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">Estado</h3>
                  <p className="text-blue-800">
                    {serverInfo.success ? "✅ Funcionando" : "❌ Error"}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-medium text-green-900 mb-2">Timestamp</h3>
                  <p className="text-green-800 text-sm">
                    {serverInfo.timestamp}
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-medium text-purple-900 mb-2">
                    Environment
                  </h3>
                  <p className="text-purple-800">
                    {serverInfo.environment || "No especificado"}
                  </p>
                </div>
              </div>

              {/* Variables de Firebase */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-3">🔥 Firebase</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(serverInfo.firebase?.status || {}).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm font-medium text-gray-700">
                          {key
                            .replace(/([A-Z])/g, " $1")
                            .replace(/^./, (str) => str.toUpperCase())}
                          :
                        </span>
                        <span
                          className={`text-sm ${
                            value.includes("✅")
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {value}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Variables de MercadoPago */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-3">
                  💳 MercadoPago
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(serverInfo.mercadopago?.status || {}).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm font-medium text-gray-700">
                          {key
                            .replace(/([A-Z])/g, " $1")
                            .replace(/^./, (str) => str.toUpperCase())}
                          :
                        </span>
                        <span
                          className={`text-sm ${
                            value.includes("✅")
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {value}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Valores reales (parciales) */}
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-medium text-yellow-900 mb-3">
                  🔍 Valores Reales (Parciales)
                </h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Firebase API Key:</strong>{" "}
                    {serverInfo.firebase?.values?.apiKey}
                  </p>
                  <p>
                    <strong>Firebase Project ID:</strong>{" "}
                    {serverInfo.firebase?.values?.projectId}
                  </p>
                  <p>
                    <strong>MercadoPago Access Token:</strong>{" "}
                    {serverInfo.mercadopago?.values?.accessToken}
                  </p>
                  <p>
                    <strong>Base URL:</strong> {serverInfo.other?.baseUrl}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-red-600">
                Error al cargar la información del servidor
              </p>
            </div>
          )}
        </div>

        {/* ConfigDebugger */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            🔧 Debug de Configuración
          </h2>
          <ConfigDebugger />
        </div>

        {/* Botones de acción */}
        <div className="mt-6 flex justify-center space-x-4">
          <button
            onClick={fetchServerInfo}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            🔄 Actualizar Información
          </button>
          <button
            onClick={async () => {
              try {
                const response = await fetch("/api/test-mercadopago");
                const data = await response.json();
                if (data.success) {
                  alert(`✅ MercadoPago funciona correctamente!\nPreference ID: ${data.preferenceId}`);
                } else {
                  alert(`❌ Error en MercadoPago: ${data.error}`);
                }
              } catch (error) {
                alert(`❌ Error al probar MercadoPago: ${error.message}`);
              }
            }}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            🧪 Probar MercadoPago
          </button>
          <a
            href="/home-master/login"
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            🔙 Volver al Login
          </a>
        </div>
      </div>
    </div>
  );
};

export default DebugPage;
