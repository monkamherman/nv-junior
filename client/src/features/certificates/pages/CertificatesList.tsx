import {
  ActionIcon,
  Alert,
  Badge,
  Box,
  Button,
  Center,
  Group,
  Loader,
  Menu,
  Pagination,
  Paper,
  Table,
  Text,
  TextInput,
  Title,
  Tooltip,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconDots,
  IconFileDownload,
  IconMail,
  IconPlus,
  IconRefresh,
  IconSearch,
} from '@tabler/icons-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useState } from 'react';
import {
  useCertificates,
  useGenerateCertificate,
  useSendCertificate,
} from '../hooks/useCertificates';
// TODO: Implémenter ou corriger l'import de GenerateCertificateModal

const styles = {
  statusBadge: {
    textTransform: 'capitalize' as const,
  },
  actionButton: (index: number) => ({
    marginLeft: index > 0 ? '0.5rem' : 0,
  }),
};

const statusOptions = [
  { value: '', label: 'Tous les statuts' },
  { value: 'GENEREE', label: 'Générée' },
  { value: 'ENVOYEE', label: 'Envoyée' },
  { value: 'TELECHARGEE', label: 'Téléchargée' },
];

export function CertificatesList() {
  // Utilisation directe des styles
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    statut: '',
  });

  const [, { open }] = useDisclosure(false);

  const { data, isLoading, error, refetch } = useCertificates(filters);
  const generateCertificate = useGenerateCertificate();
  const sendCertificate = useSendCertificate();

  const handleFilterChange = (
    key: 'page' | 'limit' | 'search' | 'statut',
    value: string | number
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      ...(key !== 'page' ? { page: 1 } : {}),
    }));
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
    url: string;
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

  const rows = data?.data?.map((cert: Certificate, index: number) => {
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
                href={cert.url}
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
    <Box>
      <Group justify="space-between" mb="md">
        <Title order={2}>Gestion des attestations</Title>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={open}
          loading={generateCertificate.isPending}
        >
          Générer une attestation
        </Button>
      </Group>

      <Paper withBorder p="md" mb="md">
        <Group gap="md">
          <TextInput
            placeholder="Rechercher par nom ou email..."
            leftSection={<IconSearch size={16} />}
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            style={{ flex: 1 }}
          />
          {/* <Select
            placeholder="Statut"
            data={statusOptions}
            value={filters.statut}
            onChange={(value) => handleFilterChange('statut', value || '')}
          /> */}
        </Group>
      </Paper>

      <Paper withBorder>
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
      </Paper>

      {data?.pagination?.totalPages > 1 && (
        <Center mt="md">
          <Pagination
            total={data?.pagination?.totalPages || 1}
            value={filters.page}
            onChange={(page) => handleFilterChange('page', page)}
            mt="md"
            style={{ justifyContent: 'flex-end' }}
          />
        </Center>
      )}
    </Box>
  );
}
