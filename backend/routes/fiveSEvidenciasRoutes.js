import express from "express";
import multer from "multer";
import { verifyToken } from "../middleware/auth.js";
import {
  subirEvidencia,
  eliminarEvidencia,
} from "../controllers/5sEvidenciasController.js";

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.use(verifyToken);

// POST → subir archivo
router.post("/upload", upload.single("file"), subirEvidencia);

// DELETE → eliminar archivo
router.delete("/:evidencia_id", eliminarEvidencia);

export default router;
