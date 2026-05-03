import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { PaiementForm } from '../components/PaiementForm';
import { getFormationById } from '@/features/formations/api/formations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function PaiementPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Récupérer les détails de la formation
  const { data: formation, isLoading, error } = useQuery({
    queryKey: ['formation', id],
    queryFn: () => getFormationById(id!),
  });

  // Gérer le succès du paiement
  const handleSuccess = (reference?: string) => {
    if (reference) {
      navigate(`/paiement/confirmation?reference=${encodeURIComponent(reference)}`);
      return;
    }
    navigate(`/formations/${id}/confirmation`);
  };

  // Afficher un chargement pendant la récupération des données
  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
        </div>
        
        <div className="max-w-2xl mx-auto space-y-4">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  // Gérer les erreurs
  if (error || !formation) {
    return (
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
        </div>
        
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Erreur</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Une erreur est survenue lors du chargement des informations de la formation.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => window.location.reload()}
              >
                Réessayer
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Paiement de la formation</CardTitle>
            <p className="text-muted-foreground">
              {formation.titre}
            </p>
          </CardHeader>
          <CardContent>
            <PaiementForm 
              formationId={formation.id} 
              montant={formation.prix} 
              onSuccess={handleSuccess} 
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
