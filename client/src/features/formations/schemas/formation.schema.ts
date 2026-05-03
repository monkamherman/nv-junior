import { z } from 'zod';

export const formationSchema = z.object({
  titre: z.string().min(3, 'Le titre doit contenir au moins 3 caractères'),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères'),
  prix: z.number().min(0, 'Le prix ne peut pas être négatif'),
  dateDebut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (YYYY-MM-DD)'),
  dateFin: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (YYYY-MM-DD)'),
  statut: z.enum(['BROUILLON', 'OUVERTE', 'TERMINEE']).default('BROUILLON'),
}).refine((data) => {
  if (!data.dateDebut || !data.dateFin) return true;
  return new Date(data.dateFin) >= new Date(data.dateDebut);
}, {
  message: 'La date de fin doit être postérieure ou égale à la date de début',
  path: ['dateFin'],
});

export type FormationFormValues = z.infer<typeof formationSchema>;
