// backend/controllers/kaizenController.js
import pool from "../db.js";

/**
 * GET /api/kaizen/analisis
 * Analiza los registros OEE de la empresa y propone focos Kaizen por línea.
 * Query params opcionales:
 *   ?desde=YYYY-MM-DD&hasta=YYYY-MM-DD&linea=L1
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

    const { desde, hasta, linea } = req.query;

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

    // Tomamos promedios por línea + suma de pérdidas económicas
    const sql = `
      SELECT
        linea,
        AVG(oee)                AS oee_prom,
        AVG(disponibilidad)     AS disp_prom,
        AVG(rendimiento)        AS rend_prom,
        AVG(calidad)            AS cal_prom,
        COALESCE(SUM(costo_total_perdidas), 0) AS costo_total
      FROM public.oee_registros
      ${where}
      GROUP BY linea
      ORDER BY linea;
    `;

    const { rows } = await pool.query(sql, params);

    // Metas de referencia (puedes ajustarlas luego)
    const metas = {
      oee: 85,      // %
      disp: 90,     // %
      rend: 95,     // %
      cal: 98,      // %
    };

    const lineas = rows.map((r) => {
      const oee = Number(r.oee_prom) || 0;
      const disp = Number(r.disp_prom) || 0;
      const rend = Number(r.rend_prom) || 0;
      const cal = Number(r.cal_prom) || 0;
      const costoTotal = Number(r.costo_total) || 0;

      const problemas = [];
      const sugerencias = [];

      if (oee < metas.oee) {
        problemas.push(`OEE promedio (${oee.toFixed(1)}%) por debajo de la meta (${metas.oee}%).`);
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
        oee: Number(oee.toFixed(1)),
        disponibilidad: Number(disp.toFixed(1)),
        rendimiento: Number(rend.toFixed(1)),
        calidad: Number(cal.toFixed(1)),
        costo_total: costoTotal,
        problemas,
        sugerencias,
      };
    });

    return res.json({
      ok: true,
      lineas,
      metas,
    });
  } catch (error) {
    console.error("❌ Error en obtenerAnalisisKaizen:", error);
    return res.status(500).json({
      ok: false,
      message: "Error generando análisis Kaizen",
    });
  }
};
