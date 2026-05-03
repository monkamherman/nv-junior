import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.tsx';
import './index.css';
import { startPingService } from './services/pingService';

if (import.meta.env.PROD) {
  const bootPingService = () => {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => startPingService());
      return;
    }

    window.setTimeout(() => startPingService(), 1500);
  };

  if (document.readyState === 'complete') {
    bootPingService();
  } else {
    window.addEventListener('load', bootPingService, { once: true });
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>
);
