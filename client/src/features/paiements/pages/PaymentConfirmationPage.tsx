import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PaymentSuccessNotification } from '../components/PaymentSuccessNotification';
import { getPaiementStatus } from '../api/paiement.api';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export default function PaymentConfirmationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [reference, setReference] = useState<string | null>(null);
  
  // Extraire la référence du paiement depuis l'URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const ref = params.get('reference');
    setReference(ref);
  }, [location.search]);

  // Récupérer les détails du paiement
  const { data: paiement, isLoading, error } = useQuery({
    queryKey: ['paiement', reference],
    queryFn: () => reference ? getPaiementStatus(reference) : null,
    enabled: !!reference,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 max-w-md text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-12 w-12 bg-gray-200 rounded-full mx-auto"></div>
          <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          <div className="h-20 bg-gray-100 rounded-lg mt-6"></div>
        </div>
      </div>
    );
  }

  if (error || !paiement) {
    return (
      <div className="container mx-auto py-12 max-w-md px-4">
        <div className="space-y-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 px-0"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
          
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>
              {error ? 
                'Une erreur est survenue lors de la récupération des détails du paiement.' :
                'Aucune information de paiement trouvée.'
              }
            </AlertDescription>
          </Alert>
          
          <div className="flex justify-center">
            <Button onClick={() => navigate('/mon-compte/paiements')}>
              Voir mes paiements
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 max-w-md px-4">
      <Button 
        variant="ghost" 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 px-0 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour
      </Button>
      
      <PaymentSuccessNotification
        reference={paiement.reference}
        montant={paiement.montant}
        formationTitre={paiement.formation?.titre || 'Formation'}
        onViewDetails={() => navigate(`/mon-compte/paiements`)}
      />
    </div>
  );
}
