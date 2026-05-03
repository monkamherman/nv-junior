import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const usePWA = () => {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');

  useEffect(() => {
    // Vérifier si l'app est déjà installée
    const checkIfInstalled = () => {
      const isStandalone = window.matchMedia(
        '(display-mode: standalone)'
      ).matches;
      const isInWebAppiOS =
        (window.navigator as { standalone?: boolean }).standalone === true;
      const isPWA = window.matchMedia('(display-mode: minimal-ui)').matches;

      setIsInstalled(isStandalone || isInWebAppiOS || isPWA);

      // Debug information
      const isHTTPS = location.protocol === 'https:';
      const isLocalhost = location.hostname === 'localhost';
      const isFirefox = navigator.userAgent.includes('Firefox');
      const isChrome =
        navigator.userAgent.includes('Chrome') &&
        !navigator.userAgent.includes('Edg');
      const isEdge = navigator.userAgent.includes('Edg');

      const info = {
        userAgent: navigator.userAgent,
        isStandalone,
        isInWebAppiOS,
        isPWA,
        isHTTPS,
        isLocalhost,
        isFirefox,
        isChrome,
        isEdge,
        hasServiceWorker: 'serviceWorker' in navigator,
        hasBeforeInstallPrompt: 'onbeforeinstallprompt' in window,
        canInstall:
          (isHTTPS || isLocalhost) &&
          (isChrome || isEdge) &&
          'onbeforeinstallprompt' in window,
      };
      setDebugInfo(JSON.stringify(info, null, 2));
    };

    checkIfInstalled();

    // Écouter l'événement beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    // Écouter l'installation
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      console.log('✅ PWA installée avec succès');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return false;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        console.log('✅ Installation acceptée');
        setDeferredPrompt(null);
        setIsInstallable(false);
        return true;
      } else {
        console.log('❌ Installation refusée');
        return false;
      }
    } catch (error) {
      console.error("Erreur lors de l'installation:", error);
      return false;
    }
  };

  return {
    isInstallable,
    isInstalled,
    installApp,
    debugInfo,
  };
};

// Hook pour gérer le service worker
export const useServiceWorker = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [needsRefresh, setNeedsRefresh] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Enregistrer le service worker uniquement en production
    if (import.meta.env.PROD && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('✅ Service Worker enregistré:', registration);

          // Vérifier les mises à jour
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (
                  newWorker.state === 'installed' &&
                  navigator.serviceWorker.controller
                ) {
                  setNeedsRefresh(true);
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('❌ Erreur Service Worker:', error);
        });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const updateApp = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration?.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          window.location.reload();
        }
      });
    }
  };

  return {
    isOnline,
    needsRefresh,
    updateApp,
  };
};
