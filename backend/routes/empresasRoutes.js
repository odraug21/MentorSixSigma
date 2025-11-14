// backend/routes/empresasRoutes.js
import express from "express";
import pool from "../db.js";
import { verifyToken } from "../middleware/auth.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Listar empresas (Solo SuperAdmin)
router.get("/", verifyToken, requireRole(["SuperAdmin"]), async (_req, res) => {
  const result = await pool.query("SELECT * FROM empresas ORDER BY id ASC");
  res.json(result.rows);
});

// Crear empresa (Solo SuperAdmin)
router.post("/", verifyToken, requireRole(["SuperAdmin"]), async (req, res) => {
  try {
    const {
      nombre,
      rut,
      pais,
      direccion,
      telefono,
      contacto,
      correo,
      tipo_contrato,
      metodo_pago,
      tarifa,
      fecha_cobro,
      fecha_inicio,
      fecha_fin,
      activa = true
    } = req.body;

    if (!nombre || !rut || !pais) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    const insert = await pool.query(
      `
      INSERT INTO empresas (
        nombre, rut, pais, direccion, telefono, contacto, correo,
        tipo_contrato, metodo_pago, tarifa, fecha_cobro, fecha_inicio, fecha_fin,
        activa, fecha_creacion
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,NOW()
      )
      RETURNING *;
      `,
      [
        nombre,
        rut,
        pais,
        direccion || null,
        telefono || null,
        contacto || null,
        correo || null,
        tipo_contrato || null,
        metodo_pago || null,
        tarifa ? Number(tarifa) : null,
        fecha_cobro ? new Date(fecha_cobro) : null,
        fecha_inicio ? new Date(fecha_inicio) : null,
        fecha_fin ? new Date(fecha_fin) : null,
        activa
      ]
    );

    res.status(201).json({
      message: "✅ Empresa creada correctamente",
      empresa: insert.rows[0],
    });
  } catch (err) {
    console.error("❌ Error al crear empresa:", err);
    res.status(500).json({ message: "Error al crear empresa" });
  }
});


// Eliminar empresa (Solo SuperAdmin)
router.delete("/:id", verifyToken, requireRole(["SuperAdmin"]), async (req, res) => {
  const { id } = req.params;
  try {
    const existe = await pool.query("SELECT id FROM empresas WHERE id = $1", [id]);
    if (existe.rows.length === 0) {
      return res.status(404).json({ message: "Empresa no encontrada" });
    }
    await pool.query("DELETE FROM empresas WHERE id = $1", [id]);
    res.json({ message: "🗑️ Empresa eliminada correctamente" });
  } catch (err) {
    console.error("❌ Error eliminando empresa:", err);
    res.status(500).json({ message: "Error al eliminar empresa" });
  }
});

// ✅ Actualizar empresa existente
router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const {
    nombre,
    rut,
    pais,
    direccion,
    telefono,
    contacto,
    correo,
    tipo_contrato,
    metodo_pago,
    tarifa,
    fecha_cobro,
    fecha_inicio,
    fecha_fin,
    activa,
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE empresas
       SET nombre = COALESCE($1, nombre),
           rut = COALESCE($2, rut),
           pais = COALESCE($3, pais),
           direccion = COALESCE($4, direccion),
           telefono = COALESCE($5, telefono),
           contacto = COALESCE($6, contacto),
           correo = COALESCE($7, correo),
           tipo_contrato = COALESCE($8, tipo_contrato),
           metodo_pago = COALESCE($9, metodo_pago),
           tarifa = COALESCE($10, tarifa),
           fecha_cobro = COALESCE($11, fecha_cobro),
           fecha_inicio = COALESCE($12, fecha_inicio),
           fecha_fin = COALESCE($13, fecha_fin),
           activa = COALESCE($14, activa)
       WHERE id = $15
       RETURNING *;`,
      [
        nombre,
        rut,
        pais,
        direccion,
        telefono,
        contacto,
        correo,
        tipo_contrato,
        metodo_pago,
        tarifa,
        fecha_cobro,
        fecha_inicio,
        fecha_fin,
        activa,
        id,
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Empresa no encontrada" });
    }

    res.json({
      message: "✅ Empresa actualizada correctamente",
      empresa: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Error actualizando empresa:", error);
    res.status(500).json({ message: "Error al actualizar empresa" });
  }
});

// ✅ Actualizar empresa existente
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const {
    nombre,
    rut,
    pais,
    direccion,
    telefono,
    contacto,
    correo,
    tipo_contrato,
    metodo_pago,
    tarifa,
    fecha_cobro,
    fecha_inicio,
    fecha_fin,
    activa,
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE empresas
       SET nombre = COALESCE($1, nombre),
           rut = COALESCE($2, rut),
           pais = COALESCE($3, pais),
           direccion = COALESCE($4, direccion),
           telefono = COALESCE($5, telefono),
           contacto = COALESCE($6, contacto),
           correo = COALESCE($7, correo),
           tipo_contrato = COALESCE($8, tipo_contrato),
           metodo_pago = COALESCE($9, metodo_pago),
           tarifa = COALESCE($10, tarifa),
           fecha_cobro = COALESCE($11, fecha_cobro),
           fecha_inicio = COALESCE($12, fecha_inicio),
           fecha_fin = COALESCE($13, fecha_fin),
           activa = COALESCE($14, activa)
       WHERE id = $15
       RETURNING *;`,
      [
        nombre,
        rut,
        pais,
        direccion,
        telefono,
        contacto,
        correo,
        tipo_contrato,
        metodo_pago,
        tarifa,
        fecha_cobro,
        fecha_inicio,
        fecha_fin,
        activa,
        id,
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Empresa no encontrada" });
    }

    res.json({
      message: "✅ Empresa actualizada correctamente",
      empresa: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Error actualizando empresa:", error);
    res.status(500).json({ message: "Error al actualizar empresa" });
  }
});



export default router;
