// backend/routes/fiveSAuditoriaRoutes.js
// backend/routes/5sAuditoriaRoutes.js
import express from "express";
import { verifyToken } from "../middleware/auth.js";
import {
  getAuditoriaDetallada5S,
  guardarAuditoriaDetallada5S,
  generarAnalisisAuditoriaIA5S,
} from "../controllers/5sAuditoriaController.js";

const router = express.Router();

// ✅ Obtener detalle de auditoría 5S (usado por 5sAuditoria.jsx)
router.get("/:proyectoId", verifyToken, getAuditoriaDetallada5S);

// ✅ Guardar auditoría 5S
router.post("/:proyectoId", verifyToken, guardarAuditoriaDetallada5S);

// ✅ Generar análisis con IA (Gemini)
router.post(
  "/:proyectoId/analisis-ia",
  verifyToken,
  generarAnalisisAuditoriaIA5S
);

export default router;

