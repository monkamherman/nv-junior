import { PaymentHistory } from '@/components/profile/PaymentHistory';
import { LoadingOverlay } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {
  IconCalendar,
  IconCheck,
  IconClockHour4,
  IconFileDownload,
  IconFileText,
  IconSchool,
  IconX,
} from '@tabler/icons-react';
import { useState } from 'react';
import { useAttestations, useProfile } from '../hooks/useProfile';
import type { UserProfile } from '../types';

interface Attestation {
  id: string;
  numero: string;
  urlPdf: string;
  statut: string;
  dateEmission: string;
  inscription: {
    formation: {
      id: string;
      titre: string;
      description: string;
    };
  };
}

export function ProfilePage() {
  const [activeTab, setActiveTab] = useState<string | null>('profile');

  // Charger les données du profil
  const { data: profile, isLoading } = useProfile() as {
    data: UserProfile | null;
    isLoading: boolean;
    isRefetching: boolean;
  };

  // Charger les attestations depuis la base de données
  const { data: attestations } = useAttestations() as {
    data: Attestation[] | null;
    isLoading: boolean;
  };

  // Mettre à jour l'heure de la dernière mise à jour

  // Utiliser directement les données de l'API
  const profileData = profile;

  // Fonction de téléchargement d'attestation
  const handleDownloadAttestation = async (attestationId: string) => {
    console.log(
      "Génération et téléchargement de l'attestation:",
      attestationId
    );
    notifications.show({
      title: 'Génération',
      message: 'Génération du certificat en cours...',
      color: 'blue',
    });

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:10000';
      const token = localStorage.getItem('token');

      // Appeler l'API pour générer et télécharger le PDF à la volée
      const response = await fetch(
        `${apiUrl}/api/attestations/${attestationId}/generer-pdf`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      // Récupérer le PDF généré
      const blob = await response.blob();

      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attestation-${attestationId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      notifications.show({
        title: 'Succès',
        message: 'Certificat généré et téléchargé avec succès',
        color: 'green',
        icon: <IconCheck size={16} />,
      });
    } catch (error) {
      console.error('Erreur de génération/téléchargement:', error);
      notifications.show({
        title: 'Erreur',
        message: 'Erreur lors de la génération du certificat',
        color: 'red',
        icon: <IconX size={16} />,
      });
    }
  };

  const profileForm = useForm({
    initialValues: {
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
    },
    validate: {
      email: (value) =>
        /^\S+@\S+\.\S+$/.test(value) ? null : 'Email invalide',
    },
  });

  // Mettre à jour le formulaire quand le profil est chargé
  if (profileData && !profileForm.isDirty()) {
    profileForm.setValues({
      nom: profileData.nom,
      prenom: profileData.prenom,
      email: profileData.email,
      telephone: profileData.telephone || '',
    });
  }

  if (isLoading) {
    return <LoadingOverlay visible={true} />;
  }

  if (!profileData) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-red-800">
            Impossible de charger le profil. Veuillez réessayer.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto w-full px-4 py-8">
      {/* Carte d'en-tête du profil */}
      <div className="w-22 flex flex-wrap items-start justify-between gap-6">
        {/* Onglets */}
        <div className="justify-center rounded-xl border bg-card shadow-sm">
          {/* Navigation par onglets */}
          <div className="border-b border-border">
            <nav className="flex flex-wrap justify-between gap-1 p-4">
              <button
                onClick={() => setActiveTab('formations')}
                className={`inline-flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'formations'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <IconSchool size={16} className="mr-2" />
                Formations
              </button>
              <button
                onClick={() => setActiveTab('attestations')}
                className={`inline-flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'attestations'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <IconFileDownload size={16} className="mr-2" />
                Certificats
              </button>
              <button
                onClick={() => setActiveTab('paiements')}
                className={`inline-flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'paiements'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <IconFileText size={16} className="mr-2" />
                Paiements
              </button>
            </nav>
          </div>

          {activeTab === 'formations' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Mes formations</h3>
              {profileData.formations && profileData.formations.length > 0 ? (
                <div className="grid gap-4">
                  {profileData.formations?.map((formation) => (
                    <div
                      key={formation.id}
                      className="rounded-lg border p-4 transition-shadow hover:shadow-md"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-base font-medium">
                            {formation.titre}
                          </h4>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {formation.description}
                          </p>
                          <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <IconCalendar size={14} />
                              {new Date(formation.dateDebut).toLocaleDateString(
                                'fr-FR'
                              )}
                            </span>
                            <span className="flex items-center gap-1">
                              <IconClockHour4 size={14} />
                              {formation.duree} heures
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                              formation.statut === 'TERMINÉ'
                                ? 'bg-green-100 text-green-800'
                                : formation.statut === 'EN_COURS'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {formation.statut === 'TERMINÉ'
                              ? 'Terminé'
                              : formation.statut === 'EN_COURS'
                                ? 'En cours'
                                : 'Non commencé'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  <IconSchool size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Vous n'avez aucune formation pour le moment.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'attestations' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Mes certificats</h3>
              {attestations && attestations.length > 0 ? (
                <div className="grid gap-4">
                  {attestations?.map((attestation) => (
                    <div
                      key={attestation.id}
                      className="rounded-lg border p-4 transition-shadow hover:shadow-md"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-base font-medium">
                            Attestation -{' '}
                            {attestation.inscription?.formation?.titre}
                          </h4>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {attestation.inscription?.formation?.description}
                          </p>
                          <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <IconCalendar size={14} />
                              Délivré le{' '}
                              {new Date(
                                attestation.dateEmission
                              ).toLocaleDateString('fr-FR')}
                            </span>
                            <span className="flex items-center gap-1">
                              <IconCheck size={14} />
                              {attestation.statut}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <button
                            onClick={() =>
                              handleDownloadAttestation(attestation.id)
                            }
                            className="inline-flex items-center rounded-md px-3 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-800"
                          >
                            <IconFileDownload size={16} className="mr-2" />
                            Télécharger
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  <IconFileDownload
                    size={48}
                    className="mx-auto mb-4 opacity-50"
                  />
                  <p>Vous n'avez aucun certificat disponible pour le moment.</p>
                  <p className="mt-2 text-sm">
                    Les certificats apparaissent ici lorsque vous terminez une
                    formation.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'paiements' && (
            <div className="space-y-4">
              <PaymentHistory payments={profileData.paiements || []} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
