import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";

interface Attestation {
  numero: string;
  dateEmission: Date;
  statut: string;
}

interface Inscription {
  utilisateur: {
    prenom: string;
    nom: string;
    email: string;
  };
  formation: {
    titre: string;
    description: string;
    dateDebut: Date;
    dateFin: Date;
  };
}

export const generateAttestationPDF = async (
  attestation: Attestation,
  inscription: Inscription
) => {
  const pdfPath = path.join(
    __dirname,
    "../../public/attestations",
    `${attestation.numero}.pdf`
  );

  // Créer le répertoire s'il n'existe pas
  const attestationsDir = path.dirname(pdfPath);
  if (!fs.existsSync(attestationsDir)) {
    fs.mkdirSync(attestationsDir, { recursive: true });
  }

  await new Promise<void>((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
    });

    const stream = fs.createWriteStream(pdfPath);
    doc.pipe(stream);

    const participant = `${inscription.utilisateur.prenom} ${inscription.utilisateur.nom}`;
    const dateDebut = new Date(inscription.formation.dateDebut).toLocaleDateString(
      "fr-FR"
    );
    const dateFin = new Date(inscription.formation.dateFin).toLocaleDateString(
      "fr-FR"
    );
    const dateEmission = new Date(attestation.dateEmission).toLocaleDateString(
      "fr-FR"
    );

    doc
      .rect(24, 24, doc.page.width - 48, doc.page.height - 48)
      .lineWidth(2)
      .strokeColor("#2563eb")
      .stroke();

    doc
      .font("Helvetica-Bold")
      .fontSize(24)
      .fillColor("#1d4ed8")
      .text("ATTESTATION DE FORMATION", { align: "center" });

    doc
      .moveDown(0.4)
      .fontSize(13)
      .fillColor("#334155")
      .text("CENTIC - Centre de Formation Professionnelle", {
        align: "center",
      });

    doc.moveDown(2);

    doc
      .font("Helvetica")
      .fontSize(12)
      .fillColor("#111827")
      .text(
        "Le soussigne, Directeur du Centre de Formation Professionnelle CENTIC, certifie par la presente que :",
        { align: "left" }
      );

    doc.moveDown(1.5);

    doc
      .font("Helvetica-Bold")
      .fontSize(22)
      .fillColor("#0f172a")
      .text(participant, { align: "center" });

    doc.moveDown(1.2);

    doc
      .font("Helvetica")
      .fontSize(12)
      .fillColor("#111827")
      .text("a suivi avec succes la formation :", { align: "center" });

    doc
      .moveDown(0.8)
      .font("Helvetica-Bold")
      .fontSize(18)
      .fillColor("#1d4ed8")
      .text(inscription.formation.titre, { align: "center" });

    doc.moveDown(1.5);

    doc
      .font("Helvetica")
      .fontSize(12)
      .fillColor("#111827")
      .text(`Description : ${inscription.formation.description || "-"}`)
      .moveDown(0.5)
      .text(`Periode : du ${dateDebut} au ${dateFin}`)
      .moveDown(0.5)
      .text(`Email : ${inscription.utilisateur.email}`)
      .moveDown(1)
      .text(`Numero d'attestation : ${attestation.numero}`)
      .moveDown(0.5)
      .text(`Date d'emission : ${dateEmission}`)
      .moveDown(0.5)
      .text(`Statut : ${attestation.statut}`);

    doc.moveDown(3);

    doc
      .font("Helvetica-Oblique")
      .fontSize(11)
      .fillColor("#475569")
      .text(
        "Ce document est genere automatiquement par CENTIC et certifie la participation a la formation mentionnee ci-dessus.",
        { align: "center" }
      );

    doc.moveDown(3);

    doc
      .font("Helvetica")
      .fontSize(12)
      .fillColor("#111827")
      .text(`Fait a Douala, le ${new Date().toLocaleDateString("fr-FR")}`, {
        align: "right",
      })
      .moveDown(2)
      .text("Le Directeur", { align: "right" })
      .moveDown(2)
      .text("_________________________", { align: "right" });

    doc.end();

    stream.on("finish", () => resolve());
    stream.on("error", reject);
    doc.on("error", reject);
  });

  return pdfPath;
};
