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

// 📅 Función para contar días hábiles (lunes a viernes)
export function contarDiasHabiles(inicio, fin) {
  if (!inicio || !fin) return 0;
  const start = new Date(inicio);
  const end = new Date(fin);
  let count = 0;
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const day = d.getDay();
    if (day !== 0 && day !== 6) count++;
  }
  return count;
}

// 🔹 Plantilla base de secciones 5S
export const SECCIONES_5S_DEFAULT = [
  { nombre: "1S · Seiri (Clasificar)", inicioPlanificado: "", finPlanificado: "", duracion: 0, tareas: [], avance: 0 },
  { nombre: "2S · Seiton (Ordenar)", inicioPlanificado: "", finPlanificado: "", duracion: 0, tareas: [], avance: 0 },
  { nombre: "3S · Seiso (Limpiar)", inicioPlanificado: "", finPlanificado: "", duracion: 0, tareas: [], avance: 0 },
  { nombre: "4S · Seiketsu (Estandarizar)", inicioPlanificado: "", finPlanificado: "", duracion: 0, tareas: [], avance: 0 },
  { nombre: "5S · Shitsuke (Disciplina)", inicioPlanificado: "", finPlanificado: "", duracion: 0, tareas: [], avance: 0 },
];


