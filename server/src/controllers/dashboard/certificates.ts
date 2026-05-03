import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { generateCertificate } from "../../services/certificateService";

const prisma = new PrismaClient();

// Générer une nouvelle attestation
export const generateCertificateForUser = async (
  req: Request,
  res: Response
) => {
  const { inscriptionId } = req.body;

  try {
    // Vérifier si l'inscription existe et est valide
    const inscription = await prisma.inscription.findUnique({
      where: { id: inscriptionId },
      include: {
        utilisateur: true,
        formation: true,
        paiement: true,
      },
    });

    if (!inscription) {
      return res.status(404).json({ error: "Inscription non trouvée" });
    }

    // Vérifier si le paiement est validé
    if (inscription.paiement?.statut !== "VALIDE") {
      return res.status(400).json({
        error: "Le paiement doit être validé pour générer une attestation",
      });
    }

    // Vérifier si une attestation existe déjà
    const existingCertificate = await prisma.attestation.findFirst({
      where: { inscriptionId },
    });

    if (existingCertificate) {
      return res
        .status(400)
        .json({ error: "Une attestation existe déjà pour cette inscription" });
    }

    // Générer l'attestation (à implémenter dans le service)
    const certificateData = await generateCertificate(inscription);

    // Enregistrer l'attestation dans la base de données
    const attestation = await prisma.attestation.create({
      data: {
        numero: `ATT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        urlPdf: certificateData.url,
        utilisateurId: inscription.utilisateurId,
        formationId: inscription.formationId,
        inscriptionId: inscription.id,
      },
      include: {
        inscription: {
          include: {
            utilisateur: true,
            formation: true,
          },
        },
      },
    });

    res.status(201).json(attestation);
  } catch (error) {
    console.error("Erreur lors de la génération de l'attestation:", error);
    res
      .status(500)
      .json({ error: "Erreur lors de la génération de l'attestation" });
  }
};

// Récupérer toutes les attestations
export const getAllCertificates = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, statut } = req.query;

    const where: Record<string, any> = {};

    if (startDate && endDate) {
      where.dateEmission = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string),
      };
    }

    if (statut) {
      where.statut = statut;
    }

    const attestations = await prisma.attestation.findMany({
      where,
      include: {
        inscription: {
          include: {
            utilisateur: {
              select: {
                id: true,
                nom: true,
                prenom: true,
                email: true,
              },
            },
            formation: {
              select: {
                id: true,
                titre: true,
                dateDebut: true,
                dateFin: true,
              },
            },
          },
        },
      },
      orderBy: {
        dateEmission: "desc",
      },
    });

    res.json(attestations);
  } catch (error) {
    console.error("Erreur lors de la récupération des attestations:", error);
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération des attestations" });
  }
};

// Télécharger une attestation
export const downloadCertificate = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const attestation = await prisma.attestation.findUnique({
      where: { id },
      include: {
        inscription: {
          include: {
            utilisateur: true,
            formation: true,
          },
        },
      },
    });

    if (!attestation) {
      return res.status(404).json({ error: "Attestation non trouvée" });
    }

    // Mettre à jour le statut de l'attestation
    await prisma.attestation.update({
      where: { id },
      data: {
        statut: "TELECHARGEE",
        dateTelechargement: new Date(),
      },
    });

    // Retourner le fichier PDF de l'attestation
    res.download(attestation.urlPdf, `attestation-${attestation.id}.pdf`);
  } catch (error) {
    console.error("Erreur lors du téléchargement de l'attestation:", error);
    res
      .status(500)
      .json({ error: "Erreur lors du téléchargement de l'attestation" });
  }
};

// Envoyer une attestation par email
export const sendCertificateByEmail = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const attestation = await prisma.attestation.findUnique({
      where: { id },
      include: {
        inscription: {
          include: {
            utilisateur: true,
            formation: true,
          },
        },
      },
    });

    if (!attestation) {
      return res.status(404).json({ error: "Attestation non trouvée" });
    }

    // Ici, vous devriez implémenter l'envoi d'email avec le lien de téléchargement
    // Par exemple, en utilisant Nodemailer ou un service tiers comme SendGrid

    // Mettre à jour le statut de l'attestation
    const updatedAttestation = await prisma.attestation.update({
      where: { id },
      data: {
        statut: "ENVOYEE",
      },
      include: {
        inscription: {
          include: {
            utilisateur: true,
            formation: true,
          },
        },
      },
    });

    res.json({
      message: "Attestation envoyée avec succès",
      attestation: updatedAttestation,
    });
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'attestation:", error);
    res.status(500).json({ error: "Erreur lors de l'envoi de l'attestation" });
  }
};
