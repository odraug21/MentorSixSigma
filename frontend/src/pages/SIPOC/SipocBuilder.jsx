// src/pages/SIPOC/SipocBuilder.jsx
import React, { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import { useNavigate, useParams } from "react-router-dom";
import { apiGet, apiPost, apiPut } from "../../utils/api";

// 🔹 Factory para evitar mutaciones compartidas
const crearSipocBase = () => ({
  suppliers: [""],
  inputs: [""],
  process: [""],
  outputs: [""],
  customers: [""],
});

export default function SipocBuilder() {
  const navigate = useNavigate();
  const { id } = useParams(); // id del SIPOC (opcional)

  const [sipoc, setSipoc] = useState(crearSipocBase);
  const [meta, setMeta] = useState({
    nombre: "",
    proceso: "",
    responsable: "",
  });
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);

  // 🤖 texto de análisis IA
  const [iaTexto, setIaTexto] = useState("");
  const [iaCargando, setIaCargando] = useState(false);

  // 🔹 Cargar SIPOC si hay id o borrador local
  useEffect(() => {
    const cargar = async () => {
      if (!id) {
        const saved = localStorage.getItem("sipoc-draft");
        if (saved) {
          const data = JSON.parse(saved);
          setSipoc(data.sipoc || crearSipocBase());
          setMeta(
            data.meta || { nombre: "", proceso: "", responsable: "" }
          );
        } else {
          setSipoc(crearSipocBase());
        }
        setIaTexto("");
        return;
      }

      try {
        setCargando(true);
        const resp = await apiGet(`/sipoc/${id}`);
        if (resp?.ok && resp.proyecto) {
          setSipoc(resp.proyecto.sipoc || crearSipocBase());
          setMeta({
            nombre: resp.proyecto.nombre || "",
            proceso: resp.proyecto.proceso || "",
            responsable: resp.proyecto.responsable || "",
          });
          setIaTexto("");
        }
      } catch (err) {
        console.error("❌ Error cargando SIPOC:", err);
      } finally {
        setCargando(false);
      }
    };

    cargar();
  }, [id]);

  const handleChange = (section, index, value) => {
    const updatedSection = [...(sipoc[section] || [])];
    updatedSection[index] = value;
    setSipoc({
      ...sipoc,
      [section]: updatedSection,
    });
  };

  const addRow = (section) => {
    const updatedSection = [...(sipoc[section] || []), ""];
    setSipoc({
      ...sipoc,
      [section]: updatedSection,
    });
  };

  const removeRow = (section, index) => {
    const lista = sipoc[section] || [];
    const updated = lista.filter((_, i) => i !== index);
    setSipoc({
      ...sipoc,
      [section]: updated.length ? updated : [""],
    });
  };

  const clearAll = () => {
    if (!window.confirm("¿Deseas limpiar todos los datos del SIPOC?")) return;
    setSipoc(crearSipocBase());
    setIaTexto("");
  };

  const saveDraftLocal = () => {
    localStorage.setItem("sipoc-draft", JSON.stringify({ sipoc, meta }));
    alert("Borrador SIPOC guardado localmente ✅");
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text(`SIPOC - ${meta.nombre || "Sin nombre"}`, 10, 10);

    let y = 20;
    Object.entries(sipoc).forEach(([key, values]) => {
      doc.setFontSize(12);
      doc.text(`${key.toUpperCase()}:`, 10, y);
      y += 8;
      (values || []).forEach((v) => {
        doc.text(`- ${v}`, 20, y);
        y += 6;
      });
      y += 4;
    });

    doc.save("SIPOC.pdf");
  };

  // 🔹 Guardar en BD
  const guardarBD = async () => {
    if (!meta.nombre.trim()) {
      alert("El nombre del SIPOC es obligatorio");
      return;
    }

    try {
      setGuardando(true);
      let resp;

      if (id) {
        resp = await apiPut(`/sipoc/${id}`, {
          ...meta,
          sipoc,
        });
      } else {
        resp = await apiPost("/sipoc", {
          ...meta,
          sipoc,
        });
      }

      if (resp?.ok && resp.proyecto) {
        if (!id) {
          navigate(`/sipoc/builder/${resp.proyecto.id}`);
        }
        alert("✅ SIPOC guardado en la base de datos.");
      } else {
        alert("⚠️ No se pudo guardar el SIPOC (revisa consola).");
      }
    } catch (err) {
      console.error("❌ Error guardando SIPOC:", err);
      alert("❌ Error al guardar SIPOC.");
    } finally {
      setGuardando(false);
    }
  };

  const sections = [
    { id: "suppliers", label: "Suppliers (Proveedores)", color: "bg-red-600" },
    { id: "inputs", label: "Inputs (Entradas)", color: "bg-orange-600" },
    { id: "process", label: "Process (Proceso)", color: "bg-yellow-500" },
    { id: "outputs", label: "Outputs (Salidas)", color: "bg-green-600" },
    { id: "customers", label: "Customers (Clientes)", color: "bg-blue-600" },
  ];

  // 🔹 Generar análisis IA usando apiPost
  const generarAnalisisIA = async () => {
    try {
      setIaCargando(true);

      const resumenSIPOC = Object.entries(sipoc)
        .map(([key, values]) => {
          const titulo = key.toUpperCase();
          const contenido = (values || [])
            .filter((v) => v.trim() !== "")
            .join(", ");
          return `${titulo}: ${contenido}`;
        })
        .join(" | ");

      const prompt = `
Analiza el siguiente diagrama SIPOC y proporciona un diagnóstico operativo Lean:
${resumenSIPOC}

Responde de manera estructurada con:
1️⃣ Una síntesis general del flujo.
2️⃣ Observaciones clave (riesgos, cuellos de botella o redundancias).
3️⃣ Sugerencias de mejora o alineación entre proveedores, entradas, procesos, salidas y clientes.
4️⃣ Mantén un tono profesional, conciso y en español.`;

      // 👉 Se traduce a POST http://localhost:5000/api/sipoc/ia
      const resp = await apiPost("/sipoc/ia", { prompt });

      console.log("🔍 Respuesta IA SIPOC:", resp);

      const texto =
        resp.sugerencia ||
        resp.texto ||
        resp.message ||
        "No se obtuvo respuesta de la IA.";

      setIaTexto(texto);
    } catch (error) {
      console.error("⚠️ Error al generar análisis IA:", error);
      setIaTexto("Error al generar análisis IA.");
    } finally {
      setIaCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Cabecera & meta */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-indigo-400 mb-2">📊 SIPOC</h1>
          {id && (
            <p className="text-xs text-gray-400">
              ID: {id}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 md:items-end">
          <div className="flex flex-wrap gap-2">
            <input
              placeholder="Nombre del SIPOC"
              value={meta.nombre}
              onChange={(e) =>
                setMeta((m) => ({ ...m, nombre: e.target.value }))
              }
              className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm min-w-[180px]"
            />
            <input
              placeholder="Proceso"
              value={meta.proceso}
              onChange={(e) =>
                setMeta((m) => ({ ...m, proceso: e.target.value }))
              }
              className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm min-w-[160px]"
            />
            <input
              placeholder="Responsable"
              value={meta.responsable}
              onChange={(e) =>
                setMeta((m) => ({ ...m, responsable: e.target.value }))
              }
              className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm min-w-[160px]"
            />
          </div>

          <div className="flex flex-wrap gap-2 justify-end mt-2">
            <button
              onClick={saveDraftLocal}
              className="bg-slate-600 px-4 py-2 rounded hover:bg-slate-700 text-sm"
            >
              Guardar borrador local
            </button>
            <button
              onClick={clearAll}
              className="bg-red-600 px-4 py-2 rounded hover:bg-red-700 text-sm"
            >
              Limpiar
            </button>
            <button
              onClick={exportPDF}
              className="bg-green-600 px-4 py-2 rounded hover:bg-green-700 text-sm"
            >
              Exportar PDF
            </button>
            <button
              onClick={guardarBD}
              disabled={guardando}
              className="bg-indigo-600 px-4 py-2 rounded hover:bg-indigo-700 text-sm disabled:opacity-60"
            >
              {guardando ? "Guardando..." : "Guardar en BD"}
            </button>
            <button
              onClick={() => navigate("/sipoc/lista")}
              className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-800 text-sm"
            >
              Lista SIPOC
            </button>
          </div>
        </div>
      </div>

      {cargando ? (
        <p className="text-gray-300">Cargando SIPOC...</p>
      ) : (
        <>
          {/* columnas SIPOC */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {sections.map((section) => (
              <div
                key={section.id}
                className={`${section.color} rounded-lg p-4`}
              >
                <h2 className="text-lg font-semibold mb-3 text-center">
                  {section.label}
                </h2>
                {(sipoc[section.id] || []).map((value, index) => (
                  <div key={index} className="flex items-center gap-2 mb-2">
                    <input
                      value={value}
                      onChange={(e) =>
                        handleChange(section.id, index, e.target.value)
                      }
                      className="flex-1 p-2 rounded bg-gray-800 text-white"
                      placeholder="Escribe aquí..."
                    />
                    <button
                      onClick={() => removeRow(section.id, index)}
                      className="bg-black/30 px-2 py-1 rounded hover:bg-black/50"
                    >
                      ✖
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addRow(section.id)}
                  className="w-full bg-gray-900 py-1 rounded mt-2 hover:bg-gray-700"
                >
                  + Añadir
                </button>
              </div>
            ))}
          </div>

          {/* 🔹 Bloque IA SIPOC */}
          <div className="mt-10 bg-indigo-950 border border-indigo-600 rounded-xl p-6 shadow-lg">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-semibold text-indigo-300">
                🤖 Análisis IA del SIPOC
              </h2>
              <button
                onClick={generarAnalisisIA}
                disabled={iaCargando}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white px-4 py-2 rounded-full shadow transition"
              >
                {iaCargando ? "Generando..." : "Generar Análisis IA"}
              </button>
            </div>

            <textarea
              readOnly
              rows={6}
              className="w-full bg-gray-900 text-white p-3 rounded-lg outline-none resize-none"
              placeholder="Presiona 'Generar Análisis IA' para obtener una evaluación automática..."
              value={iaTexto}
            />
          </div>
        </>
      )}
    </div>
  );
}
