// src/pages/5S/5sIntro.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import logo5s from "../../img/logo5s.png";

export default function FiveSIntro() {
  const navigate = useNavigate();

  const cincoS = [
    { s: "Seiri", nombre: "Clasificar", descripcion: "Eliminar lo innecesario del área de trabajo." },
    { s: "Seiton", nombre: "Ordenar", descripcion: "Organizar los elementos necesarios de forma visible y accesible." },
    { s: "Seiso", nombre: "Limpiar", descripcion: "Mantener el entorno limpio para detectar anormalidades." },
    { s: "Seiketsu", nombre: "Estandarizar", descripcion: "Definir reglas visuales que mantengan el orden y limpieza." },
    { s: "Shitsuke", nombre: "Disciplina", descripcion: "Fomentar el hábito y compromiso con los estándares establecidos." },
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


      <div className="flex justify-center gap-4">
        <button
          onClick={() => navigate("/5s/proyectos")}
          className="bg-green-600 px-4 py-3 rounded-lg hover:bg-green-700 font-semibold"
        >
          Ir a mis proyectos 5S
        </button>
        <button
          onClick={() => navigate("/inicio")}
          className="bg-gray-700 px-4 py-3 rounded-lg hover:bg-gray-600 font-semibold"
        >
          Volver al menú principal
        </button>
      </div>
    </div>
  );
}

