import React from "react";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";

export default function SipocResumen() {
  const navigate = useNavigate();

  // 🔹 Cargar datos desde localStorage de forma segura
  const savedData = localStorage.getItem("sipoc-data");
  const sipoc = savedData ? JSON.parse(savedData) : null;

  // 🔹 Si no hay datos, mostrar mensaje y opción de volver
  if (!sipoc) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col justify-center items-center">
        <p className="mb-4 text-gray-300">
          ⚠️ No se encontraron datos del SIPOC guardados.
        </p>
        <button
          onClick={() => navigate("/sipoc/builder")}
          className="bg-indigo-600 px-4 py-2 rounded hover:bg-indigo-700"
        >
          Crear nuevo SIPOC
        </button>
      </div>
    );
  }

  // 🔹 Exportar PDF (opcional)
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Resumen SIPOC", 10, 10);
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
    doc.save("SIPOC_Resumen.pdf");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold text-indigo-400 mb-4 text-center">
        📊 Resumen del SIPOC
      </h1>

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
        {Object.entries(sipoc).map(([key, values]) => (
          <div key={key} className="mb-4">
            <h2 className="text-lg text-indigo-300 font-semibold mb-2">
              {key.toUpperCase()}
            </h2>
            <ul className="list-disc list-inside text-gray-300">
              {values.map((v, i) => (
                <li key={i}>{v || "—"}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-4">
        <button
          onClick={exportPDF}
          className="bg-green-600 px-6 py-2 rounded hover:bg-green-700"
        >
          Exportar PDF
        </button>
        <button
          onClick={() => navigate("/sipoc/builder")}
          className="bg-gray-600 px-6 py-2 rounded hover:bg-gray-700"
        >
          Volver al SIPOC
        </button>

        
      </div>
    </div>
  );
}
