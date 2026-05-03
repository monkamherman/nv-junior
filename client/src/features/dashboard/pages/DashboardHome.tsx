import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { FileCheck, FileText, GraduationCap, Users } from 'lucide-react';
import * as React from 'react';

const StatsCard = ({
  title,
  value,
  icon: Icon,
  className,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  className?: string;
}) => (
  <Card className="h-full">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div
        className={cn('h-4 w-4', className?.replace('text-', 'text-muted-'))}
      >
        <Icon className="h-4 w-4" />
      </div>
    </CardHeader>
    <CardContent>
      <div className={cn('text-2xl font-bold', className)}>
        {value.toLocaleString()}
      </div>
    </CardContent>
  </Card>
);

export function DashboardHome() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.get('/api/dashboard/stats').then((res) => res.data),
  });

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Skeleton className="h-8 w-8 rounded-full" />
        <span className="sr-only">Chargement...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold tracking-tight">Tableau de bord</h2>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Utilisateurs"
          value={stats?.users || 0}
          icon={Users}
          className="text-blue-500"
        />
        <StatsCard
          title="Formations"
          value={stats?.formations || 0}
          icon={GraduationCap}
          className="text-green-500"
        />
        <StatsCard
          title="Paiements"
          value={stats?.payments || 0}
          icon={FileText}
          className="text-amber-500"
        />
        <StatsCard
          title="Attestations"
          value={stats?.certificates || 0}
          icon={FileCheck}
          className="text-violet-500"
        />
      </div>

      {/* Section Activités récentes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Activités récentes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Aucune activité récente pour le moment.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
