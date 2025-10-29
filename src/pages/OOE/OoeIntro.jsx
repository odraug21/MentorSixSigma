import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function OoeIntro() {
     const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      {/* 🔹 Encabezado */}
      <motion.h1
        className="text-4xl font-bold text-indigo-400 mb-6 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        ⚙️ OOE – Overall Operational Effectiveness
      </motion.h1>

      {/* 🔹 Introducción general */}
      <motion.div
        className="max-w-4xl mx-auto text-lg leading-relaxed text-gray-300 mb-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <p className="mb-4">
          El <strong>OOE (Overall Operational Effectiveness)</strong> mide la
          eficiencia total de una operación, considerando no sólo el desempeño
          del equipo (como el OEE), sino también factores externos que impactan
          la disponibilidad operativa general: personal, materiales,
          planificación y logística.
        </p>
        <p>
          Mientras que el <strong>OEE</strong> se centra en la{" "}
          <em>eficiencia del equipo</em>, el <strong>OOE</strong> amplía la
          visión a la <em>efectividad operacional global</em> de la planta o
          línea de producción.
        </p>
      </motion.div>

      {/* 🔹 Relación visual OEE - OOE - TEEP */}
      <motion.div
        className="max-w-5xl mx-auto bg-gray-800 p-6 rounded-xl shadow-lg mb-12"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-2xl text-indigo-300 font-semibold mb-4">
          📈 Relación entre OEE, OOE y TEEP
        </h2>

        <ul className="list-disc pl-6 text-gray-300 space-y-2">
          <li>
            <strong>OEE</strong> mide la eficiencia de las máquinas durante el
            tiempo planificado de producción.
          </li>
          <li>
            <strong>OOE</strong> incluye tiempos no planificados, paradas por
            materiales, recursos o personal.
          </li>
          <li>
            <strong>TEEP</strong> (Total Effective Equipment Performance)
            considera el tiempo total calendario (24/7), incluyendo fines de
            semana y paradas programadas.
          </li>
        </ul>

        <div className="text-center mt-6">
          <p className="text-gray-400 italic">
            “OOE es el puente entre la eficiencia del equipo (OEE) y la
            eficiencia global del sistema (TEEP).”
          </p>
        </div>
      </motion.div>

{/* 🔹 Fórmula de cálculo */}
<motion.div
  className="max-w-3xl mx-auto bg-gray-800 p-6 rounded-xl shadow-lg text-center"
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.6 }}
>
  <h2 className="text-2xl font-semibold text-indigo-400 mb-4">
    📘 Fórmula del OOE
  </h2>

  {/* 🔹 Fórmula renderizada directamente */}
  <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 mb-4 inline-block text-white text-xl font-serif">
    <span className="mr-2 font-bold">OOE =</span>
    <span className="align-middle">
      <div className="flex flex-col items-center inline-block mx-2">
        <span className="border-b border-white px-3">
          Tiempo Operativo Total
        </span>
        <span className="px-3 text-sm mt-1">
          Tiempo Disponible Planificado
        </span>
      </div>
    </span>
    <span className="ml-2">× 100</span>
  </div>

  <p className="text-gray-300 mt-4">
    Donde: <br />
    <strong>Tiempo Operativo Total</strong> = Horas efectivas de operación real. <br />
    <strong>Tiempo Disponible Planificado</strong> = Horas programadas para producción.
  </p>

  <div className="mt-6 text-gray-400 text-sm">
    <p>
      Ejemplo: Si una línea tenía 8h planificadas, pero sólo operó 6.5h efectivas, entonces:
    </p>
    <p className="text-yellow-300 font-semibold mt-2">
      OOE = (6.5 / 8) × 100 = 81.25%
    </p>
  </div>
</motion.div>


      {/* 🔹 Navegación sugerida */}
      <div className="flex gap-3 justify-center">
        
  <button
            onClick={() => navigate("/ooe/builder")}
            className="bg-indigo-600 px-6 py-2 rounded hover:bg-indigo-700 transition"
          >
            Registro Diario
          </button>

          <button
           onClick={() => navigate("/inicio")}
           className="bg-gray-600 px-6 py-3 rounded-lg text-lg hover:bg-indigo-700 transition"
          >
          Volver al menú principal
          </button>
      </div>
    </div>
  );
}
