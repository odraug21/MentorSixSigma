// src/pages/SIPOC/SipocResumen.jsx
import React, { useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import { useNavigate } from "react-router-dom";

export default function SipocResumen() {
  const navigate = useNavigate();
  const [sipoc, setSipoc] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("sipoc-data");
    if (stored) setSipoc(JSON.parse(stored));
  }, []);

const exportPDF = () => {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text("SIPOC - Mapa de Proceso", 10, 10);

  let y = 20;

  // 🧩 Datos del SIPOC
  Object.entries(sipoc).forEach(([key, values]) => {
    doc.setFontSize(13);
    doc.text(`${key.toUpperCase()}:`, 10, y);
    y += 8;
    doc.setFontSize(11);
    values.forEach((v) => {
      doc.text(`- ${v || "(sin dato)"}`, 20, y);
      y += 6;
    });
    y += 4;
  });

  // 🔹 Espacio antes del resumen interpretativo
  y += 10;
  doc.setFontSize(14);
  doc.text("Interpretación del Proceso SIPOC", 10, y);
  y += 8;
  doc.setFontSize(11);

  const resumen = `
El proceso inicia con los proveedores ${
    sipoc.suppliers.filter(Boolean).join(", ") || "no definidos"
  }, quienes aportan los insumos ${
    sipoc.inputs.filter(Boolean).join(", ") || "no definidos"
  }.
Estos se utilizan en el proceso ${
    sipoc.process.filter(Boolean).join(", ") || "no descrito"
  }, produciendo los resultados ${
    sipoc.outputs.filter(Boolean).join(", ") || "no definidos"
  }, que son entregados a los clientes ${
    sipoc.customers.filter(Boolean).join(", ") || "no definidos"
  }.
`;

  const textoDividido = doc.splitTextToSize(resumen, 180);
  doc.text(textoDividido, 10, y + 6);

  doc.save("SIPOC_Resumen.pdf");
};


  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold text-indigo-400 mb-6">Resumen del SIPOC</h1>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        {Object.entries(sipoc).map(([key, values]) => (
          <div key={key} className="bg-gray-800 p-4 rounded-lg">
            <h2 className="text-lg font-semibold text-indigo-300 mb-2">
              {key.toUpperCase()}
            </h2>
            <ul className="list-disc list-inside text-gray-300">
              {values.map((v, i) => (
                <li key={i}>{v}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* 🔹 Interpretación automática del SIPOC */}
<div className="bg-gray-800 rounded-lg p-6 mt-8">
  <h2 className="text-2xl font-bold text-indigo-400 mb-4">📖 Interpretación del SIPOC</h2>

  {sipoc && (
    <p className="text-gray-300 leading-relaxed">
      Este proceso inicia con los <strong>proveedores</strong> {
        sipoc.suppliers.filter(Boolean).join(", ") || "no definidos"
      }, quienes aportan los <strong>insumos</strong> {
        sipoc.inputs.filter(Boolean).join(", ") || "no definidos"
      }.
      Estos elementos son utilizados en el <strong>proceso</strong> {
        sipoc.process.filter(Boolean).join(", ") || "no descrito"
      }, el cual produce los <strong>resultados</strong> {
        sipoc.outputs.filter(Boolean).join(", ") || "no definidos"
      }.
      Finalmente, estos resultados son entregados a los <strong>clientes</strong> {
        sipoc.customers.filter(Boolean).join(", ") || "no definidos"
      }.
    </p>
  )}
</div>


      <div className="flex gap-4">
        <button
          onClick={() => navigate("/sipoc/builder")}
          className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600"
        >
          ← Volver SIPOC
        </button>
        <button
          onClick={exportPDF}
          className="bg-green-600 px-4 py-2 rounded hover:bg-green-700"
        >
          Exportar PDF
        </button>

              <button
          onClick={() => navigate("/sipoc/intro")}
          className="bg-gray-600 px-6 py-3 rounded-lg text-lg hover:bg-indigo-700 transition"
        >
          Volver al menú SIPOC
      </button>
      </div>
    </div>
  );
}
