import express from "express";
import { getDashboardSummary } from "../controllers/dashboardController.js";

const router = express.Router();

router.get("/dashboard/:companyId", getDashboardSummary);

export default router;
