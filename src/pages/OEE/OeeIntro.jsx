// src/pages/OEE/OeeIntro.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

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

        {/* 🔹 Bloque fórmula estándar tipo motion */}
        <motion.div
          className="max-w-5xl mx-auto bg-gray-800 p-6 rounded-xl shadow-lg text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-2xl font-semibold text-indigo-400 mb-4">
            📘 Fórmula del OEE
          </h2>

          {/* 🔹 Fórmula renderizada horizontal */}
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 mb-6 inline-flex flex-wrap justify-center items-center gap-x-3 text-white text-lg font-serif w-full max-w-4xl mx-auto">
            <span className="font-bold">OEE =</span>

            {/* Fracción principal */}
            <div className="flex flex-col items-center mx-3">
              <span className="border-b border-white px-3 text-base">
                Disponibilidad × Rendimiento × Calidad
              </span>
              <span className="px-3 text-sm mt-1 text-gray-300">
                Dividido entre 10000
              </span>
            </div>

            <span className="text-yellow-400 text-lg mx-2">× 100</span>
          </div>

          <p className="text-gray-300 mt-4">
            Donde: <br />
            <strong>Disponibilidad</strong> = Tiempo Operativo / Tiempo Planificado. <br />
            <strong>Rendimiento</strong> = Producción Real / Producción Teórica. <br />
            <strong>Calidad</strong> = Unidades Buenas / Unidades Totales.
          </p>

          <div className="mt-6 text-gray-400 text-base">
            <p>
              Ejemplo: Si la disponibilidad es 90%, el rendimiento 85% y la calidad 98%:
            </p>
            <p className="text-yellow-300 font-semibold mt-2">
              OEE = (90 × 85 × 98) / 10000 = 74.97%
            </p>
          </div>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-4 mt-10">
          <button
            onClick={() => navigate("/oee/builder")}
            className="bg-indigo-600 px-6 py-2 rounded-lg text-lg hover:bg-indigo-700 transition"
          >
            Ir al Calculador ➜
          </button>

          <button
            onClick={() => navigate("/inicio")}
            className="bg-gray-600 px-6 py-2 rounded-lg text-lg hover:bg-gray-700 transition"
          >
            Volver al menú principal
          </button>
        </div>
      </div>
    </div>
  );
}

