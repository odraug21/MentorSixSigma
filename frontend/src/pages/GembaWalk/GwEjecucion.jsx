import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function GwEjecucion() {
  const navigate = useNavigate();

  const [plan, setPlan] = useState(null);
  const [observaciones, setObservaciones] = useState([]);

  // 📦 Cargar el plan guardado
  useEffect(() => {
    const savedPlan = localStorage.getItem("gembaPlan");
    if (savedPlan) setPlan(JSON.parse(savedPlan));

    const savedObs = localStorage.getItem("gembaEjecucion");
    if (savedObs) setObservaciones(JSON.parse(savedObs));
  }, []);

  // 💾 Guardar automáticamente
  useEffect(() => {
    localStorage.setItem("gembaEjecucion", JSON.stringify(observaciones));
  }, [observaciones]);

  // ➕ Agregar observación
  const addObs = () => {
    setObservaciones((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        tipo: "hallazgo",
        descripcion: "",
        responsable: "",
        accionDerivada: false,
        evidencias: [],
      },
    ]);
  };

  // 🗑️ Eliminar observación
  const removeObs = (id) =>
    setObservaciones((prev) => prev.filter((o) => o.id !== id));

  // 📝 Actualizar campo
  const setField = (id, field, value) => {
    setObservaciones((prev) =>
      prev.map((o) => (o.id === id ? { ...o, [field]: value } : o))
    );
  };

  // 📸 Subir evidencias
  const handleFileUpload = (id, files) => {
    const newFiles = Array.from(files).map((f) => ({
      name: f.name,
      url: URL.createObjectURL(f),
    }));
    setObservaciones((prev) =>
      prev.map((o) =>
        o.id === id ? { ...o, evidencias: [...(o.evidencias || []), ...newFiles] } : o
      )
    );
  };

  // 💾 Guardar manualmente
  const guardar = () => {
    localStorage.setItem("gembaEjecucion", JSON.stringify(observaciones));
    alert("✅ Ejecución guardada correctamente");
  };

  // 📄 Generar PDF (placeholder)
  const generarPDF = () => {
    alert("📄 Reporte PDF en desarrollo");
  };

  if (!plan)
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8 text-center">
        <p className="text-gray-400">
          No hay planificación cargada. Por favor vuelve al plan.
        </p>
        <button
          onClick={() => navigate("/gemba/plan")}
          className="mt-4 bg-indigo-700 px-4 py-2 rounded-lg"
        >
          Ir a planificación
        </button>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      {/* 🔹 Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-yellow-400">
          🚶 Ejecución Gemba Walk
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => navigate("/gemba/intro")}
            className="bg-gray-700 hover:bg-gray-800 px-3 py-2 rounded-lg"
          >
            Menú Gemba
          </button>
          <button
            onClick={guardar}
            className="bg-green-600 hover:bg-green-700 px-3 py-2 rounded-lg"
          >
            Guardar
          </button>
          <button
            onClick={generarPDF}
            className="bg-pink-600 hover:bg-pink-700 px-3 py-2 rounded-lg"
          >
            PDF
          </button>
        </div>
      </div>

      {/* 🔹 Info general */}
      <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 mb-8">
        <h2 className="text-lg text-yellow-300 mb-2">📋 Planificación</h2>
        <p>
          <strong>Área:</strong> {plan.area || "—"} |{" "}
          <strong>Fecha:</strong> {plan.fecha || "—"}
        </p>
        <p>
          <strong>Responsable:</strong> {plan.responsable || "—"}
        </p>
        <p>
          <strong>Propósito:</strong> {plan.proposito || "—"}
        </p>
      </div>

      {/* 🔹 Tabla de observaciones */}
      <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
        <div className="flex justify-between mb-4">
          <h2 className="text-xl text-yellow-300">🗒️ Observaciones</h2>
          <button
            onClick={addObs}
            className="bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded text-sm"
          >
            + Agregar observación
          </button>
        </div>

        <table className="w-full border-collapse text-sm">
          <thead className="bg-gray-700 text-gray-300">
            <tr>
              <th className="p-2 border border-gray-600">Tipo</th>
              <th className="p-2 border border-gray-600">Descripción</th>
              <th className="p-2 border border-gray-600">Responsable</th>
              <th className="p-2 border border-gray-600">Acción derivada</th>
              <th className="p-2 border border-gray-600">Evidencias</th>
              <th className="p-2 border border-gray-600">Acción</th>
            </tr>
          </thead>
          <tbody>
            {observaciones.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="text-center text-gray-400 py-3 border border-gray-700"
                >
                  No hay observaciones registradas
                </td>
              </tr>
            ) : (
              observaciones.map((o) => (
                <tr key={o.id} className="align-top">
                  <td className="p-2 border border-gray-700">
                    <select
                      value={o.tipo}
                      onChange={(e) => setField(o.id, "tipo", e.target.value)}
                      className="bg-gray-700 p-1 rounded w-full"
                    >
                      <option value="buena">✅ Buena práctica</option>
                      <option value="hallazgo">⚠️ Hallazgo</option>
                      <option value="accion">🔧 Acción inmediata</option>
                    </select>
                  </td>
                  <td className="p-2 border border-gray-700">
                    <textarea
                      value={o.descripcion}
                      onChange={(e) =>
                        setField(o.id, "descripcion", e.target.value)
                      }
                      className="bg-gray-700 p-1 rounded w-full"
                      rows={2}
                    />
                  </td>
                  <td className="p-2 border border-gray-700">
                    <input
                      type="text"
                      value={o.responsable}
                      onChange={(e) =>
                        setField(o.id, "responsable", e.target.value)
                      }
                      className="bg-gray-700 p-1 rounded w-full"
                    />
                  </td>
                  <td className="p-2 border border-gray-700 text-center">
                    <input
                      type="checkbox"
                      checked={o.accionDerivada}
                      onChange={(e) =>
                        setField(o.id, "accionDerivada", e.target.checked)
                      }
                    />
                  </td>
                  <td className="p-2 border border-gray-700">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) =>
                        handleFileUpload(o.id, e.target.files)
                      }
                      className="text-xs"
                    />
                    <div className="flex flex-wrap gap-2 mt-1">
                      {(o.evidencias || []).map((img, i) => (
                        <img
                          key={i}
                          src={img.url}
                          alt={img.name}
                          className="w-14 h-14 object-cover rounded border border-gray-600"
                        />
                      ))}
                    </div>
                  </td>
                  <td className="p-2 border border-gray-700 text-center">
                    <button
                      onClick={() => removeObs(o.id)}
                      className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
