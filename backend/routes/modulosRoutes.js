import express from "express";
import { pool } from "../db.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// 🔹 Obtener todos los módulos
router.get("/", verifyToken(), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id, 
        nombre, 
        tipo, 
        categoria, 
        descripcion, 
        ruta, 
        activo, 
        fecha_creacion 
      FROM modulos
      ORDER BY id ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error al obtener módulos:", err);
    res.status(500).json({ message: "Error al obtener módulos" });
  }
});


/* 🔹 Crear nuevo módulo (solo SuperAdmin) */
router.post("/", verifyToken(["SuperAdmin"]), async (req, res) => {
  const { nombre, tipo = "operativo", categoria = "General", descripcion = "" } = req.body;

  if (!nombre?.trim()) return res.status(400).json({ message: "El nombre del módulo es obligatorio." });

  try {
    const result = await pool.query(
      "INSERT INTO modulos (nombre, tipo, categoria, descripcion, fecha_creacion) VALUES ($1, $2, $3, $4, NOW()) RETURNING *",
      [nombre, tipo, categoria, descripcion]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error al crear módulo:", err);
    res.status(500).json({ message: "Error al crear módulo" });
  }
});

/* 🔹 Actualizar módulo */
router.put("/:id", verifyToken(["SuperAdmin"]), async (req, res) => {
  const { id } = req.params;
  const { nombre, tipo, categoria, descripcion } = req.body;

  try {
    const result = await pool.query(
      "UPDATE modulos SET nombre=$1, tipo=$2, categoria=$3, descripcion=$4 WHERE id=$5 RETURNING *",
      [nombre, tipo, categoria, descripcion, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error al actualizar módulo:", err);
    res.status(500).json({ message: "Error al actualizar módulo" });
  }
});

/* 🔹 Eliminar módulo */
router.delete("/:id", verifyToken(["SuperAdmin"]), async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM modulos WHERE id=$1", [id]);
    res.json({ message: "🗑️ Módulo eliminado correctamente" });
  } catch (err) {
    console.error("❌ Error al eliminar módulo:", err);
    res.status(500).json({ message: "Error al eliminar módulo" });
  }
});

export default router;
