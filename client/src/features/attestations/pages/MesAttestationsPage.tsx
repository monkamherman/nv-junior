import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  AlertCircle,
  ArrowLeft,
  Award,
  CheckCircle,
  Clock,
  Download,
  FileText,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  useMesAttestations,
  useTelechargerAttestation,
} from '../hooks/useAttestation';

export const MesAttestationsPage = () => {
  const navigate = useNavigate();
  const { data: attestations, isLoading, error } = useMesAttestations();
  const downloadMutation = useTelechargerAttestation();

  const getStatusBadge = (statut: string) => {
    switch (statut) {
      case 'GENEREE':
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            Générée
          </Badge>
        );
      case 'TELECHARGEE':
        return (
          <Badge variant="default" className="flex items-center gap-1">
            <Download className="h-3 w-3" />
            Téléchargée
          </Badge>
        );
      case 'ENVOYEE':
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Envoyée
          </Badge>
        );
      default:
        return <Badge variant="secondary">{statut}</Badge>;
    }
  };

  const handleTelecharger = (attestationId: string) => {
    downloadMutation.mutate(attestationId);
  };

  if (isLoading) {
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

        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
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

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Une erreur est survenue lors du chargement de vos attestations.
          </AlertDescription>
        </Alert>
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

      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Award className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Mes Attestations</h1>
            <p className="text-muted-foreground">
              Consultez et téléchargez vos attestations de formation
            </p>
          </div>
        </div>

        {!attestations || attestations.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">Aucune attestation</h3>
              <p className="mb-4 text-center text-muted-foreground">
                Vous n'avez pas encore d'attestation disponible. Les
                attestations sont générées après avoir terminé une formation et
                validé le paiement.
              </p>
              <Button onClick={() => navigate('/formations')}>
                Voir les formations
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {attestations.map((attestation) => (
              <Card
                key={attestation.id}
                className="transition-shadow hover:shadow-md"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">
                        {attestation.inscription.formation.titre}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        N° {attestation.numero}
                      </p>
                    </div>
                    {getStatusBadge(attestation.statut)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>
                          Du{' '}
                          {format(
                            new Date(
                              attestation.inscription.formation.dateDebut
                            ),
                            'dd MMMM yyyy',
                            { locale: fr }
                          )}
                          {' au '}
                          {format(
                            new Date(attestation.inscription.formation.dateFin),
                            'dd MMMM yyyy',
                            { locale: fr }
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        <span>
                          Émise le{' '}
                          {format(
                            new Date(attestation.dateEmission),
                            'dd MMMM yyyy',
                            { locale: fr }
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t pt-4">
                      <div className="text-sm text-muted-foreground">
                        {attestation.statut === 'TELECHARGEE' &&
                          attestation.dateTelechargement && (
                            <span>
                              Téléchargée le{' '}
                              {format(
                                new Date(attestation.dateTelechargement),
                                'dd MMMM yyyy',
                                { locale: fr }
                              )}
                            </span>
                          )}
                      </div>

                      <Button
                        onClick={() => handleTelecharger(attestation.id)}
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Télécharger le PDF
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
