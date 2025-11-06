// src/reports/A3ReportPDF.jsx
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../img/logoppl2.png";

/**
 * Exporta un reporte en formato A3 horizontal
 * con las secciones A, B, C y D del formato MentorSuites.
 */
export function exportarA3PDF(a3, titulo = "A3 - Resolución estructural del problema") {
  const doc = new jsPDF({
    orientation: "landscape", // 🧩 Formato horizontal
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // === 🧾 Encabezado
  doc.addImage(logo, "PNG", 10, 8, 20, 20);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(titulo, pageWidth / 2, 15, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Equipo de Proyecto: ${a3.meta.equipo || "Integrantes del equipo"}`, 15, 25);
  doc.text(`Título: ${a3.meta.titulo || "Sin título"}`, pageWidth - 60, 25);
  doc.text(`Fecha: ${a3.meta.fecha || new Date().toLocaleDateString("es-CL")}`, pageWidth - 35, 25);

  // === 🧱 Cuadrícula A3
  const margin = 10;
  const colWidth = (pageWidth - margin * 2) / 2;
  const rowHeight = (pageHeight - 45) / 2;
  const startY = 35;

  // === 🔹 Sección A
  doc.setFont("helvetica", "bold");
  doc.setTextColor(27, 94, 32);
  doc.rect(margin, startY, colWidth, rowHeight);
  doc.text("A. Descripción del problema / Condición actual / Acciones de contención", margin + 3, startY + 6);
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);

  let textY = startY + 12;
  const textBlock = [
    `Descripción del problema:\n${a3.problema?.descripcion || "Sin descripción."}`,
    `Condición actual:\n${a3.problema?.condicionActual || "Sin condición."}`,
    `Acciones de contención:\n${a3.problema?.accionesContencion || "No indicadas."}`,
    `\nResumen lectura 5W2H (IA / manual):\n${a3.analisis5W2H?.resumen || "Sin resumen."}`,
  ];
  textBlock.forEach((t) => {
    const lines = doc.splitTextToSize(t, colWidth - 8);
    doc.text(lines, margin + 3, textY);
    textY += lines.length * 4 + 2;
  });

  // === 🔹 Sección B
  const colB_X = margin + colWidth;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(106, 27, 154);
  doc.rect(colB_X, startY, colWidth, rowHeight);
  doc.text("B. Encontrar causa raíz (Diagrama Ishikawa)", colB_X + 3, startY + 6);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);

  let yB = startY + 12;
  const causa = a3.causaRaiz?.descripcion || "No se ha especificado la causa raíz.";
  const lineasB = doc.splitTextToSize(causa, colWidth - 8);
  doc.text(lineasB, colB_X + 3, yB);
  yB += lineasB.length * 4 + 3;

  // 💡 Añadir sugerencia IA si existe
  const sugerenciaIA =
    document.getElementById("sugerenciaTextArea")?.value ||
    a3?.sugerenciaIA ||
    "";

  if (sugerenciaIA && sugerenciaIA.trim() !== "") {
    const boxY = yB + 5;
    const textIA = doc.splitTextToSize(sugerenciaIA, colWidth - 10);
    const boxHeight = textIA.length * 4 + 10;

    doc.setFillColor(235, 245, 255);
    doc.rect(colB_X + 2, boxY, colWidth - 4, boxHeight, "F");
    doc.setDrawColor(63, 81, 181);
    doc.rect(colB_X + 2, boxY, colWidth - 4, boxHeight);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(63, 81, 181);
    doc.text("🤖 Sugerencia IA (Gemini)", colB_X + 5, boxY + 6);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.text(textIA, colB_X + 5, boxY + 12);
  }

  // === 🔹 Sección C
  const yC = startY + rowHeight;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(211, 47, 47);
  doc.rect(margin, yC, colWidth, rowHeight);
  doc.text("C. Resolver problema / Contramedidas", margin + 3, yC + 6);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);

  const contrasArray = Array.isArray(a3.contramedidas)
    ? a3.contramedidas
    : a3.contramedidas
    ? [a3.contramedidas]
    : [];

  if (contrasArray.length > 0) {
    const tableData = contrasArray.map((c, i) => [
      i + 1,
      c.descripcion || "-",
      c.responsable || "-",
      c.fecha || "-",
    ]);
    autoTable(doc, {
      startY: yC + 10,
      head: [["#", "Descripción", "Responsable", "Fecha"]],
      body: tableData,
      theme: "grid",
      styles: { fontSize: 7 },
      margin: { left: margin + 2, right: margin + 2 },
      tableWidth: colWidth - 5,
    });
  } else {
    doc.text("No hay acciones correctivas registradas.", margin + 3, yC + 12);
  }

  // === 🔹 Sección D
  const xD = margin + colWidth;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 105, 92);
  doc.rect(xD, yC, colWidth, rowHeight);
  doc.text("D. Validar solución y estandarizar", xD + 3, yC + 6);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);

  const validacionTxt = [
    `Resultados:\n${a3.validacion?.resultados || "Sin resultados."}`,
    `Lecciones aprendidas:\n${a3.validacion?.lecciones || "Sin lecciones registradas."}`,
  ];
  let yD = yC + 12;
  validacionTxt.forEach((t) => {
    const lines = doc.splitTextToSize(t, colWidth - 8);
    doc.text(lines, xD + 3, yD);
    yD += lines.length * 4 + 3;
  });

  // === Pie de página
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text(
    "MentorSuites · Excelencia Operacional Digital",
    pageWidth / 2,
    pageHeight - 5,
    { align: "center" }
  );

  // === Guardar archivo
  doc.save(`A3_${a3.meta.titulo || "Informe"}.pdf`);
}
