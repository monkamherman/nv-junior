'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { api } from '@/lib/api';
import { formationSchema, type FormationFormValues } from '../schemas/formation.schema';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Formateur = {
  id: string;
  nom: string;
  prenom: string;
  email?: string | null;
  qualificationProfessionnelle: string;
};

interface FormationFormProps {
  onSubmit: (data: FormationFormValues) => Promise<void>;
  defaultValues?: Partial<FormationFormValues>;
  isSubmitting?: boolean;
  errors?: Record<string, string>;
}

export function FormationForm({
  onSubmit,
  defaultValues,
  isSubmitting = false,
  errors = {},
}: FormationFormProps) {
  const { data: formateurs = [] } = useQuery<Formateur[]>({
    queryKey: ['dashboard-formateurs'],
    queryFn: async () => {
      const { data } = await api.get('/api/dashboard/formateurs');
      return data;
    },
  });

  const form = useForm<FormationFormValues>({
    resolver: zodResolver(formationSchema),
    defaultValues: {
      titre: '',
      description: '',
      prix: 0,
      dateDebut: format(new Date(), 'yyyy-MM-dd'),
      dateFin: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
      statut: 'BROUILLON',
      formateurIds: [],
      ...defaultValues,
    } as FormationFormValues,
  });

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      Object.entries(errors).forEach(([fieldName, errorMessage]) => {
        form.setError(fieldName as keyof FormationFormValues, {
          type: 'server',
          message: errorMessage,
        });
      });
    }
  }, [errors, form]);

  const selectedFormateurIds = form.watch('formateurIds') || [];

  const toggleFormateur = (formateurId: string) => {
    const current = new Set(selectedFormateurIds);
    if (current.has(formateurId)) {
      current.delete(formateurId);
    } else {
      current.add(formateurId);
    }
    form.setValue('formateurIds', Array.from(current), {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const handleSubmit = async (data: FormationFormValues) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Erreur lors de la soumission du formulaire:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 gap-6">
          <FormField
            control={form.control}
            name="titre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Titre de la formation</FormLabel>
                <FormControl>
                  <Input placeholder="Titre de la formation" {...field} />
                </FormControl>
                <FormDescription>
                  Le titre doit être clair et descriptif
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Description détaillée de la formation..."
                    className="min-h-[120px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <FormField
              control={form.control}
              name="prix"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prix (FCFA)</FormLabel>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dateDebut"
              render={({ field }) => {
                const today = format(new Date(), 'yyyy-MM-dd');
                return (
                  <FormItem>
                    <FormLabel>Date de début</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} min={today} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <FormField
              control={form.control}
              name="dateFin"
              render={({ field }) => {
                const startDate = form.watch('dateDebut') || format(new Date(), 'yyyy-MM-dd');
                return (
                  <FormItem>
                    <FormLabel>Date de fin</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} min={startDate} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          </div>

          <FormField
            control={form.control}
            name="formateurIds"
            render={() => (
              <FormItem>
                <FormLabel>Formateurs assignés</FormLabel>
                <FormDescription>
                  Sélectionnez un ou plusieurs formateurs manuels pour cette formation.
                </FormDescription>
                <div className="grid gap-3 md:grid-cols-2">
                  {formateurs.map((formateur) => {
                    const checked = selectedFormateurIds.includes(formateur.id);
                    return (
                      <label
                        key={formateur.id}
                        className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${checked ? 'border-blue-600 bg-blue-50' : 'border-slate-200 bg-white'}`}
                      >
                        <input
                          type="checkbox"
                          className="mt-1"
                          checked={checked}
                          onChange={() => toggleFormateur(formateur.id)}
                        />
                        <div className="space-y-1">
                          <div className="font-medium">
                            {formateur.prenom} {formateur.nom}
                          </div>
                          <div className="text-sm text-slate-600">
                            {formateur.qualificationProfessionnelle}
                          </div>
                          {formateur.email && (
                            <div className="text-xs text-slate-500">{formateur.email}</div>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
                {formateurs.length === 0 && (
                  <p className="text-sm text-amber-600">
                    Aucun formateur disponible. Créez d'abord les formateurs depuis le dashboard.
                  </p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="statut"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Statut de la formation</FormLabel>
                  <FormDescription>
                    Une formation en brouillon n'est pas visible des apprenants
                  </FormDescription>
                </div>
                <FormControl>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Sélectionner un statut" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="BROUILLON">Brouillon</SelectItem>
                      <SelectItem value="OUVERTE">Ouverte</SelectItem>
                      <SelectItem value="TERMINEE">Terminée</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
            disabled={isSubmitting}
          >
            Réinitialiser
          </Button>
          <Button type="submit" disabled={isSubmitting} className="min-w-[200px]">
            {isSubmitting ? 'Enregistrement...' : 'Enregistrer la formation'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
