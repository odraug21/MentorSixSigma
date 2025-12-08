// backend/controllers/oeeController.js
import pool from "../db.js";

/**
 * POST /api/oee/registros
 * Crea un registro OEE para la empresa y usuario del token
 * Incluye cálculo económico de pérdidas.
 */
export const crearRegistroOee = async (req, res) => {
  try {
    const empresaId = req.user?.empresa_id;
    const usuarioId = req.user?.id;

    if (!empresaId || !usuarioId) {
      return res.status(400).json({
        ok: false,
        message: "Faltan datos de empresa / usuario en el token",
      });
    }

    const {
      fecha,
      linea,
      turno,
      tiempoPlanificado,
      tiempoParadas,
      unidadesProducidas,
      unidadesBuenas,
      velocidadIdeal,
      observaciones = "",
      costoHora,
      costoUnitario,
      // 🔸 nuevos campos desde el front
      tipoFalla,
      causaParada,
    } = req.body;

    // ==============================
    //  Validaciones básicas
    // ==============================
    if (
      !fecha ||
      !linea ||
      !turno ||
      !tiempoPlanificado ||
      !unidadesProducidas ||
      !unidadesBuenas ||
      !velocidadIdeal
    ) {
      return res.status(400).json({
        ok: false,
        message: "Faltan campos obligatorios para el registro OEE",
      });
    }

    const plan = Number(tiempoPlanificado);
    const paradas = Number(tiempoParadas || 0);
    const producidas = Number(unidadesProducidas);
    const buenas = Number(unidadesBuenas);
    const ideal = Number(velocidadIdeal);

    if (plan <= 0 || producidas <= 0 || buenas < 0 || ideal <= 0) {
      return res.status(400).json({
        ok: false,
        message: "Los valores numéricos no son válidos",
      });
    }

    // ==============================
    //  🔢 Cálculo técnico OEE
    // ==============================
    const disponibilidad = ((plan - paradas) / plan) * 100;
    const rendimiento = (producidas / (plan * ideal)) * 100;
    const calidad = (buenas / producidas) * 100;
    const oee = (disponibilidad * rendimiento * calidad) / 10000;

    const disp2 = Number(disponibilidad.toFixed(2));
    const rend2 = Number(rendimiento.toFixed(2));
    const cal2 = Number(calidad.toFixed(2));
    const oee2 = Number(oee.toFixed(2));

    // ==============================
    //  💰 Cálculo económico
    // ==============================
    const costoHoraNum =
      costoHora !== undefined && costoHora !== null && costoHora !== ""
        ? Number(costoHora)
        : null;

    const costoUnitNum =
      costoUnitario !== undefined &&
      costoUnitario !== null &&
      costoUnitario !== ""
        ? Number(costoUnitario)
        : null;

    const tieneCostos =
      costoHoraNum !== null &&
      !Number.isNaN(costoHoraNum) &&
      costoHoraNum > 0 &&
      costoUnitNum !== null &&
      !Number.isNaN(costoUnitNum) &&
      costoUnitNum > 0;

    let costo_minuto_parada = 0;
    let costo_unitario = 0;
    let costo_paradas = 0;
    let costo_scrap = 0;
    let costo_bajo_rend = 0;
    let costo_total_perdidas = 0;

    if (tieneCostos) {
      // costo/hora → costo/minuto
      costo_minuto_parada = Number((costoHoraNum / 60).toFixed(4));
      costo_unitario = Number(costoUnitNum.toFixed(2));

      const tiempoOperativoMin = plan - paradas;
      const unidadesMalas = Math.max(producidas - buenas, 0);
      const unidadesTeoricas = Math.max(tiempoOperativoMin * ideal, 0);
      const unidadesPerdidasRend = Math.max(
        unidadesTeoricas - producidas,
        0
      );

      costo_paradas = Number(
        (paradas * costo_minuto_parada).toFixed(2)
      );
      costo_scrap = Number(
        (unidadesMalas * costo_unitario).toFixed(2)
      );
      costo_bajo_rend = Number(
        (unidadesPerdidasRend * costo_unitario).toFixed(2)
      );
      costo_total_perdidas = Number(
        (costo_paradas + costo_scrap + costo_bajo_rend).toFixed(2)
      );
    }

    // ==============================
    //  INSERT en BD
    // ==============================
    const insert = await pool.query(
      `
      INSERT INTO public.oee_registros (
        empresa_id,
        usuario_id,
        fecha,
        linea,
        turno,
        tiempo_planificado_min,
        tiempo_paradas_min,
        velocidad_ideal_und_x_min,
        unidades_producidas,
        unidades_buenas,
        disponibilidad,
        rendimiento,
        calidad,
        oee,
        observaciones,
        costo_minuto_parada,
        costo_unitario,
        costo_paradas,
        costo_scrap,
        costo_bajo_rend,
        costo_total_perdidas,
        tipo_falla,
        causa_parada
      )
      VALUES (
        $1,$2,$3,$4,$5,
        $6,$7,$8,$9,$10,
        $11,$12,$13,$14,
        $15,
        $16,$17,$18,$19,$20,$21,
        $22,$23
      )
      RETURNING
        id,
        fecha,
        linea,
        turno,
        tiempo_planificado_min      AS "tiempoPlanificado",
        tiempo_paradas_min          AS "tiempoParadas",
        velocidad_ideal_und_x_min   AS "velocidadIdeal",
        unidades_producidas         AS "unidadesProducidas",
        unidades_buenas             AS "unidadesBuenas",
        disponibilidad,
        rendimiento,
        calidad,
        oee,
        observaciones,
        costo_minuto_parada,
        costo_unitario,
        costo_paradas,
        costo_scrap,
        costo_bajo_rend,
        costo_total_perdidas,
        created_at,
        tipo_falla                  AS "tipoFalla",
        causa_parada                AS "causaParada"
      `,
      [
        empresaId,
        usuarioId,
        fecha,
        linea,
        turno,
        plan,
        paradas,
        ideal,
        producidas,
        buenas,
        disp2,
        rend2,
        cal2,
        oee2,
        observaciones || null,
        costo_minuto_parada,
        costo_unitario,
        costo_paradas,
        costo_scrap,
        costo_bajo_rend,
        costo_total_perdidas,
        tipoFalla || null,
        causaParada || null,
      ]
    );

    const registro = insert.rows[0];

    return res.status(201).json({
      ok: true,
      registro,
      message: "Registro OEE creado correctamente",
    });
  } catch (error) {
    console.error("❌ Error creando registro OEE:", error);
    return res.status(500).json({
      ok: false,
      message: "Error creando registro OEE",
    });
  }
};

/**
 * GET /api/oee/registros
 * Lista registros OEE de la empresa con filtros opcionales
 */
export const listarRegistrosOee = async (req, res) => {
  try {
    const empresaId = req.user?.empresa_id;
    if (!empresaId) {
      return res.status(400).json({
        ok: false,
        message: "Falta empresa en el token",
      });
    }

    const { desde, hasta, linea, turno, limit } = req.query;

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

    let sql = `
      SELECT
        id,
        fecha,
        linea,
        turno,
        tiempo_planificado_min      AS "tiempoPlanificado",
        tiempo_paradas_min          AS "tiempoParadas",
        velocidad_ideal_und_x_min   AS "velocidadIdeal",
        unidades_producidas         AS "unidadesProducidas",
        unidades_buenas             AS "unidadesBuenas",
        disponibilidad,
        rendimiento,
        calidad,
        oee,
        observaciones,
        costo_minuto_parada,
        costo_unitario,
        costo_paradas,
        costo_scrap,
        costo_bajo_rend,
        costo_total_perdidas,
        created_at,
        tipo_falla                  AS "tipoFalla",
        causa_parada                AS "causaParada"
      FROM public.oee_registros
      ${where}
      ORDER BY fecha DESC, created_at DESC, id DESC
    `;

    if (limit) {
      const lim = Math.min(Number(limit) || 0, 365);
      if (lim > 0) {
        params.push(lim);
        sql += ` LIMIT $${params.length}`;
      }
    }

    const result = await pool.query(sql, params);

    return res.json({
      ok: true,
      registros: result.rows,
    });
  } catch (error) {
    console.error("❌ Error listando registros OEE:", error);
    return res.status(500).json({
      ok: false,
      message: "Error listando registros OEE",
    });
  }
};
