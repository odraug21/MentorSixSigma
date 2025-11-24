// src/pages/Admin/Empresas.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import EmpresasForm from "./components/EmpresasForm";
import { API_BASE } from '../../config/env'; // ✅ único import necesario

export default function Empresas() {
  const [empresas, setEmpresas] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroPago, setFiltroPago] = useState("");
  const [filtroContrato, setFiltroContrato] = useState("");
  const [filtroTexto, setFiltroTexto] = useState("");

  const token = localStorage.getItem("token");

  // 🔹 Cargar empresas
  const cargarEmpresas = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/empresas`, {
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
      await axios.delete(`${API_BASE}/api/empresas/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmpresas((prev) => prev.filter((e) => e.id !== id));
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

  // 🔹 Suspender empresa
  const suspenderEmpresa = async (id) => {
    if (!window.confirm("¿Seguro que deseas suspender esta empresa?")) return;

    try {
      await axios.patch(
        `${API_BASE}/api/empresas/${id}`,
        { activa: false },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      cargarEmpresas();
    } catch (error) {
      console.error("❌ Error al suspender empresa:", error);
      alert("No se pudo suspender la empresa");
    }
  };

  // 📅 Calcular estado del contrato
  const getEstadoContrato = (empresa) => {
    if (!empresa.activa) return "Suspendida";
    if (!empresa.fecha_fin) return "Activa";

    const hoy = new Date();
    const fin = new Date(empresa.fecha_fin);
    const diffDias = (fin - hoy) / (1000 * 60 * 60 * 24);

    if (diffDias < 0) return "Vencida";
    if (diffDias <= 15) return "Próxima a vencer";
    return "Activa";
  };

  // 🔍 Filtros
  const empresasFiltradas = empresas.filter((e) => {
    const estado = getEstadoContrato(e);
    return (
      (filtroEstado ? estado === filtroEstado : true) &&
      (filtroPago ? e.metodo_pago === filtroPago : true) &&
      (filtroContrato ? e.tipo_contrato === filtroContrato : true) &&
      (filtroTexto
        ? e.nombre?.toLowerCase().includes(filtroTexto.toLowerCase()) ||
          e.rut?.toLowerCase().includes(filtroTexto.toLowerCase())
        : true)
    );
  });

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

      {/* 🔍 Filtros */}
      <div className="flex flex-wrap gap-4 mb-6 bg-gray-800 p-4 rounded-lg">
        <div>
          <label className="block text-sm text-gray-300 mb-1">Estado</label>
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="bg-gray-700 text-white px-3 py-2 rounded"
          >
            <option value="">Todos</option>
            <option value="Activa">Activa</option>
            <option value="Próxima a vencer">Próxima a vencer</option>
            <option value="Vencida">Vencida</option>
            <option value="Suspendida">Suspendida</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1">
            Método de Pago
          </label>
          <select
            value={filtroPago}
            onChange={(e) => setFiltroPago(e.target.value)}
            className="bg-gray-700 text-white px-3 py-2 rounded"
          >
            <option value="">Todos</option>
            <option value="Transferencia">Transferencia</option>
            <option value="Tarjeta">Tarjeta</option>
            <option value="Cheque">Cheque</option>
            <option value="Efectivo">Efectivo</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1">
            Tipo Contrato
          </label>
          <select
            value={filtroContrato}
            onChange={(e) => setFiltroContrato(e.target.value)}
            className="bg-gray-700 text-white px-3 py-2 rounded"
          >
            <option value="">Todos</option>
            <option value="Mensual">Mensual</option>
            <option value="Trimestral">Trimestral</option>
            <option value="Anual">Anual</option>
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-sm text-gray-300 mb-1">Buscar</label>
          <input
            type="text"
            value={filtroTexto}
            onChange={(e) => setFiltroTexto(e.target.value)}
            placeholder="Buscar por nombre o RUT..."
            className="bg-gray-700 text-white px-3 py-2 rounded w-full"
          />
        </div>
      </div>

      {/* Tabla de empresas */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-800 rounded-lg overflow-hidden text-sm">
          <thead className="bg-gray-700 text-indigo-300">
            <tr>
              <th className="py-3 px-4 text-left">ID</th>
              <th className="py-3 px-4 text-left">Estado</th>
              <th className="py-3 px-4 text-left">Nombre</th>
              <th className="py-3 px-4 text-left">RUT</th>
              <th className="py-3 px-4 text-left">País</th>
              <th className="py-3 px-4 text-left">Dirección</th>
              <th className="py-3 px-4 text-left">Teléfono</th>
              <th className="py-3 px-4 text-left">Contacto</th>
              <th className="py-3 px-4 text-left">Correo</th>
              <th className="py-3 px-4 text-left">Tipo contrato</th>
              <th className="py-3 px-4 text-left">Método pago</th>
              <th className="py-3 px-4 text-left">Fecha cobro</th>
              <th className="py-3 px-4 text-left">Tarifa</th>
              <th className="py-3 px-4 text-left">Inicio</th>
              <th className="py-3 px-4 text-left">Fin</th>
              <th className="py-3 px-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {empresasFiltradas.map((e) => (
              <tr
                key={e.id}
                className="border-b border-gray-700 hover:bg-gray-800/70"
              >
                <td className="py-2 px-4">{e.id}</td>
                <td className="py-2 px-4">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      getEstadoContrato(e) === "Activa"
                        ? "bg-green-700 text-green-100"
                        : getEstadoContrato(e) === "Próxima a vencer"
                        ? "bg-yellow-600 text-yellow-100"
                        : getEstadoContrato(e) === "Vencida"
                        ? "bg-red-700 text-red-100"
                        : "bg-gray-700 text-gray-300"
                    }`}
                  >
                    {getEstadoContrato(e)}
                  </span>
                </td>
                <td className="py-2 px-4 font-semibold text-indigo-400">
                  {e.nombre}
                </td>
                <td className="py-2 px-4">{e.rut}</td>
                <td className="py-2 px-4">{e.pais}</td>
                <td className="py-2 px-4">{e.direccion || "-"}</td>
                <td className="py-2 px-4">{e.telefono || "-"}</td>
                <td className="py-2 px-4">{e.contacto || "-"}</td>
                <td className="py-2 px-4">{e.correo || "-"}</td>
                <td className="py-2 px-4">{e.tipo_contrato || "-"}</td>
                <td className="py-2 px-4">{e.metodo_pago || "-"}</td>
                <td className="py-2 px-4">
                  {e.fecha_cobro
                    ? new Date(e.fecha_cobro).toLocaleDateString("es-CL")
                    : "-"}
                </td>
                <td className="py-2 px-4">{e.tarifa || "-"}</td>
                <td className="py-2 px-4">
                  {e.fecha_inicio
                    ? new Date(e.fecha_inicio).toLocaleDateString("es-CL")
                    : "-"}
                </td>
                <td className="py-2 px-4">
                  {e.fecha_fin
                    ? new Date(e.fecha_fin).toLocaleDateString("es-CL")
                    : "-"}
                </td>
                <td className="py-2 px-4 text-center flex gap-2 justify-center">
                  <button
                    onClick={() => editarEmpresa(e)}
                    className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-xs"
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => suspenderEmpresa(e.id)}
                    className="bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded text-xs text-black font-semibold"
                  >
                    ⚠️ Suspender
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
            {empresasFiltradas.length === 0 && (
              <tr>
                <td
                  colSpan="15"
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
