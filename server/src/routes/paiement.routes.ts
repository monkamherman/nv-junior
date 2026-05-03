import { Router } from "express";
import {
  annulerPaiement,
  creerPaiement,
  getStatutPaiement,
  listerPaiementsUtilisateur,
  monetbilWebhook,
  telechargerRecuPaiement,
  telechargerRecuPaiementTxt,
  verifierStatutMonetbil,
} from "../controllers/paiements/paiement.controller";
import authMiddleware from "../middlewares/auth.middleware";

const router = Router();

// Route publique pour le webhook Monetbil (pas d'authentification)
// Cette route est appelée par Monetbil pour notifier le statut du paiement
router.post("/webhook/monetbil", monetbilWebhook);

// Appliquer le middleware d'authentification aux autres routes
router.use(authMiddleware);

/**
 * @route POST /api/paiements
 * @desc Créer un nouveau paiement avec intégration Monetbil
 * @access Privé
 */
router.post("/", creerPaiement);

/**
 * @route GET /api/paiements
 * @desc Lister les paiements de l'utilisateur connecté
 * @access Privé
 */
router.get("/", listerPaiementsUtilisateur);

/**
 * @route GET /api/paiements/:reference/statut
 * @desc Récupérer le statut d'un paiement
 * @access Privé
 */
router.get("/:reference/statut", getStatutPaiement);
router.get("/:reference", getStatutPaiement);

/**
 * @route GET /api/paiements/:reference/verifier
 * @desc Vérifier manuellement le statut d'un paiement Monetbil
 * @access Privé
 */
router.get("/:reference/verifier", verifierStatutMonetbil);

/**
 * @route POST /api/paiements/:reference/annuler
 * @desc Annuler un paiement en cours
 * @access Privé
 */
router.post("/:reference/annuler", annulerPaiement);

/**
 * @route GET /api/paiements/:id/recu
 * @desc Télécharger le reçu de paiement en format PDF
 * @access Privé
 */
router.get("/:id/recu", telechargerRecuPaiement);
router.get("/:id/recu.txt", telechargerRecuPaiementTxt);

export default router;
