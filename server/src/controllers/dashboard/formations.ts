import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

// Créer une nouvelle formation
export const createFormation = async (req: Request, res: Response) => {
  const { titre, description, prix, dateDebut, dateFin, formateurId } =
    req.body;

  try {
    const formation = await prisma.formation.create({
      data: {
        titre,
        description,
        prix: parseFloat(prix),
        dateDebut: new Date(dateDebut),
        dateFin: new Date(dateFin),
        formateur: formateurId ? { connect: { id: formateurId } } : undefined,
      },
    });

    res.status(201).json(formation);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erreur lors de la création de la formation" });
  }
};

// Récupérer toutes les formations
export const getAllFormations = async (req: Request, res: Response) => {
  try {
    const formations = await prisma.formation.findMany({
      include: {
        formateur: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
          },
        },
        _count: {
          select: {
            inscriptions: true,
          },
        },
      },
      orderBy: {
        dateDebut: "desc",
      },
    });

    res.json(formations);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération des formations" });
  }
};

// Obtenir une formation par ID
export const getFormationById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const formation = await prisma.formation.findUnique({
      where: { id },
      include: {
        formateur: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
          },
        },
        inscriptions: {
          include: {
            utilisateur: {
              select: {
                id: true,
                nom: true,
                prenom: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!formation) {
      return res.status(404).json({ error: "Formation non trouvée" });
    }

    res.json(formation);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération de la formation" });
  }
};

// Mettre à jour une formation
export const updateFormation = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { titre, description, prix, dateDebut, dateFin, statut, formateurId } =
    req.body;

  try {
    const updatedFormation = await prisma.formation.update({
      where: { id },
      data: {
        titre,
        description,
        prix: prix ? parseFloat(prix) : undefined,
        dateDebut: dateDebut ? new Date(dateDebut) : undefined,
        dateFin: dateFin ? new Date(dateFin) : undefined,
        statut,
        formateur: formateurId ? { connect: { id: formateurId } } : undefined,
      },
    });

    res.json(updatedFormation);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erreur lors de la mise à jour de la formation" });
  }
};

// Supprimer une formation
export const deleteFormation = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await prisma.formation.delete({
      where: { id },
    });

    res.json({ message: "Formation supprimée avec succès" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erreur lors de la suppression de la formation" });
  }
};
