// backend/routes/kaizenRoutes.js
import { Router } from "express";
import { verifyToken } from "../middleware/auth.js";
import { obtenerAnalisisKaizen } from "../controllers/kaizenController.js";

const router = Router();

// GET /api/kaizen/analisis?desde=&hasta=&linea=&turno=&conIA=1
router.get("/analisis", verifyToken, obtenerAnalisisKaizen);

export default router;
