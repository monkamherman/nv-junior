import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

interface AuthenticatedUser {
  id: string;
  role: string;
  email: string;
  nom: string;
  prenom: string;
  telephone: string | null;
}

interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

const formationInclude = {
  formateurs: {
    include: {
      formateur: true,
    },
  },
} as const;

function serializeFormation<T extends { formateurs: Array<{ formateur: any }> }>(
  formation: T,
) {
  return {
    ...formation,
    formateurs: formation.formateurs.map(({ formateur }) => ({
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

export async function getFormations(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const formations = await prisma.formation.findMany({
      include: formationInclude,
      orderBy: {
        dateDebut: "desc",
      },
    });
    res.json(formations.map(serializeFormation));
  } catch (error: unknown) {
    console.error(error);
    const errorMessage =
      error instanceof Error ? error.message : "Erreur inconnue";
    res.status(500).json({
      message: "Erreur lors de la récupération des formations.",
      error: errorMessage,
    });
  }
}

export async function getFormationById(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = req.params;
  try {
    const formation = await prisma.formation.findUnique({
      where: { id },
      include: formationInclude,
    });

    if (!formation) {
      res.status(404).json({ message: "Formation non trouvée." });
      return;
    }

    res.json(serializeFormation(formation));
  } catch (error: unknown) {
    console.error(error);
    const errorMessage =
      error instanceof Error ? error.message : "Erreur inconnue";
    res.status(500).json({
      message: "Erreur lors de la récupération de la formation.",
      error: errorMessage,
    });
  }
}

export async function getUserFormations(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Non autorisé." });
    }

    const inscriptions = await prisma.inscription.findMany({
      where: {
        utilisateurId: req.user.id,
        statut: "VALIDEE",
        paiement: {
          statut: "VALIDE",
        },
      },
      include: {
        formation: {
          include: formationInclude,
        },
        paiement: true,
      },
    });

    const formations = inscriptions.map((inscription) => ({
      ...serializeFormation(inscription.formation),
      dateInscription: inscription.dateInscription.toISOString(),
      statutPaiement: inscription.paiement?.statut || "EN_ATTENTE",
      montantPaiement: inscription.paiement?.montant || 0,
    }));

    res.json(formations);
  } catch (error: unknown) {
    console.error(error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Une erreur inconnue est survenue";
    res.status(500).json({
      message: "Erreur lors de la récupération de vos formations.",
      error: errorMessage,
    });
  }
}

export async function createFormation(req: Request, res: Response) {
  const {
    titre,
    description,
    prix,
    dateDebut,
    dateFin,
    statut,
    formateurIds,
  } = req.body;

  if (
    !titre ||
    !description ||
    prix === undefined ||
    !dateDebut ||
    !dateFin ||
    !Array.isArray(formateurIds) ||
    formateurIds.length === 0
  ) {
    return res.status(400).json({
      message: "Tous les champs requis doivent être renseignés, y compris au moins un formateur.",
      errors: [
        !titre && { path: "titre", message: "Le titre est requis" },
        !description && {
          path: "description",
          message: "La description est requise",
        },
        prix === undefined && { path: "prix", message: "Le prix est requis" },
        !dateDebut && {
          path: "dateDebut",
          message: "La date de début est requise",
        },
        !dateFin && { path: "dateFin", message: "La date de fin est requise" },
        (!Array.isArray(formateurIds) || formateurIds.length === 0) && {
          path: "formateurIds",
          message: "Sélectionnez au moins un formateur",
        },
      ].filter(Boolean),
    });
  }

  try {
    const existingFormateurs = await prisma.formateur.findMany({
      where: {
        id: {
          in: formateurIds,
        },
      },
      select: { id: true },
    });

    if (existingFormateurs.length !== formateurIds.length) {
      return res.status(400).json({
        message: "Un ou plusieurs formateurs sélectionnés sont introuvables.",
      });
    }

    const newFormation = await prisma.formation.create({
      data: {
        titre,
        description,
        prix: Number(prix),
        dateDebut: new Date(dateDebut),
        dateFin: new Date(dateFin),
        statut: statut || "BROUILLON",
        formateurs: {
          create: formateurIds.map((formateurId: string) => ({
            formateur: { connect: { id: formateurId } },
          })),
        },
      },
      include: formationInclude,
    });

    res.status(201).json(serializeFormation(newFormation));
  } catch (error: unknown) {
    console.error("ERREUR lors de la création de la formation:", error);

    if (error instanceof Error && "code" in error && error.code === "P2002") {
      return res.status(400).json({
        message: "Une formation avec ce titre existe déjà",
        errors: [{ path: "titre", message: "Ce titre est déjà utilisé" }],
      });
    }

    res.status(500).json({
      message: "Erreur lors de la création de la formation",
      error:
        process.env.NODE_ENV === "development"
          ? error instanceof Error
            ? error.message
            : String(error)
          : undefined,
    });
  }
}

export async function updateFormation(req: Request, res: Response) {
  const { id } = req.params;
  const {
    titre,
    description,
    prix,
    dateDebut,
    dateFin,
    formateurIds,
    statut,
  } = req.body;
  try {
    const formation = await prisma.formation.findUnique({
      where: { id },
      include: formationInclude,
    });
    if (!formation) {
      return res.status(404).json({ message: "Formation non trouvée." });
    }

    if (formateurIds !== undefined) {
      if (!Array.isArray(formateurIds) || formateurIds.length === 0) {
        return res.status(400).json({
          message: "Sélectionnez au moins un formateur.",
        });
      }

      const existingFormateurs = await prisma.formateur.findMany({
        where: {
          id: { in: formateurIds },
        },
        select: { id: true },
      });

      if (existingFormateurs.length !== formateurIds.length) {
        return res.status(400).json({
          message: "Un ou plusieurs formateurs sélectionnés sont introuvables.",
        });
      }
    }

    const updatedFormation = await prisma.formation.update({
      where: { id },
      data: {
        titre: titre !== undefined ? titre : formation.titre,
        description:
          description !== undefined ? description : formation.description,
        prix: prix !== undefined ? Number(prix) : formation.prix,
        dateDebut: dateDebut ? new Date(dateDebut) : formation.dateDebut,
        dateFin: dateFin ? new Date(dateFin) : formation.dateFin,
        statut: statut !== undefined ? statut : formation.statut,
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
    console.error("Erreur lors de la mise à jour de la formation:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la mise à jour de la formation." });
  }
}

export async function deleteFormation(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const formation = await prisma.formation.findUnique({ where: { id } });
    if (!formation) {
      return res.status(404).json({ message: "Formation non trouvée." });
    }

    await prisma.attestation.deleteMany({
      where: { formationId: id },
    });

    await prisma.paiement.deleteMany({
      where: { formationId: id },
    });

    await prisma.inscription.deleteMany({
      where: { formationId: id },
    });

    await prisma.formationFormateur.deleteMany({
      where: { formationId: id },
    });

    await prisma.formation.delete({ where: { id } });

    res.json({ message: "Formation supprimée avec succès." });
  } catch (error) {
    console.error("Erreur lors de la suppression de la formation:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la suppression de la formation." });
  }
}
