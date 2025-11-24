// src/layouts/ProtectedLayout.jsx
import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";

export default function ProtectedLayout() {
  const { usuario, cargando } = useAuth();

  // ⏳ Mientras se reconstruye la sesión desde localStorage
  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p className="text-gray-400 text-lg">Restaurando sesión...</p>
      </div>
    );
  }

  // ❌ Si no hay usuario, redirige al login
  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Si el usuario existe, renderizamos la app
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
