import express from "express";
import { confirmOrder, shipOrder, cancelOrder } from "../controllers/salesController.js";

const router = express.Router();

router.post("/orders/:id/confirm", confirmOrder);
router.post("/orders/:id/ship", shipOrder);
router.post("/orders/:id/cancel", cancelOrder);

export default router;