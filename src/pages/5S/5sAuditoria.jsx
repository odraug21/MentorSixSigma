// src/pages/5S/5sAuditoria.jsx
import React, { useState } from "react";
import html2pdf from "html2pdf.js";

export default function FiveSAuditoria() {
  const [auditoria, setAuditoria] = useState({
    area: "",
    fecha: new Date().toISOString().slice(0, 10),
    evaluaciones: {
      clasificar: { puntaje: 0, observaciones: "", imagenes: [] },
      ordenar: { puntaje: 0, observaciones: "", imagenes: [] },
      limpiar: { puntaje: 0, observaciones: "", imagenes: [] },
      estandarizar: { puntaje: 0, observaciones: "", imagenes: [] },
      sostener: { puntaje: 0, observaciones: "", imagenes: [] },
    },
  });

  // 📸 Subir imágenes
  const handleImageUpload = (e, key) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const copy = { ...auditoria };
        copy.evaluaciones[key].imagenes.push({
          name: file.name,
          url: event.target.result,
        });
        setAuditoria(copy);
      };
      reader.readAsDataURL(file);
    });
  };

  // 🔢 Calcular promedio general
  const calcularPromedio = () => {
    const valores = Object.values(auditoria.evaluaciones).map((e) => Number(e.puntaje));
    const total = valores.reduce((a, b) => a + b, 0);
    return (total / valores.length).toFixed(2);
  };

  // 💾 Guardar
  const guardar = () => {
    localStorage.setItem("5s-auditoria", JSON.stringify(auditoria));
    alert("Auditoría guardada correctamente.");
  };

  // 🧹 Limpiar
  const limpiar = () => {
    if (window.confirm("¿Deseas limpiar la auditoría?")) {
      setAuditoria({
        area: "",
        fecha: new Date().toISOString().slice(0, 10),
        evaluaciones: {
          clasificar: { puntaje: 0, observaciones: "", imagenes: [] },
          ordenar: { puntaje: 0, observaciones: "", imagenes: [] },
          limpiar: { puntaje: 0, observaciones: "", imagenes: [] },
          estandarizar: { puntaje: 0, observaciones: "", imagenes: [] },
          sostener: { puntaje: 0, observaciones: "", imagenes: [] },
        },
      });
    }
  };

  // 📄 Generar PDF
  const generarPDF = () => {
    const element = document.getElementById("pdf-auditoria");
    html2pdf()
      .from(element)
      .set({
        margin: 0.5,
        filename: `Auditoria_5S_${auditoria.area || "area"}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 3 },
        jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
      })
      .save();
  };

  // 🧱 Renderizar una fila de evaluación
  const renderFila = (nombre, key) => (
    <div key={key} className="border border-gray-700 p-4 rounded-lg bg-gray-800 mb-6">
      <h3 className="text-lg font-semibold text-green-400 mb-2">{nombre}</h3>

      <label className="text-gray-300 text-sm">Puntaje (1 a 5)</label>
      <input
        type="number"
        min="1"
        max="5"
        value={auditoria.evaluaciones[key].puntaje}
        onChange={(e) => {
          const copy = { ...auditoria };
          copy.evaluaciones[key].puntaje = e.target.value;
          setAuditoria(copy);
        }}
        className="w-24 bg-gray-700 p-2 rounded ml-2 text-center"
      />

      <textarea
        className="w-full bg-gray-700 p-2 rounded mt-3"
        rows={3}
        placeholder="Observaciones..."
        value={auditoria.evaluaciones[key].observaciones}
        onChange={(e) => {
          const copy = { ...auditoria };
          copy.evaluaciones[key].observaciones = e.target.value;
          setAuditoria(copy);
        }}
      />

      <div className="mt-2">
        <input type="file" multiple accept="image/*" onChange={(e) => handleImageUpload(e, key)} />
        <div className="flex flex-wrap gap-2 mt-2">
          {auditoria.evaluaciones[key].imagenes.map((img, idx) => (
            <img
              key={idx}
              src={img.url}
              alt={img.name}
              className="w-24 h-20 object-cover rounded border border-gray-600"
            />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 text-white bg-gray-900 min-h-screen">
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold text-indigo-400">Auditoría 5S</h1>
        <div className="flex gap-2">
          <button onClick={guardar} className="bg-indigo-600 px-3 py-2 rounded hover:bg-indigo-700">
            Guardar
          </button>
          <button onClick={limpiar} className="bg-red-600 px-3 py-2 rounded hover:bg-red-700">
            Limpiar
          </button>
          <button onClick={generarPDF} className="bg-pink-600 px-3 py-2 rounded hover:bg-pink-700">
            PDF
          </button>
        </div>
      </div>

      <div id="pdf-auditoria">
        <div className="flex gap-4 mb-4">
          <input
            className="bg-gray-700 p-2 rounded w-1/2"
            placeholder="Área / Zona"
            value={auditoria.area}
            onChange={(e) => setAuditoria({ ...auditoria, area: e.target.value })}
          />
          <input
            type="date"
            className="bg-gray-700 p-2 rounded w-1/2"
            value={auditoria.fecha}
            onChange={(e) => setAuditoria({ ...auditoria, fecha: e.target.value })}
          />
        </div>

        {renderFila("1S - Clasificar", "clasificar")}
        {renderFila("2S - Ordenar", "ordenar")}
        {renderFila("3S - Limpiar", "limpiar")}
        {renderFila("4S - Estandarizar", "estandarizar")}
        {renderFila("5S - Sostener", "sostener")}

        <div className="mt-6 p-4 bg-gray-800 border border-gray-700 rounded-lg">
          <h2 className="text-xl font-bold text-yellow-400 mb-2">Promedio General</h2>
          <p className="text-3xl font-bold text-white">{calcularPromedio()} / 5</p>
        </div>
      </div>
    </div>
  );
}
