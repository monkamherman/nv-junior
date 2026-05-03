import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createUser() {
  try {
    const user = await prisma.utilisateur.create({
      data: {
        nom: 'Demo',
        prenom: 'User',
        email: 'demo@example.com',
        motDePasse: 'password123', // En réalité, devrait être hashé
        telephone: '0102030405',
        role: 'APPRENANT'
      }
    });
    
    console.log('Utilisateur créé:', user.id);
    console.log('Email:', user.email);
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createUser();