import { apiGet, apiPost, apiPatch, apiDelete } from "./api.js";


export const update = (a3, setA3, path, value) => {
  if (typeof setA3 !== "function") {
    console.error("❌ Error: setA3 no es una función. Revisa la llamada a update().");
    return;
  }

  setA3(prev => {
    const copy = JSON.parse(JSON.stringify(prev));
    let cur = copy;
    for (let i = 0; i < path.length - 1; i++) {
      if (!cur[path[i]]) cur[path[i]] = {}; // crea el nivel si no existe
      cur = cur[path[i]];
    }
    cur[path[path.length - 1]] = value;
    return copy;
  });
};

export const set5W2H = (a3, setA3, key, field, value) => {
  setA3(prev => {
    const copy = JSON.parse(JSON.stringify(prev));
    if (!copy.analisis5W2H[key]) copy.analisis5W2H[key] = { es: "", noEs: "" };
    copy.analisis5W2H[key][field] = value;
    return copy;
  });
};

export const setResumen5W2H = (a3, setA3, value) => {
  setA3(prev => {
    const copy = JSON.parse(JSON.stringify(prev));
    copy.analisis5W2H.resumen = value;
    return copy;
  });
};

/**
 * Genera un objeto base para una subtarea vacía
 */
export const crearSubtareaBase = () => ({
  id: crypto.randomUUID(),
  lugar: "",
  descripcion: "",
  responsable: "",
  inicio: "",
  fin: "",
  completada: false,
  evidencias: [],
});

/**
 * Valida si las fechas de una subtarea están dentro del rango de su tarea padre
 * Devuelve true si hay error (fuera de rango)
 */
export const validarRangoFechas = (tarea, subtarea) => {
  if (!tarea || !subtarea) return false;
  if (!tarea.inicio || !tarea.fin || !subtarea.inicio || !subtarea.fin) return false;

  const inicioTarea = new Date(tarea.inicio);
  const finTarea = new Date(tarea.fin);
  const inicioSub = new Date(subtarea.inicio);
  const finSub = new Date(subtarea.fin);

  return inicioSub < inicioTarea || finSub > finTarea;
};

/**
 * Calcula avance (considerando subtareas)
 */
export const calcularAvanceConSubtareas = (tareas = []) => {
  if (!tareas.length) return 0;
  const todas = tareas.flatMap((t) => [t, ...(t.subtareas || [])]);
  const completadas = todas.filter((x) => x.completada).length;
  return Math.round((completadas / todas.length) * 100);
};
