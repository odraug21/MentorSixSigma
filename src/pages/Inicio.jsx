// src/pages/Inicio.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import logoprincipal from "../img/logoppl2.png";

export default function Inicio() {
  const navigate = useNavigate();

  const opciones = [
    { title: "🧭 5S", path: "/create-5s", color: "bg-green-600" },
    { title: "🚶 Gemba Walk", path: "/create-gemba", color: "bg-yellow-600" },
    { title: "📘 A3", path: "/create-a3", color: "bg-blue-600" },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-6">
      <img
        src={logoprincipal}
        alt="Logo Mentor"
        className="h-24 w-auto mb-6 cursor-pointer hover:scale-105 transition-transform duration-300"
        onClick={() => navigate("/")}
      />

      <h1 className="text-3xl font-bold mb-8 text-indigo-400">
        Selecciona el tipo de proyecto
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        {opciones.map((op) => (
          <button
            key={op.title}
            onClick={() => navigate(op.path)}
            className={`${op.color} hover:opacity-90 rounded-lg py-6 text-xl font-semibold shadow-lg transform transition-transform hover:scale-105`}
          >
            {op.title}
          </button>
        ))}
      </div>
    </div>
  );
}
