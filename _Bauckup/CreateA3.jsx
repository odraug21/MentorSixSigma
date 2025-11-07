// src/pages/A3/CreateA3.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { defaultA3 } from "../src/constants/a3Defaults";
import { useLocalStorageState } from "../src/hooks/useLocalStorage";
import { useUnsavedChangesPrompt } from "../src/hooks/useUnsavedChangesPrompt";
import { setResumen5W2H } from "../src/utils/a3Helpers";
import A3Header from "../src/components/A3Header";
import SectionA from "../src/components/Sections/SectionA";
import SectionB from "../src/components/Sections/SectionB";
import SectionC from "../src/components/Sections/SectionC";
import SectionD from "../src/components/Sections/SectionD";
import A3Pdf from "../src/pages/A3/A3Pdf";
import ReactDOM from "react-dom/client";

export default function CreateA3() {
  const navigate = useNavigate();
  const [a3, setA3] = useLocalStorageState("a3-draft", defaultA3);
  const [message, setMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 4;
  const hasChanges = JSON.stringify(a3) !== JSON.stringify(defaultA3);
  const goTo = useUnsavedChangesPrompt(hasChanges);

  //  Función para exportar JSON
  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(a3, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${a3.meta.titulo || "a3"}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage("Exportado JSON (descarga iniciada)");
    setTimeout(() => setMessage(""), 3000);
  };

  // Generar PDF del A3 completo
const handleGeneratePDF = () => {
  const container = document.createElement("div");

  // 📍 Buscar el footer del layout y montar antes de él
  const footer = document.querySelector("footer");
  if (footer) {
    footer.parentNode.insertBefore(container, footer);
  } else {
    document.body.appendChild(container);
  }
  // Renderiza el componente A3Pdf en memoria
  const root = ReactDOM.createRoot(container);
  import("../components/A3Pdf").then(({ default: A3Pdf }) => {
    root.render(<A3Pdf a3={a3} />);
  });
};



  //  Genera resumen automático 5W2H
useEffect(() => {
  if (!a3) return;

  // Si el objeto analisis5W2H no existe, lo creamos vacío
  if (!a3.analisis5W2H || typeof a3.analisis5W2H !== "object") {
    setA3((prev) => ({
      ...prev,
      analisis5W2H: {
        que: { es: "", noEs: "" },
        cuando: { es: "", noEs: "" },
        donde: { es: "", noEs: "" },
        quien: { es: "", noEs: "" },
        como: { es: "", noEs: "" },
        cuantos: { es: "", noEs: "" },
        por_que: { es: "", noEs: "" },
        resumen: "",
      },
    }));
    return; // salimos para evitar el error de lectura
  }

  const {
    que = { es: "", noEs: "" },
    cuando = { es: "", noEs: "" },
    donde = { es: "", noEs: "" },
    quien = { es: "", noEs: "" },
    como = { es: "", noEs: "" },
    cuantos = { es: "", noEs: "" },
    por_que = { es: "", noEs: "" },
  } = a3.analisis5W2H;

  const resumen = `Problema: ${que.es || "-"} (no es: ${que.noEs || "-"}).
Observado: ${cuando.es || "-"} (no es: ${cuando.noEs || "-"}).
Ubicación: ${donde.es || "-"} (no es: ${donde.noEs || "-"}).
Involucra: ${quien.es || "-"} (no es: ${quien.noEs || "-"}).
Cómo: ${como.es || "-"} (no es: ${como.noEs || "-"}).
Frecuencia/Impacto: ${cuantos.es || "-"} (no es: ${cuantos.noEs || "-"}).
Causa Posible: ${por_que.es || "-"} (no es: ${por_que.noEs || "-"})`;

  setResumen5W2H(a3, setA3, resumen);
}, [a3?.analisis5W2H]);



  //  Render principal
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">

        {/*  Encabezado fijo (se muestra siempre arriba) */}
        <A3Header
          a3={a3}
          setA3={setA3}
          goTo={goTo}
          setMessage={setMessage}
          exportJSON={exportJSON}
          generatePDF={handleGeneratePDF}
        />

        {/*  Secciones del A3 */}
        {currentPage === 1 && <SectionA a3={a3} setA3={setA3} />}
        {currentPage === 2 && <SectionB a3={a3} setA3={setA3} />}
        {currentPage === 3 && <SectionC a3={a3} setA3={setA3} />}
        {currentPage === 4 && <SectionD a3={a3} setA3={setA3} />}

        {/* 🔹 Navegación entre páginas */}
        <div className="flex justify-between mt-6">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="bg-gray-700 px-3 py-2 rounded disabled:opacity-40"
          >
            ⬅️ Anterior
          </button>

          <span className="text-gray-400">
            Página {currentPage} de {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="bg-indigo-600 px-3 py-2 rounded hover:bg-indigo-700 disabled:opacity-40"
          >
            Siguiente ➡️
          </button>
        </div>

        {message && (
          <div className="mt-4 text-sm text-green-400">{message}</div>
        )}
      </div>
    </div>
  );
}


