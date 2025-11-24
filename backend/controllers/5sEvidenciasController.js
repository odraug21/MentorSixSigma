// backend/controllers/5sEvidenciasController.js
import { supabase } from "../services/supabaseClient.js";
import pool from "../db.js";
import crypto from "crypto";

// ======================================================
// 📸 Subir evidencia a Supabase Storage + registrar en DB
// ======================================================
export const subirEvidencia = async (req, res) => {
  try {
    const usuario_id = req.user.id;
    const empresa_id = req.user.empresa_id;

    const { proyecto_id, tarea_id, subtarea_id } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "No se recibió archivo" });
    }

    const file = req.file;
    const fileExt = file.originalname.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;

    const filePath = `5s/${empresa_id}/${proyecto_id}/${tarea_id}/${fileName}`;

    // === subir a Supabase ===
    const { error: uploadError } = await supabase.storage
      .from("mentorsuites-evidencias")
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
      .from("mentorsuites-evidencias")
      .getPublicUrl(filePath);

    // === guardar registro en DB ===
    const result = await pool.query(
      `
      INSERT INTO evidencias_5s 
        (proyecto_id, tarea_id, subtarea_id, url, nombre_archivo, usuario_id)
      VALUES 
        ($1, $2, $3, $4, $5, $6)
      RETURNING *;
      `,
      [proyecto_id, tarea_id || null, subtarea_id || null, urlData.publicUrl, fileName, usuario_id]
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
    const filePath = evidencia.url.split("/storage/v1/object/public/mentorsuites-evidencias/")[1];

    await supabase.storage
      .from("mentorsuites-evidencias")
      .remove([filePath]);

    res.json({ message: "Evidencia eliminada correctamente" });

  } catch (err) {
    console.error("❌ Error eliminando evidencia:", err);
    res.status(500).json({ message: "Error eliminando evidencia" });
  }
};
