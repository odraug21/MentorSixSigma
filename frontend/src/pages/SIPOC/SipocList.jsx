// src/pages/SIPOC/SipocList.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet, apiDelete } from "../../utils/api";

export default function SipocList() {
  const navigate = useNavigate();
  const [proyectos, setProyectos] = useState([]);
  const [cargando, setCargando] = useState(true);

  const cargar = async () => {
    try {
      setCargando(true);
      const resp = await apiGet("/sipoc");
      if (resp?.ok) {
        setProyectos(resp.proyectos || []);
      }
    } catch (err) {
      console.error("❌ Error listando SIPOC:", err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const eliminar = async (id) => {
    if (!window.confirm("¿Eliminar este SIPOC?")) return;
    try {
      await apiDelete(`/sipoc/${id}`);
      cargar();
    } catch (err) {
      console.error("❌ Error eliminando SIPOC:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
        <h1 className="text-3xl font-bold text-indigo-400">📊 SIPOC - Proyectos</h1>
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/sipoc/builder")}
            className="bg-indigo-600 px-4 py-2 rounded hover:bg-indigo-700"
          >
            ➕ Nuevo SIPOC
          </button>
          <button
            onClick={() => navigate("/sipoc/intro")}
            className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-800"
          >
            Menú SIPOC
          </button>
        </div>
      </div>

      {cargando ? (
        <p className="text-gray-300">Cargando SIPOC...</p>
      ) : proyectos.length === 0 ? (
        <p className="text-gray-400">No hay SIPOC creados todavía.</p>
      ) : (
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-700 text-gray-300">
              <tr>
                <th className="p-2 text-left">Nombre</th>
                <th className="p-2 text-left">Proceso</th>
                <th className="p-2 text-left">Responsable</th>
                <th className="p-2 text-left">Fecha</th>
                <th className="p-2 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {proyectos.map((p) => (
                <tr key={p.id} className="border-t border-gray-700">
                  <td className="p-2">{p.nombre}</td>
                  <td className="p-2">{p.proceso || "—"}</td>
                  <td className="p-2">{p.responsable || "—"}</td>
                  <td className="p-2">
                    {p.fecha_creacion
                      ? new Date(p.fecha_creacion).toLocaleString("es-CL")
                      : "—"}
                  </td>
                  <td className="p-2 text-center space-x-2">
                    <button
                      onClick={() => navigate(`/sipoc/builder/${p.id}`)}
                      className="bg-indigo-600 px-2 py-1 rounded hover:bg-indigo-700 text-xs"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => navigate(`/sipoc/resumen/${p.id}`)}
                      className="bg-green-600 px-2 py-1 rounded hover:bg-green-700 text-xs"
                    >
                      Resumen
                    </button>
                    <button
                      onClick={() => eliminar(p.id)}
                      className="bg-red-600 px-2 py-1 rounded hover:bg-red-700 text-xs"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
