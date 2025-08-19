"use client";
import React from "react";
import { FaPlus, FaStore } from "react-icons/fa";

function CrearResto({ onChangeVista }) {
  const irAVistaActivacion = () => {
    if (onChangeVista) {
      onChangeVista("activacion"); // esto es lo que el sidebar usa
    }
  };

  return (
    <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-6 border border-gray-700">
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg mr-3">
            <FaStore className="text-white text-xl" />
          </div>
          <h3 className="text-xl font-bold text-white">
            Crear Nuevo Restaurante
          </h3>
        </div>
        
        <p className="text-gray-300 mb-6 text-sm">
          Registra un nuevo restaurante en el sistema con todos sus datos y configuración
        </p>
        
        <div className="flex justify-center items-center">
          <button
            onClick={irAVistaActivacion}
            className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2"
          >
            <FaPlus className="text-sm" />
            <span>Nuevo Usuario Resto</span>
          </button>
        </div>
        
        <div className="mt-4 text-xs text-gray-500">
          <p>• Configuración automática del sistema</p>
          <p>• Generación de credenciales únicas</p>
          <p>• Activación inmediata del servicio</p>
        </div>
      </div>
    </div>
  );
}

export default CrearResto;
