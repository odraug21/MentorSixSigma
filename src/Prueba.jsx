asi esta el codigo se que lo podemos mejorar colocando todas las const en un archivo. creo que asi sera mas rapida la ajecución que opinas

// src/pages/CreateA3.jsx
import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";


const defaultA3 = {
  meta: { titulo: "", autor: "", fecha: new Date().toISOString().slice(0, 10) },
  problema: { descripcion: "", condicionActual: "", accionesContencion: "", imagenes: [] },
  objetivo: { declaracion: "", indicador: "" },
  causas: {
    hombre: [""], maquina: [""], metodo: [""], material: [""], entorno: [""], medida: [""],
    analisis5whys: "", ishikawaNotes: "", imagenes: [], redaccionProblema: ""
  },
  analisis5W2H: {
    que: { es: "", noEs: "" },
    cuando: { es: "", noEs: "" },
    donde: { es: "", noEs: "" },
    quien: { es: "", noEs: "" },
    como: { es: "", noEs: "" },
    cuantos: { es: "", noEs: "" },
    por_que: { es: "", noEs: "" },
    resumen: ""
  },
  contramedidas: { lista: [""] },
  acciones: [],
  seguimiento: { plan: "", resultados: "", graficoData: [], imagenes: [] },
  lecciones: ""
};

// Hook localStorage
function useLocalStorageState(key, initial) {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initial;
    } catch (e) {
      console.error("localStorage read error", e);
      return initial;
    }
  });

  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(state)); }
    catch (e) { console.error("localStorage write error", e); }
  }, [key, state]);

  return [state, setState];
}

// Hooks para interceptar navegación
function useUnsavedChangesPrompt(hasChanges) {
  const navigate = useNavigate();

  // Detecta refresh / cerrar pestaña
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!hasChanges) return;
      e.preventDefault();
      e.returnValue = "";
      return "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasChanges]);

const goTo = (path) => {
  if (!hasChanges || window.confirm("Estás saliendo sin guardar, se perderán los cambios. ¿Continuar?")) {
    navigate(path);         // Navega a home
    window.location.reload(); // Fuerza recarga completa
  }
};

  return goTo;
}



export default function CreateA3() {
  const navigate = useNavigate();
  const [a3, setA3] = useLocalStorageState("a3-draft", defaultA3);
  const [message, setMessage] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 4;

  // Para configurar despues
  const sugerirCausasIA = () => {
  alert("Funcionalidad de IA aún no implementada");
  };

  const setCausaCategoria = () => {};
  const removeCausaCategoria = () => {};
  const addCausaCategoria = () => {};

  // ⚠️ Prompt si hay cambios no guardados
  //const hasChanges = JSON.stringify(a3) !== JSON.stringify(defaultA3);
  //usePrompt("Estás saliendo sin guardar, se perderán los cambios. ¿Continuar?", hasChanges);

  // Función para ir a cualquier ruta guardando borrador
  //const goTo = (path) => {
  //  try { localStorage.setItem("a3-draft", JSON.stringify(a3)); } 
  //  catch (e) { console.error("Error guardando borrador antes de navegar", e); }
  //  navigate(path);
  // };

  const hasChanges = JSON.stringify(a3) !== JSON.stringify(defaultA3);
  const goTo = useUnsavedChangesPrompt(hasChanges);

  // Helpers para actualizar A3
  const update = (path, value) => {
    setA3(prev => {
      const copy = JSON.parse(JSON.stringify(prev));
      let cur = copy;
      for (let i = 0; i < path.length - 1; i++) cur = cur[path[i]];
      cur[path[path.length - 1]] = value;
      return copy;
    });
  };

  const set5W2H = (key, field, value) => {
    setA3(prev => {
      const copy = JSON.parse(JSON.stringify(prev));
      if (!copy.analisis5W2H[key]) copy.analisis5W2H[key] = { es: "", noEs: "" };
      copy.analisis5W2H[key][field] = value;
      return copy;
    });
  };

  const setResumen5W2H = (value) => {
    setA3(prev => {
      const copy = JSON.parse(JSON.stringify(prev));
      copy.analisis5W2H.resumen = value;
      return copy;
    });
  };

  // Genera resumen automático 5W2H
  useEffect(() => {
    const { que, cuando, donde, quien, como, cuantos, por_que } = a3.analisis5W2H;
    const resumen = `Problema: ${que.es || "-"} (no es: ${que.noEs || "-"}).
Observado: ${cuando.es || "-"} (no es: ${cuando.noEs || "-"}).
Ubicación: ${donde.es || "-"} (no es: ${donde.noEs || "-"}).
Involucra: ${quien.es || "-"} (no es: ${quien.noEs || "-"}).
Cómo: ${como.es || "-"} (no es: ${como.noEs || "-"}).
Frecuencia/Impacto: ${cuantos.es || "-"} (no es: ${cuantos.noEs || "-"}).
Causa Posible: ${por_que.es || "-"} (no es: ${por_que.noEs || "-"})`;
    setResumen5W2H(resumen);
  }, [a3.analisis5W2H]);

  // Funciones de imágenes, contramedidas y acciones
  const handleImageUpload = (e, sectionPath) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const newImgs = files.map(f => ({ name: f.name, url: URL.createObjectURL(f) }));
    setA3(prev => {
      const copy = JSON.parse(JSON.stringify(prev));
      let arr = copy;
      for (let i = 0; i < sectionPath.length; i++) arr = arr[sectionPath[i]];
      arr.push(...newImgs);
      return copy;
    });
  };

  const removeImage = (sectionPath, idx) => {
    setA3(prev => {
      const copy = JSON.parse(JSON.stringify(prev));
      let arr = copy;
      for (let i = 0; i < sectionPath.length; i++) arr = arr[sectionPath[i]];
      arr.splice(idx, 1);
      return copy;
    });
  };

  const addContramedida = () => setA3(prev => ({ ...prev, contramedidas: { ...prev.contramedidas, lista: [...prev.contramedidas.lista, ""] } }));
  const removeContramedida = i => setA3(prev => ({ ...prev, contramedidas: { ...prev.contramedidas, lista: prev.contramedidas.lista.filter((_, idx) => idx !== i) } })); 
  const setContramedida = (i, value) => setA3(prev => { const copy = JSON.parse(JSON.stringify(prev)); copy.contramedidas.lista[i] = value; return copy; });

  const addAccion = () => setA3(prev => ({ ...prev, acciones: [...prev.acciones, { accion: "", responsable: "", fecha: "", estado: "Pendiente" }] }));
  const setAccionField = (idx, field, value) => setA3(prev => { const copy = JSON.parse(JSON.stringify(prev)); copy.acciones[idx][field] = value; return copy; });
  const removeAccion = idx => setA3(prev => { const copy = JSON.parse(JSON.stringify(prev)); copy.acciones.splice(idx, 1); return copy; });

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(a3, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${a3.meta.titulo || "a3"}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage("Exportado JSON (descarga iniciada)");
    setTimeout(() => setMessage(""), 3000);
  };

  const clearDraft = () => {
    if (!window.confirm("¿Borrar borrador actual?")) return;
    setA3(defaultA3);
    setMessage("Borrador limpiado");
    setTimeout(() => setMessage(""), 2000);
  };

  // Render
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header meta + actions */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div>
            <input
              value={a3.meta.titulo}
              onChange={(e) => update(["meta", "titulo"], e.target.value)}
              className="bg-gray-800 p-2 rounded text-white w-full md:w-80"
              placeholder="Título del A3 (ej. Reducción downtime línea 3)"
            />
            <div className="text-sm text-gray-400 mt-1">Autor:
              <input
                value={a3.meta.autor}
                onChange={(e) => update(["meta", "autor"], e.target.value)}
                className="ml-2 bg-gray-800 p-1 rounded text-white w-48 inline-block"
                placeholder="Tu nombre"
              />
              <span className="ml-4">Fecha:
                <input
                  type="date"
                  value={a3.meta.fecha}
                  onChange={(e) => update(["meta", "fecha"], e.target.value)}
                  className="ml-2 bg-gray-800 p-1 rounded text-white"
                />
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={() => { localStorage.setItem("a3-draft", JSON.stringify(a3)); setMessage("Guardado"); setTimeout(() => setMessage(""), 1500); }} className="bg-indigo-600 px-3 py-2 rounded hover:bg-indigo-700">Guardar</button>
            <button onClick={exportJSON} className="bg-green-600 px-3 py-2 rounded hover:bg-green-700">Exportar JSON</button>
            <button onClick={clearDraft} className="bg-red-600 px-3 py-2 rounded hover:bg-red-700">Limpiar</button>
            <button onClick={sugerirCausasIA} className="bg-yellow-600 px-3 py-2 rounded hover:bg-yellow-700 text-black">Sugerir causas (IA)</button>
            <button onClick={() => goTo("/")} className="bg-gray-600 px-3 py-2 rounded hover:bg-gray-700"> Salir</button>
          </div>
        </div>

        {/* Grid 2x2 */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* A: Describe problema + objetivo + 5W2H */}
         {currentPage === 1 && ( 
          <section className="w-full  bg-gray-800 p-4 rounded-lg border border-gray-700 col-span-2">
            <h3 className="text-xl font-semibold text-indigo-300 mb-2">A. Describir problema / Situación</h3>

            {/* 1. Descripción problema */}
            <div className="mb-3">
              <label className="text-sm text-gray-400">1. Descripción del problema / Condición actual / Acciones de contención</label>
              <textarea
                value={a3.problema.descripcion}
                onChange={(e) => update(["problema", "descripcion"], e.target.value)}
                className="w-full mt-2 p-3 rounded bg-gray-700"
                rows={4}
                placeholder="Describe el problema principal..."
              />
              <textarea
                value={a3.problema.condicionActual}
                onChange={(e) => update(["problema", "condicionActual"], e.target.value)}
                className="w-full mt-2 p-3 rounded bg-gray-700"
                rows={3}
                placeholder="Condición actual..."
              />
              <textarea
                value={a3.problema.accionesContencion}
                onChange={(e) => update(["problema", "accionesContencion"], e.target.value)}
                className="w-full mt-2 p-3 rounded bg-gray-700"
                rows={2}
                placeholder="Acciones de contención..."
              />
            </div>

            {/* 2. Declaración objetivo */}
            <div className="mb-3">
              <label className="text-sm text-gray-400">2. Declaración del objetivo / Condición meta</label>
              <textarea
                value={a3.objetivo.declaracion}
                onChange={(e) => update(["objetivo", "declaracion"], e.target.value)}
                className="w-full mt-2 p-3 rounded bg-gray-700"
                rows={3}
                placeholder="Objetivo (qué se busca lograr)..."
              />
              <input
                value={a3.objetivo.indicador}
                onChange={(e) => update(["objetivo", "indicador"], e.target.value)}
                className="w-full mt-2 p-2 rounded bg-gray-700"
                placeholder="Indicador / meta (ej. reducir downtime a X minutos)"
              />
            </div>

            {/* 3. Análisis 5W2H */}
            <div className="mb-3">
              <label className="text-sm text-gray-400 font-semibold">3. Análisis 5W2H</label>

              <table className="w-full mt-2 text-left border border-gray-600">
                <thead>
                  <tr className="bg-gray-700 text-gray-200">
                    <th className="px-2 py-1 border text-center">Elemento</th>
                    <th className="px-2 py-1 border text-center">Si</th>
                    <th className="px-2 py-1 border text-center">No</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { key: "que", label: "Qué" },
                    { key: "cuando", label: "Cuándo" },
                    { key: "donde", label: "Dónde" },
                    { key: "quien", label: "Quién" },
                    { key: "como", label: "Cómo" },
                    { key: "cuantos", label: "Cuántos" },
                    { key: "por_que", label: "Por qué" },
                  ].map(({ key, label }) => (
                    <tr key={key}>
                      <td className="px-2 py-1 border font-medium">{label}</td>
                      <td className="px-2 py-1 border">
                        <textarea
                          value={a3.analisis5W2H[key]?.es || ""}   // opcional ? para evitar undefined
                          onChange={(e) => set5W2H(key, "es", e.target.value)}
                          className="w-full p-1 rounded bg-gray-700 text-white"
                          rows={2}
                        />
                      </td>
                      <td className="px-2 py-1 border">
                        <textarea
                          value={a3.analisis5W2H[key]?.noEs || ""}  // opcional ? para evitar undefined
                          onChange={(e) => set5W2H(key, "noEs", e.target.value)}
                          className="w-full p-1 rounded bg-gray-700 text-white"
                          rows={2}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-2">
                <label className="text-sm text-gray-400">Resumen lectura 5W2H (IA / manual)</label>
                <textarea
                  value={a3.analisis5W2H?.resumen || ""}
                  onChange={(e) => setResumen5W2H(e.target.value)}
                  className="w-full mt-1 p-2 rounded bg-gray-700"
                  rows={3}
                  placeholder="Aquí se generará la síntesis del problema según 5W2H..."
                />
              </div>
            </div>
          </section>
         )}

         
          {/* B: Causas raíz (arriba derecha) */}
          {currentPage === 2 && ( 
          <section className="w-full bg-gray-800 p-4 rounded-lg border border-gray-700 col-span-2">
            <h3 className="text-xl font-semibold text-purple-300 mb-2">B. Encontrar causa raíz (Diagrama Ishikawa)</h3>

            <p className="text-sm text-gray-400 mb-4">
              Identifica las causas según su origen. Posteriormente podrás generar una redacción del problema con ayuda de IA.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: "hombre", label: "Hombre" },
                { key: "maquina", label: "Máquina" },
                { key: "metodo", label: "Método" },
                { key: "material", label: "Material" },
                { key: "entorno", label: "Entorno" },
                { key: "medida", label: "Medida" },
              ].map(({ key, label }) => (
                <div key={key} className="bg-gray-700 p-3 rounded-lg border border-gray-600">
                  <h4 className="font-semibold text-indigo-300 mb-2">{label}</h4>
                  <div className="space-y-2">
                    {(a3.causas?.[key] || []).map((c, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <textarea
                          value={c}
                          onChange={(e) => setCausaCategoria(key, idx, e.target.value)}
                          className="flex-1 p-2 rounded bg-gray-800 text-white"
                          rows={2}
                          placeholder={`Causa relacionada con ${label.toLowerCase()}...`}
                        />
                        <button
                          type="button"
                          onClick={() => removeCausaCategoria(key, idx)}
                          className="bg-red-600 px-2 rounded hover:bg-red-700"
                        >
                          x
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => addCausaCategoria(key)}
                    className="mt-2 bg-indigo-600 px-3 py-1 rounded hover:bg-indigo-700"
                  >
                    Añadir causa
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <label className="text-sm text-gray-400">Redacción del problema (preparada para IA)</label>
              <textarea
                value={a3.causas.redaccionProblema}
                onChange={(e) => update(["causas", "redaccionProblema"], e.target.value)}
                className="w-full mt-2 p-3 rounded bg-gray-700"
                rows={4}
                placeholder="Aquí se generará automáticamente la redacción del problema..."
              />
            </div>
          </section>
         )}

          {/* C: Resolver el problema (abajo izquierda) */}
          {currentPage === 3 &&(
          <section className="w-full bg-gray-800 p-4 rounded-lg border border-gray-700 col-span-2">
            <h3 className="text-xl font-semibold text-red-300 mb-2">C. Resolver problema / Contramedidas</h3>

            <div className="mb-3">
              <label className="text-sm text-gray-400">4. Contramedidas propuestas</label>
              <div className="space-y-2 mt-2">
                {a3.contramedidas.lista.map((c, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <textarea value={c} onChange={(e) => setContramedida(idx, e.target.value)} className="flex-1 p-2 rounded bg-gray-700" rows={2} />
                    <button type="button" onClick={() => removeContramedida(idx)} className="bg-red-600 px-2 rounded hover:bg-red-700">Eliminar</button>
                  </div>
                ))}
              </div>
              <div className="mt-2">
                <button type="button" onClick={addContramedida} className="bg-indigo-600 px-3 py-1 rounded hover:bg-indigo-700">Añadir contramedida</button>
              </div>
            </div>

            <div className="mb-3">
              <label className="text-sm text-gray-400">5. Plan de acciones correctivas (tabla)</label>
              <div className="overflow-x-auto mt-2">
                <table className="min-w-full text-left">
                  <thead>
                    <tr className="text-gray-300">
                      <th className="px-2 py-1">Acción</th>
                      <th className="px-2 py-1">Responsable</th>
                      <th className="px-2 py-1">Fecha</th>
                      <th className="px-2 py-1">Estado</th>
                      <th className="px-2 py-1">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {a3.acciones.map((row, idx) => (
                      <tr key={idx} className="align-top">
                        <td className="px-2 py-1"><input value={row.accion} onChange={(e) => setAccionField(idx, "accion", e.target.value)} className="bg-gray-700 p-1 rounded w-full" /></td>
                        <td className="px-2 py-1"><input value={row.responsable} onChange={(e) => setAccionField(idx, "responsable", e.target.value)} className="bg-gray-700 p-1 rounded w-full" /></td>
                        <td className="px-2 py-1"><input type="date" value={row.fecha} onChange={(e) => setAccionField(idx, "fecha", e.target.value)} className="bg-gray-700 p-1 rounded w-full" /></td>
                        <td className="px-2 py-1">
                          <select value={row.estado} onChange={(e) => setAccionField(idx, "estado", e.target.value)} className="bg-gray-700 p-1 rounded">
                            <option>Pendiente</option>
                            <option>En progreso</option>
                            <option>Completada</option>
                          </select>
                        </td>
                        <td className="px-2 py-1">
                          <button type="button" onClick={() => removeAccion(idx)} className="bg-red-600 px-2 py-1 rounded">Eliminar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-2">
                  <button type="button" onClick={addAccion} className="bg-indigo-600 px-3 py-1 rounded hover:bg-indigo-700">Añadir acción</button>
                </div>
              </div>
            </div>
          </section>
          )}

          {/* D: Validar solución (abajo derecha) */}
         {currentPage === 4 && ( 
          <section className="w-full bg-gray-800 p-4 rounded-lg border border-gray-700 col-span-2">
            <h3 className="text-xl font-semibold text-teal-300 mb-2">D. Validar solución y estandarizar</h3>

            <div className="mb-3">
              <label className="text-sm text-gray-400">6. Confirmación del efecto / evidencia</label>
              <textarea value={a3.seguimiento.resultados} onChange={(e) => update(["seguimiento", "resultados"], e.target.value)} className="w-full mt-2 p-3 rounded bg-gray-700" rows={4} placeholder="Registra resultados y comparativa pre/post..." />
              <div className="mt-2">
                <input type="file" accept="image/*" multiple onChange={(e) => handleImageUpload(e, ["seguimiento", "imagenes"])} />
                <div className="flex flex-wrap gap-2 mt-2">
                  {a3.seguimiento.imagenes.map((img, idx) => (
                    <div key={idx} className="relative">
                      <img src={img.url} alt={img.name} className="w-28 h-20 object-cover rounded" />
                      <button type="button" onClick={() => removeImage(["seguimiento", "imagenes"], idx)} className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-6 h-6 text-xs">x</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mb-3">
              <label className="text-sm text-gray-400">7. Lecciones aprendidas / estandarización</label>
              <textarea value={a3.lecciones} onChange={(e) => update(["lecciones"], e.target.value)} className="w-full mt-2 p-3 rounded bg-gray-700" rows={4} placeholder="Documenta las lecciones aprendidas y pasos de estandarización..." />
            </div>
          </section>
         )}
        </div>

        {/* Mensaje */}
        {message && <div className="mt-4 text-sm text-green-400">{message}</div>}

        <div className="flex justify-between mt-6">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="bg-gray-700 px-3 py-2 rounded disabled:opacity-40"
          >
            ⬅️ Anterior
          </button>

          <span className="text-gray-400">Página {currentPage} de {totalPages}</span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="bg-indigo-600 px-3 py-2 rounded hover:bg-indigo-700 disabled:opacity-40"
          >
            Siguiente ➡️
          </button>
        </div>
        <div className="mt-8 text-center text-gray-400 text-sm">
          <p>  </p>
        </div>
      </div>
    </div>
  );
}

