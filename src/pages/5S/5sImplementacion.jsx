// src/pages/5S/5sImplementacion.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { contarDiasHabiles, SECCIONES_5S_DEFAULT } from "../../constants/a3Defaults";
import { exportarImplementacionPDF } from "../../reports/5SImplementacionPDF";


export default function FiveSImplementacion() {
  const navigate = useNavigate();

  // Estado inicial desde las constantes globales
  const [secciones, setSecciones] = useState(SECCIONES_5S_DEFAULT);

  // Cargar datos guardados (si existen)
  useEffect(() => {
    const saved = localStorage.getItem("implementacion5S");
    if (saved) {
      try {
        setSecciones(JSON.parse(saved));
      } catch (error) {
        console.error("Error al cargar datos de localStorage:", error);
      }
    }
  }, []);

  // Guardar automáticamente los datos en localStorage
  useEffect(() => {
    localStorage.setItem("implementacion5S", JSON.stringify(secciones));
  }, [secciones]);

  // Funciones de control
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
        },
      ],
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

  const isBlocked = (t, tareas) => {
    if (!t.dependeDe) return false;
    const pred = tareas.find((x) => x.id === t.dependeDe);
    return !pred || !pred.completada;
  };

  const calcularAvanceS = (tareas) => {
    if (!tareas.length) return 0;
    const done = tareas.filter((t) => t.completada).length;
    return Math.round((done / tareas.length) * 100);
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

 
const generarPDF = () => {
  exportarImplementacionPDF(secciones, "Proyecto 5S", "Carlo Guardo");
};

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
  onClick={() => exportarImplementacionPDF(secciones, "Proyecto 5S", "Carlo Guardo")}
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
          <div key={sIdx} className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-semibold text-indigo-300">{s.nombre}</h2>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-300">
                  Avance: <span className="font-semibold text-white">{s.avance}%</span>
                </span>
                <button
                  onClick={() => addTarea(sIdx)}
                  className="bg-indigo-600 hover:bg-indigo-700 px-3 py-1 rounded text-sm"
                >
                  + Agregar tarea
                </button>
              </div>
            </div>

            {/* Fechas planificadas */}
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-400">Inicio planificado:</label>
                <input
                  type="date"
                  value={s.inicioPlanificado}
                  onChange={(e) => {
                    const newInicio = e.target.value;
                    const dias = contarDiasHabiles(newInicio, s.finPlanificado);
                    setTareaField(sIdx, null, "inicioPlanificado", newInicio);
                    setTareaField(sIdx, null, "duracion", dias);
                  }}
                  className="bg-gray-700 p-1 rounded"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400">Fin planificado:</label>
                <input
                  type="date"
                  value={s.finPlanificado}
                  onChange={(e) => {
                    const newFin = e.target.value;
                    const dias = contarDiasHabiles(s.inicioPlanificado, newFin);
                    setTareaField(sIdx, null, "finPlanificado", newFin);
                    setTareaField(sIdx, null, "duracion", dias);
                  }}
                  className="bg-gray-700 p-1 rounded"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400">
                  Duración (días hábiles):
                </label>
                <span className="ml-2 font-semibold text-white">{s.duracion}</span>
              </div>
            </div>

            {/* Tabla */}
            <div className="overflow-x-auto">
              <table className="w-full text-center border-collapse">
                <thead>
                  <tr className="bg-gray-700 text-gray-300 text-sm">
                    <th className="p-2 border border-gray-600">#</th>
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
                    s.tareas.map((t, idx) => {
                      const bloqueada = isBlocked(t, s.tareas);
                      const demora =
                        new Date() > new Date(s.finPlanificado) && !t.fin;

                      return (
                        <tr key={t.id} className="text-sm align-top">
                          <td className="p-2 border border-gray-700">{idx + 1}</td>
                          <td className="p-2 border border-gray-700">
                            <input
                              value={t.lugar}
                              onChange={(e) =>
                                setTareaField(sIdx, t.id, "lugar", e.target.value)
                              }
                              className="bg-gray-700 p-1 rounded w-full"
                              placeholder="Área / Ubicación"
                              disabled={bloqueada && !t.completada}
                            />
                          </td>
                          <td className="p-2 border border-gray-700">
                            <textarea
                              value={t.descripcion}
                              onChange={(e) =>
                                setTareaField(
                                  sIdx,
                                  t.id,
                                  "descripcion",
                                  e.target.value
                                )
                              }
                              className="bg-gray-700 p-1 rounded w-full"
                              rows={2}
                              placeholder="Describe la tarea…"
                              disabled={bloqueada && !t.completada}
                            />
                          </td>
                          <td className="p-2 border border-gray-700">
                            <input
                              value={t.responsable}
                              onChange={(e) =>
                                setTareaField(
                                  sIdx,
                                  t.id,
                                  "responsable",
                                  e.target.value
                                )
                              }
                              className="bg-gray-700 p-1 rounded w-full"
                              placeholder="Nombre"
                              disabled={bloqueada && !t.completada}
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
                              disabled={bloqueada && !t.completada}
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
                              disabled={bloqueada && !t.completada}
                            />
                          </td>
                          <td className="p-2 border border-gray-700">
                            <select
                              value={t.dependeDe ?? ""}
                              onChange={(e) =>
                                setTareaField(
                                  sIdx,
                                  t.id,
                                  "dependeDe",
                                  e.target.value || null
                                )
                              }
                              className="bg-gray-700 p-1 rounded w-full"
                            >
                              <option value="">(Sin dependencia)</option>
                              {s.tareas
                                .filter((x) => x.id !== t.id)
                                .map((x) => (
                                  <option key={x.id} value={x.id}>
                                    Tarea {s.tareas.findIndex((y) => y.id === x.id) + 1}
                                  </option>
                                ))}
                            </select>
                          </td>
                          <td className="p-2 border border-gray-700">
                            <label className="inline-flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={t.completada}
                                onChange={(e) =>
                                  setTareaField(
                                    sIdx,
                                    t.id,
                                    "completada",
                                    e.target.checked
                                  )
                                }
                              />
                              <span>
                                {t.completada ? "Completada" : "Pendiente"}
                              </span>
                            </label>
                          </td>
                          <td className="p-2 border border-gray-700">
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={(e) =>
                                handleFileUpload(sIdx, t.id, e.target.files)
                              }
                              className="text-xs"
                            />
                            <div className="flex gap-2 flex-wrap mt-1">
                              {(t.evidencias || []).map((img, idx) => (
                                <img
                                  key={idx}
                                  src={img.url}
                                  alt={img.name}
                                  className="w-14 h-14 object-cover rounded border border-gray-600"
                                />
                              ))}
                            </div>
                          </td>
                          <td className="p-2 border border-gray-700">
                            <button
                              onClick={() => removeTarea(sIdx, t.id)}
                              className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded"
                            >
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      );
                    })
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
