import pool from "../db.js";

export const getDashboardSummary = async (req, res) => {
  const { companyId } = req.params;

  try {
    // Total productos
    const { rows: products } = await pool.query(
      `SELECT COUNT(*) FROM erp_core.products
       WHERE company_id = $1`,
      [companyId]
    );

    // Stock total
    const { rows: stock } = await pool.query(
      `SELECT 
          COALESCE(SUM(quantity_on_hand),0) as total_on_hand,
          COALESCE(SUM(quantity_reserved),0) as total_reserved
       FROM erp_core.stock_snapshot
       WHERE company_id = $1`,
      [companyId]
    );

    // Órdenes por estado
    const { rows: orders } = await pool.query(
      `SELECT status, COUNT(*) as total
       FROM erp_core.orders
       WHERE company_id = $1
       GROUP BY status`,
      [companyId]
    );

    const orderSummary = {
      draft: 0,
      confirmed: 0,
      shipped: 0,
      cancelled: 0,
    };

    orders.forEach(o => {
      orderSummary[o.status] = Number(o.total);
    });

    res.json({
      totalProducts: Number(products[0].count),
      stockOnHand: Number(stock[0].total_on_hand),
      stockReserved: Number(stock[0].total_reserved),
      stockAvailable:
        Number(stock[0].total_on_hand) - Number(stock[0].total_reserved),
      orders: orderSummary,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error obteniendo dashboard" });
  }
};