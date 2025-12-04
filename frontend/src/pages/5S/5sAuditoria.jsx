// src/pages/5S/5sAuditoria.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { apiGet, apiPost } from "../../utils/api";

// Chart.js – Radar
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { Radar } from "react-chartjs-2";

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

export default function FiveSAuditoriaDetallada() {
  const navigate = useNavigate();
  const { id } = useParams(); // id = proyectoId

  const [proyecto, setProyecto] = useState(null);
  const [secciones, setSecciones] = useState([]);
  const [auditor, setAuditor] = useState("anonimo");
  const [comentarioGlobal, setComentarioGlobal] = useState("");
  const [analisisIA, setAnalisisIA] = useState("");
  const [cargando, setCargando] = useState(true);
  const [cargandoIA, setCargandoIA] = useState (false);

  // =====================================================
  // 1️⃣ Obtener auditor desde el token
  // =====================================================
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setAuditor(decoded.email || decoded.id || "anonimo");
      } catch (err) {
        console.error("❌ Error decodificando token:", err);
      }
    }
  }, []);

  // =====================================================
  // 2️⃣ Cargar auditoría detallada desde backend
  //     (ya viene con evidenciasAntes / evidenciasAhora)
  // =====================================================
  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await apiGet(`/5s/auditoria/${id}`, true);
        setProyecto(data.proyecto);
        setSecciones(data.secciones || []);

        if (data.auditoria?.comentario_global) {
          setComentarioGlobal(data.auditoria.comentario_global);
        }
      } catch (err) {
        console.error("❌ Error cargando auditoría 5S:", err);
        alert("No se pudo cargar la auditoría 5S");
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [id]);

  // =====================================================
  // 3️⃣ Helpers para actualizar estado de secciones
  // =====================================================
  const setSeccion = (idx, next) =>
    setSecciones((prev) => {
      const copy = structuredClone(prev);
      copy[idx] = typeof next === "function" ? next(copy[idx]) : next;
      return copy;
    });

  const setTareaAudField = (sIdx, tareaId, field, value) =>
    setSeccion(sIdx, (sec) => ({
      ...sec,
      tareas: sec.tareas.map((t) =>
        t.id === tareaId ? { ...t, [field]: value } : t
      ),
    }));

// Actualiza una subtarea y recalcula el promedio de la tarea
const setSubtareaAudField = (sIdx, tareaId, subId, field, value) =>
  setSeccion(sIdx, (sec) => {
    const nuevasTareas = (sec.tareas || []).map((t) => {
      if (t.id !== tareaId) return t;

      // 1) Actualizar la subtarea específica
      const nuevasSubtareas = (t.subtareas || []).map((st) =>
        st.id === subId ? { ...st, [field]: value } : st
      );

      // 2) Recalcular promedio de puntuación de todas las subtareas
      const puntajesValidos = nuevasSubtareas
        .map((st) => Number(st.puntuacionAuditoria || 0))
        .filter((n) => n > 0);

      const promedio =
        puntajesValidos.length > 0
          ? Number(
              (
                puntajesValidos.reduce((acc, n) => acc + n, 0) /
                puntajesValidos.length
              ).toFixed(2) // dejamos 2 decimales
            )
          : 0;

      return {
        ...t,
        subtareas: nuevasSubtareas,
        // 👇 aquí guardamos el promedio en la tarea
        puntuacionAuditoria: promedio,
      };
    });

    return { ...sec, tareas: nuevasTareas };
  });


// =====================================================
// 🔹 Generar análisis con IA (Gemini) desde backend
// =====================================================
const generarAnalisisConIA = async () => {
  try {
    // Validación simple: si no hay puntajes, no tiene sentido llamar a IA
    if (!secciones.length) {
      alert("Primero completa la auditoría (puntajes / observaciones) antes de usar IA.");
      return;
    }

    setCargandoIA(true);

    const body = {
      puntajeGlobal,
      nivelGlobal,
      comentarioGlobal,
      secciones,
    };

    const data = await apiPost(
      `/5s/auditoria/${id}/analisis-ia`,
      body,
      true // con token
    );

    setAnalisisIA(data.analisis || "");
  } catch (err) {
    console.error("❌ Error generando análisis IA:", err);
    alert("No se pudo generar el análisis con IA. Revisa la consola del backend.");
  } finally {
    setCargandoIA(false);
  }
};


  // =====================================================
  // 4️⃣ Subir evidencia "AHORA" (auditoría) a backend
  //      y actualizar secciones[*].tareas[*].subtareas[*].evidenciasAhora
  // =====================================================
const handleEvidenciaAhoraUpload = async (subtareaId, files) => {
  const arr = Array.from(files || []);
  if (!arr.length) return;

  const file = arr[0];

  try {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Sesión expirada. Inicia sesión nuevamente.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("subtarea_id", subtareaId);
    formData.append("origen", "auditoria"); // 👈 CLAVE

    const resp = await fetch("http://localhost:5000/api/5s/evidencias/upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!resp.ok) {
      const data = await resp.json().catch(() => ({}));
      console.error("❌ Error backend (auditoría):", data);
      throw new Error(data.message || "Error subiendo evidencia de auditoría");
    }

      const evidencia = await resp.json(); // { id, id_subtarea, url, origen }

      // ✅ Actualizar el estado 'secciones' para mostrar la imagen sin refrescar
      setSecciones((prev) => {
        const nuevo = structuredClone(prev);
        const sec = nuevo[seccionIndex];
        if (!sec) return prev;

        sec.tareas = sec.tareas.map((t) => {
          if (t.id !== tareaId) return t;
          const nuevasSub = t.subtareas.map((st) => {
            if (st.id !== subtareaId) return st;
            const listaAhora = st.evidenciasAhora || [];
            return {
              ...st,
              evidenciasAhora: [
                { id: evidencia.id, url: evidencia.url },
                ...listaAhora,
              ],
            };
          });
          return { ...t, subtareas: nuevasSub };
        });

        nuevo[seccionIndex] = sec;
        return nuevo;
      });
    } catch (err) {
      console.error("❌ Error en handleEvidenciaAhoraUpload:", err);
      alert("Error subiendo archivo: " + err.message);
    }
  };

  // =====================================================
  // 5️⃣ Puntaje global y nivel
  // =====================================================
  const puntajeGlobal = useMemo(() => {
    const puntajes = [];

    secciones.forEach((s) => {
      (s.tareas || []).forEach((t) => {
        if (t.puntuacionAuditoria != null)
          puntajes.push(Number(t.puntuacionAuditoria || 0));
        (t.subtareas || []).forEach((st) => {
          if (st.puntuacionAuditoria != null)
            puntajes.push(Number(st.puntuacionAuditoria || 0));
        });
      });
    });

    if (!puntajes.length) return 0;
    const sum = puntajes.reduce((acc, v) => acc + v, 0);
    return Number((sum / puntajes.length).toFixed(2));
  }, [secciones]);

  const nivelGlobal =
    puntajeGlobal < 2
      ? "Inicial"
      : puntajeGlobal < 3.5
      ? "En Progreso"
      : puntajeGlobal < 4.5
      ? "Avanzado"
      : "Excelente";

  // =====================================================
  // 6️⃣ Radar por etapa (promedio de puntajes por sección)
  // =====================================================
  const radarData = useMemo(() => {
    if (!secciones.length) return null;

    const labels = secciones.map((s) => s.nombre);
    const valores = secciones.map((s) => {
      const pts = [];
      (s.tareas || []).forEach((t) => {
        if (t.puntuacionAuditoria != null)
          pts.push(Number(t.puntuacionAuditoria || 0));
        (t.subtareas || []).forEach((st) => {
          if (st.puntuacionAuditoria != null)
            pts.push(Number(st.puntuacionAuditoria || 0));
        });
      });
      if (!pts.length) return 0;
      return Number(
        (pts.reduce((acc, v) => acc + v, 0) / pts.length).toFixed(2)
      );
    });

    return {
      labels,
      datasets: [
        {
          label: "Nivel por etapa (0–5)",
          data: valores,
          backgroundColor: "rgba(79, 70, 229, 0.4)",
          borderColor: "#818cf8",
          borderWidth: 2,
          pointBackgroundColor: "#22c55e",
        },
      ],
    };
  }, [secciones]);

  const radarOptions = {
    scales: {
      r: {
        min: 0,
        max: 5,
        ticks: { stepSize: 1, color: "#ddd" },
        grid: { color: "#555" },
        pointLabels: { color: "#fff", font: { size: 11 } },
      },
    },
    plugins: {
      legend: { labels: { color: "#fff" } },
    },
  };

  // =====================================================
  // 7️⃣ Guardar auditoría en backend
  // =====================================================
  const guardar = async () => {
    try {
      const resp = await fetch(
        `http://localhost:5000/api/5s/auditoria/${id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
          body: JSON.stringify({
            auditor,
            puntajeGlobal,
            comentario_global: comentarioGlobal,
            secciones,
          }),
        }
      );

      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        console.error("❌ Error backend al guardar auditoría:", data);
        throw new Error(data.message || "Error al guardar la auditoría");
      }

      alert("Auditoría 5S detallada guardada correctamente ✅");
    } catch (err) {
      console.error("❌ Error guardando auditoría 5S:", err);
      alert("Error al guardar la auditoría: " + err.message);
    }
  };

  // =====================================================
  // 8️⃣ Render
  // =====================================================
  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p>Cargando auditoría 5S...</p>
      </div>
    );
  }

  if (!proyecto) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
        <p className="text-red-400 mb-4">
          No se encontró el proyecto seleccionado.
        </p>
        <button
          onClick={() => navigate("/5s/proyectos")}
          className="bg-indigo-600 px-4 py-2 rounded"
        >
          Volver a proyectos
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      {/* ENCABEZADO */}
      <div className="flex justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-indigo-400">
            Auditoría 5S – {proyecto.nombre}
          </h1>
          <p className="text-sm text-gray-300 mt-1">
            <span className="font-semibold text-gray-400">Área:</span>{" "}
            {proyecto.area} &nbsp;·&nbsp;
            <span className="font-semibold text-gray-400">Responsable:</span>{" "}
            {proyecto.responsable} &nbsp;·&nbsp;
            <span className="font-semibold text-gray-400">Empresa:</span>{" "}
            {proyecto.empresa_nombre}
          </p>
          <p className="text-sm text-gray-300 mt-1">
            <span className="font-semibold text-gray-400">Auditor:</span>{" "}
            {auditor} &nbsp;·&nbsp;
            <span className="font-semibold text-gray-400">Nivel actual:</span>{" "}
            {nivelGlobal} ({puntajeGlobal}/5)
          </p>
        </div>

        <div className="flex gap-2 items-center">
          <button
            onClick={() => navigate("/5s/proyectos")}
            className="bg-indigo-600 hover:bg-indigo-700 px-4 py-1.5 rounded-md text-sm font-medium shadow-md transition"
          >
            Menú 5S
          </button>
          <button
            onClick={guardar}
            className="bg-green-600 hover:bg-green-700 px-4 py-1.5 rounded-md text-sm font-medium shadow-md transition"
          >
            Guardar
          </button>
        </div>
      </div>

      {/* Comentario global */}
      <div className="bg-gray-800 p-4 rounded-lg mb-6 border border-gray-700">
        <label className="block text-sm text-gray-300 mb-1">
          Comentario global de la auditoría:
        </label>
        <textarea
          value={comentarioGlobal}
          onChange={(e) => setComentarioGlobal(e.target.value)}
          className="w-full bg-gray-700 p-2 rounded text-sm"
          rows={3}
          placeholder="Resumen general, hallazgos principales, acuerdos..."
        />
      </div>

      {/* MATRIZ POR SECCIÓN */}
      <div className="flex flex-col gap-6">
        {secciones.map((s, sIdx) => (
          <div
            key={sIdx}
            className="bg-gray-800 p-4 rounded-lg border border-gray-700"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-semibold text-indigo-300">
                {s.nombre}
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-700 text-gray-300">
                    <th className="p-2 border border-gray-600 w-16">Id</th>
                    <th className="p-2 border border-gray-600 w-48 text-left">
                      Lugar
                    </th>
                    <th className="p-2 border border-gray-600 text-left">
                      Descripción
                    </th>
                    <th className="p-2 border border-gray-600 w-40">
                      Puntuación
                    </th>
                    <th className="p-2 border border-gray-600 w-72">
                      Observaciones (ahora)
                    </th>
                    <th className="p-2 border border-gray-600 w-52">
                      Evidencias implementación (antes)
                    </th>
                    <th className="p-2 border border-gray-600 w-56">
                      Evidencias auditoría (ahora)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(!s.tareas || s.tareas.length === 0) && (
                    <tr>
                      <td
                        colSpan={7}
                        className="p-3 text-center text-gray-400 border border-gray-700"
                      >
                        No hay tareas en esta sección para auditar.
                      </td>
                    </tr>
                  )}

                  {s.tareas.map((t, idx) => (
                    <React.Fragment key={t.id}>
                      {/* TAREA */}
                      <tr className="bg-gray-800 align-top">
                        <td className="p-2 border border-gray-700 text-center font-semibold">
                          {idx + 1}
                        </td>
                        <td className="p-2 border border-gray-700 text-left">
                          <div className="text-xs">{t.lugar || "—"}</div>
                        </td>
                        <td className="p-2 border border-gray-700 text-left">
                          <div className="text-xs">
                            {t.descripcion || "—"}
                          </div>
                        </td>
                        <td className="p-2 border border-gray-700 text-center">
                          <select
                            value={t.puntuacionAuditoria || 0}
                            onChange={(e) =>
                              setTareaAudField(
                                sIdx,
                                t.id,
                                "puntuacionAuditoria",
                                Number(e.target.value)
                              )
                            }
                            className="bg-gray-700 p-1 rounded w-full text-xs"
                          >
                            <option value={0}>--</option>
                            <option value={1}>1 - Deficiente</option>
                            <option value={2}>2 - Básico</option>
                            <option value={3}>3 - Intermedio</option>
                            <option value={4}>4 - Bueno</option>
                            <option value={5}>5 - Excelente</option>
                          </select>
                        </td>
                        <td className="p-2 border border-gray-700">
                          <textarea
                            value={t.observacionesAuditoria || ""}
                            onChange={(e) =>
                              setTareaAudField(
                                sIdx,
                                t.id,
                                "observacionesAuditoria",
                                e.target.value
                              )
                            }
                            className="bg-gray-700 p-1 rounded w-full text-xs"
                            rows={2}
                            placeholder="Observaciones sobre la tarea…"
                          />
                        </td>
                        <td className="p-2 border border-gray-700 text-center text-xs text-gray-500">
                          {/* evidencias ANTES vienen del backend en st.evidenciasAntes */}
                          —
                        </td>
                        <td className="p-2 border border-gray-700 text-center text-xs text-gray-500">
                          —
                        </td>
                      </tr>

                      {/* SUBTAREAS */}
                      {(t.subtareas || []).map((st, stIdx) => {
                        const listaAntes = st.evidenciasAntes || [];
                        const listaAhora = st.evidenciasAhora || [];

                        return (
                          <tr
                            key={st.id}
                            className="bg-gray-900/80 text-xs align-top"
                          >
                            <td className="p-2 border border-gray-700 text-indigo-400 text-center">
                              {idx + 1}.{stIdx + 1}
                            </td>
                            <td className="p-2 border border-gray-700 text-left pl-6">
                              {st.lugar || "—"}
                            </td>
                            <td className="p-2 border border-gray-700 text-left">
                              {st.descripcion || "—"}
                            </td>
                            <td className="p-2 border border-gray-700 text-center">
                              <select
                                value={st.puntuacionAuditoria || 0}
                                onChange={(e) =>
                                  setSubtareaAudField(
                                    sIdx,
                                    t.id,
                                    st.id,
                                    "puntuacionAuditoria",
                                    Number(e.target.value)
                                  )
                                }
                                className="bg-gray-700 p-1 rounded w-full"
                              >
                                <option value={0}>--</option>
                                <option value={1}>1 - Deficiente</option>
                                <option value={2}>2 - Básico</option>
                                <option value={3}>3 - Intermedio</option>
                                <option value={4}>4 - Bueno</option>
                                <option value={5}>5 - Excelente</option>
                              </select>
                            </td>
                            <td className="p-2 border border-gray-700">
                              <textarea
                                value={st.observacionesAuditoria || ""}
                                onChange={(e) =>
                                  setSubtareaAudField(
                                    sIdx,
                                    t.id,
                                    st.id,
                                    "observacionesAuditoria",
                                    e.target.value
                                  )
                                }
                                className="bg-gray-700 p-1 rounded w-full"
                                rows={2}
                                placeholder="Observaciones sobre la subtarea…"
                              />
                            </td>

                            {/* ANTES */}
                            <td className="p-2 border border-gray-700">
                              {listaAntes.length === 0 ? (
                                <div className="text-[10px] text-gray-400 text-center">
                                  Sin evidencias de implementación
                                </div>
                              ) : (
                                <div className="flex flex-wrap gap-1 justify-center">
                                  {listaAntes.map((ev) => (
                                    <a
                                      key={ev.id}
                                      href={ev.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      title="Ver evidencia (antes)"
                                    >
                                      <img
                                        src={ev.url}
                                        alt="Evidencia 5S"
                                        className="w-10 h-10 object-cover rounded border border-gray-600"
                                      />
                                    </a>
                                  ))}
                                </div>
                              )}
                            </td>

                            {/* AHORA */}
                            <td className="p-2 border border-gray-700">
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) =>
                                  handleEvidenciaAhoraUpload(
                                    sIdx,
                                    t.id,
                                    st.id,
                                    e.target.files
                                  )
                                }
                                className="text-[10px]"
                              />
                              {listaAhora.length > 0 && (
                                <div className="flex flex-wrap gap-1 justify-center mt-1">
                                  {listaAhora.map((ev) => (
                                    <a
                                      key={ev.id}
                                      href={ev.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      title={ev.url}
                                    >
                                      <img
                                        src={ev.url}
                                        alt="Evidencia auditoría"
                                        className="w-10 h-10 object-cover rounded border border-gray-600"
                                      />
                                    </a>
                                  ))}
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* RADAR + ANÁLISIS IA */}
      {radarData && (
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <h2 className="text-lg font-semibold text-indigo-300 mb-3">
              Radar de nivel por etapa
            </h2>
            <Radar data={radarData} options={radarOptions} />
          </div>

          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 flex flex-col">
            <h2 className="text-lg font-semibold text-indigo-300 mb-2">
              Análisis IA
            </h2>
            <p className="text-xs text-gray-400 mb-2">
              Aquí puedes redactar manualmente (o más adelante rellenar con IA)
              una conclusión de la auditoría basada en puntajes, comentarios e
              imágenes.
            </p>
            <textarea
              value={analisisIA}
              onChange={(e) => setAnalisisIA(e.target.value)}
              className="flex-1 bg-gray-700 p-2 rounded text-sm"
              rows={6}
              placeholder="Ejemplo: La zona de Taller Pallets presenta avances significativos en 1S y 2S, sin embargo aún se observan oportunidades en estandarización..."
            />
<button
  onClick={generarAnalisisConIA}
  disabled={cargandoIA}
  className={`mt-3 text-xs px-3 py-1.5 rounded transition ${
    cargandoIA
      ? "bg-gray-600 cursor-wait opacity-70"
      : "bg-indigo-600 hover:bg-indigo-700 cursor-pointer"
  }`}
  title={
    cargandoIA
      ? "Generando análisis con IA..."
      : "Generar un análisis automático de la auditoría con IA"
  }
>
  {cargandoIA ? "Generando..." : "Generar con IA"}
</button>

          </div>
        </div>
      )}
    </div>
  );
}
