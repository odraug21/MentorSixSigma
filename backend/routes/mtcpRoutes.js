import express from "express";
import { getMtcpRanking,
         generatePurchaseOrdersFromMtcp,
         getMtcpDashboard
 } from "../controllers/mtcpController.js";

const router = express.Router();

router.get("/mtcp/:companyId", getMtcpRanking);
router.post( "/mtcp/:companyId/generate-purchase-orders",generatePurchaseOrdersFromMtcp);
router.get("/mtcp/:companyId/dashboard", getMtcpDashboard);
export default router;