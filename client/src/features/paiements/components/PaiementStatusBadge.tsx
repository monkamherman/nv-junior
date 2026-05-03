import type { PaiementStatut } from '../api/paiement.api';
import { getStatusConfig } from '../config/paiement.config';
import { cn } from '@/lib/utils';

interface PaiementStatusBadgeProps {
  statut: PaiementStatut;
  className?: string;
}

export function PaiementStatusBadge({ statut, className }: PaiementStatusBadgeProps) {
  const status = getStatusConfig(statut);
  
  return (
    <span 
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        status.color,
        className
      )}
    >
      <span className="mr-1.5">{status.icon}</span>
      {status.label}
    </span>
  );
}
