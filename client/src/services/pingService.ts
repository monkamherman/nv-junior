const API_URL =
  import.meta.env.VITE_API_URL || 'https://projet-junior-api.onrender.com';
const PING_INTERVAL = 14 * 60 * 1000;
const HEALTH_ENDPOINT = '/health';

let pingInterval: ReturnType<typeof setInterval> | null = null;
let isPinging = false;

async function pingServer(): Promise<boolean> {
  try {
    if (document.hidden || !navigator.onLine) {
      return false;
    }

    const response = await fetch(`${API_URL}${HEALTH_ENDPOINT}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(10000),
    });

    return response.ok;
  } catch {
    return false;
  }
}

export function startPingService(): void {
  if (isPinging || document.hidden) {
    return;
  }

  isPinging = true;
  pingServer();
  pingInterval = setInterval(() => {
    pingServer();
  }, PING_INTERVAL);
}

export function stopPingService(): void {
  if (pingInterval) {
    clearInterval(pingInterval);
    pingInterval = null;
  }
  isPinging = false;
}

export async function manualPing(): Promise<boolean> {
  return await pingServer();
}

export function isPingServiceActive(): boolean {
  return isPinging;
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    stopPingService();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopPingService();
    } else {
      startPingService();
    }
  });
}
