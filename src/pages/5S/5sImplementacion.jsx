// src/pages/5S/5sImplementacion.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  contarDiasHabiles,
  SECCIONES_5S_DEFAULT,

} from "../../constants/a3Defaults";
import { exportarImplementacionPDF } from "../../reports/5SImplementacionPDF";
import { crearSubtareaBase } from "../../utils/a3Helpers";
export default function FiveSImplementacion() {
  const navigate = useNavigate();
  const [secciones, setSecciones] = useState(SECCIONES_5S_DEFAULT);

  

  // === Cargar y guardar localStorage ===
  useEffect(() => {
    const saved = localStorage.getItem("implementacion5S");
    if (saved) {
      try {
        setSecciones(JSON.parse(saved));
      } catch (error) {
        console.error("Error al cargar datos:", error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("implementacion5S", JSON.stringify(secciones));
  }, [secciones]);

  // === Helpers ===
  const setSeccion = (idx, next) =>
    setSecciones((prev) => {
      const copy = structuredClone(prev);
      copy[idx] = typeof next === "function" ? next(copy[idx]) : next;
      return copy;
    });

  const addTarea = (sIdx) => {
    setSeccion(sIdx, (sec) => ({
      ...sec,
      tareas: [
        ...sec.tareas,
        {
          id: crypto.randomUUID(),
          lugar: "",
          descripcion: "",
          responsable: "",
          inicio: "",
          fin: "",
          dependeDe: null,
          completada: false,
          evidencias: [],
          subtareas: [],
        },
      ],
    }));
  };

  const addSubtarea = (sIdx, tareaId) => {
    setSeccion(sIdx, (sec) => ({
      ...sec,
      tareas: sec.tareas.map((t) =>
        t.id === tareaId
          ? { ...t, subtareas: [...(t.subtareas || []), crearSubtareaBase()] }
          : t
      ),
    }));
  };

  const removeTarea = (sIdx, tareaId) => {
    setSeccion(sIdx, (sec) => ({
      ...sec,
      tareas: sec.tareas
        .filter((t) => t.id !== tareaId)
        .map((t) => (t.dependeDe === tareaId ? { ...t, dependeDe: null } : t)),
    }));
  };

  const removeSubtarea = (sIdx, tareaId, subId) => {
    setSeccion(sIdx, (sec) => ({
      ...sec,
      tareas: sec.tareas.map((t) =>
        t.id === tareaId
          ? { ...t, subtareas: t.subtareas.filter((s) => s.id !== subId) }
          : t
      ),
    }));
  };

  const setTareaField = (sIdx, tareaId, field, value) => {
    setSeccion(sIdx, (sec) => {
      if (tareaId === null) return { ...sec, [field]: value };
      return {
        ...sec,
        tareas: sec.tareas.map((t) =>
          t.id === tareaId ? { ...t, [field]: value } : t
        ),
      };
    });
  };

  const setSubtareaField = (sIdx, tareaId, subId, field, value) => {
    setSeccion(sIdx, (sec) => ({
      ...sec,
      tareas: sec.tareas.map((t) =>
        t.id === tareaId
          ? {
              ...t,
              subtareas: t.subtareas.map((st) =>
                st.id === subId ? { ...st, [field]: value } : st
              ),
            }
          : t
      ),
    }));
  };

  const handleFileUpload = (sIdx, tareaId, files) => {
    const newFiles = Array.from(files).map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }));
    setSeccion(sIdx, (sec) => ({
      ...sec,
      tareas: sec.tareas.map((t) =>
        t.id === tareaId
          ? { ...t, evidencias: [...(t.evidencias || []), ...newFiles] }
          : t
      ),
    }));
  };

  const handleSubtareaFileUpload = (sIdx, tareaId, subId, files) => {
    const newFiles = Array.from(files).map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }));
    setSeccion(sIdx, (sec) => ({
      ...sec,
      tareas: sec.tareas.map((t) =>
        t.id === tareaId
          ? {
              ...t,
              subtareas: t.subtareas.map((st) =>
                st.id === subId
                  ? { ...st, evidencias: [...(st.evidencias || []), ...newFiles] }
                  : st
              ),
            }
          : t
      ),
    }));
  };

  const calcularAvanceS = (tareas) => {
    if (!tareas.length) return 0;
    const total = tareas.flatMap((t) => [t, ...(t.subtareas || [])]);
    const done = total.filter((x) => x.completada).length;
    return Math.round((done / total.length) * 100);
  };

  useEffect(() => {
    setSecciones((prev) =>
      prev.map((s) => ({ ...s, avance: calcularAvanceS(s.tareas) }))
    );
  }, [JSON.stringify(secciones.map((s) => s.tareas))]);

  const avanceGlobal = useMemo(() => {
    if (!secciones.length) return 0;
    const sum = secciones.reduce((acc, s) => acc + (s.avance || 0), 0);
    return (sum / secciones.length).toFixed(1);
  }, [secciones]);

  const guardar = () => alert("Datos guardados correctamente ✅");
  const limpiar = () => {
    if (window.confirm("¿Deseas limpiar todos los datos?")) {
      localStorage.removeItem("implementacion5S");
      setSecciones(SECCIONES_5S_DEFAULT);
    }
  };

  const generarPDF = () =>
    exportarImplementacionPDF(secciones, "Proyecto 5S", "Carlo Guardo");

  // === Render ===
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold text-indigo-400">Implementación 5S</h1>
        <div className="flex gap-2">
          <button
            onClick={() => navigate("/5s/intro")}
            className="bg-indigo-700 px-3 py-2 rounded-lg font-semibold shadow-lg transition"
          >
            Menú 5S
          </button>
          <button
            onClick={guardar}
            className="bg-green-600 px-3 py-2 rounded hover:bg-green-700"
          >
            Guardar
          </button>
          <button
            onClick={limpiar}
            className="bg-red-600 px-3 py-2 rounded hover:bg-red-700"
          >
            Limpiar
          </button>
          <button
            onClick={generarPDF}
            className="bg-pink-600 px-3 py-2 rounded hover:bg-pink-700"
          >
            PDF
          </button>
        </div>
      </div>

      {/* Avance global */}
      <div className="bg-gray-800 p-4 rounded-lg mb-8">
        <p className="text-sm text-gray-400 mb-1">Avance global:</p>
        <div className="w-full bg-gray-700 rounded-full h-4">
          <div
            className="bg-green-500 h-4 rounded-full transition-all duration-500"
            style={{ width: `${avanceGlobal}%` }}
          ></div>
        </div>
        <p className="text-center text-sm mt-2 text-gray-300">{avanceGlobal}%</p>
      </div>

      {/* Secciones */}
      <div className="flex flex-col gap-6">
        {secciones.map((s, sIdx) => (
          <div
            key={sIdx}
            className="bg-gray-800 p-4 rounded-lg border border-gray-700"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-semibold text-indigo-300">{s.nombre}</h2>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-300">
                  Avance:{" "}
                  <span className="font-semibold text-white">{s.avance}%</span>
                </span>
                <button
                  onClick={() => addTarea(sIdx)}
                  className="bg-indigo-600 hover:bg-indigo-700 px-3 py-1 rounded text-sm"
                >
                  + Agregar tarea
                </button>
              </div>
            </div>

            {/* Tabla */}
            <div className="overflow-x-auto">
              <table className="w-full text-center border-collapse">
                <thead>
                  <tr className="bg-gray-700 text-gray-300 text-sm">
                    <th className="p-2 border border-gray-600">Id</th>
                    <th className="p-2 border border-gray-600">Lugar</th>
                    <th className="p-2 border border-gray-600">Descripción</th>
                    <th className="p-2 border border-gray-600">Responsable</th>
                    <th className="p-2 border border-gray-600">Inicio</th>
                    <th className="p-2 border border-gray-600">Fin</th>
                    <th className="p-2 border border-gray-600">Depende de</th>
                    <th className="p-2 border border-gray-600">Estado</th>
                    <th className="p-2 border border-gray-600">Evidencias</th>
                    <th className="p-2 border border-gray-600">Acción</th>
                  </tr>
                </thead>
<tbody>
  {s.tareas.length === 0 ? (
    <tr>
      <td
        colSpan={10}
        className="p-3 text-center text-gray-400 border border-gray-700"
      >
        No hay tareas. Agrega la primera con “+ Agregar tarea”.
      </td>
    </tr>
  ) : (
    s.tareas.map((t, idx) => (
      <React.Fragment key={t.id}>
        {/* 🔹 Tarea principal */}
        <tr className="text-sm align-top bg-gray-800 hover:bg-gray-750">
          <td className="p-2 border border-gray-700">{idx + 1}</td>
          <td className="p-2 border border-gray-700">
            <input
              value={t.lugar}
              onChange={(e) =>
                setTareaField(sIdx, t.id, "lugar", e.target.value)
              }
              className="bg-gray-700 p-1 rounded w-full"
              placeholder="Área / Ubicación"
            />
          </td>
          <td className="p-2 border border-gray-700">
            <textarea
              value={t.descripcion}
              onChange={(e) =>
                setTareaField(sIdx, t.id, "descripcion", e.target.value)
              }
              className="bg-gray-700 p-1 rounded w-full"
              rows={2}
              placeholder="Describe la tarea…"
            />
          </td>
          <td className="p-2 border border-gray-700">
            <input
              value={t.responsable}
              onChange={(e) =>
                setTareaField(sIdx, t.id, "responsable", e.target.value)
              }
              className="bg-gray-700 p-1 rounded w-full"
              placeholder="Nombre"
            />
          </td>
          <td className="p-2 border border-gray-700">
            <input
              type="date"
              value={t.inicio}
              onChange={(e) =>
                setTareaField(sIdx, t.id, "inicio", e.target.value)
              }
              className="bg-gray-700 p-1 rounded w-full"
            />
          </td>
          <td className="p-2 border border-gray-700">
            <input
              type="date"
              value={t.fin}
              onChange={(e) =>
                setTareaField(sIdx, t.id, "fin", e.target.value)
              }
              className="bg-gray-700 p-1 rounded w-full"
            />
          </td>

          {/* 🔁 Selector de dependencia */}
          <td className="p-2 border border-gray-700">
            <select
              value={t.dependeDe ?? ""}
              onChange={(e) =>
                setTareaField(sIdx, t.id, "dependeDe", e.target.value || null)
              }
              className="bg-gray-700 p-1 rounded w-full"
            >
              <option value="">(Sin dependencia)</option>
              {s.tareas
                .filter((x) => x.id !== t.id)
                .map((x, xIdx) => (
                  <option key={x.id} value={x.id}>
                    {xIdx + 1} - {x.descripcion?.slice(0, 40) || "Sin título"}
                  </option>
                ))}
            </select>
          </td>

          <td className="p-2 border border-gray-700">
            <input
              type="checkbox"
              checked={t.completada}
              onChange={(e) =>
                setTareaField(sIdx, t.id, "completada", e.target.checked)
              }
            />
          </td>
          <td className="p-2 border border-gray-700">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFileUpload(sIdx, t.id, e.target.files)}
              className="text-xs"
            />
          </td>
          <td className="p-2 border border-gray-700">
            <button
              onClick={() => addSubtarea(sIdx, t.id)}
              className="bg-indigo-600 hover:bg-indigo-700 text-xs px-2 py-1 rounded"
            >
              + Subtarea
            </button>
          </td>
        </tr>

        {/* 🔹 Subtareas horizontales */}
        {(t.subtareas || []).map((st, stIdx) => {
          const fueraDeRango =
            (st.inicio && new Date(st.inicio) < new Date(t.inicio)) ||
            (st.fin && new Date(st.fin) > new Date(t.fin));

          return (
            <tr
              key={st.id}
              className={`text-xs align-top ${
                fueraDeRango ? "bg-red-900/40" : "bg-gray-900/70"
              }`}
              title={
                fueraDeRango
                  ? "⚠️ Fechas fuera del rango de la tarea principal"
                  : ""
              }
            >
              <td className="p-2 border border-gray-700 text-indigo-400">
                {idx + 1}.{stIdx + 1}
              </td>
              <td className="p-2 border border-gray-700 pl-6">
                <input
                  value={st.lugar}
                  onChange={(e) =>
                    setSubtareaField(
                      sIdx,
                      t.id,
                      st.id,
                      "lugar",
                      e.target.value
                    )
                  }
                  className="bg-gray-700 p-1 rounded w-full"
                  placeholder="Sub-lugar"
                />
              </td>
              <td className="p-2 border border-gray-700">
                <textarea
                  value={st.descripcion}
                  onChange={(e) =>
                    setSubtareaField(
                      sIdx,
                      t.id,
                      st.id,
                      "descripcion",
                      e.target.value
                    )
                  }
                  className="bg-gray-700 p-1 rounded w-full"
                  rows={1}
                  placeholder="Subtarea..."
                />
              </td>
              <td className="p-2 border border-gray-700">
                <input
                  value={st.responsable}
                  onChange={(e) =>
                    setSubtareaField(
                      sIdx,
                      t.id,
                      st.id,
                      "responsable",
                      e.target.value
                    )
                  }
                  className="bg-gray-700 p-1 rounded w-full"
                />
              </td>
              <td className="p-2 border border-gray-700">
                <input
                  type="date"
                  value={st.inicio}
                  onChange={(e) =>
                    setSubtareaField(sIdx, t.id, st.id, "inicio", e.target.value)
                  }
                  className={`bg-gray-700 p-1 rounded w-full ${
                    fueraDeRango ? "border border-red-500" : ""
                  }`}
                />
              </td>
              <td className="p-2 border border-gray-700">
                <input
                  type="date"
                  value={st.fin}
                  onChange={(e) =>
                    setSubtareaField(sIdx, t.id, st.id, "fin", e.target.value)
                  }
                  className={`bg-gray-700 p-1 rounded w-full ${
                    fueraDeRango ? "border border-red-500" : ""
                  }`}
                />
              </td>
              <td className="p-2 border border-gray-700 text-center text-gray-500">
                —
              </td>
              <td className="p-2 border border-gray-700">
                <input
                  type="checkbox"
                  checked={st.completada}
                  onChange={(e) =>
                    setSubtareaField(
                      sIdx,
                      t.id,
                      st.id,
                      "completada",
                      e.target.checked
                    )
                  }
                />
              </td>
              <td className="p-2 border border-gray-700">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) =>
                    handleSubtareaFileUpload(sIdx, t.id, st.id, e.target.files)
                  }
                  className="text-xs"
                />
              </td>
              <td className="p-2 border border-gray-700">
                <button
                  onClick={() => removeSubtarea(sIdx, t.id, st.id)}
                  className="bg-red-600 hover:bg-red-700 text-xs px-2 py-1 rounded"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          );
        })}
      </React.Fragment>
    ))
  )}
</tbody>

              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

