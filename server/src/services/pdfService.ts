import fs from "fs";
import path from "path";

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

  // Contenu HTML simple pour l'attestation
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Attestation de Formation</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          margin: 40px; 
          line-height: 1.6;
        }
        .header { 
          text-align: center; 
          border-bottom: 2px solid #2563eb; 
          padding-bottom: 20px; 
          margin-bottom: 30px;
        }
        .title { 
          color: #2563eb; 
          font-size: 24px; 
          font-weight: bold; 
          margin-bottom: 10px;
        }
        .content { 
          margin: 20px 0; 
        }
        .info { 
          margin: 10px 0; 
          padding: 10px;
          background: #f8f9fa;
          border-radius: 5px;
        }
        .footer { 
          margin-top: 50px; 
          text-align: center; 
          font-style: italic;
          color: #666;
        }
        .signature {
          margin-top: 60px;
          text-align: right;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="title">ATTESTATION DE FORMATION</div>
        <div>CENTIC - Centre de Formation Professionnelle</div>
      </div>
      
      <div class="content">
        <p>Le soussigné, Directeur du Centre de Formation Professionnelle CENTIC, certifie par la présente que :</p>
        
        <div class="info">
          <strong>Nom et Prénom :</strong> ${inscription.utilisateur.prenom} ${inscription.utilisateur.nom}<br>
          <strong>Email :</strong> ${inscription.utilisateur.email}<br>
          <strong>Formation suivie :</strong> ${inscription.formation.titre}<br>
          <strong>Description :</strong> ${inscription.formation.description}<br>
          <strong>Date de début :</strong> ${new Date(inscription.formation.dateDebut).toLocaleDateString("fr-FR")}<br>
          <strong>Date de fin :</strong> ${new Date(inscription.formation.dateFin).toLocaleDateString("fr-FR")}
        </div>
        
        <p>a suivi avec succès la formation susmentionnée et a obtenu des résultats satisfaisants.</p>
        
        <div class="info">
          <strong>Numéro d'attestation :</strong> ${attestation.numero}<br>
          <strong>Date d'émission :</strong> ${new Date(attestation.dateEmission).toLocaleDateString("fr-FR")}<br>
          <strong>Statut :</strong> ${attestation.statut}
        </div>
      </div>
      
      <div class="signature">
        <p>Fait à ${new Date().toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
        <br><br><br>
        <p>Le Directeur</p>
        <p>_________________________</p>
      </div>
      
      <div class="footer">
        <p>Ce document est délivré par le système automatique de CENTIC et ne nécessite pas de signature manuscrite.</p>
        <p>Pour vérifier l'authenticité de cette attestation, contactez : contact@centic.com</p>
      </div>
    </body>
    </html>
  `;

  // Écrire le fichier HTML (pour l'instant, nous créons un fichier HTML qui peut être converti en PDF)
  fs.writeFileSync(pdfPath.replace(".pdf", ".html"), htmlContent);

  // Pour l'instant, nous créons un fichier texte simple comme placeholder
  const textContent = `
ATTESTATION DE FORMATION - CENTIC
====================================

Numéro: ${attestation.numero}
Date d'émission: ${new Date(attestation.dateEmission).toLocaleDateString("fr-FR")}

ÉTUDIANT:
Nom: ${inscription.utilisateur.prenom} ${inscription.utilisateur.nom}
Email: ${inscription.utilisateur.email}

FORMATION:
Titre: ${inscription.formation.titre}
Description: ${inscription.formation.description}
Date de début: ${new Date(inscription.formation.dateDebut).toLocaleDateString("fr-FR")}
Date de fin: ${new Date(inscription.formation.dateFin).toLocaleDateString("fr-FR")}

STATUT: ${attestation.statut}

Ce document certifie que l'étudiant a suivi avec succès la formation mentionnée ci-dessus.

Fait le ${new Date().toLocaleDateString("fr-FR")}
  `;

  fs.writeFileSync(pdfPath, textContent);

  return pdfPath;
};
