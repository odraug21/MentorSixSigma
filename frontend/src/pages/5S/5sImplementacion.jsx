// src/pages/5S/5sImplementacion.jsx
// 🎯 Implementación 5S con matriz por secciones (1S..5S)

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { SECCIONES_5S_DEFAULT } from "../../constants/a3Defaults";
import { exportarImplementacionPDF } from "../../reports/5SImplementacionPDF";
import { crearSubtareaBase } from "../../utils/a3Helpers";
import { apiGet, apiPost } from "../../utils/api";
import { jwtDecode } from "jwt-decode";

export default function FiveSImplementacion() {
  const navigate = useNavigate();
  const { id } = useParams(); // id = proyectoId

  // =====================================================
  // 🔐 USUARIO (solo usado para PDF)
  // =====================================================
  const token = localStorage.getItem("token");
  let usuario = "anonimo";

  if (token) {
    try {
      const decoded = jwtDecode(token);
      usuario = decoded.email || decoded.id || "anonimo";
    } catch (err) {
      console.error("❌ Error decodificando token:", err);
    }
  }

  // =====================================================
  // 📌 LLAVE ÚNICA DEL PROYECTO
  // =====================================================
  const storageKey = `implementacion5s-proyecto-${id}`;

  // 📌 Datos del proyecto (desde backend)
  const [proyecto, setProyecto] = useState(null);

  // 📌 Estado local de secciones 1S..5S
  const [secciones, setSecciones] = useState(SECCIONES_5S_DEFAULT);

  // 📸 Evidencias agrupadas por id_subtarea
  const [evidenciasPorSubtarea, setEvidenciasPorSubtarea] = useState({});

  // 👁️ Visor de evidencias
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerEvidencias, setViewerEvidencias] = useState([]);
  const [viewerTitulo, setViewerTitulo] = useState("");

  const abrirViewer = (titulo, evidenciasLista) => {
    setViewerTitulo(titulo);
    setViewerEvidencias(evidenciasLista || []);
    setViewerOpen(true);
  };

  // =====================================================
  // 1️⃣ Cargar datos reales del proyecto 5S (backend)
  // =====================================================
  useEffect(() => {
    async function cargarProyecto() {
      try {
        const data = await apiGet(`/5s/proyectos/${id}`, true);
        setProyecto(data);
      } catch (err) {
        console.error("❌ Error cargando proyecto 5S:", err);
      }
    }
    cargarProyecto();
  }, [id]);

  // =====================================================
  // 2️⃣ Cargar / asegurar implementación desde la BD
  //      (y sincronizar con localStorage)
  // =====================================================
  useEffect(() => {
    if (!proyecto) return;

    async function cargarImplementacion() {
      try {
        const res = await apiGet(`/5s/implementacion/${id}`, true);

        // 🟣 No existe implementación -> crear fila base
        if (!res || !res.implementacion) {
          const creada = await apiPost(`/5s/implementacion/${id}`, {}, true);
          console.log(
            "🟢 Implementación 5S creada en BD:",
            creada?.implementacion?.id || creada?.id
          );

          setSecciones(SECCIONES_5S_DEFAULT);
          localStorage.setItem(
            storageKey,
            JSON.stringify(SECCIONES_5S_DEFAULT)
          );
          return;
        }

        console.log("🟦 Implementación 5S encontrada:", res.implementacion.id);

        const seccionesBD =
          Array.isArray(res.secciones) && res.secciones.length
            ? res.secciones
            : SECCIONES_5S_DEFAULT;

        setSecciones(seccionesBD);
        localStorage.setItem(storageKey, JSON.stringify(seccionesBD));
      } catch (err) {
        console.error("❌ Error cargando/asegurando implementación 5S:", err);
      }
    }

    cargarImplementacion();
  }, [proyecto, id, storageKey]);

  // =====================================================
  // 3️⃣ Guardar automáticamente en localStorage
  // =====================================================
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(secciones));
    console.log("💾 Guardado 5S en localStorage:", storageKey);
  }, [secciones, storageKey]);

  // =====================================================
  // 4️⃣ Cargar evidencias desde backend (por id_subtarea)
  // =====================================================
  useEffect(() => {
    // armar lista de id_subtarea actuales
    const ids = [];

    secciones.forEach((sec) => {
      (sec.tareas || []).forEach((t) => {
        (t.subtareas || []).forEach((st) => {
          if (st.id != null) ids.push(st.id);
        });
      });
    });

    console.log("🔎 IDs de subtareas actuales:", ids);

    if (!ids.length) {
      setEvidenciasPorSubtarea({});
      return;
    }

    const cargarEvidencias = async () => {
      try {
        const query = ids.join(",");
        const data = await apiGet(
          `/5s/evidencias/subtareas?ids=${query}`,
          true
        );

        console.log("📸 Evidencias desde backend:", data);

        const lista = Array.isArray(data)
          ? data
          : Array.isArray(data?.evidencias)
          ? data.evidencias
          : [];

        const mapa = {};
        lista.forEach((ev) => {
          if (!ev.id_subtarea) return;
          const key = String(ev.id_subtarea);
          if (!mapa[key]) mapa[key] = [];
          mapa[key].push(ev);
        });

        console.log("🧩 Mapa evidenciasPorSubtarea:", mapa);
        setEvidenciasPorSubtarea(mapa);
      } catch (err) {
        console.error("❌ Error cargando evidencias 5S:", err);
      }
    };

    cargarEvidencias();
  }, [id, secciones]);

  // =====================================================
  // Helpers
  // =====================================================
  const setSeccion = (idx, next) =>
    setSecciones((prev) => {
      const copy = structuredClone(prev);
      copy[idx] = typeof next === "function" ? next(copy[idx]) : next;
      return copy;
    });

  const addTarea = (sIdx) =>
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

  const addSubtarea = (sIdx, tareaId) =>
    setSeccion(sIdx, (sec) => ({
      ...sec,
      tareas: sec.tareas.map((t) =>
        t.id === tareaId
          ? { ...t, subtareas: [...t.subtareas, crearSubtareaBase()] }
          : t
      ),
    }));

  const removeTarea = (sIdx, tareaId) =>
    setSeccion(sIdx, (sec) => ({
      ...sec,
      tareas: sec.tareas
        .filter((t) => t.id !== tareaId)
        .map((t) => (t.dependeDe === tareaId ? { ...t, dependeDe: null } : t)),
    }));

  const removeSubtarea = (sIdx, tareaId, subId) =>
    setSeccion(sIdx, (sec) => ({
      ...sec,
      tareas: sec.tareas.map((t) =>
        t.id === tareaId
          ? { ...t, subtareas: t.subtareas.filter((s) => s.id !== subId) }
          : t
      ),
    }));

  const setTareaField = (sIdx, tareaId, field, value) =>
    setSeccion(sIdx, (sec) => ({
      ...sec,
      tareas: sec.tareas.map((t) =>
        t.id === tareaId ? { ...t, [field]: value } : t
      ),
    }));

  const setSubtareaField = (sIdx, tareaId, subId, field, value) =>
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

  // 🟩 Subir evidencia de SUBTAREA
  const handleSubtareaFileUpload = async (
    sIdx,
    tareaId,
    subtareaId,
    files
  ) => {
    try {
      const arrFiles = Array.from(files || []);
      if (!arrFiles.length) return;

      const file = arrFiles[0];

      const token = localStorage.getItem("token");
      if (!token) {
        alert("Sesión expirada. Por favor inicia sesión nuevamente.");
        return;
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("proyecto_id", id);
      formData.append("tarea_id", tareaId);
      formData.append("subtarea_id", subtareaId);

      const resp = await fetch(
        "http://localhost:5000/api/5s/evidencias/upload",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        console.error("❌ Error backend (subtarea):", data);
        throw new Error(data.message || "Error subiendo evidencia");
      }

      const evidencia = await resp.json();
      console.log("✅ Evidencia subida (subtarea):", evidencia);

      // actualizar estado local para no depender de recarga
      setEvidenciasPorSubtarea((prev) => {
        const copy = { ...prev };
        const key = String(evidencia.id_subtarea || subtareaId);
        const listaPrev = copy[key] || [];
        copy[key] = [evidencia, ...listaPrev];
        return copy;
      });
    } catch (err) {
      console.error("❌ Error en handleSubtareaFileUpload:", err);
      alert("Error subiendo archivo: " + err.message);
    }
  };

  const calcularAvanceS = (tareas) => {
    if (!tareas.length) return 0;
    const total = tareas.flatMap((t) => [t, ...t.subtareas]);
    const done = total.filter((x) => x.completada).length;
    return Math.round((done / total.length) * 100);
  };

  useEffect(() => {
    setSecciones((prev) =>
      prev.map((s) => ({
        ...s,
        avance: calcularAvanceS(s.tareas),
      }))
    );
  }, [JSON.stringify(secciones.map((s) => s.tareas))]);

  const avanceGlobal = useMemo(() => {
    if (!secciones.length) return 0;
    const sum = secciones.reduce((acc, s) => acc + (s.avance || 0), 0);
    return (sum / secciones.length).toFixed(1);
  }, [secciones]);

  // =====================================================
  // BOTONES
  // =====================================================
  const guardar = async () => {
    try {
      await apiPost(`/5s/implementacion/${id}`, { secciones }, true);
      alert("Implementación guardada en la base de datos ✔");
    } catch (err) {
      console.error("❌ Error guardando implementación:", err);
      alert("Error al guardar");
    }
  };

  const limpiar = () => {
    if (window.confirm("¿Deseas limpiar todos los datos de este proyecto?")) {
      localStorage.removeItem(storageKey);
      setSecciones(SECCIONES_5S_DEFAULT);
    }
  };

  const generarPDF = () =>
    exportarImplementacionPDF(
      secciones,
      proyecto?.nombre || `Proyecto 5S #${id}`,
      usuario
    );

  // =====================================================
  // RENDER
  // =====================================================
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      {/* ENCABEZADO */}
      <div className="flex justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-indigo-400">
            Implementación 5S – {proyecto?.nombre || `Proyecto #${id}`}
          </h1>

          {proyecto && (
            <div className="mt-1 text-gray-300 text-sm">
              <p>
                <span className="font-semibold text-gray-400">Área:</span>{" "}
                {proyecto.area}
              </p>
              <p>
                <span className="font-semibold text-gray-400">
                  Responsable:
                </span>{" "}
                {proyecto.responsable}
              </p>
              <p>
                <span className="font-semibold text-gray-400">Empresa:</span>{" "}
                {proyecto.empresa_nombre}
              </p>
              <p>
                <span className="font-semibold text-gray-400">Inicio:</span>{" "}
                {proyecto.fecha_inicio?.slice(0, 10)}
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-2 items-center">
          <button
            onClick={() => navigate("/5s/proyectos")}
            className="bg-indigo-600 hover:bg-indigo-700 px-4 py-1.5 rounded-md text-sm font-medium shadow-md transition"
          >
            Volver
          </button>
          <button
            onClick={guardar}
            className="bg-green-600 hover:bg-green-700 px-4 py-1.5 rounded-md text-sm font-medium shadow-md transition"
          >
            Guardar
          </button>
          <button
            onClick={limpiar}
            className="bg-red-600 hover:bg-red-700 px-4 py-1.5 rounded-md text-sm font-medium shadow-md transition"
          >
            Limpiar
          </button>
          <button
            onClick={generarPDF}
            className="bg-pink-600 hover:bg-pink-700 px-4 py-1.5 rounded-md text-sm font-medium shadow-md transition"
          >
            PDF
          </button>
        </div>
      </div>

      {/* AVANCE GLOBAL */}
      <div className="bg-gray-800 p-4 rounded-lg mb-8">
        <p className="text-sm text-gray-400 mb-1">Avance global:</p>
        <div className="w-full bg-gray-700 rounded-full h-4">
          <div
            className="bg-green-500 h-4 rounded-full transition-all duration-500"
            style={{ width: `${avanceGlobal}%` }}
          ></div>
        </div>
        <p className="text-center text-sm mt-2 text-gray-300">
          {avanceGlobal}%
        </p>
      </div>

      {/* MATRIZ 1S..5S */}
      <div className="flex flex-col gap-6">
        {secciones.map((s, sIdx) => (
          <div
            key={sIdx}
            className="bg-gray-800 p-4 rounded-lg border border-gray-700"
          >
            {/* HEADER */}
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-semibold text-indigo-300">
                {s.nombre}
              </h2>

              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-300">
                  Avance:{" "}
                  <span className="font-semibold text-white">
                    {s.avance}%
                  </span>
                </span>

                <button
                  onClick={() => addTarea(sIdx)}
                  className="bg-indigo-600 hover:bg-indigo-700 px-3 py-1 rounded text-sm"
                >
                  + Agregar tarea
                </button>
              </div>
            </div>

            {/* TABLA */}
            <div className="overflow-x-auto">
              <table className="w-full text-center border-collapse">
                <thead>
                  <tr className="bg-gray-700 text-gray-300 text-sm">
                    <th className="p-2 border border-gray-600">Id</th>
                    <th className="p-2 border border-gray-600">Lugar</th>
                    <th className="p-2 border border-gray-600">
                      Descripción
                    </th>
                    <th className="p-2 border border-gray-600">
                      Responsable
                    </th>
                    <th className="p-2 border border-gray-600">Inicio</th>
                    <th className="p-2 border border-gray-600">Fin</th>
                    <th className="p-2 border border-gray-600">
                      Depende de
                    </th>
                    <th className="p-2 border border-gray-600">Estado</th>
                    <th className="p-2 border border-gray-600">
                      Evidencias
                    </th>
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
                        No hay tareas. Agrega la primera con “+ Agregar
                        tarea”.
                      </td>
                    </tr>
                  ) : (
                    s.tareas.map((t, idx) => {
                      // 🔢 Total de evidencias en todas las subtareas de esta tarea
                      const totalEvidenciasTarea = (t.subtareas || []).reduce(
                        (acc, st) =>
                          acc +
                          ((evidenciasPorSubtarea[String(st.id)] || [])
                            .length || 0),
                        0
                      );

                      return (
                        <React.Fragment key={t.id}>
                          {/* TAREA */}
                          <tr className="text-sm align-top bg-gray-800 hover:bg-gray-750">
                            <td className="p-2 border border-gray-700">
                              {idx + 1}
                            </td>

                            <td className="p-2 border border-gray-700">
                              <input
                                value={t.lugar}
                                onChange={(e) =>
                                  setTareaField(
                                    sIdx,
                                    t.id,
                                    "lugar",
                                    e.target.value
                                  )
                                }
                                className="bg-gray-700 p-1 rounded w-full"
                                placeholder="Área / Ubicación"
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
                              />
                            </td>

                            <td className="p-2 border border-gray-700">
                              <input
                                type="date"
                                value={t.inicio}
                                onChange={(e) =>
                                  setTareaField(
                                    sIdx,
                                    t.id,
                                    "inicio",
                                    e.target.value
                                  )
                                }
                                className="bg-gray-700 p-1 rounded w-full"
                              />
                            </td>

                            <td className="p-2 border border-gray-700">
                              <input
                                type="date"
                                value={t.fin}
                                onChange={(e) =>
                                  setTareaField(
                                    sIdx,
                                    t.id,
                                    "fin",
                                    e.target.value
                                  )
                                }
                                className="bg-gray-700 p-1 rounded w-full"
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
                                  .map((x, xIdx) => (
                                    <option key={x.id} value={x.id}>
                                      {xIdx + 1} -{" "}
                                      {x.descripcion?.slice(0, 40)}
                                    </option>
                                  ))}
                              </select>
                            </td>

                            <td className="p-2 border border-gray-700">
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
                            </td>

                            {/* ✅ RESUMEN DE EVIDENCIAS POR SUBTAREAS */}
                            <td className="p-2 border border-gray-700 text-left">
                              <div className="text-[11px] text-gray-300">
                                {totalEvidenciasTarea > 0
                                  ? `${totalEvidenciasTarea} evidencia(s) en subtareas`
                                  : "Sin evidencias en subtareas"}
                              </div>
                            </td>

                            <td className="p-2 border border-gray-700">
                              <div className="flex flex-col gap-1">
                                <button
                                  onClick={() => addSubtarea(sIdx, t.id)}
                                  className="bg-indigo-600 hover:bg-indigo-700 text-xs px-2 py-1 rounded"
                                >
                                  Subtarea
                                </button>

                                <button
                                  onClick={() => {
                                    if (
                                      window.confirm(
                                        "¿Eliminar esta tarea?"
                                      )
                                    ) {
                                      removeTarea(sIdx, t.id);
                                    }
                                  }}
                                  className="bg-red-600 hover:bg-red-700 text-xs px-2 py-1 rounded"
                                >
                                  Eliminar
                                </button>
                              </div>
                            </td>
                          </tr>

                          {/* SUBTAREAS */}
                          {(t.subtareas || []).map((st, stIdx) => {
                            const fueraDeRango =
                              (st.inicio &&
                                new Date(st.inicio) < new Date(t.inicio)) ||
                              (st.fin &&
                                new Date(st.fin) > new Date(t.fin));

                            return (
                              <tr
                                key={st.id}
                                className={`text-xs align-top ${
                                  fueraDeRango
                                    ? "bg-red-900/40"
                                    : "bg-gray-900/70"
                                }`}
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
                                    placeholder="Subtarea…"
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
                                    placeholder="Nombre"
                                  />
                                </td>

                                <td className="p-2 border border-gray-700">
                                  <input
                                    type="date"
                                    value={st.inicio}
                                    onChange={(e) =>
                                      setSubtareaField(
                                        sIdx,
                                        t.id,
                                        st.id,
                                        "inicio",
                                        e.target.value
                                      )
                                    }
                                    className={`bg-gray-700 p-1 rounded w-full ${
                                      fueraDeRango
                                        ? "border border-red-500"
                                        : ""
                                    }`}
                                  />
                                </td>

                                <td className="p-2 border border-gray-700">
                                  <input
                                    type="date"
                                    value={st.fin}
                                    onChange={(e) =>
                                      setSubtareaField(
                                        sIdx,
                                        t.id,
                                        st.id,
                                        "fin",
                                        e.target.value
                                      )
                                    }
                                    className={`bg-gray-700 p-1 rounded w-full ${
                                      fueraDeRango
                                        ? "border border-red-500"
                                        : ""
                                    }`}
                                  />
                                </td>

                                <td className="p-2 border border-gray-700 text-gray-500">
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
                                      handleSubtareaFileUpload(
                                        sIdx,
                                        t.id,
                                        st.id,
                                        e.target.files
                                      )
                                    }
                                    className="text-xs"
                                  />

                                  {(() => {
                                    const key = String(st.id);
                                    const lista =
                                      evidenciasPorSubtarea[key] || [];

                                    if (!lista.length) {
                                      return (
                                        <div className="mt-1 text-[10px] text-gray-400">
                                          Sin evidencias
                                        </div>
                                      );
                                    }

                                    return (
                                      <div className="mt-1 text-[10px] text-green-300">
                                        {lista.length} evidencia(s){" "}
                                        <button
                                          type="button"
                                          className="ml-1 underline text-[10px] text-indigo-300"
                                          onClick={() =>
                                            abrirViewer(
                                              `Subtarea ${idx + 1}.${
                                                stIdx + 1
                                              } – ${
                                                st.descripcion ||
                                                "Sin descripción"
                                              }`,
                                              lista
                                            )
                                          }
                                        >
                                          Ver
                                        </button>
                                      </div>
                                    );
                                  })()}
                                </td>

                                <td className="p-2 border border-gray-700">
                                  <button
                                    onClick={() =>
                                      removeSubtarea(sIdx, t.id, st.id)
                                    }
                                    className="bg-red-600 hover:bg-red-700 text-xs px-2 py-1 rounded"
                                  >
                                    Eliminar
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* 👁️ MODAL VISOR DE EVIDENCIAS */}
      {viewerOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-3xl w-full max-h-[80vh] overflow-y-auto p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-indigo-300">
                Evidencias – {viewerTitulo}
              </h3>
              <button
                onClick={() => setViewerOpen(false)}
                className="px-3 py-1 text-sm rounded-md bg-red-600 hover:bg-red-700"
              >
                Cerrar
              </button>
            </div>

            {viewerEvidencias.length === 0 ? (
              <p className="text-sm text-gray-400">Sin evidencias.</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {viewerEvidencias.map((ev, i) => (
                  <div
                    key={ev.id || i}
                    className="bg-gray-800 rounded-lg p-2 flex flex-col gap-2"
                  >
                    <a
                      href={ev.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-indigo-300 underline break-all"
                    >
                      Abrir en nueva pestaña
                    </a>
                    <div className="bg-black/40 rounded-md flex items-center justify-center">
                      <img
                        src={ev.url}
                        alt={`Evidencia ${i + 1}`}
                        className="max-h-64 w-full object-contain rounded-md"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
