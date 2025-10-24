import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function FiveSImplementacion() {
  const navigate = useNavigate();

  // Funciones de control
  const guardar = () => {
    alert("Datos guardados correctamente ✅");
  };

  const limpiar = () => {
    if (window.confirm("¿Deseas limpiar los campos?")) {
      window.location.reload();
    }
  };

  const generarPDF = () => {
    alert("Función de exportación a PDF en desarrollo 📄");
  };

  // Estado de las 5S
  const [secciones, setSecciones] = useState([
    { nombre: "Seiri - Clasificar", descripcion: "", responsable: "", fecha: "", avance: 0, evidencias: [] },
    { nombre: "Seiton - Ordenar", descripcion: "", responsable: "", fecha: "", avance: 0, evidencias: [] },
    { nombre: "Seiso - Limpiar", descripcion: "", responsable: "", fecha: "", avance: 0, evidencias: [] },
    { nombre: "Seiketsu - Estandarizar", descripcion: "", responsable: "", fecha: "", avance: 0, evidencias: [] },
    { nombre: "Shitsuke - Disciplina", descripcion: "", responsable: "", fecha: "", avance: 0, evidencias: [] },
  ]);

  const handleChange = (index, field, value) => {
    const updated = [...secciones];
    updated[index][field] = value;
    setSecciones(updated);
  };

  const handleFileUpload = (index, files) => {
    const updated = [...secciones];
    const newFiles = Array.from(files).map(file => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }));
    updated[index].evidencias.push(...newFiles);
    setSecciones(updated);
  };

  const progresoTotal =
    secciones.reduce((acc, s) => acc + Number(s.avance), 0) / secciones.length;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">

      {/* 🔹 Barra de control superior */}
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold text-indigo-400">Implementación 5S</h1>
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

      {/* 🔹 Contenido de implementación */}
      <p className="text-gray-300 mb-8">
        Registra las actividades, responsables, fechas y evidencia visual de cada etapa 5S.
      </p>

      {/* Indicador de progreso */}
      <div className="bg-gray-800 p-4 rounded-lg mb-8">
        <p className="text-sm text-gray-400 mb-1">Avance global:</p>
        <div className="w-full bg-gray-700 rounded-full h-4">
          <div
            className="bg-green-500 h-4 rounded-full transition-all duration-500"
            style={{ width: `${progresoTotal}%` }}
          ></div>
        </div>
        <p className="text-center text-sm mt-2 text-gray-300">
          {progresoTotal.toFixed(1)}%
        </p>
      </div>

      {/* Tarjetas por S */}
      <div className="grid md:grid-cols-2 gap-6">
        {secciones.map((s, index) => (
          <div key={index} className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <h2 className="text-xl font-semibold text-indigo-400 mb-3">{s.nombre}</h2>

            <label className="block text-sm text-gray-400">Descripción / acción:</label>
            <textarea
              value={s.descripcion}
              onChange={(e) => handleChange(index, "descripcion", e.target.value)}
              className="w-full bg-gray-700 p-2 rounded mb-3"
              rows={2}
              placeholder="Describe la actividad..."
            />

            <div className="flex gap-3 mb-3">
              <div className="flex-1">
                <label className="block text-sm text-gray-400">Responsable:</label>
                <input
                  type="text"
                  value={s.responsable}
                  onChange={(e) => handleChange(index, "responsable", e.target.value)}
                  className="w-full bg-gray-700 p-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400">Fecha:</label>
                <input
                  type="date"
                  value={s.fecha}
                  onChange={(e) => handleChange(index, "fecha", e.target.value)}
                  className="bg-gray-700 p-2 rounded"
                />
              </div>
            </div>

            <label className="block text-sm text-gray-400 mb-1">Avance (%):</label>
            <input
              type="number"
              min="0"
              max="100"
              value={s.avance}
              onChange={(e) => handleChange(index, "avance", e.target.value)}
              className="w-full bg-gray-700 p-2 rounded mb-3"
            />

            <label className="block text-sm text-gray-400 mb-1">Evidencias:</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleFileUpload(index, e.target.files)}
              className="mb-3"
            />

            <div className="flex flex-wrap gap-2">
              {s.evidencias.map((img, i) => (
                <img
                  key={i}
                  src={img.url}
                  alt={img.name}
                  className="w-24 h-20 object-cover rounded"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
