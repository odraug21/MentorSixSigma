// src/pages/Admin/AdminDashboard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold text-indigo-400 mb-6">
        Panel de Administración - MentorSuites
      </h1>
      <p className="text-gray-300 mb-10 text-center max-w-2xl">
        Desde aquí puedes gestionar empresas, usuarios y roles del sistema.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl w-full">
        <button
          onClick={() => navigate("/admin/empresas")}
          className="bg-blue-600 hover:bg-blue-700 py-6 rounded-lg text-xl font-semibold transition"
        >
          🏢 Empresas
        </button>
        <button
          onClick={() => navigate("/admin/usuarios")}
          className="bg-green-600 hover:bg-green-700 py-6 rounded-lg text-xl font-semibold transition"
        >
          👥 Usuarios
        </button>
        <button
          onClick={() => navigate("/admin/roles")}
          className="bg-purple-600 hover:bg-purple-700 py-6 rounded-lg text-xl font-semibold transition"
        >
          🧩 Roles
        </button>
      </div>
    </div>
  );
}


