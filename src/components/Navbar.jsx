// src/components/Navbar.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logoprincipal from "../img/logoppl2.png";

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // 🔹 Detectar sesión activa
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser && storedUser !== "undefined" && storedUser !== "null") {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.warn("Error al parsear usuario:", e);
      }
    }
  }, []);

  // 🔹 Cerrar sesión con confirmación
  const handleLogout = () => {
    const confirmLogout = window.confirm("¿Deseas cerrar sesión y volver al login?");
    if (confirmLogout) {
      localStorage.clear();
      navigate("/login", { replace: true });
    }
  };

  // 🔹 Menú visible según el rol
  const renderMenu = () => {
    if (!user) return null;

    const rol = user.rol;

    if (rol === "SuperAdmin") {
      return (
        <>
          <Link to="/inicio" className="hover:text-indigo-300">Inicio</Link>
          <Link to="/admin/empresas" className="hover:text-indigo-300">Empresas</Link>
          <Link to="/admin/usuarios" className="hover:text-indigo-300">Usuarios</Link>
          <Link to="/admin/roles" className="hover:text-indigo-300">Roles</Link>
        </>
      );
    }

    if (rol === "AdminEmpresa") {
      return (
        <>
          <Link to="/inicio" className="hover:text-indigo-300">Inicio</Link>
          <Link to="/admin/usuarios" className="hover:text-indigo-300">Usuarios</Link>
        </>
      );
    }

    // Usuario estándar
    return (
      <>
        <Link to="/inicio" className="hover:text-indigo-300">Inicio</Link>
        <Link to="/create-a3" className="hover:text-indigo-300">A3</Link>
        <Link to="/5s/intro" className="hover:text-indigo-300">5S</Link>
        <Link to="/gemba/intro" className="hover:text-indigo-300">Gemba</Link>
        <Link to="/vsm/intro" className="hover:text-indigo-300">VSM</Link>
        <Link to="/sipoc/intro" className="hover:text-indigo-300">SIPOC</Link>
      </>
    );
  };

  return (
    <nav className="flex justify-between items-center p-4 bg-gray-800 shadow-lg text-white">
      {/* 🔷 LOGO */}
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

      {/* 🔹 MENÚ CENTRAL */}
      <ul className="flex space-x-6 items-center text-sm font-medium">
        {renderMenu()}
      </ul>

      {/* 🧠 ESTADO DE USUARIO */}
      <div className="flex items-center gap-3">
        {user ? (
          <>
            <div className="flex items-center gap-2 bg-gray-700 px-3 py-1 rounded-md">
              <span className="text-green-400 text-sm">🟢 En línea</span>
              <span className="text-gray-300 font-medium text-sm truncate max-w-[150px]">
                {user.email || "Usuario"}
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
};

export default Navbar;
