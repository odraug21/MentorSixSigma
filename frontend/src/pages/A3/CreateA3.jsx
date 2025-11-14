// src/pages/CreateA3.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { defaultA3 } from "../../constants/a3Defaults";
import { useLocalStorageState } from "../../hooks/useLocalStorage";
import { setResumen5W2H } from "../../utils/a3Helpers";
import A3Header from "../../components/A3Header";
import SectionA from "../../components/Sections/SectionA";
import SectionB from "../../components/Sections/SectionB";
import SectionC from "../../components/Sections/SectionC";
import SectionD from "../../components/Sections/SectionD";
import ReactDOM from "react-dom/client";
import {
  crearA3,
  obtenerA3,
  actualizarSeccionA3,
} from "../../utils/apiA3";
import { motion, AnimatePresence } from "framer-motion";

export default function CreateA3() {
  const navigate = useNavigate();
  const { id } = useParams(); // /a3/:id si estás editando uno existente

  const [a3, setA3] = useLocalStorageState("a3-draft", defaultA3);
  const [currentPage, setCurrentPage] = useState(1);
  const [message, setMessage] = useState("");
  const totalPages = 4;

  // 🧩 1. Cargar A3 desde BD si existe ID
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const data = await obtenerA3(id);
        setA3({
          meta: { titulo: data.proyecto.titulo },
          problema: data.problema,
          causas: { ...data.ishikawa, causas: data.causas },
          contramedidas: data.contramedidas[0] || {},
          acciones: data.acciones,
          seguimiento: data.seguimiento || {},
        });
      } catch (err) {
        console.error("⚠️ Error cargando A3:", err);
      }
    })();
  }, [id]);

  // 🧠 Inicializar estructura del 5W2H si no existe
  useEffect(() => {
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
          resumen: "", // ✅ Clave para mostrar el campo manual
        },
      }));
    }
  }, [a3, setA3]);

  // 🧩 2. Guardar sección actual en backend
  const guardarSeccion = async (section, data) => {
    try {
      await actualizarSeccionA3(id, section, data);
      setMessage(`💾 ${section.toUpperCase()} guardado`);
      setTimeout(() => setMessage(""), 2500);
    } catch (err) {
      console.error("❌ Error guardando sección:", err);
      setMessage("Error al guardar cambios");
    }
  };

  // 🧩 3. Auto-guardado al cambiar de página
  const handleNextPage = async () => {
    let section = "";
    let data = {};
    switch (currentPage) {
      case 1:
        section = "problema";
        data = a3.problema;
        break;
      case 2:
        section = "ishikawa";
        data = {
          problema: a3.causas?.problema,
          analisis_ia: a3.causas?.ishikawaIA,
          imagen_url: a3.causas?.imagenes?.[0]?.url || null,
          causas: a3.causas?.lista || [],
        };
        break;
      case 3:
        section = "contramedidas";
        data = { descripcion: a3.contramedidas?.lista?.join("\n") };
        break;
      case 4:
        section = "seguimiento";
        data = a3.seguimiento;
        break;
      default:
        break;
    }

    if (id && section) await guardarSeccion(section, data);
    setCurrentPage((p) => Math.min(totalPages, p + 1));
  };

  // 🧩 4. Generar PDF (sin cambios)
  const handleGeneratePDF = async () => {
    const container = document.createElement("div");
    const footer = document.querySelector("footer");
    if (footer) footer.parentNode.insertBefore(container, footer);
    else document.body.appendChild(container);
    const root = ReactDOM.createRoot(container);
    const { default: A3Pdf } = await import("./A3Pdf");
    root.render(<A3Pdf a3={a3} />);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Encabezado principal */}
        <A3Header
  a3={a3}
  setA3={setA3}
  generatePDF={handleGeneratePDF}
  goTo={navigate}
  setMessage={setMessage}
/>

        {/* Secciones del A3 */}
        {currentPage === 1 && <SectionA a3={a3} setA3={setA3} />}
        {currentPage === 2 && <SectionB a3={a3} setA3={setA3} />}
        {currentPage === 3 && <SectionC a3={a3} setA3={setA3} />}
        {currentPage === 4 && <SectionD a3={a3} setA3={setA3} />}

        {/* Navegación de páginas */}
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
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="bg-indigo-600 px-3 py-2 rounded hover:bg-indigo-700 disabled:opacity-40"
          >
            {currentPage === totalPages ? "Finalizar" : "Siguiente ➡️"}
          </button>
        </div>

{/* ✅ Toast de notificación visual */}
<AnimatePresence>
  {message && (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="fixed top-6 right-6 z-50"
    >
      <div className="bg-green-600 text-white font-semibold px-5 py-3 rounded-xl shadow-lg shadow-green-900/40 border border-green-400 flex items-center gap-2">
        💾 {message}
      </div>
    </motion.div>
  )}
</AnimatePresence>

      </div>
    </div>
  );
}

