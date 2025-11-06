// src/components/Sections/SectionB.jsx
import React, { useEffect } from "react";
import IshikawaDiagram from "../IshikawaDiagram";

export default function SectionB({ a3, setA3 }) {
  // 🔹 Exponer setA3 globalmente para el IshikawaDiagram
  useEffect(() => {
    window.setA3Global = setA3;
    return () => { delete window.setA3Global; };
  }, [setA3]);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-indigo-400">
        B. Análisis de Causas (Ishikawa)
      </h2>
      <p className="text-gray-300">
        Registra causas por categoría (6M). Puedes añadir/eliminar causas en cada rama. El problema se edita en la “cabeza”.
      </p>
      <IshikawaDiagram a3={a3} setA3={setA3} />
    </div>
  );
}

