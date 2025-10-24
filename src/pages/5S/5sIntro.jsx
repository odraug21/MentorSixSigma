// src/pages/5S/5sIntro.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import logo5s from "../../img/logo5s.png";

export default function FiveSIntro() {
  const navigate = useNavigate();

  const etapas = [
    { titulo: "Implementación", path: "/5s/implementacion", color: "bg-green-600" },
    { titulo: "Auditoría", path: "/5s/auditoria", color: "bg-yellow-500" },
    { titulo: "Seguimiento", path: "/5s/seguimiento", color: "bg-blue-600" },
  ];

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen flex flex-col items-center">
      <img
        src={logo5s}
        alt="Logo 5S"
        className="h-24 w-auto mb-4 drop-shadow-lg"
      />

      
      <p className="text-gray-300 max-w-3xl text-center mb-10">
        Las <strong>5S</strong> son una metodología japonesa que busca mejorar la
        organización, la limpieza y la disciplina en el lugar de trabajo.
        Su nombre proviene de las iniciales de cinco palabras japonesas:
      </p>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-10 max-w-5xl">
        {[
          { s: "Seiri", desc: "Clasificar - Separar lo necesario de lo innecesario" },
          { s: "Seiton", desc: "Ordenar - Ubicar todo en su lugar correcto" },
          { s: "Seiso", desc: "Limpiar - Mantener el área limpia y libre de suciedad" },
          { s: "Seiketsu", desc: "Estandarizar - Mantener y mejorar las condiciones" },
          { s: "Shitsuke", desc: "Disciplina - Fomentar el hábito y compromiso" },
        ].map((item, index) => (
          <div
            key={index}
            className="bg-gray-800 p-4 rounded-lg shadow hover:scale-105 transition-transform duration-300 text-center"
          >
            <h2 className="text-xl font-bold text-green-400 mb-2">{item.s}</h2>
            <p className="text-gray-400 text-sm">{item.desc}</p>
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-semibold text-indigo-400 mb-4">Selecciona una etapa</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl">
        {etapas.map((etapa, i) => (
          <button
            key={i}
            onClick={() => navigate(etapa.path)}
            className={`${etapa.color} px-6 py-4 rounded-lg font-semibold hover:opacity-90 shadow-lg transform hover:scale-105 transition`}
          >
            {etapa.titulo}
          </button>
        ))}
      </div>

      <div className="mt-10 max-w-3xl text-gray-300 text-center">
        <h3 className="text-xl font-semibold text-green-400 mb-2">Ejemplo práctico</h3>
        <p>
          Imagina una planta de producción donde cada herramienta tiene su lugar designado.
          Con la metodología 5S, los equipos eliminan elementos innecesarios, marcan las zonas
          de trabajo, limpian diariamente, documentan estándares visuales y fomentan la disciplina
          para mantener el orden.
        </p>
      </div>
    </div>
  );
}

