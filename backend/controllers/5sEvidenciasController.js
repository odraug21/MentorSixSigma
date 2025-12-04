// backend/controllers/5sEvidenciasController.js
import pool from "../db.js";
import { supabase } from "../services/supabaseClient.js";

/**
 * POST /api/5s/evidencias/upload
 * Body (form-data):
 *  - file (archivo)
 *  - subtarea_id (OBLIGATORIO)
 *  - origen = 'implementacion' | 'auditoria'  (opcional)
 *  - es_auditoria = true/false (compatibilidad antigua)
 */
export const subirEvidencia = async (req, res) => {
  try {
    const file = req.file;
    const {
      subtarea_id,
      origen,
      es_auditoria, // compatibilidad con código antiguo
    } = req.body || {};

    if (!file) {
      return res.status(400).json({ message: "No se recibió archivo" });
    }
    if (!subtarea_id) {
      return res
        .status(400)
        .json({ message: "subtarea_id es obligatorio para la evidencia" });
    }

    // 🔁 Resolver origen en base a 'origen' o 'es_auditoria'
    let origenFinal = "implementacion";
    if (origen) {
      origenFinal = origen; // si viene explícito, lo respetamos
    } else if (typeof es_auditoria !== "undefined") {
      const val = String(es_auditoria).toLowerCase();
      origenFinal =
        val === "true" || val === "1" ? "auditoria" : "implementacion";
    }

    // 📁 Nombre y ruta en Supabase
    const ext = file.originalname.split(".").pop();
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const fileName = `${unique}.${ext}`;
    const filePath = `${subtarea_id}/${origenFinal}/${fileName}`;

    // 📤 Subir a Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("evidencias-5s") // 👈 ESTE es el bucket que me mostraste
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (uploadError) {
      console.error("❌ Error subiendo a Supabase:", uploadError);
      return res
        .status(500)
        .json({ message: "Error subiendo archivo a almacenamiento" });
    }

    // 🔗 URL pública
    const { data: publicData } = supabase.storage
      .from("evidencias-5s")
      .getPublicUrl(uploadData.path);

    const url = publicData.publicUrl;

    // 💾 Guardar en BD
    // columnas: id_subtarea, url, origen
    const insertRes = await pool.query(
      `INSERT INTO evidencias_5s (id_subtarea, url, origen)
       VALUES ($1, $2, $3)
       RETURNING id, id_subtarea, url, origen`,
      [subtarea_id, url, origenFinal]
    );

    return res.status(201).json(insertRes.rows[0]);
  } catch (err) {
    console.error("❌ Error en subirEvidencia:", err);
    return res.status(500).json({ message: "Error al subir evidencia 5S" });
  }
};


/**
 * GET /api/5s/evidencias/subtareas?ids=1,2,3[&origen=implementacion|auditoria]
 * Devuelve evidencias por subtarea.
 */
export const listarEvidenciasPorSubtareas = async (req, res) => {
  const { ids = "", origen } = req.query;

  const idList = ids
    .split(",")
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !Number.isNaN(n));

  if (!idList.length) {
    return res.json([]);
  }

  const params = [];
  const placeholders = idList.map((_, i) => `$${i + 1}`).join(",");
  params.push(...idList);

  let origenSql = "";
  if (origen) {
    params.push(origen);
    origenSql = ` AND origen = $${params.length}`;
  }

  try {
    const query = `
      SELECT
        id,
        id_subtarea,
        url,
        origen
      FROM evidencias_5s
      WHERE id_subtarea IN (${placeholders})
      ${origenSql}
      ORDER BY id DESC
    `;

    const { rows } = await pool.query(query, params);
    return res.json(rows);
  } catch (err) {
    console.error("❌ Error en listarEvidenciasPorSubtareas:", err);
    return res.status(500).json({ message: "Error listando evidencias 5S" });
  }
};

/**
 * GET /api/5s/evidencias/auditoria/subtareas?ids=1,2,3
 * Atajo: siempre origen = 'auditoria'
 */
export const listarEvidenciasAuditoriaPorSubtareas = (req, res) => {
  req.query.origen = "auditoria";
  return listarEvidenciasPorSubtareas(req, res);
};

/**
 * DELETE /api/5s/evidencias/:evidencia_id
 */
export const eliminarEvidencia = async (req, res) => {
  const { evidencia_id } = req.params;

  try {
    await pool.query("DELETE FROM evidencias_5s WHERE id = $1", [evidencia_id]);
    return res.json({ success: true });
  } catch (err) {
    console.error("❌ Error en eliminarEvidencia:", err);
    return res.status(500).json({ message: "Error eliminando evidencia 5S" });
  }
};
