// src/pages/5S/5sSeguimiento.jsx
import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import html2pdf from "html2pdf.js";

export default function FiveSSeguimiento() {
  const [datos, setDatos] = useState([]);

  // 📥 Cargar datos de auditorías previas desde localStorage
  useEffect(() => {
    const guardados = localStorage.getItem("5s-auditorias-historico");
    if (guardados) setDatos(JSON.parse(guardados));
  }, []);

  // 📊 Configuración del gráfico
  const chartData = {
    labels: datos.map((d) => d.fecha),
    datasets: [
      {
        label: "Promedio 5S",
        data: datos.map((d) => d.promedio),
        borderColor: "#4ade80",
        backgroundColor: "rgba(74,222,128,0.3)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  // 📄 Generar PDF del seguimiento
  const generarPDF = () => {
    const element = document.getElementById("pdf-seguimiento");
    html2pdf().from(element).set({
      margin: 0.5,
      filename: `Seguimiento_5S.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 3 },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    }).save();
  };

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold text-indigo-400">Seguimiento 5S</h1>
        <button
          onClick={generarPDF}
          className="bg-pink-600 px-4 py-2 rounded hover:bg-pink-700"
        >
          Generar PDF
        </button>
      </div>

      <div id="pdf-seguimiento">
        <h2 className="text-lg text-gray-300 mb-2">Evolución de Auditorías</h2>
        {datos.length > 0 ? (
          <div className="bg-gray-800 p-4 rounded-lg">
            <Line data={chartData} />
          </div>
        ) : (
          <p className="text-gray-400">
            Aún no hay datos registrados. Realiza al menos una auditoría.
          </p>
        )}

        <div className="mt-8">
          <h2 className="text-xl font-semibold text-green-400 mb-3">
            Compromisos de mejora continua
          </h2>
          <textarea
            placeholder="Registra las acciones de mejora o compromisos detectados..."
            className="w-full bg-gray-800 p-3 rounded min-h-[120px]"
          />
        </div>
      </div>
    </div>
  );
}
