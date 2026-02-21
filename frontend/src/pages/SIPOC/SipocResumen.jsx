// src/pages/SIPOC/SipocResumen.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { jsPDF } from "jspdf";
import { apiGet } from "../../utils/api";

export default function SipocResumen() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [proyecto, setProyecto] = useState(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        const resp = await apiGet(`/sipoc/${id}`);
        if (resp?.ok && resp.proyecto) {
          setProyecto(resp.proyecto);
        }
      } catch (err) {
        console.error("❌ Error cargando resumen SIPOC:", err);
      }
    };
    cargar();
  }, [id]);

  if (!proyecto) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col justify-center items-center">
        <p className="mb-4 text-gray-300">
          ⚠️ No se pudo cargar el SIPOC.
        </p>
        <button
          onClick={() => navigate("/sipoc/lista")}
          className="bg-indigo-600 px-4 py-2 rounded hover:bg-indigo-700"
        >
          Volver a la lista
        </button>
      </div>
    );
  }

  const { nombre, proceso, responsable, sipoc } = proyecto;

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text(`Resumen SIPOC - ${nombre || "Sin nombre"}`, 10, 10);

    let y = 20;
    Object.entries(sipoc || {}).forEach(([key, values]) => {
      doc.setFontSize(12);
      doc.text(`${key.toUpperCase()}:`, 10, y);
      y += 8;
      (values || []).forEach((v) => {
        doc.text(`- ${v}`, 20, y);
        y += 6;
      });
      y += 4;
    });
    doc.save("SIPOC_Resumen.pdf");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold text-indigo-400 mb-2 text-center">
        📊 Resumen del SIPOC
      </h1>
      <p className="text-center text-gray-300 mb-4">
        <span className="font-semibold">{nombre}</span>{" "}
        {proceso && `– ${proceso}`}{" "}
        {responsable && `(Resp: ${responsable})`}
      </p>

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
        {Object.entries(sipoc || {}).map(([key, values]) => (
          <div key={key} className="mb-4">
            <h2 className="text-lg text-indigo-300 font-semibold mb-2">
              {key.toUpperCase()}
            </h2>
            <ul className="list-disc list-inside text-gray-300">
              {(values || []).map((v, i) => (
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
          onClick={() => navigate(`/sipoc/builder/${id}`)}
          className="bg-gray-600 px-6 py-2 rounded hover:bg-gray-700"
        >
          Volver al SIPOC
        </button>
      </div>
    </div>
  );
}
