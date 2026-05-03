import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Pencil, Plus, RefreshCw, Search, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Import des composants UI
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AttestationButton } from '@/features/attestations/components/AttestationButton';

// Import des hooks personnalisés
import { useDeleteFormation, useFormations } from '../hooks/useFormations';

// Composants UI personnalisés pour remplacer les composants manquants
const Table = ({ children }: { children: React.ReactNode }) => (
  <div className="w-full overflow-x-auto">
    <table className="w-full">{children}</table>
  </div>
);

const TableHeader = ({ children }: { children: React.ReactNode }) => (
  <thead className="text-left">{children}</thead>
);

const TableBody = ({ children }: { children: React.ReactNode }) => (
  <tbody>{children}</tbody>
);

const TableRow = ({ children }: { children: React.ReactNode }) => (
  <tr className="border-b">{children}</tr>
);

const TableHead = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => <th className={`p-2 text-left ${className}`}>{children}</th>;

const TableCell = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => <td className={`p-2 ${className}`}>{children}</td>;

const AlertDialog = ({
  open,
  children,
  onClose,
}: {
  open: boolean;
  children: React.ReactNode;
  onClose: () => void;
}) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg bg-white p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

const AlertDialogHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="mb-4">{children}</div>
);

const AlertDialogTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-lg font-semibold">{children}</h3>
);

const AlertDialogDescription = ({
  children,
}: {
  children: React.ReactNode;
}) => <p className="mt-2 text-sm text-gray-600">{children}</p>;

const AlertDialogFooter = ({ children }: { children: React.ReactNode }) => (
  <div className="mt-6 flex justify-end space-x-2">{children}</div>
);

const AlertDialogAction = ({
  children,
  onClick,
  disabled = false,
  className = '',
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`rounded-md px-4 py-2 ${disabled ? 'cursor-not-allowed opacity-50' : ''} ${className}`}
  >
    {children}
  </button>
);

const AlertDialogCancel = ({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className="rounded-md border border-gray-300 px-4 py-2 hover:bg-gray-50"
  >
    {children}
  </button>
);

const AlertDialogContent = ({ children }: { children: React.ReactNode }) => (
  <div className="w-full max-w-md rounded-lg bg-white p-6">{children}</div>
);

export function FormationsList() {
  return (
    <ProtectedRoute>
      <FormationsListContent />
    </ProtectedRoute>
  );
}

function FormationsListContent() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [formationToDelete, setFormationToDelete] = useState<string | null>(
    null
  );

  const { data: formations = [], isLoading, error, refetch } = useFormations();
  const deleteMutation = useDeleteFormation();

  // Filtrer les formations en temps réel
  const filteredFormations = formations.filter((formation) => {
    const matchesSearch =
      formation.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      formation.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || formation.statut === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async () => {
    if (!formationToDelete) return;

    try {
      await deleteMutation.mutateAsync(formationToDelete);
      setFormationToDelete(null);
    } catch (error) {
      console.error('Erreur lors de la suppression de la formation:', error);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'EN_COURS':
        return 'default';
      case 'TERMINE':
        return 'secondary';
      case 'A_VENIR':
        return 'outline';
      default:
        return 'default';
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto mb-4 h-8 w-8 animate-spin text-blue-500" />
          <p className="text-lg font-medium">Chargement des formations...</p>
          <p className="mt-2 text-sm text-gray-500">Veuillez patienter</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <div className="max-w-md text-center">
          <div className="mb-4 text-red-500">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-medium text-gray-900">
            Erreur de chargement
          </h3>
          <p className="mb-4 text-sm text-gray-500">
            Une erreur est survenue lors du chargement des formations.
          </p>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Formations</h2>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isLoading}
            className="flex items-center space-x-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
            />
            <span>Actualiser</span>
          </Button>
          <Button onClick={() => navigate('/dashboard/formations/new')}>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle formation
          </Button>
        </div>
      </div>

      {/* Section de recherche et filtrage */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher une formation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous les statuts</option>
                <option value="BROUILLON">Brouillon</option>
                <option value="OUVERTE">Ouverte</option>
                <option value="TERMINEE">Terminée</option>
              </select>
            </div>
          </div>
          {filteredFormations.length !== formations.length && (
            <p className="mt-2 text-sm text-gray-600">
              {filteredFormations.length} formation(s) trouvée(s) sur{' '}
              {formations.length}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Liste des formations ({filteredFormations.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredFormations.length === 0 ? (
            <div className="py-8 text-center">
              <p className="mb-4 text-muted-foreground">
                {formations.length === 0
                  ? 'Aucune formation pour le moment.'
                  : 'Aucune formation ne correspond à votre recherche.'}
              </p>
              {searchTerm && (
                <Button variant="outline" onClick={() => setSearchTerm('')}>
                  Effacer la recherche
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead>Date de début</TableHead>
                  <TableHead>Date de fin</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Formateur</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFormations.map((formation) => (
                  <TableRow key={formation.id}>
                    <TableCell className="font-medium">
                      {formation.titre}
                    </TableCell>
                    <TableCell>
                      {format(new Date(formation.dateDebut), 'PP', {
                        locale: fr,
                      })}
                    </TableCell>
                    <TableCell>
                      {format(new Date(formation.dateFin), 'PP', {
                        locale: fr,
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(formation.statut)}>
                        {formation.statut.replace('_', ' ').toLowerCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formation.formateur?.prenom} {formation.formateur?.nom}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            navigate(
                              `/dashboard/formations/edit/${formation.id}`
                            )
                          }
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Modifier</span>
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setFormationToDelete(formation.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Supprimer</span>
                        </Button>

                        <AttestationButton
                          formationId={formation.id}
                          formationPrix={formation.prix}
                          className="h-8 w-8 p-0"
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={!!formationToDelete}
        onClose={() => setFormationToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Voulez-vous vraiment supprimer
              cette formation ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setFormationToDelete(null)}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? 'Suppression...' : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
