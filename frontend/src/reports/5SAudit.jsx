// src/reports/5SAudit.jsx
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../img/logoppl2.png";

/**
 * Genera el informe PDF de auditoría 5S con logo, evidencias y gráfico radar
 */
export const exportarAuditoriaPDF = async (proyecto, evaluacion, usuario) => {
  const doc = new jsPDF("p", "mm", "a4");
  const fecha = new Date().toLocaleDateString("es-CL");

// === Encabezado MentorSuites ===
try {
  const img = new Image();
  img.src = logo; // Usa el import directo desde ../img/logoppl2.png
  await new Promise((resolve) => {
    img.onload = resolve;
    img.onerror = resolve;
  });
  doc.addImage(img, "PNG", 14, 6, 30, 15); // tamaño ajustado
} catch (err) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
 
}


// === Título ===
doc.setFont("helvetica", "bold");
doc.setFontSize(15);
doc.setTextColor(30, 58, 138);
doc.text("Informe de Auditoría 5S", 130, 18, { align: "center" });

// === Datos generales (sin emojis, con soporte UTF-8 seguro) ===
doc.setFont("helvetica", "normal");
doc.setFontSize(11);
doc.setTextColor(33, 33, 33);

const normalize = (txt) => txt.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

doc.text(normalize(`Proyecto: ${proyecto.nombre}`), 14, 33);
doc.text(normalize(`Responsable: ${proyecto.responsable || "No asignado"}`), 14, 40);
doc.text(normalize(`Auditor: ${usuario}`), 14, 47);
doc.text(normalize(`Fecha de auditoria: ${fecha}`), 14, 54);


  // ===  Tabla de Evaluación ===
  const tabla = evaluacion.map((e) => [
    e.nombre,
    `${e.puntuacion} / 5`,
    nivelTexto(e.puntuacion),
    e.observaciones || "—",
  ]);

  autoTable(doc, {
    head: [["Etapa", "Puntuación", "Nivel", "Observaciones"]],
    body: tabla,
    startY: 63,
    theme: "grid",
    styles: { fontSize: 9, cellPadding: 2 },
    headStyles: { fillColor: [30, 58, 138], textColor: 255, halign: "center" },
    bodyStyles: { textColor: 40, halign: "center" },
  });

  let y = doc.lastAutoTable.finalY + 8;

  // ===  Evidencias visuales (más compactas) ===
  for (let i = 0; i < evaluacion.length; i++) {
    const e = evaluacion[i];
    if (e.evidencias.length > 0) {
      if (y > 230) {
        doc.addPage();
        y = 20;
      }

      doc.setFontSize(11);
      doc.setTextColor(30, 58, 138);
      doc.text(e.nombre, 14, y);
      y += 4;

      for (let j = 0; j < e.evidencias.length && j < 2; j++) {
        const img = e.evidencias[j];
        const image = await getImageBase64(img.url);
        doc.addImage(image, "JPEG", 14 + j * 95, y, 80, 45); // más pequeñas
      }

      y += 50;
    }
  }

  // === Nueva página para el radar ===
  doc.addPage();

  doc.setFontSize(14);
  doc.setTextColor(30, 58, 138);
  doc.text("Gráfico Radar de Evaluación 5S", 105, 20, { align: "center" });

  try {
    const canvas = document.querySelector("canvas");
    if (canvas) {
      const chartImage = canvas.toDataURL("image/png", 1.0);
      doc.addImage(chartImage, "PNG", 30, 30, 150, 120);
    } else {
      doc.setFontSize(10);
      doc.text("No se encontró el gráfico radar para incluir.", 105, 70, { align: "center" });
    }
  } catch {
    doc.text("Error al cargar el gráfico radar.", 105, 70, { align: "center" });
  }

  doc.setFontSize(10);
  doc.setTextColor(80);
  doc.text("Leyenda:", 20, 165);
  doc.text("Deficiente (1-2)   En progreso (3-4)   Excelente (5)", 20, 172);

  // ===  Firma ===
  doc.line(25, 250, 85, 250);
  doc.setFontSize(10);
  doc.text("Firma del Auditor", 35, 257);

  // === Pie MentorSuites ===
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text("© MentorSuites — Excelencia Operacional Simplificada", 105, 285, { align: "center" });

  // ===  Guardar ===
  doc.save(`Auditoria_5S_${proyecto.nombre}_${fecha}.pdf`);
};

// =====================================================
// 🔧 Funciones auxiliares
// =====================================================

function nivelTexto(puntuacion) {
  if (puntuacion <= 2) return "Deficiente";
  if (puntuacion < 4) return "En Progreso";
  return "Excelente";
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
