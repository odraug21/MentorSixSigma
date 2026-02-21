import pool from "../db.js";

/* ======================================================
   CENTROS
====================================================== */

export const listarCentros = async (req, res) => {
  try {
    const empresaId = req.user?.empresa_id;

    const { rows } = await pool.query(
      `SELECT * 
       FROM public.drp_centros 
       WHERE empresa_id = $1 AND activo = true 
       ORDER BY nombre`,
      [empresaId]
    );

    res.json({ ok: true, centros: rows });
  } catch (err) {
    console.error("❌ Error listarCentros:", err);
    res.status(500).json({ ok: false, message: "Error listando centros DRP" });
  }
};

export const crearCentro = async (req, res) => {
  try {
    const empresaId = req.user?.empresa_id;
    const { nombre, codigo, tipo, region, ciudad } = req.body;

    const { rows } = await pool.query(
      `
      INSERT INTO public.drp_centros
        (empresa_id, nombre, codigo, tipo, region, ciudad)
      VALUES ($1,$2,$3,$4,$5,$6)
      RETURNING *
      `,
      [empresaId, nombre, codigo || null, tipo || null, region || null, ciudad || null]
    );

    res.status(201).json({ ok: true, centro: rows[0] });
  } catch (err) {
    console.error("❌ Error crearCentro:", err);
    res.status(500).json({ ok: false, message: "Error creando centro DRP" });
  }
};

/* ======================================================
   ESCENARIOS
====================================================== */

export const listarEscenarios = async (req, res) => {
  try {
    const empresaId = req.user?.empresa_id;

    const { rows } = await pool.query(
      `
      SELECT e.*, u.nombre AS creador
      FROM public.drp_escenarios e
      LEFT JOIN public.usuarios u ON u.id = e.creado_por
      WHERE e.empresa_id = $1
      ORDER BY e.fecha_creacion DESC
      `,
      [empresaId]
    );

    res.json({ ok: true, escenarios: rows });
  } catch (err) {
    console.error("❌ Error listarEscenarios:", err);
    res.status(500).json({ ok: false, message: "Error listando escenarios DRP" });
  }
};

export const crearEscenario = async (req, res) => {
  try {
    const empresaId = req.user?.empresa_id;
    const userId = req.user?.id;

    const {
      nombre,
      descripcion,
      horizonte_inicio,
      horizonte_fin,
      nivel_detalle = "MENSUAL",
      tipo = "TACTICO",
    } = req.body;

    const { rows } = await pool.query(
      `
      INSERT INTO public.drp_escenarios
        (empresa_id, nombre, descripcion, horizonte_inicio, horizonte_fin,
         nivel_detalle, tipo, creado_por)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *
      `,
      [
        empresaId,
        nombre,
        descripcion || null,
        horizonte_inicio,
        horizonte_fin,
        nivel_detalle,
        tipo,
        userId || null,
      ]
    );

    res.status(201).json({ ok: true, escenario: rows[0] });
  } catch (err) {
    console.error("❌ Error crearEscenario:", err);
    res.status(500).json({ ok: false, message: "Error creando escenario DRP" });
  }
};

/* ======================================================
   MOTOR DRP
====================================================== */

export const ejecutarDrp = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT fn_run_drp_cycle_v2(CURRENT_DATE, CURRENT_DATE + 7) AS run_id
    `);

    const run_id = rows[0].run_id;

    const { rows: plan } = await pool.query(
      `
      SELECT 
        p.run_id,
        p.d,
        s.sku_code,
        o.location_code AS origin,
        d.location_code AS destination,
        p.suggested_qty,
        p.status
      FROM drp_plan p
      JOIN sku s ON s.sku_id = p.sku_id
      LEFT JOIN location o ON o.location_id = p.origin_id
      JOIN location d ON d.location_id = p.dest_id
      WHERE p.run_id = $1
      ORDER BY p.d
      `,
      [run_id]
    );

    res.json({ ok: true, run_id, plan });

  } catch (error) {
    console.error("❌ Error ejecutando DRP:", error);
    res.status(500).json({ ok: false, message: "Error ejecutando DRP" });
  }
};

/* ======================================================
   APROBAR ORDEN INDIVIDUAL  🔥 FIX REAL
====================================================== */

export const aprobarOrdenDrp = async (req, res) => {
  const client = await pool.connect();

  try {
    const { run_id, sku_code, destination, d } = req.body;
    const userId = req.user?.id || null;

    await client.query("BEGIN");

    const { rows } = await client.query(
      `
      SELECT 
        p.run_id,
        p.d,
        p.sku_id,
        p.origin_id,
        p.dest_id,
        p.suggested_qty,
        o.location_type AS origin_type
      FROM drp_plan p
      JOIN sku s ON s.sku_id = p.sku_id
      JOIN location d2 ON d2.location_id = p.dest_id
      LEFT JOIN location o ON o.location_id = p.origin_id
      WHERE p.run_id = $1
      AND s.sku_code = $2
      AND d2.location_code = $3
      AND p.d = $4
      LIMIT 1
      `,
      [run_id, sku_code, destination, d]
    );

    if (rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ ok: false });
    }

    const r = rows[0];

    let orderType = "TRANSFER";
    if (!r.origin_id) orderType = "PURCHASE";
    else if (r.origin_type === "PLANT") orderType = "PRODUCTION";

    await client.query(`
      INSERT INTO drp_orders (
        plan_date,
        d,
        run_id,
        sku_id,
        origin_id,
        dest_id,
        order_type,
        qty,
        required_date,
        status,
        created_by,
        approved_by
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$2,'CREATED',$9,$9)
    `, [
      new Date(),
      r.d,
      r.run_id,
      r.sku_id,
      r.origin_id,
      r.dest_id,
      orderType,
      r.suggested_qty,
      userId
    ]);

    await client.query(`
      UPDATE drp_plan
      SET status = 'APPROVED'
      WHERE run_id = $1
      AND sku_id = $2
      AND dest_id = $3
      AND d = $4
    `, [r.run_id, r.sku_id, r.dest_id, r.d]);

    await client.query("COMMIT");

    res.json({ ok: true });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Error aprobando DRP:", error);
    res.status(500).json({ ok: false });
  } finally {
    client.release();
  }
};

/* ======================================================
   APROBAR TODO EL RUN 🔥 FIX
====================================================== */

export const aprobarTodoRunDrp = async (req, res) => {
  const client = await pool.connect();

  try {
    const { run_id } = req.body;
    const userId = req.user?.id || null;

    await client.query("BEGIN");

    const { rows: sugerencias } = await client.query(`
      SELECT *
      FROM drp_plan
      WHERE run_id = $1
      AND status = 'SUGGESTED'
    `, [run_id]);

    for (const s of sugerencias) {

      await client.query(`
        INSERT INTO drp_orders (
          plan_date,
          d,
          run_id,
          sku_id,
          origin_id,
          dest_id,
          order_type,
          qty,
          required_date,
          status,
          created_by,
          approved_by
        )
        VALUES ($1,$2,$3,$4,$5,$6,'TRANSFER',$7,$2,'CREATED',$8,$8)
      `, [
        new Date(),
        s.d,
        run_id,
        s.sku_id,
        s.origin_id,
        s.dest_id,
        s.suggested_qty,
        userId
      ]);
    }

    await client.query(`
      UPDATE drp_plan
      SET status = 'APPROVED'
      WHERE run_id = $1
      AND status = 'SUGGESTED'
    `, [run_id]);

    await client.query("COMMIT");

    res.json({ ok: true });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Error aprobando RUN:", error);
    res.status(500).json({ ok: false });
  } finally {
    client.release();
  }
};

/* ======================================================
   CONTROL TOWER
====================================================== */

export const controlTower = async (req, res) => {
  try {

    const { rows: activas } = await pool.query(`
      SELECT 
        o.order_id,
        s.sku_code,
        o.order_type,
        o.status,
        o.qty,
        o.required_date
      FROM drp_orders o
      JOIN sku s ON s.sku_id = o.sku_id
      WHERE o.status <> 'CLOSED'
      ORDER BY o.required_date
    `);

    res.json({ ok: true, activas });

  } catch (error) {
    console.error("❌ Error Control Tower:", error);
    res.status(500).json({ ok: false });
  }
};

/* ======================================================
   AVANZAR ESTADO ORDEN DRP (NO TOCAR)
====================================================== */

export const avanzarEstadoOrdenDrp = async (req, res) => {
  const client = await pool.connect();

  try {
    const { order_id } = req.body;

    await client.query("BEGIN");

    const { rows } = await client.query(`
      SELECT *
      FROM drp_orders
      WHERE order_id = $1
      FOR UPDATE
    `, [order_id]);

    if (rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ ok: false });
    }

    const orden = rows[0];
    let nextStatus = orden.status;

    if (orden.status === "CREATED") nextStatus = "APPROVED";
    else if (orden.status === "APPROVED") nextStatus = "RELEASED";
    else if (orden.status === "RELEASED") nextStatus = "IN_TRANSIT";
    else if (orden.status === "IN_TRANSIT") nextStatus = "RECEIVED";
    else if (orden.status === "RECEIVED") nextStatus = "CLOSED";
    else {
      await client.query("ROLLBACK");
      return res.json({ ok: true });
    }

    await client.query(`
      UPDATE drp_orders
      SET status = $1
      WHERE order_id = $2
    `, [nextStatus, order_id]);

    await client.query("COMMIT");

    res.json({ ok: true, new_status: nextStatus });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Error avanzando orden:", error);
    res.status(500).json({ ok: false });
  } finally {
    client.release();
  }
};

/* ======================================================
   OBTENER PLAN POR RUN (REFRESH UI)
====================================================== */

export const obtenerPlanPorRun = async (req, res) => {
  try {
    const { run_id } = req.params;

    const { rows } = await pool.query(
      `
      SELECT 
        p.run_id,
        p.d,
        s.sku_code,
        o.location_code AS origin,
        d.location_code AS destination,
        p.suggested_qty,
        p.status
      FROM drp_plan p
      JOIN sku s ON s.sku_id = p.sku_id
      LEFT JOIN location o ON o.location_id = p.origin_id
      JOIN location d ON d.location_id = p.dest_id
      WHERE p.run_id = $1
      ORDER BY p.d
      `,
      [run_id]
    );

    res.json({ ok: true, plan: rows });

  } catch (error) {
    console.error("❌ Error obteniendo plan por run:", error);
    res.status(500).json({ ok: false });
  }
};