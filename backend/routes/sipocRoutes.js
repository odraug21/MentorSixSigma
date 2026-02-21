// backend/routes/sipocRoutes.js
import { Router } from "express";
import { verifyToken } from "../middleware/auth.js";
import {
  listarSipoc,
  obtenerSipoc,
  crearSipoc,
  actualizarSipoc,
  eliminarSipoc,
  analizarSipocIA,   // ✅ solo este para IA
} from "../controllers/sipocController.js";

const router = Router();

// /api/sipoc
router.get("/", verifyToken, listarSipoc);
router.get("/:id", verifyToken, obtenerSipoc);
router.post("/", verifyToken, crearSipoc);
router.put("/:id", verifyToken, actualizarSipoc);
router.delete("/:id", verifyToken, eliminarSipoc);

// 👇 Aquí la ruta de IA coherente con el frontend (apiPost("/sipoc/ia"))
router.post("/ia", verifyToken, analizarSipocIA);

export default router;
