// src/pages/OEE/OeeIntro.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function OeeIntro() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-indigo-400 mb-6 text-center">
          📈 Eficiencia Global del Equipo (OEE)
        </h1>
        <p className="text-gray-300 leading-relaxed mb-6 text-justify">
          El <strong>OEE (Overall Equipment Effectiveness)</strong> es un indicador
          que mide la eficiencia real de un equipo, línea o proceso productivo,
          combinando tres factores fundamentales:
        </p>

        <ul className="list-disc pl-6 text-gray-200 space-y-2 mb-6">
          <li>
            <strong>Disponibilidad:</strong> mide cuánto del tiempo planificado
            estuvo el equipo realmente operativo.
          </li>
          <li>
            <strong>Rendimiento:</strong> mide la velocidad real del proceso en
            comparación con la teórica.
          </li>
          <li>
            <strong>Calidad:</strong> mide la proporción de productos buenos frente
            al total producido.
          </li>
        </ul>

        <p className="text-gray-300 mb-8">
          <strong>Fórmula general:</strong>
        </p>
        <div className="bg-gray-800 p-4 rounded-lg text-center text-xl font-semibold text-yellow-400 mb-8">
          OEE = (Disponibilidad × Rendimiento × Calidad) / 10000
        </div>

        <p className="text-gray-400 mb-6">
          Un OEE del <strong>85%</strong> o superior se considera un nivel de clase mundial.
          Puedes calcularlo a continuación en el módulo interactivo.
        </p>

        <div className="flex gap-3 justify-center">
          <button
            onClick={() => navigate("/oee/builder")}
            className="bg-indigo-600 px-6 py-2 rounded hover:bg-indigo-700 transition"
          >
            Ir al Calculador ➜
          </button>

          <button
           onClick={() => navigate("/inicio")}
           className="bg-gray-600 px-6 py-2 rounded hover:bg-gray-700 transition"
          >
          Volver al menú principal
          </button>

        </div>
      </div>
    </div>
  );
}
