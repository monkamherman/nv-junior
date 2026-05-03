import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/UserAvatar';
import { useAuth } from '@/contexts/AuthContext';
import { Briefcase, Home, User } from 'lucide-react';
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { NavBar } from '../../components/ui/tubelight-navbar';

const Header: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Accueil', url: '/', icon: Home },
    { name: 'À propos', url: '/a-propos', icon: User },
    { name: 'Formations', url: '/formations', icon: Briefcase },
  ];

  if (isLoading) {
    return (
      <header className="flex flex-col bg-gray-950/80 backdrop-blur-md">
        <div className="flex items-center justify-between px-8 py-4">
          <img src="/logo.jpg" className="h-12 w-16 rounded" alt="Logo" />
          <div className="h-10 w-10 animate-pulse rounded-full bg-gray-700"></div>
        </div>
        <NavBar items={navItems} />
      </header>
    );
  }

  return (
    <header className="flex flex-col bg-gray-800/50 backdrop-blur-md">
      <div className="flex items-center justify-between px-8 py-4">
        <Link to="/" className="flex items-center">
          <img src="/logo.jpg" className="h-12 w-16 rounded" alt="Logo" />
        </Link>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <UserAvatar />
          ) : (
            <Button
              onClick={() => navigate('/login')}
              className="bg-blue-600 text-white hover:bg-blue-900"
            >
              Connexion
            </Button>
          )}
        </div>
      </div>

      <NavBar items={navItems} />
    </header>
  );
};

export default Header;
