import { Router } from "express";
import { verifyToken } from "../middleware/auth.js";
import multer from "multer";

/* ======================================================
   CONTROLLERS DRP CORE
====================================================== */

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
   obtenerPlanPorRun,
   commitVentasUpload
} from "../controllers/drpController.js";

/* ======================================================
   CONTROLLERS DATA (FASE 1 – HISTÓRICOS)
====================================================== */

import {
   uploadVentasHist,
   validateVentasHist,
   validateVentasByUpload,
   uploadSkuLogistics,
   uploadInventorySnapshot
} from "../controllers/drpDataController.js";

/* ======================================================
   CONFIG UPLOAD EXCEL
====================================================== */

const upload = multer({
   storage: multer.memoryStorage(),
   limits: { fileSize: 20 * 1024 * 1024 } // 20MB
});

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
router.get("/plan/:run_id", verifyToken, obtenerPlanPorRun);
router.post("/ventas/commit/:upload_id", verifyToken, commitVentasUpload);

/* ======================================================
   DATA FOUNDATION – DRP AUTÓNOMO (FASE 1)
   CARGA HISTÓRICA
====================================================== */

/**
 * Upload histórico de ventas desde Excel
 * file form-data key: "file"
 */
router.post("/ventas/upload", verifyToken, upload.single("file"), uploadVentasHist);
router.post("/ventas/validate", verifyToken, validateVentasHist);
router.post("/ventas/validate/:upload_id", verifyToken, validateVentasByUpload);
router.post("/sku-logistics/upload", verifyToken, upload.single("file"), uploadSkuLogistics);
router.post("/inventory/upload", verifyToken, upload.single("file"), uploadInventorySnapshot);
export default router;