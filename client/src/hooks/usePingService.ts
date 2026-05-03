/**
 * Hook React pour gérer le service de ping
 * Permet de contrôler le ping depuis les composants React
 */

import { useEffect, useState } from 'react';
import {
  isPingServiceActive,
  manualPing,
  startPingService,
  stopPingService,
} from '../services/pingService';

export interface PingServiceState {
  isActive: boolean;
  lastPing: Date | null;
  pingCount: number;
}

export function usePingService(autoStart: boolean = true): PingServiceState & {
  start: () => void;
  stop: () => void;
  ping: () => Promise<boolean>;
} {
  const [state, setState] = useState<PingServiceState>({
    isActive: false,
    lastPing: null,
    pingCount: 0,
  });

  const start = () => {
    startPingService();
    setState((prev) => ({ ...prev, isActive: true }));
  };

  const stop = () => {
    stopPingService();
    setState((prev) => ({ ...prev, isActive: false }));
  };

  const ping = async () => {
    const success = await manualPing();
    if (success) {
      setState((prev) => ({
        ...prev,
        lastPing: new Date(),
        pingCount: prev.pingCount + 1,
      }));
    }
    return success;
  };

  // Démarrage automatique si demandé
  useEffect(() => {
    if (autoStart) {
      start();
    }

    return () => {
      stop();
    };
  }, [autoStart]);

  // Mise à jour de l'état actif
  useEffect(() => {
    const interval = setInterval(() => {
      setState((prev) => ({
        ...prev,
        isActive: isPingServiceActive(),
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    ...state,
    start,
    stop,
    ping,
  };
}
