import express from "express";
import pool from "../db.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// ✅ Obtener todas las consultas (solo SuperAdmin)
router.get("/", verifyToken, async (req, res) => {
  try {
    if (req.user.rol !== "SuperAdmin") {
      return res.status(403).json({ message: "Acceso denegado" });
    }
    const result = await pool.query("SELECT * FROM consultas ORDER BY fecha DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error obteniendo consultas:", err);
    res.status(500).json({ message: "Error al obtener consultas" });
  }
});

// ✅ Agregar comentario a una consulta
router.post("/:id/comentarios", verifyToken, async (req, res) => {
  try {
    if (req.user.rol !== "SuperAdmin") {
      return res.status(403).json({ message: "Acceso denegado" });
    }

    const { id } = req.params;
    const { comentario } = req.body;
    const creado_por = req.user.email;

    await pool.query(
      "INSERT INTO consultas_comentarios (consulta_id, comentario, creado_por) VALUES ($1, $2, $3)",
      [id, comentario, creado_por]
    );
    res.json({ message: "Comentario agregado correctamente" });
  } catch (err) {
    console.error("❌ Error agregando comentario:", err);
    res.status(500).json({ message: "Error al agregar comentario" });
  }
});

// ✅ Cambiar estado de una consulta
router.put("/:id/estado", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    await pool.query("UPDATE consultas SET estado = $1 WHERE id = $2", [estado, id]);
    res.json({ message: "Estado actualizado" });
  } catch (err) {
    console.error("❌ Error actualizando estado:", err);
    res.status(500).json({ message: "Error al actualizar estado" });
  }
});

// ✅ Obtener comentarios de una consulta
router.get("/:id/comentarios", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "SELECT * FROM consultas_comentarios WHERE consulta_id = $1 ORDER BY fecha ASC",
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error obteniendo comentarios:", err);
    res.status(500).json({ message: "Error al obtener comentarios" });
  }
});

export default router;
