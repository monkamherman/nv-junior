import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';

type Formateur = {
  id: string;
  nom: string;
  prenom: string;
  email?: string | null;
  telephone?: string | null;
  qualificationProfessionnelle: string;
  bio?: string | null;
  _count?: {
    formations: number;
  };
};

function FormateursPageContent() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    qualificationProfessionnelle: '',
    bio: '',
  });

  const { data: formateurs = [], isLoading } = useQuery<Formateur[]>({
    queryKey: ['dashboard-formateurs'],
    queryFn: async () => {
      const { data } = await api.get('/api/dashboard/formateurs');
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/api/dashboard/formateurs', form);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-formateurs'] });
      setForm({
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        qualificationProfessionnelle: '',
        bio: '',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/dashboard/formateurs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-formateurs'] });
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Formateurs</h2>
        <p className="text-sm text-muted-foreground">
          Gérez ici les formateurs métiers, indépendamment des utilisateurs de la plateforme.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Créer un formateur</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              placeholder="Nom"
              value={form.nom}
              onChange={(e) => setForm((current) => ({ ...current, nom: e.target.value }))}
            />
            <Input
              placeholder="Prénom"
              value={form.prenom}
              onChange={(e) => setForm((current) => ({ ...current, prenom: e.target.value }))}
            />
            <Input
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))}
            />
            <Input
              placeholder="Téléphone"
              value={form.telephone}
              onChange={(e) => setForm((current) => ({ ...current, telephone: e.target.value }))}
            />
          </div>
          <Input
            placeholder="Qualification professionnelle"
            value={form.qualificationProfessionnelle}
            onChange={(e) =>
              setForm((current) => ({
                ...current,
                qualificationProfessionnelle: e.target.value,
              }))
            }
          />
          <Textarea
            placeholder="Bio ou présentation courte"
            value={form.bio}
            onChange={(e) => setForm((current) => ({ ...current, bio: e.target.value }))}
          />
          <div className="flex justify-end">
            <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Création...' : 'Créer le formateur'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Liste des formateurs</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Chargement...</p>
          ) : (
            <div className="space-y-4">
              {formateurs.map((formateur) => (
                <div
                  key={formateur.id}
                  className="flex flex-col gap-3 rounded-lg border p-4 md:flex-row md:items-start md:justify-between"
                >
                  <div className="space-y-1">
                    <div className="text-lg font-semibold">
                      {formateur.prenom} {formateur.nom}
                    </div>
                    <div className="text-sm text-slate-600">
                      {formateur.qualificationProfessionnelle}
                    </div>
                    {formateur.email && (
                      <div className="text-sm text-slate-500">{formateur.email}</div>
                    )}
                    {formateur.telephone && (
                      <div className="text-sm text-slate-500">{formateur.telephone}</div>
                    )}
                    {formateur.bio && (
                      <p className="text-sm text-slate-600">{formateur.bio}</p>
                    )}
                    <div className="text-xs text-slate-500">
                      Affecté à {formateur._count?.formations || 0} formation(s)
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteMutation.mutate(formateur.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Supprimer
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function FormateursPage() {
  return (
    <ProtectedRoute>
      <FormateursPageContent />
    </ProtectedRoute>
  );
}
