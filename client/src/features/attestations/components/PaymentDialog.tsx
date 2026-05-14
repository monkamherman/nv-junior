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

const paymentFormSchema = z.object({
  phoneNumber: z
    .string()
    .min(9, 'Le numéro doit contenir au moins 9 chiffres')
    .max(15, 'Numéro trop long')
    .regex(/^[0-9]+$/, 'Le numéro ne doit contenir que des chiffres'),
  amount: z.number().positive('Le montant doit être supérieur à 0'),
  paymentMethod: z.enum(['orange', 'mtn']),
});

type PaymentFormValues = z.infer<typeof paymentFormSchema>;

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPaymentSubmit: (details: PaymentDetails) => Promise<void>;
  formationId: string;
  formationPrix: number;
  remainingAmount?: number;
  isProcessing?: boolean;
}

export function PaymentDialog({
  open,
  onOpenChange,
  onPaymentSubmit,
  formationId,
  formationPrix,
  remainingAmount,
  isProcessing = false,
}: PaymentDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const payableAmount = remainingAmount ?? formationPrix;

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
      amount: payableAmount,
      paymentMethod: 'orange',
    },
  });

  const selectedMethod = watch('paymentMethod');

  useEffect(() => {
    setValue('amount', payableAmount);
  }, [payableAmount, setValue]);

  useEffect(() => {
    if (open) {
      reset({
        phoneNumber: '',
        amount: payableAmount,
        paymentMethod: 'orange',
      });
      setIsSubmitting(false);
    }
  }, [open, payableAmount, reset]);

  const onSubmit = async (data: PaymentFormValues) => {
    if (!formationId) {
      console.error(
        "L'identifiant de formation est requis pour enregistrer le paiement."
      );
      return;
    }

    if (data.amount > payableAmount) {
      toast({
        title: 'Montant invalide',
        description: `Le montant ne peut pas dépasser ${payableAmount.toLocaleString('fr-FR')} FCFA.`,
        variant: 'destructive',
      });
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

      toast({
        title: 'Paiement',
        description: 'Votre paiement a été enregistré avec succès.',
        variant: 'default',
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Erreur lors de la soumission du formulaire:', error);
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
            Réglez votre formation en une ou plusieurs tranches. L'attestation
            PDF sera disponible uniquement après paiement complet.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div className="rounded-md border bg-slate-50 p-3 text-sm text-slate-700">
              <p>Prix total: {formationPrix.toLocaleString('fr-FR')} FCFA</p>
              <p>Reste à payer: {payableAmount.toLocaleString('fr-FR')} FCFA</p>
            </div>

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

            <div className="space-y-2">
              <Label htmlFor="amount">Montant de la tranche (FCFA)</Label>
              <div className="relative">
                <Input
                  id="amount"
                  type="number"
                  max={payableAmount}
                  step="1"
                  {...register('amount', { valueAsNumber: true })}
                  disabled={isSubmitting || isProcessing}
                />
              </div>
              {errors.amount && (
                <p className="text-sm text-red-500">{errors.amount.message}</p>
              )}
              <p className="text-sm text-gray-500">
                Vous pouvez payer une tranche inférieure ou égale au reste à
                payer.
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
                'Confirmer la tranche'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
