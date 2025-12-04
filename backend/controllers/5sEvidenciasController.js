// backend/controllers/5sEvidenciasController.js
import { supabase } from "../services/supabaseClient.js";
import pool from "../db.js";
import crypto from "crypto";

const BUCKET = "evidencias-5s"; // 👈 nombre EXACTO del bucket en Supabase

// ======================================================
// 📸 Subir evidencia a Supabase Storage + registrar en DB
// ======================================================
export const subirEvidencia = async (req, res) => {
  try {
    const empresa_id = req.user.empresa_id;

    // Los seguimos recibiendo porque los usamos en la ruta del archivo
    const { proyecto_id, tarea_id, subtarea_id } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "No se recibió archivo" });
    }

    const file = req.file;
    const fileExt = file.originalname.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;

    // Ruta dentro del bucket (organizada por empresa/proyecto/tarea)
    const filePath = `5s/${empresa_id}/${proyecto_id || "sin-proyecto"}/${tarea_id || "sin-tarea"}/${fileName}`;

    // === subir a Supabase ===
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (uploadError) {
      console.error("❌ Error subiendo archivo:", uploadError);
      return res.status(500).json({ message: "Error subiendo archivo" });
    }

    // === generar URL pública ===
    const { data: urlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(filePath);

    // === guardar registro en DB (estructura REAL de tu tabla) ===
    // Tu tabla tiene: id, id_subtarea, url, fecha
    const result = await pool.query(
      `
      INSERT INTO evidencias_5s 
        (id_subtarea, url, fecha)
      VALUES 
        ($1, $2, NOW())
      RETURNING *;
      `,
      [subtarea_id || null, urlData.publicUrl]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error en subirEvidencia:", err);
    res.status(500).json({ message: "Error procesando evidencia" });
  }
};

// ======================================================
// 🗑️ Eliminar evidencia
// ======================================================
export const eliminarEvidencia = async (req, res) => {
  try {
    const { evidencia_id } = req.params;

    const result = await pool.query(
      `DELETE FROM evidencias_5s WHERE id = $1 RETURNING *;`,
      [evidencia_id]
    );

    if (result.rowCount === 0)
      return res.status(404).json({ message: "Evidencia no encontrada" });

    const evidencia = result.rows[0];

    // borrar en Supabase
    const prefix = `/storage/v1/object/public/${BUCKET}/`;
    const idx = evidencia.url.indexOf(prefix);

    if (idx === -1) {
      console.error("❌ No se pudo extraer filePath desde la URL:", evidencia.url);
    } else {
      const filePath = evidencia.url.substring(idx + prefix.length);

      await supabase.storage
        .from(BUCKET)
        .remove([filePath]);
    }

    res.json({ message: "Evidencia eliminada correctamente" });
  } catch (err) {
    console.error("❌ Error eliminando evidencia:", err);
    res.status(500).json({ message: "Error eliminando evidencia" });
  }
};

// ======================================================
// 📄 Listar evidencias por varias subtareas
// GET /api/5s/evidencias/subtareas?ids=1,2,3
// ======================================================
export const listarEvidenciasPorSubtareas = async (req, res) => {
  try {
    const { ids } = req.query;

    if (!ids) {
      return res.json([]); // nada que buscar
    }

    const idArray = ids
      .split(",")
      .map((id) => parseInt(id, 10))
      .filter((n) => !isNaN(n));

    if (!idArray.length) {
      return res.json([]);
    }

    const result = await pool.query(
      `
      SELECT id, id_subtarea, url, fecha
      FROM evidencias_5s
      WHERE id_subtarea = ANY($1::int[])
      ORDER BY fecha DESC;
      `,
      [idArray]
    );

    // 👈 devolvemos un ARRAY plano, que es lo que espera el frontend
    return res.json(result.rows);
  } catch (err) {
    console.error("❌ Error getEvidenciasPorSubtareas:", err);
    res.status(500).json({ message: "Error consultando evidencias" });
  }
};
