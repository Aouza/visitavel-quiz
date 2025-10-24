/**
 * @file: track-meta-deduplicated.ts
 * @responsibility: Wrapper para trackMetaEvent com deduplicação automática
 * @exports: trackMetaEventOnce
 */

import { trackMetaEvent } from "@/lib/track-meta-event";

interface TrackMetaEventParams {
  eventName: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
  birthdate?: string; // formato YYYYMMDD
  city?: string;
  state?: string;
  country?: string; // código ISO 3166-1 alpha-2 (ex: 'br', 'us')
  zipCode?: string;
  customData?: Record<string, string | number>;
}

/**
 * Dispara evento Meta apenas UMA vez por sessão
 * Usa sessionStorage para deduplicação automática
 *
 * @param eventKey - Chave única para deduplicação (ex: "quiz_view", "initiate_checkout_hero")
 * @param params - Parâmetros do evento Meta
 * @returns true se disparou, false se já tinha sido disparado
 */
export function trackMetaEventOnce(
  eventKey: string,
  params: TrackMetaEventParams
): boolean {
  if (typeof window === "undefined") return false;

  const storageKey = `meta_event_${eventKey}_tracked`;
  const alreadyTracked = sessionStorage.getItem(storageKey);

  if (alreadyTracked) {
    console.log(`[Meta] Event "${eventKey}" already tracked in this session`);
    return false;
  }

  // Disparar evento
  trackMetaEvent(params);

  // Marcar como disparado
  sessionStorage.setItem(storageKey, "true");

  return true;
}

/**
 * Reseta o tracking de um evento específico
 * Útil para testes ou casos especiais
 */
export function resetMetaEventTracking(eventKey: string): void {
  if (typeof window === "undefined") return;
  const storageKey = `meta_event_${eventKey}_tracked`;
  sessionStorage.removeItem(storageKey);
}

/**
 * Verifica se um evento já foi disparado na sessão
 */
export function isMetaEventTracked(eventKey: string): boolean {
  if (typeof window === "undefined") return false;
  const storageKey = `meta_event_${eventKey}_tracked`;
  return sessionStorage.getItem(storageKey) !== null;
}
