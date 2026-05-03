import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      // Rediriger vers la page de connexion avec l'URL actuelle comme redirect
      const currentPath = window.location.pathname;
      navigate(`/login?redirect=${encodeURIComponent(currentPath)}`);
    }
  }, [navigate]);

  // Vérifier aussi au render (au cas où le token est supprimé pendant que le composant est monté)
  const token = localStorage.getItem('token');
  if (!token) {
    return null; // Le useEffect va gérer la redirection
  }

  return <>{children}</>;
}
