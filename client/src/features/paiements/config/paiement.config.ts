import { PaiementStatut } from '../api/paiement.api';

type OperateurConfig = {
  nom: string;
  prefix: string;
  longueur: number;
  regex: RegExp;
  placeholder: string;
};

type PaiementConfig = {
  operateurs: {
    [key: string]: OperateurConfig;
  };
  statuts: {
    [key in PaiementStatut]: {
      label: string;
      color: string;
      icon: string;
    };
  };
};

export const paiementConfig: PaiementConfig = {
  operateurs: {
    ORANGE_MONEY: {
      nom: 'Orange Money',
      prefix: '+225',
      longueur: 10,
      regex: /^0[0-9]{9}$/,
      placeholder: '07 12 34 56 78',
    },
    MTN_MONEY: {
      nom: 'MTN Mobile Money',
      prefix: '+237',
      longueur: 9,
      regex: /^6[0-9]{8}$/,
      placeholder: '6 12 34 56 78',
    },
  },
  statuts: {
    EN_ATTENTE: {
      label: 'En attente',
      color: 'bg-yellow-100 text-yellow-800',
      icon: '⏳',
    },
    EN_COURS: {
      label: 'En cours',
      color: 'bg-blue-100 text-blue-800',
      icon: '🔄',
    },
    VALIDE: {
      label: 'Validé',
      color: 'bg-green-100 text-green-800',
      icon: '✅',
    },
    ANNULE: {
      label: 'Annulé',
      color: 'bg-gray-100 text-gray-800',
      icon: '❌',
    },
    ECHEC: {
      label: 'Échec',
      color: 'bg-red-100 text-red-800',
      icon: '❌',
    },
  },
};

// Fonction utilitaire pour formater un numéro de téléphone
export function formatPhoneNumber(phone: string, operateur: keyof typeof paiementConfig.operateurs): string {
  const config = paiementConfig.operateurs[operateur];
  if (!config) return phone;
  
  // Supprimer tous les caractères non numériques
  const cleaned = phone.replace(/\D/g, '');
  
  // Appliquer le formatage en fonction de l'opérateur
  if (operateur === 'ORANGE_MONEY') {
    return cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
  } else if (operateur === 'MTN_MONEY') {
    return cleaned.replace(/(\d{1})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
  }
  
  return phone;
}

// Fonction pour valider un numéro de téléphone en fonction de l'opérateur
export function validatePhoneNumber(phone: string, operateur: keyof typeof paiementConfig.operateurs): boolean {
  const config = paiementConfig.operateurs[operateur];
  if (!config) return false;
  
  // Supprimer tous les caractères non numériques
  const cleaned = phone.replace(/\D/g, '');
  
  // Vérifier la longueur et le format
  return cleaned.length === config.longueur && config.regex.test(cleaned);
}

// Fonction pour obtenir la configuration d'un statut
export function getStatusConfig(statut: PaiementStatut) {
  return paiementConfig.statuts[statut] || {
    label: statut,
    color: 'bg-gray-100 text-gray-800',
    icon: '❓',
  };
}
