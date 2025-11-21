// ============================================================
// 📌 usuariosRoutes.js
// 🚀 Versión optimizada — consultas limpias y claras
// ============================================================

import express from "express";
import bcrypt from "bcryptjs";
import pool from "../db.js";
import { verifyToken } from "../middleware/auth.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

// ============================================================
// 🔹 Obtener lista de roles (SuperAdmin)
// ============================================================

router.get("/roles", verifyToken, requireRole(["SuperAdmin"]), async (_req, res) => {
  try {
    const result = await pool.query("SELECT id, nombre FROM roles ORDER BY id ASC;");
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error obteniendo roles:", error);
    res.status(500).json({ message: "Error interno." });
  }
});

// ============================================================
// 🔹 Obtener lista de empresas (Solo SuperAdmin)
// ============================================================

router.get("/empresas", verifyToken, requireRole(["SuperAdmin"]), async (_req, res) => {
  try {
    const result = await pool.query("SELECT id, nombre FROM empresas ORDER BY nombre ASC;");
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error obteniendo empresas:", error);
    res.status(500).json({ message: "Error interno." });
  }
});

// ============================================================
// 🔹 Obtener usuarios
//    - SuperAdmin → ve todos
//    - AdminEmpresa → solo usuarios de su empresa
// ============================================================

router.get("/", verifyToken, async (req, res) => {
  try {
    const { rol, empresa } = req.user;

    let query = `
      SELECT u.id, u.nombre, u.email, r.nombre AS rol, e.nombre AS empresa
      FROM usuarios u
      JOIN roles r ON r.id = u.rol_id
      JOIN empresas e ON e.id = u.empresa_id
    `;
    const params = [];

    if (rol !== "SuperAdmin") {
      query += " WHERE e.nombre = $1";
      params.push(empresa);
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error obteniendo usuarios:", error);
    res.status(500).json({ message: "Error interno." });
  }
});

// ============================================================
// 🔹 Crear usuario
// ============================================================

router.post("/", verifyToken, requireRole(["SuperAdmin", "AdminEmpresa"]), async (req, res) => {
  try {
    const { rol, empresa: empresaSesion } = req.user;
    const { nombre, email, password, empresa_id, rol_id } = req.body;

    if (!nombre || !email || !password || !empresa_id || !rol_id) {
      return res.status(400).json({ message: "Todos los campos son obligatorios." });
    }

    // AdminEmpresa solo crea dentro de su empresa
    if (rol === "AdminEmpresa") {
      const empresaRes = await pool.query("SELECT id FROM empresas WHERE nombre = $1", [empresaSesion]);

      if (empresaRes.rows.length === 0 || empresaRes.rows[0].id !== empresa_id) {
        return res.status(403).json({ message: "No tienes permiso para crear usuarios en otra empresa." });
      }
    }

    const existe = await pool.query("SELECT 1 FROM usuarios WHERE email = $1", [email]);

    if (existe.rows.length > 0) {
      return res.status(400).json({ message: "El correo ya está registrado." });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const insert = await pool.query(
      `INSERT INTO usuarios (nombre, email, password_hash, empresa_id, rol_id, activo, fecha_creacion)
       VALUES ($1, $2, $3, $4, $5, true, NOW())
       RETURNING id, nombre, email;`,
      [nombre, email, password_hash, empresa_id, rol_id]
    );

    res.status(201).json({ message: "Usuario creado correctamente", usuario: insert.rows[0] });
  } catch (error) {
    console.error("❌ Error creando usuario:", error);
    res.status(500).json({ message: "Error interno." });
  }
});

// ============================================================
// 🔹 Editar usuario
// ============================================================

router.put("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, empresa_id, rol_id, password } = req.body;

    const result = await pool.query(
      `UPDATE usuarios
       SET nombre=$1, email=$2, empresa_id=$3, rol_id=$4
       WHERE id=$5
       RETURNING id, nombre, email;`,
      [nombre, email, empresa_id, rol_id, id]
    );

    if (password && password.trim() !== "") {
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);
      await pool.query("UPDATE usuarios SET password_hash=$1 WHERE id=$2", [
        password_hash,
        id,
      ]);
    }

    res.json({ message: "Usuario actualizado", usuario: result.rows[0] });
  } catch (error) {
    console.error("❌ Error editando usuario:", error);
    res.status(500).json({ message: "Error interno." });
  }
});

// ============================================================
// 🔹 Eliminar usuario
// ============================================================

router.delete("/:id", verifyToken, async (req, res) => {
  try {
    await pool.query("DELETE FROM usuarios WHERE id = $1", [req.params.id]);
    res.json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    console.error("❌ Error eliminando usuario:", error);
    res.status(500).json({ message: "Error interno." });
  }
});

// ============================================================
// 🔹 Activar / desactivar usuario
// ============================================================

router.patch("/:id/activo", verifyToken, async (req, res) => {
  try {
    const { activo } = req.body;

    const result = await pool.query(
      "UPDATE usuarios SET activo = $1 WHERE id = $2 RETURNING id, nombre, activo;",
      [!!activo, req.params.id]
    );

    res.json({
      message: `Usuario ${activo ? "activado" : "desactivado"} correctamente`,
      usuario: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Error actualizando estado:", error);
    res.status(500).json({ message: "Error interno." });
  }
});

// ============================================================
// 🔹 Empresas por email (para login)
// ============================================================

router.get("/empresas/:email", async (req, res) => {
  try {
    const email = decodeURIComponent(req.params.email);

    const result = await pool.query(
      `SELECT e.id, e.nombre
       FROM usuarios u
       JOIN empresas e ON e.id = u.empresa_id
       WHERE LOWER(u.email) = LOWER($1);`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No hay empresas asociadas al usuario." });
    }

    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error obteniendo empresas:", error);
    res.status(500).json({ message: "Error interno." });
  }
});

export default router;
