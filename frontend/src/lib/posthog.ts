import posthog from 'posthog-js';

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY || '';
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com';

/**
 * Inicializa Posthog Analytics
 * Apenas em produção para evitar poluição de dados
 */
export function initPosthog() {
  if (import.meta.env.PROD && POSTHOG_KEY) {
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      loaded: (posthog) => {
        if (import.meta.env.DEV) posthog.debug();
      },
      // Capturar pageviews automaticamente
      capture_pageview: true,
      // Capturar performance metrics
      capture_pageleave: true,
      // Session recording
      session_recording: {
        maskAllInputs: true,
        maskTextSelector: '[data-private]',
      },
      // Autocapture de cliques
      autocapture: {
        css_selector_allowlist: [
          'button',
          'a',
          '[role="button"]',
          '[data-track]',
        ],
      },
    });

    console.log('[Posthog] Analytics inicializado');
  } else {
    console.log('[Posthog] Analytics desabilitado (dev ou sem key)');
  }
}

/**
 * Rastrear evento customizado
 */
export function trackEvent(eventName: string, properties?: Record<string, any>) {
  if (import.meta.env.PROD && POSTHOG_KEY) {
    posthog.capture(eventName, properties);
  }
}

/**
 * Identificar usuário (quando implementar autenticação)
 */
export function identifyUser(userId: string, traits?: Record<string, any>) {
  if (import.meta.env.PROD && POSTHOG_KEY) {
    posthog.identify(userId, traits);
  }
}

/**
 * Rastrear pageview manual (se necessário)
 */
export function trackPageview(url?: string) {
  if (import.meta.env.PROD && POSTHOG_KEY) {
    posthog.capture('$pageview', { $current_url: url || window.location.href });
  }
}

/**
 * Resetar sessão (logout)
 */
export function resetPosthog() {
  if (import.meta.env.PROD && POSTHOG_KEY) {
    posthog.reset();
  }
}

// Exportar instância para uso direto se necessário
export { posthog };
