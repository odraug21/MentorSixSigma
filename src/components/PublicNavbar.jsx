// src/components/PublicNavbar.jsx
import React from "react";
import { Link } from "react-router-dom";
import logoprincipal from "../img/logoppl2.png";

const PublicNavbar = () => {
  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-gray-900 text-white shadow-md">
      {/* Logo */}
      <Link to="/" className="flex items-center space-x-3">
        <img src={logoprincipal} alt="MentorSuites" className="h-10 w-auto" />
        <span className="text-xl font-semibold text-indigo-400">MentorSuites</span>
      </Link>

      {/* Botones */}
      <div className="flex items-center gap-4">
        <Link
          to="/login"
          className="px-5 py-2 rounded-md bg-gray-800 hover:bg-gray-700 transition"
        >
          Iniciar sesión
        </Link>
        
      </div>
    </nav>
  );
};

export default PublicNavbar;
