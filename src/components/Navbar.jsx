// src/components/Navbar.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logoprincipal from "../img/logoppl2.png";

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Detectar sesión activa al cargar
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Cerrar sesión con confirmación
  const handleLogout = () => {
    const confirmLogout = window.confirm("¿Deseas cerrar sesión y volver al inicio?");
    if (confirmLogout) {
      localStorage.removeItem("user");
      setUser(null);
      navigate("/", { replace: true });
    }
  };

  return (
    <nav className="flex justify-between items-center p-4 bg-gray-800 shadow-lg text-white">
      {/* LOGO */}
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/inicio")}>
        <img
          src={logoprincipal}
          alt="A3 Mentor Logo"
          className="h-16 w-auto bg-white/10 p-1 rounded-md backdrop-blur-sm"
        />
        
      </div>

      {/* MENÚ PRINCIPAL */}
      <ul className="flex space-x-6 items-center">
      
        {!user && (
          <>
            <li><Link to="/login" className="hover:text-indigo-300">Login</Link></li>
            <li><Link to="/register" className="hover:text-indigo-300">Registro</Link></li>
          </>
        )}
      </ul>

      {/* ESTADO DE USUARIO */}
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
