import { Router } from "express";
import path from "path";
import {
  genererMonAttestation,
  genererPdfAttestation,
  getMesAttestations,
  telechargerMonAttestation,
  verifierEligibiliteAttestation,
} from "../controllers/attestations/attestation.controller";
import { generateAttestation } from "../controllers/formations/formation.controller";
import prisma from "../lib/prisma";
import authMiddleware from "../middlewares/auth.middleware";

const router = Router();

// Route publique pour la simulation d'attestation
router.post("/generate", generateAttestation);

// Appliquer l'authentification aux autres routes
router.use(authMiddleware);

// Routes spécifiques avant les routes génériques pour éviter les conflits
router.get("/:id/generer-pdf", genererPdfAttestation);
router.get("/:id/telecharger", telechargerMonAttestation);
router.get("/telecharger/:id", telechargerMonAttestation);

// Route pour servir les fichiers PDF d'attestation (doit être après les routes spécifiques)
router.get("/attestations/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, "../../public/attestations", filename);
  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).json({ message: "Fichier non trouvé" });
    }
  });
});

/**
 * @route GET /api/attestations
 * @desc Récupérer les attestations de l'utilisateur connecté
 * @access Privé
 */
router.get("/", getMesAttestations);

/**
 * @route GET /api/attestations/user
 * @desc Récupérer les attestations de l'utilisateur connecté (alias)
 * @access Privé
 */
router.get("/user", getMesAttestations);

/**
 * @route GET /api/attestations/:id
 * @desc Récupérer les détails d'une attestation spécifique
 * @access Privé
 */
router.get("/:id", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Non autorisé" });
    }

    const { id } = req.params;

    const attestation = await prisma.attestation.findUnique({
      where: { id },
      include: {
        inscription: {
          include: {
            utilisateur: true,
            formation: true,
          },
        },
      },
    });

    if (!attestation) {
      return res.status(404).json({ message: "Attestation non trouvée" });
    }

    // Vérifier que l'utilisateur est bien le propriétaire
    if (attestation.inscription.utilisateurId !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Non autorisé à accéder à cette attestation" });
    }

    res.json(attestation);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'attestation:", error);
    res.status(500).json({
      message: "Erreur lors de la récupération de l'attestation",
    });
  }
});

/**
 * @route GET /api/attestations/verifier-eligibilite/:formationId
 * @desc Vérifier si l'utilisateur peut générer une attestation pour une formation
 * @access Privé
 */
router.get(
  "/verifier-eligibilite/:formationId",
  verifierEligibiliteAttestation,
);

/**
 * @route POST /api/attestations/generer
 * @desc Générer une attestation pour l'utilisateur connecté
 * @access Privé
 */
router.post("/generer", genererMonAttestation);
router.post(
  "/generer/:formationId",
  (req, res, next) => {
    req.body.formationId = req.params.formationId;
    next();
  },
  genererMonAttestation,
);

export default router;
