// src/components/Features.jsx
import React from "react";

const Features = () => {
  return (
    <section className="py-20 px-6 bg-gray-900 text-white">
      <h2 className="text-4xl font-bold text-center mb-12 text-indigo-400">Características</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        <div>
          <h3 className="text-2xl font-semibold mb-2">Registro rápido</h3>
          <p>Crea A3 en minutos con formularios sencillos</p>
        </div>
        <div>
          <h3 className="text-2xl font-semibold mb-2">Visualización clara</h3>
          <p>Todos tus A3 organizados en una sola vista</p>
        </div>
        <div>
          <h3 className="text-2xl font-semibold mb-2">Seguimiento</h3>
          <p>Mide resultados y mejora procesos constantemente</p>
        </div>
      </div>
    </section>
  );
};

export default Features;
