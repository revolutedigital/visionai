import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import * as Sentry from '@sentry/react'
import { initPosthog } from './lib/posthog'
import './index.css'
import App from './App.tsx'

// Inicializar Sentry apenas em produção
if (import.meta.env.PROD) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN || '', // Configurar no .env
    environment: import.meta.env.MODE,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    // Performance Monitoring
    tracesSampleRate: 1.0, // Capturar 100% das transações em dev
    // Session Replay
    replaysSessionSampleRate: 0.1, // 10% das sessões normais
    replaysOnErrorSampleRate: 1.0, // 100% das sessões com erro
  });
}

// Inicializar Posthog Analytics
initPosthog();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
