// src/pages/DRP/DrpEscenarios.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function DrpEscenarios() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-cyan-400">
          🧩 Escenarios DRP
        </h1>
        <button
          onClick={() => navigate("/drp/proyectos")}
          className="bg-gray-700 hover:bg-gray-800 px-4 py-2 rounded"
        >
          Volver a proyectos
        </button>
      </div>

      <p className="text-gray-300 mb-4">
        Aquí definiremos escenarios (base, optimista, pesimista, etc.) de
        demanda, lead time y política de inventario.
      </p>

      <div className="bg-gray-800 rounded-lg p-4">
        {/* Más adelante: formulario/tabla de escenarios */}
        <p className="text-gray-500 text-sm">
          Placeholder: configuración de escenarios DRP.
        </p>
      </div>
    </div>
  );
}
