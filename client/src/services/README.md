# Service de Ping pour Render

Ce service maintient le serveur backend actif sur Render en envoyant des requêtes périodiques pour éviter la mise en veille (15 minutes d'inactivité).

## Fonctionnement

- **Intervalle de ping** : 14 minutes (pour rester sous la limite de 15 minutes de Render)
- **Endpoint utilisé** : `/health` (déjà existant sur le serveur)
- **Démarrage automatique** : Au lancement de l'application via `main.tsx`

## Fichiers créés

### 1. `pingService.ts`

Service principal qui gère les pings automatiques.

**Fonctions disponibles :**

- `startPingService()` : Démarre les pings automatiques
- `stopPingService()` : Arrête les pings automatiques
- `manualPing()` : Effectue un ping manuel
- `isPingServiceActive()` : Vérifie si le service est actif

**Caractéristiques :**

- Gestion automatique de la visibilité de l'onglet (pause quand l'onglet est masqué)
- Timeout de 10 secondes pour éviter les requêtes bloquantes
- Logs détaillés pour le débogage
- Nettoyage automatique lors du déchargement de la page

### 2. `usePingService.ts`

Hook React pour contrôler le service depuis les composants.

**Utilisation :**

```typescript
import { usePingService } from '../hooks/usePingService';

function MonComposant() {
  const { isActive, lastPing, pingCount, start, stop, ping } = usePingService();

  return (
    <div>
      <p>Service actif: {isActive ? 'Oui' : 'Non'}</p>
      <p>Dernier ping: {lastPing?.toLocaleString()}</p>
      <p>Nombre de pings: {pingCount}</p>
      <button onClick={start}>Démarrer</button>
      <button onClick={stop}>Arrêter</button>
      <button onClick={() => ping()}>Ping manuel</button>
    </div>
  );
}
```

## Configuration

### Variables d'environnement

- `VITE_API_URL` : URL de base de l'API (par défaut : `https://projet-junior-api.onrender.com`)

### Personnalisation

Vous pouvez modifier les constantes dans `pingService.ts` :

- `PING_INTERVAL` : Intervalle entre les pings (en millisecondes)
- `HEALTH_ENDPOINT` : Endpoint de health check

## Intégration

Le service est déjà intégré dans `main.tsx` et se démarrera automatiquement au lancement de l'application.

## Logs

Le service génère des logs préfixés par `[PingService]` pour faciliter le débogage :

- `[PingService] Démarrage du service de ping automatique`
- `[PingService] Envoi du ping au serveur...`
- `[PingService] Ping réussi - Serveur actif`
- `[PingService] Service de ping arrêté`

## Dépannage

### Si le ping ne fonctionne pas :

1. Vérifiez que `VITE_API_URL` est correctement configuré
2. Vérifiez que l'endpoint `/health` est accessible sur le serveur
3. Consultez les logs de la console pour les erreurs

### Pour tester manuellement :

```typescript
import { manualPing } from '../services/pingService';

// Test du ping
const success = await manualPing();
console.log('Ping réussi:', success);
```

## Performance

- Le service utilise `setInterval` avec un intervalle de 14 minutes
- Les requêtes ont un timeout de 10 secondes
- Le service se met en pause automatiquement quand l'onglet n'est pas visible
- Nettoyage automatique des ressources lors du déchargement de la page
