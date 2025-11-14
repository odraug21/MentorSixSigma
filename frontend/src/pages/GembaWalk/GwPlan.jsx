// src/pages/GembaWalk/GwPlan.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function GwPlan() {
  const navigate = useNavigate();

  const [plan, setPlan] = useState({
    area: "",
    fecha: "",
    responsable: "",
    proposito: "",
    participantes: [],
  });

  // ➕ Agregar participante
  const addParticipante = () => {
    setPlan((prev) => ({
      ...prev,
      participantes: [
        ...prev.participantes,
        { id: crypto.randomUUID(), area: "", nombre: "", cargo: "" },
      ],
    }));
  };

  // 🗑️ Eliminar participante
  const removeParticipante = (id) => {
    setPlan((prev) => ({
      ...prev,
      participantes: prev.participantes.filter((p) => p.id !== id),
    }));
  };

  // 📝 Editar campo de participante
  const updateParticipante = (id, field, value) => {
    setPlan((prev) => ({
      ...prev,
      participantes: prev.participantes.map((p) =>
        p.id === id ? { ...p, [field]: value } : p
      ),
    }));
  };

  const guardarPlan = () => {
    localStorage.setItem("gembaPlan", JSON.stringify(plan));
    alert("✅ Plan Gemba guardado correctamente");
    navigate("/gemba/ejecucion");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold text-yellow-400 mb-6">
        🗓️ Planificación Gemba Walk
      </h1>

      <div className="max-w-4xl mx-auto bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-lg">
        {/* Datos generales */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-gray-300 mb-1">Área o Planta:</label>
            <input
              type="text"
              value={plan.area}
              onChange={(e) => setPlan({ ...plan, area: e.target.value })}
              className="bg-gray-700 p-2 w-full rounded"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-1">Fecha:</label>
            <input
              type="date"
              value={plan.fecha}
              onChange={(e) => setPlan({ ...plan, fecha: e.target.value })}
              className="bg-gray-700 p-2 w-full rounded"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-1">Responsable:</label>
            <input
              type="text"
              value={plan.responsable}
              onChange={(e) =>
                setPlan({ ...plan, responsable: e.target.value })
              }
              className="bg-gray-700 p-2 w-full rounded"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-1">Propósito:</label>
            <input
              type="text"
              value={plan.proposito}
              onChange={(e) =>
                setPlan({ ...plan, proposito: e.target.value })
              }
              className="bg-gray-700 p-2 w-full rounded"
            />
          </div>
        </div>

        {/* Participantes */}
        <h2 className="text-xl font-semibold text-yellow-400 mb-3">
          Participantes
        </h2>

        <table className="w-full border-collapse mb-4">
          <thead>
            <tr className="bg-gray-700 text-gray-300 text-sm">
              <th className="p-2 border border-gray-600">Área / Gerencia</th>
              <th className="p-2 border border-gray-600">Nombre y Apellido</th>
              <th className="p-2 border border-gray-600">Cargo</th>
              <th className="p-2 border border-gray-600">Acción</th>
            </tr>
          </thead>
          <tbody>
            {plan.participantes.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="text-center text-gray-400 py-3 border border-gray-700"
                >
                  No hay participantes agregados
                </td>
              </tr>
            ) : (
              plan.participantes.map((p) => (
                <tr key={p.id} className="text-sm">
                  <td className="p-2 border border-gray-700">
                    <input
                      type="text"
                      value={p.area}
                      onChange={(e) =>
                        updateParticipante(p.id, "area", e.target.value)
                      }
                      className="bg-gray-700 p-1 rounded w-full"
                    />
                  </td>
                  <td className="p-2 border border-gray-700">
                    <input
                      type="text"
                      value={p.nombre}
                      onChange={(e) =>
                        updateParticipante(p.id, "nombre", e.target.value)
                      }
                      className="bg-gray-700 p-1 rounded w-full"
                    />
                  </td>
                  <td className="p-2 border border-gray-700">
                    <input
                      type="text"
                      value={p.cargo}
                      onChange={(e) =>
                        updateParticipante(p.id, "cargo", e.target.value)
                      }
                      className="bg-gray-700 p-1 rounded w-full"
                    />
                  </td>
                  <td className="p-2 border border-gray-700 text-center">
                    <button
                      onClick={() => removeParticipante(p.id)}
                      className="bg-red-600 hover:bg-red-700 px-2 py-1 text-xs rounded"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <button
          onClick={addParticipante}
          className="bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded mb-6"
        >
          + Agregar participante
        </button>

        {/* Botones finales */}
        <div className="flex justify-between mt-4">
          <button
            onClick={() => navigate("/gemba/intro")}
            className="bg-gray-700 hover:bg-gray-800 px-4 py-2 rounded"
          >
            Menú Gemba
          </button>
          <button
            onClick={guardarPlan}
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-semibold"
          >
            Guardar plan
          </button>
        </div>
      </div>
    </div>
  );
}
