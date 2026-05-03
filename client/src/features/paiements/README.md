# Module de Paiement

Ce module gère les fonctionnalités de paiement pour les formations, avec un support pour Orange Money et MTN Mobile Money.

## Fonctionnalités

- Paiement sécurisé via Orange Money et MTN Mobile Money
- Suivi en temps réel du statut des paiements
- Historique des transactions
- Interface utilisateur intuitive

## Composants

### PaiementButton

Un bouton réutilisable pour initier le processus de paiement.

```tsx
import { PaiementButton } from '@/features/paiements';

// Dans votre composant
<PaiementButton 
  formationId="123" 
  montant={25000} 
  disabled={false}
  isLoading={false}
/>
```

### PaiementForm

Formulaire de paiement complet avec sélection de la méthode de paiement et saisie du numéro de téléphone.

### PaiementPage

Page complète de paiement qui inclut le formulaire et la gestion d'état.

## Hooks API

### useCreatePaiement

Crée une nouvelle transaction de paiement.

```typescript
const { mutate: createPaiement, isLoading } = useCreatePaiement();

// Utilisation
createPaiement({
  formationId: '123',
  montant: 25000,
  telephone: '0712345678',
  operateur: 'ORANGE_MONEY',
  mode: 'ORANGE_MONEY'
});
```

### usePaiementStatus

Récupère et suit le statut d'un paiement.

```typescript
const { data: paiement, isLoading } = usePaiementStatus('reference-123');
```

### usePaiementsUtilisateur

Récupère l'historique des paiements de l'utilisateur connecté.

```typescript
const { data: paiements, isLoading } = usePaiementsUtilisateur();
```

## Workflow de paiement

1. L'utilisateur clique sur le bouton "Payer" sur la page d'une formation
2. Il est redirigé vers la page de paiement
3. Il sélectionne sa méthode de paiement (Orange Money ou MTN Mobile Money)
4. Il saisit son numéro de téléphone
5. Il confirme le paiement
6. Le système affiche un statut en temps réel
7. Une fois le paiement validé, l'utilisateur est redirigé vers une page de confirmation

## Sécurité

- Toutes les requêtes sont authentifiées avec un token JWT
- Les numéros de téléphone sont validés avant soumission
- Les statuts de paiement sont vérifiés de manière sécurisée côté serveur

## Configuration requise

- Un backend avec les endpoints API correspondants
- Des identifiants d'API pour les services de paiement (en production)
- Un système de gestion d'état (comme React Query) déjà configuré
