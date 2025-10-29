// src/pages/TEEP/TeepBuilder.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function TeepBuilder() {
  const navigate = useNavigate();
  const [registros, setRegistros] = useState(() => {
    const saved = localStorage.getItem("teep-data");
    return saved ? JSON.parse(saved) : [];
  });

  const [nuevo, setNuevo] = useState({
    fecha: "",
    linea: "",
    turno: "",
    tiempoCalendario: "",
    tiempoPlanificado: "",
    tiempoOperativo: "",
    produccionTeorica: "",
    produccionReal: "",
    unidadesBuenas: "",
    unidadesTotales: "",
  });

  const agregarRegistro = () => {
    setRegistros([...registros, nuevo]);
    setNuevo({
      fecha: "",
      linea: "",
      turno: "",
      tiempoCalendario: "",
      tiempoPlanificado: "",
      tiempoOperativo: "",
      produccionTeorica: "",
      produccionReal: "",
      unidadesBuenas: "",
      unidadesTotales: "",
    });
  };

  useEffect(() => {
    localStorage.setItem("teep-data", JSON.stringify(registros));
  }, [registros]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold text-center text-indigo-400 mb-6">
        🧮 Registro Diario de TEEP
      </h1>

      {/* Botones superiores */}
      <div className="flex flex-wrap justify-center md:justify-end gap-4 mb-6">
        <button
          onClick={() => navigate("/teep/intro")}
          className="bg-indigo-600 px-6 py-2 rounded hover:bg-indigo-700 transition"
        >
          Volver al Menú TEEP
        </button>
        <button
          onClick={() => navigate("/teep/dashboard")}
          className="bg-green-600 px-6 py-2 rounded hover:bg-green-700 transition"
        >
          Ir al Dashboard
        </button>
      </div>

      {/* Formulario */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <input
            type="date"
            value={nuevo.fecha}
            onChange={(e) => setNuevo({ ...nuevo, fecha: e.target.value })}
            className="bg-gray-700 p-2 rounded"
          />
          <input
            type="text"
            placeholder="Línea"
            value={nuevo.linea}
            onChange={(e) => setNuevo({ ...nuevo, linea: e.target.value })}
            className="bg-gray-700 p-2 rounded"
          />
          <select
            value={nuevo.turno}
            onChange={(e) => setNuevo({ ...nuevo, turno: e.target.value })}
            className="bg-gray-700 p-2 rounded"
          >
            <option value="">Turno...</option>
            <option value="Mañana">Mañana</option>
            <option value="Tarde">Tarde</option>
            <option value="Noche">Noche</option>
          </select>
          <input
            type="number"
            placeholder="Tiempo Calendario (min)"
            value={nuevo.tiempoCalendario}
            onChange={(e) => setNuevo({ ...nuevo, tiempoCalendario: e.target.value })}
            className="bg-gray-700 p-2 rounded"
          />
          <input
            type="number"
            placeholder="Tiempo Planificado (min)"
            value={nuevo.tiempoPlanificado}
            onChange={(e) => setNuevo({ ...nuevo, tiempoPlanificado: e.target.value })}
            className="bg-gray-700 p-2 rounded"
          />
          <input
            type="number"
            placeholder="Tiempo Operativo (min)"
            value={nuevo.tiempoOperativo}
            onChange={(e) => setNuevo({ ...nuevo, tiempoOperativo: e.target.value })}
            className="bg-gray-700 p-2 rounded"
          />
          <input
            type="number"
            placeholder="Producción Teórica"
            value={nuevo.produccionTeorica}
            onChange={(e) => setNuevo({ ...nuevo, produccionTeorica: e.target.value })}
            className="bg-gray-700 p-2 rounded"
          />
          <input
            type="number"
            placeholder="Producción Real"
            value={nuevo.produccionReal}
            onChange={(e) => setNuevo({ ...nuevo, produccionReal: e.target.value })}
            className="bg-gray-700 p-2 rounded"
          />
          <input
            type="number"
            placeholder="Unidades Buenas"
            value={nuevo.unidadesBuenas}
            onChange={(e) => setNuevo({ ...nuevo, unidadesBuenas: e.target.value })}
            className="bg-gray-700 p-2 rounded"
          />
          <input
            type="number"
            placeholder="Unidades Totales"
            value={nuevo.unidadesTotales}
            onChange={(e) => setNuevo({ ...nuevo, unidadesTotales: e.target.value })}
            className="bg-gray-700 p-2 rounded"
          />
        </div>

        <button
          onClick={agregarRegistro}
          className="mt-4 bg-green-600 px-6 py-2 rounded hover:bg-green-700 transition"
        >
          + Agregar Registro
        </button>
      </div>

      {/* Tabla */}
<table className="w-full text-sm border border-gray-700">
  <thead className="bg-gray-700 text-gray-200">
    <tr>
      <th className="p-2">Fecha</th>
      <th>Línea</th>
      <th>Turno</th>
      <th>Calendario</th>
      <th>Planificado</th>
      <th>Operativo</th>
      <th>Prod. Teórica</th>
      <th>Prod. Real</th>
      <th>Buenas</th>
      <th>Totales</th>
    </tr>
  </thead>

  <tbody>
    {registros.map((r, i) => (
      <tr key={i} className="border-t border-gray-700 text-center hover:bg-gray-800/40">
        <td className="p-2">{r.fecha}</td>
        <td>{r.linea}</td>
        <td>{r.turno}</td>
        <td>{r.tiempoCalendario}</td>
        <td>{r.tiempoPlanificado}</td>
        <td>{r.tiempoOperativo}</td>
        <td>{r.produccionTeorica}</td>
        <td>{r.produccionReal}</td>
        <td>{r.unidadesBuenas}</td>
        <td>{r.unidadesTotales}</td>
      </tr>
    ))}
  </tbody>
</table>
    </div>
  );
}
