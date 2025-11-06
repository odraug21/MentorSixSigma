// src/components/IshikawaDiagram.jsx
import React, { useState } from "react";
import * as htmlToImage from "html-to-image";

export default function IshikawaDiagram({ a3, setA3 }) {
  const categorias = [
    { id: "material", label: "Material", color: "#06b6d4", top: "12%", left: "15%" },
    { id: "medicion", label: "Medición", color: "#8b5cf6", top: "20%", left: "40%" },
    { id: "entorno", label: "Entorno", color: "#eab308", top: "28%", left: "65%" },
    { id: "metodo", label: "Método", color: "#22c55e", top: "62%", left: "65%" },
    { id: "maquina", label: "Máquina", color: "#fb923c", top: "68%", left: "40%" },
    { id: "manoobra", label: "Mano de Obra", color: "#f43f5e", top: "73%", left: "15%" },
  ];

  const [causas, setCausas] = useState(
    categorias.reduce((acc, cat) => {
      acc[cat.id] = [{ id: 1, texto: "", placeholder: `Causa en ${cat.label}` }];
      return acc;
    }, {})
  );

  const agregarCausa = (catId) => {
    setCausas((prev) => ({
      ...prev,
      [catId]: [
        ...prev[catId],
        { id: Date.now(), texto: "", placeholder: `Nueva causa en ${catId}` },
      ],
    }));
  };

  const eliminarCausa = (catId, causaId) => {
    setCausas((prev) => ({
      ...prev,
      [catId]: prev[catId].filter((c) => c.id !== causaId),
    }));
  };

  const analizarConIA = async () => {
    const resumen = categorias
      .map((cat) => `${cat.label}: ${causas[cat.id].map((c) => c.texto).join(", ")}`)
      .join(" | ");
    const problemaUsuario = document.getElementById("problemaTextArea")?.value || "";

    const prompt = `
Analiza este diagrama de Ishikawa (6M).
Problema declarado: ${problemaUsuario}

Categorías y causas:
${resumen}

Entrega:
1) Síntesis del posible problema raíz.
2) Hipótesis de causa principal.
3) Recomendación Lean para validación.
`;

    try {
      // 🔹 Consulta IA
      const response = await fetch("http://localhost:5000/api/ia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ engine: "gemini", prompt }),
      });

      const data = await response.json();
      const textoIA = data.sugerencia || "No se obtuvo respuesta de la IA.";

      // 🧠 Mostrar texto IA
      const out = document.getElementById("sugerenciaTextArea");
      if (out) out.value = textoIA;

      // 🖼️ Capturar el diagrama como imagen con html-to-image
      const node = document.querySelector(".ishikawa-canvas");

      // Ajustes visuales temporales
      node.style.overflow = "visible";
      node.style.padding = "40px";

      const dataUrl = await htmlToImage.toPng(node, {
        cacheBust: true,
        pixelRatio: 3,
        backgroundColor: "#0f172a",
        style: { transform: "scale(1)", transformOrigin: "top left" },
      });

      // 💾 Guardar en A3
      setA3((prev) => {
        const copy = JSON.parse(JSON.stringify(prev));
        if (!copy.causas) copy.causas = {};
        if (!Array.isArray(copy.causas.imagenes)) copy.causas.imagenes = [];

        // Evita duplicados
        const yaExiste = copy.causas.imagenes.some((i) => i.name === "ishikawa.png");
        if (!yaExiste) {
          copy.causas.imagenes.push({ name: "ishikawa.png", url: dataUrl });
        }

        copy.causas.ishikawaIA = textoIA;
        return copy;
      });

      // alert("✅ Diagrama Ishikawa exportado correctamente.");
    } catch (error) {
      console.error("⚠️ Error al analizar/exportar IA:", error);
      const out = document.getElementById("sugerenciaTextArea");
      if (out) out.value = "Error al analizar con IA.";
    }
  };

  return (
    <div className="bg-gray-900 text-white rounded-2xl p-8 shadow-lg relative">
      <style>
  {`
    .ishikawa-canvas input {
      border-radius: 8px !important;
      padding-left: 12px !important;
      padding-right: 12px !important;
      background-color: #1e293b !important;
      border: 1px solid #374151 !important;
      color: #fff !important;
      line-height: 1.6 !important;
      height: 28px !important;
      overflow: visible !important;
      text-overflow: unset !important;
      white-space: nowrap !important;
      box-shadow: none !important;
      outline: none !important;
      font-size: 14px !important;
      font-family: 'Inter', sans-serif !important;
    }

    .ishikawa-canvas input::placeholder {
      color: #9ca3af !important;
      opacity: 1 !important;
    }

    .ishikawa-canvas {
      -webkit-font-smoothing: antialiased !important;
      text-rendering: geometricPrecision !important;
      letter-spacing: 0 !important;
      word-spacing: 0 !important;
      transform: translateZ(0);
    }
  `}
      </style>

      <h2 className="text-2xl font-bold text-blue-400 mb-2 text-center">
        Diagrama de Ishikawa (6M)
      </h2>
      <p className="text-gray-400 text-sm mb-6 text-center">
        Agrega causas por categoría; todo se guarda automáticamente en tu A3.
      </p>

      

      {/* 🟦 Diagrama */}
      <div className="relative w-full h-[950px] overflow-auto flex items-center justify-center">
        <div className="ishikawa-canvas relative w-[1700px] h-[1000px] flex items-center justify-center">
          {/* Espina central */}
          <div className="absolute left-[10%] w-[75%] top-1/2 -translate-y-1/2 h-[3px] bg-blue-500">
            <div className="absolute right-0 top-[-6px] w-0 h-0 border-t-[8px] border-b-[8px] border-l-[14px] border-t-transparent border-b-transparent border-l-blue-500"></div>
          </div>

          {/* PROBLEMA */}
          <div className="absolute right-[-15%] top-1/2 -translate-y-1/2 bg-blue-900 border-2 border-blue-400 rounded-xl p-4 w-64 shadow-lg">
            <strong className="text-blue-300 block text-center mb-2">PROBLEMA</strong>
            <textarea
              id="problemaTextArea"
              className="w-full bg-transparent text-white text-sm outline-none resize-none"
              rows="3"
              placeholder="Describe el problema..."
            />
          </div>

          {/* Categorías */}
          {categorias.map((cat) => (
            <div
              key={cat.id}
              className="absolute flex flex-col items-center bg-gray-800/60 border border-gray-700 rounded-xl p-4 shadow-md hover:border-gray-600 transition"
              style={{
                top: cat.top,
                left: cat.left,
                width: "260px",
                maxHeight: "200px",
                overflowY: "auto",
              }}
            >
              <div
                className="text-sm font-bold mb-2 text-center sticky top-0 bg-gray-800/80 backdrop-blur-sm rounded-md py-1"
                style={{ color: cat.color }}
              >
                {cat.label}
              </div>

              <div className="flex flex-col gap-2 w-full pb-2">
                {causas[cat.id].map((causa) => (
                  <div
                    key={causa.id}
                    className="flex items-center justify-between bg-white/10 border border-gray-700 rounded-full px-4 py-1 text-sm text-white shadow-sm"
                  >
                    <input
                      type="text"
                      value={causa.texto}
                      onChange={(e) => {
                        const nuevoTexto = e.target.value;
                        setCausas((prev) => ({
                          ...prev,
                          [cat.id]: prev[cat.id].map((c) =>
                            c.id === causa.id ? { ...c, texto: nuevoTexto } : c
                          ),
                        }));
                      }}
                      className="bg-transparent outline-none flex-1 text-white"
                      placeholder={causa.placeholder}
                    />
                    <button
                      onClick={() => eliminarCausa(cat.id, causa.id)}
                      className="ml-2 text-yellow-400 hover:text-red-400"
                      title="Eliminar"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => agregarCausa(cat.id)}
                  className="self-center px-3 py-1 bg-gray-700 border border-gray-600 text-xs rounded-full hover:bg-gray-600 transition"
                >
                  + causa
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      

      {/* 📊 Sugerencia IA */}
      <div className="mt-6 bg-indigo-100 border-2 border-indigo-400 rounded-xl p-4 w-full max-w-3xl mx-auto shadow-lg">
        <strong className="text-indigo-700 block text-center mb-2">Sugerencia IA</strong>
        <textarea
          id="sugerenciaTextArea"
          readOnly
          className="w-full bg-transparent text-gray-800 text-sm outline-none resize-none"
          rows="6"
          placeholder="Presiona 'Analizar con IA' para generar una sugerencia..."
          defaultValue={a3?.ishikawaIA || ""}
        />
      </div>

      <div className="flex justify-center mt-6 mb-4">
        <button
          onClick={analizarConIA}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full shadow-md transition"
        >
          Analizar con IA 🤖
        </button>
      </div>



    </div>
  );
}
