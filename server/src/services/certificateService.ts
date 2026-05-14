import type { Inscription } from "@prisma/client";
import { PrismaClient } from "@prisma/client";
import { format } from "date-fns";
import { fr } from "date-fns/locale/fr";
import { createWriteStream } from "fs";
import fs from "fs";
import { join } from "path";
import PDFDocument from "pdfkit";

const prisma = new PrismaClient();

interface CertificateData {
  content: string;
  url: string;
}

interface InscriptionWithRelations
  extends Omit<Inscription, "dateInscription"> {
  utilisateur: {
    nom: string;
    prenom: string;
  };
  formation: {
    titre: string;
    duree?: number;
    dateDebut: Date | string;
    dateFin: Date | string;
  };
  dateInscription: Date; // Garder le type Date pour correspondre au modèle Prisma
}

export function generateCertificate(
  inscription: InscriptionWithRelations,
): Promise<CertificateData> {
  return new Promise((resolve, reject) => {
    try {
      const { utilisateur, formation } = inscription;

      // Créer un nouveau document PDF avec des marges réduites
      const doc = new PDFDocument({
        size: "A4",
        layout: "landscape",
        margin: 40,
      });

      // Générer un nom de fichier unique
      const fileName = `attestation-${inscription.id}-${Date.now()}.pdf`;
      const filePath = join(__dirname, "../../public/certificates", fileName);
      const fileUrl = `/certificates/${fileName}`;

      fs.mkdirSync(join(__dirname, "../../public/certificates"), {
        recursive: true,
      });

      // Créer un flux d'écriture vers le fichier
      const stream = createWriteStream(filePath);

      // Configurer le document PDF
      doc.pipe(stream);

      // Ajouter un fond de page dégradé
      const gradient = doc
        .linearGradient(0, 0, doc.page.width, doc.page.height)
        .stop(0, "#f0f9ff")
        .stop(1, "#e0f2fe");
      doc.rect(0, 0, doc.page.width, doc.page.height).fill(gradient);

      // Ajouter une bordure décorative plus fine
      doc
        .rect(20, 20, doc.page.width - 40, doc.page.height - 40)
        .lineWidth(2)
        .strokeColor("#0284c7")
        .stroke();

      doc
        .rect(25, 25, doc.page.width - 50, doc.page.height - 50)
        .lineWidth(1)
        .strokeColor("#0ea5e9")
        .stroke();

      // En-tête avec titre réduit
      doc
        .fill("#0c4a6e")
        .fontSize(24)
        .font("Helvetica-Bold")
        .text("ATTESTATION DE FORMATION", { align: "center", underline: true })
        .moveDown(0.3);

      // Nom de la structure avec police réduite
      doc
        .fontSize(14)
        .font("Helvetica-Bold")
        .fill("#0284c7")
        .text("CENTIC - CENTRE D'EXCELLENCE NUMÉRIQUE ET DE COMMUNICATION", {
          align: "center",
        })
        .moveDown(0.5);

      // Sous-titre
      doc
        .fontSize(11)
        .font("Helvetica")
        .fill("#475569")
        .text("Certificat de réussite", { align: "center" })
        .moveDown(1);

      // Corps de l'attestation avec police réduite
      doc
        .fontSize(12)
        .font("Helvetica")
        .fill("#334155")
        .text("Le soussigné, Directeur des études du CENTIC,", {
          align: "right",
        })
        .moveDown(0.5)
        .text("Certifie par la présente que :", { align: "center" })
        .moveDown(0.5);

      // Nom de l'étudiant en évidence avec police réduite
      doc
        .fontSize(20)
        .font("Helvetica-Bold")
        .fill("#0f172a")
        .text(
          `${utilisateur.prenom.toUpperCase()} ${utilisateur.nom.toUpperCase()}`,
          { align: "center" },
        )
        .moveDown(0.5);

      // Détails de la formation avec police réduite
      doc
        .fontSize(11)
        .font("Helvetica")
        .fill("#334155")
        .text(
          "a suivi avec succès et accompli toutes les exigences de la formation intitulée :",
          { align: "center" },
        )
        .moveDown(0.5);

      doc
        .fontSize(16)
        .font("Helvetica-Bold")
        .fill("#0284c7")
        .text(`« ${formation.titre.toUpperCase()} »`, { align: "center" })
        .moveDown(0.3);

      // Description de la formation
      if (formation.description) {
        doc
          .fontSize(9)
          .font("Helvetica-Oblique")
          .fill("#64748b")
          .text(formation.description, { align: "center" })
          .moveDown(0.5);
      }

      // Période et durée avec police réduite
      const dateDebut = format(new Date(formation.dateDebut), "dd MMMM yyyy", {
        locale: fr,
      });
      const dateFin = format(new Date(formation.dateFin), "dd MMMM yyyy", {
        locale: fr,
      });
      const duree = Math.ceil(
        (new Date(formation.dateFin).getTime() -
          new Date(formation.dateDebut).getTime()) /
          (1000 * 60 * 60 * 24),
      );

      doc
        .fontSize(11)
        .font("Helvetica")
        .fill("#334155")
        .text(`s'étant déroulée du ${dateDebut} au ${dateFin}`, {
          align: "center",
        })
        .moveDown(0.3)
        .text(`soit une durée de ${duree} jours`, { align: "center" })
        .moveDown(1);

      // Compétences acquises simplifiées
      doc
        .fontSize(10)
        .font("Helvetica-Oblique")
        .fill("#64748b")
        .text(
          "Cette formation a permis au participant d'acquérir les compétences nécessaires",
          { align: "center" },
        )
        .moveDown(1);

      // Mentions officielles
      doc
        .fontSize(10)
        .font("Helvetica")
        .fill("#475569")
        .text("Fait pour servir et valoir ce que de droit.", {
          align: "center",
        })
        .moveDown(1);

      // Signature et date
      const dateEmission = format(new Date(), "dd MMMM yyyy", { locale: fr });
      doc
        .fontSize(10)
        .font("Helvetica")
        .fill("#334155")
        .text(`Fait à Maroua, le ${dateEmission}`, { align: "right" })
        .moveDown(1);

      // Zone de signature
      doc
        .fontSize(10)
        .text("Le Directeur des études du CENTIC", { align: "right" })
        .moveDown(0.3)
        .text("_________________________", { align: "right" })
        .moveDown(0.3)
        .fontSize(9)
        .text("FALANG MOUYEBE Emmanuel", { align: "right" })
        .font("Helvetica-Oblique")
        .text("Directeur Académique", { align: "right" });

      // Ajouter un sceau/watermark réduit
      doc.save();
      doc.translate(doc.page.width / 2, doc.page.height / 2);
      doc.rotate(-45);
      doc
        .fontSize(36)
        .font("Helvetica-Bold")
        .fillOpacity(0.08)
        .fill("#0284c7")
        .text("CENTIC - CERTIFIÉ", { align: "center" });
      doc.restore();

      // Pied de page simplifié
      doc.fontSize(8);
      doc.fill("#64748b");
      const footerY = doc.page.height - 25;
      doc.text(
        "CENTIC - CENTRE D'EXCELLENCE NUMÉRIQUE ET DE COMMUNICATION",
        50,
        footerY,
        { align: "center" },
      );
      doc.text("Maroua, Cameroun - www.centic.cm", 50, footerY + 12, {
        align: "center",
      });

      // Numéro de l'attestation
      const numeroAttestation = `ATT-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      doc.text(`N°: ${numeroAttestation}`, doc.page.width - 50, footerY, {
        align: "right",
      });

      // Finaliser le document
      doc.end();

      // Attendre que l'écriture soit terminée
      stream.on("finish", () => {
        resolve({
          content: `Attestation de formation pour ${utilisateur.prenom} ${utilisateur.nom} - ${formation.titre}`,
          url: fileUrl,
        });
      });
    } catch (error) {
      console.error("Erreur lors de la génération du certificat:", error);
      reject(error);
    }
  });
}

// Vérifier si un utilisateur a le droit de télécharger une attestation
export async function canDownloadCertificate(
  userId: string,
  certificateId: string,
): Promise<boolean> {
  try {
    const attestation = await prisma.attestation.findUnique({
      where: { id: certificateId },
      include: {
        inscription: {
          select: {
            utilisateurId: true,
          },
        },
      },
    });

    // Vérifier si l'utilisateur est le propriétaire de l'attestation ou un administrateur
    const user = await prisma.utilisateur.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    return (
      attestation?.inscription.utilisateurId === userId ||
      user?.role === "ADMIN" ||
      user?.role === "FORMATEUR"
    );
  } catch (error) {
    console.error(
      "Erreur lors de la vérification des droits de téléchargement:",
      error,
    );
    return false;
  }
}
