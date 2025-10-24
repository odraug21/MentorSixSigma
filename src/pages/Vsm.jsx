import React, { useState } from "react";
import { jsPDF } from "jspdf";
import { motion, AnimatePresence } from "framer-motion";

export default function Vsm() {
  const [procesos, setProcesos] = useState([
    { etapa: "Recepción", ct: 10, co: 3, inventario: 20, va: 70, observaciones: "" },
    { etapa: "Producción", ct: 25, co: 5, inventario: 15, va: 80, observaciones: "" },
    { etapa: "Empaque", ct: 12, co: 2, inventario: 10, va: 90, observaciones: "" },
  ]);

  const [unidad, setUnidad] = useState("segundos"); // 👈 NUEVO
  const [mostrarDiagrama, setMostrarDiagrama] = useState(false);

  const handleChange = (i, field, value) => {
    const updated = [...procesos];
    updated[i][field] = value;
    setProcesos(updated);
  };

  const addRow = () =>
    setProcesos([
      ...procesos,
      { etapa: "", ct: "", co: "", inventario: "", va: "", observaciones: "" },
    ]);

  const removeRow = (i) => setProcesos(procesos.filter((_, idx) => idx !== i));

  const clearAll = () => {
    if (window.confirm("¿Deseas limpiar todos los datos del mapa de flujo?")) {
      setProcesos([{ etapa: "", ct: "", co: "", inventario: "", va: "", observaciones: "" }]);
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("📉 VSM - Value Stream Mapping", 10, 10);
    doc.text(`Unidad de tiempo: ${unidad}`, 10, 18);
    let y = 28;
    procesos.forEach((p, idx) => {
      doc.text(`${idx + 1}. ${p.etapa}`, 10, y);
      y += 6;
      doc.text(`CT: ${p.ct} | C/O: ${p.co} | INV: ${p.inventario} | VA%: ${p.va}`, 15, y);
      y += 6;
      doc.text(`Obs: ${p.observaciones}`, 15, y);
      y += 8;
    });
    doc.save("VSM.pdf");
  };

  const totalCT = procesos.reduce((acc, p) => acc + (parseFloat(p.ct) || 0), 0);
  const totalVA = procesos.reduce(
    (acc, p) => acc + ((parseFloat(p.ct) || 0) * (parseFloat(p.va) || 0)) / 100,
    0
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-3">
        <h1 className="text-3xl font-bold text-indigo-400">
          📉 Value Stream Mapping (VSM)
        </h1>

        <div className="flex flex-wrap gap-3 items-center">
          {/* 🔽 Selector de unidades */}
          <select
            value={unidad}
            onChange={(e) => setUnidad(e.target.value)}
            className="bg-gray-700 text-white p-2 rounded border border-gray-600"
          >
            <option value="segundos">Segundos</option>
            <option value="minutos">Minutos</option>
            <option value="horas">Horas</option>
          </select>

          <button onClick={clearAll} className="bg-red-600 px-4 py-2 rounded hover:bg-red-700">
            Limpiar
          </button>
          <button
  onClick={() => {
    localStorage.setItem("vsm-draft", JSON.stringify(procesos));
    alert("✅ Borrador guardado correctamente");
  }}
  className="bg-indigo-600 px-4 py-2 rounded hover:bg-indigo-700"
>
  Guardar
</button>

          <button onClick={exportPDF} className="bg-green-600 px-4 py-2 rounded hover:bg-green-700">
            Exportar PDF
          </button>
          <button
            onClick={() => setMostrarDiagrama(!mostrarDiagrama)}
            className="bg-yellow-500 px-4 py-2 rounded hover:bg-yellow-600 text-black"
          >
            {mostrarDiagrama ? "Ver Tabla" : "Ver Diagrama"}
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!mostrarDiagrama ? (
          <motion.div key="tabla" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <table className="w-full border-collapse bg-gray-800 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gray-700 text-gray-300">
                  <th className="p-2">Etapa</th>
                  <th className="p-2">CT ({unidad})</th>
                  <th className="p-2">C/O ({unidad})</th>
                  <th className="p-2">Inventario</th>
                  <th className="p-2">VA (%)</th>
                  <th className="p-2">Observaciones</th>
                  <th className="p-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {procesos.map((p, i) => (
                  <tr key={i} className="border-t border-gray-700">
                    <td><input value={p.etapa} onChange={(e) => handleChange(i, "etapa", e.target.value)} className="w-full bg-gray-700 p-2 rounded" /></td>
                    <td><input type="number" value={p.ct} onChange={(e) => handleChange(i, "ct", e.target.value)} className="w-full bg-gray-700 p-2 rounded" /></td>
                    <td><input type="number" value={p.co} onChange={(e) => handleChange(i, "co", e.target.value)} className="w-full bg-gray-700 p-2 rounded" /></td>
                    <td><input type="number" value={p.inventario} onChange={(e) => handleChange(i, "inventario", e.target.value)} className="w-full bg-gray-700 p-2 rounded" /></td>
                    <td><input type="number" value={p.va} onChange={(e) => handleChange(i, "va", e.target.value)} className="w-full bg-gray-700 p-2 rounded" /></td>
                    <td><input value={p.observaciones} onChange={(e) => handleChange(i, "observaciones", e.target.value)} className="w-full bg-gray-700 p-2 rounded" /></td>
                    <td>
                      <button onClick={() => removeRow(i)} className="bg-red-600 px-2 py-1 rounded hover:bg-red-700">✖</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button onClick={addRow} className="mt-4 bg-indigo-600 px-4 py-2 rounded hover:bg-indigo-700">
              + Añadir Proceso
            </button>

            <div className="mt-6 bg-gray-800 p-4 rounded-lg">
              <h2 className="text-xl font-semibold text-indigo-400 mb-2">📊 Resumen</h2>
              <p>Total CT: {totalCT.toFixed(2)} {unidad}</p>
              <p>Valor Agregado: {totalVA.toFixed(2)} {unidad} ({((totalVA / totalCT) * 100 || 0).toFixed(1)}%)</p>
              <p>No Valor Agregado: {(totalCT - totalVA).toFixed(2)} {unidad}</p>
            </div>
          </motion.div>
        ) : (
          <motion.div key="diagrama" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="overflow-x-auto mt-10">
            <div className="flex items-center gap-8 min-w-max">
              {procesos.map((p, i) => (
                <div key={i} className="flex items-center">
                  <motion.div
                    className="bg-indigo-600 rounded-lg p-4 text-center shadow-lg min-w-[180px]"
                    whileHover={{ scale: 1.05 }}
                  >
                    <h3 className="font-bold text-lg">{p.etapa || "Etapa"}</h3>
                    <p className="text-sm text-gray-200">CT: {p.ct || 0} {unidad}</p>
                    <p className="text-sm text-gray-200">VA: {p.va || 0}%</p>
                    <p className="text-sm text-gray-200">INV: {p.inventario || 0}</p>
                  </motion.div>
                  {i < procesos.length - 1 && (
                    <svg width="80" height="40" className="mx-2" xmlns="http://www.w3.org/2000/svg">
                      <line x1="0" y1="20" x2="80" y2="20" stroke="white" strokeWidth="2" markerEnd="url(#arrowhead)" />
                      <defs>
                        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                          <polygon points="0 0, 10 3.5, 0 7" fill="white" />
                        </marker>
                      </defs>
                    </svg>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

