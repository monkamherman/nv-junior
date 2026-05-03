import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Phone } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { PaymentDetails } from './types';

// Schéma de validation avec Zod
const paymentFormSchema = z.object({
  phoneNumber: z
    .string()
    .min(9, 'Le numéro doit contenir au moins 9 chiffres')
    .max(15, 'Numéro trop long')
    .regex(/^[0-9]+$/, 'Le numéro ne doit contenir que des chiffres'),
  amount: z.number().min(500, 'Le montant minimum est de 500 FCFA'),
  paymentMethod: z.enum(['orange', 'mtn']),
});

type PaymentFormValues = z.infer<typeof paymentFormSchema>;

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPaymentSubmit: (details: PaymentDetails) => Promise<void>;
  formationId: string;
  formationPrix: number;
  isProcessing?: boolean;
}

export function PaymentDialog({
  open,
  onOpenChange,
  onPaymentSubmit,
  formationId,
  formationPrix,
  isProcessing = false,
}: PaymentDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      phoneNumber: '',
      amount: formationPrix,
      paymentMethod: 'orange',
    },
  });

  const selectedMethod = watch('paymentMethod');

  // Mettre à jour le montant quand le prix de la formation change
  useEffect(() => {
    setValue('amount', formationPrix);
  }, [formationPrix, setValue]);

  useEffect(() => {
    // Réinitialiser le formulaire quand la boîte de dialogue s'ouvre
    if (open) {
      reset({
        phoneNumber: '',
        amount: formationPrix,
        paymentMethod: 'orange',
      });
      setIsSubmitting(false);
    }
  }, [open, formationPrix, reset]);

  const onSubmit = async (data: PaymentFormValues) => {
    if (!formationId) {
      console.error(
        "L'identifiant de formation est requis pour enregistrer le paiement."
      );
      return;
    }

    try {
      setIsSubmitting(true);
      console.log('Soumission du formulaire de paiement:', data);

      const paymentDetails: PaymentDetails = {
        methode: data.paymentMethod,
        numeroTelephone: data.phoneNumber,
        montant: data.amount,
        formationId,
      };

      await onPaymentSubmit(paymentDetails);

      // Toast attestation
      toast({
        title: 'Attestation',
        description: 'Votre attestation est maintenant disponible.',
        variant: 'default',
      });

      // Toast paiement
      toast({
        title: 'Paiement',
        description: 'Votre paiement a été enregistré avec succès.',
        variant: 'default',
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Erreur lors de la soumission du formulaire:', error);

      // Gérer le cas PAYMENT_ALREADY_ENROLLED
      const responsePayload = (error as { response?: { data?: unknown } })
        .response?.data as
        | {
            code?: string;
            message?: string;
            details?: { alreadyEnrolled?: boolean };
          }
        | undefined;

      if (responsePayload?.code === 'PAYMENT_ALREADY_ENROLLED') {
        // Toast attestation
        toast({
          title: 'Attestation',
          description:
            responsePayload.message ||
            'Vous pouvez accéder directement à votre attestation depuis votre espace.',
          variant: 'default',
        });

        // Toast paiement
        toast({
          title: 'Paiement',
          description:
            responsePayload.message ||
            'Vous êtes déjà inscrit à cette formation.',
          variant: 'default',
        });

        onOpenChange(false);
        return;
      }

      // Ne pas fermer la boîte de dialogue en cas d'erreur
      // L'erreur est gérée dans le parent
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (!isSubmitting && !isProcessing) {
      onOpenChange(false);
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Paiement par mobile money</DialogTitle>
          <DialogDescription>
            Remplissez les informations pour procéder au paiement sécurisé. Un
            code de confirmation vous sera envoyé par SMS.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            {/* Sélection de la méthode de paiement */}
            <div className="space-y-2">
              <Label>Méthode de paiement</Label>
              <RadioGroup
                defaultValue="orange"
                className="grid grid-cols-2 gap-3"
                onValueChange={(value) =>
                  setValue('paymentMethod', value as 'orange' | 'mtn')
                }
                value={selectedMethod}
              >
                <div className="flex items-center space-x-3 rounded-md border p-3 transition-colors hover:bg-accent/50">
                  <RadioGroupItem value="orange" id="orange" />
                  <Label
                    htmlFor="orange"
                    className="flex cursor-pointer items-center gap-2"
                  >
                    <img
                      src="/payment/orange.png"
                      alt="Orange Money"
                      className="h-6 w-6 object-contain"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                    <span>Orange Money</span>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 rounded-md border p-3 transition-colors hover:bg-accent/50">
                  <RadioGroupItem value="mtn" id="mtn" />
                  <Label
                    htmlFor="mtn"
                    className="flex cursor-pointer items-center gap-2"
                  >
                    <img
                      src="/payment/mtn.png"
                      alt="MTN Mobile Money"
                      className="h-6 w-6 object-contain"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                    <span>MTN MoMo</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Numéro de téléphone */}
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">
                Numéro{' '}
                {selectedMethod === 'orange' ? 'Orange Money' : 'MTN MoMo'}
              </Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                </div>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="Ex: 0700000000"
                  className="pl-10"
                  {...register('phoneNumber')}
                  disabled={isSubmitting || isProcessing}
                />
              </div>
              {errors.phoneNumber && (
                <p className="text-sm text-red-500">
                  {errors.phoneNumber.message}
                </p>
              )}
            </div>

            {/* Montant */}
            <div className="space-y-2">
              <Label htmlFor="amount">Montant (FCFA)</Label>
              <div className="relative">
                <Input
                  id="amount"
                  type="number"
                  value={formationPrix}
                  readOnly
                  className="cursor-not-allowed border-gray-200 bg-gray-50 pl-10"
                  disabled={isSubmitting || isProcessing}
                />
              </div>
              <p className="text-sm text-gray-500">
                Montant fixe pour cette formation
              </p>
            </div>
          </div>

          <DialogFooter className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting || isProcessing}
              className="w-full sm:w-auto"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isProcessing}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting || isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Traitement...
                </>
              ) : (
                `Confirmer le paiement`
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
