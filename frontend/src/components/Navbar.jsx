// src/components/Navbar.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import logoprincipal from "../img/logoppl2.png";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // 🔹 Logout
  const handleLogout = () => {
    if (window.confirm("¿Deseas cerrar sesión?")) {
      logout();
      navigate("/", { replace: true });
    }
  };

  // 🔹 Menú por rol
  const renderMenu = () => {
    if (!user) return null;

    const rol = user.rol;

    switch (rol) {
      case "SuperAdmin":
        return (
          <>
            <Link to="/inicio" className="hover:text-indigo-300">Inicio</Link>
            <Link to="/admin/empresas" className="hover:text-indigo-300">Empresas</Link>
            <Link to="/admin/usuarios" className="hover:text-indigo-300">Usuarios</Link>
            <Link to="/admin/roles" className="hover:text-indigo-300">Roles</Link>
            <Link to="/admin/modulos" className="hover:text-indigo-300">Módulos</Link>
            <Link to="/admin/consultas" className="hover:text-indigo-300">Consultas</Link>
            <span className="ml-3 text-sm text-yellow-400 font-semibold">🔐 SuperAdmin</span>
          </>
        );

      case "AdminEmpresa":
        return (
          <>
            <Link to="/inicio" className="hover:text-indigo-300">Inicio</Link>
            <Link to="/admin/usuarios" className="hover:text-indigo-300">Usuarios</Link>
            <span className="ml-3 text-sm text-blue-300 font-semibold">👔 Admin</span>
          </>
        );

      default:
        return (
          <>
            <Link to="/inicio" className="hover:text-indigo-300">Inicio</Link>
          </>
        );
    }
  };

  return (
    <nav className="flex justify-between items-center p-4 bg-gray-800 shadow-lg text-white">

      {/* LOGO */}
      <div
        className="flex items-center gap-3 cursor-pointer"
        onClick={() => navigate("/inicio")}
      >
        <img
          src={logoprincipal}
          alt="MentorSuites"
          className="h-14 w-auto bg-white/10 p-1 rounded-md"
        />
      </div>

      {/* MENÚ */}
      <ul className="flex space-x-6 items-center text-sm font-medium">
        {renderMenu()}
      </ul>

      {/* USUARIO */}
      <div className="flex items-center gap-3">
        {user ? (
          <>
            <div className="flex items-center gap-2 bg-gray-700 px-3 py-1 rounded-md">
              <span className="text-green-400 text-sm">🟢 En línea</span>
              <span className="text-gray-300 font-medium text-sm truncate max-w-[150px]">
                {user.email}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
            >
              Salir
            </button>
          </>
        ) : (
          <span className="text-sm text-gray-400">🔴 Desconectado</span>
        )}
      </div>

    </nav>
  );
}
