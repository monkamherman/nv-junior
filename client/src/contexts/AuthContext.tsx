import { authApi } from '@/api';
import { useToast } from '@/hooks/use-toast';
import { AUTH_EXPIRED_EVENT } from '@/api/api.config';
import { captureError, getErrorMessage } from '@/lib/errors';
import type { ReactNode } from 'react';
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from 'react';

export type User = {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  telephone?: string | null;
  role?: string;
};

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setIsLoggingIn] = useState(false);

  const clearAuthState = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  }, []);

  const redirectToLogin = useCallback((message?: string) => {
    clearAuthState();

    if (message) {
      toast({
        variant: 'destructive',
        title: 'Session expiree',
        description: message,
      });
    }

    if (!window.location.pathname.startsWith('/login')) {
      window.location.replace('/login');
    }
  }, [clearAuthState, toast]);

  const logout = useCallback(async (showToast = true) => {
    try {
      try {
        await Promise.race([
          authApi.logout(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('timeout')), 3000)
          )
        ]);
      } catch (error) {
        console.warn(
          "La déconnexion distante a échoué, mais l'utilisateur sera déconnecté localement.",
          error
        );
      }

      clearAuthState();

      if (showToast) {
        toast({
          title: 'Déconnexion',
          description: 'Vous avez été déconnecté avec succès.',
        });
      }

      if (!window.location.pathname.startsWith('/login')) {
        window.location.replace('/login');
      }
    } catch (error) {
      console.error('Erreur inattendue lors de la déconnexion:', error);
    }
  }, [clearAuthState, toast]);

  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      const refreshToken = localStorage.getItem('refresh_token');

      if (!refreshToken) {
        setUser(null);
        return;
      }

      const response = await authApi.refreshToken({ refresh: refreshToken });

      if (response.data?.data) {
        const { access, user: userData } = response.data.data;
        localStorage.setItem('token', access);
        setUser(userData);
      } else {
        redirectToLogin('Votre session a expire. Veuillez vous reconnecter.');
      }
    } catch (error) {
      captureError(error, 'auth.check');
      redirectToLogin(
        getErrorMessage(error, 'Impossible de verifier votre session.')
      );
    } finally {
      setIsLoading(false);
    }
  }, [redirectToLogin]);

  const login = useCallback(async (email: string, password: string) => {
    if (!email || !password) {
      throw new Error('Veuillez remplir tous les champs');
    }

    setIsLoggingIn(true);

    try {
      const response = await authApi.login({ email, password });
      const { access, refresh, user: userData } = response.data.data;

      localStorage.setItem('token', access);
      if (refresh) {
        localStorage.setItem('refresh_token', refresh);
      }

      setUser(userData);

      toast({
        title: 'Connexion reussie',
        description: `Bienvenue, ${userData.prenom} ${userData.nom}`,
      });

      window.location.replace('/');
    } catch (error) {
      captureError(error, 'auth.login');
      const errorMessage = getErrorMessage(
        error,
        'Une erreur est survenue lors de la connexion.'
      );

      toast({
        variant: 'destructive',
        title: 'Erreur de connexion',
        description: errorMessage,
      });

      throw new Error(errorMessage);
    } finally {
      setIsLoggingIn(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    const handleUnauthorized = (event: Event) => {
      const customEvent = event as CustomEvent<{ message?: string }>;
      redirectToLogin(customEvent.detail?.message);
    };

    window.addEventListener(AUTH_EXPIRED_EVENT, handleUnauthorized);
    return () => {
      window.removeEventListener(AUTH_EXPIRED_EVENT, handleUnauthorized);
    };
  }, [redirectToLogin]);

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error(
      "useAuth doit être utilisé à l'intérieur d'un AuthProvider"
    );
  }
  return context;
}
