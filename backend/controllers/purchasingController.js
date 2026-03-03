import pool from "../db.js";

/* =====================================================
   RECEIVE PURCHASE ORDER (BLINDADO ENTERPRISE)
===================================================== */
export const receivePurchaseOrder = async (req, res) => {
  const { id } = req.params;
  const { companyId, warehouseId, items } = req.body;

  if (!companyId || !warehouseId || !items || !items.length) {
    return res.status(400).json({
      error: "companyId, warehouseId e items son obligatorios"
    });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 🔒 Bloquear orden
    const { rows: orderRows } = await client.query(
      `SELECT status
       FROM erp_core.purchase_orders
       WHERE id = $1
       FOR UPDATE`,
      [id]
    );

    if (orderRows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Orden no encontrada" });
    }

    if (!["approved", "partially_received"].includes(orderRows[0].status)) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        error: "Orden no válida para recepción"
      });
    }

    for (const receivedItem of items) {

      const { rows: dbItemRows } = await client.query(
        `SELECT *
         FROM erp_core.purchase_order_items
         WHERE id = $1
         FOR UPDATE`,
        [receivedItem.itemId]
      );

      if (dbItemRows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          error: `Item ${receivedItem.itemId} no existe`
        });
      }

      const dbItem = dbItemRows[0];

      const pendingQty =
        Number(dbItem.quantity) - Number(dbItem.received_quantity);

      if (receivedItem.quantity <= 0 || receivedItem.quantity > pendingQty) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          error: `Cantidad inválida para producto ${dbItem.product_id}`
        });
      }

      // 🔒 Actualizar inventario (atómico)
      await client.query(
        `INSERT INTO erp_core.inventory_balances
         (company_id, product_id, warehouse_id, location_id,
          quantity_on_hand, quantity_reserved)
         VALUES (
           $1,
           $2,
           $3,
           (SELECT id FROM erp_core.locations
            WHERE warehouse_id = $3
            LIMIT 1),
           $4,
           0
         )
         ON CONFLICT (company_id, product_id, location_id)
         DO UPDATE
         SET quantity_on_hand =
             erp_core.inventory_balances.quantity_on_hand + EXCLUDED.quantity_on_hand,
             updated_at = NOW()`,
        [
          companyId,
          dbItem.product_id,
          warehouseId,
          receivedItem.quantity
        ]
      );

      // 🔒 Registrar movimiento
      await client.query(
        `INSERT INTO erp_core.inventory_movements
         (company_id, product_id, warehouse_id,
          movement_type, quantity, reference_type, reference_id)
         VALUES ($1,$2,$3,'purchase',$4,'purchase_order',$5)`,
        [
          companyId,
          dbItem.product_id,
          warehouseId,
          receivedItem.quantity,
          id
        ]
      );

      // 🔒 Actualizar recibido acumulado
      await client.query(
        `UPDATE erp_core.purchase_order_items
         SET received_quantity = received_quantity + $1
         WHERE id = $2`,
        [receivedItem.quantity, receivedItem.itemId]
      );
    }

    // 🔎 Verificar si la orden quedó completamente recibida
    const { rows: checkRows } = await client.query(
      `SELECT COUNT(*) AS pending
       FROM erp_core.purchase_order_items
       WHERE purchase_order_id = $1
       AND quantity > received_quantity`,
      [id]
    );

    const pendingItems = Number(checkRows[0].pending);

    await client.query(
      `UPDATE erp_core.purchase_orders
       SET status = $2
       WHERE id = $1`,
      [
        id,
        pendingItems === 0 ? "received" : "partially_received"
      ]
    );

    await client.query("COMMIT");

    res.json({
      ok: true,
      message:
        pendingItems === 0
          ? "Orden completamente recibida"
          : "Recepción parcial registrada"
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error recepción parcial:", error);
    res.status(500).json({
      error: "Error al recibir orden"
    });
  } finally {
    client.release();
  }
};


/* =====================================================
   APPROVE PURCHASE ORDER (SEGURO)
===================================================== */
export const approvePurchaseOrder = async (req, res) => {
  const { id } = req.params;

  try {
    const { rows } = await pool.query(
      `SELECT status
       FROM erp_core.purchase_orders
       WHERE id = $1`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Orden no encontrada" });
    }

    const currentStatus = rows[0].status;

    if (currentStatus !== "pending_approval") {
      return res.status(400).json({
        error: `No se puede aprobar una orden en estado ${currentStatus}`,
      });
    }

    await pool.query(
      `UPDATE erp_core.purchase_orders
       SET status = 'approved'
       WHERE id = $1`,
      [id]
    );

    res.json({
      ok: true,
      message: "Orden aprobada correctamente",
    });

  } catch (error) {
    console.error("Error aprobando PO:", error);
    res.status(500).json({ error: "Error aprobando orden" });
  }
};
export const getPurchaseOrderById = async (req, res) => {
  const { id } = req.params;

  try {
    const { rows: poRows } = await pool.query(
      `SELECT *
       FROM erp_core.purchase_orders
       WHERE id = $1`,
      [id]
    );

    if (poRows.length === 0) {
      return res.status(404).json({ error: "Orden no encontrada" });
    }

    const { rows: items } = await pool.query(
      `SELECT i.*, p.name as product_name
       FROM erp_core.purchase_order_items i
       JOIN erp_core.products p
         ON p.id = i.product_id
       WHERE i.purchase_order_id = $1`,
      [id]
    );

    res.json({
      ...poRows[0],
      items
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error obteniendo orden" });
  }
};

export const listPurchaseOrders = async (req, res) => {
  const { companyId } = req.params;

  try {
    const { rows } = await pool.query(
      `
      SELECT 
        po.*,
        COALESCE(SUM(i.quantity * i.cost), 0) AS total_amount,
        COUNT(i.id) AS total_items
      FROM erp_core.purchase_orders po
      LEFT JOIN erp_core.purchase_order_items i
        ON i.purchase_order_id = po.id
      WHERE po.company_id = $1
      GROUP BY po.id
      ORDER BY po.created_at DESC
      `,
      [companyId]
    );

    res.json({
      ok: true,
      total: rows.length,
      data: rows
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error obteniendo órdenes"
    });
  }
};