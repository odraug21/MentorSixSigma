// backend/controllers/kaizenController.js
import pool from "../db.js";
import { generarConGemini } from "../api/geminiIA.js";

/**
 * Helper: convierte texto en bullets (quita guiones, •, etc.)
 */
function extraerBullets(texto = "") {
  return texto
    .split("\n")
    .map((l) => l.replace(/^[-•*]\s*/, "").trim())
    .filter((l) => l.length > 0);
}

/**
 * IA por línea
 */
async function generarSugerenciasIAParaLinea(lineaData) {
  const {
    linea,
    turno,
    oee,
    disponibilidad,
    rendimiento,
    calidad,
    costo_total,
    problemas,
  } = lineaData;

  const prompt = `
Eres un experto en mejora continua LEAN / Kaizen y OEE.

Tengo los siguientes datos de desempeño de una línea de producción:

- Línea: ${linea}
- Turno: ${turno || "No especificado"}
- OEE promedio: ${oee.toFixed(1)}%
- Disponibilidad: ${disponibilidad.toFixed(1)}%
- Rendimiento: ${rendimiento.toFixed(1)}%
- Calidad: ${calidad.toFixed(1)}%
- Pérdidas económicas acumuladas: $${costo_total.toLocaleString("es-CL")}

Problemas detectados:
${(problemas || []).length
    ? problemas.map((p) => `- ${p}`).join("\n")
    : "- Sin lista de problemas detallados."
  }

Genera entre 3 y 5 SUGERENCIAS KAIZEN concretas y accionables
para esta línea/turno, en español, orientadas a reducir pérdidas
y mejorar el OEE. Devuelve SOLO una lista con bullets, sin explicaciones largas.
`;

  const texto = await generarConGemini(prompt);
  return extraerBullets(texto);
}

/**
 * IA resumen global
 */
async function generarResumenGlobalIA(lineas) {
  const resumenBase = lineas
    .map((l) => {
      return `Línea ${l.linea}${l.turno ? " - Turno " + l.turno : ""}:
- OEE: ${l.oee.toFixed(1)}%
- Disp: ${l.disponibilidad.toFixed(1)}%
- Rend: ${l.rendimiento.toFixed(1)}%
- Calid: ${l.calidad.toFixed(1)}%
- Pérdidas: $${l.costo_total.toLocaleString("es-CL")}
`;
    })
    .join("\n");

  const prompt = `
Eres un experto en mejora continua LEAN / Kaizen.

Aquí tienes un resumen de desempeño OEE por línea y turno:

${resumenBase}

A partir de estos datos:
1. Identifica en 2-3 frases las principales causas o focos de pérdida a nivel global de planta.
2. Propón en 3-4 bullets las prioridades de acción Kaizen (dónde atacar primero).

Responde en español, breve y ejecutivo.
`;

  const texto = await generarConGemini(prompt);
  return texto;
}

/**
 * GET /api/kaizen/analisis
 * Analiza los registros OEE de la empresa y propone focos Kaizen por línea.
 * Query params opcionales:
 *   ?desde=YYYY-MM-DD&hasta=YYYY-MM-DD&linea=L1&turno=Mañana&conIA=1
 */
export const obtenerAnalisisKaizen = async (req, res) => {
  try {
    const empresaId = req.user?.empresa_id;
    if (!empresaId) {
      return res.status(400).json({
        ok: false,
        message: "Falta empresa en el token",
      });
    }

    const { desde, hasta, linea, turno, conIA } = req.query;

    const params = [empresaId];
    let where = "WHERE empresa_id = $1";

    if (desde) {
      params.push(desde);
      where += ` AND fecha >= $${params.length}`;
    }
    if (hasta) {
      params.push(hasta);
      where += ` AND fecha <= $${params.length}`;
    }
    if (linea) {
      params.push(linea);
      where += ` AND linea = $${params.length}`;
    }
    if (turno) {
      params.push(turno);
      where += ` AND turno = $${params.length}`;
    }

    // Promedios por línea/turno + suma de pérdidas económicas
    const sql = `
      SELECT
        linea,
        turno,
        AVG(oee)                AS oee_prom,
        AVG(disponibilidad)     AS disp_prom,
        AVG(rendimiento)        AS rend_prom,
        AVG(calidad)            AS cal_prom,
        COALESCE(SUM(costo_total_perdidas), 0) AS costo_total
      FROM public.oee_registros
      ${where}
      GROUP BY linea, turno
      ORDER BY linea, turno;
    `;

    const { rows } = await pool.query(sql, params);

    // Metas de referencia (puedes ajustarlas luego)
    const metas = {
      oee: 85, // %
      disp: 90, // %
      rend: 95, // %
      cal: 98, // %
    };

    // Si no hay datos, respondemos vacío
    if (!rows.length) {
      return res.json({
        ok: true,
        lineas: [],
        metas,
        resumen_ia: "",
      });
    }

    // Construcción base de líneas (con reglas)
    const lineas = rows.map((r) => {
      const oee = Number(r.oee_prom) || 0;
      const disp = Number(r.disp_prom) || 0;
      const rend = Number(r.rend_prom) || 0;
      const cal = Number(r.cal_prom) || 0;
      const costoTotal = Number(r.costo_total) || 0;

      const problemas = [];
      const sugerencias = [];

      if (oee < metas.oee) {
        problemas.push(
          `OEE promedio (${oee.toFixed(1)}%) por debajo de la meta (${metas.oee}%).`
        );
      }
      if (disp < metas.disp) {
        problemas.push(
          `Baja disponibilidad (${disp.toFixed(1)}% < ${metas.disp}%). Paradas frecuentes.`
        );
        sugerencias.push(
          "Levantar matriz de pérdidas por tipo de parada, priorizar las TOP 3 crónicas y definir acciones SMED / TPM."
        );
      }
      if (rend < metas.rend) {
        problemas.push(
          `Bajo rendimiento (${rend.toFixed(1)}% < ${metas.rend}%). Velocidad real bajo la ideal.`
        );
        sugerencias.push(
          "Revisar ajustes de velocidad, micro-paradas y cuellos de botella. Estandarizar parámetros óptimos de operación."
        );
      }
      if (cal < metas.cal) {
        problemas.push(
          `Calidad baja (${cal.toFixed(1)}% < ${metas.cal}%). Scrap / reprocesos elevados.`
        );
        sugerencias.push(
          "Aplicar análisis de causa raíz (Ishikawa, 5 Porqués) sobre los principales defectos y reforzar controles en el punto de origen."
        );
      }

      if (costoTotal > 0) {
        problemas.push(
          `Pérdidas económicas acumuladas de $${costoTotal.toLocaleString("es-CL")}.`
        );
        sugerencias.push(
          "Cuantificar el impacto anual proyectado y priorizar proyectos Kaizen que ataquen las pérdidas mayores."
        );
      }

      // Si no hay problemas, igual proponemos mantener estándares
      if (problemas.length === 0) {
        problemas.push("Desempeño dentro de metas de referencia.");
        sugerencias.push(
          "Mantener estándares, documentar buenas prácticas y usar esta línea como benchmark interno."
        );
      }

      return {
        linea: r.linea,
        turno: r.turno,
        oee: Number(oee.toFixed(1)),
        disponibilidad: Number(disp.toFixed(1)),
        rendimiento: Number(rend.toFixed(1)),
        calidad: Number(cal.toFixed(1)),
        costo_total: costoTotal,
        problemas,
        sugerencias: Array.from(new Set(sugerencias)),
        sugerencias_ia: [], // se llenará si conIA=1
        resumen_ia: "", // opcional por línea (por ahora no lo usamos)
      };
    });

    // ============================
    // IA automática (si ?conIA=1)
    // ============================
    let resumenIA = "";

    if (conIA === "1") {
      // ⚠️ Si quieres limitar líneas para ahorrar tokens:
      // const lineasParaIA = lineas.slice(0, 5);
      const lineasParaIA = lineas;

      // Sugerencias IA por línea
      for (const l of lineasParaIA) {
        try {
          const sugerenciasIA = await generarSugerenciasIAParaLinea(l);
          l.sugerencias_ia = sugerenciasIA;
        } catch (e) {
          console.error(
            "⚠️ Error generando sugerencias IA para línea",
            l.linea,
            "turno",
            l.turno,
            e.message
          );
          l.sugerencias_ia = [];
        }
      }

      // Resumen global IA
      try {
        resumenIA = await generarResumenGlobalIA(lineasParaIA);
      } catch (e) {
        console.error("⚠️ Error generando resumen global IA:", e.message);
        resumenIA = "";
      }
    }

    return res.json({
      ok: true,
      lineas,
      metas,
      resumen_ia: resumenIA,
    });
  } catch (error) {
    console.error("❌ Error en obtenerAnalisisKaizen:", error);
    return res.status(500).json({
      ok: false,
      message: "Error generando análisis Kaizen",
    });
  }
};
