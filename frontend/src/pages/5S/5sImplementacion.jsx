// ======================================================
// 📌 Implementación 5S (Tareas REALES con Backend)
// ↳ Subtareas y evidencias siguen temporalmente en local
// ======================================================

import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiGet, apiPost, apiPatch, apiDelete } from "../../utils/api";

export default function FiveSImplementacion() {
  const navigate = useNavigate();
  const { id: proyectoId } = useParams(); // ID real del proyecto

  // -------------------------------
  // ESTADO PRINCIPAL
  // -------------------------------
  const [tareas, setTareas] = useState([]);
  const [loading, setLoading] = useState(true);

  // Subtareas y evidencias: todavía en local hasta la siguiente fase
  const [subtareasLocal, setSubtareasLocal] = useState({});
  const [evidenciasLocal, setEvidenciasLocal] = useState({});

  const nuevaTareaBase = {
    lugar: "",
    descripcion: "",
    responsable: "",
    inicio: "",
    fin: "",
    dependeDe: null,
    completada: false,
  };

  // ===========================================
  // 1️⃣ Cargar tareas reales desde el backend
  // ===========================================
  useEffect(() => {
    async function cargar() {
      try {
        const data = await apiGet(`/5s/implementacion/${proyectoId}/tareas`, true);
        setTareas(data);
      } catch (err) {
        console.error("❌ Error cargando tareas:", err);
      } finally {
        setLoading(false);
      }
    }

    cargar();
  }, [proyectoId]);

  // ==================================================
  // 2️⃣ Crear nueva tarea (POST → backend)
  // ==================================================
  const crearTarea = async () => {
    try {
      const nueva = await apiPost(
        `/5s/implementacion/${proyectoId}/tareas`,
        nuevaTareaBase,
        true
      );

      setTareas((prev) => [...prev, nueva]);
    } catch (err) {
      console.error("❌ Error creando tarea:", err);
    }
  };

  // ==================================================
  // 3️⃣ Actualizar tarea (PATCH → backend)
  // ==================================================
  const actualizarTarea = async (tareaId, campo, valor) => {
    try {
      const updated = await apiPatch(
        `/5s/implementacion/tarea/${tareaId}`,
        { [campo]: valor },
        true
      );

      setTareas((prev) =>
        prev.map((t) => (t.id === tareaId ? updated : t))
      );
    } catch (err) {
      console.error("❌ Error actualizando tarea:", err);
    }
  };

  // ==================================================
  // 4️⃣ Eliminar tarea (DELETE → backend)
  // ==================================================
  const eliminarTarea = async (tareaId) => {
    if (!window.confirm("¿Deseas eliminar esta tarea?")) return;

    try {
      await apiDelete(`/5s/implementacion/tarea/${tareaId}`, true);
      setTareas((prev) => prev.filter((t) => t.id !== tareaId));
    } catch (err) {
      console.error("❌ Error eliminando tarea:", err);
    }
  };

// ==================================================
// 5️⃣ Subtareas 100% Backend (Node.js + PostgreSQL)
// ==================================================

// 🔹 Cargar subtareas desde backend
const cargarSubtareas = async (tareaId) => {
  try {
    const data = await apiGet(`/5s/implementacion/tarea/${tareaId}/subtareas`, true);
    setSubtareasLocal((prev) => ({ ...prev, [tareaId]: data }));
  } catch (error) {
    console.error("❌ Error cargando subtareas:", error);
  }
};

// 🔹 Crear subtarea
const addSubtarea = async (tareaId) => {
  try {
    const nueva = await apiPost(
      `/5s/implementacion/tarea/${tareaId}/subtareas`,
      {
        lugar: "",
        descripcion: "",
        responsable: "",
        inicio: "",
        fin: "",
      },
      true
    );

    setSubtareasLocal((prev) => ({
      ...prev,
      [tareaId]: [...(prev[tareaId] || []), nueva],
    }));
  } catch (error) {
    console.error("❌ Error creando subtarea:", error);
  }
};

// 🔹 Actualizar subtarea
const actualizarSubtarea = async (tareaId, subId, campo, valor) => {
  try {
    const updated = await apiPatch(
      `/5s/implementacion/subtarea/${subId}`,
      { [campo]: valor },
      true
    );

    setSubtareasLocal((prev) => ({
      ...prev,
      [tareaId]: prev[tareaId].map((s) =>
        s.id === subId ? updated : s
      ),
    }));
  } catch (error) {
    console.error("❌ Error actualizando subtarea:", error);
  }
};

// 🔹 Eliminar subtarea
const eliminarSubtarea = async (tareaId, subId) => {
  if (!window.confirm("¿Eliminar subtarea permanentemente?")) return;

  try {
    await apiDelete(`/5s/implementacion/subtarea/${subId}`, true);

    setSubtareasLocal((prev) => ({
      ...prev,
      [tareaId]: prev[tareaId].filter((s) => s.id !== subId),
    }));
  } catch (error) {
    console.error("❌ Error eliminando subtarea:", error);
  }
};

// ==================================================
// 6️⃣ Evidencias → Supabase Storage (100% funcional)
// ==================================================
const handleFileUpload = async (tareaId, files, subtareaId = null) => {
  try {
    const file = files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("proyecto_id", proyectoId);   // 👈 OJO: aquí usas proyectoId (lo tienes arriba)
    formData.append("tarea_id", tareaId);
    formData.append("subtarea_id", subtareaId);

    const evidencia = await apiUpload("/5s/evidencias/upload", formData, true);

    // actualizar UI
    setEvidenciasLocal((prev) => ({
      ...prev,
      [tareaId]: [...(prev[tareaId] || []), evidencia],
    }));
  } catch (error) {
    console.error("❌ Error subiendo evidencia:", error);
    alert("Error subiendo archivo");
  }
};


const eliminarEvidencia = async (tareaId, evidenciaId) => {
  if (!window.confirm("¿Eliminar evidencia permanentemente?")) return;

  try {
    await apiDelete(`/5s/evidencias/${evidenciaId}`, true);

    setEvidenciasLocal((prev) => ({
      ...prev,
      [tareaId]: prev[tareaId].filter((ev) => ev.id !== evidenciaId),
    }));
  } catch (error) {
    console.error("❌ Error eliminando evidencia:", error);
    alert("Error eliminando evidencia");
  }
};





  // ==================================================
// RENDER
// ==================================================
return (
  <div className="min-h-screen bg-gray-900 text-white p-8">
    <div className="flex justify-between mb-6">
      <h1 className="text-3xl font-bold text-indigo-400">
        Implementación 5S – Proyecto #{proyectoId}
      </h1>

      <button
        onClick={() => navigate("/5s/proyectos")}
        className="bg-indigo-700 px-4 py-2 rounded hover:bg-indigo-600"
      >
        Volver
      </button>
    </div>

    {/* =========================== */}
    {/* LOADING */}
    {/* =========================== */}
    {loading ? (
      <p className="text-gray-400">Cargando tareas…</p>
    ) : (
      <>
        {/* BOTÓN AGREGAR */}
        <button
          onClick={crearTarea}
          className="bg-green-600 px-3 py-2 rounded mb-4 hover:bg-green-700"
        >
          + Agregar tarea
        </button>

        {/* LISTA DE TAREAS */}
        <div className="space-y-6">
          {tareas.map((t) => (
            <div
              key={t.id}
              className="bg-gray-800 p-4 rounded border border-gray-700"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-indigo-300">
                  Tarea #{t.id}
                </h3>

                <button
                  onClick={() => eliminarTarea(t.id)}
                  className="bg-red-600 px-3 py-1 rounded hover:bg-red-700"
                >
                  Eliminar
                </button>
              </div>

              {/* Campos */}
              <div className="grid grid-cols-4 gap-4 mt-4">
                <input
                  className="bg-gray-700 p-2 rounded"
                  placeholder="Lugar"
                  value={t.lugar || ""}
                  onChange={(e) =>
                    actualizarTarea(t.id, "lugar", e.target.value)
                  }
                />

                <input
                  className="bg-gray-700 p-2 rounded"
                  placeholder="Responsable"
                  value={t.responsable || ""}
                  onChange={(e) =>
                    actualizarTarea(t.id, "responsable", e.target.value)
                  }
                />

                <input
                  type="date"
                  className="bg-gray-700 p-2 rounded"
                  value={t.inicio || ""}
                  onChange={(e) =>
                    actualizarTarea(t.id, "inicio", e.target.value)
                  }
                />

                <input
                  type="date"
                  className="bg-gray-700 p-2 rounded"
                  value={t.fin || ""}
                  onChange={(e) =>
                    actualizarTarea(t.id, "fin", e.target.value)
                  }
                />
              </div>

              {/* =========================== */}
              {/* Evidencias de la TAREA */}
              {/* =========================== */}
              <div className="mt-4">
                <label className="text-sm text-gray-300">Adjuntar evidencia:</label>
                <input
                  type="file"
                  className="mt-1 text-sm"
                  onChange={(e) => handleFileUpload(t.id, e.target.files)}
                />

                {/* Vista previa si existen evidencias */}
                {(evidenciasLocal[t.id] || []).map((ev) => (
                  <div key={ev.id} className="relative">
                    <img
                      src={ev.url}
                      alt="evidencia"
                      className="w-20 h-20 object-cover rounded border border-gray-600"
                    />

                    {/* Botón eliminar */}
                    <button
                      onClick={() => eliminarEvidencia(t.id, ev.id)}
                      className="absolute top-0 right-0 bg-red-600 text-xs px-1 rounded"
                      title="Eliminar"
                    >
                      ✕
                    </button>
                  </div>
                ))}

              </div>

              {/* =========================== */}
              {/* SUBTAREAS */}
              {/* =========================== */}
              <div className="mt-4">
                <button
                  onClick={() => addSubtarea(t.id)}
                  className="bg-indigo-600 px-3 py-1 rounded hover:bg-indigo-700 text-sm"
                >
                  + Subtarea
                </button>

                {(subtareasLocal[t.id] || []).map((s) => (
                  <div
                    key={s.id}
                    className="bg-gray-900 p-3 rounded mt-2 border border-gray-700"
                  >
                    <input
                      className="bg-gray-700 p-1 rounded w-full mb-2"
                      placeholder="Descripción"
                      value={s.descripcion}
                      onChange={(e) =>
                        actualizarSubtarea(
                          t.id,
                          s.id,
                          "descripcion",
                          e.target.value
                        )
                      }
                    />

                    <div className="grid grid-cols-3 gap-2">
                      <input
                        className="bg-gray-700 p-1 rounded"
                        placeholder="Responsable"
                        value={s.responsable}
                        onChange={(e) =>
                          actualizarSubtarea(
                            t.id,
                            s.id,
                            "responsable",
                            e.target.value
                          )
                        }
                      />

                      <input
                        type="date"
                        className="bg-gray-700 p-1 rounded"
                        value={s.inicio}
                        onChange={(e) =>
                          actualizarSubtarea(
                            t.id,
                            s.id,
                            "inicio",
                            e.target.value
                          )
                        }
                      />

                      <input
                        type="date"
                        className="bg-gray-700 p-1 rounded"
                        value={s.fin}
                        onChange={(e) =>
                          actualizarSubtarea(
                            t.id,
                            s.id,
                            "fin",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    {/* Evidencias de SUBTAREA */}
                    <div className="mt-2">
                      <label className="text-xs text-gray-300">
                        Adjuntar evidencia (subtarea):
                      </label>

                      <input
                        type="file"
                        className="mt-1 text-xs"
                        onChange={(e) =>
                          handleFileUpload(t.id, e.target.files, s.id)
                        }
                      />

                      {/* Vista previa */}
                      {(evidenciasLocal[t.id] || [])
                        .filter((ev) => ev.subtarea_id === s.id)
                        .map((ev) => (
                          <img
                            key={ev.id}
                            src={ev.url}
                            alt="evidencia"
                            className="w-16 h-16 mt-2 object-cover rounded border border-gray-600"
                          />
                        ))}
                    </div>

                    <button
                      onClick={() => eliminarSubtarea(t.id, s.id)}
                      className="bg-red-700 px-2 py-1 rounded mt-3 text-xs"
                    >
                      Eliminar subtarea
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </>
    )}
  </div>
);
}
