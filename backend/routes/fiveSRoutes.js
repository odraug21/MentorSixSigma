// backend/routes/fiveSRoutes.js
import express from "express";
import pool from "../db.js";
import { verifyToken } from "../middleware/auth.js";
import multer from "multer";
import { subirEvidencia } from "../controllers/5sEvidenciasController.js";
import { supabase } from "../services/supabaseClient.js";
import {
  getProyectos5S,
  crearProyecto5S,
  eliminarProyecto5S,
} from "../controllers/5sProyectosController.js";

const router = express.Router();

// 🧾 Multer en memoria (no escribe disco local)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB
});

// ✅ Todas las rutas 5S requieren login
router.use(verifyToken);

// ================================
// 📁 Proyectos 5S
// ================================
router.get("/proyectos", getProyectos5S);
router.post("/proyectos", crearProyecto5S);
router.delete("/proyectos/:id", eliminarProyecto5S);

/**
 * ==========================================
 * 5️⃣ Subir evidencias 5S (implementación / auditoría)
 * POST /api/5s/evidencias
 * FormData: file, proyectoId, tareaId?, subtareaId?, categoria?
 * ==========================================
 */
router.post(
  "/evidencias",
  verifyToken,
  upload.single("file"),
  subirEvidencia
);


router.delete("/evidencias/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Obtener registro
    const { data: evidencia, error: e1 } = await supabase
      .from("evidencias_5s")
      .select("*")
      .eq("id", id)
      .single();

    if (e1 || !evidencia) {
      return res.status(404).json({ error: "Evidencia no encontrada" });
    }

    // Eliminar archivo del Storage
    const { error: e2 } = await supabase.storage
      .from("evidencias_5s")
      .remove([evidencia.storage_path]);

    if (e2) {
      console.error("❌ Error borrando archivo:", e2);
    }

    // Eliminar registro en DB
    await supabase.from("evidencias_5s").delete().eq("id", id);

    return res.json({ success: true });
  } catch (err) {
    console.error("❌ Error eliminando evidencia:", err);
    return res.status(500).json({ error: "Error interno" });
  }
});

export default router;
