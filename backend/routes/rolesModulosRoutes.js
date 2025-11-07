import express from "express";
import { pool } from "../db.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

/* 🔹 Obtener los módulos asignados a un rol */
router.get("/:rolId", verifyToken(["SuperAdmin", "AdminEmpresa"]), async (req, res) => {
  const { rolId } = req.params;
  try {
    const result = await pool.query(
      `SELECT rm.id, m.nombre, m.tipo, m.categoria, rm.activo
       FROM roles_modulos rm
       JOIN modulos m ON m.id = rm.modulo_id
       WHERE rm.rol_id = $1
       ORDER BY m.nombre ASC`,
      [rolId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error al obtener módulos del rol:", err);
    res.status(500).json({ message: "Error al obtener módulos del rol" });
  }
});

/* 🔹 Asignar o quitar módulo de un rol */
router.post("/", verifyToken(["SuperAdmin"]), async (req, res) => {
  const { rol_id, modulo_id, activo = true } = req.body;
  if (!rol_id || !modulo_id) {
    return res.status(400).json({ message: "rol_id y modulo_id son requeridos." });
  }

  try {
    const result = await pool.query(
      `INSERT INTO roles_modulos (rol_id, modulo_id, activo)
       VALUES ($1, $2, $3)
       ON CONFLICT (rol_id, modulo_id)
       DO UPDATE SET activo = EXCLUDED.activo
       RETURNING *`,
      [rol_id, modulo_id, activo]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error al asignar módulo:", err);
    res.status(500).json({ message: "Error al asignar módulo" });
  }
});

/* 🔹 Eliminar relación */
router.delete("/:id", verifyToken(["SuperAdmin"]), async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM roles_modulos WHERE id = $1", [id]);
    res.json({ message: "🗑️ Relación eliminada correctamente" });
  } catch (err) {
    console.error("❌ Error eliminando relación:", err);
    res.status(500).json({ message: "Error al eliminar relación" });
  }
});

/* 🔹 Obtener módulos permitidos para el usuario actual (según su rol) */
router.get("/permitidos/usuario", verifyToken(), async (req, res) => {
  try {
    const { rol } = req.user;

    // Obtener ID del rol desde nombre
    const rolRes = await pool.query("SELECT id FROM roles WHERE nombre = $1", [rol]);
    if (rolRes.rows.length === 0)
      return res.status(404).json({ message: "Rol no encontrado." });

    const rolId = rolRes.rows[0].id;

    // Buscar módulos activos para ese rol
    const modRes = await pool.query(
      `SELECT m.nombre, m.tipo, m.categoria
       FROM roles_modulos rm
       JOIN modulos m ON m.id = rm.modulo_id
       WHERE rm.rol_id = $1 AND rm.activo = true
       ORDER BY m.nombre ASC`,
      [rolId]
    );

    res.json(modRes.rows);
  } catch (err) {
    console.error("❌ Error al obtener permisos del usuario:", err);
    res.status(500).json({ message: "Error al obtener módulos permitidos" });
  }
});


export default router;
