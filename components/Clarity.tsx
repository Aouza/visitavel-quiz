/**
 * @file: Clarity.tsx
 * @responsibility: Microsoft Clarity analytics integration
 */

"use client";

import { useEffect } from "react";
import Clarity from "@microsoft/clarity";

const CLARITY_PROJECT_ID = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;

export function ClarityAnalytics() {
  useEffect(() => {
    if (!CLARITY_PROJECT_ID) {
      console.error("[Clarity] Project ID not configured");
      return;
    }

    // Initialize Clarity
    Clarity.init(CLARITY_PROJECT_ID);
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
