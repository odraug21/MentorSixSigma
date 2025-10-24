// src/pages/Inicio.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

import logo5s from "../img/logo5s.png";
import logogemba from "../img/logogamba.png";
import logosixsigma from "../img/logosixsigma.png";
import logolean from "../img/logolean.png";
import logokaizen from "../img/logokaizen.png";
import logovsm from "../img/logovsm.png";
import logosipoc from "../img/logosipoc.png";

export default function Inicio() {
  const navigate = useNavigate();

  const opciones = [
    { title: "📘 A3 Solución de Problema", path: "/create-a3", color: "bg-blue-600", img: logosixsigma },
    { title: "🧭 5S - Organización", path: "/5s/intro", color: "bg-green-600", img: logo5s },
    { title: "🚶 Gemba Walk", path: "/gemba/plan", color: "bg-yellow-500", img: logogemba },
    { title: "⚙️ OEE", path: "/oee", color: "bg-indigo-600", img: logolean },
    { title: "🚀 OOE", path: "/ooe", color: "bg-purple-600", img: logolean },
    { title: "🏭 TEEP", path: "/teep", color: "bg-teal-600", img: logolean },
    { title: "💡 Kaizen", path: "/kaizen", color: "bg-pink-600", img: logokaizen },
    { title: "📊 VSM", path: "/vsm", color: "bg-orange-600", img: logovsm },
    { title: "🔗 SIPOC", path: "/sipoc", color: "bg-red-600", img: logosipoc },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-6">
      
      <h1 className="text-4xl font-bold mb-3 text-indigo-400 text-center">
        Panel de Excelencia Operacional
      </h1>
      <p className="text-gray-400 mb-10 text-center text-lg max-w-2xl">
        Selecciona la herramienta con la que deseas trabajar
      </p>

      {/* GRID DE OPCIONES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 w-full max-w-6xl">
        {opciones.map((op, index) => (
          <div
            key={index}
            onClick={() => navigate(op.path)}
            className={`${op.color} hover:opacity-90 rounded-xl py-8 px-4 text-xl font-semibold shadow-lg flex flex-col items-center justify-center cursor-pointer transform transition-transform hover:scale-105`}
          >
            <img
              src={op.img}
              alt={op.title}
              className="h-24 w-auto mb-4 object-contain drop-shadow-lg"
            />
            <span>{op.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

