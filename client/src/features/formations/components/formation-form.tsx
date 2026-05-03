'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
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
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from '@/components/ui/use-toast';
import { formationSchema, type FormationFormValues } from '../schemas/formation.schema';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FormationFormProps {
  onSubmit: (data: FormationFormValues) => Promise<void>;
  defaultValues?: Partial<FormationFormValues>;
  isSubmitting?: boolean;
  errors?: Record<string, string>;
}

export function FormationForm({ onSubmit, defaultValues, isSubmitting = false, errors = {} }: FormationFormProps) {
  const form = useForm<FormationFormValues>({
    resolver: zodResolver(formationSchema),
    defaultValues: {
      titre: '',
      description: '',
      prix: 0,
      dateDebut: format(new Date(), 'yyyy-MM-dd'),
      dateFin: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
      statut: 'BROUILLON',
      ...defaultValues,
    } as FormationFormValues,
  });

  // Effet pour afficher les erreurs de validation du serveur
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

  const handleSubmit = async (data: FormationFormValues) => {
    try {
      console.log('Données du formulaire à soumettre:', data);
      await onSubmit(data);
    } catch (error) {
      console.error('Erreur lors de la soumission du formulaire:', error);
      // Les erreurs sont maintenant gérées par le composant parent
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                      <Input
                        type="date"
                        {...field}
                        min={today}
                      />
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
                      <Input
                        type="date"
                        {...field}
                        min={startDate}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          </div>

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
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
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
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="min-w-[200px]"
          >
            {isSubmitting ? 'Enregistrement...' : 'Enregistrer la formation'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
