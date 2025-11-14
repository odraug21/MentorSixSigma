// src/pages/OOE/OoeDashboard.jsx
import React, { useState, useMemo } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { useNavigate } from "react-router-dom";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function OoeDashboard() {
  const navigate = useNavigate();

  // 🧩 Cargar registros guardados en localStorage
  const [registros] = useState(() => {
    const saved = localStorage.getItem("ooe-data");
    return saved ? JSON.parse(saved) : [];
  });

  // 🎯 Filtros
  const [filtros, setFiltros] = useState({
    desde: "",
    hasta: "",
    linea: "",
    turno: "",
  });

  // 🔍 Filtrar registros según los criterios
  const registrosFiltrados = useMemo(() => {
    return registros.filter((r) => {
      const fechaOK =
        (!filtros.desde || new Date(r.fecha) >= new Date(filtros.desde)) &&
        (!filtros.hasta || new Date(r.fecha) <= new Date(filtros.hasta));
      const lineaOK = !filtros.linea || r.linea === filtros.linea;
      const turnoOK = !filtros.turno || r.turno === filtros.turno;
      return fechaOK && lineaOK && turnoOK;
    });
  }, [registros, filtros]);

  // 📊 Datos para gráfico
  const chartData = useMemo(() => {
    const agrupado = {};

    registrosFiltrados.forEach((r) => {
      const key = `${r.fecha} - ${r.linea}`;
      agrupado[key] = (agrupado[key] || 0) + parseFloat(r.ooe || 0);
    });

    const labels = Object.keys(agrupado);
    const data = Object.values(agrupado).map((v) => v.toFixed(2));

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

  // 📈 Cálculo de promedio
  const promedioOOE =
    registrosFiltrados.length > 0
      ? (
          registrosFiltrados.reduce((acc, r) => acc + parseFloat(r.ooe || 0), 0) /
          registrosFiltrados.length
        ).toFixed(2)
      : 0;

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
            onChange={(e) => setFiltros({ ...filtros, desde: e.target.value })}
            className="w-full bg-gray-700 text-white p-2 rounded"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Hasta:</label>
          <input
            type="date"
            value={filtros.hasta}
            onChange={(e) => setFiltros({ ...filtros, hasta: e.target.value })}
            className="w-full bg-gray-700 text-white p-2 rounded"
          />
        </div>
{/* 🔹 Selector de Línea dinámico */}
<div>
  <label className="block text-sm mb-1">Línea / Equipo:</label>
  <select
    value={filtros.linea}
    onChange={(e) => setFiltros({ ...filtros, linea: e.target.value })}
    className="w-full bg-gray-700 text-white p-2 rounded"
  >
    <option value="">Todas</option>
    {[...new Set(registros.map((r) => r.linea))] // ← genera lista única de líneas
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
            onChange={(e) => setFiltros({ ...filtros, turno: e.target.value })}
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
              <th className="px-4 py-2">Disponibilidad (%)</th>
              <th className="px-4 py-2">Rendimiento (%)</th>
              <th className="px-4 py-2">Calidad (%)</th>
              <th className="px-4 py-2">OOE (%)</th>
            </tr>
          </thead>
          <tbody>
            {registrosFiltrados.map((r, i) => (
              <tr key={i} className="border-t border-gray-700 hover:bg-gray-700">
                <td className="px-4 py-2">{r.fecha}</td>
                <td className="px-4 py-2">{r.linea}</td>
                <td className="px-4 py-2">{r.turno}</td>
                <td className="px-4 py-2">{r.disponibilidad}</td>
                <td className="px-4 py-2">{r.rendimiento}</td>
                <td className="px-4 py-2">{r.calidad}</td>
                <td className="px-4 py-2 font-semibold text-green-400">{r.ooe}</td>
              </tr>
            ))}
            {registrosFiltrados.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center py-4 text-gray-400">
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
