// backend/routes/contactoRoutes.js
import express from "express";
import pool from "../db.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

/* ===========================
   📩 1️⃣ Crear registro (público)
   =========================== */
router.post("/enviar", async (req, res) => {
  try {
    const { nombre, apellido, empresa, tipoUsuario, correo, telefono, mensaje } = req.body;

    if (!nombre || !correo) {
      return res.status(400).json({ message: "nombre y correo son obligatorios" });
    }

    const result = await pool.query(
      `INSERT INTO consultas (nombre, apellido, empresa, tipo_usuario, correo, telefono, mensaje, estado, fecha)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'Nuevo',NOW())
       RETURNING *`,
      [nombre, apellido, empresa || null, tipoUsuario || null, correo, telefono || null, mensaje || null]
    );

    res.status(201).json({ message: "✅ Consulta guardada correctamente", data: result.rows[0] });
  } catch (e) {
    console.error("❌ Error guardando registro:", e);
    res.status(500).json({ message: "Error al guardar la consulta" });
  }
});

/* ===========================
   📋 2️⃣ Listar registros (solo SuperAdmin)
   =========================== */
router.get("/", verifyToken, async (req, res) => {
  try {
    const { q, tipoUsuario, empresa, page = 1, pageSize = 20 } = req.query;
    const values = [];
    const where = [];

    if (q) {
      values.push(`%${q}%`);
      where.push(`(nombre ILIKE $${values.length} OR correo ILIKE $${values.length} OR empresa ILIKE $${values.length})`);
    }

    if (tipoUsuario) {
      values.push(tipoUsuario);
      where.push(`tipo_usuario = $${values.length}`);
    }

    if (empresa) {
      values.push(empresa);
      where.push(`empresa = $${values.length}`);
    }

    const whereSQL = where.length ? `WHERE ${where.join(" AND ")}` : "";
    const offset = (Number(page) - 1) * Number(pageSize);

    const data = await pool.query(
      `SELECT * FROM consultas ${whereSQL}
       ORDER BY fecha DESC
       LIMIT ${Number(pageSize)} OFFSET ${offset}`,
      values
    );

    const total = await pool.query(`SELECT COUNT(*) FROM consultas ${whereSQL}`, values);

    res.json({
      items: data.rows,
      total: Number(total.rows[0].count),
      page: Number(page),
      pageSize: Number(pageSize),
    });
  } catch (e) {
    console.error("❌ Error listando registros:", e);
    res.status(500).json({ message: "Error al listar registros" });
  }
});

export default router;


