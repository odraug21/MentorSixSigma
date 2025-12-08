// backend/controllers/ooeController.js
import pool from "../db.js";

/**
 * GET /api/ooe
 * Lista registros OOE de la empresa del usuario
 */
export const listarOoe = async (req, res) => {
  try {
    const empresaId = req.user?.empresa_id;

    if (!empresaId) {
      return res.status(400).json({
        ok: false,
        message: "Falta empresa_id en el token",
      });
    }

    const result = await pool.query(
      `
      SELECT
        id,
        empresa_id,
        fecha,
        linea,
        turno,
        tiempo_operativo_min,
        tiempo_planificado_min,
        ooe,
        created_at
      FROM public.ooe_registros
      WHERE empresa_id = $1
      ORDER BY fecha DESC, id DESC
      `,
      [empresaId]
    );

    return res.json({
      ok: true,
      registros: result.rows,
    });
  } catch (error) {
    console.error("❌ Error listando OOE:", error);
    return res.status(500).json({
      ok: false,
      message: "Error listando registros OOE",
    });
  }
};

/**
 * POST /api/ooe
 * Crea un nuevo registro OOE
 */
export const crearOoe = async (req, res) => {
  try {
    const empresaId = req.user?.empresa_id;

    if (!empresaId) {
      return res.status(400).json({
        ok: false,
        message: "Falta empresa_id en el token",
      });
    }

    const {
      fecha,
      linea,
      turno,
      tiempo_operativo_min,
      tiempo_planificado_min,
    } = req.body;

    if (
      !fecha ||
      !linea ||
      !turno ||
      tiempo_operativo_min == null ||
      tiempo_planificado_min == null
    ) {
      return res.status(400).json({
        ok: false,
        message: "Faltan campos obligatorios para crear OOE",
      });
    }

    const op = Number(tiempo_operativo_min);
    const pl = Number(tiempo_planificado_min);

    if (!pl || pl <= 0) {
      return res.status(400).json({
        ok: false,
        message: "El tiempo planificado debe ser mayor a 0",
      });
    }

    const ooe = (op / pl) * 100;
    const ooeRedondeado = Number(ooe.toFixed(2));

    const insert = await pool.query(
      `
      INSERT INTO public.ooe_registros
        (empresa_id, fecha, linea, turno, tiempo_operativo_min, tiempo_planificado_min, ooe)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7)
      RETURNING
        id,
        empresa_id,
        fecha,
        linea,
        turno,
        tiempo_operativo_min,
        tiempo_planificado_min,
        ooe,
        created_at
      `,
      [empresaId, fecha, linea, turno, op, pl, ooeRedondeado]
    );

    return res.status(201).json({
      ok: true,
      message: "Registro OOE creado correctamente",
      registro: insert.rows[0],
    });
  } catch (error) {
    console.error("❌ Error creando OOE:", error);
    return res.status(500).json({
      ok: false,
      message: "Error creando registro OOE",
    });
  }
};

/**
 * DELETE /api/ooe/:id
 * Elimina un registro si pertenece a la empresa del usuario
 */
export const eliminarOoe = async (req, res) => {
  try {
    const empresaId = req.user?.empresa_id;
    const { id } = req.params;

    if (!empresaId) {
      return res.status(400).json({
        ok: false,
        message: "Falta empresa_id en el token",
      });
    }

    const del = await pool.query(
      `
      DELETE FROM public.ooe_registros
      WHERE id = $1 AND empresa_id = $2
      `,
      [id, empresaId]
    );

    if (del.rowCount === 0) {
      return res.status(404).json({
        ok: false,
        message: "Registro OOE no encontrado o no pertenece a la empresa",
      });
    }

    return res.json({
      ok: true,
      message: "Registro OOE eliminado correctamente",
    });
  } catch (error) {
    console.error("❌ Error eliminando OOE:", error);
    return res.status(500).json({
      ok: false,
      message: "Error eliminando registro OOE",
    });
  }
};
