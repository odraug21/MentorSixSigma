// backend/controllers/5sImplementacionController.js
import pool from "../db.js";

/**
 * GET /api/5s/implementacion/:proyectoId
 * Devuelve:
 *  - implementacion (fila de implementaciones_5s)
 *  - secciones: arreglo compatible con SECCIONES_5S_DEFAULT
 */
export const getImplementacion5S = async (req, res) => {
  try {
    const { proyectoId } = req.params;

    // 1) Buscar implementación
    const implRes = await pool.query(
      `SELECT *
       FROM implementaciones_5s
       WHERE proyecto_id = $1
       ORDER BY creado_en DESC
       LIMIT 1`,
      [proyectoId]
    );

    if (implRes.rowCount === 0) {
      return res.json({ implementacion: null, secciones: [] });
    }

    const implementacion = implRes.rows[0];

    // 2) Traer tareas y subtareas
    const tareasRes = await pool.query(
      `SELECT *
       FROM tareas_5s
       WHERE implementacion_id = $1
       ORDER BY id ASC`,
      [implementacion.id]
    );

    const subtareasRes = await pool.query(
      `SELECT *
       FROM subtareas_5s
       WHERE tarea_id IN (
         SELECT id FROM tareas_5s WHERE implementacion_id = $1
       )
       ORDER BY id ASC`,
      [implementacion.id]
    );

    const subtPorTarea = new Map();
    for (const st of subtareasRes.rows) {
      const lista = subtPorTarea.get(st.tarea_id) || [];
      lista.push(st);
      subtPorTarea.set(st.tarea_id, lista);
    }

    // 3) Reconstruir estructura de secciones igual que SECCIONES_5S_DEFAULT
    const seccionesBase = [
      "1S · Seiri (Clasificar)",
      "2S · Seiton (Ordenar)",
      "3S · Seiso (Limpiar)",
      "4S · Seiketsu (Estandarizar)",
      "5S · Shitsuke (Disciplina)",
    ].map((nombre) => ({
      nombre,
      inicioPlanificado: "",
      finPlanificado: "",
      duracion: 0,
      tareas: [],
      avance: 0,
    }));

    for (const t of tareasRes.rows) {
      const idx = seccionesBase.findIndex((s) => s.nombre === t.seccion);
      const seccion = idx >= 0 ? seccionesBase[idx] : seccionesBase[0];

      const subtareasDB = subtPorTarea.get(t.id) || [];

      const subtareasFront = subtareasDB.map((st) => ({
        id: String(st.id), // id interno para el front
        lugar: st.lugar || "",
        descripcion: st.descripcion || "",
        responsable: st.responsable || "",
        inicio: st.inicio ? st.inicio.toISOString().slice(0, 10) : "",
        fin: st.fin ? st.fin.toISOString().slice(0, 10) : "",
        completada: !!st.completada,
        evidencias: [], // por ahora no se maneja en esta tabla
      }));

      const tareaFront = {
        id: String(t.id),
        lugar: t.lugar || "",
        descripcion: t.descripcion || "",
        responsable: t.responsable || "",
        inicio: t.inicio ? t.inicio.toISOString().slice(0, 10) : "",
        fin: t.fin ? t.fin.toISOString().slice(0, 10) : "",
        dependeDe: t.depende_de ? String(t.depende_de) : null,
        completada: !!t.completada,
        evidencias: [],
        subtareas: subtareasFront,
      };

      seccion.tareas.push(tareaFront);
    }

    // 4) Calcular avance de cada sección
    seccionesBase.forEach((s) => {
      const total =
        s.tareas.length +
        s.tareas.reduce((acc, t) => acc + (t.subtareas?.length || 0), 0);
      if (!total) {
        s.avance = 0;
        return;
      }
      const doneTareas = s.tareas.filter((t) => t.completada).length;
      const doneSub = s.tareas.reduce(
        (acc, t) => acc + (t.subtareas || []).filter((st) => st.completada).length,
        0
      );
      s.avance = Math.round(((doneTareas + doneSub) / total) * 100);
    });

    return res.json({ implementacion, secciones: seccionesBase });
  } catch (err) {
    console.error("❌ Error obteniendo implementación 5S:", err);
    return res.status(500).json({ message: "Error interno" });
  }
};

/**
 * POST /api/5s/implementacion/:proyectoId
 *
 * Dos comportamientos:
 *  - SIN body.secciones → sólo asegura que exista la fila en implementaciones_5s
 *  - CON body.secciones → guarda todo (tareas + subtareas) para ese proyecto
 */
export const guardarImplementacion5S = async (req, res) => {
  const { proyectoId } = req.params;
  const { secciones } = req.body || {};

  try {
    // 1) Asegurar fila en implementaciones_5s
    let impl;
    const existing = await pool.query(
      `SELECT * FROM implementaciones_5s WHERE proyecto_id = $1 LIMIT 1`,
      [proyectoId]
    );

    if (existing.rowCount > 0) {
      impl = existing.rows[0];
    } else {
      const inserted = await pool.query(
        `INSERT INTO implementaciones_5s (proyecto_id, avance)
         VALUES ($1, 0)
         RETURNING *`,
        [proyectoId]
      );
      impl = inserted.rows[0];
    }

    // 👉 Caso 1: sólo asegurar implementación
    if (!secciones) {
      console.log("ℹ️ Sólo se aseguró implementación 5S para proyecto", proyectoId);
      return res.status(existing.rowCount > 0 ? 200 : 201).json({
        implementacion: impl,
      });
    }

    // 👉 Caso 2: guardar toda la implementación (tareas + subtareas)
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // Borrar subtareas y tareas anteriores de esta implementación
      await client.query(
        `DELETE FROM subtareas_5s
         WHERE tarea_id IN (
           SELECT id FROM tareas_5s WHERE implementacion_id = $1
         )`,
        [impl.id]
      );

      await client.query(
        `DELETE FROM tareas_5s WHERE implementacion_id = $1`,
        [impl.id]
      );

      // Mapa para poder resolver depende_de
      const tareaIdMap = new Map(); // idFront -> idDB

      // 1ª pasada: insertar tareas SIN depende_de
      for (const sec of secciones) {
        const seccionNombre = sec.nombre;

        for (const t of sec.tareas || []) {
          const resultTar = await client.query(
            `INSERT INTO tareas_5s
              (implementacion_id, seccion, lugar, descripcion, responsable, inicio, fin, depende_de, completada)
             VALUES
              ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             RETURNING id`,
            [
              impl.id,
              seccionNombre,
              t.lugar || null,
              t.descripcion || "",
              t.responsable || null,
              t.inicio || null,
              t.fin || null,
              null, // depende_de se setea en 2ª pasada
              !!t.completada,
            ]
          );

          const dbId = resultTar.rows[0].id;
          tareaIdMap.set(t.id, dbId);
        }
      }

      // 2ª pasada: actualizar depende_de y crear subtareas
      for (const sec of secciones) {
        for (const t of sec.tareas || []) {
          const tareaDbId = tareaIdMap.get(t.id);
          if (!tareaDbId) continue;

          // depende_de
          if (t.dependeDe) {
            const depDbId = tareaIdMap.get(t.dependeDe);
            if (depDbId) {
              await client.query(
                `UPDATE tareas_5s SET depende_de = $2 WHERE id = $1`,
                [tareaDbId, depDbId]
              );
            }
          }

          // subtareas
          for (const st of t.subtareas || []) {
            await client.query(
              `INSERT INTO subtareas_5s
                (tarea_id, lugar, descripcion, responsable, inicio, fin, completada)
               VALUES
                ($1, $2, $3, $4, $5, $6, $7)`,
              [
                tareaDbId,
                st.lugar || null,
                st.descripcion || "",
                st.responsable || null,
                st.inicio || null,
                st.fin || null,
                !!st.completada,
              ]
            );
          }
        }
      }

      // 3) Actualizar avance global
      let avance = 0;
      if (secciones.length) {
        const suma = secciones.reduce(
          (acc, s) => acc + (s.avance || 0),
          0
        );
        avance = Number((suma / secciones.length).toFixed(1));
      }

      await client.query(
        `UPDATE implementaciones_5s
         SET avance = $2
         WHERE id = $1`,
        [impl.id, avance]
      );

      await client.query("COMMIT");

      console.log(
        `✅ Implementación 5S guardada para proyecto ${proyectoId}, implementación ${impl.id}`
      );

      return res.json({
        success: true,
        implementacion: { ...impl, avance },
      });
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("❌ Error guardando implementación 5S:", err);
      return res
        .status(500)
        .json({ message: "Error interno al guardar implementación 5S" });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("❌ Error en guardarImplementacion5S:", err);
    return res
      .status(500)
      .json({ message: "Error general en implementación 5S" });
  }
};
