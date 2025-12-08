// src/pages/OOE/OoeBuilder.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet, apiPost, apiDelete } from "../../utils/api";

export default function OoeBuilder() {
  const navigate = useNavigate();

  const [registros, setRegistros] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [nuevo, setNuevo] = useState({
    fecha: "",
    linea: "",
    turno: "",
    tiempoOperativo: "",
    tiempoPlanificado: "",
  });

const formatearFecha = (iso) => {
if (!iso) return "-";
  const d = new Date(iso);
  return d.toLocaleString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};



  // 🔹 Cargar registros desde backend al iniciar
  useEffect(() => {
    (async () => {
      try {
        const resp = await apiGet("/ooe");
        if (resp.ok) {
          setRegistros(resp.registros || []);
        } else {
          console.error("Error API listar OOE:", resp);
        }
      } catch (err) {
        console.error("❌ Error cargando OOE:", err);
      } finally {
        setCargando(false);
      }
    })();
  }, []);

  const handleChange = (campo, valor) => {
    setNuevo((prev) => ({ ...prev, [campo]: valor }));
  };

  const agregarRegistro = async () => {
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

    const payload = {
      fecha: nuevo.fecha,
      linea: nuevo.linea,
      turno: nuevo.turno,
      tiempo_operativo_min: Number(nuevo.tiempoOperativo),
      tiempo_planificado_min: Number(nuevo.tiempoPlanificado),
    };

    try {
      const resp = await apiPost("/ooe", payload);
      if (!resp.ok) {
        console.error("Error API crear OOE:", resp);
        alert(resp.message || "❌ Error creando registro OOE");
        return;
      }

      const registroCreado = resp.registro;
      setRegistros((prev) => [registroCreado, ...prev]);

      setNuevo({
        fecha: "",
        linea: "",
        turno: "",
        tiempoOperativo: "",
        tiempoPlanificado: "",
      });

      alert("✅ Registro OOE creado correctamente");
    } catch (err) {
      console.error("❌ Error creando OOE:", err);
      alert("❌ Error creando registro OOE");
    }
  };

  const eliminarRegistro = async (id) => {
    if (!window.confirm("¿Deseas eliminar este registro?")) return;

    try {
      const resp = await apiDelete(`/ooe/${id}`);
      if (!resp.ok) {
        console.error("Error API eliminar OOE:", resp);
        alert(resp.message || "❌ Error eliminando registro OOE");
        return;
      }

      setRegistros((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error("❌ Error eliminando OOE:", err);
      alert("❌ Error eliminando registro OOE");
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
            onChange={(e) => handleChange("fecha", e.target.value)}
            className="bg-gray-700 text-white p-2 rounded"
          />
          <input
            type="text"
            placeholder="Línea / Equipo"
            value={nuevo.linea}
            onChange={(e) => handleChange("linea", e.target.value)}
            className="bg-gray-700 text-white p-2 rounded"
          />
          <select
            value={nuevo.turno}
            onChange={(e) => handleChange("turno", e.target.value)}
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
            onChange={(e) => handleChange("tiempoOperativo", e.target.value)}
            className="bg-gray-700 text-white p-2 rounded"
          />
          <input
            type="number"
            placeholder="Tiempo planificado (min)"
            value={nuevo.tiempoPlanificado}
            onChange={(e) =>
              handleChange("tiempoPlanificado", e.target.value)
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
        {cargando ? (
          <div className="p-4 text-center text-gray-400">
            Cargando registros OOE...
          </div>
        ) : (
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
                registros.map((r) => (
                  <tr
                    key={r.id}
                    className="border-t border-gray-700 hover:bg-gray-700/40 transition"
                  >
                    <td className="p-3">{formatearFecha(r.fecha)}</td>
                    <td className="p-3">{r.linea}</td>
                    <td className="p-3">{r.turno}</td>
                    <td className="p-3 text-center">
                      {r.tiempo_operativo_min}
                    </td>
                    <td className="p-3 text-center">
                      {r.tiempo_planificado_min}
                    </td>
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
                        onClick={() => eliminarRegistro(r.id)}
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
        )}
      </div>
    </div>
  );
}
