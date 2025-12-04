import express from "express";
import multer from "multer";
import { verifyToken } from "../middleware/auth.js";
import {
  subirEvidencia,
  eliminarEvidencia,
  listarEvidenciasPorSubtareas,   // 👈 NUEVO
} from "../controllers/5sEvidenciasController.js";

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

// ✅ SUBIR ARCHIVO
router.post("/upload", verifyToken, upload.single("file"), subirEvidencia);
router.post("/upload/:idSubtarea", verifyToken, upload.single("file"), subirEvidencia);

// ✅ OBTENER EVIDENCIAS POR SUBTAREAS
// GET /api/5s/evidencias/subtareas?ids=1,2,3
router.get("/subtareas", verifyToken, listarEvidenciasPorSubtareas);

// ✅ ELIMINAR ARCHIVO
router.delete("/:evidencia_id", verifyToken, eliminarEvidencia);

export default router;
