import { PrismaClient, StatutFormation } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Début du seeding...");

  const formateurs = await Promise.all([
    prisma.formateur.create({
      data: {
        nom: "Doe",
        prenom: "Jane",
        email: "jane.doe@centic.test",
        telephone: "+237600000001",
        qualificationProfessionnelle: "Ingénieure logiciel senior et architecte full-stack",
        bio: "Spécialiste des architectures web modernes, React et Node.js.",
      },
    }),
    prisma.formateur.create({
      data: {
        nom: "Ngassa",
        prenom: "Paul",
        email: "paul.ngassa@centic.test",
        telephone: "+237600000002",
        qualificationProfessionnelle: "Data scientist certifié et consultant Python/IA",
        bio: "Expert en data science appliquée, visualisation de données et machine learning.",
      },
    }),
    prisma.formateur.create({
      data: {
        nom: "Mbarga",
        prenom: "Aline",
        email: "aline.mbarga@centic.test",
        telephone: "+237600000003",
        qualificationProfessionnelle: "Designer produit senior en UI/UX mobile",
        bio: "Accompagne les équipes sur le design produit, les parcours et les tests utilisateurs.",
      },
    }),
  ]);

  const formationsData = [
    {
      titre: "Développement Web Avancé avec Node.js et React",
      description:
        "Maîtrisez le développement full-stack avec les technologies les plus demandées du marché. Ce cours couvre les API RESTful, GraphQL, et les hooks avancés de React.",
      prix: 150000,
      dateDebut: new Date("2024-09-01T09:00:00Z"),
      dateFin: new Date("2024-11-30T17:00:00Z"),
      statut: StatutFormation.OUVERTE,
      formateurIndexes: [0],
    },
    {
      titre: "Introduction à la Data Science avec Python",
      description:
        "Apprenez les bases de la manipulation de données, de la visualisation et du machine learning avec des bibliothèques comme Pandas, Matplotlib et Scikit-learn.",
      prix: 120000,
      dateDebut: new Date("2024-10-15T09:00:00Z"),
      dateFin: new Date("2025-01-15T17:00:00Z"),
      statut: StatutFormation.OUVERTE,
      formateurIndexes: [1],
    },
    {
      titre: "Design UI/UX pour Applications Mobiles",
      description:
        "Créez des interfaces intuitives et esthétiques pour iOS et Android. Apprenez à utiliser Figma, à prototyper et à tester vos designs auprès des utilisateurs.",
      prix: 95000,
      dateDebut: new Date("2024-09-20T09:00:00Z"),
      dateFin: new Date("2024-12-10T17:00:00Z"),
      statut: StatutFormation.OUVERTE,
      formateurIndexes: [2],
    },
    {
      titre: "Marketing Digital et Stratégies SEO",
      description:
        "Augmentez la visibilité de votre site web grâce à des stratégies de contenu, de référencement naturel (SEO) et de campagnes publicitaires sur les réseaux sociaux.",
      prix: 75000,
      dateDebut: new Date("2025-01-10T09:00:00Z"),
      dateFin: new Date("2025-03-10T17:00:00Z"),
      statut: StatutFormation.BROUILLON,
      formateurIndexes: [0, 2],
    },
    {
      titre: "Cybersécurité : Fondamentaux et Bonnes Pratiques",
      description:
        "Protégez les systèmes d'information contre les menaces. Ce cours couvre les bases de la sécurité réseau, la cryptographie et la gestion des vulnérabilités.",
      prix: 250000,
      dateDebut: new Date("2025-02-01T09:00:00Z"),
      dateFin: new Date("2025-05-01T17:00:00Z"),
      statut: StatutFormation.OUVERTE,
      formateurIndexes: [0, 1],
    },
  ];

  for (const data of formationsData) {
    const { formateurIndexes, ...formationData } = data;
    await prisma.formation.create({
      data: {
        ...formationData,
        formateurs: {
          create: formateurIndexes.map((index) => ({
            formateur: {
              connect: { id: formateurs[index].id },
            },
          })),
        },
      },
    });
  }

  console.log(`${formateurs.length} formateurs ont été ajoutés.`);
  console.log(`${formationsData.length} formations ont été ajoutées.`);
  console.log("Seeding terminé.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
