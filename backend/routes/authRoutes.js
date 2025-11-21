// backend/routes/authRoutes.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../db.js";

const router = express.Router();

/**
 * POST /api/auth/login
 * Body: { email, password, empresa? }
 */
router.post("/login", async (req, res) => {
  const { email, password, empresa } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email y contraseña son obligatorios." });
  }

  try {
    // 1️⃣ Buscar usuario + empresa + rol
    const query = `
      SELECT 
        u.id,
        u.nombre,
        u.email,
        u.password_hash,
        u.empresa_id,
        e.nombre AS empresa_nombre,
        r.id     AS rol_id,
        r.nombre AS rol_nombre
      FROM usuarios u
      JOIN empresas e ON e.id = u.empresa_id
      JOIN roles    r ON r.id = u.rol_id
      WHERE LOWER(u.email) = LOWER($1)
        ${empresa ? "AND (e.id::text = $2 OR e.nombre = $2)" : ""}
        AND u.activo = true
      LIMIT 1;
    `;

    const params = empresa ? [email, empresa] : [email];
    const { rows } = await pool.query(query, params);

    if (rows.length === 0) {
      return res
        .status(400)
        .json({ message: "Usuario o empresa no válidos." });
    }

    const user = rows[0];

    // 2️⃣ Validar contraseña
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ message: "Contraseña incorrecta." });
    }

    // 3️⃣ Obtener módulos permitidos según el rol del usuario
    //    Usamos tus tablas: modulos + roles_modulos
    const modQuery = `
      SELECT 
        m.id,
        m.nombre,
        m.descripcion,
        m.ruta,
        m.categoria,
        m.tipo,
        rm.permiso_lectura,
        rm.permiso_escritura,
        rm.permiso_admin
      FROM roles_modulos rm
      JOIN modulos m ON m.id = rm.modulo_id
      WHERE rm.rol_id = $1
        AND rm.activo = true
        AND m.activo = true
        AND rm.permiso_lectura = true
      ORDER BY m.tipo, m.categoria, m.nombre;
    `;
    const modRes = await pool.query(modQuery, [user.rol_id]);
    let modulos = modRes.rows;

    // 3.1️⃣ Opcional: agregar "Inicio" al menú si quieres que todos lo tengan
    const inicioModulo = {
      id: 0,
      nombre: "Inicio",
      descripcion: "Panel principal",
      ruta: "/inicio",
      categoria: "General",
      tipo: "general",
      permiso_lectura: true,
      permiso_escritura: false,
      permiso_admin: false,
    };

    // Lo agregamos al principio si no existe
    if (!modulos.some((m) => m.ruta === "/inicio")) {
      modulos = [inicioModulo, ...modulos];
    }

    // 4️⃣ Generar token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        rol: user.rol_nombre,
        empresa_id: user.empresa_id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    // 5️⃣ Respuesta unificada para frontend (AuthContext + Navbar)
    return res.json({
      token,
      usuario: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol_nombre,
        empresa: user.empresa_nombre,
        empresa_id: user.empresa_id,
        modulos, // 👈 aquí vienen todos los módulos permitidos
      },
    });
  } catch (err) {
    console.error("💥 Error en login:", err);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
});

export default router;
