import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

const formationInclude = {
  formateurs: {
    include: {
      formateur: true,
    },
  },
  _count: {
    select: {
      inscriptions: true,
    },
  },
} as const;

function serializeFormation(formation: any) {
  return {
    ...formation,
    formateurs: formation.formateurs.map(({ formateur }: any) => ({
      id: formateur.id,
      nom: formateur.nom,
      prenom: formateur.prenom,
      email: formateur.email,
      telephone: formateur.telephone,
      qualificationProfessionnelle: formateur.qualificationProfessionnelle,
      bio: formateur.bio,
    })),
  };
}

export const createFormation = async (req: Request, res: Response) => {
  const { titre, description, prix, dateDebut, dateFin, formateurIds } =
    req.body;

  try {
    if (!Array.isArray(formateurIds) || formateurIds.length === 0) {
      return res.status(400).json({
        error: "Sélectionnez au moins un formateur",
      });
    }

    const formation = await prisma.formation.create({
      data: {
        titre,
        description,
        prix: parseFloat(prix),
        dateDebut: new Date(dateDebut),
        dateFin: new Date(dateFin),
        formateurs: {
          create: formateurIds.map((formateurId: string) => ({
            formateur: { connect: { id: formateurId } },
          })),
        },
      },
      include: formationInclude,
    });

    res.status(201).json(serializeFormation(formation));
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erreur lors de la création de la formation" });
  }
};

export const getAllFormations = async (req: Request, res: Response) => {
  try {
    const formations = await prisma.formation.findMany({
      include: formationInclude,
      orderBy: {
        dateDebut: "desc",
      },
    });

    res.json(formations.map(serializeFormation));
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération des formations" });
  }
};

export const getFormationById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const formation = await prisma.formation.findUnique({
      where: { id },
      include: {
        formateurs: {
          include: {
            formateur: true,
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

    res.json(serializeFormation(formation));
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération de la formation" });
  }
};

export const updateFormation = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { titre, description, prix, dateDebut, dateFin, statut, formateurIds } =
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
        formateurs:
          formateurIds !== undefined
            ? {
                deleteMany: {},
                create: formateurIds.map((formateurId: string) => ({
                  formateur: { connect: { id: formateurId } },
                })),
              }
            : undefined,
      },
      include: formationInclude,
    });

    res.json(serializeFormation(updatedFormation));
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erreur lors de la mise à jour de la formation" });
  }
};

export const deleteFormation = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await prisma.formationFormateur.deleteMany({
      where: { formationId: id },
    });

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
