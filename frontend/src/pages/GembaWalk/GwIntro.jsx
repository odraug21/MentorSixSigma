// src/pages/GembaWalk/GwIntro.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import logogemba from "../../img/logogemba.png"; // ajusta si el logo está en otra ruta

export default function GwIntro() {
  const navigate = useNavigate();

  const opciones = [
    {
      titulo: "Planificación",
      descripcion: "Define el propósito, fecha y participantes del recorrido Gemba.",
      color: "bg-yellow-600 hover:bg-yellow-700",
      ruta: "/gemba/plan",
    },
    {
      titulo: "Ejecución",
      descripcion: "Registra observaciones, hallazgos, buenas prácticas y evidencias.",
      color: "bg-green-600 hover:bg-green-700",
      ruta: "/gemba/ejecucion",
    },
    {
      titulo: "Reporte",
      descripcion: "Genera un informe PDF con hallazgos, fotos y acciones derivadas.",
      color: "bg-indigo-600 hover:bg-indigo-700",
      ruta: "/gemba/reporte",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      {/* Encabezado */}
      <div className="text-center mb-10">
        <img
          src={logogemba}
          alt="Gemba Walk"
          className="w-24 mx-auto mb-4 rounded-lg shadow-lg"
        />
        <h1 className="text-3xl font-bold text-yellow-400 mb-2">
          🚶‍♂️ Gemba Walk
        </h1>
        <p className="text-gray-300 max-w-2xl mx-auto">
          El <strong>Gemba Walk</strong> es una práctica de liderazgo que consiste
          en observar directamente el lugar donde ocurre el trabajo para
          identificar oportunidades de mejora y reforzar la cultura de
          excelencia operacional.
        </p>
      </div>

      {/* Tarjetas */}
      <div className="flex flex-wrap justify-center gap-6 max-w-5xl mx-auto">
        {opciones.map((op, idx) => (
          <div
            key={idx}
            className="bg-gray-800 rounded-xl p-6 w-72 text-center border border-gray-700 shadow-md transition-all duration-200 hover:scale-105"
          >
            <h2 className="text-xl font-bold text-yellow-400 mb-2">
              {op.titulo}
            </h2>
            <p className="text-gray-400 mb-4">{op.descripcion}</p>
            <button
              onClick={() => navigate(op.ruta)}
              className={`${op.color} w-full py-2 rounded-md font-semibold transition-all duration-300`}
            >
              Ir a {op.titulo}
            </button>
          </div>
        ))}
      </div>

      {/* Botones inferiores */}
      <div className="flex justify-center gap-4 mt-10">
        <button
          onClick={() => navigate("/inicio")}
          className="bg-gray-700 hover:bg-gray-800 px-4 py-2 rounded-md"
        >
          Volver al menú principal
        </button>
      </div>
    </div>
  );
}
