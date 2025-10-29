// src/pages/OOE/OoeBuilder.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function OoeBuilder() {
    const navigate = useNavigate();
    const [registros, setRegistros] = useState(() => {
    const saved = localStorage.getItem("ooe-data");
    return saved ? JSON.parse(saved) : [];
  });

  const [nuevo, setNuevo] = useState({
    fecha: "",
    linea: "",
    turno: "",
    tiempoOperativo: "",
    tiempoPlanificado: "",
  });

  // Guardar automáticamente en localStorage
  useEffect(() => {
    localStorage.setItem("ooe-data", JSON.stringify(registros));
  }, [registros]);

  // Calcular OOE
  const calcularOOE = (operativo, planificado) => {
    const op = parseFloat(operativo);
    const pl = parseFloat(planificado);
    if (!pl || pl === 0) return 0;
    return ((op / pl) * 100).toFixed(2);
  };

  const agregarRegistro = () => {
    if (
      !nuevo.fecha ||
      !nuevo.linea ||
      !nuevo.turno ||
      !nuevo.tiempoOperativo ||
      !nuevo.tiempoPlanificado
    ) {
      alert("⚠️ Completa todos los campos antes de agregar un registro.");
      return;
    }

    const nuevoRegistro = {
      ...nuevo,
      ooe: calcularOOE(nuevo.tiempoOperativo, nuevo.tiempoPlanificado),
    };

    setRegistros([...registros, nuevoRegistro]);
    setNuevo({
      fecha: "",
      linea: "",
      turno: "",
      tiempoOperativo: "",
      tiempoPlanificado: "",
    });
  };

  const eliminarRegistro = (index) => {
    if (window.confirm("¿Deseas eliminar este registro?")) {
      setRegistros(registros.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold text-center text-indigo-400 mb-6">
        📘 Registro Diario de OOE
      </h1>

{/* 🔹 Botones de navegación superior */}
<div className="flex flex-wrap justify-center md:justify-end gap-4 mb-6">
  <button
    onClick={() => navigate("/ooe/intro")}
    className="bg-indigo-600 px-6 py-2 rounded hover:bg-indigo-700 transition"
  >
    Volver al Menú OOE
  </button>

  <button
    onClick={() => navigate("/ooe/dashboard")}
    className="bg-green-600 px-6 py-2 rounded hover:bg-green-700 transition"
  >
    Ir al Dashboard
  </button>
</div>


      {/* Formulario */}
      <div className="bg-gray-800 rounded-xl p-6 shadow-lg mb-8">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <input
            type="date"
            value={nuevo.fecha}
            onChange={(e) => setNuevo({ ...nuevo, fecha: e.target.value })}
            className="bg-gray-700 text-white p-2 rounded"
          />
          <input
            type="text"
            placeholder="Línea / Equipo"
            value={nuevo.linea}
            onChange={(e) => setNuevo({ ...nuevo, linea: e.target.value })}
            className="bg-gray-700 text-white p-2 rounded"
          />
<select
  value={nuevo.turno}
  onChange={(e) => setNuevo({ ...nuevo, turno: e.target.value })}
  className="bg-gray-700 text-white p-2 rounded"
>
  <option value="">Seleccionar turno...</option>
  <option value="Mañana">Mañana</option>
  <option value="Tarde">Tarde</option>
  <option value="Noche">Noche</option>
</select>
          <input
            type="number"
            placeholder="Tiempo operativo (min)"
            value={nuevo.tiempoOperativo}
            onChange={(e) =>
              setNuevo({ ...nuevo, tiempoOperativo: e.target.value })
            }
            className="bg-gray-700 text-white p-2 rounded"
          />
          <input
            type="number"
            placeholder="Tiempo planificado (min)"
            value={nuevo.tiempoPlanificado}
            onChange={(e) =>
              setNuevo({ ...nuevo, tiempoPlanificado: e.target.value })
            }
            className="bg-gray-700 text-white p-2 rounded"
          />

          <button
            onClick={agregarRegistro}
            className="bg-indigo-600 hover:bg-indigo-700 rounded p-2 transition"
          >
            ➕ Agregar
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto bg-gray-800 rounded-xl shadow-lg">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-700 text-indigo-300">
            <tr>
              <th className="p-3">Fecha</th>
              <th className="p-3">Línea</th>
              <th className="p-3">Turno</th>
              <th className="p-3 text-center">Tiempo Operativo (min)</th>
              <th className="p-3 text-center">Tiempo Planificado (min)</th>
              <th className="p-3 text-center">OOE (%)</th>
              <th className="p-3 text-center">Acción</th>
            </tr>
          </thead>
          <tbody>
            {registros.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  className="text-center text-gray-400 p-4 italic"
                >
                  No hay registros todavía.
                </td>
              </tr>
            ) : (
              registros.map((r, i) => (
                <tr
                  key={i}
                  className="border-t border-gray-700 hover:bg-gray-700/40 transition"
                >
                  <td className="p-3">{r.fecha}</td>
                  <td className="p-3">{r.linea}</td>
                  <td className="p-3">{r.turno}</td>
                  <td className="p-3 text-center">{r.tiempoOperativo}</td>
                  <td className="p-3 text-center">{r.tiempoPlanificado}</td>
                  <td
                    className={`p-3 text-center font-semibold ${
                      r.ooe >= 85
                        ? "text-green-400"
                        : r.ooe >= 70
                        ? "text-yellow-400"
                        : "text-red-400"
                    }`}
                  >
                    {r.ooe}%
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => eliminarRegistro(i)}
                      className="text-red-400 hover:text-red-500"
                    >
                      ✖
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
