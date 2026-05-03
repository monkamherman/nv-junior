import {
  ActionIcon,
  Alert,
  Badge,
  Box,
  Button,
  Center,
  Loader,
  Menu,
  Modal,
  Pagination,
  Paper,
  Table,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconDots,
  IconEdit,
  IconPlus,
  IconSearch,
  IconTrash,
} from '@tabler/icons-react';
import { useState } from 'react';
import type { User } from '../../../api/user.api';
import { UserForm } from '../components/UserForm';
import { useDeleteUser, useUsers } from '../hooks/useUsers';
// Interface pour typer la réponse d'erreur de l'API
interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}
const ROLES = [
  { value: 'ADMIN', label: 'Administrateur' },
  { value: 'FORMATEUR', label: 'Formateur' },
  { value: 'APPRENANT', label: 'Apprenant' },
] as const;

type UserFilters = {
  search?: string;
  role?: string;
  page?: number;
  limit?: number;
};

export function UsersList() {
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    role: '',
    page: 1,
    limit: 10,
  });

  const [opened, { open, close }] = useDisclosure(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const { data: users = [], isLoading, error } = useUsers(filters);

  const { mutate: deleteUser } = useDeleteUser();

  const handleDelete = (id: string) => {
    if (
      window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')
    ) {
      deleteUser(id, {
        onSuccess: () => {
          notifications.show({
            title: 'Succès',
            message: 'Utilisateur supprimé avec succès',
            color: 'green',
          });
        },
        onError: (error: unknown) => {
          const apiError = error as ApiError;
          notifications.show({
            title: 'Erreur',
            message:
              apiError.response?.data?.message ||
              'Erreur lors de la suppression',
            color: 'red',
          });
        },
      });
    }
  };

  const handleFilterChange = (
    key: keyof UserFilters,
    value: string | number | undefined
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      ...(key !== 'page' ? { page: 1 } : {}),
    }));
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    open();
  };

  const handleCreate = () => {
    setSelectedUser(null);
    open();
  };

  const handleClose = () => {
    setSelectedUser(null);
    close();
  };

  if (isLoading) {
    return (
      <Center style={{ height: '50vh' }}>
        <Loader size="xl" />
      </Center>
    );
  }

  if (error) {
    return (
      <Alert color="red" title="Erreur" style={{ margin: '20px' }}>
        Une erreur est survenue lors du chargement des utilisateurs.
      </Alert>
    );
  }

  const renderUserRows = () => {
    if (!Array.isArray(users)) return null;

    return users.map((user: User) => (
      <tr key={user.id}>
        <td style={{ padding: '1rem 1.5rem' }}>
          <Text fw={500}>
            {user.prenom} {user.nom}
          </Text>
        </td>
        <td style={{ padding: '1rem 1.5rem' }}>{user.email}</td>
        <td style={{ padding: '1rem 1.5rem' }}>{user.telephone || '-'}</td>
        <td>
          <Badge
            color={
              user.role === 'ADMIN'
                ? 'red'
                : user.role === 'FORMATEUR'
                  ? 'blue'
                  : 'green'
            }
          >
            {ROLES.find((r) => r.value === user.role)?.label || user.role}
          </Badge>
        </td>
        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
        <td>
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '5rem',
            }}
          >
            <Menu position="bottom-end" withArrow>
              <Menu.Target>
                <ActionIcon variant="subtle" color="gray">
                  <IconDots size="1rem" stroke={1.5} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  leftSection={<IconEdit size={16} />}
                  onClick={() => handleEdit(user)}
                >
                  Modifier
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconTrash size={16} />}
                  color="red"
                  onClick={() => handleDelete(user.id)}
                >
                  Supprimer
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </div>
        </td>
      </tr>
    ));
  };

  return (
    <Box p="md">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
        }}
      >
        <Title order={2}>Gestion des utilisateurs</Title>
        <Button leftSection={<IconPlus size={16} />} onClick={handleCreate}>
          Ajouter un utilisateur
        </Button>
      </div>

      <Paper withBorder p="md" mb="md">
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            marginBottom: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <TextInput
            placeholder="Rechercher..."
            leftSection={<IconSearch size={16} />}
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            style={{ flex: 1 }}
          />
        </div>

        <Table striped highlightOnHover>
          <thead>
            <tr className="gap-4">
              <th style={{ padding: '1rem 1.5rem' }}>Nom</th>
              <th style={{ padding: '1rem 1.5rem' }}>Email</th>
              <th style={{ padding: '1rem 1.5rem' }}>Téléphone</th>
              <th style={{ padding: '1rem 1.5rem' }}>Rôle</th>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>{renderUserRows()}</tbody>
        </Table>

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: '1rem',
          }}
        >
          <Pagination
            value={filters.page}
            onChange={(page) => handleFilterChange('page', page)}
            total={Math.ceil(users.length / (filters.limit || 10))}
          />
        </div>
      </Paper>

      <Modal
        opened={opened}
        onClose={handleClose}
        title={selectedUser ? 'Modifier utilisateur' : 'Nouvel utilisateur'}
        size="lg"
      >
        <UserForm user={selectedUser || undefined} onSuccess={handleClose} />
      </Modal>
    </Box>
  );
}
