import { Router } from "express";
import { verifyToken } from "../middleware/auth.js";

import {
  listarCentros,
  crearCentro,
  listarEscenarios,
  crearEscenario,
  ejecutarDrp,
  aprobarOrdenDrp,
  aprobarTodoRunDrp,
  avanzarEstadoOrdenDrp,
  controlTower,
  obtenerPlanPorRun
} from "../controllers/drpController.js";

const router = Router();

/* ======================================================
   CENTROS
====================================================== */

router.get("/centros", verifyToken, listarCentros);
router.post("/centros", verifyToken, crearCentro);

/* ======================================================
   ESCENARIOS
====================================================== */

router.get("/escenarios", verifyToken, listarEscenarios);
router.post("/escenarios", verifyToken, crearEscenario);

/* ======================================================
   MOTOR DRP MULTINIVEL
====================================================== */

router.post("/run", verifyToken, ejecutarDrp);
router.post("/approve", verifyToken, aprobarOrdenDrp);
router.post("/approve-all", verifyToken, aprobarTodoRunDrp);
router.post("/order-next-status", verifyToken, avanzarEstadoOrdenDrp);
router.get("/control-tower", verifyToken, controlTower);
router.get("/plan/:run_id", obtenerPlanPorRun);

export default router;


