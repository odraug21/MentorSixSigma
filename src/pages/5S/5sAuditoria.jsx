// src/pages/5S/5sAuditoria.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Radar } from "react-chartjs-2";
import { exportarAuditoriaPDF } from "../../reports/5SAudit";

import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

export default function FiveSAuditoria() {
  const navigate = useNavigate();
  const { id } = useParams();
  const usuario = JSON.parse(localStorage.getItem("user"))?.email || "anonimo";

  const [proyecto, setProyecto] = useState(null);
  const [evaluacion, setEvaluacion] = useState([
    { nombre: "1S · Seiri (Clasificar)", puntuacion: 0, observaciones: "", evidencias: [] },
    { nombre: "2S · Seiton (Ordenar)", puntuacion: 0, observaciones: "", evidencias: [] },
    { nombre: "3S · Seiso (Limpiar)", puntuacion: 0, observaciones: "", evidencias: [] },
    { nombre: "4S · Seiketsu (Estandarizar)", puntuacion: 0, observaciones: "", evidencias: [] },
    { nombre: "5S · Shitsuke (Disciplina)", puntuacion: 0, observaciones: "", evidencias: [] },
  ]);

  // 📦 Cargar proyecto y auditoría guardada
  useEffect(() => {
    const proyectos = JSON.parse(localStorage.getItem(`proyectos5s-${usuario}`)) || [];
    const encontrado = proyectos.find((p) => p.id.toString() === id);
    setProyecto(encontrado || null);

    const guardada = JSON.parse(localStorage.getItem(`auditoria5s-${usuario}-${id}`));
    if (guardada) setEvaluacion(guardada);
  }, [id, usuario]);

  // 💾 Guardar auditoría
  const guardar = () => {
    localStorage.setItem(`auditoria5s-${usuario}-${id}`, JSON.stringify(evaluacion));
    alert("Auditoría guardada correctamente ✅");
  };

  // 🧹 Limpiar
  const limpiar = () => {
    if (window.confirm("¿Deseas limpiar la auditoría?")) {
      const reinicio = evaluacion.map((e) => ({
        ...e,
        puntuacion: 0,
        observaciones: "",
        evidencias: [],
      }));
      setEvaluacion(reinicio);
      localStorage.removeItem(`auditoria5s-${usuario}-${id}`);
    }
  };

  // 📸 Evidencias
  const handleFileUpload = (index, files) => {
    const updated = [...evaluacion];
    const newFiles = Array.from(files).map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }));
    updated[index].evidencias = [...updated[index].evidencias, ...newFiles];
    setEvaluacion(updated);
  };

  // 📊 Promedio y nivel
  const promedio = evaluacion.reduce((acc, e) => acc + Number(e.puntuacion), 0) / evaluacion.length;
  const nivel =
    promedio < 2
      ? "Inicial"
      : promedio < 3.5
      ? "En Progreso"
      : promedio < 4.5
      ? "Avanzado"
      : "Excelente";

  // 🧠 Actualizar
  const handleChange = (index, field, value) => {
    const updated = [...evaluacion];
    updated[index][field] = value;
    setEvaluacion(updated);
  };

  if (!proyecto) {
    return (
      <div className="text-center text-red-400 mt-10">
        <p>No se encontró el proyecto seleccionado.</p>
        <button
          onClick={() => navigate("/5s/proyectos")}
          className="bg-indigo-600 px-4 py-2 rounded mt-4"
        >
          Volver a proyectos
        </button>
      </div>
    );
  }

  // 🎯 Gráfico radar
  const radarData = {
    labels: evaluacion.map((e) => e.nombre),
    datasets: [
      {
        label: "Puntuación Actual",
        data: evaluacion.map((e) => e.puntuacion),
        backgroundColor: "rgba(79, 70, 229, 0.4)",
        borderColor: "#818cf8",
        borderWidth: 2,
        pointBackgroundColor: "#22c55e",
      },
    ],
  };

  const radarOptions = {
    scales: {
      r: {
        min: 0,
        max: 5,
        ticks: { stepSize: 1, color: "#ddd" },
        grid: { color: "#555" },
        pointLabels: { color: "#fff", font: { size: 12 } },
      },
    },
    plugins: { legend: { labels: { color: "#fff" } } },
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      {/* 🔹 Barra superior */}
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold text-indigo-400">
          Auditoría 5S – {proyecto.nombre}
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => navigate("/5s/proyectos")}
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
            onClick={() => exportarAuditoriaPDF(proyecto, evaluacion, usuario)}
            className="bg-pink-600 px-3 py-2 rounded hover:bg-pink-700"
          >
            PDF
          </button>
        </div>
      </div>

      <p className="text-gray-300 mb-6">
        Evalúa el cumplimiento de las 5S, registra observaciones y carga evidencias visuales.
      </p>

      {/* Tabla */}
      <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 mb-8">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-700 text-gray-300 text-sm">
              <th className="p-2 border border-gray-600">S</th>
              <th className="p-2 border border-gray-600 text-center">Puntuación</th>
              <th className="p-2 border border-gray-600">Observaciones</th>
              <th className="p-2 border border-gray-600 text-center">Evidencias</th>
            </tr>
          </thead>
          <tbody>
            {evaluacion.map((e, i) => (
              <tr key={i}>
                <td className="p-2 border border-gray-700 font-semibold text-indigo-300">
                  {e.nombre}
                </td>
                <td className="p-2 border border-gray-700 text-center">
                  <select
                    value={e.puntuacion}
                    onChange={(ev) => handleChange(i, "puntuacion", ev.target.value)}
                    className="bg-gray-700 p-1 rounded"
                  >
                    <option value="0">--</option>
                    <option value="1">1 - Deficiente</option>
                    <option value="2">2 - Básico</option>
                    <option value="3">3 - Intermedio</option>
                    <option value="4">4 - Bueno</option>
                    <option value="5">5 - Excelente</option>
                  </select>
                </td>
                <td className="p-2 border border-gray-700">
                  <textarea
                    value={e.observaciones}
                    onChange={(ev) => handleChange(i, "observaciones", ev.target.value)}
                    className="w-full bg-gray-700 p-2 rounded"
                    rows={2}
                  />
                </td>
                <td className="p-2 border border-gray-700 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleFileUpload(i, e.target.files)}
                    className="text-xs"
                  />
                  <div className="flex flex-wrap gap-2 justify-center mt-2">
                    {e.evidencias.map((img, idx) => (
                      <img
                        key={idx}
                        src={img.url}
                        alt={img.name}
                        className="w-14 h-14 object-cover rounded border border-gray-600"
                      />
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Gráfico radar */}
      <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
        <Radar data={radarData} options={radarOptions} />
      </div>
    </div>
  );
}

