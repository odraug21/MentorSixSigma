// backend/routes/authRoutes.js
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";

const router = express.Router();

/**
 * POST /api/auth/login
 * Body: { email, password, empresa }
 */
router.post("/login", async (req, res) => {
  const { email, password, empresa } = req.body;

  if (!email || !password || !empresa) {
    return res
      .status(400)
      .json({ message: "Faltan campos: email, password, empresa" });
  }

  try {
    // 🔍 Buscar usuario, empresa y rol
    const query = `
      SELECT 
        u.id,
        u.nombre,
        u.email,
        u.password_hash,
        e.nombre AS empresa_nombre,
        r.nombre AS rol_nombre
      FROM usuarios u
      JOIN empresas e ON e.id = u.empresa_id
      JOIN roles r ON r.id = u.rol_id
      WHERE u.email = $1 AND e.nombre = $2 AND u.activo = true
      LIMIT 1;
    `;

    const { rows } = await pool.query(query, [email, empresa]);

    if (rows.length === 0) {
      return res
        .status(400)
        .json({ message: "Usuario o empresa no válidos" });
    }

    const user = rows[0];

    // 🔐 Comparar contraseña
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    // 🔑 Crear token JWT
    const token = jwt.sign(
      {
        id: user.id,
        rol: user.rol_nombre,
        empresa: user.empresa_nombre,
      },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    // ✅ Respuesta exitosa
    return res.json({
      token,
      usuario: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol_nombre,
        empresa: user.empresa_nombre,
      },
    });
  } catch (err) {
    console.error("Error en login:", err);
    return res.status(500).json({ message: "Error en el servidor" });
  }
});

export default router;

