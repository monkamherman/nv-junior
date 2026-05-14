import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { sendError, sendSuccess } from "../../core/errors/http";
import sendMail from "../../nodemailer/sendmail";
import { generateCertificate } from "../../services/certificateService";
import { getPaymentProgress } from "../../services/paymentProgress.service";

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
    const paymentStatus = await getPaymentProgress(req.user.id, formationId);

    if (!paymentStatus) {
      return sendError(
        res,
        404,
        "ATTESTATION_FORMATION_NOT_FOUND",
        "Formation non trouvée",
      );
    }

    const inscription = await prisma.inscription.findFirst({
      where: {
        utilisateurId: req.user.id,
        formationId,
      },
      include: {
        attestation: true,
      },
    });

    if (inscription?.attestation) {
      return sendSuccess(res, {
        eligible: false,
        canMakePayment: false,
        canGenerateAttestation: false,
        reason: "Attestation déjà disponible",
        attestation: inscription.attestation,
        paymentStatus,
      });
    }

    if (paymentStatus.isFullyPaid) {
      if (!paymentStatus.formationEnded) {
        return sendSuccess(res, {
          eligible: false,
          canMakePayment: false,
          canGenerateAttestation: false,
          reason:
            "Le paiement est complet, mais l'attestation ne sera disponible qu'à la fin de la formation.",
          paymentStatus,
          inscription: inscription
            ? {
                id: inscription.id,
                dateInscription: inscription.dateInscription,
              }
            : undefined,
        });
      }

      return sendSuccess(res, {
        eligible: true,
        canMakePayment: false,
        canGenerateAttestation: true,
        reason:
          "Paiement complet effectué. Vous pouvez maintenant générer votre attestation.",
        paymentStatus,
        inscription: inscription
          ? {
              id: inscription.id,
              dateInscription: inscription.dateInscription,
            }
          : undefined,
      });
    }

    if (paymentStatus.hasPendingPayment) {
      return sendSuccess(res, {
        eligible: false,
        canMakePayment: false,
        canGenerateAttestation: false,
        reason: "Un paiement est déjà en cours de traitement.",
        paymentStatus,
      });
    }

    const reason =
      paymentStatus.paidAmount > 0
        ? `Paiement partiel enregistré. Reste à payer : ${paymentStatus.remainingAmount.toLocaleString("fr-FR")} FCFA.`
        : undefined;

    return sendSuccess(res, {
      eligible: true,
      canMakePayment: true,
      canGenerateAttestation: false,
      reason,
      paymentStatus,
      inscription: inscription
        ? {
            id: inscription.id,
            dateInscription: inscription.dateInscription,
          }
        : undefined,
    });
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

    const inscription = await prisma.inscription.findFirst({
      where: {
        utilisateurId: req.user.id,
        formationId,
      },
      include: {
        paiement: true,
        formation: true,
        utilisateur: true,
        attestation: true,
      },
    });

    const paymentStatus = await getPaymentProgress(req.user.id, formationId);

    console.log("Inscription trouvée:", !!inscription);
    console.log("Statut de paiement cumulé:", paymentStatus);

    if (!inscription || !paymentStatus) {
      console.log("Inscription non trouvée");
      return sendError(
        res,
        404,
        "ATTESTATION_ENROLLMENT_NOT_FOUND",
        "Inscription non trouvée pour cette formation",
      );
    }

    if (!paymentStatus.isFullyPaid) {
      return sendError(
        res,
        400,
        "ATTESTATION_PAYMENT_INCOMPLETE",
        "Le paiement complet de la formation est requis avant de générer l'attestation.",
        paymentStatus,
      );
    }

    if (inscription.attestation) {
      console.log(
        "Attestation existe déjà - retour de l'attestation existante",
      );
      return sendSuccess(
        res,
        { attestation: inscription.attestation, paymentStatus },
        "Attestation déjà disponible",
      );
    }

    const maintenant = new Date();
    const dateFinFormation = new Date(inscription.formation.dateFin);

    if (maintenant < dateFinFormation) {
      console.log("Formation non terminée - date fin:", dateFinFormation);
      return sendError(
        res,
        400,
        "ATTESTATION_FORMATION_NOT_FINISHED",
        "La formation n'est pas encore terminée",
        paymentStatus,
      );
    }

    const certificateData = await generateCertificate(inscription);

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
    }

    return sendSuccess(
      res,
      { attestation, paymentStatus },
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

    if (attestation.inscription.utilisateurId !== req.user.id) {
      return sendError(
        res,
        403,
        "ATTESTATION_FORBIDDEN",
        "Non autorisé à accéder à cette attestation",
      );
    }

    const paymentStatus = await getPaymentProgress(
      req.user.id,
      attestation.formationId,
    );

    if (!paymentStatus?.isFullyPaid) {
      return sendError(
        res,
        400,
        "ATTESTATION_PAYMENT_INCOMPLETE",
        "Le paiement complet de la formation est requis avant le téléchargement de l'attestation.",
        paymentStatus,
      );
    }

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
      const certificateData = await generateCertificate(
        attestation.inscription,
      );
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
  console.log("=== DÉBUT DU PROCESSUS DE GÉNÉRATION PDF ===");
  console.log("1. Vérification de l'authentification");

  try {
    if (!req.user) {
      console.log("❌ ERREUR: Utilisateur non authentifié");
      return sendError(res, 401, "AUTH_REQUIRED", "Non autorisé");
    }

    console.log("✅ Utilisateur authentifié:", req.user.id, req.user.email);

    const { id } = req.params;
    console.log("2. Récupération de l'attestation avec ID:", id);

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
      console.log("❌ ERREUR: Attestation non trouvée");
      return sendError(
        res,
        404,
        "ATTESTATION_NOT_FOUND",
        "Attestation non trouvée",
      );
    }

    console.log("✅ Attestation trouvée:", attestation.numero);
    console.log("   - URL PDF stockée:", attestation.urlPdf);
    console.log(
      "   - Propriétaire:",
      attestation.inscription.utilisateur.email,
    );
    console.log("   - Formation:", attestation.inscription.formation.titre);

    if (attestation.inscription.utilisateurId !== req.user.id) {
      console.log("❌ ERREUR: Utilisateur non autorisé");
      return sendError(
        res,
        403,
        "ATTESTATION_FORBIDDEN",
        "Non autorisé à accéder à cette attestation",
      );
    }

    console.log("3. Vérification du statut de paiement");
    const paymentStatus = await getPaymentProgress(
      req.user.id,
      attestation.formationId,
    );

    console.log("   - Statut de paiement:", paymentStatus);
    console.log("   - Paiement complet:", paymentStatus?.isFullyPaid);

    if (!paymentStatus?.isFullyPaid) {
      console.log("❌ ERREUR: Paiement incomplet");
      return sendError(
        res,
        400,
        "ATTESTATION_PAYMENT_INCOMPLETE",
        "Le paiement complet de la formation est requis avant le téléchargement de l'attestation.",
        paymentStatus,
      );
    }

    console.log("4. Génération du certificat PDF");
    const certificateData = await generateCertificate(attestation.inscription);

    console.log("✅ Certificat généré:", certificateData.url);

    await prisma.attestation.update({
      where: { id },
      data: {
        statut: "TELECHARGEE",
        dateTelechargement: new Date(),
      },
    });

    console.log("5. Configuration des headers HTTP");
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="attestation-${attestation.numero}.pdf"`,
    );

    if (certificateData.url) {
      // Nettoyer l'URL pour obtenir le chemin relatif correct
      const relativePath = certificateData.url.startsWith("/")
        ? certificateData.url.substring(1)
        : certificateData.url;
      // Corriger le chemin : remonter de src/controllers/attestations/ à la racine, puis aller dans public/
      const filePath = path.join(__dirname, "../../../public", relativePath);

      console.log("6. Vérification du fichier PDF");
      console.log("   - Chemin du fichier:", filePath);
      console.log("   - Le fichier existe:", fs.existsSync(filePath));

      if (fs.existsSync(filePath)) {
        console.log("✅ Envoi du fichier PDF au client");
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
        fileStream.on("end", () => {
          console.log("=== FIN DU PROCESSUS - SUCCÈS ===");
        });
      } else {
        console.log("❌ ERREUR: Fichier PDF non trouvé");
        return res.status(404).json({ message: "Fichier PDF non trouvé" });
      }
    } else {
      console.log("❌ ERREUR: URL du certificat non disponible");
      return res
        .status(500)
        .json({ message: "Format de certificat non supporté" });
    }
  } catch (error) {
    console.error("❌ ERREUR lors de la génération du PDF:", error);
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
