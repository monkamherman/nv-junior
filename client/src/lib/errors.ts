import { AxiosError } from 'axios';
import { recordError } from './error-store';

type ApiErrorPayload = {
  success?: boolean;
  code?: string;
  message?: string;
  error?: string;
  details?: string;
  traceId?: string;
};

export interface NormalizedAppError {
  code: string;
  message: string;
  traceId?: string;
  details?: unknown;
}

export function normalizeError(
  error: unknown,
  fallback = 'Une erreur inattendue est survenue.'
): NormalizedAppError {
  if (error instanceof AxiosError) {
    const payload = error.response?.data as ApiErrorPayload | undefined;
    return {
      code: payload?.code || error.code || 'HTTP_ERROR',
      message:
        payload?.message || payload?.error || payload?.details || error.message || fallback,
      traceId: payload?.traceId,
      details: payload?.details,
    };
  }

  if (error instanceof Error) {
    return {
      code: 'APP_ERROR',
      message: error.message || fallback,
    };
  }

  return {
    code: 'UNKNOWN_ERROR',
    message: fallback,
  };
}

export function getErrorMessage(
  error: unknown,
  fallback = 'Une erreur inattendue est survenue.'
): string {
  if (error instanceof AxiosError) {
    const payload = error.response?.data as ApiErrorPayload | undefined;

    if (!navigator.onLine) {
      return 'Vous semblez hors ligne. Vérifiez votre connexion internet.';
    }

    if (
      error.code === 'ECONNABORTED' ||
      error.code === 'ERR_NETWORK' ||
      error.message.toLowerCase().includes('timeout')
    ) {
      return "Le serveur met trop de temps à répondre. Réessayez dans un instant.";
    }

    return payload?.message || payload?.error || payload?.details || error.message || fallback;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export function captureError(error: unknown, context?: string): NormalizedAppError {
  const normalized = normalizeError(error);
  recordError({
    code: normalized.code,
    message: normalized.message,
    traceId: normalized.traceId,
    context,
  });
  return normalized;
}
