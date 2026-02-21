// backend/controllers/sipocController.js
import pool from "../db.js";
import { generarConGemini } from "../api/geminiIA.js";

// Estructura base por defecto
const SIPOC_BASE = {
  suppliers: [""],
  inputs: [""],
  process: [""],
  outputs: [""],
  customers: [""],
};

// 🔹 Listar todos los SIPOC de la empresa
export const listarSipoc = async (req, res) => {
  try {
    const empresaId = req.user?.empresa_id;
    if (!empresaId) {
      return res
        .status(400)
        .json({ ok: false, message: "Falta empresa en el token" });
    }

    const { rows } = await pool.query(
      `
      SELECT id, nombre, proceso, responsable, fecha_creacion
      FROM public.sipoc_proyectos
      WHERE empresa_id = $1
      ORDER BY fecha_creacion DESC
      `,
      [empresaId]
    );

    return res.json({ ok: true, proyectos: rows });
  } catch (err) {
    console.error("❌ Error listarSipoc:", err);
    return res
      .status(500)
      .json({ ok: false, message: "Error listando SIPOC" });
  }
};

// 🔹 Obtener un SIPOC específico
export const obtenerSipoc = async (req, res) => {
  try {
    const empresaId = req.user?.empresa_id;
    const { id } = req.params;

    if (!empresaId) {
      return res
        .status(400)
        .json({ ok: false, message: "Falta empresa en el token" });
    }

    const { rows } = await pool.query(
      `
      SELECT id, nombre, proceso, responsable, fecha_creacion, sipoc_data
      FROM public.sipoc_proyectos
      WHERE empresa_id = $1 AND id = $2
      `,
      [empresaId, id]
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ ok: false, message: "SIPOC no encontrado" });
    }

    const row = rows[0];

    return res.json({
      ok: true,
      proyecto: {
        id: row.id,
        nombre: row.nombre,
        proceso: row.proceso,
        responsable: row.responsable,
        fecha_creacion: row.fecha_creacion,
        sipoc: row.sipoc_data || SIPOC_BASE,
      },
    });
  } catch (err) {
    console.error("❌ Error obtenerSipoc:", err);
    return res
      .status(500)
      .json({ ok: false, message: "Error obteniendo SIPOC" });
  }
};

// 🔹 Crear nuevo SIPOC
export const crearSipoc = async (req, res) => {
  try {
    const empresaId = req.user?.empresa_id;
    if (!empresaId) {
      return res
        .status(400)
        .json({ ok: false, message: "Falta empresa en el token" });
    }

    const { nombre, proceso, responsable, sipoc } = req.body;

    if (!nombre || !nombre.trim()) {
      return res.status(400).json({
        ok: false,
        message: "El nombre del SIPOC es obligatorio",
      });
    }

    const sipocData = sipoc && typeof sipoc === "object" ? sipoc : SIPOC_BASE;

    const { rows } = await pool.query(
      `
      INSERT INTO public.sipoc_proyectos
        (empresa_id, nombre, proceso, responsable, sipoc_data)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, nombre, proceso, responsable, fecha_creacion, sipoc_data
      `,
      [empresaId, nombre.trim(), proceso || null, responsable || null, sipocData]
    );

    const row = rows[0];

    return res.status(201).json({
      ok: true,
      proyecto: {
        id: row.id,
        nombre: row.nombre,
        proceso: row.proceso,
        responsable: row.responsable,
        fecha_creacion: row.fecha_creacion,
        sipoc: row.sipoc_data,
      },
    });
  } catch (err) {
    console.error("❌ Error crearSipoc:", err);
    return res
      .status(500)
      .json({ ok: false, message: "Error creando SIPOC" });
  }
};

// 🔹 Actualizar SIPOC existente
export const actualizarSipoc = async (req, res) => {
  try {
    const empresaId = req.user?.empresa_id;
    const { id } = req.params;
    const { nombre, proceso, responsable, sipoc } = req.body;

    if (!empresaId) {
      return res
        .status(400)
        .json({ ok: false, message: "Falta empresa en el token" });
    }

    const sipocData = sipoc && typeof sipoc === "object" ? sipoc : SIPOC_BASE;

    const { rows } = await pool.query(
      `
      UPDATE public.sipoc_proyectos
      SET
        nombre = COALESCE($1, nombre),
        proceso = $2,
        responsable = $3,
        sipoc_data = $4
      WHERE empresa_id = $5 AND id = $6
      RETURNING id, nombre, proceso, responsable, fecha_creacion, sipoc_data
      `,
      [
        nombre?.trim() || null,
        proceso || null,
        responsable || null,
        sipocData,
        empresaId,
        id,
      ]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        ok: false,
        message: "SIPOC no encontrado para actualizar",
      });
    }

    const row = rows[0];

    return res.json({
      ok: true,
      proyecto: {
        id: row.id,
        nombre: row.nombre,
        proceso: row.proceso,
        responsable: row.responsable,
        fecha_creacion: row.fecha_creacion,
        sipoc: row.sipoc_data,
      },
    });
  } catch (err) {
    console.error("❌ Error actualizarSipoc:", err);
    return res
      .status(500)
      .json({ ok: false, message: "Error actualizando SIPOC" });
  }
};

// 🔹 Eliminar SIPOC
export const eliminarSipoc = async (req, res) => {
  try {
    const empresaId = req.user?.empresa_id;
    const { id } = req.params;

    if (!empresaId) {
      return res
        .status(400)
        .json({ ok: false, message: "Falta empresa en el token" });
    }

    const { rowCount } = await pool.query(
      `
      DELETE FROM public.sipoc_proyectos
      WHERE empresa_id = $1 AND id = $2
      `,
      [empresaId, id]
    );

    if (rowCount === 0) {
      return res.status(404).json({
        ok: false,
        message: "SIPOC no encontrado para eliminar",
      });
    }

    return res.json({ ok: true, message: "SIPOC eliminado correctamente" });
  } catch (err) {
    console.error("❌ Error eliminarSipoc:", err);
    return res
      .status(500)
      .json({ ok: false, message: "Error eliminando SIPOC" });
  }
};

// 🔹 IA: análisis de un SIPOC
export const analizarSipocIA = async (req, res) => {
  try {
    const { prompt, engine = "gemini" } = req.body || {};

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        ok: false,
        message: "Falta el prompt para analizar el SIPOC",
      });
    }

    console.log("🧠 [SIPOC IA] Engine:", engine);
    console.log("📝 [SIPOC IA] Prompt recibido:\n", prompt);

    const respuestaIA = await generarConGemini({
      prompt,
      engine,
      contexto: "Analisis SIPOC",
    });

    const textoPlano =
      typeof respuestaIA === "string"
        ? respuestaIA
        : respuestaIA?.texto ||
          respuestaIA?.content ||
          JSON.stringify(respuestaIA, null, 2);

    console.log("✅ [SIPOC IA] Respuesta generada.");

    return res.json({
      ok: true,
      sugerencia: textoPlano,
    });
  } catch (error) {
    console.error("❌ Error en analizarSipocIA:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al generar análisis IA de SIPOC",
      detalle: error.message,
    });
  }
};
