import express from "express";
const router = express.Router();

// Ruta temporal para evitar error 404 y validar Render
router.get("/", (req, res) => {
  res.json({ ok: true, message: "Consultas OK desde Render" });
});

export default router;
