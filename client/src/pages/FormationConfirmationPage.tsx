import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Download,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface Formation {
  id: string;
  titre: string;
  description: string;
  prix: number;
  duree: number;
  dateDebut: string;
  niveau: string;
  organisme?: string;
}

interface Paiement {
  transactionId?: string;
  success: boolean;
  methode: string;
  montant: number;
}

interface Attestation {
  id: string;
  participant?: {
    nom: string;
  };
}

interface LocationState {
  formation: Formation;
  payment: Paiement;
  attestation: Attestation;
}

export default function FormationConfirmationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Si pas d'état, rediriger vers les formations
  useEffect(() => {
    if (!state) {
      navigate('/formations');
    }
  }, [state, navigate]);

  if (!state) {
    return null;
  }

  const { formation, payment, attestation } = state;

  const handleDownloadAttestation = async () => {
    setIsGeneratingPDF(true);
    try {
      // Simulation de génération PDF
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Créer un blob PDF simulé
      const pdfContent = `
ATTESTATION DE FIN DE FORMATION

Organisme: ${formation.organisme || 'Tech Education Center'}
Formation: ${formation.titre}
Durée: ${formation.duree} heures
Date de fin: ${format(new Date(), 'dd MMMM yyyy', { locale: fr })}

Participant: ${attestation.participant?.nom || 'Utilisateur Demo'}
Statut: COMPLÉTÉ

Cette attestation certifie que le participant a complété avec succès la formation.

Attestation générée le: ${format(new Date(), 'dd MMMM yyyy à HH:mm', { locale: fr })}
ID: ${attestation.id || 'ATT-' + Date.now()}
      `;

      const blob = new Blob([pdfContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attestation-${formation.titre.replace(/\s+/g, '-')}-${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/formations')}
            className="mb-6 flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux formations
          </Button>

          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="mb-2 text-3xl font-bold text-gray-900">
              Inscription réussie !
            </h1>
            <p className="text-lg text-gray-600">
              Vous êtes maintenant inscrit à la formation
            </p>
          </div>
        </div>

        {/* Confirmation Details */}
        <div className="mb-8 grid gap-6 md:grid-cols-2">
          {/* Formation Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Formation confirmée
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="mb-2 text-lg font-semibold">
                  {formation.titre}
                </h3>
                <p className="text-sm text-gray-600">{formation.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-gray-500">Durée</p>
                    <p className="font-medium">{formation.duree} heures</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-gray-500">Début</p>
                    <p className="font-medium">
                      {format(new Date(formation.dateDebut), 'dd MMM yyyy', {
                        locale: fr,
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-gray-500">Niveau</p>
                    <p className="font-medium">{formation.niveau}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-gray-500">Prix</p>
                    <p className="font-medium">
                      {formation.prix.toLocaleString('fr-FR')} FCFA
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Info */}
          <Card>
            <CardHeader>
              <CardTitle>Détails du paiement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Montant payé</span>
                <span className="text-lg font-semibold">
                  {formation.prix.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Méthode</span>
                <Badge variant="outline">Simulation</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Statut</span>
                <Badge className="bg-green-100 text-green-800">
                  Payé avec succès
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Transaction ID</span>
                <span className="font-mono text-sm">
                  {payment.transactionId || 'TXN-' + Date.now()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Date</span>
                <span className="text-sm">
                  {format(new Date(), 'dd MMM yyyy à HH:mm', { locale: fr })}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Attestation Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Votre attestation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="mt-0.5 h-5 w-5 text-blue-600" />
                <div>
                  <h4 className="mb-1 font-semibold text-blue-900">
                    Attestation générée avec succès
                  </h4>
                  <p className="text-sm text-blue-700">
                    Votre attestation de fin de formation est prête. Vous pouvez
                    la télécharger immédiatement ou y accéder plus tard depuis
                    votre espace personnel.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Button
                onClick={handleDownloadAttestation}
                disabled={isGeneratingPDF}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                {isGeneratingPDF
                  ? 'Génération en cours...'
                  : "Télécharger l'attestation"}
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/mes-attestations')}
              >
                Voir mes attestations
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <div className="mt-8 text-center">
          <h3 className="mb-4 text-lg font-semibold">Prochaines étapes</h3>
          <div className="grid gap-4 text-sm md:grid-cols-3">
            <div className="rounded-lg border bg-white p-4">
              <div className="mb-2 font-medium">1. Accès à la formation</div>
              <p className="text-gray-600">
                Vous recevrez un email avec les instructions pour accéder à la
                plateforme
              </p>
            </div>
            <div className="rounded-lg border bg-white p-4">
              <div className="mb-2 font-medium">
                2. Commencer l'apprentissage
              </div>
              <p className="text-gray-600">
                Accédez aux modules et commencez à apprendre à votre rythme
              </p>
            </div>
            <div className="rounded-lg border bg-white p-4">
              <div className="mb-2 font-medium">3. Obtenir l'attestation</div>
              <p className="text-gray-600">
                Complétez tous les modules pour recevoir votre attestation
                finale
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
