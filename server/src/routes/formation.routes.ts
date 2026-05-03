import { Router } from "express";
import {
  createFormation,
  deleteFormation,
  getFormationById,
  getFormations,
  getUserFormations,
  updateFormation,
} from "../controllers/formations/formation";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

// Routes publiques
router.get("/", getFormations);
router.get("/public", getFormations); // Endpoint public pour le frontend

// Routes protégées par authentification
router.get("/mes-formations", authMiddleware, getUserFormations);
router.post("/", authMiddleware, createFormation);
router.put("/:id", authMiddleware, updateFormation);
router.delete("/:id", authMiddleware, deleteFormation);

// Routes publiques (avec paramètre)
router.get("/:id", getFormationById);
router.get("/:id/public", getFormationById); // Endpoint public pour le frontend

export default router;
