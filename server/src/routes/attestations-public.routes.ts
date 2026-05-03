import { Router } from "express";
import { generateAttestation } from "../controllers/formations/formation.controller";

const router = Router();

// Génération d'attestation
router.post("/generate", generateAttestation);
router.get("/user/:userId", async (req, res) => {
  // Endpoint pour récupérer les attestations d'un utilisateur
  try {
    // Pour l'instant, retourner une liste vide
    res.json([]);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la récupération des attestations" });
  }
});

export default router;