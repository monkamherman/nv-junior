// src/pages/auth/Register.tsx
import { authApi } from '@/api';
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
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import * as z from 'zod';

const createSchema = (otpSent: boolean) => {
  return z
    .object({
      nom: z
        .string()
        .min(2, 'Le nom doit contenir au moins 2 caractères')
        .max(50, 'Le nom ne peut pas dépasser 50 caractères'),
      prenom: z
        .string()
        .min(2, 'Le prénom doit contenir au moins 2 caractères')
        .max(50, 'Le prénom ne peut pas dépasser 50 caractères'),
      email: z
        .string()
        .email('Email invalide')
        .max(100, "L'email ne peut pas dépasser 100 caractères"),
      telephone: z
        .string()
        .min(10, 'Le numéro de téléphone doit contenir au moins 10 chiffres')
        .max(15, 'Le numéro de téléphone ne peut pas dépasser 15 chiffres')
        .regex(
          /^[0-9+\s-]+$/,
          'Le numéro de téléphone ne doit contenir que des chiffres, des espaces, des tirets ou le signe +'
        ),
      motDePasse: z
        .string()
        .min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
      confirmPassword: z.string(),
      otp: otpSent
        ? z.string().min(6, 'Le code OTP est requis')
        : z.string().optional(),
    })
    .refine((data) => data.motDePasse === data.confirmPassword, {
      message: 'Les mots de passe ne correspondent pas',
      path: ['confirmPassword'],
    });
};

type FormValues = z.infer<ReturnType<typeof createSchema>>;

const Register = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [otpSent, setOtpSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(createSchema(otpSent)),
    defaultValues: {
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      motDePasse: '',
      confirmPassword: '',
      otp: '',
    },
  });

  // Mise à jour du schéma de validation lorsque otpSent change
  useEffect(() => {
    form.clearErrors();
  }, [otpSent, form]);

  const onSubmit = async (
    formValues: z.infer<ReturnType<typeof createSchema>>
  ) => {
    setIsSubmitting(true);
    try {
      if (!otpSent) {
        // Première étape : Envoi des informations et demande d'OTP
        await authApi.register({
          nom: formValues.nom,
          prenom: formValues.prenom,
          email: formValues.email,
          telephone: formValues.telephone,
          motDePasse: formValues.motDePasse,
        });

        // Activer le mode OTP sans réinitialiser le formulaire
        setOtpSent(true);

        toast({
          title: 'Code OTP envoyé',
          description: 'Veuillez vérifier votre email et entrer le code OTP',
        });
      } else {
        // Récupérer toutes les valeurs du formulaire
        const allValues = form.getValues();

        // Deuxième étape : Vérification de l'OTP et création du compte
        const response = await authApi.verifyOtp({
          email: allValues.email,
          otp: formValues.otp || '',
          nom: allValues.nom,
          prenom: allValues.prenom,
          telephone: allValues.telephone,
          motDePasse: allValues.motDePasse,
        });

        if (response.data.success) {
          // Connexion automatique après inscription réussie
          try {
            const loginResponse = await authApi.login({
              email: allValues.email,
              password: allValues.motDePasse,
            });

            // Stocker le token et rafraîchir le token
            if (loginResponse.data.access && loginResponse.data.refresh) {
              localStorage.setItem('token', loginResponse.data.access);
              localStorage.setItem('refresh_token', loginResponse.data.refresh);

              toast({
                title: 'Inscription réussie !',
                description: 'Vous êtes maintenant connecté.',
                variant: 'default',
              });

              // Redirection vers la page d'accueil
              navigate('/');
            }
          } catch (loginError) {
            console.error(
              'Erreur lors de la connexion automatique:',
              loginError
            );
            // Si la connexion automatique échoue, rediriger vers la page de connexion
            toast({
              title: 'Compte créé avec succès',
              description: 'Veuillez vous connecter avec vos identifiants.',
              variant: 'default',
            });
            navigate('/login');
          }
        } else {
          throw new Error(
            response.data.message || 'Échec de la création du compte'
          );
        }
      }
    } catch (error: unknown) {
      let errorMessage = 'Une erreur est survenue';

      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data?.message || error.message;

        // Si l'erreur concerne l'OTP, on réinitialise le formulaire
        if (error.response.data?.code === 'INVALID_OTP') {
          setOtpSent(false);
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      console.error("Erreur lors de l'inscription:", error);

      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-800 p-4">
      <div className="w-full max-w-md space-y-6 rounded-xl bg-white p-8 shadow-2xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Créer un compte</h1>
          <p className="text-muted-foreground">
            {otpSent
              ? 'Entrez le code OTP reçu par email'
              : 'Entrez vos informations pour créer un compte'}
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div
              className={`space-y-4 ${otpSent ? 'opacity-50' : ''}`}
              style={{ filter: otpSent ? 'blur(2px)' : 'none' }}
            >
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="prenom"
                  disabled={otpSent || isSubmitting}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prénom</FormLabel>
                      <FormControl>
                        <Input placeholder="Votre prénom" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="nom"
                  disabled={otpSent || isSubmitting}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom</FormLabel>
                      <FormControl>
                        <Input placeholder="Votre nom" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                disabled={otpSent || isSubmitting}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="votre@email.com"
                        type="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="telephone"
                disabled={otpSent || isSubmitting}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Téléphone</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Votre numéro de téléphone"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="motDePasse"
                disabled={otpSent || isSubmitting}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mot de passe</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                disabled={otpSent || isSubmitting}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmer le mot de passe</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {otpSent && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="otp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Code OTP</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Entrez le code reçu par email"
                          {...field}
                          className="text-center text-xl tracking-widest"
                          maxLength={6}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="link"
                  className="w-full text-sm text-muted-foreground"
                  onClick={() => setOtpSent(false)}
                >
                  Modifier les informations
                </Button>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-blue-600 text-white hover:bg-blue-900"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? 'Traitement en cours...'
                : otpSent
                  ? 'Vérifier le code OTP'
                  : "S'inscrire"}
            </Button>
          </form>
        </Form>

        <div className="text-center text-sm">
          Déjà un compte ?{' '}
          <Link
            to="/login"
            className="font-medium text-blue-600 hover:underline"
          >
            Se connecter
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
