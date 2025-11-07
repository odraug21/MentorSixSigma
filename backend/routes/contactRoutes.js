// backend/routes/contactRoutes.js
import express from "express";
import { pool } from "../db.js"; // ✅ corregido: import nombrado

const router = express.Router();

// 📩 Registrar mensaje de contacto
router.post("/enviar", async (req, res) => {
  try {
    const { nombre, apellido, empresa, tipoUsuario, telefono, correo, mensaje } = req.body;

    if (!nombre || !apellido || !correo || !mensaje) {
      return res.status(400).json({ error: "Campos obligatorios incompletos" });
    }

    const result = await pool.query(
      `INSERT INTO contactos (nombre, apellido, empresa, tipo_usuario, telefono, correo, mensaje)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [nombre, apellido, empresa, tipoUsuario, telefono, correo, mensaje]
    );

    res.status(201).json({
      ok: true,
      message: "✅ Uno de nuestros asesores se contactará con usted lo más pronto posible.",
      id: result.rows[0].id,
    });
  } catch (error) {
    console.error("❌ Error registrando contacto:", error);
    res.status(500).json({ error: "Error al registrar el contacto." });
  }
});

export default router;
