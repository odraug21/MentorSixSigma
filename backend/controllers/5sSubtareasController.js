// ===============================================
// 📌 Controlador SUBTAREAS 5S
// ===============================================
import pool from "../db.js";

// ----------------------------------------------------
// 1️⃣ Obtener subtareas de una tarea
// GET /api/5s/implementacion/tarea/:tareaId/subtareas
// ----------------------------------------------------
export async function getSubtareas(req, res) {
  try {
    const { tareaId } = req.params;

    const result = await pool.query(
      `SELECT *
       FROM subtareas_5s
       WHERE tarea_id = $1
       ORDER BY id ASC`,
      [tareaId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error obteniendo subtareas:", error);
    res.status(500).json({ message: "Error al obtener subtareas" });
  }
}

// ----------------------------------------------------
// 2️⃣ Crear subtarea
// POST /api/5s/implementacion/tarea/:tareaId/subtareas
// ----------------------------------------------------
export async function crearSubtarea(req, res) {
  try {
    const { tareaId } = req.params;
    const { lugar, descripcion, responsable, inicio, fin } = req.body;

    const result = await pool.query(
      `INSERT INTO subtareas_5s
        (tarea_id, lugar, descripcion, responsable, inicio, fin, completada)
       VALUES ($1, $2, $3, $4, $5, $6, false)
       RETURNING *`,
      [tareaId, lugar, descripcion, responsable, inicio, fin]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("❌ Error creando subtarea:", error);
    res.status(500).json({ message: "Error creando subtarea" });
  }
}

// ----------------------------------------------------
// 3️⃣ Actualizar subtarea
// PATCH /api/5s/implementacion/subtarea/:id
// ----------------------------------------------------
export async function actualizarSubtarea(req, res) {
  try {
    const { id } = req.params;

    const fields = Object.keys(req.body)
      .map((k, idx) => `${k} = $${idx + 1}`)
      .join(", ");

    const values = Object.values(req.body);

    const result = await pool.query(
      `UPDATE subtareas_5s
       SET ${fields}
       WHERE id = $${values.length + 1}
       RETURNING *`,
      [...values, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("❌ Error actualizando subtarea:", error);
    res.status(500).json({ message: "Error actualizando subtarea" });
  }
}

// ----------------------------------------------------
// 4️⃣ Eliminar subtarea
// DELETE /api/5s/implementacion/subtarea/:id
// ----------------------------------------------------
export async function eliminarSubtarea(req, res) {
  try {
    const { id } = req.params;

    await pool.query(
      `DELETE FROM subtareas_5s WHERE id = $1`,
      [id]
    );

    res.json({ message: "Subtarea eliminada" });
  } catch (error) {
    console.error("❌ Error eliminando subtarea:", error);
    res.status(500).json({ message: "Error eliminando subtarea" });
  }
}
