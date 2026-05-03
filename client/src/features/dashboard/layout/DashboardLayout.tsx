import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  ChevronRight,
  FileCheck,
  FileText,
  GraduationCap,
  Home,
  LogOut,
  Menu,
  Users,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

const navItems = [
  { icon: Home, label: 'Tableau de bord', to: '/dashboard' },
  { icon: Users, label: 'Utilisateurs', to: '/dashboard/users' },
  { icon: GraduationCap, label: 'Formations', to: '/dashboard/formations' },
  { icon: FileText, label: 'Paiements', to: '/dashboard/payments' },
  { icon: FileCheck, label: 'Attestations', to: '/dashboard/certificates' },
];

export function DashboardLayout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const userInitials = 'AD'; // Remplacer par les initiales de l'utilisateur connecté
  const userEmail = 'admin@example.com'; // Remplacer par l'email de l'utilisateur connecté

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar for desktop */}
      <div className="hidden w-64 flex-col border-r bg-card text-card-foreground md:flex">
        <div className="flex h-16 items-center border-b px-6">
          <div className="flex items-center gap-2 font-semibold">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <span>C</span>
            </div>
            <span>CENTIC Entreprise</span>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <nav className="grid items-start gap-1 px-4 py-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;
              return (
                <Button
                  key={item.to}
                  asChild
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start',
                    isActive && 'bg-accent text-accent-foreground'
                  )}
                >
                  <Link to={item.to}>
                    <Icon className="mr-2 h-4 w-4" />
                    {item.label}
                    {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
                  </Link>
                </Button>
              );
            })}
          </nav>
        </ScrollArea>

        <div className="border-t p-4">
          <div className="flex items-center gap-4 rounded-md p-2 transition-colors hover:bg-accent/50">
            <Avatar className="h-9 w-9">
              <AvatarFallback>{userInitials}</AvatarFallback>
            </Avatar>
            <div className="grid gap-0.5 text-sm">
              <div className="font-medium">Admin</div>
              <div className="truncate text-xs text-muted-foreground">
                {userEmail}
              </div>
            </div>
          </div>

          <Button
            variant="ghost"
            className="mt-2 w-full justify-start text-destructive hover:text-destructive"
            asChild
          >
            <Link to="/logout">
              <LogOut className="mr-2 h-4 w-4" />
              Déconnexion
            </Link>
          </Button>
        </div>
      </div>

      {/* Mobile sidebar */}
      <div className="md:hidden">
        <div
          className={`fixed inset-0 z-40 ${mobileOpen ? 'block' : 'hidden'}`}
        >
          <div
            className="fixed inset-0 bg-black/20"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-card shadow-lg">
            <div className="flex h-16 items-center justify-between border-b px-6">
              <div className="flex items-center gap-2 font-semibold">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <span>J</span>
                </div>
                <span>Junior Entreprise</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileOpen(false)}
              >
                <X className="h-5 w-5" />
                <span className="sr-only">Fermer le menu</span>
              </Button>
            </div>
            <ScrollArea className="flex-1">
              <nav className="grid items-start gap-1 px-4 py-4">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.to;
                  return (
                    <Button
                      key={item.to}
                      asChild
                      variant={isActive ? 'secondary' : 'ghost'}
                      className={cn(
                        'w-full justify-start',
                        isActive && 'bg-accent text-accent-foreground'
                      )}
                      onClick={() => setMobileOpen(false)}
                    >
                      <Link to={item.to}>
                        <Icon className="mr-2 h-4 w-4" />
                        {item.label}
                        {isActive && (
                          <ChevronRight className="ml-auto h-4 w-4" />
                        )}
                      </Link>
                    </Button>
                  );
                })}
              </nav>
            </ScrollArea>
            <div className="border-t p-4">
              <div className="flex items-center gap-4 rounded-md p-2">
                <Avatar className="h-9 w-9">
                  <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
                <div className="grid gap-0.5 text-sm">
                  <div className="font-medium">Admin</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {userEmail}
                  </div>
                </div>
              </div>

              <Button
                variant="ghost"
                className="mt-2 w-full justify-start text-destructive hover:text-destructive"
                asChild
                onClick={() => setMobileOpen(false)}
              >
                <Link to="/logout">
                  <LogOut className="mr-2 h-4 w-4" />
                  Déconnexion
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b bg-card px-4 md:px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Ouvrir le menu</span>
            </Button>
            <h1 className="text-lg font-semibold">
              {navItems.find((item) => item.to === location.pathname)?.label ||
                'Tableau de bord'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{userInitials}</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
