import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const createFormateur = async (req: Request, res: Response) => {
  const {
    nom,
    prenom,
    email,
    telephone,
    qualificationProfessionnelle,
    bio,
  } = req.body;

  if (!nom || !prenom || !qualificationProfessionnelle) {
    return res.status(400).json({
      error:
        "Le nom, le prénom et la qualification professionnelle sont requis.",
    });
  }

  try {
    const formateur = await prisma.formateur.create({
      data: {
        nom,
        prenom,
        email: email || null,
        telephone: telephone || null,
        qualificationProfessionnelle,
        bio: bio || null,
      },
    });

    res.status(201).json(formateur);
  } catch (error) {
    res.status(500).json({
      error: "Erreur lors de la création du formateur.",
    });
  }
};

export const getAllFormateurs = async (req: Request, res: Response) => {
  try {
    const formateurs = await prisma.formateur.findMany({
      include: {
        _count: {
          select: {
            formations: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(formateurs);
  } catch (error) {
    res.status(500).json({
      error: "Erreur lors de la récupération des formateurs.",
    });
  }
};

export const getFormateurById = async (req: Request, res: Response) => {
  try {
    const formateur = await prisma.formateur.findUnique({
      where: { id: req.params.id },
      include: {
        formations: {
          include: {
            formation: true,
          },
        },
      },
    });

    if (!formateur) {
      return res.status(404).json({ error: "Formateur non trouvé." });
    }

    res.json({
      ...formateur,
      formations: formateur.formations.map(({ formation }) => formation),
    });
  } catch (error) {
    res.status(500).json({
      error: "Erreur lors de la récupération du formateur.",
    });
  }
};

export const updateFormateur = async (req: Request, res: Response) => {
  const {
    nom,
    prenom,
    email,
    telephone,
    qualificationProfessionnelle,
    bio,
  } = req.body;

  try {
    const formateur = await prisma.formateur.update({
      where: { id: req.params.id },
      data: {
        nom,
        prenom,
        email: email ?? undefined,
        telephone: telephone ?? undefined,
        qualificationProfessionnelle,
        bio: bio ?? undefined,
      },
    });

    res.json(formateur);
  } catch (error) {
    res.status(500).json({
      error: "Erreur lors de la mise à jour du formateur.",
    });
  }
};

export const deleteFormateur = async (req: Request, res: Response) => {
  try {
    await prisma.formationFormateur.deleteMany({
      where: { formateurId: req.params.id },
    });

    await prisma.formateur.delete({
      where: { id: req.params.id },
    });

    res.json({ message: "Formateur supprimé avec succès." });
  } catch (error) {
    res.status(500).json({
      error: "Erreur lors de la suppression du formateur.",
    });
  }
};
