import express from "express";
import multer from "multer";
import { verifyToken } from "../middleware/auth.js";
import {
  subirEvidencia,
  eliminarEvidencia,
} from "../controllers/5sEvidenciasController.js";

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

// ✅ SUBIR ARCHIVO A SUBTAREA (CON TOKEN)
router.post(
  "/upload/:idSubtarea",
  verifyToken,
  upload.single("file"),
  subirEvidencia
);

// ✅ ELIMINAR ARCHIVO
router.delete("/:evidencia_id", verifyToken, eliminarEvidencia);

export default router;
