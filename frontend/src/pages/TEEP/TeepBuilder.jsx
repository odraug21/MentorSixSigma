// src/pages/TEEP/TeepBuilder.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet, apiPost, apiDelete } from "../../utils/api";

export default function TeepBuilder() {
  const navigate = useNavigate();

  const [registros, setRegistros] = useState([]);
  const [cargando, setCargando] = useState(true);

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

  const formatearFecha = (iso) => {
    if (!iso) return "-";
    const d = new Date(iso);
    return d.toLocaleDateString("es-CL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // 🔹 Cargar registros desde backend al iniciar
  useEffect(() => {
    (async () => {
      try {
        const resp = await apiGet("/teep");
        if (resp.ok) {
          setRegistros(resp.registros || []);
        } else {
          console.error("Error API listar TEEP:", resp);
        }
      } catch (err) {
        console.error("❌ Error cargando TEEP:", err);
      } finally {
        setCargando(false);
      }
    })();
  }, []);

  const handleChange = (campo, valor) => {
    setNuevo((prev) => ({ ...prev, [campo]: valor }));
  };

  const agregarRegistro = async () => {
    const {
      fecha,
      linea,
      turno,
      tiempoCalendario,
      tiempoPlanificado,
      tiempoOperativo,
      produccionTeorica,
      produccionReal,
      unidadesBuenas,
      unidadesTotales,
    } = nuevo;

    if (
      !fecha ||
      !linea ||
      !turno ||
      !tiempoCalendario ||
      !tiempoPlanificado ||
      !tiempoOperativo ||
      !produccionTeorica ||
      !produccionReal ||
      !unidadesBuenas ||
      !unidadesTotales
    ) {
      alert("⚠️ Completa todos los campos antes de agregar un registro.");
      return;
    }

    const payload = {
      fecha,
      linea,
      turno,
      tiempo_calendario_min: Number(tiempoCalendario),
      tiempo_planificado_min: Number(tiempoPlanificado),
      tiempo_operativo_min: Number(tiempoOperativo),
      produccion_teorica: Number(produccionTeorica),
      produccion_real: Number(produccionReal),
      unidades_buenas: Number(unidadesBuenas),
      unidades_totales: Number(unidadesTotales),
    };

    try {
      const resp = await apiPost("/teep", payload);
      if (!resp.ok) {
        console.error("Error API crear TEEP:", resp);
        alert(resp.message || "❌ Error creando registro TEEP");
        return;
      }

      const registroCreado = resp.registro;
      setRegistros((prev) => [registroCreado, ...prev]);

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

      alert("✅ Registro TEEP creado correctamente");
    } catch (err) {
      console.error("❌ Error creando TEEP:", err);
      alert("❌ Error creando registro TEEP");
    }
  };

  const eliminarRegistro = async (id) => {
    if (!window.confirm("¿Deseas eliminar este registro?")) return;

    try {
      const resp = await apiDelete(`/teep/${id}`);
      if (!resp.ok) {
        console.error("Error API eliminar TEEP:", resp);
        alert(resp.message || "❌ Error eliminando registro TEEP");
        return;
      }
      setRegistros((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error("❌ Error eliminando TEEP:", err);
      alert("❌ Error eliminando registro TEEP");
    }
  };

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
            onChange={(e) => handleChange("fecha", e.target.value)}
            className="bg-gray-700 p-2 rounded"
          />
          <input
            type="text"
            placeholder="Línea"
            value={nuevo.linea}
            onChange={(e) => handleChange("linea", e.target.value)}
            className="bg-gray-700 p-2 rounded"
          />
          <select
            value={nuevo.turno}
            onChange={(e) => handleChange("turno", e.target.value)}
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
            onChange={(e) => handleChange("tiempoCalendario", e.target.value)}
            className="bg-gray-700 p-2 rounded"
          />
          <input
            type="number"
            placeholder="Tiempo Planificado (min)"
            value={nuevo.tiempoPlanificado}
            onChange={(e) => handleChange("tiempoPlanificado", e.target.value)}
            className="bg-gray-700 p-2 rounded"
          />
          <input
            type="number"
            placeholder="Tiempo Operativo (min)"
            value={nuevo.tiempoOperativo}
            onChange={(e) => handleChange("tiempoOperativo", e.target.value)}
            className="bg-gray-700 p-2 rounded"
          />
          <input
            type="number"
            placeholder="Producción Teórica"
            value={nuevo.produccionTeorica}
            onChange={(e) => handleChange("produccionTeorica", e.target.value)}
            className="bg-gray-700 p-2 rounded"
          />
          <input
            type="number"
            placeholder="Producción Real"
            value={nuevo.produccionReal}
            onChange={(e) => handleChange("produccionReal", e.target.value)}
            className="bg-gray-700 p-2 rounded"
          />
          <input
            type="number"
            placeholder="Unidades Buenas"
            value={nuevo.unidadesBuenas}
            onChange={(e) => handleChange("unidadesBuenas", e.target.value)}
            className="bg-gray-700 p-2 rounded"
          />
          <input
            type="number"
            placeholder="Unidades Totales"
            value={nuevo.unidadesTotales}
            onChange={(e) => handleChange("unidadesTotales", e.target.value)}
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
      <div className="overflow-x-auto">
        {cargando ? (
          <div className="p-4 text-center text-gray-400">
            Cargando registros TEEP...
          </div>
        ) : (
          <table className="w-full text-sm border border-gray-700">
            <thead className="bg-gray-700 text-gray-200">
              <tr>
                <th className="p-2">Fecha</th>
                <th>Línea</th>
                <th>Turno</th>
                <th>Calendario (min)</th>
                <th>Planificado (min)</th>
                <th>Operativo (min)</th>
                <th>Prod. Teórica</th>
                <th>Prod. Real</th>
                <th>Buenas</th>
                <th>Totales</th>
                <th>TEEP (%)</th>
                <th>Acción</th>
              </tr>
            </thead>

            <tbody>
              {registros.length === 0 ? (
                <tr>
                  <td
                    colSpan="12"
                    className="text-center text-gray-400 p-4 italic"
                  >
                    No hay registros todavía.
                  </td>
                </tr>
              ) : (
                registros.map((r) => (
                  <tr
                    key={r.id}
                    className="border-t border-gray-700 text-center hover:bg-gray-800/40"
                  >
                    <td className="p-2">{formatearFecha(r.fecha)}</td>
                    <td>{r.linea}</td>
                    <td>{r.turno}</td>
                    <td>{r.tiempo_calendario_min}</td>
                    <td>{r.tiempo_planificado_min}</td>
                    <td>{r.tiempo_operativo_min}</td>
                    <td>{r.produccion_teorica}</td>
                    <td>{r.produccion_real}</td>
                    <td>{r.unidades_buenas}</td>
                    <td>{r.unidades_totales}</td>
                    <td className="font-semibold text-green-400">
                      {r.teep}%
                    </td>
                    <td>
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
