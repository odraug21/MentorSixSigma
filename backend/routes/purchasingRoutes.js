import express from "express";
import { verifyToken } from "../middleware/auth.js"; // 👈 ESTA LÍNEA FALTABA

import {
  receivePurchaseOrder,
  approvePurchaseOrder,
  getPurchaseOrderById,
  listPurchaseOrders
} from "../controllers/purchasingController.js";

const router = express.Router();

router.post("/purchase-orders/:id/receive", receivePurchaseOrder);
router.post("/purchase-orders/:id/approve", approvePurchaseOrder);
router.get("/:id", verifyToken, getPurchaseOrderById);
router.post("/:id/receive", verifyToken, receivePurchaseOrder);
router.get("/company/:companyId", verifyToken, listPurchaseOrders);
export default router;