// src/pages/Admin/Empresas.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import EmpresasForm from "./components/EmpresasForm";


export default function Empresas() {
  const [empresas, setEmpresas] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const token = localStorage.getItem("token");

  // 🔹 Cargar empresas
  const cargarEmpresas = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/empresas", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmpresas(res.data);
    } catch (err) {
      console.error("❌ Error al obtener empresas:", err);
      setMensaje("⚠️ Error al obtener empresas");
    }
  };

  useEffect(() => {
    cargarEmpresas();
  }, []);

  // 🔹 Eliminar empresa
  const eliminarEmpresa = async (id) => {
    if (!window.confirm("¿Eliminar esta empresa permanentemente?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/empresas/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmpresas(empresas.filter((e) => e.id !== id));
      setMensaje("🗑️ Empresa eliminada correctamente");
      setTimeout(() => setMensaje(""), 3000);
    } catch (err) {
      console.error("❌ Error al eliminar empresa:", err);
      setMensaje("⚠️ No se pudo eliminar la empresa.");
    }
  };

  // 🔹 Editar empresa (abre el formulario con datos)
  const editarEmpresa = (empresa) => {
    setEmpresaSeleccionada(empresa);
    setMostrarFormulario(true);
  };

  // 🔹 Crear nueva empresa (abre formulario vacío)
  const nuevaEmpresa = () => {
    setEmpresaSeleccionada(null);
    setMostrarFormulario(true);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold text-indigo-400 mb-6">
        Gestión de Empresas
      </h1>

      {mensaje && (
        <p className="text-center text-green-400 mb-4 font-semibold">
          {mensaje}
        </p>
      )}

      <button
        onClick={nuevaEmpresa}
        className="mb-6 bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-semibold"
      >
        ➕ Nueva Empresa
      </button>

      {/* Formulario de creación/edición */}
      {mostrarFormulario && (
        <EmpresasForm
          empresa={empresaSeleccionada}
          onCancel={() => setMostrarFormulario(false)}
          onSuccess={() => {
            setMostrarFormulario(false);
            cargarEmpresas();
          }}
        />
      )}

      {/* Tabla de empresas */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-800 rounded-lg overflow-hidden text-sm">
          <thead className="bg-gray-700 text-indigo-300">
            <tr>
              <th className="py-3 px-4 text-left">ID</th>
              <th className="py-3 px-4 text-left">Nombre</th>
              <th className="py-3 px-4 text-left">RUT</th>
              <th className="py-3 px-4 text-left">País</th>
              <th className="py-3 px-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {empresas.map((e) => (
              <tr
                key={e.id}
                className="border-b border-gray-700 hover:bg-gray-800/70"
              >
                <td className="py-2 px-4">{e.id}</td>
                <td className="py-2 px-4">{e.nombre}</td>
                <td className="py-2 px-4">{e.rut}</td>
                <td className="py-2 px-4">{e.pais}</td>
                <td className="py-2 px-4 text-center flex gap-2 justify-center">
                  <button
                    onClick={() => editarEmpresa(e)}
                    className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-xs"
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => eliminarEmpresa(e.id)}
                    className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-xs"
                  >
                    🗑️ Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {empresas.length === 0 && (
              <tr>
                <td
                  colSpan="5"
                  className="text-center text-gray-400 p-3 border border-gray-700"
                >
                  No hay empresas registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


