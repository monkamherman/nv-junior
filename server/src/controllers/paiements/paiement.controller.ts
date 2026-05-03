import { Formation, Paiement, PrismaClient, Utilisateur } from "@prisma/client";
import { Request, Response } from "express";
import { z } from "zod";
import { sendError, sendSuccess } from "../../core/errors/http";
import monetbilService, {
  MonetbilWebhookData,
} from "../../services/monetbil.service";
import { generatePaymentReceiptPdf } from "../../services/paymentReceipt.service";

const prisma = new PrismaClient();

// Type pour le paiement avec relations
type PaiementAvecRelations = Paiement & {
  formation: Formation;
  utilisateur: Utilisateur;
};

function serializePaiement(
  paiement: Paiement & {
    formation?: Partial<Formation> | null;
    utilisateur?: Partial<Utilisateur> | null;
  },
) {
  return {
    id: paiement.id,
    reference: paiement.reference,
    montant: paiement.montant,
    mode: paiement.mode,
    statut: paiement.statut,
    datePaiement: paiement.datePaiement,
    telephone: paiement.telephone,
    operateur: paiement.operateur,
    commentaire: paiement.commentaire,
    monetbilTransactionId: paiement.monetbilTransactionId,
    monetbilPaymentUrl: paiement.monetbilPaymentUrl,
    formation: paiement.formation
      ? {
          id: paiement.formation.id,
          titre: paiement.formation.titre,
          description: paiement.formation.description,
          prix: paiement.formation.prix,
        }
      : undefined,
    utilisateur: paiement.utilisateur
      ? {
          id: paiement.utilisateur.id,
          nom: paiement.utilisateur.nom,
          prenom: paiement.utilisateur.prenom,
          email: paiement.utilisateur.email,
        }
      : undefined,
  };
}

// Schéma de validation pour la création d'un paiement
const createPaiementSchema = z.object({
  formationId: z.string().min(1, "L'ID de la formation est requis"),
  montant: z.number().min(0, "Le montant doit être positif"),
  telephone: z.string().min(9, "Le numéro de téléphone est invalide"),
  operateur: z.enum(["ORANGE_MONEY", "MTN_MONEY"]),
  mode: z.enum(["ORANGE_MONEY", "MTN_MONEY", "CARTE", "ESPECES", "VIREMENT"]),
  code: z.string().optional(),
  commentaire: z.string().optional(),
});

/**
 * Crée un nouveau paiement avec intégration Monetbil
 * Flow complet: Création -> Appel Monetbil -> Retour URL de paiement
 */
export const creerPaiement = async (req: Request, res: Response) => {
  try {
    // Vérifier l'authentification
    if (!req.user) {
      return sendError(res, 401, "AUTH_REQUIRED", "Non autorisé");
    }

    // Valider les données de la requête
    console.log("[Paiement] Données reçues:", req.body);
    const validation = createPaiementSchema.safeParse(req.body);

    if (!validation.success) {
      return sendError(
        res,
        400,
        "PAYMENT_VALIDATION_ERROR",
        "Données invalides",
        validation.error.issues,
      );
    }

    const {
      formationId,
      montant,
      telephone,
      operateur,
      mode,
      code,
      commentaire,
    } = validation.data;
    const utilisateurId = req.user.id;

    // Vérifier si l'utilisateur et la formation existent
    console.log("[Paiement] Vérification utilisateur et formation...");
    const [utilisateur, formation] = await Promise.all([
      prisma.utilisateur.findUnique({ where: { id: utilisateurId } }),
      prisma.formation.findUnique({ where: { id: formationId } }),
    ]);

    if (!utilisateur) {
      return sendError(
        res,
        404,
        "PAYMENT_USER_NOT_FOUND",
        "Utilisateur non trouvé",
      );
    }

    if (!formation) {
      return sendError(
        res,
        404,
        "PAYMENT_FORMATION_NOT_FOUND",
        "Formation non trouvée",
      );
    }

    // Vérifier si l'utilisateur est déjà inscrit à cette formation
    const inscriptionExistante = await prisma.inscription.findFirst({
      where: { utilisateurId, formationId },
    });

    if (inscriptionExistante) {
      return sendError(
        res,
        400,
        "PAYMENT_ALREADY_ENROLLED",
        "Vous êtes déjà inscrit à cette formation. Vous pouvez accéder directement à votre attestation depuis votre espace.",
        { alreadyEnrolled: true },
      );
    }

    // Créer une référence unique pour le paiement
    const reference = `PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Créer le paiement en base avec statut EN_ATTENTE
    const paiement = await prisma.paiement.create({
      data: {
        reference,
        montant,
        mode,
        telephone,
        operateur,
        code: code || null,
        commentaire: commentaire || null,
        statut: "EN_ATTENTE",
        utilisateur: { connect: { id: utilisateurId } },
        formation: { connect: { id: formationId } },
      },
    });

    console.log("[Paiement] Paiement créé en base:", paiement.id);

    // Vérifier si Monetbil est configuré
    if (!monetbilService.isConfigured()) {
      console.warn(
        "[Paiement] Monetbil non configuré - mode simulation activé",
      );

      const paiementSimule = await prisma.paiement.update({
        where: { id: paiement.id },
        data: {
          statut: "VALIDE",
          mode: "SIMULATION",
          monetbilStatus: "simulation",
          commentaire:
            "Paiement validé automatiquement en mode simulation",
          datePaiement: new Date(),
        },
        include: {
          formation: true,
          utilisateur: true,
        },
      });

      await traiterPaiementValide(paiementSimule);

      return sendSuccess(
        res,
        {
          paiement: serializePaiement(paiementSimule),
          simulation: true,
        },
        "Paiement créé et validé en mode simulation",
        201,
      );
    }

    // Appeler l'API Monetbil pour créer le paiement
    console.log("[Paiement] Appel à l'API Monetbil...");
    const monetbilResponse = await monetbilService.createPayment(
      montant,
      telephone,
      reference,
      operateur,
      `Paiement formation: ${formation.titre}`,
    );

    if (!monetbilResponse.success) {
      // Mettre à jour le statut du paiement en cas d'échec
      await prisma.paiement.update({
        where: { id: paiement.id },
        data: {
          statut: "ECHEC",
          monetbilStatus: "failed",
          commentaire:
            monetbilResponse.error || "Erreur lors de l'appel Monetbil",
        },
      });

      return sendError(
        res,
        400,
        "PAYMENT_PROVIDER_INIT_ERROR",
        "Erreur lors de l'initialisation du paiement",
        {
          error: monetbilResponse.error,
          reference: paiement.reference,
        },
      );
    }

    // Mettre à jour le paiement avec les infos Monetbil
    const paiementAvecProvider = await prisma.paiement.update({
      where: { id: paiement.id },
      data: {
        statut: "EN_COURS",
        monetbilTransactionId: monetbilResponse.transaction_id,
        monetbilPaymentUrl: monetbilResponse.payment_url,
        monetbilStatus: "pending",
      },
      include: {
        formation: true,
        utilisateur: true,
      },
    });

    console.log("[Paiement] Paiement Monetbil créé avec succès:", {
      transactionId: monetbilResponse.transaction_id,
      paymentUrl: monetbilResponse.payment_url,
    });

    return sendSuccess(
      res,
      {
        paiement: serializePaiement(paiementAvecProvider),
        paymentUrl: monetbilResponse.payment_url,
        transactionId: monetbilResponse.transaction_id,
      },
      "Paiement initié avec succès",
      201,
    );
  } catch (error) {
    console.error("[Paiement] Erreur lors de la création:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Erreur inconnue";
    return sendError(
      res,
      500,
      "PAYMENT_CREATION_ERROR",
      "Erreur lors de la création du paiement",
      errorMessage,
    );
  }
};

/**
 * Récupère le statut d'un paiement
 */
export const getStatutPaiement = async (req: Request, res: Response) => {
  try {
    const { reference } = req.params;

    const paiement = await prisma.paiement.findUnique({
      where: { reference },
      include: {
        formation: {
          select: {
            id: true,
            titre: true,
            description: true,
            prix: true,
          },
        },
        utilisateur: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
          },
        },
      },
    });

    if (!paiement) {
      return sendError(
        res,
        404,
        "PAYMENT_NOT_FOUND",
        "Paiement non trouvé",
      );
    }

    // Vérifier que l'utilisateur est autorisé à voir ce paiement
    if (req.user?.role !== "ADMIN" && paiement.utilisateurId !== req.user?.id) {
      return sendError(
        res,
        403,
        "PAYMENT_FORBIDDEN",
        "Non autorisé à accéder à ce paiement",
      );
    }

    return sendSuccess(
      res,
      {
        paiement: serializePaiement(paiement),
      },
      "Statut du paiement récupéré",
    );
  } catch (error) {
    console.error(
      "Erreur lors de la récupération du statut du paiement:",
      error,
    );
    const errorMessage =
      error instanceof Error ? error.message : "Erreur inconnue";
    return sendError(
      res,
      500,
      "PAYMENT_STATUS_ERROR",
      "Erreur lors de la récupération du statut du paiement",
      errorMessage,
    );
  }
};

/**
 * Liste les paiements d'un utilisateur
 */
export const listerPaiementsUtilisateur = async (
  req: Request,
  res: Response,
) => {
  try {
    if (!req.user) {
      return sendError(res, 401, "AUTH_REQUIRED", "Non autorisé");
    }

    const utilisateurId = req.user.id;

    const paiements = await prisma.paiement.findMany({
      where: { utilisateurId },
      include: {
        formation: {
          select: {
            id: true,
            titre: true,
            description: true,
            prix: true,
          },
        },
      },
      orderBy: {
        datePaiement: "desc",
      },
    });

    return sendSuccess(
      res,
      {
        paiements: paiements.map((paiement) => serializePaiement(paiement)),
      },
      "Paiements récupérés",
    );
  } catch (error) {
    console.error("Erreur lors de la récupération des paiements:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Erreur inconnue";
    return sendError(
      res,
      500,
      "PAYMENT_LIST_ERROR",
      "Erreur lors de la récupération des paiements",
      errorMessage,
    );
  }
};

/**
 * Télécharge le reçu PDF d'un paiement
 */
export const telechargerRecuPaiement = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Non autorisé" });
    }

    const { id } = req.params;

    const paiement = await prisma.paiement.findUnique({
      where: { id },
      include: {
        formation: {
          select: { id: true, titre: true, prix: true },
        },
        utilisateur: {
          select: {
            id: true,
            prenom: true,
            nom: true,
            email: true,
            telephone: true,
          },
        },
      },
    });

    if (!paiement) {
      return res.status(404).json({ message: "Paiement non trouvé" });
    }

    if (req.user.role !== "ADMIN" && paiement.utilisateurId !== req.user.id) {
      return res.status(403).json({ message: "Accès refusé à ce reçu" });
    }

    const pdfBuffer = await generatePaymentReceiptPdf({
      ...paiement,
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="recu-${paiement.reference}.pdf"`,
    );
    return res.send(pdfBuffer);
  } catch (error) {
    console.error("Erreur lors du téléchargement du reçu:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Erreur inconnue";
    return res.status(500).json({
      message: "Erreur lors de la génération du reçu",
      error: errorMessage,
    });
  }
};

/**
 * Télécharger le reçu de paiement en format TXT
 */
export const telechargerRecuPaiementTxt = async (
  req: Request,
  res: Response,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Non autorisé" });
    }

    const { id } = req.params;

    const paiement = await prisma.paiement.findUnique({
      where: { id },
      include: {
        inscriptions: {
          include: {
            formation: true,
          },
        },
      },
    });

    if (!paiement) {
      return res.status(404).json({ message: "Paiement non trouvé" });
    }

    // Vérifier que l'utilisateur est bien le propriétaire
    if (paiement.utilisateurId !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Non autorisé à accéder à ce paiement" });
    }

    // Générer le contenu du reçu en format TXT
    const recuContent = `
╔══════════════════════════════════════════════════════════════════════════════╗
║                              REÇU DE PAIEMENT                               ║
╚══════════════════════════════════════════════════════════════════════════════╝

Date d'émission : ${new Date().toLocaleDateString("fr-FR")}
Référence       : ${paiement.reference}
Statut          : ${paiement.statut}

────────────────────────────────────────────────────────────────────────────────
DÉTAILS DU PAIEMENT
────────────────────────────────────────────────────────────────────────────────

Montant payé    : ${paiement.montant.toLocaleString("fr-FR")} FCFA
Méthode         : ${paiement.mode}
Téléphone       : ${paiement.telephone}
Date du paiement: ${paiement.datePaiement.toLocaleDateString("fr-FR")}

────────────────────────────────────────────────────────────────────────────────
FORMATION
────────────────────────────────────────────────────────────────────────────────

${paiement.inscriptions?.[0]?.formation?.titre || "Formation inconnue"}

────────────────────────────────────────────────────────────────────────────────
INFORMATIONS SUR L'ÉTUDIANT
────────────────────────────────────────────────────────────────────────────────

Nom complet     : ${req.user.prenom} ${req.user.nom}
Email          : ${req.user.email}
Téléphone      : ${req.user.telephone || "Non spécifié"}

────────────────────────────────────────────────────────────────────────────────
INFORMATIONS DE L'ORGANISME
────────────────────────────────────────────────────────────────────────────────

Nom            : CENTIC
Email          : contact@centic.com
Téléphone      : +225 00 00 00 00
Site web       : www.centic.com

────────────────────────────────────────────────────────────────────────────────
Mentions importantes
────────────────────────────────────────────────────────────────────────────────

• Ce reçu constitue la preuve de votre paiement
• Conservez-le précieusement pour toute réclamation
• Pour toute question, contactez notre service client
• Ce document a été généré électroniquement et est valide sans signature

╔══════════════════════════════════════════════════════════════════════════════╗
║                              MERCI POUR VOTRE CONFIANCE                      ║
╚══════════════════════════════════════════════════════════════════════════════╝
`.trim();

    // Définir les headers pour le téléchargement
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="recu-paiement-${paiement.reference}.txt"`,
    );

    res.send(recuContent);
  } catch (error) {
    console.error("Erreur lors du téléchargement du reçu:", error);
    res.status(500).json({
      message: "Erreur lors du téléchargement du reçu",
    });
  }
};

/**
 * Webhook Monetbil - Callback pour les notifications de paiement
 * Cette fonction est appelée par Monetbil après un paiement (succès ou échec)
 * Route publique (pas d'authentification requise - vérification par signature)
 */
export const monetbilWebhook = async (req: Request, res: Response) => {
  console.log("[Webhook Monetbil] Réception d'un callback:", req.body);

  try {
    const webhookData: MonetbilWebhookData = req.body;

    // Vérifier les données requises
    if (!webhookData.transaction_id || !webhookData.reference) {
      console.error("[Webhook Monetbil] Données manquantes:", webhookData);
      return res.status(400).json({ message: "Données de webhook invalides" });
    }

    // Vérifier la signature si présente (sécurité)
    if (webhookData.signature) {
      const isValid = monetbilService.verifyWebhookSignature(
        webhookData,
        webhookData.signature,
      );
      if (!isValid) {
        console.error("[Webhook Monetbil] Signature invalide");
        return res.status(401).json({ message: "Signature invalide" });
      }
    }

    // Trouver le paiement par référence
    const paiement = await prisma.paiement.findUnique({
      where: { reference: webhookData.reference },
      include: {
        formation: true,
        utilisateur: true,
      },
    });

    if (!paiement) {
      console.error(
        "[Webhook Monetbil] Paiement non trouvé:",
        webhookData.reference,
      );
      return res.status(404).json({ message: "Paiement non trouvé" });
    }

    console.log("[Webhook Monetbil] Statut reçu:", webhookData.status);

    // Mapper le statut Monetbil vers notre statut interne
    const statusMap: Record<
      string,
      "VALIDE" | "ECHEC" | "ANNULE" | "EN_COURS"
    > = {
      success: "VALIDE",
      completed: "VALIDE",
      failed: "ECHEC",
      cancelled: "ANNULE",
      pending: "EN_COURS",
    };

    const nouveauStatut =
      statusMap[webhookData.status.toLowerCase()] || "EN_COURS";

    // Mettre à jour le paiement
    await prisma.paiement.update({
      where: { id: paiement.id },
      data: {
        statut: nouveauStatut,
        monetbilStatus: webhookData.status,
        monetbilTransactionId: webhookData.transaction_id,
        monetbilPhone: webhookData.phone,
        monetbilOperator: webhookData.operator,
        datePaiement:
          nouveauStatut === "VALIDE" ? new Date() : paiement.datePaiement,
      },
    });

    console.log("[Webhook Monetbil] Paiement mis à jour:", nouveauStatut);

    // Si le paiement est validé, créer l'inscription et potentiellement l'attestation
    if (nouveauStatut === "VALIDE") {
      await traiterPaiementValide(paiement);
    }

    // Répondre à Monetbil pour confirmer la réception
    res.status(200).json({
      message: "Webhook traité avec succès",
      reference: paiement.reference,
      statut: nouveauStatut,
    });
  } catch (error) {
    console.error("[Webhook Monetbil] Erreur:", error);
    res.status(500).json({
      message: "Erreur lors du traitement du webhook",
      error: error instanceof Error ? error.message : "Erreur inconnue",
    });
  }
};

/**
 * Traite un paiement validé: crée l'inscription et l'attestation si nécessaire
 */
async function traiterPaiementValide(paiement: PaiementAvecRelations) {
  try {
    console.log("[Paiement] Traitement du paiement validé:", paiement.id);

    // Vérifier si une inscription existe déjà
    const inscriptionExistante = await prisma.inscription.findFirst({
      where: {
        utilisateurId: paiement.utilisateurId,
        formationId: paiement.formationId,
      },
    });

    if (inscriptionExistante) {
      console.log(
        "[Paiement] Inscription existante trouvée - mise à jour du statut",
      );
      await prisma.inscription.update({
        where: { id: inscriptionExistante.id },
        data: {
          statut: "VALIDEE",
          paiementId: paiement.id,
        },
      });
      return;
    }

    // Créer l'inscription
    const inscription = await prisma.inscription.create({
      data: {
        dateInscription: new Date(),
        statut: "VALIDEE",
        utilisateur: { connect: { id: paiement.utilisateurId } },
        formation: { connect: { id: paiement.formationId } },
        paiement: { connect: { id: paiement.id } },
      },
    });

    console.log("[Paiement] Inscription créée:", inscription.id);

    // Vérifier si la formation est terminée pour générer l'attestation
    const maintenant = new Date();
    const dateFinFormation = new Date(paiement.formation.dateFin);

    if (maintenant >= dateFinFormation) {
      console.log(
        "[Paiement] Formation terminée - génération de l'attestation",
      );
      await genererAttestation(paiement, inscription);
    }
  } catch (error) {
    console.error(
      "[Paiement] Erreur lors du traitement du paiement validé:",
      error,
    );
    throw error;
  }
}

/**
 * Génère une attestation pour un paiement validé
 */
async function genererAttestation(
  paiement: PaiementAvecRelations,
  inscription: { id: string },
) {
  try {
    const { generateCertificate } = await import(
      "../../services/certificateService"
    );

    // Récupérer l'inscription complète avec les relations
    const inscriptionComplete = await prisma.inscription.findUnique({
      where: { id: inscription.id },
      include: {
        utilisateur: true,
        formation: true,
      },
    });

    if (!inscriptionComplete) {
      console.error("[Paiement] Inscription non trouvée pour l'attestation");
      return;
    }

    const certificateData = await generateCertificate(inscriptionComplete);

    // Créer l'attestation
    await prisma.attestation.create({
      data: {
        numero: `ATT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        urlPdf: certificateData.url,
        statut: "GENEREE",
        dateEmission: new Date(),
        utilisateur: { connect: { id: paiement.utilisateurId } },
        formation: { connect: { id: paiement.formationId } },
        inscription: { connect: { id: inscription.id } },
      },
    });

    console.log("[Paiement] Attestation générée avec succès");
  } catch (error) {
    console.error(
      "[Paiement] Erreur lors de la génération de l'attestation:",
      error,
    );
  }
}

/**
 * Vérifie manuellement le statut d'un paiement Monetbil
 * Utile pour les cas où le webhook n'a pas été reçu
 */
export const verifierStatutMonetbil = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Non autorisé" });
    }

    const { reference } = req.params;

    const paiement = await prisma.paiement.findUnique({
      where: { reference },
    });

    if (!paiement) {
      return res.status(404).json({ message: "Paiement non trouvé" });
    }

    // Vérifier l'autorisation
    if (req.user.role !== "ADMIN" && paiement.utilisateurId !== req.user.id) {
      return res.status(403).json({ message: "Non autorisé" });
    }

    // Si pas de transaction Monetbil, retourner le statut actuel
    if (!paiement.monetbilTransactionId) {
      return res.json({
        message: "Paiement sans transaction Monetbil",
        statut: paiement.statut,
        reference: paiement.reference,
      });
    }

    // Vérifier le statut auprès de Monetbil
    console.log(
      "[Paiement] Vérification statut Monetbil:",
      paiement.monetbilTransactionId,
    );
    const statusMonetbil = await monetbilService.checkTransactionStatus(
      paiement.monetbilTransactionId,
    );

    if (!statusMonetbil) {
      return res.json({
        message: "Impossible de récupérer le statut Monetbil",
        statut: paiement.statut,
        reference: paiement.reference,
      });
    }

    // Mettre à jour le statut si différent
    const statusMap: Record<
      string,
      "VALIDE" | "ECHEC" | "ANNULE" | "EN_COURS"
    > = {
      success: "VALIDE",
      completed: "VALIDE",
      failed: "ECHEC",
      cancelled: "ANNULE",
      pending: "EN_COURS",
    };

    const nouveauStatut = statusMap[statusMonetbil.status] || paiement.statut;

    if (nouveauStatut !== paiement.statut) {
      await prisma.paiement.update({
        where: { id: paiement.id },
        data: {
          statut: nouveauStatut,
          monetbilStatus: statusMonetbil.status,
          monetbilPhone: statusMonetbil.phone,
          monetbilOperator: statusMonetbil.operator,
        },
      });

      // Si validé, traiter
      if (nouveauStatut === "VALIDE") {
        const paiementComplet = await prisma.paiement.findUnique({
          where: { id: paiement.id },
          include: { formation: true, utilisateur: true },
        });
        if (paiementComplet) {
          await traiterPaiementValide(paiementComplet);
        }
      }
    }

    res.json({
      message: "Statut vérifié",
      reference: paiement.reference,
      statut: nouveauStatut,
      statutMonetbil: statusMonetbil.status,
      transactionId: paiement.monetbilTransactionId,
    });
  } catch (error) {
    console.error("[Paiement] Erreur vérification statut:", error);
    res.status(500).json({
      message: "Erreur lors de la vérification du statut",
      error: error instanceof Error ? error.message : "Erreur inconnue",
    });
  }
};

/**
 * Annule un paiement en cours
 */
export const annulerPaiement = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Non autorisé" });
    }

    const { reference } = req.params;

    const paiement = await prisma.paiement.findUnique({
      where: { reference },
    });

    if (!paiement) {
      return res.status(404).json({ message: "Paiement non trouvé" });
    }

    // Vérifier l'autorisation
    if (paiement.utilisateurId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Non autorisé" });
    }

    // Vérifier si le paiement peut être annulé
    if (paiement.statut === "VALIDE") {
      return res.status(400).json({
        message: "Ce paiement est déjà validé et ne peut pas être annulé",
      });
    }

    // Mettre à jour le statut
    await prisma.paiement.update({
      where: { id: paiement.id },
      data: {
        statut: "ANNULE",
        monetbilStatus: "cancelled",
      },
    });

    res.json({
      message: "Paiement annulé avec succès",
      reference: paiement.reference,
      statut: "ANNULE",
    });
  } catch (error) {
    console.error("[Paiement] Erreur annulation:", error);
    res.status(500).json({
      message: "Erreur lors de l'annulation du paiement",
      error: error instanceof Error ? error.message : "Erreur inconnue",
    });
  }
};
