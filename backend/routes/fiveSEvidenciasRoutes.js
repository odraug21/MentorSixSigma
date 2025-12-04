// backend/routes/fiveSEvidenciasRoutes.js
import express from "express";
import multer from "multer";
import { verifyToken } from "../middleware/auth.js";
import {
  subirEvidencia,
  eliminarEvidencia,
  listarEvidenciasPorSubtareas,
  listarEvidenciasAuditoriaPorSubtareas,
} from "../controllers/5sEvidenciasController.js";

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

// ✅ SUBIR ARCHIVO
router.post("/upload", verifyToken, upload.single("file"), subirEvidencia);

// ✅ OBTENER EVIDENCIAS POR SUBTAREAS (implementación por defecto, o según ?origen=...)
router.get("/subtareas", verifyToken, listarEvidenciasPorSubtareas);

// ✅ OBTENER SOLO LAS EVIDENCIAS DE AUDITORÍA
router.get(
  "/auditoria/subtareas",
  verifyToken,
  listarEvidenciasAuditoriaPorSubtareas
);

// ✅ ELIMINAR ARCHIVO
router.delete("/:evidencia_id", verifyToken, eliminarEvidencia);

export default router;
