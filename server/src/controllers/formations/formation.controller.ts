import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import sendMail from "../../nodemailer/sendmail";
import * as pdfService from "../../services/pdfService";
const prisma = new PrismaClient();

// Simulation de paiement
export async function simulatePayment(req: Request, res: Response) {
  const { formationId, userId, montant } = req.body;

  try {
    // Validation des ObjectID MongoDB (24 caractères hexadécimaux)
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;

    if (!objectIdRegex.test(formationId)) {
      return res.status(400).json({
        success: false,
        message: "ID de formation invalide",
      });
    }

    if (!objectIdRegex.test(userId)) {
      return res.status(400).json({
        success: false,
        message: "ID d'utilisateur invalide",
      });
    }

    // Vérifier si la formation existe
    const formation = await prisma.formation.findUnique({
      where: { id: formationId },
    });

    if (!formation) {
      return res.status(404).json({
        success: false,
        message: "Formation non trouvée",
      });
    }

    // Vérifier si l'utilisateur existe
    const utilisateur = await prisma.utilisateur.findUnique({
      where: { id: userId },
    });

    if (!utilisateur) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé",
      });
    }

    // Créer le paiement en base de données
    const paiement = await prisma.paiement.create({
      data: {
        reference: `TXN-${Date.now()}`,
        montant: montant || formation.prix,
        mode: "SIMULATION",
        statut: "VALIDE",
        telephone: utilisateur.telephone || "0000000000",
        operateur: "SIMULATION",
        code: `SIM-${Date.now()}`,
        commentaire: "Paiement simulé avec succès",
        utilisateurId: userId,
        formationId: formationId,
      },
    });

    // Créer l'inscription associée
    const inscription = await prisma.inscription.create({
      data: {
        statut: "VALIDEE",
        utilisateurId: userId,
        formationId: formationId,
        paiementId: paiement.id,
      },
    });

    const paymentResult = {
      success: true,
      transactionId: paiement.reference,
      paiementId: paiement.id,
      inscriptionId: inscription.id,
      montant: paiement.montant,
      methode: "SIMULATION",
      formationId,
      userId,
      date: paiement.datePaiement,
      message: "Paiement simulé et enregistré avec succès",
    };

    console.log(
      `Paiement simulé et enregistré pour formation ${formationId}, utilisateur ${userId}`
    );

    res.json(paymentResult);
  } catch (error) {
    console.error("Erreur lors de la simulation de paiement:", error);
    console.error(
      "Détails de l'erreur:",
      error instanceof Error ? error.message : String(error)
    );
    console.error(
      "Stack trace:",
      error instanceof Error ? error.stack : "No stack trace"
    );

    res.status(500).json({
      success: false,
      message: "Erreur lors du traitement du paiement",
      error:
        process.env.NODE_ENV === "development"
          ? error instanceof Error
            ? error.message
            : String(error)
          : undefined,
    });
  }
}

// Génération d'attestation
export async function generateAttestation(req: Request, res: Response) {
  const { formationId, userId } = req.body;

  try {
    // Validation des ObjectID MongoDB (24 caractères hexadécimaux)
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;

    if (!objectIdRegex.test(formationId)) {
      return res.status(400).json({
        message: "ID de formation invalide",
      });
    }

    if (!objectIdRegex.test(userId)) {
      return res.status(400).json({
        message: "ID d'utilisateur invalide",
      });
    }

    // Vérifier si l'utilisateur a une inscription validée pour cette formation
    const inscription = await prisma.inscription.findFirst({
      where: {
        utilisateurId: userId,
        formationId: formationId,
        statut: "VALIDEE",
      },
      include: {
        utilisateur: true,
        formation: true,
      },
    });

    if (!inscription) {
      return res.status(400).json({
        message: "Aucune inscription validée trouvée pour cette formation",
      });
    }

    // Vérifier si une attestation existe déjà pour cette inscription
    const existingAttestation = await prisma.attestation.findFirst({
      where: {
        inscriptionId: inscription.id,
      },
    });

    if (existingAttestation) {
      return res.status(400).json({
        message: "Une attestation a déjà été générée pour cette formation",
        attestation: existingAttestation,
      });
    }

    // Générer un numéro d'attestation unique
    const numeroAttestation = `ATT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Créer l'attestation en base de données
    const attestation = await prisma.attestation.create({
      data: {
        numero: numeroAttestation,
        urlPdf: `/attestations/${numeroAttestation}.pdf`,
        statut: "GENEREE",
        utilisateurId: userId,
        formationId: formationId,
        inscriptionId: inscription.id,
      },
    });

    // Générer le fichier PDF
    try {
      await pdfService.generateAttestationPDF(attestation, inscription);
      console.log(`PDF généré pour l'attestation ${numeroAttestation}`);
    } catch (pdfError) {
      console.error("Erreur lors de la génération du PDF:", pdfError);
      // Ne pas échouer la requête si le PDF ne se génère pas
    }

    const attestationResult = {
      id: attestation.id,
      numero: attestation.numero,
      formationId,
      userId,
      participant: {
        nom: inscription.utilisateur.nom,
        prenom: inscription.utilisateur.prenom,
      },
      formation: {
        titre: inscription.formation.titre,
        description: inscription.formation.description,
      },
      dateGeneration: attestation.dateEmission,
      statut: attestation.statut,
      message: "Attestation générée et enregistrée avec succès",
    };

    console.log(
      `Attestation générée et enregistrée pour formation ${formationId}, utilisateur ${userId}`
    );

    // Envoyer l'attestation par email
    try {
      const emailContent = `
        Félicitations ${inscription.utilisateur.prenom} ${inscription.utilisateur.nom} !

        Votre attestation de formation a été générée avec succès.

        Détails de la formation:
        - Formation: ${inscription.formation.titre}
        - Description: ${inscription.formation.description}
        - Numéro d'attestation: ${numeroAttestation}
        - Date de génération: ${new Date().toLocaleDateString("fr-FR")}

        Votre attestation est disponible dans votre espace personnel.
        
        Cordialement,
        L'équipe de CENTIC
      `;

      const emailResult = await sendMail(
        inscription.utilisateur.email,
        emailContent
      );

      if (emailResult.success) {
        console.log(
          `Email envoyé avec succès à ${inscription.utilisateur.email}, messageId: ${emailResult.messageId}`
        );
      } else {
        console.error(
          `Erreur lors de l'envoi de l'email: ${emailResult.error}`
        );
      }
    } catch (emailError) {
      console.error("Erreur lors de l'envoi de l'email:", emailError);
      // Ne pas échouer la requête si l'email ne s'envoie pas
    }

    res.json(attestationResult);
  } catch (error) {
    console.error("Erreur lors de la génération de l'attestation:", error);
    res.status(500).json({
      message: "Erreur lors de la génération de l'attestation",
    });
  }
}
