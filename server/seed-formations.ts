import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const formations = [
  {
    titre: "Développement Web Full Stack",
    description:
      "Formation complète sur le développement web avec React, Node.js et MongoDB",
    prix: 75000,
    dateDebut: new Date("2025-01-15"),
    dateFin: new Date("2025-04-15"),
    statut: "OUVERTE" as const,
  },
  {
    titre: "Data Science et Machine Learning",
    description:
      "Apprenez les bases de la data science, du machine learning et du deep learning",
    prix: 120000,
    dateDebut: new Date("2025-02-01"),
    dateFin: new Date("2025-06-01"),
    statut: "OUVERTE" as const,
  },
  {
    titre: "Marketing Digital",
    description:
      "Maîtrisez les techniques de marketing digital, SEO, SEM et réseaux sociaux",
    prix: 45000,
    dateDebut: new Date("2025-01-20"),
    dateFin: new Date("2025-03-20"),
    statut: "TERMINEE" as const,
  },
  {
    titre: "UX/UI Design",
    description:
      "Formation sur la conception d'interfaces utilisateur et l'expérience utilisateur",
    prix: 60000,
    dateDebut: new Date("2025-03-01"),
    dateFin: new Date("2025-05-01"),
    statut: "BROUILLON" as const,
  },
  {
    titre: "Cybersécurité",
    description:
      "Apprenez à protéger les systèmes informatiques contre les menaces cybernétiques",
    prix: 90000,
    dateDebut: new Date("2025-02-15"),
    dateFin: new Date("2025-05-15"),
    statut: "OUVERTE" as const,
  },
  {
    titre: "Gestion de Projet Agile",
    description:
      "Maîtrisez les méthodes agiles et la gestion de projet avec Scrum et Kanban",
    prix: 55000,
    dateDebut: new Date("2025-01-10"),
    dateFin: new Date("2025-02-10"),
    statut: "TERMINEE" as const,
  },
  {
    titre: "Cloud Computing avec AWS",
    description:
      "Formation sur les services cloud Amazon Web Services et l'architecture cloud",
    prix: 80000,
    dateDebut: new Date("2025-03-15"),
    dateFin: new Date("2025-06-15"),
    statut: "BROUILLON" as const,
  },
  {
    titre: "Blockchain et Cryptomonnaies",
    description:
      "Découvrez la technologie blockchain, les smart contracts et les cryptomonnaies",
    prix: 95000,
    dateDebut: new Date("2025-04-01"),
    dateFin: new Date("2025-07-01"),
    statut: "BROUILLON" as const,
  },
];

async function seedFormations() {
  try {
    console.log("Début de l'insertion des formations de test...");

    // Supprimer les formations existantes (optionnel)
    const count = await prisma.formation.count();
    console.log(`Nombre de formations existantes: ${count}`);

    if (count > 0) {
      console.log("Suppression des formations existantes...");
      await prisma.formation.deleteMany();
    }

    // Insérer les nouvelles formations
    for (const formation of formations) {
      await prisma.formation.create({
        data: formation,
      });
      console.log(`Formation créée: ${formation.titre}`);
    }

    console.log(
      `${formations.length} formations ont été insérées avec succès!`
    );
  } catch (error) {
    console.error("Erreur lors de l'insertion des formations:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedFormations();
