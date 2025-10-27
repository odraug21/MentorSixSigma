// src/reports/5SSeguimientoPDF.jsx
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../img/logoppl2.png";

/**
 * Exporta el reporte de seguimiento 5S consolidado (Implementación + Auditoría)
 * @param {Array} datos - Datos de seguimiento (nombre, inicio, fin, avance, auditoria)
 * @param {String} proyecto - Nombre del proyecto
 * @param {String} responsable - Responsable del proyecto
 */
export const exportarSeguimientoPDF = async (datos, proyecto, responsable = "No asignado") => {
  const doc = new jsPDF("p", "mm", "a4");
  const fecha = new Date().toLocaleDateString("es-CL");

  // === ENCABEZADO ===
  try {
    const img = await getImageBase64(logo);
    doc.addImage(img, "PNG", 14, 6, 28, 12);
  } catch {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("MentorSuites", 20, 15);
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(30, 58, 138);
  doc.text("Informe de Seguimiento 5S", 130, 18, { align: "center" });

  doc.setFontSize(11);
  doc.setTextColor(50);
  doc.text(`Proyecto: ${proyecto}`, 14, 35);
  doc.text(`Responsable: ${responsable}`, 14, 42);
  doc.text(`Fecha de reporte: ${fecha}`, 14, 49);

  // === TABLA PRINCIPAL ===
  const tabla = datos.map((d) => [
    d.nombre,
    d.inicio ? formatDate(d.inicio) : "—",
    d.fin ? formatDate(d.fin) : "—",
    d.avance ? `${d.avance}%` : "0%",
    d.auditoria ? `${d.auditoria}/5` : "—",
    estadoTexto(d),
  ]);

  autoTable(doc, {
    head: [["Etapa", "Inicio", "Fin", "Avance", "Auditoría", "Estado"]],
    body: tabla,
    startY: 60,
    theme: "grid",
    styles: { fontSize: 9, cellPadding: 2 },
    headStyles: { fillColor: [30, 58, 138], textColor: 255, halign: "center" },
    bodyStyles: { textColor: 40, halign: "center" },
  });

  let y = doc.lastAutoTable.finalY + 10;

  // === GRÁFICO (si existe) ===
  try {
    const canvas = document.querySelector("canvas");
    if (canvas) {
      const chartImg = canvas.toDataURL("image/png", 1.0);
      doc.addImage(chartImg, "PNG", 25, y, 160, 90);
      y += 100;
    } else {
      doc.text("No se encontró gráfico de seguimiento.", 20, y);
      y += 10;
    }
  } catch (err) {
    console.error("Error al generar gráfico:", err);
  }

  // === PIE DE PÁGINA ===
  doc.setFontSize(10);
  doc.setTextColor(90);
  doc.text("© MentorSuites — Excelencia Operacional Simplificada", 105, 285, {
    align: "center",
  });

  doc.save(`Seguimiento_5S_${proyecto}_${fecha}.pdf`);
};

// =====================================================
// 🔧 FUNCIONES AUXILIARES
// =====================================================
const formatDate = (date) => new Date(date).toLocaleDateString("es-CL");

function estadoTexto(d) {
  if (d.avance >= 100) return "✅ Completada";
  if (new Date(d.fin) < new Date() && d.avance < 100) return "⚠️ Demorada";
  return "⏳ En progreso";
}

async function getImageBase64(url) {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}
