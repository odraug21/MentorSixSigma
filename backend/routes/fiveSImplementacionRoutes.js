import express from "express";
import { verifyToken } from "../middleware/auth.js";

import {
  getImplementacion5S,
  guardarImplementacion5S
} from "../controllers/5sImplementacionController.js";

import {
  obtenerTareas,
  crearTarea,
  actualizarTarea,
  eliminarTarea
} from "../controllers/5sTareasController.js";

import {
  getSubtareas,
  crearSubtarea,
  actualizarSubtarea,
  eliminarSubtarea
} from "../controllers/5sSubtareasController.js";

const router = express.Router();
router.use(verifyToken);

// ===========================
// IMPLEMENTACIÓN BASE
// ===========================
router.get("/:proyectoId", getImplementacion5S);
router.post("/:proyectoId", guardarImplementacion5S);

// ===========================
// TAREAS
// ===========================
router.get("/:proyectoId/tareas", obtenerTareas);
router.post("/:proyectoId/tareas", crearTarea);
router.patch("/tareas/:id", actualizarTarea);
router.delete("/tareas/:id", eliminarTarea);

// ===========================
// SUBTAREAS
// ===========================
router.get("/tareas/:tareaId/subtareas", getSubtareas);
router.post("/tareas/:tareaId/subtareas", crearSubtarea);
router.patch("/subtareas/:id", actualizarSubtarea);
router.delete("/subtareas/:id", eliminarSubtarea);

export default router;
