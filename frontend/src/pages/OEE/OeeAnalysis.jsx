// src/pages/OEE/OeeAnalysis.jsx
import React from "react";

export default function OeeAnalysis() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-indigo-500 mb-4">
        Análisis OEE
      </h1>

      <p className="text-gray-300 mb-6">
        Esta sección permitirá analizar los indicadores resultantes del cálculo
        de OEE, OOE y TEEP. Aquí podrás visualizar datos comparativos, tendencias,
        gráficos y recomendaciones automáticas.
      </p>

      <div className="p-4 bg-slate-800 rounded-xl shadow-lg">
        <p className="text-gray-400">
          Próximamente: Gráficos de eficiencia, disponibilidad, calidad,
          rendimiento y más.
        </p>
      </div>
    </div>
  );
}
