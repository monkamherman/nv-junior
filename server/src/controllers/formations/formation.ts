import { Prisma, PrismaClient } from "@prisma/client";
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

type FormationWithFormateur = Prisma.FormationGetPayload<{
  include: {
    formateur: {
      select: {
        id: true;
        nom: true;
        prenom: true;
      };
    };
  };
}> & {
  dateInscription: string;
};

export async function getFormations(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const formations = await prisma.formation.findMany({
      include: {
        formateur: {
          select: {
            id: true,
            nom: true,
            prenom: true,
          },
        },
      },
    });
    res.json(formations);
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
  res: Response
): Promise<void> {
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
          },
        },
      },
    });

    if (!formation) {
      res.status(404).json({ message: "Formation non trouvée." });
      return;
    }

    res.json(formation);
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
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Non autorisé." });
    }

    // Récupérer les inscriptions de l'utilisateur avec un paiement validé
    const inscriptions = await prisma.inscription.findMany({
      where: {
        utilisateurId: req.user.id,
        statut: "VALIDEE", // Uniquement les inscriptions validées
        paiement: {
          statut: "VALIDE", // Uniquement les paiements validés
        },
      },
      include: {
        formation: {
          include: {
            formateur: {
              select: {
                id: true,
                nom: true,
                prenom: true,
              },
            },
          },
        },
        paiement: true, // Inclure les informations de paiement
      },
    });

    // Transformer les données pour correspondre au format attendu
    const formations: FormationWithFormateur[] = inscriptions.map(
      (inscription) => ({
        ...inscription.formation,
        dateInscription: inscription.dateInscription.toISOString(),
        statutPaiement: inscription.paiement?.statut || "EN_ATTENTE",
        montantPaiement: inscription.paiement?.montant || 0,
      })
    );

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
  console.log("=== NOUVELLE DEMANDE DE CRÉATION DE FORMATION ===");
  console.log("Données reçues:", req.body);

  const { titre, description, prix, dateDebut, dateFin, statut } = req.body;

  // Validation des champs requis
  if (!titre || !description || prix === undefined || !dateDebut || !dateFin) {
    console.error("Champs manquants dans la requête");
    return res.status(400).json({
      message: "Tous les champs sont obligatoires",
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
      ].filter(Boolean),
    });
  }

  try {
    console.log("Tentative de création de la formation...");

    // Vérifier si l'utilisateur est authentifié et a un ID valide
    const userId = (req as AuthenticatedRequest).user?.id;
    if (!userId) {
      console.error("Aucun ID utilisateur trouvé dans la requête");
      return res
        .status(401)
        .json({ message: "Non autorisé - Utilisateur non identifié" });
    }

    const newFormation = await prisma.formation.create({
      data: {
        titre,
        description,
        prix: Number(prix),
        dateDebut: new Date(dateDebut),
        dateFin: new Date(dateFin),
        statut: statut || "BROUILLON",
        formateurId: userId, // Utiliser l'ID de l'utilisateur connecté comme formateur
      },
    });

    console.log("Formation créée avec succès:", newFormation);
    res.status(201).json(newFormation);
  } catch (error: unknown) {
    console.error("ERREUR lors de la création de la formation:", error);
    console.error(
      "Détails de l'erreur:",
      error instanceof Error ? error.message : String(error)
    );

    // Gestion spécifique des erreurs Prisma
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
  const { titre, description, prix, dateDebut, dateFin, formateurId } =
    req.body;
  try {
    const formation = await prisma.formation.findUnique({ where: { id } });
    if (!formation) {
      return res.status(404).json({ message: "Formation non trouvée." });
    }
    const updatedFormation = await prisma.formation.update({
      where: { id },
      data: {
        titre,
        description,
        prix,
        dateDebut: new Date(dateDebut),
        dateFin: new Date(dateFin),
        formateurId,
      },
    });
    res.json(updatedFormation);
  } catch (error) {
    console.error(error);
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
    await prisma.formation.delete({ where: { id } });
    res.json({ message: "Formation supprimée avec succès." });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de la suppression de la formation." });
  }
}
