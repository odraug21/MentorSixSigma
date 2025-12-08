// backend/routes/oeeRoutes.js
import { Router } from "express";
import { verifyToken } from "../middleware/auth.js";
import {
  crearRegistroOee,
  listarRegistrosOee,
} from "../controllers/oeeController.js";

const router = Router();

// Crear registro OEE
router.post("/registros", verifyToken, crearRegistroOee);

// Listar registros OEE con filtros (?desde=&hasta=&linea=&turno=)
router.get("/registros", verifyToken, listarRegistrosOee);

export default router;
