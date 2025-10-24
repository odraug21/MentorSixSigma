// src/pages/5S/5sSeguimiento.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function FiveSSeguimiento() {
  const navigate = useNavigate();

  const [datos, setDatos] = useState([
    { nombre: "Seiri", inicio: "", fin: "", avance: 20, evidencias: [] },
    { nombre: "Seiton", inicio: "", fin: "", avance: 40, evidencias: [] },
    { nombre: "Seiso", inicio: "", fin: "", avance: 60, evidencias: [] },
    { nombre: "Seiketsu", inicio: "", fin: "", avance: 80, evidencias: [] },
    { nombre: "Shitsuke", inicio: "", fin: "", avance: 50, evidencias: [] },
  ]);

  const handleChange = (index, field, value) => {
    const updated = [...datos];
    updated[index][field] = value;
    setDatos(updated);
  };

  const handleFileUpload = (index, files) => {
    const updated = [...datos];
    const newFiles = Array.from(files).map(file => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }));
    updated[index].evidencias.push(...newFiles);
    setDatos(updated);
  };

  const promedio = datos.reduce((acc, d) => acc + d.avance, 0) / datos.length;

  const guardar = () => alert("Seguimiento guardado correctamente ✅");
  const limpiar = () => {
    if (window.confirm("¿Deseas limpiar los registros?")) {
      setDatos(
        datos.map(d => ({
          ...d,
          inicio: "",
          fin: "",
          avance: 0,
          evidencias: [],
        }))
      );
    }
  };
  const generarPDF = () => alert("Exportación a PDF en desarrollo 📄");

  // 🎨 Datos para el gráfico
  const chartData = {
    labels: datos.map(d => d.nombre),
    datasets: [
      {
        label: "Avance (%)",
        data: datos.map(d => d.avance),
        backgroundColor: [
          "#22c55e",
          "#3b82f6",
          "#eab308",
          "#a855f7",
          "#ef4444",
        ],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Progreso por Etapa 5S" },
    },
    scales: {
      y: { beginAtZero: true, max: 100, ticks: { color: "#fff" } },
      x: { ticks: { color: "#fff" } },
    },
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">

      {/* Barra superior */}
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold text-indigo-400">Seguimiento 5S</h1>
        <div className="flex gap-2">
          <button
            onClick={() => navigate("/5s/intro")}
            className="bg-indigo-700 px-3 py-2 rounded-lg font-semibold shadow-lg transition"
          >
            Menú 5S
          </button>
          <button
            onClick={guardar}
            className="bg-green-600 px-3 py-2 rounded hover:bg-green-700"
          >
            Guardar
          </button>
          <button
            onClick={limpiar}
            className="bg-red-600 px-3 py-2 rounded hover:bg-red-700"
          >
            Limpiar
          </button>
          <button
            onClick={generarPDF}
            className="bg-pink-600 px-3 py-2 rounded hover:bg-pink-700"
          >
            PDF
          </button>
        </div>
      </div>

      <p className="text-gray-300 mb-6">
        Realiza el seguimiento de la implementación de las 5S, registra fechas y adjunta evidencias visuales del progreso.
      </p>

      {/* Progreso global */}
      <div className="bg-gray-800 p-4 rounded-lg mb-8">
        <p className="text-sm text-gray-400 mb-1">Progreso global:</p>
        <div className="w-full bg-gray-700 rounded-full h-4">
          <div
            className="bg-green-500 h-4 rounded-full transition-all duration-500"
            style={{ width: `${promedio}%` }}
          ></div>
        </div>
        <p className="text-center text-sm mt-2 text-gray-300">
          {promedio.toFixed(1)}%
        </p>
      </div>

      {/* Tabla editable */}
      <div className="bg-gray-800 p-4 rounded-lg mb-8">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-700 text-gray-300 text-sm">
              <th className="p-2 border border-gray-600">Etapa</th>
              <th className="p-2 border border-gray-600">Inicio</th>
              <th className="p-2 border border-gray-600">Fin</th>
              <th className="p-2 border border-gray-600">Avance (%)</th>
              <th className="p-2 border border-gray-600">Evidencias</th>
            </tr>
          </thead>
          <tbody>
            {datos.map((d, i) => (
              <tr key={i} className="text-sm">
                <td className="p-2 border border-gray-700 font-semibold text-indigo-300">{d.nombre}</td>
                <td className="p-2 border border-gray-700">
                  <input
                    type="date"
                    value={d.inicio}
                    onChange={(e) => handleChange(i, "inicio", e.target.value)}
                    className="bg-gray-700 p-1 rounded w-full"
                  />
                </td>
                <td className="p-2 border border-gray-700">
                  <input
                    type="date"
                    value={d.fin}
                    onChange={(e) => handleChange(i, "fin", e.target.value)}
                    className="bg-gray-700 p-1 rounded w-full"
                  />
                </td>
                <td className="p-2 border border-gray-700 text-center">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={d.avance}
                    onChange={(e) => handleChange(i, "avance", e.target.value)}
                    className="bg-gray-700 p-1 rounded text-center w-16"
                  />
                </td>
                <td className="p-2 border border-gray-700">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleFileUpload(i, e.target.files)}
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {d.evidencias.map((img, idx) => (
                      <img
                        key={idx}
                        src={img.url}
                        alt={img.name}
                        className="w-16 h-12 object-cover rounded"
                      />
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Gráfico tipo Gantt */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}
