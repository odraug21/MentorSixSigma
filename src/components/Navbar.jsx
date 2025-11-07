// src/components/Navbar.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import logoprincipal from "../img/logoppl2.png";

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [modulosPermitidos, setModulosPermitidos] = useState([]);

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

  // 🔹 Cargar permisos dinámicamente desde backend
  useEffect(() => {
    const cargarPermisos = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await axios.get("http://localhost:5000/api/roles-modulos/permitidos/usuario", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setModulosPermitidos(res.data);
      } catch (err) {
        console.error("❌ Error cargando módulos del usuario:", err);
      }
    };

    cargarPermisos();
  }, []);

  // 🔹 Cerrar sesión
  const handleLogout = () => {
    const confirmLogout = window.confirm("¿Deseas cerrar sesión?");
    if (confirmLogout) {
      localStorage.clear();
      navigate("/", { replace: true });
    }
  };

  // 🔹 Construir menú según módulos permitidos
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
        </>
      );

    case "AdminEmpresa":
      return (
        <>
          <Link to="/inicio" className="hover:text-indigo-300">Inicio</Link>
          <Link to="/admin/usuarios" className="hover:text-indigo-300">Usuarios</Link>
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
};

export default Navbar;

