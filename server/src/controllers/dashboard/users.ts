import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

// Récupérer tous les utilisateurs
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.utilisateur.findMany({
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        telephone: true,
        role: true,
        createdAt: true,
      },
    });
    res.json(users);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération des utilisateurs" });
  }
};

// Obtenir un utilisateur par ID
export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const user = await prisma.utilisateur.findUnique({
      where: { id },
      include: {
        inscriptions: {
          include: {
            formation: true,
            attestation: true,
          },
        },
        paiements: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    res.json(user);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération de l'utilisateur" });
  }
};

// Mettre à jour un utilisateur
export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { nom, prenom, email, telephone, role } = req.body;

  try {
    const updatedUser = await prisma.utilisateur.update({
      where: { id },
      data: {
        nom,
        prenom,
        email,
        telephone,
        role,
      },
    });

    res.json(updatedUser);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erreur lors de la mise à jour de l'utilisateur" });
  }
};

// Désactiver un utilisateur
export const deactivateUser = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await prisma.utilisateur.delete({
      where: { id },
    });

    res.json({ message: "Utilisateur désactivé avec succès" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erreur lors de la désactivation de l'utilisateur" });
  }
};
