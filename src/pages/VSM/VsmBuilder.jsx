import React, { useState, useRef, useEffect } from "react";
import Draggable from "react-draggable";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { VSM_SYMBOLS } from "../../constants/vsmSymbols";
import { useNavigate } from "react-router-dom";
import { Rnd } from "react-rnd";


export default function VsmBuilder() {
  const navigate = useNavigate();
  const [elements, setElements] = useState([]);
  const [connecting, setConnecting] = useState(null);
  const [connections, setConnections] = useState([]);
  const [flowType, setFlowType] = useState("push"); // push/pull
  const canvasRef = useRef();

  // === Cargar desde localStorage ===
  useEffect(() => {
    const saved = localStorage.getItem("vsmLayout");
    if (saved) {
      const parsed = JSON.parse(saved);
      setElements(parsed.elements || []);
      setConnections(parsed.connections || []);
    }
  }, []);

  // === Guardar automáticamente ===
  useEffect(() => {
    localStorage.setItem(
      "vsmLayout",
      JSON.stringify({ elements, connections })
    );
  }, [elements, connections]);

  const addElement = (symbol) => {
    setElements([
      ...elements,
      { ...symbol, x: 100, y: 100, id: Date.now(), color: "#4f46e5" },
    ]);
  };

  const handleDrag = (e, data, id) => {
    setElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, x: data.x, y: data.y } : el))
    );
  };

  const startConnection = (fromId) => {
    if (connecting === fromId) {
      setConnecting(null);
    } else if (connecting) {
      setConnections((prev) => [
        ...prev,
        { from: connecting, to: fromId, type: flowType },
      ]);
      setConnecting(null);
    } else {
      setConnecting(fromId);
    }
  };

  const exportPDF = async () => {
    const canvas = await html2canvas(canvasRef.current);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("l", "mm", "a4");
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, width, height);
    pdf.save("VSM_Mapa.pdf");
  };

  const clearAll = () => {
    if (window.confirm("¿Borrar el mapa completo?")) {
      setElements([]);
      setConnections([]);
      localStorage.removeItem("vsmLayout");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col p-4">
      {/* 🔹 Barra superior */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {VSM_SYMBOLS.map((s) => (
          <button
            key={s.id}
            onClick={() => addElement(s)}
            className="bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded text-sm flex items-center gap-2"
          >
            <span>{s.icon}</span> {s.label}
          </button>
        ))}

        <select
          value={flowType}
          onChange={(e) => setFlowType(e.target.value)}
          className="ml-3 bg-gray-700 text-white p-2 rounded"
        >
          <option value="push">🔴 Push</option>
          <option value="pull">🟢 Pull</option>
        </select>

        <button
          onClick={exportPDF}
          className="ml-auto bg-green-600 hover:bg-green-700 px-3 py-2 rounded"
        >
          Exportar PDF
        </button>
        <button
          onClick={clearAll}
          className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded"
        >
          Limpiar
        </button>
        <button
          onClick={() => navigate("/vsm/vsm")}
          className="bg-indigo-700 hover:bg-indigo-800 px-3 py-2 rounded"
        >
          Analizar flujo (VSA)
        </button>
      </div>

      {/* 🔹 Área del lienzo */}
      <div
        ref={canvasRef}
        className="relative flex-1 bg-gray-800 border border-gray-700 rounded-lg overflow-hidden"
      >
        {/* Conexiones (líneas SVG) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {connections.map((c, i) => {
            const from = elements.find((e) => e.id === c.from);
            const to = elements.find((e) => e.id === c.to);
            if (!from || !to) return null;
            const color = c.type === "push" ? "#ef4444" : "#22c55e";
            const x1 = from.x + 60;
            const y1 = from.y + 40;
            const x2 = to.x + 60;
            const y2 = to.y + 40;
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={color}
                strokeWidth="2"
                markerEnd="url(#arrowhead)"
              />
            );
          })}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="8"
              markerHeight="6"
              refX="8"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill="white" />
            </marker>
          </defs>
        </svg>

        {/* Íconos arrastrables */}
{elements.map((el) => (
  <Rnd
    key={el.id}
    size={{ width: 120, height: "auto" }}
    position={{ x: el.x, y: el.y }}
    onDragStop={(e, d) =>
      setElements((prev) =>
        prev.map((item) =>
          item.id === el.id ? { ...item, x: d.x, y: d.y } : item
        )
      )
    }
    enableResizing={false}
    bounds="parent"
  >
    <div
      className={`cursor-move p-2 rounded-lg text-center shadow-md border-2 ${
        connecting === el.id ? "border-yellow-400" : "border-transparent"
      }`}
      style={{
        backgroundColor: el.color,
        userSelect: "none",
      }}
      onClick={() => startConnection(el.id)}
    >
      <div className="text-2xl">{el.icon}</div>
      <div className="text-xs mt-1">{el.label}</div>
    </div>
  </Rnd>
))}

      </div>
    </div>
  );
}
