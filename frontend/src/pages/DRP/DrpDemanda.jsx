// src/pages/DRP/DrpDemanda.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function DrpDemanda() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-cyan-400">
          📈 Demanda histórica / forecast
        </h1>
        <button
          onClick={() => navigate("/drp/intro")}
          className="bg-gray-700 hover:bg-gray-800 px-4 py-2 rounded"
        >
          Menú DRP
        </button>
      </div>

      <p className="text-gray-300 mb-4">
        En esta vista cargaremos y analizaremos las series históricas de demanda
        (idealmente 3 años) para construir el plan base de reposición.
      </p>

      <div className="bg-gray-800 rounded-lg p-4">
        {/* Aquí luego: upload CSV, tabla, gráficos, etc. */}
        <p className="text-gray-500 text-sm">
          Placeholder: carga y análisis de demanda.
        </p>
      </div>
    </div>
  );
}
