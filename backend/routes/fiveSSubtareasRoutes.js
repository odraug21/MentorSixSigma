// backend/routes/fiveSSubtareasRoutes.js
import express from "express";
import {
  getSubtareas,
  crearSubtarea,
  actualizarSubtarea,
  eliminarSubtarea
} from "../controllers/5sSubtareasController.js";

const router = express.Router();

// SUBTAREAS
router.get("/implementacion/tarea/:tareaId/subtareas", getSubtareas);
router.post("/implementacion/tarea/:tareaId/subtareas", crearSubtarea);

router.patch("/implementacion/subtarea/:id", actualizarSubtarea);
router.delete("/implementacion/subtarea/:id", eliminarSubtarea);

export default router;
