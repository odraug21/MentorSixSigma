// src/pages/Inicio.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../config/env";

// imágenes
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

  useEffect(() => {
    const cargarModulos = async () => {
      try {
        const res = await axios.get(
          `${API_BASE}/api/modulos/roles-modulos/permitidos/usuario`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setModulosPermitidos(res.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    if (token) cargarModulos();
  }, [token]);

  const opciones = [
    // ================= LEAN =================
    { grupo: "LEAN", nombre: "A3", title: "📘 A3", path: "/a3/intro", color: "bg-blue-600", img: logosixsigma },
    { grupo: "LEAN", nombre: "5S", title: "🧭 5S", path: "/5s/intro", color: "bg-green-600", img: logo5s },
    { grupo: "LEAN", nombre: "Gemba Walk", title: "🚶 Gemba", path: "/gemba/intro", color: "bg-yellow-500", img: logogemba },
    { grupo: "LEAN", nombre: "OEE", title: "⚙️ OEE", path: "/oee/intro", color: "bg-indigo-600", img: logolean },
    { grupo: "LEAN", nombre: "OOE", title: "🚀 OOE", path: "/ooe/intro", color: "bg-purple-600", img: logolean },
    { grupo: "LEAN", nombre: "TEEP", title: "🏭 TEEP", path: "/teep/intro", color: "bg-teal-600", img: logolean },
    { grupo: "LEAN", nombre: "KPI", title: "💡 KPI LEAN", path: "/kpi/dashboard", color: "bg-pink-600", img: logolean },
    { grupo: "LEAN", nombre: "VSM", title: "📊 VSM", path: "/vsm/intro", color: "bg-orange-600", img: logovsm },
    { grupo: "LEAN", nombre: "SIPOC", title: "🔗 SIPOC", path: "/sipoc/intro", color: "bg-red-600", img: logosipoc },

    // ================= PLANNING =================
    { grupo: "PLANNING", nombre: "DRP", title: "📦 DRP", path: "/drp/intro", color: "bg-cyan-600", img: logolean },
    { grupo: "PLANNING", nombre: "MTCP", title: "🧠 MTCP", path: "/mtcp/dashboard", color: "bg-red-700", img: logolean },

    // ================= WMS =================
    { grupo: "WMS", nombre: "Compras", title: "📦 Compras", path: "/core/purchasing", color: "bg-gray-700", img: logolean },
  ];

  const accesos = opciones.filter((op) =>
    modulosPermitidos.some((m) => {
      return (
        m.nombre?.toLowerCase() === op.nombre.toLowerCase() ||
        m.ruta?.toLowerCase().trim() === op.path.toLowerCase().trim()
      );
    })
  );

  const renderGrupo = (titulo) => {
    const grupoItems = accesos.filter((op) => op.grupo === titulo);

    if (grupoItems.length === 0) return null;

    return (
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-indigo-400 mb-6">
          {titulo}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {grupoItems.map((op, idx) => (
            <div
              key={idx}
              onClick={() => navigate(op.path)}
              className={`${op.color} cursor-pointer p-6 rounded-2xl shadow-lg hover:scale-105 transition`}
            >
              <div className="flex flex-col items-center text-center">
                <img src={op.img} alt={op.nombre} className="h-20 mb-4 rounded-lg" />
                <h3 className="text-lg font-semibold">{op.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-10">

      <h1 className="text-3xl font-bold text-indigo-400 mb-4 text-center">
        Plataforma Operacional Integrada
      </h1>

      <p className="text-center text-gray-400 mb-12">
        LEAN • Planning • WMS • Inteligencia Operacional
      </p>

      {renderGrupo("LEAN")}
      {renderGrupo("PLANNING")}
      {renderGrupo("WMS")}

      {accesos.length === 0 && (
        <p className="text-center text-gray-400 mt-10">
          No tienes módulos asignados.
        </p>
      )}
    </div>
  );
}