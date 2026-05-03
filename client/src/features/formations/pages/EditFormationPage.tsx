'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { api } from '@/lib/api';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { FormationForm } from '../components/formation-form';
import type { FormationFormValues } from '../schemas/formation.schema';

function EditFormationPageContent() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Récupérer les données de la formation existante
  const {
    data: formation,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['formation', id],
    queryFn: async () => {
      const { data } = await api.get(`/api/formations/${id}`);
      return data;
    },
    enabled: !!id,
  });

  const updateFormation = useMutation({
    mutationFn: async (data: FormationFormValues) => {
      const response = await api.put(`/api/formations/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: 'Succès',
        description: 'La formation a été mise à jour avec succès',
        variant: 'default',
      });
      navigate('/dashboard/formations');
    },
    onError: (error: unknown) => {
      console.error('Erreur lors de la mise à jour de la formation:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Une erreur est survenue';
      toast({
        title: 'Erreur',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });

  if (isLoading) {
    return <div>Chargement de la formation...</div>;
  }

  if (error) {
    return <div>Erreur lors du chargement de la formation</div>;
  }

  if (!formation) {
    return <div>Formation non trouvée</div>;
  }

  // Préparer les valeurs par défaut pour le formulaire
  const defaultValues: Partial<FormationFormValues> = {
    titre: formation.titre,
    description: formation.description,
    prix: formation.prix,
    dateDebut: formation.dateDebut.split('T')[0], // Format YYYY-MM-DD
    dateFin: formation.dateFin.split('T')[0],
    statut: formation.statut,
  };

  const handleSubmit = async (data: FormationFormValues) => {
    try {
      // Validation supplémentaire si nécessaire
      await updateFormation.mutateAsync(data);
    } catch (error) {
      // Les erreurs sont gérées par useMutation
      console.error('Erreur lors de la soumission du formulaire:', error);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          className="flex items-center gap-2"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux formations
        </Button>
      </div>

      <h1 className="mb-6 text-3xl font-bold">Modifier la formation</h1>

      <div className="mx-auto max-w-3xl">
        <FormationForm
          onSubmit={handleSubmit}
          defaultValues={defaultValues}
          isSubmitting={updateFormation.isPending}
        />
      </div>
    </div>
  );
}

export default function EditFormationPage() {
  return (
    <ProtectedRoute>
      <EditFormationPageContent />
    </ProtectedRoute>
  );
}
