// src/components/Spinner.jsx
import React from "react";

export default function Spinner({ text = "Cargando entorno seguro..." }) {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-gray-300">
      <div className="relative">
        {/* Anillo principal */}
        <div className="w-16 h-16 border-4 border-gray-600 border-t-cyan-400 rounded-full animate-spin"></div>

        {/* Brillo interno */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 bg-cyan-500/10 rounded-full blur-md"></div>
        </div>
      </div>

      <p className="mt-6 text-sm font-medium text-gray-400 animate-pulse">
        {text}
      </p>
    </div>
  );
}
