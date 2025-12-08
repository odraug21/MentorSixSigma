// backend/routes/teepRoutes.js
import { Router } from "express";
import {
  listarTeep,
  crearTeep,
  eliminarTeep,
} from "../controllers/teepController.js";

const router = Router();

// Más adelante se puede proteger con auth si quieres
router.get("/", listarTeep);
router.post("/", crearTeep);
router.delete("/:id", eliminarTeep);

export default router;
