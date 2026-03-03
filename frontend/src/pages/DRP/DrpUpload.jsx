import React from "react";
import { useNavigate } from "react-router-dom";

export default function DrpUpload() {
  const navigate = useNavigate();

  const modules = [
    {
      title: "📈 Demanda",
      desc: "Carga históricos de ventas para construir la demanda base.",
      path: "/drp/demanda",
      color: "bg-indigo-600",
    },
    {
      title: "📦 Logística SKU",
      desc: "Carga parámetros logísticos: pallet, lote, lead time, stock seguridad.",
      path: "/drp/sku-logistics",
      color: "bg-blue-600",
    },
    {
      title: "🏬 Inventario",
      desc: "Carga snapshot de stock ERP disponible para planificación.",
      path: "/drp/inventory",
      color: "bg-emerald-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold text-cyan-400 mb-3 text-center">
        DRP Data Hub
      </h1>

      <p className="text-center text-gray-300 mb-8 max-w-3xl mx-auto">
        Centraliza la carga de información base del DRP: demanda histórica,
        parámetros logísticos y snapshot de inventario.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {modules.map((m, i) => (
          <div
            key={i}
            onClick={() => navigate(m.path)}
            className={`${m.color} cursor-pointer p-6 rounded-2xl shadow-lg transform hover:scale-105 hover:shadow-2xl transition duration-300`}
          >
            <h2 className="text-xl font-semibold mb-2">{m.title}</h2>
            <p className="text-sm text-gray-100">{m.desc}</p>
            <div className="mt-4 text-right text-sm opacity-90">
              <span className="underline">Ingresar</span> →
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}