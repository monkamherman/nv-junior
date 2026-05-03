import { Router } from "express";
import * as certificateController from "../controllers/dashboard/certificates";
import * as formationController from "../controllers/dashboard/formations";
import * as paymentController from "../controllers/dashboard/payments";
import * as statsController from "../controllers/dashboard/stats";
import * as userController from "../controllers/dashboard/users";

const router = Router();

// Routes pour les statistiques du tableau de bord
router.get("/stats", statsController.getDashboardStats);

// Routes pour la gestion des utilisateurs
router.get("/users", userController.getAllUsers);
router.get("/users/:id", userController.getUserById);
router.put("/users/:id", userController.updateUser);
router.delete("/users/:id", userController.deactivateUser);

// Routes pour la gestion des formations
router.post("/formations", formationController.createFormation);
router.get("/formations", formationController.getAllFormations);
router.get("/formations/:id", formationController.getFormationById);
router.put("/formations/:id", formationController.updateFormation);
router.delete("/formations/:id", formationController.deleteFormation);

// Routes pour la gestion des paiements
router.post("/payments", paymentController.createPayment);
router.get("/payments", paymentController.getAllPayments);
router.get("/payments/:id", paymentController.getPaymentById);
router.patch("/payments/:id/status", paymentController.updatePaymentStatus);

// Routes pour la gestion des attestations
router.post(
  "/certificates/generate",
  certificateController.generateCertificateForUser
);
router.get("/certificates", certificateController.getAllCertificates);
router.get(
  "/certificates/:id/download",
  certificateController.downloadCertificate
);
router.post(
  "/certificates/:id/send",
  certificateController.sendCertificateByEmail
);

export default router;
