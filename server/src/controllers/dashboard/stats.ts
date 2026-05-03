import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

// Récupérer les statistiques du tableau de bord
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    // Récupérer le nombre d'utilisateurs
    const usersCount = await prisma.utilisateur.count();

    // Récupérer le nombre de formations
    const formationsCount = await prisma.formation.count();

    // Récupérer le nombre de paiements
    const paymentsCount = await prisma.paiement.count();

    // Récupérer le nombre d'attestations
    const certificatesCount = await prisma.attestation.count();

    res.json({
      users: usersCount,
      formations: formationsCount,
      payments: paymentsCount,
      certificates: certificatesCount,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des statistiques" });
  }
};
