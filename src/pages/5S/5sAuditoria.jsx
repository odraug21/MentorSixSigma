// src/pages/5S/5sAuditoria.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function FiveSAuditoria() {
  const navigate = useNavigate();

  const [evaluacion, setEvaluacion] = useState([
    { nombre: "Seiri - Clasificar", puntuacion: 0, observaciones: "" },
    { nombre: "Seiton - Ordenar", puntuacion: 0, observaciones: "" },
    { nombre: "Seiso - Limpiar", puntuacion: 0, observaciones: "" },
    { nombre: "Seiketsu - Estandarizar", puntuacion: 0, observaciones: "" },
    { nombre: "Shitsuke - Disciplina", puntuacion: 0, observaciones: "" },
  ]);

  const handleChange = (index, field, value) => {
    const updated = [...evaluacion];
    updated[index][field] = value;
    setEvaluacion(updated);
  };

  const promedio =
    evaluacion.reduce((acc, e) => acc + Number(e.puntuacion), 0) /
    evaluacion.length;

  const nivel =
    promedio < 2
      ? "Inicial"
      : promedio < 3.5
      ? "En Progreso"
      : promedio < 4.5
      ? "Avanzado"
      : "Excelente";

  // 🔹 Acciones
  const guardar = () => {
    alert("Auditoría guardada correctamente ✅");
  };

  const limpiar = () => {
    if (window.confirm("¿Deseas limpiar la auditoría?")) {
      setEvaluacion(
        evaluacion.map((e) => ({ ...e, puntuacion: 0, observaciones: "" }))
      );
    }
  };

  const generarPDF = () => {
    alert("Función de exportación a PDF en desarrollo 📄");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">

      {/* 🔹 Barra superior */}
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold text-indigo-400">Auditoría 5S</h1>
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
        Evalúa el cumplimiento de las 5S en tu área. Selecciona una puntuación del 1 al 5
        según el nivel de aplicación de cada “S”.
      </p>

      {/* Tabla de evaluación */}
      <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-700 text-gray-300 text-sm">
              <th className="p-2 border border-gray-600">S</th>
              <th className="p-2 border border-gray-600">Puntuación (1-5)</th>
              <th className="p-2 border border-gray-600">Observaciones</th>
            </tr>
          </thead>
          <tbody>
            {evaluacion.map((e, i) => (
              <tr key={i} className="text-sm">
                <td className="p-2 border border-gray-700 font-semibold text-indigo-300">
                  {e.nombre}
                </td>
                <td className="p-2 border border-gray-700 text-center">
                  <select
                    value={e.puntuacion}
                    onChange={(ev) =>
                      handleChange(i, "puntuacion", ev.target.value)
                    }
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
                    onChange={(ev) =>
                      handleChange(i, "observaciones", ev.target.value)
                    }
                    className="w-full bg-gray-700 p-2 rounded"
                    rows={2}
                    placeholder="Escribe observaciones..."
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Resultado final */}
      <div className="mt-8 bg-gray-800 p-4 rounded-lg border border-gray-700 text-center">
        <h2 className="text-xl font-bold text-green-400 mb-2">Resultado de Auditoría</h2>
        <p className="text-gray-300 text-lg">
          Promedio:{" "}
          <span className="text-white font-semibold">
            {promedio.toFixed(1)} / 5
          </span>
        </p>
        <p className="text-lg font-semibold mt-1">
          Nivel alcanzado:{" "}
          <span
            className={
              nivel === "Excelente"
                ? "text-green-400"
                : nivel === "Avanzado"
                ? "text-blue-400"
                : nivel === "En Progreso"
                ? "text-yellow-400"
                : "text-red-400"
            }
          >
            {nivel}
          </span>
        </p>
      </div>
    </div>
  );
}

