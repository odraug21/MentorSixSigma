import pool from "../db.js";

/* ============================================================
   🔹 MTCP RANKING
============================================================ */

export const getMtcpRanking = async (req, res) => {
  const { companyId } = req.params;

  if (!companyId) {
    return res.status(400).json({ error: "companyId es obligatorio" });
  }

  try {
    const { rows } = await pool.query(
      `
      SELECT *
      FROM vw_mtcp_sku_metrics_v2
      WHERE company_id = $1
      ORDER BY
        CASE status
          WHEN 'CRITICO' THEN 1
          WHEN 'MEDIO' THEN 2
          WHEN 'OK' THEN 3
          WHEN 'SIN_MOVIMIENTO' THEN 4
          ELSE 5
        END,
        coverage_days ASC
      `,
      [companyId]
    );

    res.json({
      ok: true,
      total: rows.length,
      data: rows
    });

  } catch (error) {
    console.error("Error MTCP:", error);
    res.status(500).json({ error: "Error obteniendo MTCP" });
  }
};


/* ============================================================
   🔹 GENERAR ÓRDENES DESDE MTCP
============================================================ */

export const generatePurchaseOrdersFromMtcp = async (req, res) => {
  const { companyId } = req.params;

  if (!companyId) {
    return res.status(400).json({ error: "companyId es obligatorio" });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { rows: criticalSkus } = await client.query(
      `
      SELECT 
        m.product_id,
        m.suggested_order_qty,
        ps.supplier_name,
        ps.moq,
        ps.unit_cost
      FROM vw_mtcp_sku_metrics_v2 m
      JOIN erp_core.product_suppliers ps
        ON ps.product_id = m.product_id
       AND ps.company_id = m.company_id
       AND ps.is_primary = true
      WHERE m.company_id = $1
        AND m.suggested_order_qty > 0
      `,
      [companyId]
    );

    if (criticalSkus.length === 0) {
      await client.query("ROLLBACK");
      return res.json({
        ok: true,
        message: "No hay SKUs que requieran reposición"
      });
    }

    const suppliersMap = {};

    for (const sku of criticalSkus) {
      if (!suppliersMap[sku.supplier_name]) {
        suppliersMap[sku.supplier_name] = [];
      }
      suppliersMap[sku.supplier_name].push(sku);
    }

    const createdOrders = [];

    for (const supplier in suppliersMap) {

      const { rows: poRows } = await client.query(
        `
        INSERT INTO erp_core.purchase_orders 
        (company_id, supplier_name, status)
        VALUES ($1, $2, 'pending_approval')
        RETURNING id
        `,
        [companyId, supplier]
      );

      const purchaseOrderId = poRows[0].id;

      for (const sku of suppliersMap[supplier]) {

        const suggestedQty = Math.ceil(Number(sku.suggested_order_qty));
        const finalQty = sku.moq
          ? Math.max(suggestedQty, Number(sku.moq))
          : suggestedQty;

        await client.query(
          `
          INSERT INTO erp_core.purchase_order_items
          (purchase_order_id, product_id, quantity, cost)
          VALUES ($1, $2, $3, $4)
          `,
          [
            purchaseOrderId,
            sku.product_id,
            finalQty,
            sku.unit_cost || 0
          ]
        );
      }

      createdOrders.push(purchaseOrderId);
    }

    await client.query("COMMIT");

    res.json({
      ok: true,
      purchase_orders_created: createdOrders
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error generando PO MTCP:", error);
    res.status(500).json({ error: "Error generando órdenes automáticas" });
  } finally {
    client.release();
  }
};


/* ============================================================
   🔹 DASHBOARD ENTERPRISE MTCP
============================================================ */

export const getMtcpDashboard = async (req, res) => {
  const { companyId } = req.params;

  if (!companyId) {
    return res.status(400).json({ error: "companyId es obligatorio" });
  }

  try {

    /* 1️⃣ Obtener métricas */
    const { rows } = await pool.query(
      `
      SELECT *
      FROM vw_mtcp_sku_metrics_v2
      WHERE company_id = $1
      `,
      [companyId]
    );

    /* 2️⃣ Obtener configuración empresa */
    const { rows: configRows } = await pool.query(
      `
      SELECT coverage_meta_days
      FROM mtcp_company_config
      WHERE company_id = $1
      `,
      [companyId]
    );

    const coverageMetaDays =
      configRows.length > 0
        ? Number(configRows[0].coverage_meta_days)
        : 14; // 🔹 fallback default SaaS

    /* 3️⃣ Summary Ejecutivo */
    const summary = {
      total_products: rows.length,
      criticos: rows.filter(r => r.status === "CRITICO").length,
      medios: rows.filter(r => r.status === "MEDIO").length,
      ok: rows.filter(r => r.status === "OK").length,
      sin_movimiento: rows.filter(r => r.status === "SIN_MOVIMIENTO").length,
      total_suggested_units: rows.reduce(
        (acc, r) => acc + Number(r.suggested_order_qty || 0),
        0
      )
    };

    /* 4️⃣ Top Críticos */
    const topCriticos = rows
      .filter(r => r.status === "CRITICO")
      .sort((a, b) => a.coverage_days - b.coverage_days)
      .slice(0, 10);

    /* 5️⃣ Cobertura Promedio */
    const coveragePromedio =
      rows.length > 0
        ? (
            rows.reduce(
              (acc, r) => acc + Number(r.coverage_days || 0),
              0
            ) / rows.length
          ).toFixed(1)
        : 0;

    res.json({
      ok: true,
      summary,
      top_criticos: topCriticos,
      coverage_meta_days: coverageMetaDays,
      coverage_promedio: coveragePromedio
    });

  } catch (error) {
    console.error("Error dashboard MTCP:", error);
    res.status(500).json({ error: "Error obteniendo dashboard MTCP" });
  }
};