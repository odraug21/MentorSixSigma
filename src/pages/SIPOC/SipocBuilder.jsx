// src/pages/SIPOC/SipocBuilder.jsx
import React, { useState } from "react";
import { jsPDF } from "jspdf";
import { useNavigate } from "react-router-dom";

export default function SipocBuilder() {
  const navigate = useNavigate();
  const [sipoc, setSipoc] = useState({
    suppliers: [""],
    inputs: [""],
    process: [""],
    outputs: [""],
    customers: [""],
  });

  const handleChange = (section, index, value) => {
    const updated = { ...sipoc };
    updated[section][index] = value;
    setSipoc(updated);
  };

  const addRow = (section) => {
    setSipoc({ ...sipoc, [section]: [...sipoc[section], ""] });
  };

  const removeRow = (section, index) => {
    const updated = sipoc[section].filter((_, i) => i !== index);
    setSipoc({ ...sipoc, [section]: updated });
  };

  const clearAll = () => {
    if (!window.confirm("¿Deseas limpiar todos los datos del SIPOC?")) return;
    setSipoc({
      suppliers: [""],
      inputs: [""],
      process: [""],
      outputs: [""],
      customers: [""],
    });
  };

  const saveToLocal = () => {
    localStorage.setItem("sipoc-data", JSON.stringify(sipoc));
    alert("SIPOC guardado localmente ✅");
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("SIPOC Diagram", 10, 10);

    let y = 20;
    Object.entries(sipoc).forEach(([key, values]) => {
      doc.setFontSize(12);
      doc.text(`${key.toUpperCase()}:`, 10, y);
      y += 8;
      values.forEach((v) => {
        doc.text(`- ${v}`, 20, y);
        y += 6;
      });
      y += 4;
    });

    doc.save("SIPOC.pdf");
  };

  const sections = [
    { id: "suppliers", label: "Suppliers (Proveedores)", color: "bg-red-600" },
    { id: "inputs", label: "Inputs (Entradas)", color: "bg-orange-600" },
    { id: "process", label: "Process (Proceso)", color: "bg-yellow-500" },
    { id: "outputs", label: "Outputs (Salidas)", color: "bg-green-600" },
    { id: "customers", label: "Customers (Clientes)", color: "bg-blue-600" },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-indigo-400 mb-4 md:mb-0">📊 SIPOC</h1>
        <div className="flex flex-wrap gap-3">
          <button onClick={saveToLocal} className="bg-indigo-600 px-4 py-2 rounded hover:bg-indigo-700">
            Guardar
          </button>
          <button onClick={clearAll} className="bg-red-600 px-4 py-2 rounded hover:bg-red-700">
            Limpiar
          </button>
          <button onClick={exportPDF} className="bg-green-600 px-4 py-2 rounded hover:bg-green-700">
            Exportar PDF
          </button>
          <button
            onClick={() => navigate("/sipoc/resumen")}
            className="bg-gray-800 px-4 py-2 rounded hover:bg-gray-700"
          >
            ➜ Ver Resumen
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {sections.map((section) => (
          <div key={section.id} className={`${section.color} rounded-lg p-4`}>
            <h2 className="text-lg font-semibold mb-3 text-center">{section.label}</h2>
            {sipoc[section.id].map((value, index) => (
              <div key={index} className="flex items-center gap-2 mb-2">
                <input
                  value={value}
                  onChange={(e) => handleChange(section.id, index, e.target.value)}
                  className="flex-1 p-2 rounded bg-gray-800 text-white"
                  placeholder="Escribe aquí..."
                />
                <button
                  onClick={() => removeRow(section.id, index)}
                  className="bg-black/30 px-2 py-1 rounded hover:bg-black/50"
                >
                  ✖
                </button>
              </div>
            ))}
            <button
              onClick={() => addRow(section.id)}
              className="w-full bg-gray-900 py-1 rounded mt-2 hover:bg-gray-700"
            >
              + Añadir
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}


