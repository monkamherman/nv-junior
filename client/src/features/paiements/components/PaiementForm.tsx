import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { getErrorMessage } from '@/lib/errors';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { paiementService } from '../services/paiementService';

const paiementSchema = z.object({
  mode: z.enum(['ORANGE_MONEY', 'MTN_MONEY']),
  telephone: z
    .string()
    .min(9, 'Le numéro de téléphone est requis')
    .regex(
      /^[0-9]+$/,
      'Le numéro de téléphone ne doit contenir que des chiffres'
    ),
});

type PaiementFormValues = z.infer<typeof paiementSchema>;

interface PaiementFormProps {
  formationId: string;
  montant: number;
  onSuccess: (reference?: string) => void;
}

export function PaiementForm({
  formationId,
  montant,
  onSuccess,
}: PaiementFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  const selectedMethod =
    (searchParams.get('method') as 'ORANGE_MONEY' | 'MTN_MONEY') ||
    'ORANGE_MONEY';

  const form = useForm<PaiementFormValues>({
    resolver: zodResolver(paiementSchema),
    defaultValues: {
      mode: selectedMethod,
      telephone: '',
    },
  });

  const onSubmit = async (data: PaiementFormValues) => {
    try {
      setIsLoading(true);

      const result = await paiementService.creerPaiement({
        formationId,
        montant,
        methode: selectedMethod === 'ORANGE_MONEY' ? 'orange' : 'mtn',
        numeroTelephone: data.telephone,
      });

      const paiement = result.paiement;

      toast({
        title: 'Paiement initié avec succès',
        description:
          paiement.statut === 'VALIDE'
            ? 'Votre paiement a été validé avec succès.'
            : 'Votre paiement a été enregistré et est en cours de traitement.',
      });

      setTimeout(() => {
        onSuccess(paiement.reference);
      }, 1500);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: getErrorMessage(
          error,
          'Une erreur est survenue lors du traitement de votre paiement.'
        ),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-muted p-4">
        <p className="text-sm text-muted-foreground">
          Montant à payer:{' '}
          <span className="font-semibold text-foreground">{montant} FCFA</span>
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="rounded-lg bg-muted p-4">
            <p className="mb-2 text-sm text-muted-foreground">
              Méthode de paiement
            </p>
            <p className="font-semibold text-foreground">
              {selectedMethod === 'ORANGE_MONEY'
                ? 'Orange Money'
                : 'MTN Mobile Money'}
            </p>
          </div>

          <FormField
            control={form.control}
            name="telephone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Numéro de téléphone</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">
                      {selectedMethod === 'ORANGE_MONEY' ? '+225' : '+237'}
                    </span>
                    <Input
                      placeholder={
                        selectedMethod === 'ORANGE_MONEY'
                          ? '07 12 34 56 78'
                          : '6 12 34 56 78'
                      }
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        field.onChange(value);
                      }}
                    />
                  </div>
                </FormControl>
                <p className="text-sm text-muted-foreground">
                  Entrez votre numéro de téléphone pour recevoir la demande de
                  paiement
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Traitement en cours...
              </>
            ) : (
              'Payer maintenant'
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
