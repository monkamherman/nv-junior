import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { sendError, sendSuccess } from "../../core/errors/http";
import sendMail from "../../nodemailer/sendmail";
import { generateCertificate } from "../../services/certificateService";

const prisma = new PrismaClient();

const isPdfFile = (filePath: string) => {
  if (!fs.existsSync(filePath)) {
    return false;
  }

  const header = fs.readFileSync(filePath, { encoding: "utf8" }).slice(0, 4);
  return header === "%PDF";
};

export const getMesAttestations = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 401, "AUTH_REQUIRED", "Non autorisé");
    }

    const attestations = await prisma.attestation.findMany({
      where: {
        inscription: {
          utilisateurId: req.user.id,
        },
      },
      include: {
        inscription: {
          include: {
            formation: {
              select: {
                id: true,
                titre: true,
                description: true,
                dateDebut: true,
                dateFin: true,
                prix: true,
              },
            },
          },
        },
      },
      orderBy: {
        dateEmission: "desc",
      },
    });

    return sendSuccess(res, { attestations }, "Attestations récupérées");
  } catch (error) {
    console.error("Erreur lors de la récupération des attestations:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Erreur inconnue";
    return sendError(
      res,
      500,
      "ATTESTATION_LIST_ERROR",
      "Erreur lors de la récupération des attestations",
      errorMessage,
    );
  }
};

/**
 * Vérifier si une attestation peut être générée pour une formation
 */
export const verifierEligibiliteAttestation = async (
  req: Request,
  res: Response,
) => {
  try {
    if (!req.user) {
      return sendError(res, 401, "AUTH_REQUIRED", "Non autorisé");
    }

    const { formationId } = req.params;

    // 1. Vérifier si une inscription validée avec un paiement existe déjà
    const inscriptionValidee = await prisma.inscription.findFirst({
      where: {
        utilisateurId: req.user.id,
        formationId,
        statut: "VALIDEE",
        paiement: {
          statut: "VALIDE",
        },
      },
      include: {
        formation: true,
        attestation: true,
      },
    });

    if (inscriptionValidee) {
      // Si une attestation existe déjà, l'utilisateur peut la télécharger
      if (inscriptionValidee.attestation) {
        return sendSuccess(res, {
          eligible: false,
          reason: "Attestation déjà disponible",
          attestation: inscriptionValidee.attestation,
        });
      }

      // Si la formation n'est pas terminée
      // const maintenant = new Date();
      // const dateFinFormation = new Date(inscriptionValidee.formation.dateFin);
      // if (maintenant < dateFinFormation) {
      //   return sendSuccess(res, {
      //     eligible: false,
      //     reason: `Formation en cours. Attestation disponible après le ${dateFinFormation.toLocaleDateString()}`,
      //   });
      // }

      // Si le paiement est fait mais l'attestation pas encore générée (cas rare)
      return sendSuccess(res, { eligible: true });
    }

    // 2. Vérifier si un paiement en attente ou en cours existe déjà pour éviter les doublons
    const paiementExistant = await prisma.paiement.findFirst({
      where: {
        utilisateurId: req.user.id,
        formationId,
        statut: { in: ["EN_ATTENTE", "EN_COURS"] },
      },
    });

    if (paiementExistant) {
      return sendSuccess(res, {
        eligible: false,
        reason: "Un paiement est déjà en cours de traitement.",
      });
    }

    // 3. Si aucune des conditions ci-dessus n'est remplie, l'utilisateur est éligible pour payer.
    return sendSuccess(res, { eligible: true });
  } catch (error) {
    console.error("Erreur lors de la vérification d'éligibilité:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Erreur inconnue";
    return sendError(
      res,
      500,
      "ATTESTATION_ELIGIBILITY_ERROR",
      "Erreur lors de la vérification d'éligibilité",
      errorMessage,
    );
  }
};

/**
 * Générer une attestation pour l'utilisateur connecté
 */
export const genererMonAttestation = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 401, "AUTH_REQUIRED", "Non autorisé");
    }

    const { formationId } = req.body;
    console.log("Génération attestation - Formation ID:", formationId);
    console.log("Génération attestation - User ID:", req.user.id);

    // Vérifier l'éligibilité
    const inscription = await prisma.inscription.findFirst({
      where: {
        utilisateurId: req.user.id,
        formationId,
        statut: "VALIDEE",
      },
      include: {
        paiement: true,
        formation: true,
        utilisateur: true,
        attestation: true,
      },
    });

    console.log("Inscription trouvée:", !!inscription);
    if (inscription) {
      console.log("Statut inscription:", inscription.statut);
      console.log("Paiement:", !!inscription.paiement);
      if (inscription.paiement) {
        console.log("Statut paiement:", inscription.paiement.statut);
      }
      console.log("Attestation existante:", !!inscription.attestation);
    }

    if (!inscription) {
      console.log("Inscription non trouvée");
      return sendError(
        res,
        404,
        "ATTESTATION_ENROLLMENT_NOT_FOUND",
        "Inscription non trouvée ou non validée",
      );
    }

    // Vérifications
    // Pour les utilisateurs déjà inscrits, on peut être plus flexible sur le paiement
    if (inscription.paiement && inscription.paiement.statut !== "VALIDE") {
      console.log("Paiement non valide - statut:", inscription.paiement.statut);
      return sendError(
        res,
        400,
        "ATTESTATION_PAYMENT_NOT_VALID",
        "Le paiement doit être validé pour générer une attestation",
      );
    }

    if (inscription.attestation) {
      console.log(
        "Attestation existe déjà - retour de l'attestation existante",
      );
      return sendSuccess(
        res,
        { attestation: inscription.attestation },
        "Attestation déjà disponible",
      );
    }

    // Vérifier si la formation est terminée
    const maintenant = new Date();
    const dateFinFormation = new Date(inscription.formation.dateFin);

    if (maintenant < dateFinFormation) {
      console.log("Formation non terminée - date fin:", dateFinFormation);
      return sendError(
        res,
        400,
        "ATTESTATION_FORMATION_NOT_FINISHED",
        "La formation n'est pas encore terminée",
      );
    }

    // Générer le certificat
    const certificateData = await generateCertificate(inscription);

    // Créer l'attestation
    const attestation = await prisma.attestation.create({
      data: {
        numero: `ATT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        urlPdf: certificateData.url,
        statut: "GENEREE",
        dateEmission: new Date(),
        utilisateur: { connect: { id: req.user.id } },
        formation: { connect: { id: formationId } },
        inscription: { connect: { id: inscription.id } },
      },
      include: {
        inscription: {
          include: {
            formation: true,
          },
        },
      },
    });

    // Envoyer l'email de notification
    try {
      const emailContent = `
Cher/Chère ${inscription.utilisateur.prenom} ${inscription.utilisateur.nom},

Félicitations ! Votre attestation de formation a été générée avec succès.

Détails de l'attestation :
- Numéro : ${attestation.numero}
- Formation : ${inscription.formation.titre}
- Date d'émission : ${attestation.dateEmission.toLocaleDateString("fr-FR")}
- URL du PDF : ${attestation.urlPdf}

Vous pouvez télécharger votre attestation directement depuis votre espace personnel.

Cordialement,
L'équipe Centic
      `;

      const emailResult = await sendMail(
        inscription.utilisateur.email,
        emailContent,
      );

      if (emailResult.success) {
        console.log(
          `Email d'attestation envoyé avec succès à ${inscription.utilisateur.email}`,
        );
      } else {
        console.error(
          `Erreur lors de l'envoi de l'email à ${inscription.utilisateur.email}:`,
          emailResult.error,
        );
      }
    } catch (emailError) {
      console.error(
        "Erreur lors de l'envoi de l'email d'attestation:",
        emailError,
      );
      // Ne pas bloquer la réponse si l'email échoue
    }

    return sendSuccess(
      res,
      { attestation },
      "Attestation générée avec succès",
      201,
    );
  } catch (error) {
    console.error("Erreur lors de la génération de l'attestation:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Erreur inconnue";
    return sendError(
      res,
      500,
      "ATTESTATION_GENERATION_ERROR",
      "Erreur lors de la génération de l'attestation",
      errorMessage,
    );
  }
};

/**
 * Télécharger son attestation
 */
export const telechargerMonAttestation = async (
  req: Request,
  res: Response,
) => {
  try {
    if (!req.user) {
      return sendError(res, 401, "AUTH_REQUIRED", "Non autorisé");
    }

    const { id } = req.params;
    console.log("Téléchargement attestation - ID:", id);
    console.log("Téléchargement attestation - User ID:", req.user.id);

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

    console.log("Attestation trouvée:", !!attestation);
    if (attestation) {
      console.log("Propriétaire ID:", attestation.inscription.utilisateurId);
      console.log("URL PDF:", attestation.urlPdf);
    }

    if (!attestation) {
      return sendError(
        res,
        404,
        "ATTESTATION_NOT_FOUND",
        "Attestation non trouvée",
      );
    }

    // Vérifier que l'utilisateur est bien le propriétaire
    if (attestation.inscription.utilisateurId !== req.user.id) {
      return sendError(
        res,
        403,
        "ATTESTATION_FORBIDDEN",
        "Non autorisé à accéder à cette attestation",
      );
    }

    // Mettre à jour le statut
    await prisma.attestation.update({
      where: { id },
      data: {
        statut: "TELECHARGEE",
        dateTelechargement: new Date(),
      },
    });

    const relativePath = attestation.urlPdf.startsWith("/")
      ? attestation.urlPdf.substring(1)
      : attestation.urlPdf;
    const absolutePath = path.join(__dirname, "../../public", relativePath);

    if (!isPdfFile(absolutePath)) {
      const certificateData = await generateCertificate(attestation.inscription);
      const regeneratedPath = path.join(
        __dirname,
        "../../public",
        certificateData.url.startsWith("/")
          ? certificateData.url.substring(1)
          : certificateData.url,
      );

      await prisma.attestation.update({
        where: { id },
        data: {
          urlPdf: certificateData.url,
        },
      });

      return res.download(
        regeneratedPath,
        `attestation-${attestation.numero}.pdf`,
      );
    }

    return res.download(absolutePath, `attestation-${attestation.numero}.pdf`);
  } catch (error) {
    console.error("Erreur lors du téléchargement de l'attestation:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Erreur inconnue";
    return sendError(
      res,
      500,
      "ATTESTATION_DOWNLOAD_ERROR",
      "Erreur lors du téléchargement de l'attestation",
      errorMessage,
    );
  }
};

/**
 * Générer et télécharger un PDF d'attestation à la volée
 */
export const genererPdfAttestation = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 401, "AUTH_REQUIRED", "Non autorisé");
    }

    const { id } = req.params;

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
      return sendError(
        res,
        404,
        "ATTESTATION_NOT_FOUND",
        "Attestation non trouvée",
      );
    }

    // Vérifier que l'utilisateur est bien le propriétaire
    if (attestation.inscription.utilisateurId !== req.user.id) {
      return sendError(
        res,
        403,
        "ATTESTATION_FORBIDDEN",
        "Non autorisé à accéder à cette attestation",
      );
    }

    // Générer le PDF à la volée
    const certificateData = await generateCertificate(attestation.inscription);

    // Mettre à jour le statut de l'attestation
    await prisma.attestation.update({
      where: { id },
      data: {
        statut: "TELECHARGEE",
        dateTelechargement: new Date(),
      },
    });

    // Renvoyer le PDF généré
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="attestation-${attestation.numero}.pdf"`,
    );

    // Si le service de certificat renvoie une URL, on récupère le fichier
    if (certificateData.url) {
      const filePath = path.join(
        __dirname,
        "../../public",
        certificateData.url.replace("/public", ""),
      );

      if (fs.existsSync(filePath)) {
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
      } else {
        return res.status(404).json({ message: "Fichier PDF non trouvé" });
      }
    } else {
      return res
        .status(500)
        .json({ message: "Format de certificat non supporté" });
    }
  } catch (error) {
    console.error("Erreur lors de la génération du PDF:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Erreur inconnue";
    return sendError(
      res,
      500,
      "ATTESTATION_PDF_ERROR",
      "Erreur lors de la génération du PDF",
      errorMessage,
    );
  }
};
