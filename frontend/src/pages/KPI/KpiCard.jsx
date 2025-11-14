// src/pages/KPI/KpiCard.jsx
import React from "react";

export default function KpiCard({ titulo, valor, meta }) {
  const porcentaje = Math.min(100, Math.max(0, valor));
  const color =
    porcentaje < 60
      ? "bg-red-600"
      : porcentaje < 85
      ? "bg-yellow-500"
      : "bg-green-600";

  return (
    <div className="bg-gray-800 rounded-xl shadow-lg p-6 text-center border border-gray-700">
      <h3 className="text-lg font-semibold text-indigo-400 mb-2">{titulo}</h3>
      <div className="relative w-full bg-gray-700 h-5 rounded-full overflow-hidden mb-2">
        <div className={`${color} h-full`} style={{ width: `${porcentaje}%` }} />
      </div>
      <p className="text-2xl font-bold text-white">{porcentaje.toFixed(1)}%</p>
      <p className="text-sm text-gray-400">Meta: {meta}%</p>
    </div>
  );
}
