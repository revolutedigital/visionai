import { useEffect } from 'react';
import {
  onCLS,
  onFCP,
  onLCP,
  onTTFB,
  onINP,
  type CLSMetric,
  type FCPMetric,
  type LCPMetric,
  type TTFBMetric,
  type INPMetric,
} from 'web-vitals';
import { trackEvent } from '../lib/posthog';
import { logger } from '../utils/logger';

type Metric = CLSMetric | FCPMetric | LCPMetric | TTFBMetric | INPMetric;

/**
 * Hook para monitorar Web Vitals (Core Web Vitals do Google)
 *
 * Métricas rastreadas:
 * - CLS: Cumulative Layout Shift (estabilidade visual)
 * - INP: Interaction to Next Paint (responsividade) - substitui FID
 * - FCP: First Contentful Paint (velocidade de carregamento)
 * - LCP: Largest Contentful Paint (velocidade de renderização)
 * - TTFB: Time to First Byte (latência do servidor)
 */
export function useWebVitals(enabled: boolean = true) {
  useEffect(() => {
    if (!enabled || import.meta.env.DEV) {
      return; // Desabilitar em desenvolvimento para evitar noise
    }

    function sendMetric(metric: Metric) {
      const { name, value, rating, delta } = metric;

      // Log localmente
      logger.info(`[Web Vitals] ${name}`, {
        value: Math.round(value),
        rating,
        delta: Math.round(delta),
      });

      // Enviar para Posthog
      trackEvent('web_vitals', {
        metric_name: name,
        metric_value: Math.round(value),
        metric_rating: rating,
        metric_delta: Math.round(delta),
        page_url: window.location.pathname,
      });

      // Log de alerta se métrica for ruim
      if (rating === 'poor') {
        logger.warn(`[Web Vitals] POOR ${name}: ${Math.round(value)}`, metric);
      }
    }

    // Monitorar todas as Core Web Vitals
    onCLS(sendMetric);
    onFCP(sendMetric);
    onLCP(sendMetric);
    onTTFB(sendMetric);
    onINP(sendMetric);

    logger.info('[Web Vitals] Monitoramento ativado');
  }, [enabled]);
}

/**
 * Thresholds de Core Web Vitals (2024)
 *
 * LCP (Largest Contentful Paint):
 * - Bom: < 2.5s
 * - Precisa melhorar: 2.5s - 4.0s
 * - Ruim: > 4.0s
 *
 * INP (Interaction to Next Paint) - substitui FID:
 * - Bom: < 200ms
 * - Precisa melhorar: 200ms - 500ms
 * - Ruim: > 500ms
 *
 * CLS (Cumulative Layout Shift):
 * - Bom: < 0.1
 * - Precisa melhorar: 0.1 - 0.25
 * - Ruim: > 0.25
 *
 * FCP (First Contentful Paint):
 * - Bom: < 1.8s
 * - Precisa melhorar: 1.8s - 3.0s
 * - Ruim: > 3.0s
 *
 * TTFB (Time to First Byte):
 * - Bom: < 800ms
 * - Precisa melhorar: 800ms - 1800ms
 * - Ruim: > 1800ms
 */
