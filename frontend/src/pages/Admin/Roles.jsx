// src/pages/Admin/Roles.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import RolForm from "./components/RolForm";
import { API_BASE } from '../../config/env';// ✅ correcto

export default function Roles() {
  const [roles, setRoles] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [rolSeleccionado, setRolSeleccionado] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const token = localStorage.getItem("token");

  /* 🔹 Cargar roles desde backend */
  const cargarRoles = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/roles`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRoles(res.data);
    } catch (err) {
      console.error("❌ Error cargando roles:", err);
      setMensaje("⚠️ No se pudieron cargar los roles.");
    }
  };

  useEffect(() => {
    cargarRoles();
  }, []);

  /* 🧩 Manejo de formularios */
  const manejarNuevoRol = () => {
    setRolSeleccionado(null);
    setMostrarForm(true);
  };

  const manejarEditarRol = (rol) => {
    setRolSeleccionado(rol);
    setMostrarForm(true);
  };

  const manejarGuardarRol = () => {
    setMostrarForm(false);
    cargarRoles(); // Refrescar tabla
  };

  const manejarCancelar = () => {
    setMostrarForm(false);
    setRolSeleccionado(null);
  };

  /* 🗑️ Eliminar rol */
  const eliminarRol = async (id) => {
    if (!window.confirm("¿Eliminar este rol permanentemente?")) return;
    try {
      await axios.delete(`${API_BASE}/api/roles/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRoles((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error("❌ Error eliminando rol:", err);
      setMensaje("⚠️ No se pudo eliminar el rol.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-indigo-400">Gestión de Roles</h1>
        <button
          onClick={manejarNuevoRol}
          className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-semibold"
        >
          ➕ Nuevo Rol
        </button>
      </div>

      {mensaje && (
        <p className="text-center text-yellow-400 mb-4 font-semibold">{mensaje}</p>
      )}

      {/* 🔹 Formulario de creación / edición */}
      {mostrarForm ? (
        <RolForm
          rolEditando={rolSeleccionado}
          onGuardar={manejarGuardarRol}
          onCancelar={manejarCancelar}
        />
      ) : (
        <>
          {/* 📋 Tabla de roles */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 shadow-lg">
            <h2 className="text-lg font-semibold mb-3 text-indigo-300">
              Roles Existentes
            </h2>

            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-gray-700 text-gray-300">
                <tr>
                  <th className="p-2 border border-gray-600">ID</th>
                  <th className="p-2 border border-gray-600">Nombre</th>
                  <th className="p-2 border border-gray-600">Descripción</th>
                  <th className="p-2 border border-gray-600 text-center">Nivel</th>
                  <th className="p-2 border border-gray-600 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {roles.length > 0 ? (
                  roles.map((r) => (
                    <tr
                      key={r.id}
                      className="border-t border-gray-700 hover:bg-gray-800/60"
                    >
                      <td className="p-2 border border-gray-700">{r.id}</td>
                      <td className="p-2 border border-gray-700 font-semibold text-indigo-400">
                        {r.nombre}
                      </td>
                      <td className="p-2 border border-gray-700">
                        {r.descripcion || "—"}
                      </td>
                      <td className="p-2 border border-gray-700 text-center">
                        {r.nivel || "—"}
                      </td>
                      <td className="p-2 border border-gray-700 text-center flex justify-center gap-2">
                        <button
                          onClick={() => manejarEditarRol(r)}
                          className="bg-yellow-500 hover:bg-yellow-600 px-3 py-1 rounded text-xs text-black"
                        >
                          ✏️ Editar
                        </button>
                        <button
                          onClick={() => eliminarRol(r.id)}
                          className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-xs"
                        >
                          🗑️ Eliminar
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="text-center text-gray-400 p-3 border border-gray-700"
                    >
                      No hay roles registrados aún.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
