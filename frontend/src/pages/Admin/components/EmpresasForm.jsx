// src/pages/Admin/components/EmpresasForm.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE } from '../../../config/env';

export default function EmpresasForm({ empresa, onCancel, onSuccess }) {
  const [formData, setFormData] = useState(
    empresa || {
      nombre: "",
      rut: "",
      pais: "",
      direccion: "",
      telefono: "",
      contacto: "",
      correo: "",
      tipo_contrato: "",
      metodo_pago: "UF",
      fecha_cobro: "",
      tarifa: "",
      fecha_inicio: "",
      fecha_fin: "",
    }
  );
  const [estadoContrato, setEstadoContrato] = useState("Activo");
  const [mensaje, setMensaje] = useState("");
  const token = localStorage.getItem("token");

  // 🧮 Determinar estado de contrato
  useEffect(() => {
    if (formData.fecha_fin) {
      const hoy = new Date();
      const fin = new Date(formData.fecha_fin);
      const diff = fin - hoy;
      if (diff < 0) setEstadoContrato("❌ Vencido");
      else if (diff <= 7 * 24 * 60 * 60 * 1000)
        setEstadoContrato("⚠️ Próximo a vencer");
      else setEstadoContrato("✅ Activo");
    }
  }, [formData.fecha_fin]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      console.log("📦 Datos enviados antes de limpieza:", formData);

      // 🧹 Limpiar y normalizar los datos antes de enviar
      const cleanData = {
        ...formData,
        direccion: formData.direccion?.trim() || null,
        telefono: formData.telefono?.trim() || null,
        contacto: formData.contacto?.trim() || null,
        correo: formData.correo?.trim() || null,
        tipo_contrato: formData.tipo_contrato?.trim() || null,
        metodo_pago: formData.metodo_pago?.trim() || null,
        tarifa: formData.tarifa ? Number(formData.tarifa) : null,
        fecha_inicio: formData.fecha_inicio
          ? new Date(formData.fecha_inicio).toISOString().split("T")[0]
          : null,
        fecha_fin: formData.fecha_fin
          ? new Date(formData.fecha_fin).toISOString().split("T")[0]
          : null,
        fecha_cobro: formData.fecha_cobro
          ? new Date(formData.fecha_cobro).toISOString().split("T")[0]
          : null,
        activa: formData.activa ?? true,
      };

      console.log("📩 Enviando datos limpios al backend:", cleanData);

      // 🧠 Si existe empresa → actualizar; si no, crear nueva
      if (empresa) {
        await axios.put(`${API_BASE}/empresas/${empresa.id}`, cleanData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMensaje("✅ Empresa actualizada correctamente");
      } else {
        await axios.post(`${API_BASE}/empresas`, cleanData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMensaje("✅ Empresa creada correctamente");
      }

      onSuccess?.();
    } catch (error) {
      console.error("❌ Error guardando empresa:", error);
      setMensaje("⚠️ Error al guardar la empresa");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-800 p-6 rounded-lg mb-6 border border-gray-700"
    >
      <h2 className="text-lg font-semibold mb-4 text-indigo-300">
        {empresa ? "✏️ Editar Empresa" : "➕ Nueva Empresa"}
      </h2>

      {/* 🏢 Información general */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <input
          type="text"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          placeholder="Nombre de la empresa"
          className="bg-gray-700 border border-gray-600 rounded px-3 py-2 w-full"
          required
        />
        <input
          type="text"
          name="rut"
          value={formData.rut}
          onChange={handleChange}
          placeholder="RUT"
          className="bg-gray-700 border border-gray-600 rounded px-3 py-2 w-full"
          required
        />
        <input
          type="text"
          name="pais"
          value={formData.pais}
          onChange={handleChange}
          placeholder="País"
          className="bg-gray-700 border border-gray-600 rounded px-3 py-2 w-full"
          required
        />
        <input
          type="text"
          name="direccion"
          value={formData.direccion}
          onChange={handleChange}
          placeholder="Dirección"
          className="bg-gray-700 border border-gray-600 rounded px-3 py-2 w-full"
        />
        <input
          type="text"
          name="telefono"
          value={formData.telefono}
          onChange={handleChange}
          placeholder="Teléfono"
          className="bg-gray-700 border border-gray-600 rounded px-3 py-2 w-full"
        />
        <input
          type="text"
          name="contacto"
          value={formData.contacto}
          onChange={handleChange}
          placeholder="Persona de contacto"
          className="bg-gray-700 border border-gray-600 rounded px-3 py-2 w-full"
        />
        <input
          type="email"
          name="correo"
          value={formData.correo}
          onChange={handleChange}
          placeholder="Correo de contacto / facturación"
          className="bg-gray-700 border border-gray-600 rounded px-3 py-2 w-full"
        />
      </div>

      {/* 💰 Información contractual */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Tipo de Contrato */}
        <div className="flex flex-col">
          <label className="text-sm text-gray-400 mb-1">Tipo de Contrato</label>
          <select
            name="tipo_contrato"
            value={formData.tipo_contrato}
            onChange={handleChange}
            className="bg-gray-700 border border-gray-600 rounded px-3 py-2 w-full"
          >
            <option value="">Selecciona tipo</option>
            <option value="Mensual">Mensual</option>
            <option value="Trimestral">Trimestral</option>
            <option value="Anual">Anual</option>
          </select>
        </div>

        {/* Método de Pago */}
        <div className="flex flex-col">
          <label className="text-sm text-gray-400 mb-1">Método de Pago</label>
          <select
            name="metodo_pago"
            value={formData.metodo_pago}
            onChange={handleChange}
            className="bg-gray-700 border border-gray-600 rounded px-3 py-2 w-full"
          >
            <option value="">Selecciona método</option>
            <option value="Transferencia">Transferencia</option>
            <option value="Depósito">Depósito</option>
          </select>
        </div>

        {/* Tarifa */}
        <div className="flex flex-col">
          <label className="text-sm text-gray-400 mb-1">Tarifa (UF)</label>
          <input
            type="number"
            name="tarifa"
            value={formData.tarifa}
            onChange={handleChange}
            placeholder="Ej: 10.5"
            className="bg-gray-700 border border-gray-600 rounded px-3 py-2 w-full"
            step="0.01"
          />
        </div>

        {/* Fechas */}
        <div className="flex flex-col">
          <label className="text-sm text-gray-400 mb-1">Fecha de Cobro</label>
          <input
            type="date"
            name="fecha_cobro"
            value={formData.fecha_cobro || ""}
            onChange={handleChange}
            className="bg-gray-700 border border-gray-600 rounded px-3 py-2 w-full"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm text-gray-400 mb-1">Fecha de Inicio del Contrato</label>
          <input
            type="date"
            name="fecha_inicio"
            value={formData.fecha_inicio || ""}
            onChange={handleChange}
            className="bg-gray-700 border border-gray-600 rounded px-3 py-2 w-full"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm text-gray-400 mb-1">Fecha de Término del Contrato</label>
          <input
            type="date"
            name="fecha_fin"
            value={formData.fecha_fin || ""}
            onChange={handleChange}
            className="bg-gray-700 border border-gray-600 rounded px-3 py-2 w-full"
          />
        </div>
      </div>

      {/* 🧭 Estado del contrato */}
      <div className="mb-4">
        <p className="text-gray-300">
          Estado del contrato:{" "}
          <span
            className={
              estadoContrato.includes("Vencido")
                ? "text-red-400 font-semibold"
                : estadoContrato.includes("Próximo")
                ? "text-yellow-400 font-semibold"
                : "text-green-400 font-semibold"
            }
          >
            {estadoContrato}
          </span>
        </p>
      </div>

      {mensaje && <p className="text-green-400 mt-3">{mensaje}</p>}

      <div className="flex justify-end gap-2 mt-4">
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded font-semibold"
        >
          {empresa ? "Guardar Cambios" : "Crear Empresa"}
        </button>
      </div>
    </form>
  );
}
