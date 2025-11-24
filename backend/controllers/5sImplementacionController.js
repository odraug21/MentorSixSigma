// backend/controllers/5sImplementacionController.js
import pool from "../db.js";

/**
 * Crear implementación 5S para un proyecto
 */
export async function crearImplementacion5S(req, res) {
  try {
    const { proyectoId } = req.params;

    // Crear registro base
    const result = await pool.query(
      `
      INSERT INTO implementaciones_5s (proyecto_id)
      VALUES ($1)
      RETURNING *;
      `,
      [proyectoId]
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error creando implementación 5S:", err);
    return res
      .status(500)
      .json({ message: "Error creando implementación 5S" });
  }
}

/**
 * Obtener implementación completa de un proyecto
 */
export async function obtenerImplementacion5S(req, res) {
  try {
    const { proyectoId } = req.params;

    // 1 — Obtener implementación base
    const impl = await pool.query(
      `SELECT * FROM implementaciones_5s WHERE proyecto_id = $1`,
      [proyectoId]
    );

    if (impl.rowCount === 0)
      return res.json({ implementacion: null, tareas: [], subtareas: [] });

    const implementacion = impl.rows[0];

    // 2 — Obtener tareas
    const tareas = await pool.query(
      `
      SELECT *
      FROM tareas_5s 
      WHERE implementacion_id = $1
      ORDER BY id ASC;
      `,
      [implementacion.id]
    );

    // 3 — Obtener subtareas
    const subtareas = await pool.query(
      `
      SELECT *
      FROM subtareas_5s
      WHERE tarea_id IN (SELECT id FROM tareas_5s WHERE implementacion_id = $1);
      `,
      [implementacion.id]
    );

    res.json({
      implementacion,
      tareas: tareas.rows,
      subtareas: subtareas.rows,
    });
  } catch (err) {
    console.error("❌ Error obteniendo implementación 5S:", err);
    res.status(500).json({ message: "Error obteniendo implementación 5S" });
  }
}
