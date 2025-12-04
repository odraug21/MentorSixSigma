// backend/controllers/5sAuditoriaController.js
import pool from "../db.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * GET /api/5s/auditoria/:proyectoId
 * Devuelve:
 *  - proyecto 5S
 *  - auditoria (cabecera) si existe (última)
 *  - secciones con tareas/subtareas + datos de auditoría (puntuación, observaciones)
 *  - evidencias por subtarea:
 *      - evidenciasAntes  => implementación (es_auditoria = false / null)
 *      - evidenciasAhora  => auditoría (es_auditoria = true)
 */
export const getAuditoriaDetallada5S = async (req, res) => {
  const { proyectoId } = req.params;

  try {
    // 1) Datos básicos del proyecto
    const proyectoRes = await pool.query(
      `SELECT p.id,
              p.nombre,
              p.area,
              p.responsable,
              p.fecha_inicio,
              e.nombre AS empresa_nombre
       FROM proyectos_5s p
       LEFT JOIN empresas e ON e.id = p.empresa_id
       WHERE p.id = $1`,
      [proyectoId]
    );

    if (proyectoRes.rowCount === 0) {
      return res
        .status(404)
        .json({ message: "Proyecto 5S no encontrado para auditoría" });
    }
    const proyecto = proyectoRes.rows[0];

    // 2) Buscar la última implementación para este proyecto
    const implRes = await pool.query(
      `SELECT id
       FROM implementaciones_5s
       WHERE proyecto_id = $1
       ORDER BY creado_en DESC
       LIMIT 1`,
      [proyectoId]
    );

    if (implRes.rowCount === 0) {
      return res.status(400).json({
        message:
          "El proyecto aún no tiene implementación 5S registrada. No se puede auditar.",
      });
    }

    const implementacionId = implRes.rows[0].id;

    // 3) Traer tareas y subtareas de la implementación
    const tareasRes = await pool.query(
      `SELECT id, seccion, lugar, descripcion
       FROM tareas_5s
       WHERE implementacion_id = $1
       ORDER BY id ASC`,
      [implementacionId]
    );
    const tareas = tareasRes.rows;

    const subtareasRes = await pool.query(
      `SELECT id, tarea_id, lugar, descripcion
       FROM subtareas_5s
       WHERE tarea_id IN (
         SELECT id FROM tareas_5s WHERE implementacion_id = $1
       )
       ORDER BY id ASC`,
      [implementacionId]
    );
    const subtareas = subtareasRes.rows;

    // 3bis) Traer evidencias por subtarea (antes / ahora)
    let evidenciasPorSubtarea = new Map();
    if (subtareas.length > 0) {
      const idsSub = subtareas.map((st) => st.id);

      const evRes = await pool.query(
        `SELECT id,
                id_subtarea,
                url,
                fecha,
                origen,
                es_auditoria
         FROM evidencias_5s
         WHERE id_subtarea = ANY($1::int[])
         ORDER BY fecha DESC`,
        [idsSub]
      );

      evidenciasPorSubtarea = new Map();

      for (const ev of evRes.rows) {
        const key = ev.id_subtarea;
        if (!evidenciasPorSubtarea.has(key)) {
          evidenciasPorSubtarea.set(key, {
            antes: [],
            ahora: [],
          });
        }

        const bucket = evidenciasPorSubtarea.get(key);

        // 🔑 NORMALIZAMOS: si existe origen lo usamos; si no, usamos es_auditoria
        const origenNormalizado = ev.origen
          ? String(ev.origen).toLowerCase()
          : ev.es_auditoria
          ? "auditoria"
          : "implementacion";

        if (origenNormalizado === "auditoria") {
          bucket.ahora.push(ev);   // Evidencias auditoría (ahora)
        } else {
          bucket.antes.push(ev);   // Evidencias implementación (antes)
        }
      }
    }



    // 4) Buscar la última auditoría (cabecera) para este proyecto
    const audRes = await pool.query(
      `SELECT *
       FROM auditorias_5s
       WHERE proyecto_id = $1
       ORDER BY fecha DESC
       LIMIT 1`,
      [proyectoId]
    );

    const auditoria = audRes.rowCount > 0 ? audRes.rows[0] : null;
    const auditoriaId = auditoria?.id ?? null;

    // 5) Traer ítems de auditoría si existen
    let items = [];
    if (auditoriaId) {
      const itemsRes = await pool.query(
        `SELECT id,
                auditoria_id,
                tarea_id,
                subtarea_id,
                puntuacion,
                observaciones
         FROM auditoria_items_5s
         WHERE auditoria_id = $1`,
        [auditoriaId]
      );

      // 👇 Aseguramos que 'puntuacion' sea Number, no string
      items = itemsRes.rows.map((it) => ({
        ...it,
        puntuacion:
          it.puntuacion !== null && it.puntuacion !== undefined
            ? Number(it.puntuacion)
            : 0,
      }));
    }

    // Map rápido tarea/subtarea -> item
    const mapItems = new Map();
    for (const it of items) {
      const key =
        it.subtarea_id != null
          ? `S-${it.subtarea_id}`
          : it.tarea_id != null
          ? `T-${it.tarea_id}`
          : null;
      if (!key) continue;
      mapItems.set(key, it);
    }


    // 6) Construir estructura de secciones similar a implementación
    const seccionesBase = [
      "1S · Seiri (Clasificar)",
      "2S · Seiton (Ordenar)",
      "3S · Seiso (Limpiar)",
      "4S · Seiketsu (Estandarizar)",
      "5S · Shitsuke (Disciplina)",
    ].map((nombre) => ({
      nombre,
      tareas: [],
    }));

    // Agrupar subtareas por tarea
    const subtPorTarea = new Map();
    for (const st of subtareas) {
      const lista = subtPorTarea.get(st.tarea_id) || [];
      lista.push(st);
      subtPorTarea.set(st.tarea_id, lista);
    }

    for (const t of tareas) {
      const idx = seccionesBase.findIndex((s) => s.nombre === t.seccion);
      const seccion = idx >= 0 ? seccionesBase[idx] : seccionesBase[0];

      const itemT = mapItems.get(`T-${t.id}`) || null;
      const subtDeTarea = subtPorTarea.get(t.id) || [];

      const subtFront = subtDeTarea.map((st) => {
        const itemSt = mapItems.get(`S-${st.id}`) || null;
        const evid = evidenciasPorSubtarea.get(st.id) || {
          antes: [],
          ahora: [],
        };

        return {
          id: st.id,
          lugar: st.lugar || "",
          descripcion: st.descripcion || "",
          puntuacionAuditoria: itemSt?.puntuacion ?? 0,
          observacionesAuditoria: itemSt?.observaciones ?? "",
          // evidencias
          evidenciasAntes: evid.antes, // implementación (ANTES)
          evidenciasAhora: evid.ahora, // auditoría (AHORA)
        };
      });

      const tareaFront = {
        id: t.id,
        lugar: t.lugar || "",
        descripcion: t.descripcion || "",
        puntuacionAuditoria: itemT?.puntuacion ?? 0,
        observacionesAuditoria: itemT?.observaciones ?? "",
        subtareas: subtFront,
      };

      seccion.tareas.push(tareaFront);
    }

    return res.json({
      proyecto,
      auditoria, // puede ser null
      secciones: seccionesBase,
    });
  } catch (err) {
    console.error("❌ Error en getAuditoriaDetallada5S:", err);
    return res.status(500).json({ message: "Error interno en auditoría 5S" });
  }
};

/**
 * POST /api/5s/auditoria/:proyectoId
 * Crea una nueva auditoría detallada:
 *  - inserta cabecera en auditorias_5s
 *  - inserta ítems en auditoria_items_5s
 */
export const guardarAuditoriaDetallada5S = async (req, res) => {
  const { proyectoId } = req.params;
  const {
    auditor,
    puntajeGlobal,
    comentario_global,
    secciones = [],
  } = req.body || {};

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1) Insertar cabecera (puntajeGlobal como número, puede ser decimal)
    const puntajeNumero = Number(puntajeGlobal) || 0;

    const audIns = await client.query(
      `INSERT INTO auditorias_5s (proyecto_id, fecha, auditor, puntaje, comentario_global)
       VALUES ($1, now(), $2, $3, $4)
       RETURNING *`,
      [proyectoId, auditor || null, puntajeNumero, comentario_global || null]
    );

    const auditoria = audIns.rows[0];
    const auditoriaId = auditoria.id;

    // 2) Insertar ítems (tareas + subtareas)
    const insertItemText = `
      INSERT INTO auditoria_items_5s
        (auditoria_id, tarea_id, subtarea_id, puntuacion, observaciones)
      VALUES ($1, $2, $3, $4, $5)
    `;

    for (const sec of secciones) {
      for (const t of sec.tareas || []) {
        const tScore = Number(t.puntuacionAuditoria || 0);
        const tObs = t.observacionesAuditoria || "";

        if (tScore > 0 || tObs.trim() !== "") {
          await client.query(insertItemText, [
            auditoriaId,
            t.id,
            null,
            tScore,
            tObs || null,
          ]);
        }

        for (const st of t.subtareas || []) {
          const stScore = Number(st.puntuacionAuditoria || 0);
          const stObs = st.observacionesAuditoria || "";

          if (stScore > 0 || stObs.trim() !== "") {
            await client.query(insertItemText, [
              auditoriaId,
              t.id,
              st.id,
              stScore,
              stObs || null,
            ]);
          }
        }
      }
    }

    await client.query("COMMIT");

    console.log(
      `✅ Auditoría 5S guardada para proyecto ${proyectoId}, auditoria ${auditoriaId}`
    );

    return res.status(201).json({
      success: true,
      auditoria,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Error en guardarAuditoriaDetallada5S:", err);
    return res
      .status(500)
      .json({ message: "Error al guardar auditoría 5S detallada" });
  } finally {
    client.release();
  }
};


/**
 * POST /api/5s/auditoria/:proyectoId/analisis-ia
 * Genera un análisis de la auditoría usando Gemini.
 * Body esperado:
 * {
 *   comentarioGlobal,
 *   puntajeGlobal,
 *   nivelGlobal,
 *   secciones: [ { nombre, tareas: [...] } ]
 * }
 */
export const generarAnalisisAuditoriaIA5S = async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.error("❌ Falta GEMINI_API_KEY");
      return res
        .status(500)
        .json({ message: "No está configurada la clave de Gemini" });
    }

    const {
      comentarioGlobal = "",
      puntajeGlobal = 0,
      nivelGlobal = "",
      secciones = [],
    } = req.body || {};

    // Construimos un resumen compacto de la auditoría
    let resumenSecciones = "";
    for (const sec of secciones) {
      const nombresTareas = (sec.tareas || [])
        .map((t) => t.lugar || t.descripcion || "")
        .filter(Boolean)
        .slice(0, 5)
        .join("; ");

      resumenSecciones += `- ${sec.nombre}: ${
        nombresTareas || "sin tareas destacadas"
      }\n`;
    }

    const prompt = `
Eres un consultor experto en 5S y Mejora Continua.
Genera un análisis ejecutivo de una auditoría 5S en español, claro y estructurado.

Datos de la auditoría:
- Puntaje global: ${puntajeGlobal} / 5
- Nivel global: ${nivelGlobal || "No definido"}
- Comentario global del auditor: "${comentarioGlobal}"

Resumen por secciones:
${resumenSecciones}

Por favor, responde en 3–5 párrafos breves:
1. Visión general del estado 5S del área.
2. Principales fortalezas observadas.
3. Principales oportunidades de mejora.
4. Recomendaciones concretas para los próximos 30–60 días.

No repitas literalmente los datos de entrada, elabora un análisis profesional y práctico.
`;

    // Cliente Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // 👇 Usamos el MISMO modelo que tenías configurado en geminiIA.js
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent(prompt);

    let texto = "";
    if (result?.response?.text) {
      texto =
        typeof result.response.text === "function"
          ? result.response.text()
          : result.response.text;
    }
    if (!texto || !texto.trim()) {
      texto = "Sin respuesta generada.";
    }

    return res.json({ analisis: texto });
  } catch (err) {
    console.error("❌ Error en generarAnalisisAuditoriaIA5S:", err);
    return res
      .status(500)
      .json({ message: "Error al generar análisis con IA" });
  }
};
