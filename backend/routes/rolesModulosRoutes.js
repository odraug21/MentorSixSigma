// backend/routes/rolesModulosRoutes.js
import express from "express";
import pool from "../db.js";
import { verifyToken } from "../middleware/auth.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

/* =============================================================
   📌 Obtener módulos y permisos de un rol
   ============================================================= */
router.get(
  "/rol/:rolId",
  verifyToken,
  requireRole(["SuperAdmin"]),
  async (req, res) => {
    try {
      const { rolId } = req.params;

      const result = await pool.query(
        `SELECT 
           rm.id,
           rm.rol_id,
           rm.modulo_id,
           rm.permiso_lectura,
           rm.permiso_escritura,
           rm.permiso_admin,
           rm.activo,
           m.nombre,
           m.ruta,
           m.categoria,
           m.tipo
         FROM roles_modulos rm
         JOIN modulos m ON m.id = rm.modulo_id
         WHERE rm.rol_id = $1
         ORDER BY m.tipo, m.categoria, m.nombre`,
        [rolId]
      );

      res.json(result.rows);
    } catch (err) {
      console.error("❌ Error cargando módulos del rol:", err);
      res.status(500).json({ message: "Error cargando módulos" });
    }
  }
);

/* =============================================================
   📌 Crear / actualizar relación rol-módulo
   body: { rol_id, modulo_id, permiso_lectura, permiso_escritura, permiso_admin, activo }
   ============================================================= */
router.post(
  "/",
  verifyToken,
  requireRole(["SuperAdmin"]),
  async (req, res) => {
    try {
      const {
        rol_id,
        modulo_id,
        permiso_lectura = true,
        permiso_escritura = false,
        permiso_admin = false,
        activo = true,
      } = req.body;

      const result = await pool.query(
        `INSERT INTO roles_modulos 
           (rol_id, modulo_id, permiso_lectura, permiso_escritura, permiso_admin, activo)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (rol_id, modulo_id)
         DO UPDATE SET 
           permiso_lectura   = EXCLUDED.permiso_lectura,
           permiso_escritura = EXCLUDED.permiso_escritura,
           permiso_admin     = EXCLUDED.permiso_admin,
           activo            = EXCLUDED.activo
         RETURNING *`,
        [rol_id, modulo_id, permiso_lectura, permiso_escritura, permiso_admin, activo]
      );

      res.json(result.rows[0]);
    } catch (err) {
      console.error("❌ Error asignando módulo:", err);
      res.status(500).json({ message: "No se pudo asignar módulo" });
    }
  }
);

/* =============================================================
   📌 Eliminar relación (si quieres limpiar algo)
   ============================================================= */
router.delete(
  "/:id",
  verifyToken,
  requireRole(["SuperAdmin"]),
  async (req, res) => {
    try {
      await pool.query("DELETE FROM roles_modulos WHERE id = $1", [
        req.params.id,
      ]);
      res.json({ message: "Relación eliminada" });
    } catch (err) {
      console.error("❌ Error eliminando relación:", err);
      res.status(500).json({ message: "No se pudo eliminar" });
    }
  }
);

export default router;
