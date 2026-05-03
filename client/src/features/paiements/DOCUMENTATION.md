# Documentation du Module de Paiement

## Installation

Aucune installation supplémentaire n'est nécessaire, le module est déjà inclus dans le projet.

## Composants

### PaiementButton

Un bouton qui redirige vers la page de paiement.

```tsx
import { PaiementButton } from '@/features/paiements';

// Dans votre composant
<PaiementButton 
  formationId="123" 
  montant={25000} 
  className="mt-4"
  disabled={false}
  isLoading={false}
/>
```

### PaiementStatusBadge

Affiche le statut d'un paiement sous forme de badge coloré.

```tsx
import { PaiementStatusBadge } from '@/features/paiements';

// Dans votre composant
<PaiementStatusBadge statut="VALIDE" />
```

### PaymentSuccessNotification

Affiche une notification de succès après un paiement réussi.

```tsx
import { PaymentSuccessNotification } from '@/features/paiements';

// Dans votre composant
<PaymentSuccessNotification
  reference="PAY-123456"
  montant={25000}
  formationTitre="Formation React Avancé"
  onViewDetails={() => navigate('/mon-compte/paiements')}
/>
```

## Hooks

### useCreatePaiement

Crée une nouvelle transaction de paiement.

```typescript
import { useCreatePaiement } from '@/features/paiements';

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
import { usePaiementStatus } from '@/features/paiements';

const { data: paiement, isLoading } = usePaiementStatus('reference-123');
```

### usePaiementsUtilisateur

Récupère l'historique des paiements de l'utilisateur connecté.

```typescript
import { usePaiementsUtilisateur } from '@/features/paiements';

const { data: paiements, isLoading } = usePaiementsUtilisateur();
```

## Pages

### PaiementPage

Page complète de paiement.

```tsx
import { PaiementPage } from '@/features/paiements';

// Dans votre route
<Route path="/formations/:id/paiement" element={<PaiementPage />} />
```

### PaiementHistoryPage

Page d'historique des paiements.

```tsx
import { PaiementHistoryPage } from '@/features/paiements';

// Dans votre route
<Route path="/mon-compte/paiements" element={<PaiementHistoryPage />} />
```

### PaymentConfirmationPage

Page de confirmation de paiement.

```tsx
import { PaymentConfirmationPage } from '@/features/paiements';

// Dans votre route
<Route path="/paiement/confirmation" element={<PaymentConfirmationPage />} />
```

## Configuration

Le module est configuré pour fonctionner avec les opérateurs Orange Money et MTN Mobile Money. La configuration par défaut inclut :

- Formats de numéros de téléphone
- Préfixes pays
- Messages d'erreur
- Couleurs et icônes pour les statuts de paiement

## Workflow de paiement

1. L'utilisateur clique sur le bouton de paiement
2. Il est redirigé vers la page de paiement
3. Il sélectionne sa méthode de paiement et entre son numéro de téléphone
4. Il confirme le paiement
5. Le système traite le paiement et affiche une notification de succès
6. L'utilisateur peut voir les détails du paiement ou retourner à l'accueil

## Personnalisation

Vous pouvez personnaliser l'apparence et le comportement du module en surchargeant les styles et les configurations dans le fichier `paiement.config.ts`.
