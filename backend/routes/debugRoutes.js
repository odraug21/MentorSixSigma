// backend/routes/debugRoutes.js
import express from "express";
import pool from "../db.js";
const router = express.Router();

router.get("/roles-debug", async (_req, res) => {
  const r = await pool.query("SELECT * FROM roles");
  res.json(r.rows);
});

export default router;
