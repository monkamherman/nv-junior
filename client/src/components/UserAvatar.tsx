import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, User as UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';

interface UserAvatarProps {
  className?: string;
}

export function UserAvatar({ className = '' }: UserAvatarProps) {
  const auth = useAuth();
  const navigate = useNavigate();

  // Vérification de l'authentification et du chargement
  if (!auth || !auth.user || auth.isLoading) {
    return null;
  }

  const { user, logout } = auth;

  const getInitials = (name: string, surname: string) => {
    return `${name.charAt(0)}${surname.charAt(0)}`.toUpperCase();
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={`relative h-8 w-8 rounded-full ${className}`}
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              {getInitials(user.prenom, user.nom)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.prenom} {user.nom}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/profile')}>
          <UserIcon className="mr-2 h-4 w-4" />
          <span>Profil</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Déconnexion</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
