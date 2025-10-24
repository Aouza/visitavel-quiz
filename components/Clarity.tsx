/**
 * @file: Clarity.tsx
 * @responsibility: Microsoft Clarity analytics integration
 */

"use client";

import { useEffect } from "react";
import Clarity from "@microsoft/clarity";

const CLARITY_PROJECT_ID = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;
const CLARITY_CONSENTLESS_MODE = process.env.NEXT_PUBLIC_CLARITY_CONSENTLESS === "true";

export function ClarityAnalytics() {
  useEffect(() => {
    if (!CLARITY_PROJECT_ID) {
      console.error("[Clarity] Project ID not configured");
      return;
    }

    // 🧪 Modo "consentless" para testes (até 500 sessões)
    // Ative com: NEXT_PUBLIC_CLARITY_CONSENTLESS=true
    if (CLARITY_CONSENTLESS_MODE) {
      // @ts-ignore - window.clarityConsent é uma API não documentada
      window.clarityConsent = "granted";
      console.log("[Clarity] 🧪 Consentless mode ATIVADO (apenas para testes)");
    }

    // Initialize Clarity with privacy settings
    Clarity.init(CLARITY_PROJECT_ID);

    // Set default consent based on mode
    if (CLARITY_CONSENTLESS_MODE) {
      Clarity.consent(true); // Auto-consent em modo teste
    } else {
      // Set default consent to false for GDPR compliance
      // User must explicitly consent before tracking
      Clarity.consent(false);
    }
  }, []);

  return null;
}

/**
 * Identify user in Clarity
 */
export function identifyUser(
  customId: string,
  customSessionId?: string,
  customPageId?: string,
  friendlyName?: string
) {
  if (typeof window === "undefined") return;

  Clarity.identify(customId, customSessionId, customPageId, friendlyName);
}

/**
 * Set custom tag in Clarity
 */
export function setClarityTag(key: string, value: string | string[]) {
  if (typeof window === "undefined") return;

  Clarity.setTag(key, value);
}

/**
 * Track custom event in Clarity
 */
export function trackClarityEvent(eventName: string) {
  if (typeof window === "undefined") return;

  Clarity.event(eventName);
}

/**
 * Set cookie consent for Clarity
 */
export function setClarityConsent(consent: boolean = true) {
  if (typeof window === "undefined") return;

  Clarity.consent(consent);
}

/**
 * Upgrade session in Clarity
 */
export function upgradeClaritySession(reason: string) {
  if (typeof window === "undefined") return;

  Clarity.upgrade(reason);
}
