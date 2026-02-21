// src/pages/DRP/DrpCapacidad.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function DrpCapacidad() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-cyan-400">
          🏭 Capacidad logística
        </h1>
        <button
          onClick={() => navigate("/drp/intro")}
          className="bg-gray-700 hover:bg-gray-800 px-4 py-2 rounded"
        >
          Menú DRP
        </button>
      </div>

      <p className="text-gray-300 mb-4">
        Aquí modelaremos restricciones de capacidad: transporte, almacenaje,
        ventanas de entrega, etc.
      </p>

      <div className="bg-gray-800 rounded-lg p-4">
        <p className="text-gray-500 text-sm">
          Placeholder: parámetros de capacidad logística.
        </p>
      </div>
    </div>
  );
}
