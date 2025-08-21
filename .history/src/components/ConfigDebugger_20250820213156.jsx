"use client";
import { useState, useEffect } from "react";
import { auth, db } from "../lib/firebase";

const ConfigDebugger = () => {
  const [configStatus, setConfigStatus] = useState({
    firebase: "checking",
    mercadopago: "checking",
    env: "checking",
  });
  const [envVars, setEnvVars] = useState({});
  const [detailedInfo, setDetailedInfo] = useState(null);

  useEffect(() => {
    checkConfiguration();
  }, []);

  const checkConfiguration = async () => {
    try {
      // Obtener información detallada del servidor
      const response = await fetch("/api/debug-env");
      const data = await response.json();

      if (data.success) {
        // Verificar variables de entorno desde el servidor
        const envCheck = {
          firebase: {
            apiKey: data.firebase.status.apiKey === "✅ Configurada",
            authDomain: data.firebase.status.authDomain === "✅ Configurada",
            projectId: data.firebase.status.projectId === "✅ Configurada",
            storageBucket:
              data.firebase.status.storageBucket === "✅ Configurada",
            messagingSenderId:
              data.firebase.status.messagingSenderId === "✅ Configurada",
            appId: data.firebase.status.appId === "✅ Configurada",
          },
          mercadopago: {
            accessToken:
              data.mercadopago.status.accessToken === "✅ Configurada",
            publicKey: data.mercadopago.status.publicKey === "✅ Configurada",
          },
        };

        setEnvVars(envCheck);

        // Verificar Firebase
        if (auth && db) {
          setConfigStatus((prev) => ({ ...prev, firebase: "success" }));
        } else {
          setConfigStatus((prev) => ({ ...prev, firebase: "error" }));
        }

        // Verificar MercadoPago
        try {
          const mpResponse = await fetch("/api/payments/mercadopago", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              restaurantId: "test",
              amount: 100,
              title: "Test Payment",
            }),
          });

          if (mpResponse.status === 500) {
            const errorData = await mpResponse.json();
            if (errorData.error?.includes("Mercado Pago no está configurado")) {
              setConfigStatus((prev) => ({ ...prev, mercadopago: "error" }));
            } else {
              setConfigStatus((prev) => ({ ...prev, mercadopago: "success" }));
            }
          } else {
            setConfigStatus((prev) => ({ ...prev, mercadopago: "success" }));
          }
        } catch (error) {
          setConfigStatus((prev) => ({ ...prev, mercadopago: "error" }));
        }

        // Verificar archivo .env.local
        setConfigStatus((prev) => ({
          ...prev,
          env: "success",
        }));

        // Guardar información detallada para mostrar
        setDetailedInfo(data);
      } else {
        console.error("Error obteniendo información del servidor:", data.error);
        setConfigStatus((prev) => ({
          ...prev,
          env: "error",
          firebase: "error",
          mercadopago: "error",
        }));
      }
    } catch (error) {
      console.error("Error verificando configuración:", error);
      setConfigStatus((prev) => ({
        ...prev,
        env: "error",
        firebase: "error",
        mercadopago: "error",
      }));
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "success":
        return "✅";
      case "error":
        return "❌";
      case "checking":
        return "⏳";
      default:
        return "❓";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "success":
        return "Configurado correctamente";
      case "error":
        return "Error de configuración";
      case "checking":
        return "Verificando...";
      default:
        return "Estado desconocido";
    }
  };

  return (
    <div className="bg-gray-900 text-white p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">🔧 Debug de Configuración</h2>

      {/* Estado general */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Estado General</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span>Archivo .env.local:</span>
            <span className="flex items-center gap-2">
              {getStatusIcon(configStatus.env)}
              {getStatusText(configStatus.env)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Firebase:</span>
            <span className="flex items-center gap-2">
              {getStatusIcon(configStatus.firebase)}
              {getStatusText(configStatus.firebase)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>MercadoPago:</span>
            <span className="flex items-center gap-2">
              {getStatusIcon(configStatus.mercadopago)}
              {getStatusText(configStatus.mercadopago)}
            </span>
          </div>
        </div>
      </div>

      {/* Variables de entorno */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Variables de Entorno</h3>

        <div className="space-y-3">
          <div>
            <h4 className="font-medium text-blue-300 mb-2">Firebase:</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <span
                  className={
                    envVars.firebase?.apiKey ? "text-green-400" : "text-red-400"
                  }
                >
                  {envVars.firebase?.apiKey ? "✅" : "❌"}
                </span>
                <span>API Key</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={
                    envVars.firebase?.authDomain
                      ? "text-green-400"
                      : "text-red-400"
                  }
                >
                  {envVars.firebase?.authDomain ? "✅" : "❌"}
                </span>
                <span>Auth Domain</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={
                    envVars.firebase?.projectId
                      ? "text-green-400"
                      : "text-red-400"
                  }
                >
                  {envVars.firebase?.projectId ? "✅" : "❌"}
                </span>
                <span>Project ID</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={
                    envVars.firebase?.storageBucket
                      ? "text-green-400"
                      : "text-red-400"
                  }
                >
                  {envVars.firebase?.storageBucket ? "✅" : "❌"}
                </span>
                <span>Storage Bucket</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={
                    envVars.firebase?.messagingSenderId
                      ? "text-green-400"
                      : "text-red-400"
                  }
                >
                  {envVars.firebase?.messagingSenderId ? "✅" : "❌"}
                </span>
                <span>Messaging Sender ID</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={
                    envVars.firebase?.appId ? "text-green-400" : "text-red-400"
                  }
                >
                  {envVars.firebase?.appId ? "✅" : "❌"}
                </span>
                <span>App ID</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-blue-300 mb-2">MercadoPago:</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <span
                  className={
                    envVars.mercadopago?.accessToken
                      ? "text-green-400"
                      : "text-red-400"
                  }
                >
                  {envVars.mercadopago?.accessToken ? "✅" : "❌"}
                </span>
                <span>Access Token</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={
                    envVars.mercadopago?.publicKey
                      ? "text-green-400"
                      : "text-red-400"
                  }
                >
                  {envVars.mercadopago?.publicKey ? "✅" : "❌"}
                </span>
                <span>Public Key</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Información detallada del servidor */}
      {detailedInfo && (
        <div className="bg-gray-800 p-4 rounded-lg mb-4">
          <h4 className="font-medium text-yellow-300 mb-2">
            🔍 Información del Servidor:
          </h4>
          <div className="text-sm space-y-2 text-gray-300">
            <p>
              <strong>Timestamp:</strong> {detailedInfo.timestamp}
            </p>
            <p>
              <strong>Environment:</strong> {detailedInfo.environment}
            </p>

            <div className="mt-3">
              <h5 className="font-medium text-blue-300 mb-1">
                Firebase Values:
              </h5>
              <div className="space-y-1 text-xs">
                <p>
                  <strong>API Key:</strong>{" "}
                  {detailedInfo.firebase.values.apiKey}
                </p>
                <p>
                  <strong>Auth Domain:</strong>{" "}
                  {detailedInfo.firebase.values.authDomain}
                </p>
                <p>
                  <strong>Project ID:</strong>{" "}
                  {detailedInfo.firebase.values.projectId}
                </p>
                <p>
                  <strong>Storage Bucket:</strong>{" "}
                  {detailedInfo.firebase.values.storageBucket}
                </p>
                <p>
                  <strong>Messaging Sender ID:</strong>{" "}
                  {detailedInfo.firebase.values.messagingSenderId}
                </p>
                <p>
                  <strong>App ID:</strong> {detailedInfo.firebase.values.appId}
                </p>
              </div>
            </div>

            <div className="mt-3">
              <h5 className="font-medium text-blue-300 mb-1">
                MercadoPago Values:
              </h5>
              <div className="space-y-1 text-xs">
                <p>
                  <strong>Access Token:</strong>{" "}
                  {detailedInfo.mercadopago.values.accessToken}
                </p>
                <p>
                  <strong>Public Key:</strong>{" "}
                  {detailedInfo.mercadopago.values.publicKey}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instrucciones */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <h4 className="font-medium text-yellow-300 mb-2">📋 Instrucciones:</h4>
        <ul className="text-sm space-y-1 text-gray-300">
          <li>
            • Crea un archivo{" "}
            <code className="bg-gray-700 px-1 rounded">.env.local</code> en la
            raíz del proyecto
          </li>
          <li>• Copia las credenciales de Firebase y MercadoPago</li>
          <li>• Reinicia el servidor después de crear el archivo</li>
          <li>
            • Revisa{" "}
            <code className="bg-gray-700 px-1 rounded">
              SETUP_INSTRUCTIONS.md
            </code>{" "}
            para más detalles
          </li>
        </ul>
      </div>

      {/* Botón de recarga */}
      <div className="mt-4 text-center">
        <button
          onClick={checkConfiguration}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm"
        >
          🔄 Verificar Configuración
        </button>
      </div>
    </div>
  );
};

export default ConfigDebugger;
