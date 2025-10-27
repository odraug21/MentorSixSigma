// src/reports/5SImplementacionPDF.jsx
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../img/logoppl2.png";

export function exportarImplementacionPDF(secciones, proyecto = "Proyecto 5S", responsable = "Responsable") {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  // 🧾 Encabezado
  doc.addImage(logo, "PNG", 10, 10, 25, 25);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Informe de Implementación 5S", pageWidth / 2, 20, { align: "center" });
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Proyecto: ${proyecto}`, 15, 40);
  doc.text(`Responsable: ${responsable}`, 15, 47);
  doc.text(`Fecha de generación: ${new Date().toLocaleDateString("es-CL")}`, 15, 54);

  let y = 65;

  secciones.forEach((s, idx) => {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(`${s.nombre}`, 15, y);
    doc.setFontSize(10);
    y += 6;
    doc.text(
      `Inicio planificado: ${s.inicioPlanificado || "-"} | Fin planificado: ${s.finPlanificado || "-"} | Duración: ${s.duracion} días hábiles`,
      15,
      y
    );
    y += 4;
    doc.text(`Avance: ${s.avance}%`, 15, y);
    y += 5;

    const tareasTabla = s.tareas.map((t, i) => [
      i + 1,
      t.lugar || "-",
      t.descripcion || "-",
      t.responsable || "-",
      t.inicio || "-",
      t.fin || "-",
      t.completada ? "✅" : "❌",
    ]);

    autoTable(doc, {
  startY: y,
  head: [["#", "Lugar", "Descripción", "Responsable", "Inicio", "Fin", "Estado"]],
  body: tareasTabla,
  theme: "grid",
  styles: { fontSize: 8, cellPadding: 2 },
  headStyles: { fillColor: [63, 81, 181], textColor: 255 },
  margin: { left: 12, right: 12 },
});


    y = doc.lastAutoTable.finalY + 5;

    s.tareas.forEach((t) => {
      if (t.evidencias && t.evidencias.length > 0) {
        doc.setFontSize(10);
        doc.text(`Evidencias (${t.lugar || "Sin ubicación"})`, 15, y);
        y += 3;
        t.evidencias.forEach((img, i) => {
          if (y > 250) {
            doc.addPage();
            y = 20;
          }
          try {
            doc.addImage(img.url, "JPEG", 15 + (i % 3) * 60, y, 50, 40);
            if ((i + 1) % 3 === 0) y += 45;
          } catch {
            doc.text("⚠️ Error cargando imagen", 15, y + 5);
            y += 8;
          }
        });
        y += 50;
      }
    });

    y += 10;
  });

  // Pie de página
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(`Página ${i} de ${totalPages}`, pageWidth - 25, 290);
  }

  doc.save(`Implementacion5S_${new Date().toISOString().split("T")[0]}.pdf`);
}
