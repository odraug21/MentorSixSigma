// backend/controllers/5sTareasController.js
import pool from "../db.js";

export async function obtenerTareas(req, res) {
  try {
    const { proyectoId } = req.params;

    const tareas = await pool.query(`
      SELECT *
      FROM tareas_5s
      WHERE implementacion_id = $1
      ORDER BY id ASC
    `, [proyectoId]);

    const subtareas = await pool.query(`
      SELECT *
      FROM subtareas_5s
      WHERE tarea_id IN (
        SELECT id FROM tareas_5s WHERE implementacion_id = $1
      )
      ORDER BY id ASC
    `, [proyectoId]);

    const tareasFinal = tareas.rows.map(t => ({
      ...t,
      subtareas: subtareas.rows.filter(s => s.tarea_id === t.id),
    }));

    res.json(tareasFinal);
  } catch (error) {
    console.error("❌ Error obteniendo tareas 5S:", error);
    res.status(500).json({ message: "Error obteniendo tareas 5S" });
  }
}

export async function crearTarea(req, res) {
  try {
    const { proyectoId, lugar, descripcion, responsable, inicio, fin, depende_de } = req.body;

    if (!proyectoId || !descripcion) {
      return res.status(400).json({ message: "proyectoId y descripción son obligatorios" });
    }

    const result = await pool.query(`
      INSERT INTO tareas_5s
      (implementacion_id, lugar, descripcion, responsable, inicio, fin, depende_de)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [
      proyectoId,
      lugar || null,
      descripcion,
      responsable || null,
      inicio || null,
      fin || null,
      depende_de || null
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("❌ Error creando tarea 5S:", error);
    res.status(500).json({ message: "Error creando tarea 5S" });
  }
}

export async function actualizarTarea(req, res) {
  try {
    const { id } = req.params;
    const { lugar, descripcion, responsable, inicio, fin, depende_de, completada } = req.body;

    const result = await pool.query(`
      UPDATE tareas_5s
      SET lugar=$1, descripcion=$2, responsable=$3, inicio=$4, fin=$5, depende_de=$6, completada=$7
      WHERE id=$8
      RETURNING *
    `, [
      lugar || null,
      descripcion,
      responsable || null,
      inicio || null,
      fin || null,
      depende_de || null,
      completada ?? false,
      id
    ]);

    res.json(result.rows[0]);
  } catch (error) {
    console.error("❌ Error actualizando tarea 5S:", error);
    res.status(500).json({ message: "Error actualizando tarea 5S" });
  }
}

export async function eliminarTarea(req, res) {
  try {
    const { id } = req.params;

    await pool.query("DELETE FROM tareas_5s WHERE id=$1", [id]);

    res.json({ message: "Tarea eliminada correctamente" });
  } catch (error) {
    console.error("❌ Error eliminando tarea 5S:", error);
    res.status(500).json({ message: "Error eliminando tarea 5S" });
  }
}
