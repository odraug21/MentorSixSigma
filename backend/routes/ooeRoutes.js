// backend/routes/ooeRoutes.js
import express from "express";
import {
  listarOoe,
  crearOoe,
  eliminarOoe,
} from "../controllers/ooeController.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// GET /api/ooe  → lista registros de la empresa
router.get("/", verifyToken, listarOoe);

// POST /api/ooe → crea un nuevo registro
router.post("/", verifyToken, crearOoe);

// DELETE /api/ooe/:id → elimina un registro
router.delete("/:id", verifyToken, eliminarOoe);

export default router;
