import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { getErrorMessage } from '@/lib/errors';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AlertCircle } from 'lucide-react';
import { usePaiementsUtilisateur } from '../api/paiement.api';
import { PaiementStatusBadge } from './PaiementStatusBadge';

export function PaiementHistory() {
  const { data: paiements, isLoading, error } = usePaiementsUtilisateur();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-lg border p-4">
            <Skeleton className="mb-2 h-6 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
            <div className="mt-2 flex justify-between">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erreur</AlertTitle>
        <AlertDescription>
          {getErrorMessage(
            error,
            "Une erreur est survenue lors du chargement de l'historique des paiements."
          )}
        </AlertDescription>
      </Alert>
    );
  }

  if (!paiements || paiements.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">Aucun paiement trouvé.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {paiements.map((paiement) => {
        const datePaiement = new Date(paiement.datePaiement);

        return (
          <div
            key={paiement.id}
            className="rounded-lg border p-4 transition-shadow hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium">Référence: {paiement.reference}</h3>
                <p className="text-sm text-muted-foreground">
                  {format(datePaiement, 'PPPp', { locale: fr })}
                </p>
              </div>
              <PaiementStatusBadge statut={paiement.statut} />
            </div>

            <div className="mt-2 flex items-center justify-between">
              <div>
                <p className="text-sm">
                  <span className="font-medium">Montant:</span>{' '}
                  {new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: 'XOF',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(paiement.montant)}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Opérateur:</span>{' '}
                  {paiement.operateur.replace('_', ' ')}
                </p>
              </div>
              <p className="text-sm">
                <span className="font-medium">Tél:</span> {paiement.telephone}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
