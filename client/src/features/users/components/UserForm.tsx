import { useState, useEffect } from 'react';
import { TextInput, PasswordInput, Select, Button, Group, Box, Text, Stack } from '@mantine/core';
import { useForm, isEmail, isNotEmpty, matchesField } from '@mantine/form';
import { User, UserFormData } from '../types';
import { useCreateUser, useUpdateUser } from '../hooks/useUsers';

type UserFormProps = {
  user?: User;
  onSuccess: () => void;
};

export function UserForm({ user, onSuccess }: UserFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();

  const form = useForm<UserFormData>({
    initialValues: {
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      role: 'APPRENANT',
      ...(user || {}),
      password: '',
      confirmPassword: '',
    },

    validate: {
      nom: isNotEmpty('Le nom est requis'),
      prenom: isNotEmpty('Le prénom est requis'),
      email: isEmail('Email invalide'),
      role: isNotEmpty('Le rôle est requis'),
      password: (value, values) => 
        !user && !value ? 'Le mot de passe est requis' : null,
      confirmPassword: (value, values) =>
        !user && value !== values.password ? 'Les mots de passe ne correspondent pas' : null,
    },
  });

  useEffect(() => {
    if (user) {
      form.setValues({
        ...user,
        password: '',
        confirmPassword: '',
      });
    }
  }, [user]);

  const handleSubmit = async (values: UserFormData) => {
    setIsSubmitting(true);
    
    try {
      const { confirmPassword, ...userData } = values;
      
      if (user) {
        // Mise à jour de l'utilisateur existant
        await updateUser.mutateAsync({
          id: user.id,
          ...userData,
          // Ne pas envoyer le mot de passe s'il est vide
          ...(values.password ? { password: values.password } : {}),
        });
      } else {
        // Création d'un nouvel utilisateur
        await createUser.mutateAsync(userData);
      }
      
      onSuccess();
    } catch (error) {
      console.error('Erreur lors de la soumission du formulaire:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={form.onSubmit(handleSubmit)}>
      <Stack spacing="md">
        <Group grow>
          <TextInput
            label="Prénom"
            placeholder="Prénom"
            required
            {...form.getInputProps('prenom')}
          />
          <TextInput
            label="Nom"
            placeholder="Nom"
            required
            {...form.getInputProps('nom')}
          />
        </Group>

        <TextInput
          label="Email"
          placeholder="email@exemple.com"
          required
          type="email"
          {...form.getInputProps('email')}
        />

        <TextInput
          label="Téléphone"
          placeholder="+33 6 12 34 56 78"
          {...form.getInputProps('telephone')}
        />

        <Select
          label="Rôle"
          placeholder="Sélectionner un rôle"
          required
          data={[
            { value: 'ADMIN', label: 'Administrateur' },
            { value: 'FORMATEUR', label: 'Formateur' },
            { value: 'APPRENANT', label: 'Apprenant' },
          ]}
          {...form.getInputProps('role')}
        />

        {!user && (
          <>
            <PasswordInput
              label="Mot de passe"
              placeholder="Mot de passe"
              required
              {...form.getInputProps('password')}
            />
            <PasswordInput
              label="Confirmer le mot de passe"
              placeholder="Confirmer le mot de passe"
              required
              {...form.getInputProps('confirmPassword')}
            />
          </>
        )}

        {user && (
          <Text size="sm" color="dimmed">
            Laissez les champs de mot de passe vides pour ne pas le modifier.
          </Text>
        )}

        <Group position="right" mt="md">
          <Button 
            type="submit" 
            loading={isSubmitting}
          >
            {user ? 'Mettre à jour' : 'Créer'}
          </Button>
        </Group>
      </Stack>
    </Box>
  );
}
