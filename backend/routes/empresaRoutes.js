// backend/routes/empresaRoutes.js
import express from "express";
import { pool } from "../db.js";
import { verifyToken } from "../middleware/auth.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

// 🧠 Solo SuperAdmin puede listar o crear empresas
router.get("/", verifyToken(["SuperAdmin"]), async (req, res) => {
  const result = await pool.query("SELECT * FROM empresas ORDER BY id ASC");
  res.json(result.rows);
});

router.post("/", verifyToken(["SuperAdmin"]), async (req, res) => {
  const { nombre, rut, pais } = req.body;

  if (!nombre || !rut || !pais)
    return res.status(400).json({ message: "Faltan campos obligatorios" });

  try {
    const insert = await pool.query(
      "INSERT INTO empresas (nombre, rut, pais, fecha_creacion) VALUES ($1, $2, $3, NOW()) RETURNING *",
      [nombre, rut, pais]
    );
    res.status(201).json(insert.rows[0]);
  } catch (err) {
    console.error("❌ Error al crear empresa:", err.message);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

// 🗑️ Eliminar empresa (solo SuperAdmin)
router.delete("/:id", verifyToken(["SuperAdmin"]), async (req, res) => {
  const { id } = req.params;

  try {
    // Primero verificamos si existe
    const existe = await pool.query("SELECT id FROM empresas WHERE id = $1", [id]);
    if (existe.rows.length === 0) {
      return res.status(404).json({ message: "Empresa no encontrada" });
    }

    // Luego la eliminamos
    await pool.query("DELETE FROM empresas WHERE id = $1", [id]);
    res.json({ message: "🗑️ Empresa eliminada correctamente" });
  } catch (err) {
    console.error("❌ Error eliminando empresa:", err);
    res.status(500).json({ message: "Error al eliminar empresa" });
  }
});


export default router;

