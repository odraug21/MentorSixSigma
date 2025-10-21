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


