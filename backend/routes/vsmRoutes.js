// backend/routes/vsmRoutes.js
import { Router } from "express";
import { verifyToken } from "../middleware/auth.js";
import {
  obtenerMapaVsm,
  actualizarMapaVsm,
  actualizarLayoutVsm,
} from "../controllers/vsmController.js";

const router = Router();

// 🔹 GET único mapa de la empresa (si no existe, lo crea vacío)
router.get("/mapa", verifyToken, obtenerMapaVsm);

// 🔹 PUT datos cuantitativos (tabla procesos)
router.put("/mapa/:id", verifyToken, actualizarMapaVsm);

// 🔹 PUT layout del builder
router.put("/mapa/:id/layout", verifyToken, actualizarLayoutVsm);

export default router;
