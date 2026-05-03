import { Button } from '@mantine/core';
import { Download, RefreshCw, Wifi } from 'lucide-react';
import { usePWA, useServiceWorker } from '../features/formations/hooks/usePWA';

export const PWAInstallButton = () => {
  const { isInstallable, installApp, isInstalled, debugInfo } = usePWA();
  const { needsRefresh, updateApp } = useServiceWorker();

  const handleManualInstall = () => {
    const debug = JSON.parse(debugInfo || '{}');
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isAndroid = /Android/i.test(navigator.userAgent);

    if (isIOS) {
      // Instructions pour iOS (iPhone/iPad)
      alert(
        "Pour installer sur iPhone/iPad:\n1. Appuyez sur l'icône 'Partager' (carré avec flèche)\n2. Faites défiler vers le bas et appuyez sur 'Sur l'écran d'accueil'\n3. Appuyez sur 'Ajouter' pour confirmer"
      );
    } else if (isAndroid) {
      // Instructions pour Android
      alert(
        "Pour installer sur Android:\n1. Appuyez sur le menu (3 points) en haut à droite\n2. Appuyez sur 'Installer l'application' ou 'Ajouter à l'écran d'accueil'\n3. Appuyez sur 'Installer' pour confirmer"
      );
    } else if (debug.isFirefox) {
      // Instructions pour Firefox desktop
      alert(
        "Pour installer sur Firefox:\n1. Cliquez sur l'icône du cadenas dans la barre d'adresse\n2. Cliquez sur 'Installer' ou 'Ajouter à l'écran d'accueil'"
      );
    } else if (debug.isHTTPS) {
      // Instructions générales pour autres navigateurs desktop
      alert(
        "Pour installer l'application:\n1. Ouvrez le menu du navigateur (3 points)\n2. Cherchez 'Installer l'application' ou 'Ajouter à l'écran d'accueil'\n3. Suivez les instructions"
      );
    } else {
      // Message pour HTTPS requis
      alert(
        "L'installation nécessite une connexion sécurisée (HTTPS).\nUtilisez Chrome ou Edge sur un site HTTPS pour installer."
      );
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {needsRefresh ? (
        <Button
          onClick={updateApp}
          color="orange"
          leftSection={<RefreshCw size={16} />}
          className="shadow-lg transition-all duration-200 hover:shadow-xl"
          size="md"
        >
          Mettre à jour l'app
        </Button>
      ) : isInstalled ? (
        <Button
          color="green"
          leftSection={<Wifi size={16} />}
          disabled
          className="opacity-75 shadow-lg"
          size="md"
        >
          Déjà installée
        </Button>
      ) : (
        <Button
          onClick={isInstallable ? installApp : handleManualInstall}
          color={isInstallable ? 'blue' : 'yellow'}
          leftSection={<Download size={16} />}
          disabled={false}
          className="rounded bg-blue-600 p-2 text-white shadow-lg transition-all duration-200 hover:bg-blue-700 hover:shadow-xl"
          size="md"
        >
          {isInstallable
            ? "Installer l'app"
            : JSON.parse(debugInfo || '{}').isFirefox
              ? "Ajouter à l'accueil"
              : "Guide d'installation"}
        </Button>
      )}
    </div>
  );
};
