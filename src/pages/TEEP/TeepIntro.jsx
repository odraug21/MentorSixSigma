// src/pages/TEEP/TeepIntro.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function TeepIntro() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl mx-auto"
      >
        <h1 className="text-3xl font-bold text-indigo-400 text-center mb-6">
          ⚙️ Introducción al TEEP (Total Effective Equipment Performance)
        </h1>

        <p className="text-gray-300 mb-6">
          El <strong>TEEP</strong> mide la eficiencia total considerando el tiempo calendario completo
          (24 horas, 7 días a la semana). Es el indicador más amplio dentro del trinomio{" "}
          <strong>OEE → OOE → TEEP</strong>, permitiendo conocer cuánto potencial productivo se
          utiliza realmente del total de tiempo disponible.
        </p>

        {/* 🔹 Fórmula general del TEEP (alineada como OOE) */}
<motion.div
  className="max-w-5xl mx-auto bg-gray-800 p-6 rounded-xl shadow-lg text-center"
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.5 }}
>
  <h2 className="text-2xl font-semibold text-yellow-400 mb-4 flex items-center justify-center gap-2">
    📘 <span>Fórmula general del TEEP</span>
  </h2>

{/* 🔹 Fórmula renderizada horizontal (alineación precisa) */}
<div className="bg-gray-900 border border-gray-700 rounded-lg p-6 mb-5 text-white text-base font-serif flex justify items-center flex">
  <span className="font-bold mr-2">TEEP =</span>

  {/* 🔸 Disponibilidad */}
  <div className="flex flex-col items-center text-center">
    <span className="border-b border-white px-3 text-base">Tiempo Operativo</span>
    <span className="px-3 text-sm text-gray-300 mt-1">Tiempo Planificado</span>
  </div>

  <span className="text-yellow-400 text-lg">×</span>

  {/* 🔸 Rendimiento */}
  <div className="flex flex-col items-center text-center">
    <span className="border-b border-white px-3 text-base">Producción Real</span>
    <span className="px-3 text-sm text-gray-300 mt-1">Producción Teórica</span>
  </div>

  <span className="text-yellow-400 text-lg">×</span>

  {/* 🔸 Calidad */}
  <div className="flex flex-col items-center text-center">
    <span className="border-b border-white px-3 text-base">Unidades Buenas</span>
    <span className="px-3 text-sm text-gray-300 mt-1">Unidades Totales</span>
  </div>

  <span className="text-yellow-400 text-lg">×</span>

  {/* 🔸 Utilización */}
  <div className="flex flex-col items-center text-center">
    <span className="border-b border-white px-3 text-base">Tiempo Planificado</span>
    <span className="px-3 text-sm text-gray-300 mt-1">Tiempo Calendario</span>
  </div>

  <span className="text-yellow-400 text-lg ml-2">× 100</span>
</div>



  {/* 🔹 Descripción */}
  <p className="text-gray-300 mt-4 text-sm md:text-base leading-relaxed max-w-3xl mx-auto">
    Donde: <br />
    <strong>Tiempo Operativo</strong> = Minutos efectivos de operación real. <br />
    <strong>Tiempo Planificado</strong> = Minutos programados para producción. <br />
    <strong>Tiempo Calendario</strong> = Total de minutos disponibles (24h × días). <br />
    <strong>Producción Teórica</strong> = Máxima producción posible según estándar. <br />
    <strong>Unidades Buenas</strong> = Productos conformes o sin defectos.
  </p>

  {/* 🔹 Ejemplo práctico */}
  <div className="mt-6 text-gray-400 text-sm border-t border-gray-700 pt-4">
    <p>
      Ejemplo: si una línea tiene 1440 min de calendario, 960 planificados y 720 efectivos, 
      con un rendimiento del 90% y 95% de calidad:
    </p>
    <p className="text-yellow-300 font-semibold mt-2 text-lg">
      TEEP = (720/960) × (0.90) × (0.95) × (960/1440) × 100 = 42.75%
    </p>
  </div>
</motion.div>



        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={() => navigate("/teep/builder")}
            className="bg-green-600 px-6 py-2 rounded hover:bg-green-700 transition"
          >
            Ir al Registro Diario
          </button>
          <button
            onClick={() => navigate("/teep/dashboard")}
            className="bg-indigo-600 px-6 py-2 rounded hover:bg-indigo-700 transition"
          >
            Ver Dashboard
          </button>
                    <button
           onClick={() => navigate("/inicio")}
           className="g-gray-600 px-6 py-2 rounded hover:bg-gray-700 transition"
          >
          Volver al menú principal
          </button>
        </div>
      </motion.div>
    </div>
  );
}
