// backend/routes/fiveSRoutes.js
import express from "express";
import pool from "../db.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

/**
 * ==========================================
 * 1️⃣ Listar proyectos 5S del usuario logueado
 * GET /api/5s/proyectos
 * ==========================================
 */
router.get("/proyectos", verifyToken, async (req, res) => {
  try {
    const { id: usuario_id } = req.user;

    const result = await pool.query(
      `
      SELECT p.*, e.nombre AS empresa_nombre
      FROM proyectos_5s p
      LEFT JOIN empresas e ON e.id = p.empresa_id
      WHERE p.usuario_id = $1
      ORDER BY p.fecha_creacion DESC;
      `,
      [usuario_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error obteniendo proyectos 5S:", error);
    res.status(500).json({ message: "Error al listar proyectos 5S" });
  }
});

/**
 * ==========================================
 * 2️⃣ Crear proyecto 5S
 * POST /api/5s/proyectos
 * Body: { nombre, area, responsable, fechaInicio }
 * ==========================================
 */
router.post("/proyectos", verifyToken, async (req, res) => {
  try {
    const { id: usuario_id, empresa_id } = req.user;
    const { nombre, area, responsable, fechaInicio } = req.body;

    if (!nombre || !area) {
      return res
        .status(400)
        .json({ message: "Nombre y área del proyecto son obligatorios." });
    }

    const result = await pool.query(
      `
      INSERT INTO proyectos_5s 
        (usuario_id, empresa_id, nombre, area, responsable, fecha_inicio, estado, avance)
      VALUES 
        ($1, $2, $3, $4, $5, $6, 'En progreso', 0)
      RETURNING *;
      `,
      [
        usuario_id,
        empresa_id || null,
        nombre,
        area,
        responsable || null,
        fechaInicio || null,
      ]
    );

    console.log("✅ Proyecto 5S creado:", result.rows[0].id);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("❌ Error creando proyecto 5S:", error);
    res.status(500).json({ message: "Error al crear proyecto 5S" });
  }
});

/**
 * ==========================================
 * 3️⃣ Eliminar proyecto 5S
 * DELETE /api/5s/proyectos/:id
 * (las tablas hijas tienen ON DELETE CASCADE)
 * ==========================================
 */
router.delete("/proyectos/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM proyectos_5s WHERE id = $1 RETURNING id;",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Proyecto 5S no encontrado" });
    }

    console.log("🗑️ Proyecto 5S eliminado:", id);
    res.json({ message: "Proyecto 5S eliminado correctamente" });
  } catch (error) {
    console.error("❌ Error eliminando proyecto 5S:", error);
    res.status(500).json({ message: "Error al eliminar proyecto 5S" });
  }
});

/**
 * ==========================================
 * 4️⃣ Seguimiento 5S (por proyecto)
 * GET /api/5s/seguimiento/:proyectoId
 * PATCH /api/5s/seguimiento/:proyectoId
 * Usa tabla: seguimientos_5s
 * ==========================================
 */

// Obtener seguimiento actual de un proyecto
router.get("/seguimiento/:proyectoId", verifyToken, async (req, res) => {
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

    if (result.rowCount === 0) {
      return res.json(null); // sin seguimiento aún
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("❌ Error obteniendo seguimiento 5S:", error);
    res.status(500).json({ message: "Error al obtener seguimiento 5S" });
  }
});

// Crear o actualizar seguimiento de un proyecto
router.patch("/seguimiento/:proyectoId", verifyToken, async (req, res) => {
  try {
    const { proyectoId } = req.params;
    const { etapa, fecha_inicio, fecha_fin, avance, estado } = req.body;

    // Ver si ya existe seguimiento
    const existing = await pool.query(
      "SELECT id FROM seguimientos_5s WHERE proyecto_id = $1",
      [proyectoId]
    );

    if (existing.rowCount === 0) {
      // Crear nuevo
      const insert = await pool.query(
        `
        INSERT INTO seguimientos_5s
          (proyecto_id, etapa, fecha_inicio, fecha_fin, avance, estado)
        VALUES
          ($1, $2, $3, $4, $5, $6)
        RETURNING *;
        `,
        [proyectoId, etapa || null, fecha_inicio || null, fecha_fin || null, avance || 0, estado || null]
      );
      return res.status(201).json(insert.rows[0]);
    } else {
      // Actualizar existente
      const update = await pool.query(
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
        [etapa || null, fecha_inicio || null, fecha_fin || null, avance || 0, estado || null, proyectoId]
      );
      return res.json(update.rows[0]);
    }
  } catch (error) {
    console.error("❌ Error guardando seguimiento 5S:", error);
    res.status(500).json({ message: "Error al guardar seguimiento 5S" });
  }
});

export default router;
