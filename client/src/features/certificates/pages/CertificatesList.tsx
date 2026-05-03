import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  ActionIcon,
  Alert,
  Badge,
  Center,
  Group,
  Loader,
  Menu,
  Table,
  Text,
  TextInput,
  Title,
  Tooltip,
} from '@mantine/core';
import {
  IconDots,
  IconFileDownload,
  IconMail,
  IconRefresh,
} from '@tabler/icons-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useState } from 'react';
import {
  useCertificates,
  useEligibleInscriptionsForCertificate,
  useGenerateCertificate,
  useSendCertificate,
} from '../hooks/useCertificates';

const styles = {
  statusBadge: {
    textTransform: 'capitalize' as const,
  },
  actionButton: (index: number) => ({
    marginLeft: index > 0 ? '0.5rem' : 0,
  }),
};

export function CertificatesList() {
  // Utilisation directe des styles
  const { toast } = useToast();
  const [filters] = useState({
    page: 1,
    limit: 10,
    search: '',
    statut: '',
  });

  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const openGenerateModal = () => setIsGenerateModalOpen(true);
  const closeGenerateModal = () => setIsGenerateModalOpen(false);

  const [eligibleSearch, setEligibleSearch] = useState('');

  const { data, isLoading, error, refetch } = useCertificates(filters);
  const generateCertificate = useGenerateCertificate();
  const sendCertificate = useSendCertificate();

  const {
    data: eligibleData,
    isLoading: isEligibleLoading,
    refetch: refetchEligible,
  } = useEligibleInscriptionsForCertificate({
    search: eligibleSearch,
  });

  const eligibleInscriptions = eligibleData?.data ?? [];

  const handleGenerateCertificate = async (inscriptionId: string) => {
    try {
      console.log('[CERTIFICATS] Génération attestation - début', {
        inscriptionId,
      });
      toast({
        title: 'Génération en cours',
        description: "Création de l'attestation...",
      });

      await generateCertificate.mutateAsync(inscriptionId);

      console.log('[CERTIFICATS] Génération attestation - succès', {
        inscriptionId,
      });
      toast({
        title: 'Attestation générée',
        description: "L'attestation a été générée avec succès.",
        variant: 'success',
      });

      closeGenerateModal();
      setEligibleSearch('');
      await refetch();
      await refetchEligible();
    } catch (error) {
      const responsePayload = (error as { response?: { data?: unknown } })
        .response?.data as
        | {
            message?: string;
            error?: string;
          }
        | undefined;

      const message =
        responsePayload?.message ||
        responsePayload?.error ||
        (error instanceof Error
          ? error.message
          : "Erreur lors de la génération de l'attestation.");

      console.error('[CERTIFICATS] Génération attestation - erreur', {
        inscriptionId,
        message,
        error,
      });

      toast({
        title: 'Échec de la génération',
        description: message,
        variant: 'destructive',
      });
    }
  };

  // Fonction à utiliser lorsque le composant GenerateCertificateModal sera implémenté
  // const _handleGenerateSuccess = () => {
  //   close();
  //   refetch();
  // };

  const handleSendCertificate = async (id: string) => {
    try {
      await sendCertificate.mutateAsync(id);
      // La notification sera gérée par le hook useSendCertificate
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'attestation:", error);
    }
  };

  if (isLoading) {
    return (
      <Center style={{ height: '60vh' }}>
        <Loader size="xl" />
      </Center>
    );
  }

  if (error) {
    return (
      <Alert color="red" title="Erreur" mt="md">
        Une erreur est survenue lors du chargement des attestations.
      </Alert>
    );
  }

  interface Certificate {
    id: string;
    statut: 'GENEREE' | 'ENVOYEE' | 'TELECHARGEE';
    dateEmission: string;
    urlPdf: string;
    inscription: {
      utilisateur: {
        prenom: string;
        nom: string;
        email: string;
      };
      formation: {
        titre: string;
        dateDebut: string;
        dateFin: string;
      };
    };
  }

  const rows = data?.map((cert: Certificate, index: number) => {
    const { utilisateur, formation } = cert.inscription;
    const fullName = `${utilisateur.prenom} ${utilisateur.nom}`;

    return (
      <tr key={cert.id}>
        <td>
          <Text fw={500}>{fullName}</Text>
          <Text size="sm" color="dimmed">
            {utilisateur.email}
          </Text>
        </td>
        <td>{formation.titre}</td>
        <td>
          {format(new Date(formation.dateDebut), 'dd MMM yyyy', { locale: fr })}{' '}
          - {format(new Date(formation.dateFin), 'dd MMM yyyy', { locale: fr })}
        </td>
        <td>
          <Badge
            color={
              cert.statut === 'GENEREE'
                ? 'blue'
                : cert.statut === 'ENVOYEE'
                  ? 'green'
                  : 'violet'
            }
            style={styles.statusBadge}
          >
            {cert.statut.toLowerCase()}
          </Badge>
        </td>
        <td>
          {format(new Date(cert.dateEmission), 'dd MMM yyyy HH:mm', {
            locale: fr,
          })}
        </td>
        <td>
          <Group gap="xs" justify="flex-end">
            <Tooltip label="Télécharger l'attestation">
              <ActionIcon
                color="blue"
                variant="light"
                component="a"
                href={cert.urlPdf}
                download
                style={styles.actionButton(index)}
              >
                <IconFileDownload size={16} />
              </ActionIcon>
            </Tooltip>

            <Tooltip label="Envoyer par email">
              <ActionIcon
                color="green"
                variant="light"
                onClick={() => handleSendCertificate(cert.id)}
                loading={sendCertificate.isPending}
                style={styles.actionButton(index)}
              >
                <IconMail size={16} />
              </ActionIcon>
            </Tooltip>

            <Menu position="bottom-end" withArrow>
              <Menu.Target>
                <ActionIcon variant="light">
                  <IconDots size={16} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  leftSection={<IconRefresh size={14} />}
                  onClick={() => refetch()}
                >
                  Actualiser
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </td>
      </tr>
    );
  });

  return (
    <>
      <Group justify="space-between" mb="md">
        <Title order={2}>Gestion des attestations</Title>
      </Group>
      <Button
        type="button"
        variant="default"
        onClick={openGenerateModal}
        disabled={generateCertificate.isPending}
      >
        {generateCertificate.isPending
          ? 'Génération en cours...'
          : 'Générer une attestation'}
      </Button>

      <Dialog
        open={isGenerateModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeGenerateModal();
            setEligibleSearch('');
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Générer une attestation</DialogTitle>
            <DialogDescription>
              Sélectionne un apprenant ayant un paiement validé et ne possédant
              pas encore d'attestation.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <TextInput
                placeholder="Rechercher (nom, prénom, email...)"
                value={eligibleSearch}
                onChange={(e) => setEligibleSearch(e.target.value)}
              />
            </div>

            <div className="max-h-[55vh] overflow-auto rounded-md border">
              {isEligibleLoading ? (
                <div className="p-4">
                  <Text size="sm" c="dimmed">
                    Chargement des inscriptions éligibles...
                  </Text>
                </div>
              ) : eligibleInscriptions.length === 0 ? (
                <div className="p-4">
                  <Text size="sm" c="dimmed">
                    Aucune inscription éligible
                  </Text>
                </div>
              ) : (
                <Table striped highlightOnHover>
                  <thead>
                    <tr>
                      <th>Apprenant</th>
                      <th>Formation</th>
                      <th>Paiement</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {eligibleInscriptions.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <Text fw={500}>
                            {item.utilisateur.prenom} {item.utilisateur.nom}
                          </Text>
                          <Text size="sm" c="dimmed">
                            {item.utilisateur.email}
                          </Text>
                        </td>
                        <td>
                          <Text>{item.formation.titre}</Text>
                        </td>
                        <td>
                          <Text size="sm">{item.paiement.reference}</Text>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <Button
                            type="button"
                            onClick={() => handleGenerateCertificate(item.id)}
                            disabled={generateCertificate.isPending}
                          >
                            {generateCertificate.isPending
                              ? 'Génération...'
                              : 'Générer'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={closeGenerateModal}
            >
              Annuler
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/*  */}

      <Table>
        <thead>
          <tr>
            <th>Étudiant</th>
            <th>Formation</th>
            <th>Période</th>
            <th>Statut</th>
            <th>Date d'émission</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows?.length ? (
            rows
          ) : (
            <tr>
              <td colSpan={6}>
                <Text ta="center" py="md" c="dimmed">
                  Aucune attestation trouvée
                </Text>
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </>
  );
}
