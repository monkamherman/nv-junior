import { axiosInstance } from '@/api/api.config';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Download, Receipt } from 'lucide-react';

interface Payment {
  id: string;
  reference: string;
  montant: number;
  methode: string;
  statut: string;
  datePaiement: string;
  formation: string;
  telephone: string;
}

interface PaymentHistoryProps {
  payments: Payment[];
}

export function PaymentHistory({ payments }: PaymentHistoryProps) {
  const handleDownloadReceipt = async (
    paymentId: string,
    reference: string
  ) => {
    try {
      const response = await axiosInstance.get(
        `/api/paiements/${paymentId}/recu`,
        {
          responseType: 'blob',
        }
      );

      // Créer un URL pour le blob et déclencher le téléchargement
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `recu-paiement-${reference}.txt`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Téléchargement réussi',
        description: 'Le reçu de paiement a été téléchargé avec succès.',
      });
    } catch {
      toast({
        title: 'Erreur de téléchargement',
        description: 'Impossible de télécharger le reçu. Veuillez réessayer.',
        variant: 'destructive',
      });
    }
  };

  if (payments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Historique des paiements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-4 text-center text-gray-500">
            Vous n'avez aucun paiement enregistré.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          Historique des paiements
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {payments.map((payment) => (
            <div
              key={payment.id}
              className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-gray-50"
            >
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-2">
                  <span className="font-medium">{payment.formation}</span>
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${
                      payment.statut === 'VALIDE'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {payment.statut}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 md:grid-cols-4">
                  <div>
                    <span className="font-medium">Référence:</span>
                    <p className="text-xs">{payment.reference}</p>
                  </div>
                  <div>
                    <span className="font-medium">Montant:</span>
                    <p className="text-xs">
                      {payment.montant.toLocaleString('fr-FR')} FCFA
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">Méthode:</span>
                    <p className="text-xs">{payment.methode}</p>
                  </div>
                  <div>
                    <span className="font-medium">Date:</span>
                    <p className="text-xs">
                      {new Date(payment.datePaiement).toLocaleDateString(
                        'fr-FR'
                      )}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    handleDownloadReceipt(payment.id, payment.reference)
                  }
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Reçu
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
