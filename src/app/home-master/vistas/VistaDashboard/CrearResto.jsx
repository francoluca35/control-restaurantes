"use client";
import React from "react";

function CrearResto({ onChangeVista }) {
  const irAVistaActivacion = () => {
    if (onChangeVista) {
      onChangeVista("activacion"); // esto es lo que el sidebar usa
    }
  };

  return (
    <div className="text-center ">
      <h3>Crear un nuevo usuario de activación para restaurante</h3>
      <div className="flex justify-center items-center mt-4 ">
        <button
          onClick={irAVistaActivacion}
          className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
        >
          Nuevo Usuario Resto
        </button>
      </div>
    </div>
  );
}

export default CrearResto;
