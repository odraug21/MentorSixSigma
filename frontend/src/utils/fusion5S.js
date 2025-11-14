// src/utils/fusion5S.js
/**
 * Combina los datos de Implementación 5S con las Auditorías almacenadas.
 * Permite al módulo de Seguimiento mostrar una visión consolidada (plan + resultado).
 */
export function fusionarDatos5S(usuario = "anonimo") {
  const implementacion = JSON.parse(localStorage.getItem("implementacion5S")) || [];
  const auditorias = [];

  // Buscar auditorías guardadas del usuario
  for (let key in localStorage) {
    if (key.startsWith(`auditoria5s-${usuario}-`)) {
      try {
        const data = JSON.parse(localStorage.getItem(key));
        auditorias.push(data);
      } catch {}
    }
  }

  // Combinar implementación con evaluación promedio por etapa
  return implementacion.map((s, idx) => {
    const evaluacionPromedio =
      auditorias.length > 0
        ? (
            auditorias
              .map((a) => Number(a[idx]?.puntuacion || 0))
              .reduce((acc, val) => acc + val, 0) / auditorias.length
          ).toFixed(1)
        : 0;

    return {
      nombre: s.nombre,
      inicio: s.inicioPlanificado || "",
      fin: s.finPlanificado || "",
      avance: s.avance || 0,
      evaluacionPromedio: Number(evaluacionPromedio),
    };
  });
}
