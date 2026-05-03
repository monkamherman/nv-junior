import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, CreditCard, Smartphone } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface PaymentMethod {
  id: 'ORANGE_MONEY' | 'MTN_MONEY';
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  prefix: string;
  placeholder: string;
}

export default function PaymentMethodSelectionPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [selectedMethod, setSelectedMethod] = useState<
    'ORANGE_MONEY' | 'MTN_MONEY' | null
  >(null);

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'ORANGE_MONEY',
      name: 'Orange Money',
      description:
        '. Paiement; paiement sécurisé via Orange . Paiementeur; paiement sécurisé via Orange Money CI',
      icon: <Smartphone className="h-8 w-8" />,
      color: 'bg-orange-500',
      prefix: '+225',
      placeholder: '07 12 34 56 78',
    },
    {
      id: 'MTN_MONEY',
      name: 'MTN Mobile Money',
      description: 'Paiement rapide et sécurisé via MTN Mobile Money',
      icon: <CreditCard className="h-8 w-8" />,
      color: 'bg-yellow-500',
      prefix: '+237',
      placeholder: '6 12 34 56 78',
    },
  ];

  const handleMethodSelect = (method: 'ORANGE_MONEY' | 'MTN_MONEY') => {
    setSelectedMethod(method);
  };

  const handleContinue = () => {
    if (selectedMethod && id) {
      // Naviguer vers la page de paiement avec la méthode sélectionnée
      navigate(`/formations/${id}/paiement?method=${selectedMethod}`);
    } else if (!id) {
      // Si pas d'ID de formation, remonter une erreur
      console.error('Aucun ID de formation trouvé');
      navigate(-1);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={handleGoBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
      </div>

      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              Choisissez votre méthode de paiement
            </CardTitle>
            <p className="text-muted-foreground">
              Sélectionnez le service de paiement que vous souhaitez utiliser
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className={`relative cursor-pointer rounded-lg border-2 transition-all ${
                  selectedMethod === method.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => handleMethodSelect(method.id)}
              >
                <div className="p-6">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`rounded-full p-3 ${method.color} text-white`}
                    >
                      {method.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">{method.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {method.description}
                      </p>
                      <div className="mt-2 text-xs text-muted-foreground">
                        <span>
                          Format: {method.prefix} {method.placeholder}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div
                        className={`h-4 w-4 rounded-full border-2 ${
                          selectedMethod === method.id
                            ? 'border-primary bg-primary'
                            : 'border-muted-foreground'
                        }`}
                      >
                        {selectedMethod === method.id && (
                          <div className="h-full w-full rounded-full bg-primary" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="pt-4">
              <Button
                onClick={handleContinue}
                disabled={!selectedMethod}
                className="w-full"
                size="lg"
              >
                Continuer avec{' '}
                {selectedMethod
                  ? paymentMethods.find((m) => m.id === selectedMethod)?.name
                  : '...'}
              </Button>
            </div>

            <div className="text-center text-xs text-muted-foreground">
              <p>
                En continuant, vous acceptez les conditions générales
                d'utilisation du service de paiement sélectionné.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
