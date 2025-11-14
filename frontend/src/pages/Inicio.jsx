// src/pages/Inicio.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../utils/api"

// tus imágenes
import logosixsigma from "../img/logosixsigma.png";
import logo5s from "../img/logo5s.png";
import logogemba from "../img/logogemba.png";
import logolean from "../img/logolean.png";
import logovsm from "../img/logovsm.png";
import logosipoc from "../img/logosipoc.png";

export default function Inicio() {
  const navigate = useNavigate();
  const [modulosPermitidos, setModulosPermitidos] = useState([]);
  const token = localStorage.getItem("token");

  // 🔹 Cargar módulos permitidos según el rol del usuario
useEffect(() => {
  const cargarModulos = async () => {
    try {
      const res = await axios.get(`${API_BASE}/modulos`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setModulosPermitidos(res.data);
    } catch (err) {
      console.error("❌ Error cargando módulos permitidos:", err);
    }
  };
  cargarModulos();
}, [token]);

  // 🔹 Lista completa de opciones (solo frontend)
  const opciones = [
    { nombre: "A3", title: "📘 A3 Solución de Problema", path: "/a3", color: "bg-blue-600", img: logosixsigma },
    { nombre: "5S", title: "🧭 5S - Organización", path: "/5s/intro", color: "bg-green-600", img: logo5s },
    { nombre: "Gemba Walk", title: "🚶 Gemba Walk", path: "/gemba/intro", color: "bg-yellow-500", img: logogemba },
    { nombre: "OEE", title: "⚙️ OEE", path: "/oee/intro", color: "bg-indigo-600", img: logolean },
    { nombre: "OOE", title: "🚀 OOE", path: "/ooe/intro", color: "bg-purple-600", img: logolean },
    { nombre: "TEEP", title: "🏭 TEEP", path: "/teep/intro", color: "bg-teal-600", img: logolean },
    { nombre: "KPI", title: "💡 Panel LEAN", path: "/kpi/dashboard", color: "bg-pink-600", img: logolean },
    { nombre: "VSM", title: "📊 VSM", path: "/vsm/intro", color: "bg-orange-600", img: logovsm },
    { nombre: "SIPOC", title: "🔗 SIPOC", path: "/sipoc/intro", color: "bg-red-600", img: logosipoc },
  ];

  // 🔹 Filtramos las tarjetas visibles según los módulos del backend
  const accesos = opciones.filter(op =>
    modulosPermitidos.some(m => m.nombre.toLowerCase() === op.nombre.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-10">
      <h1 className="text-3xl font-bold text-indigo-400 mb-4 text-center">
        Panel de Excelencia Operacional
      </h1>
      <p className="text-center text-gray-300 mb-10">
        Selecciona la herramienta con la que deseas trabajar
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {accesos.map((op, idx) => (
          <div
            key={idx}
            onClick={() => navigate(op.path)}
            className={`${op.color} cursor-pointer p-6 rounded-2xl shadow-lg transform hover:scale-105 transition duration-300`}
          >
            <div className="flex flex-col items-center justify-center text-center">
              <img src={op.img} alt={op.nombre} className="h-24 mb-4 rounded-lg" />
              <h2 className="text-xl font-semibold">{op.title}</h2>
            </div>
          </div>
        ))}
      </div>

      {accesos.length === 0 && (
        <p className="text-center text-gray-400 mt-10">
          No tienes módulos asignados para este perfil.
        </p>
      )}
    </div>
  );
}

