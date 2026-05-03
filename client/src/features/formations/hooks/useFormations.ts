import { toast } from '@/components/ui/use-toast';
import { api } from '@/lib/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export interface Formation {
  id: string;
  titre: string;
  description: string;
  prix: number;
  dateDebut: string;
  dateFin: string;
  statut: 'OUVERTE' | 'EN_COURS' | 'TERMINE' | 'A_VENIR';
  createdAt: string;
  updatedAt: string;
  formateur?: {
    id: string;
    nom: string;
    prenom: string;
  };
}

export interface UserFormation extends Formation {
  dateInscription: string;
  formateur: {
    id: string;
    nom: string;
    prenom: string;
  };
}

export function useFormations() {
  return useQuery<Formation[]>({
    queryKey: ['formations'],
    queryFn: async () => {
      const { data } = await api.get('/api/formations/public');
      return data;
    },
    staleTime: 0,
    gcTime: 0,
  });
}

export function useUserFormations() {
  return useQuery<UserFormation[]>({
    queryKey: ['user-formations'],
    queryFn: async () => {
      const { data } = await api.get('/api/formations/mes-formations');
      return data;
    },
    staleTime: 0,
    gcTime: 0,
  });
}

export function useGenerateAttestation(formationId: string) {
  return useQuery({
    queryKey: ['attestation', formationId],
    queryFn: async () => {
      const response = await api.get(
        `/api/formations/${formationId}/attestation`,
        {
          responseType: 'blob',
        }
      );

      // Créer une URL pour le fichier PDF
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attestation-formation-${formationId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      return url;
    },
    enabled: false, // Ne pas exécuter automatiquement
  });
}

export function useGenerateAttestationMutation() {
  return useMutation({
    mutationFn: async (formationId: string) => {
      const response = await api.get(
        `/api/formations/${formationId}/attestation`,
        {
          responseType: 'blob',
        }
      );

      // Créer une URL pour le fichier PDF
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attestation-formation-${formationId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      return url;
    },
  });
}

export function useUpdateFormation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: { id: string } & Partial<Formation>) => {
      const response = await api.put(`/api/formations/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-formations'] });
      toast({
        title: 'Succès',
        description: 'La formation a été mise à jour avec succès',
        variant: 'default',
      });
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Une erreur est survenue',
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteFormation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/api/formations/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-formations'] });
      toast({
        title: 'Succès',
        description: 'La formation a été supprimée avec succès',
        variant: 'default',
      });
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Une erreur est survenue',
        variant: 'destructive',
      });
    },
  });
}
