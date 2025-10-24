// src/pages/5S/5sImplementacion.jsx
import React, { useState } from "react";
import html2pdf from "html2pdf.js";

export default function FiveSImplementacion() {
  const [data, setData] = useState({
    area: "",
    fecha: new Date().toISOString().slice(0, 10),
    acciones: {
      clasificar: [{ tarea: "", responsable: "", evidencia: [] }],
      ordenar: [{ tarea: "", responsable: "", evidencia: [] }],
      limpiar: [{ tarea: "", responsable: "", evidencia: [] }],
      estandarizar: [{ tarea: "", responsable: "", evidencia: [] }],
      sostener: [{ tarea: "", responsable: "", evidencia: [] }],
    },
  });

  // 📸 Subir imágenes (base64)
  const handleImageUpload = (e, categoria, index) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const copy = { ...data };
        copy.acciones[categoria][index].evidencia.push({
          name: file.name,
          url: event.target.result,
        });
        setData(copy);
      };
      reader.readAsDataURL(file);
    });
  };

  // 🧹 Limpiar formulario
  const limpiar = () => {
    if (window.confirm("¿Seguro que deseas limpiar todo?")) {
      setData({
        area: "",
        fecha: new Date().toISOString().slice(0, 10),
        acciones: {
          clasificar: [{ tarea: "", responsable: "", evidencia: [] }],
          ordenar: [{ tarea: "", responsable: "", evidencia: [] }],
          limpiar: [{ tarea: "", responsable: "", evidencia: [] }],
          estandarizar: [{ tarea: "", responsable: "", evidencia: [] }],
          sostener: [{ tarea: "", responsable: "", evidencia: [] }],
        },
      });
    }
  };

  // 💾 Guardar en LocalStorage
  const guardar = () => {
    localStorage.setItem("5s-implementacion", JSON.stringify(data));
    alert("Progreso guardado correctamente.");
  };

  // 📄 Generar PDF
  const generarPDF = () => {
    const element = document.getElementById("pdf-implementacion");
    html2pdf().from(element).set({
      margin: 0.5,
      filename: `5S_Implementacion_${data.area || "area"}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 3 },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    }).save();
  };

  // 🧱 Renderizar cada S
  const renderSection = (nombre, key) => (
    <div className="border border-gray-700 p-4 rounded-lg bg-gray-800 mb-6" key={key}>
      <h3 className="text-xl text-green-400 font-semibold mb-3">{nombre}</h3>

      {data.acciones[key].map((accion, index) => (
        <div key={index} className="mb-4">
          <textarea
            className="w-full bg-gray-700 p-2 rounded mb-2"
            rows={2}
            placeholder="Describe la acción..."
            value={accion.tarea}
            onChange={(e) => {
              const copy = { ...data };
              copy.acciones[key][index].tarea = e.target.value;
              setData(copy);
            }}
          />
          <input
            className="w-full bg-gray-700 p-2 rounded mb-2"
            placeholder="Responsable"
            value={accion.responsable}
            onChange={(e) => {
              const copy = { ...data };
              copy.acciones[key][index].responsable = e.target.value;
              setData(copy);
            }}
          />
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleImageUpload(e, key, index)}
          />

          <div className="flex flex-wrap gap-2 mt-2">
            {accion.evidencia.map((img, idx) => (
              <img
                key={idx}
                src={img.url}
                alt={img.name}
                className="w-24 h-20 object-cover rounded border border-gray-600"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="p-6 text-white bg-gray-900 min-h-screen">
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold text-indigo-400">
          Implementación de las 5S
        </h1>
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

      <div id="pdf-implementacion" className="space-y-6">
        <div className="flex gap-4 mb-4">
          <input
            className="bg-gray-700 p-2 rounded w-1/2"
            placeholder="Área / Zona"
            value={data.area}
            onChange={(e) => setData({ ...data, area: e.target.value })}
          />
          <input
            type="date"
            className="bg-gray-700 p-2 rounded w-1/2"
            value={data.fecha}
            onChange={(e) => setData({ ...data, fecha: e.target.value })}
          />
        </div>

        {renderSection("1S - Clasificar", "clasificar")}
        {renderSection("2S - Ordenar", "ordenar")}
        {renderSection("3S - Limpiar", "limpiar")}
        {renderSection("4S - Estandarizar", "estandarizar")}
        {renderSection("5S - Sostener", "sostener")}
      </div>
    </div>
  );
}
