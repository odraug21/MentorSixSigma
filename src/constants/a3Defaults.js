import { crearSubtareaBase } from "../utils/a3Helpers";




export const defaultA3 = {
  meta: { titulo: "", autor: "", fecha: new Date().toISOString().slice(0, 10) },
  problema: { descripcion: "", condicionActual: "", accionesContencion: "", imagenes: [] },
  objetivo: { declaracion: "", indicador: "" },
  causas: {
    hombre: [""], maquina: [""], metodo: [""], material: [""], entorno: [""], medida: [""],
    analisis5whys: "", ishikawaNotes: "", imagenes: [], redaccionProblema: ""
  },

  objetivo: {
    declaracion: "",
    indicador: "",
    meta: "",
    cumplimiento: "",
    brecha: ""
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



// src/constants/a3Defaults.js

// 🔑 Claves de almacenamiento
export const STORAGE_KEYS = {
  IMPLEMENTACION_5S: "implementacion5S",
};

// 🧮 Días hábiles (L-V)
export const contarDiasHabiles = (inicio, fin) => {
  if (!inicio || !fin) return 0;
  const start = new Date(inicio);
  const end = new Date(fin);
  let count = 0;
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const day = d.getDay();
    if (day !== 0 && day !== 6) count++;
  }
  return count;
};

// 🔢 Numeración visible
export const numeroTarea = (sIdx, tIdx) => `${sIdx + 1}.${tIdx + 1}`;

// 🧱 Plantillas base

export const crearTareaBase = () => ({
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
});

export const crearSeccionBase = (nombre) => ({
  nombre,
  inicioPlanificado: "",
  finPlanificado: "",
  duracion: 0,
  tareas: [],
  avance: 0,
});

// 📚 Secciones por defecto
export const SECCIONES_5S_DEFAULT = [
  crearSeccionBase("1S · Seiri (Clasificar)"),
  crearSeccionBase("2S · Seiton (Ordenar)"),
  crearSeccionBase("3S · Seiso (Limpiar)"),
  crearSeccionBase("4S · Seiketsu (Estandarizar)"),
  crearSeccionBase("5S · Shitsuke (Disciplina)"),
];

// ✅ Estado / Cómputos
export const isBlocked = (t, tareas) => {
  if (!t.dependeDe) return false;
  const pred = tareas.find((x) => x.id === t.dependeDe);
  return !pred || !pred.completada;
};

export const calcularAvanceS = (tareas) => {
  if (!tareas?.length) return 0;
  const done = tareas.filter((t) => t.completada).length;
  return Math.round((done / tareas.length) * 100);
};

export const calcularAvanceGlobal = (secciones) => {
  if (!secciones?.length) return 0;
  const sum = secciones.reduce((acc, s) => acc + (s.avance || 0), 0);
  return Number((sum / secciones.length).toFixed(1));
};

// 💾 Persistencia
export const loadImplementacion5S = () => {
  const raw = localStorage.getItem(STORAGE_KEYS.IMPLEMENTACION_5S);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const saveImplementacion5S = (secciones) => {
  localStorage.setItem(
    STORAGE_KEYS.IMPLEMENTACION_5S,
    JSON.stringify(secciones)
  );
};

export const clearImplementacion5S = () => {
  localStorage.removeItem(STORAGE_KEYS.IMPLEMENTACION_5S);
};

export const DEFAULT_GEMBA = {
  proyecto: "",
  responsable: "",
  fecha: new Date().toISOString().slice(0, 10),
  area: "",
  observaciones: [],
  oportunidades: [],
  acciones: [],
};

