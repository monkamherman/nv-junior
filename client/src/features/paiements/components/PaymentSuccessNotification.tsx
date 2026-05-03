import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface PaymentSuccessNotificationProps {
  reference: string;
  montant: number;
  formationTitre: string;
  onViewDetails?: () => void;
}

export function PaymentSuccessNotification({
  reference,
  montant,
  formationTitre,
  onViewDetails
}: PaymentSuccessNotificationProps) {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails();
    } else {
      navigate(`/mon-compte/paiements`);
    }
  };

  return (
    <div className="text-center p-6 max-w-md mx-auto">
      <div className="flex justify-center mb-4">
        <div className="bg-green-100 rounded-full p-3">
          <CheckCircle2 className="h-12 w-12 text-green-600" />
        </div>
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Paiement réussi !</h2>
      
      <p className="text-gray-600 mb-6">
        Votre paiement pour la formation <span className="font-medium">{formationTitre}</span> a été effectué avec succès.
      </p>
      
      <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
        <div className="flex justify-between py-2">
          <span className="text-gray-600">Référence :</span>
          <span className="font-medium">{reference}</span>
        </div>
        <div className="flex justify-between py-2">
          <span className="text-gray-600">Montant :</span>
          <span className="font-medium">
            {new Intl.NumberFormat('fr-FR', { 
              style: 'currency', 
              currency: 'XOF',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            }).format(montant)}
          </span>
        </div>
        <div className="flex justify-between py-2">
          <span className="text-gray-600">Statut :</span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Payé
          </span>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button 
          variant="outline" 
          onClick={() => navigate('/formations')}
          className="w-full sm:w-auto"
        >
          Voir d'autres formations
        </Button>
        <Button 
          onClick={handleViewDetails}
          className="w-full sm:w-auto"
        >
          Voir les détails
        </Button>
      </div>
    </div>
  );
}
