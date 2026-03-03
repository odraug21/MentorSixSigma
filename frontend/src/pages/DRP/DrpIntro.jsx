import React from "react";
import { useNavigate } from "react-router-dom";

export default function DrpIntro() {
  const navigate = useNavigate();

  const opcionesDrp = [

    {
      id: "dataHub",
      title: "🗂 Data Hub",
      desc: "Carga demanda, logística SKU e inventario base del DRP.",
      path: "/drp/upload",
      color: "bg-cyan-700",
    },
    {
      id: "skuLogistics",
      title: "📦 Maestro Logístico SKU",
      desc: "Configura parámetros logísticos, lotes, lead time, pallets y segmentación ABC.",
      path: "/drp/sku-logistics",
      color: "bg-purple-600",
    },

    {
      id: "plan",
      title: "📦 Plan DRP",
      desc: "Ejecuta el motor DRP y gestiona sugerencias de reposición.",
      path: "/drp/plan",
      color: "bg-blue-600",
    },

    {
      id: "dashboard",
      title: "📊 Dashboard DRP",
      desc: "Visualiza cobertura, quiebres y utilización por escenario.",
      path: "/drp/dashboard",
      color: "bg-cyan-600",
    },

    {
      id: "controlTower",
      title: "🧠 Control Tower",
      desc: "Supervisa órdenes, inventario, riesgos y ejecución logística en tiempo real.",
      path: "/drp/control-tower",
      color: "bg-slate-700",
    },

    {
      id: "demanda",
      title: "📈 Demanda",
      desc: "Carga históricos y construye la curva de demanda base.",
      path: "/drp/demanda",
      color: "bg-indigo-600",
    },

    {
      id: "capacidad",
      title: "🏭 Capacidad",
      desc: "Define capacidades por CD / planta y restricciones operativas.",
      path: "/drp/capacidad",
      color: "bg-emerald-600",
    },

    {
      id: "escenarios",
      title: "🧩 Escenarios",
      desc: "Simula distintos planes logísticos y políticas de inventario.",
      path: "/drp/escenarios",
      color: "bg-amber-600",
    },
    
    {
      id: "proyectos",
      title: "🗂 Proyectos DRP",
      desc: "Administra versiones y proyectos de planificación.",
      path: "/drp/proyectos",
      color: "bg-fuchsia-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold text-indigo-400 mb-3 text-center">
        Módulo DRP – Planificación de Requerimientos de Distribución
      </h1>

      <p className="text-center text-gray-300 mb-8 max-w-3xl mx-auto">
        Construye y ejecuta tu modelo de distribución usando históricos de
        demanda, capacidades logísticas y escenarios de planificación.
        Selecciona el módulo con el que deseas trabajar:
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {opcionesDrp.map((op) => (
          <div
            key={op.id}
            onClick={() => navigate(op.path)}
            className={`${op.color} cursor-pointer p-6 rounded-2xl shadow-lg transform hover:scale-105 hover:shadow-2xl transition duration-300`}
          >
            <div className="flex flex-col h-full justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-2">
                  {op.title}
                </h2>
                <p className="text-sm text-gray-100">{op.desc}</p>
              </div>
              <div className="mt-4 text-right text-sm opacity-90">
                <span className="underline">Ingresar</span> →
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
