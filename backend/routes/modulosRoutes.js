// backend/routes/modulosRoutes.js
import express from "express";
import pool from "../db.js";
import { verifyToken } from "../middleware/auth.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

// ✅ Obtener módulos permitidos por usuario logueado (vía roles_modulos)
router.get(
  "/roles-modulos/permitidos/usuario",
  verifyToken,
  async (req, res) => {
    try {
      const { rol } = req.user; // viene del token

      if (!rol) {
        return res
          .status(400)
          .json({ message: "Rol no identificado en el token." });
      }

      console.log("🔍 Solicitando módulos permitidos para rol:", rol);

      const result = await pool.query(
        `
        SELECT 
          m.id,
          m.nombre,
          m.tipo,
          m.categoria,
          m.ruta
        FROM roles_modulos rm
        JOIN roles   r ON r.id = rm.rol_id
        JOIN modulos m ON m.id = rm.modulo_id
        WHERE r.nombre = $1
          AND m.activo = TRUE
          AND rm.activo = TRUE
        ORDER BY m.id;
        `,
        [rol]
      );

      console.log("✅ Módulos permitidos:", result.rows);
      res.json(result.rows);
    } catch (err) {
      console.error("❌ Error al obtener módulos permitidos:", err);
      res
        .status(500)
        .json({ message: "Error al obtener módulos permitidos" });
    }
  }
);



// Crear módulo (Solo SuperAdmin)
router.post("/", verifyToken, requireRole(["SuperAdmin"]), async (req, res) => {
  const { nombre, tipo = "operativo", categoria = "General", descripcion = "" } = req.body;
  if (!nombre?.trim()) {
    return res.status(400).json({ message: "El nombre del módulo es obligatorio." });
  }
  try {
    const result = await pool.query(
      `INSERT INTO modulos (nombre, tipo, categoria, descripcion, fecha_creacion)
       VALUES ($1, $2, $3, $4, NOW()) RETURNING *`,
      [nombre, tipo, categoria, descripcion]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error al crear módulo:", err);
    res.status(500).json({ message: "Error al crear módulo" });
  }
});

// Actualizar módulo (Solo SuperAdmin)
router.put("/:id", verifyToken, requireRole(["SuperAdmin"]), async (req, res) => {
  const { id } = req.params;
  const { nombre, tipo, categoria, descripcion } = req.body;
  try {
    const result = await pool.query(
      `UPDATE modulos SET nombre=$1, tipo=$2, categoria=$3, descripcion=$4
       WHERE id=$5 RETURNING *`,
      [nombre, tipo, categoria, descripcion, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error al actualizar módulo:", err);
    res.status(500).json({ message: "Error al actualizar módulo" });
  }
});

// Eliminar módulo (Solo SuperAdmin)
router.delete("/:id", verifyToken, requireRole(["SuperAdmin"]), async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM modulos WHERE id=$1", [id]);
    res.json({ message: "🗑️ Módulo eliminado correctamente" });
  } catch (err) {
    console.error("❌ Error al eliminar módulo:", err);
    res.status(500).json({ message: "Error al eliminar módulo" });
  }
});

// ✅ Obtener módulos permitidos por usuario logueado
router.get("/roles-modulos/permitidos/usuario", verifyToken, async (req, res) => {
  try {
    // El token debe incluir el rol (ej. req.user.rol)
    const { rol } = req.user;

    if (!rol) {
      return res.status(400).json({ message: "Rol no identificado en el token." });
    }

    console.log(`🔍 Solicitando módulos permitidos para rol: ${rol}`);

    // Si tienes tabla roles_modulos, puedes usarla. Ejemplo:
    // const result = await pool.query(`
    //   SELECT m.id, m.nombre, m.tipo, m.categoria, m.ruta
    //   FROM modulos m
    //   INNER JOIN roles_modulos rm ON m.id = rm.modulo_id
    //   INNER JOIN roles r ON r.id = rm.rol_id
    //   WHERE r.nombre = $1 AND m.activo = true
    //   ORDER BY m.id ASC;
    // `, [rol]);

    // Por ahora devolvemos todos los módulos activos (mock)
    const result = await pool.query(`
      SELECT id, nombre, tipo, categoria, ruta
      FROM modulos
      WHERE activo = true
      ORDER BY id ASC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error al obtener módulos permitidos:", err);
    res.status(500).json({ message: "Error al obtener módulos permitidos" });
  }
});

export default router;
