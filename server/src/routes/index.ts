import express from "express";
import attestationsPublicRoutes from "./attestations-public.routes";
import attestationsRoutes from "./attestations.routes";
import auth from "./auth.routes";
import dashboardRoutes from "./dashboard";
import formationRoutes from "./formation.routes";
import paiementRoutes from "./paiement.routes";
import userRoute from "./user.routes";

export default function registerRoutes(app: express.Application) {
  app.use("/api/auth", auth);
  app.use("/api/user", userRoute);
  app.use("/api/formations", formationRoutes);
  app.use("/api/dashboard", dashboardRoutes);
  app.use("/api/paiements", paiementRoutes);
  // Routes attestations publiques d'abord
  app.use("/api/attestations", attestationsPublicRoutes);
  // Routes attestations protégées ensuite
  app.use("/api/attestations", attestationsRoutes);
}
