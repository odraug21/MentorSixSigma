import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function GwReporte() {
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [observaciones, setObservaciones] = useState([]);

  useEffect(() => {
    const savedPlan = localStorage.getItem("gembaPlan");
    if (savedPlan) setPlan(JSON.parse(savedPlan));

    const savedObs = localStorage.getItem("gembaEjecucion");
    if (savedObs) setObservaciones(JSON.parse(savedObs));
  }, []);

  // === Función para agregar imágenes al PDF ===
  const agregarEvidencias = async (doc, evidencias) => {
    if (!evidencias.length) return;

    let y = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 100;
    doc.setFontSize(13);
    doc.text("📸 Evidencias fotográficas", 14, y);

    y += 6;
    const imgSize = 35;
    let x = 14;
    let count = 0;

    const cargarImagen = (img) =>
      new Promise((resolve) => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const image = new Image();
        image.crossOrigin = "anonymous";
        image.src = img.url;
        image.onload = () => {
          canvas.width = image.width;
          canvas.height = image.height;
          ctx.drawImage(image, 0, 0);
          const data = canvas.toDataURL("image/jpeg");
          doc.addImage(data, "JPEG", x, y, imgSize, imgSize);
          x += imgSize + 8;
          count++;
          if (count % 5 === 0) {
            x = 14;
            y += imgSize + 8;
          }
          resolve();
        };
        image.onerror = resolve;
      });

    await Promise.all(evidencias.map(cargarImagen));
  };

  // === Generar PDF ===
  const generarPDF = async () => {
    const doc = new jsPDF();
    const fechaHoy = new Date().toLocaleDateString("es-CL");

    // --- Encabezado ---
    doc.setFontSize(18);
    doc.setTextColor(33, 37, 41);
    doc.text("Reporte Gemba Walk", 14, 20);

    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Fecha del reporte: ${fechaHoy}`, 14, 28);
    doc.text(`Área / Planta: ${plan?.area || "-"}`, 14, 34);
    doc.text(`Responsable: ${plan?.responsable || "-"}`, 14, 40);
    doc.text(`Propósito: ${plan?.proposito || "-"}`, 14, 46);

    // --- Participantes ---
    if (plan?.participantes?.length) {
      doc.setTextColor(33);
      doc.setFontSize(13);
      doc.text("👥 Participantes", 14, 56);

      const partRows = plan.participantes.map((p) => [
        p.area,
        p.nombre,
        p.cargo,
      ]);

      doc.autoTable({
        startY: 60,
        head: [["Área / Gerencia", "Nombre y Apellido", "Cargo"]],
        body: partRows,
        theme: "grid",
        headStyles: { fillColor: [255, 221, 87] },
      });
    }

    // --- Observaciones ---
    if (observaciones?.length) {
      const yOffset = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 80;
      doc.setTextColor(33);
      doc.setFontSize(13);
      doc.text("🗒️ Observaciones registradas", 14, yOffset);

      const obsRows = observaciones.map((o) => [
        o.tipo === "buena"
          ? "✅ Buena práctica"
          : o.tipo === "hallazgo"
          ? "⚠️ Hallazgo"
          : "🔧 Acción inmediata",
        o.descripcion || "-",
        o.responsable || "-",
        o.accionDerivada ? "Sí" : "No",
      ]);

      doc.autoTable({
        startY: yOffset + 4,
        head: [["Tipo", "Descripción", "Responsable", "Acción derivada"]],
        body: obsRows,
        theme: "grid",
        styles: { fontSize: 9, cellPadding: 2 },
        headStyles: { fillColor: [255, 221, 87] },
      });
    }

    // --- Evidencias ---
    const evidencias = observaciones.flatMap((o) => o.evidencias || []);
    await agregarEvidencias(doc, evidencias);

    // --- Guardar ---
    doc.save(`GembaWalk_${plan?.area || "reporte"}.pdf`);
  };

  // === Render ===
  if (!plan)
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8 text-center">
        <p className="text-gray-400">No hay datos de planificación cargados.</p>
        <button
          onClick={() => navigate("/gemba/plan")}
          className="mt-4 bg-indigo-700 px-4 py-2 rounded-lg"
        >
          Ir a planificación
        </button>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-yellow-400">
          📄 Reporte Gemba Walk
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => navigate("/gemba/ejecucion")}
            className="bg-gray-700 hover:bg-gray-800 px-3 py-2 rounded-lg"
          >
            Volver
          </button>
          <button
            onClick={generarPDF}
            className="bg-green-600 hover:bg-green-700 px-3 py-2 rounded-lg"
          >
            Generar PDF
          </button>
        </div>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <h2 className="text-xl text-yellow-300 mb-4">📋 Resumen del recorrido</h2>
        <p>
          <strong>Área / Planta:</strong> {plan.area}
        </p>
        <p>
          <strong>Fecha:</strong> {plan.fecha}
        </p>
        <p>
          <strong>Responsable:</strong> {plan.responsable}
        </p>
        <p>
          <strong>Propósito:</strong> {plan.proposito}
        </p>

        <h2 className="text-xl text-yellow-300 mt-6 mb-2">👥 Participantes</h2>
        <ul className="list-disc ml-6 text-gray-300">
          {plan.participantes?.map((p) => (
            <li key={p.id}>
              {p.nombre} ({p.cargo}) – {p.area}
            </li>
          ))}
        </ul>

        <h2 className="text-xl text-yellow-300 mt-6 mb-2">🗒️ Observaciones</h2>
        <ul className="list-disc ml-6 text-gray-300">
          {observaciones?.map((o) => (
            <li key={o.id}>
              <strong>
                {o.tipo === "buena"
                  ? "✅ Buena práctica"
                  : o.tipo === "hallazgo"
                  ? "⚠️ Hallazgo"
                  : "🔧 Acción inmediata"}
              </strong>
              : {o.descripcion} ({o.responsable})
              {o.accionDerivada && (
                <span className="text-yellow-400 ml-1">⚡ Acción derivada</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
