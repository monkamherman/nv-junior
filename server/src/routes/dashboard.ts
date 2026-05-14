import { Router } from "express";
import * as certificateController from "../controllers/dashboard/certificates";
import * as formateurController from "../controllers/dashboard/formateurs";
import * as formationController from "../controllers/dashboard/formations";
import * as paymentController from "../controllers/dashboard/payments";
import * as statsController from "../controllers/dashboard/stats";
import * as userController from "../controllers/dashboard/users";

const router = Router();

router.get("/stats", statsController.getDashboardStats);

router.get("/users", userController.getAllUsers);
router.get("/users/:id", userController.getUserById);
router.put("/users/:id", userController.updateUser);
router.delete("/users/:id", userController.deactivateUser);

router.post("/formateurs", formateurController.createFormateur);
router.get("/formateurs", formateurController.getAllFormateurs);
router.get("/formateurs/:id", formateurController.getFormateurById);
router.put("/formateurs/:id", formateurController.updateFormateur);
router.delete("/formateurs/:id", formateurController.deleteFormateur);

router.post("/formations", formationController.createFormation);
router.get("/formations", formationController.getAllFormations);
router.get("/formations/:id", formationController.getFormationById);
router.put("/formations/:id", formationController.updateFormation);
router.delete("/formations/:id", formationController.deleteFormation);

router.post("/payments", paymentController.createPayment);
router.get("/payments", paymentController.getAllPayments);
router.get("/payments/:id", paymentController.getPaymentById);
router.patch("/payments/:id/status", paymentController.updatePaymentStatus);

router.post(
  "/certificates/generate",
  certificateController.generateCertificateForUser,
);
router.get(
  "/certificates/eligible-inscriptions",
  certificateController.getEligibleInscriptionsForCertificate,
);
router.get("/certificates", certificateController.getAllCertificates);
router.get(
  "/certificates/:id/download",
  certificateController.downloadCertificate,
);
router.post(
  "/certificates/:id/send",
  certificateController.sendCertificateByEmail,
);

export default router;
