// src/pages/SIPOC/SipocIntro.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function SipocIntro() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 flex flex-col items-center">
      <h1 className="text-4xl font-bold text-indigo-400 mb-6">📘 Introducción al SIPOC</h1>
      <p className="max-w-3xl text-lg text-gray-300 leading-relaxed mb-10 text-center">
        El diagrama <strong>SIPOC</strong> (Suppliers, Inputs, Process, Outputs, Customers) 
        es una herramienta fundamental en la mejora de procesos. 
        Permite visualizar de manera clara el flujo completo de un proceso y sus interacciones 
        con proveedores y clientes.
      </p>

      <ul className="text-left max-w-2xl list-disc pl-6 mb-8 text-gray-300">
        <li><strong>S:</strong> Suppliers — Proveedores del proceso</li>
        <li><strong>I:</strong> Inputs — Entradas requeridas</li>
        <li><strong>P:</strong> Process — Actividades principales</li>
        <li><strong>O:</strong> Outputs — Resultados del proceso</li>
        <li><strong>C:</strong> Customers — Clientes o usuarios finales</li>
      </ul>
      
      <div className="flex gap-6">
        <button
          onClick={() => navigate("/sipoc/lista")}
          className="bg-indigo-600 px-6 py-3 rounded-lg text-lg hover:bg-indigo-700 transition"
        >
          🚀 Iniciar / Ver SIPOC
        </button>

        <button
          onClick={() => navigate("/inicio")}
          className="bg-gray-600 px-6 py-3 rounded-lg text-lg hover:bg-indigo-700 transition"
        >
          Volver al menú principal
        </button>
      </div>
    </div>
  );

}
