// controllers/5sSeguimientoController.js
import pool from "../db.js";

/**
 * ==========================================
 * 1️⃣ Obtener seguimiento 5S de un proyecto
 * GET /api/5s/seguimiento/:proyectoId
 * ==========================================
 */
export const getSeguimiento5S = async (req, res) => {
  try {
    const { proyectoId } = req.params;

    const result = await pool.query(
      `
      SELECT *
      FROM seguimientos_5s
      WHERE proyecto_id = $1
      ORDER BY id DESC
      LIMIT 1;
      `,
      [proyectoId]
    );

    if (result.rowCount === 0) return res.json(null);

    res.json(result.rows[0]);
  } catch (error) {
    console.error("❌ Error obteniendo seguimiento 5S:", error);
    res.status(500).json({ message: "Error al obtener seguimiento 5S" });
  }
};

/**
 * ==========================================
 * 2️⃣ Crear o actualizar seguimiento de un proyecto
 * PATCH /api/5s/seguimiento/:proyectoId
 * ==========================================
 */
export const updateSeguimiento5S = async (req, res) => {
  try {
    const { proyectoId } = req.params;
    const { etapa, fecha_inicio, fecha_fin, avance, estado } = req.body;

    // Ver si ya existe un registro
    const existing = await pool.query(
      "SELECT id FROM seguimientos_5s WHERE proyecto_id = $1",
      [proyectoId]
    );

    if (existing.rowCount === 0) {
      // Crear
      const result = await pool.query(
        `
        INSERT INTO seguimientos_5s
          (proyecto_id, etapa, fecha_inicio, fecha_fin, avance, estado)
        VALUES
          ($1, $2, $3, $4, $5, $6)
        RETURNING *;
        `,
        [
          proyectoId,
          etapa || null,
          fecha_inicio || null,
          fecha_fin || null,
          avance || 0,
          estado || null,
        ]
      );

      return res.status(201).json(result.rows[0]);
    }

    // Actualizar existente
    const result = await pool.query(
      `
      UPDATE seguimientos_5s
      SET 
        etapa = $1,
        fecha_inicio = $2,
        fecha_fin = $3,
        avance = $4,
        estado = $5,
        actualizado_en = NOW()
      WHERE proyecto_id = $6
      RETURNING *;
      `,
      [
        etapa || null,
        fecha_inicio || null,
        fecha_fin || null,
        avance || 0,
        estado || null,
        proyectoId,
      ]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("❌ Error guardando seguimiento 5S:", error);
    res.status(500).json({ message: "Error al guardar seguimiento 5S" });
  }
};
