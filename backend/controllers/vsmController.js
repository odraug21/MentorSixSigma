// backend/controllers/vsmController.js
import pool from "../db.js";

// 🔹 Obtiene (o crea) el único mapa VSM de la empresa
export const obtenerMapaVsm = async (req, res) => {
  try {
    const empresaId = req.user?.empresa_id;
    const usuarioId = req.user?.id;

    if (!empresaId) {
      return res.status(400).json({ ok: false, message: "Falta empresa en el token" });
    }

    // Buscamos si ya existe un mapa para esta empresa
    const { rows } = await pool.query(
      `SELECT * FROM public.vsm_mapas WHERE empresa_id = $1 ORDER BY id LIMIT 1`,
      [empresaId]
    );

    if (rows.length === 0) {
      // Creamos uno básico vacío
      const insert = await pool.query(
        `INSERT INTO public.vsm_mapas (empresa_id, creado_por)
         VALUES ($1, $2)
         RETURNING *`,
        [empresaId, usuarioId || null]
      );
      return res.json({ ok: true, mapa: insert.rows[0] });
    }

    return res.json({ ok: true, mapa: rows[0] });
  } catch (error) {
    console.error("❌ Error en obtenerMapaVsm:", error);
    return res.status(500).json({ ok: false, message: "Error obteniendo mapa VSM" });
  }
};

// 🔹 Actualiza datos cuantitativos (tabla procesos + unidad + nombre opcional)
export const actualizarMapaVsm = async (req, res) => {
  try {
    const empresaId = req.user?.empresa_id;
    const usuarioId = req.user?.id;
    const { id } = req.params;

    if (!empresaId) {
      return res.status(400).json({ ok: false, message: "Falta empresa en el token" });
    }

    const { nombre, descripcion, unidad, procesos } = req.body;

    const jsonProcesos = JSON.stringify(procesos || []);

    const { rows } = await pool.query(
      `UPDATE public.vsm_mapas
       SET nombre        = COALESCE($1, nombre),
           descripcion   = COALESCE($2, descripcion),
           unidad        = COALESCE($3, unidad),
           procesos      = $4::jsonb,
           actualizado_en = now(),
           creado_por    = COALESCE(creado_por, $5)
       WHERE id = $6 AND empresa_id = $7
       RETURNING *`,
      [
        nombre || null,
        descripcion || null,
        unidad || null,
        jsonProcesos,
        usuarioId || null,
        id,
        empresaId,
      ]
    );

    if (rows.length === 0) {
      return res.status(404).json({ ok: false, message: "Mapa VSM no encontrado" });
    }

    return res.json({ ok: true, mapa: rows[0] });
  } catch (error) {
    console.error("❌ Error en actualizarMapaVsm:", error);
    return res.status(500).json({ ok: false, message: "Error actualizando mapa VSM" });
  }
};

// 🔹 Actualiza solo el layout del builder (elements + connections)
export const actualizarLayoutVsm = async (req, res) => {
  try {
    const empresaId = req.user?.empresa_id;
    const { id } = req.params;
    const { elements, connections } = req.body;

    if (!empresaId) {
      return res.status(400).json({ ok: false, message: "Falta empresa en el token" });
    }

    const layout = JSON.stringify({ elements: elements || [], connections: connections || [] });

    const { rows } = await pool.query(
      `UPDATE public.vsm_mapas
       SET layout = $1::jsonb,
           actualizado_en = now()
       WHERE id = $2 AND empresa_id = $3
       RETURNING *`,
      [layout, id, empresaId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ ok: false, message: "Mapa VSM no encontrado" });
    }

    return res.json({ ok: true, mapa: rows[0] });
  } catch (error) {
    console.error("❌ Error en actualizarLayoutVsm:", error);
    return res.status(500).json({ ok: false, message: "Error actualizando layout VSM" });
  }
};
