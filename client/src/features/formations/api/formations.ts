import { api } from '@/lib/api';
import type { FormationFormValues } from '../schemas/formation.schema';

interface ApiError extends Error {
  validationErrors?: Record<string, string>;
}

type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  data: T;
};

function unwrapResponse<T>(payload: unknown): T {
  if (
    payload &&
    typeof payload === 'object' &&
    'data' in payload &&
    (payload as { data?: unknown }).data !== undefined
  ) {
    return (payload as ApiEnvelope<T>).data;
  }
  return payload as T;
}

export async function createFormation(
  data: FormationFormValues
) {
  try {
    const response = await api.post('/api/formations', data);
    return unwrapResponse<unknown>(response.data);
  } catch (error) {
    // AxiosError: si le backend renvoie une structure de validation, on la mappe
    const maybeAxios = error as {
      response?: {
        status?: number;
        data?: unknown;
      };
      message?: string;
    };

    const status = maybeAxios.response?.status;
    const payload = maybeAxios.response?.data as { errors?: Array<{ path: string; message: string }>; message?: string } | undefined;

    if (status === 400 && payload?.errors) {
      const validationErrors = payload.errors.reduce(
        (acc: Record<string, string>, item) => {
          acc[item.path] = item.message;
          return acc;
        },
        {}
      );

      const err: ApiError = new Error('Validation failed');
      err.validationErrors = validationErrors;
      throw err;
    }

    const backendMessage = payload?.message;
    throw new Error(backendMessage || maybeAxios.message || 'Erreur lors de la création de la formation');
  }
}

export async function getFormation(id: string, token: string) {
  const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/formations/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      error.message || 'Erreur lors de la récupération de la formation'
    );
  }

  return response.json();
}

export async function getFormationById(id: string) {
  const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/formations/${id}/public`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      error.message || 'Erreur lors de la récupération de la formation'
    );
  }

  return response.json();
}

export async function getAllFormations() {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/formations/public`);

    if (!response.ok) {
      // Si le serveur retourne une erreur 500 ou autre, on lance une erreur
      throw new Error(
        `HTTP ${response.status}: ${response.statusText || 'Erreur serveur'}`
      );
    }

    // Vérifier si la réponse contient du contenu avant de parser
    const text = await response.text();
    if (!text || text.trim() === '') {
      throw new Error('Réponse vide du serveur');
    }

    // Essayer de parser le JSON
    try {
      const data = JSON.parse(text);
      return data;
    } catch (parseError) {
      console.error('Erreur de parsing JSON:', parseError);
      console.error('Réponse brute:', text);
      throw new Error('Réponse invalide du serveur (JSON mal formé)');
    }
  } catch (error) {
    // Gérer les erreurs réseau et autres
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Erreur de connexion au serveur');
  }
}

export async function simulatePayment(formationId: string, userId: string) {
  const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/paiements/simulate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      formationId,
      userId,
      montant: 0, // Sera déterminé côté serveur
      methode: 'simulation',
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erreur lors du paiement');
  }

  return response.json();
}

export async function generateAttestation(formationId: string, userId: string) {
  const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/attestations/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      formationId,
      userId,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      error.message || "Erreur lors de la génération de l'attestation"
    );
  }

  const result = await response.json();

  // Télécharger le PDF si disponible
  if (result.urlPdf) {
    const link = document.createElement('a');
    link.href = `${import.meta.env.VITE_API_URL || ''}${result.urlPdf}`;
    link.download = `attestation-formation-${formationId}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  return result;
}

export async function getUserAttestations(userId: string) {
  const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/attestations/user/${userId}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      error.message || 'Erreur lors de la récupération des attestations'
    );
  }

  return response.json();
}
