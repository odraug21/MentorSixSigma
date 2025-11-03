import React, { useState } from "react";

export default function IshikawaDiagram() {
  const categorias = [
    // Superiores
    { id: "material", label: "Material", color: "#06b6d4", top: "12%", left: "15%" },
    { id: "medicion", label: "Medición", color: "#8b5cf6", top: "20%", left: "40%" },
    { id: "entorno", label: "Entorno", color: "#eab308", top: "28%", left: "65%" },
    // Inferiores
    { id: "metodo", label: "Método", color: "#22c55e", top: "62%", left: "65%" },
    { id: "maquina", label: "Máquina", color: "#fb923c", top: "68%", left: "40%" },
    { id: "manoobra", label: "Mano de Obra", color: "#f43f5e", top: "73%", left: "15%" },
  ];

  const [causas, setCausas] = useState(
    categorias.reduce((acc, cat) => {
      acc[cat.id] = [{ id: 1, texto: `Causa en ${cat.label}` }];
      return acc;
    }, {})
  );

  const agregarCausa = (catId) => {
    setCausas((prev) => ({
      ...prev,
      [catId]: [...prev[catId], { id: Date.now(), texto: `Nueva causa en ${catId}` }],
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
      .map(
        (cat) =>
          `${cat.label}: ${causas[cat.id].map((c) => c.texto).join(", ")}`
      )
      .join(" | ");

    const problemaUsuario = document.getElementById("problemaTextArea").value;

    const prompt = `
Analiza este diagrama de Ishikawa (6M) basado en las siguientes categorías y causas.
Problema declarado: ${problemaUsuario}

Categorías y causas:
${resumen}

Proporciona:
1️⃣ Una síntesis del posible problema raíz en lenguaje claro.
2️⃣ Una hipótesis de la causa principal.
3️⃣ Una recomendación Lean para validar esta causa.
`;

    try {
  const response = await fetch("http://localhost:5000/api/ia", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      engine: "gemini", // 👈 fuerza el uso de Gemini
      prompt,
    }),
  });

  const data = await response.json();
  document.getElementById("sugerenciaTextArea").value =
    data.sugerencia || "No se obtuvo respuesta de la IA.";
} catch (error) {
  console.error("⚠️ Error al consultar IA:", error);
  document.getElementById("sugerenciaTextArea").value =
    "Error al analizar con IA.";
}

  };

  return (
    <div className="bg-gray-900 text-white rounded-2xl p-8 shadow-lg relative">
      <h2 className="text-2xl font-bold text-blue-400 mb-2 text-center">
        Diagrama de Ishikawa (6M)
      </h2>
      <p className="text-gray-400 text-sm mb-6 text-center">
        Estructura triangular profesional — agrega causas en cada categoría; todo se guarda en tu A3.
      </p>

      {/* Botón de IA */}
      <div className="flex justify-center mb-4">
        <button
          onClick={analizarConIA}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full shadow-md transition"
        >
          Analizar con IA 🤖
        </button>
      </div>

      {/* Contenedor del diagrama */}
      <div className="relative w-full h-[950px] overflow-auto flex items-center justify-center">
        <div className="relative w-[1700px] h-[1000px] flex items-center justify-center">
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
                    className="flex items-center justify-between bg-white/10 border border-gray-700 rounded-full px-3 py-1 text-sm text-white shadow-sm"
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
                      className="bg-transparent outline-none flex-1 text-white truncate"
                      placeholder="Escribe la causa..."
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
      {/* SUGERENCIA IA (ahora fuera del contenedor del diagrama) */}
<div className="mt-6 bg-indigo-100 border-2 border-indigo-400 rounded-xl p-4 w-full max-w-3xl mx-auto shadow-lg">
  <strong className="text-blue-600 block text-center mb-2">Sugerencia IA</strong>
  <textarea
    id="sugerenciaTextArea"
    readOnly
    className="w-full bg-transparent text-white text-sm outline-none resize-none"
    rows="6"
    placeholder="Presiona 'Analizar con IA' para generar una sugerencia..."
  />
</div>
    </div>
  );
}
