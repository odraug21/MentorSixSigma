// src/pages/DRP/DrpProyectos.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function DrpProyectos() {
  const navigate = useNavigate();

  // Más adelante aquí listamos proyectos DRP desde backend
  const proyectosMock = [];

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-cyan-400">
          📁 Proyectos DRP
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => navigate("/drp/escenarios/nuevo")}
            className="bg-cyan-600 hover:bg-cyan-700 px-4 py-2 rounded"
          >
            ➕ Nuevo proyecto
          </button>
          <button
            onClick={() => navigate("/drp/intro")}
            className="bg-gray-700 hover:bg-gray-800 px-4 py-2 rounded"
          >
            Menú DRP
          </button>
        </div>
      </div>

      {proyectosMock.length === 0 ? (
        <p className="text-gray-400">
          Aún no hay proyectos DRP configurados. Crea uno nuevo para comenzar.
        </p>
      ) : (
        <div className="bg-gray-800 rounded-lg p-4">
          {/* tabla/lista de proyectos (placeholder) */}
        </div>
      )}
    </div>
  );
}
