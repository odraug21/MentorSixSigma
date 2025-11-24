// backend/routes/fiveSTareasRoutes.js
import express from "express";
import {
  obtenerTareas,
  crearTarea,
  actualizarTarea,
  eliminarTarea
} from "../controllers/5sTareasController.js";

const router = express.Router();

// TAREAS
router.get("/implementacion/:proyectoId/tareas", obtenerTareas);
router.post("/implementacion/:proyectoId/tareas", crearTarea);

router.patch("/implementacion/tarea/:id", actualizarTarea);
router.delete("/implementacion/tarea/:id", eliminarTarea);

export default router;
