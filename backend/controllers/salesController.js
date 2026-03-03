import pool from "../db.js";

/* ==============================
   CONFIRM ORDER (BLINDADO)
============================== */
export const confirmOrder = async (req, res) => {
  const { id } = req.params;
  const { companyId, warehouseId } = req.body;

  if (!companyId || !warehouseId) {
    return res.status(400).json({
      error: "companyId y warehouseId son obligatorios",
    });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { rows: orderRows } = await client.query(
      `SELECT status FROM erp_core.orders
       WHERE id = $1 FOR UPDATE`,
      [id]
    );

    if (orderRows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Orden no encontrada" });
    }

    if (orderRows[0].status !== "draft") {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Orden ya procesada" });
    }

    const { rows: items } = await client.query(
      `SELECT * FROM erp_core.order_items
       WHERE order_id = $1`,
      [id]
    );

    for (const item of items) {
      const updateResult = await client.query(
        `UPDATE erp_core.inventory_balances
         SET quantity_reserved = quantity_reserved + $1,
             updated_at = NOW()
         WHERE company_id = $2
           AND product_id = $3
           AND warehouse_id = $4
           AND (quantity_on_hand - quantity_reserved) >= $1
         RETURNING id`,
        [item.quantity, companyId, item.product_id, warehouseId]
      );

      if (updateResult.rowCount === 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          error: `Stock insuficiente para producto ${item.product_id}`,
        });
      }
    }

    await client.query(
      `UPDATE erp_core.orders
       SET status = 'confirmed'
       WHERE id = $1`,
      [id]
    );

    await client.query("COMMIT");

    res.json({ ok: true, message: "Orden confirmada correctamente" });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    res.status(500).json({ error: "Error al confirmar orden" });
  } finally {
    client.release();
  }
};


/* ==============================
   SHIP ORDER (ATÓMICO SEGURO)
============================== */
export const shipOrder = async (req, res) => {
  const { id } = req.params;
  const { companyId, warehouseId } = req.body;

  if (!companyId || !warehouseId) {
    return res.status(400).json({
      error: "companyId y warehouseId son obligatorios",
    });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { rows: orderRows } = await client.query(
      `SELECT status FROM erp_core.orders
       WHERE id = $1 FOR UPDATE`,
      [id]
    );

    if (orderRows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Orden no encontrada" });
    }

    if (orderRows[0].status !== "confirmed") {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Orden no confirmada" });
    }

    const { rows: items } = await client.query(
      `SELECT * FROM erp_core.order_items
       WHERE order_id = $1`,
      [id]
    );

    for (const item of items) {

      // 🔒 UPDATE ATÓMICO (protege contra concurrencia y negativos)
      const updateResult = await client.query(
        `UPDATE erp_core.inventory_balances
         SET quantity_on_hand = quantity_on_hand - $1,
             quantity_reserved = quantity_reserved - $1,
             updated_at = NOW()
         WHERE company_id = $2
           AND product_id = $3
           AND warehouse_id = $4
           AND quantity_on_hand >= $1
           AND quantity_reserved >= $1
         RETURNING id`,
        [item.quantity, companyId, item.product_id, warehouseId]
      );

      if (updateResult.rowCount === 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          error: `Stock insuficiente al momento de despachar ${item.product_id}`,
        });
      }

      // Registrar movimiento
      await client.query(
        `INSERT INTO erp_core.inventory_movements
         (company_id, product_id, warehouse_id,
          movement_type, quantity, reference_type, reference_id)
         VALUES ($1,$2,$3,'sale',$4,'order',$5)`,
        [
          companyId,
          item.product_id,
          warehouseId,
          -item.quantity,
          id,
        ]
      );
    }

    await client.query(
      `UPDATE erp_core.orders
       SET status = 'shipped'
       WHERE id = $1`,
      [id]
    );

    await client.query("COMMIT");

    res.json({ ok: true, message: "Orden despachada correctamente" });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    res.status(500).json({ error: "Error al despachar orden" });
  } finally {
    client.release();
  }
};


/* ==============================
   CANCEL ORDER (SEGURO)
============================== */
export const cancelOrder = async (req, res) => {
  const { id } = req.params;
  const { companyId, warehouseId } = req.body;

  if (!companyId || !warehouseId) {
    return res.status(400).json({
      error: "companyId y warehouseId son obligatorios",
    });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { rows: orderRows } = await client.query(
      `SELECT status FROM erp_core.orders
       WHERE id = $1 FOR UPDATE`,
      [id]
    );

    if (orderRows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Orden no encontrada" });
    }

    const status = orderRows[0].status;

    if (status === "shipped") {
      await client.query("ROLLBACK");
      return res.status(400).json({
        error: "No se puede cancelar una orden despachada",
      });
    }

    if (status === "confirmed") {
      const { rows: items } = await client.query(
        `SELECT * FROM erp_core.order_items
         WHERE order_id = $1`,
        [id]
      );

      for (const item of items) {
        await client.query(
          `UPDATE erp_core.inventory_balances
           SET quantity_reserved = quantity_reserved - $1,
               updated_at = NOW()
           WHERE company_id = $2
             AND product_id = $3
             AND warehouse_id = $4
             AND quantity_reserved >= $1`,
          [item.quantity, companyId, item.product_id, warehouseId]
        );
      }
    }

    await client.query(
      `UPDATE erp_core.orders
       SET status = 'cancelled'
       WHERE id = $1`,
      [id]
    );

    await client.query("COMMIT");

    res.json({ ok: true, message: "Orden cancelada correctamente" });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    res.status(500).json({ error: "Error al cancelar orden" });
  } finally {
    client.release();
  }
};