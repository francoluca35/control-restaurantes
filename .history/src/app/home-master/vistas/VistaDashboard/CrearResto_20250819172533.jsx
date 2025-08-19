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
    <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-4 sm:p-6 border border-gray-700">
      <div className="text-center">
        <div className="flex items-center justify-center mb-3 sm:mb-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg mr-2 sm:mr-3">
            <FaStore className="text-white text-lg sm:text-xl" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white">
            Crear Nuevo Restaurante
          </h3>
        </div>
        
        <p className="text-gray-300 mb-4 sm:mb-6 text-xs sm:text-sm px-2">
          Registra un nuevo restaurante en el sistema con todos sus datos y configuración
        </p>
        
        <div className="flex justify-center items-center">
          <button
            onClick={irAVistaActivacion}
            className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2 text-sm sm:text-base"
          >
            <FaPlus className="text-sm" />
            <span>Nuevo Usuario Resto</span>
          </button>
        </div>
        
        <div className="mt-3 sm:mt-4 text-xs text-gray-500 space-y-1">
          <p>• Configuración automática del sistema</p>
          <p>• Generación de credenciales únicas</p>
          <p>• Activación inmediata del servicio</p>
        </div>
      </div>
    </div>
  );
}

export default CrearResto;
