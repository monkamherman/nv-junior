import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PaiementButtonProps {
  formationId: string;
  montant: number;
  className?: string;
  disabled?: boolean;
  isLoading?: boolean;
}

export function PaiementButton({
  formationId,
  montant,
  className = '',
  disabled = false,
  isLoading = false,
}: PaiementButtonProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/formations/${formationId}/paiement/selection`);
  };

  return (
    <Button
      onClick={handleClick}
      className={`w-full ${className}`}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Chargement...
        </>
      ) : (
        `Payer ${montant} FCFA`
      )}
    </Button>
  );
}
