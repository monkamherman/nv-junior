/**
 * Singleton PrismaClient pour optimiser les connexions à la base de données
 * Évite la création d'instances multiples et améliore les performances
 */

import { PrismaClient } from "@prisma/client";

// Extension de l'interface globale pour stocker l'instance Prisma
declare global {
  var __prisma: PrismaClient | undefined;
}

// Création du singleton PrismaClient
const prisma =
  globalThis.__prisma ||
  new PrismaClient({
    // Options de configuration pour optimiser les performances
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "info", "warn", "error"]
        : ["error"],
    // Timeout de connexion plus court pour éviter les blocages
    transactionOptions: {
      timeout: 10000, // 10 secondes
    },
  });

// En développement, éviter les hot-reload issues
if (process.env.NODE_ENV === "development") {
  globalThis.__prisma = prisma;
}

// Fonction pour tester la connexion
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$connect();
    console.log("[DATABASE] Connexion à la base de données établie");
    return true;
  } catch (error) {
    console.error(
      "[DATABASE] Erreur de connexion à la base de données:",
      error
    );
    return false;
  }
}

// Fonction de déconnexion propre
export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
    console.log("[DATABASE] Déconnexion de la base de données");
  } catch (error) {
    console.error("[DATABASE] Erreur lors de la déconnexion:", error);
  }
}

// Export du singleton
export default prisma;
