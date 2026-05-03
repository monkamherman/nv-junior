import { api } from '@/lib/api';
import {
  Alert,
  Button,
  Group,
  LoadingOverlay,
  Modal,
  Select,
  Text,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useEffect, useState } from 'react';
import { useGenerateCertificate } from '../hooks/useCertificates';

interface InscriptionOption {
  value: string;
  label: string;
  user: string;
  formation: string;
}

interface GenerateCertificateModalProps {
  opened: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function GenerateCertificateModal({
  opened,
  onClose,
  onSuccess,
}: GenerateCertificateModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inscriptions, setInscriptions] = useState<InscriptionOption[]>([]);

  const generateCertificate = useGenerateCertificate();

  const form = useForm({
    initialValues: {
      inscriptionId: '',
    },
    validate: {
      inscriptionId: (value) =>
        !value ? 'Veuillez sélectionner une inscription' : null,
    },
  });

  useEffect(() => {
    if (opened) {
      fetchEligibleInscriptions();
    }
  }, [opened]);

  const fetchEligibleInscriptions = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.get<
        Array<{
          id: string;
          utilisateur: {
            prenom: string;
            nom: string;
          };
          formation: {
            titre: string;
          };
        }>
      >('/dashboard/inscriptions/eligible-certificates');
      const data = response.data;

      const options = data.map((inscription) => ({
        value: inscription.id,
        label: `${inscription.utilisateur.prenom} ${inscription.utilisateur.nom} - ${inscription.formation.titre}`,
        user: `${inscription.utilisateur.prenom} ${inscription.utilisateur.nom}`,
        formation: inscription.formation.titre,
      }));

      setInscriptions(options);
    } catch (err) {
      console.error('Erreur lors du chargement des inscriptions:', err);
      setError(
        'Impossible de charger les inscriptions éligibles. Veuillez réessayer.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (values: { inscriptionId: string }) => {
    try {
      setIsLoading(true);
      setError(null);

      await generateCertificate.mutateAsync(values.inscriptionId);
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Erreur lors de la génération de l'attestation:", err);
      setError(
        "Une erreur est survenue lors de la génération de l'attestation."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Générer une attestation"
      size="lg"
    >
      <div style={{ position: 'relative' }}>
        <LoadingOverlay visible={isLoading} />

        {error && (
          <Alert color="red" mb="md">
            {error}
          </Alert>
        )}

        {inscriptions.length === 0 && !isLoading ? (
          <Text color="dimmed" mb="md">
            Aucune inscription éligible pour la génération d'attestation.
          </Text>
        ) : (
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Select
              label="Sélectionner une inscription"
              placeholder="Choisir une inscription"
              data={inscriptions}
              searchable
              maxDropdownHeight={300}
              nothingFoundMessage="Aucune inscription trouvée"
              {...form.getInputProps('inscriptionId')}
              mb="md"
            />

            {form.values.inscriptionId && (
              <div style={{ marginBottom: '1rem' }}>
                <Text size="sm" fw={500} mb="xs">
                  Détails :
                </Text>
                {(() => {
                  const selected = inscriptions.find(
                    (i) => i.value === form.values.inscriptionId
                  );
                  return (
                    <div>
                      <Text size="sm">
                        <strong>Étudiant :</strong> {selected?.user}
                      </Text>
                      <Text size="sm">
                        <strong>Formation :</strong> {selected?.formation}
                      </Text>
                    </div>
                  );
                })()}
              </div>
            )}

            <Group justify="flex-end" mt="md">
              <Button variant="default" onClick={onClose} disabled={isLoading}>
                Annuler
              </Button>
              <Button
                type="submit"
                loading={isLoading}
                disabled={!form.values.inscriptionId}
              >
                Générer l'attestation
              </Button>
            </Group>
          </form>
        )}
      </div>
    </Modal>
  );
}
