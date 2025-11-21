// ============================================================
// 📌 PublicNavbar.jsx
// 🚀 Navbar para páginas públicas (Landing, Login, Register)
// ============================================================

import React from "react";
import { Link, useLocation } from "react-router-dom";
import logoprincipal from "../img/logoppl2.png";

export default function PublicNavbar() {
  const { pathname } = useLocation();

  return (
    <nav className="flex items-center justify-between px-10 py-4 bg-gray-900 text-white shadow-lg border-b border-gray-700">
      
      {/* LOGO */}
      <Link to="/" className="flex items-center gap-3">
        <img
          src={logoprincipal}
          alt="MentorSuites"
          className="h-12 w-auto brightness-200 drop-shadow-md"
        />
        <span className="text-2xl font-semibold text-indigo-400 tracking-wide">
          MentorSuites
        </span>
      </Link>

      {/* MENU DERECHO */}
      <div className="flex items-center gap-5 text-sm font-medium">

        {/* Botón "Inicio sesión" */}
        {pathname !== "/login" && (
          <Link
            to="/login"
            className="px-5 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 transition shadow-md"
          >
            Iniciar sesión
          </Link>
        )}


      </div>

    </nav>
  );
}
