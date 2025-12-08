// src/pages/OOE/OeeDashboard.jsx
import React, { useState, useMemo, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useNavigate } from "react-router-dom";
import { apiGet } from "../../utils/api";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function OoeDashboard() {
  const navigate = useNavigate();
  const [registros, setRegistros] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [filtros, setFiltros] = useState({
    desde: "",
    hasta: "",
    linea: "",
    turno: "",
  });

  // 🔹 Cargar datos desde backend
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
        console.error("❌ Error cargando OOE dashboard:", err);
      } finally {
        setCargando(false);
      }
    })();
  }, []);

  // 🔍 Filtrar registros según criterios
  const registrosFiltrados = useMemo(() => {
    return registros.filter((r) => {
      const fecha = r.fecha;
      const fechaOK =
        (!filtros.desde || fecha >= filtros.desde) &&
        (!filtros.hasta || fecha <= filtros.hasta);
      const lineaOK = !filtros.linea || r.linea === filtros.linea;
      const turnoOK = !filtros.turno || r.turno === filtros.turno;
      return fechaOK && lineaOK && turnoOK;
    });
  }, [registros, filtros]);

  // 📊 Datos para gráfico
  const chartData = useMemo(() => {
    const labels = registrosFiltrados.map(
      (r) => `${r.fecha} - ${r.linea || "Sin línea"}`
    );
    const data = registrosFiltrados.map((r) => Number(r.ooe || 0).toFixed(2));

    return {
      labels,
      datasets: [
        {
          label: "OOE (%)",
          data,
          backgroundColor: "rgba(79, 70, 229, 0.7)", // Indigo
          borderColor: "rgba(79, 70, 229, 1)",
          borderWidth: 1,
        },
      ],
    };
  }, [registrosFiltrados]);

  // 📈 Promedio general
  const promedioOOE =
    registrosFiltrados.length > 0
      ? (
          registrosFiltrados.reduce(
            (acc, r) => acc + Number(r.ooe || 0),
            0
          ) / registrosFiltrados.length
        ).toFixed(2)
      : 0;

  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p className="text-gray-400">Cargando datos de OOE...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold text-indigo-400 mb-6 text-center">
        📊 Dashboard OOE - Eficiencia Operacional
      </h1>

      {/* 🔹 Botones navegación */}
      <div className="flex flex-wrap justify-center md:justify-end gap-4 mb-8">
        <button
          onClick={() => navigate("/ooe/intro")}
          className="bg-indigo-600 px-6 py-2 rounded hover:bg-indigo-700 transition"
        >
          Volver al Menú OOE
        </button>

        <button
          onClick={() => navigate("/ooe/builder")}
          className="bg-green-600 px-6 py-2 rounded hover:bg-green-700 transition"
        >
          Ir al Registro Diario
        </button>
      </div>

      {/* 🔹 Filtros */}
      <div className="bg-gray-800 p-4 rounded-lg mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm mb-1">Desde:</label>
          <input
            type="date"
            value={filtros.desde}
            onChange={(e) =>
              setFiltros((f) => ({ ...f, desde: e.target.value }))
            }
            className="w-full bg-gray-700 text-white p-2 rounded"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Hasta:</label>
          <input
            type="date"
            value={filtros.hasta}
            onChange={(e) =>
              setFiltros((f) => ({ ...f, hasta: e.target.value }))
            }
            className="w-full bg-gray-700 text-white p-2 rounded"
          />
        </div>

        {/* Selector de Línea dinámico */}
        <div>
          <label className="block text-sm mb-1">Línea / Equipo:</label>
          <select
            value={filtros.linea}
            onChange={(e) =>
              setFiltros((f) => ({ ...f, linea: e.target.value }))
            }
            className="w-full bg-gray-700 text-white p-2 rounded"
          >
            <option value="">Todas</option>
            {[...new Set(registros.map((r) => r.linea))]
              .filter((l) => l && l.trim() !== "")
              .map((linea, i) => (
                <option key={i} value={linea}>
                  {linea}
                </option>
              ))}
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">Turno:</label>
          <select
            value={filtros.turno}
            onChange={(e) =>
              setFiltros((f) => ({ ...f, turno: e.target.value }))
            }
            className="w-full bg-gray-700 text-white p-2 rounded"
          >
            <option value="">Todos</option>
            <option value="Mañana">Mañana</option>
            <option value="Tarde">Tarde</option>
            <option value="Noche">Noche</option>
          </select>
        </div>
      </div>

      {/* 🔹 Tabla resumen */}
      <div className="overflow-x-auto mb-8">
        <table className="min-w-full bg-gray-800 rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-indigo-700 text-left">
              <th className="px-4 py-2">Fecha</th>
              <th className="px-4 py-2">Línea</th>
              <th className="px-4 py-2">Turno</th>
              <th className="px-4 py-2 text-center">
                Tiempo Operativo (min)
              </th>
              <th className="px-4 py-2 text-center">
                Tiempo Planificado (min)
              </th>
              <th className="px-4 py-2 text-center">OOE (%)</th>
            </tr>
          </thead>
          <tbody>
            {registrosFiltrados.map((r) => (
              <tr
                key={r.id}
                className="border-t border-gray-700 hover:bg-gray-700"
              >
                <td className="px-4 py-2">{r.fecha}</td>
                <td className="px-4 py-2">{r.linea}</td>
                <td className="px-4 py-2">{r.turno}</td>
                <td className="px-4 py-2 text-center">
                  {r.tiempo_operativo_min}
                </td>
                <td className="px-4 py-2 text-center">
                  {r.tiempo_planificado_min}
                </td>
                <td className="px-4 py-2 text-center font-semibold text-green-400">
                  {r.ooe}%
                </td>
              </tr>
            ))}
            {registrosFiltrados.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center py-4 text-gray-400">
                  No hay registros disponibles con los filtros aplicados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 🔹 Promedio general */}
      <div className="text-center text-lg font-semibold mb-8">
        Promedio general OOE:{" "}
        <span className="text-green-400">{promedioOOE}%</span>
      </div>

      {/* 🔹 Gráfico comparativo */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <h2 className="text-xl mb-4 text-center text-indigo-300">
          Evolución diaria de OOE
        </h2>
        <Bar
          data={chartData}
          options={{
            responsive: true,
            plugins: {
              legend: { labels: { color: "#fff" } },
              title: { display: false },
            },
            scales: {
              x: { ticks: { color: "#ccc" } },
              y: { ticks: { color: "#ccc" }, beginAtZero: true },
            },
          }}
        />
      </div>
    </div>
  );
}
