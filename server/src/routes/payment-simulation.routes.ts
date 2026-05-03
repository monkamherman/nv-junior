import { Router } from "express";
import { simulatePayment, generateAttestation } from "../controllers/formations/formation.controller";

const router = Router();

// Simulation de paiement
router.post("/simulate", simulatePayment);

export default router;