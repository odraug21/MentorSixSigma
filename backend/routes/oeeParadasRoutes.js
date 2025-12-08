import express from "express";
import {
  crearParada,
  obtenerParadas,
  eliminarParada,
} from "../controllers/oeeParadasController.js";

const router = express.Router();

router.post("/", crearParada);
router.get("/:registro_id", obtenerParadas);
router.delete("/:id", eliminarParada);

export default router;
