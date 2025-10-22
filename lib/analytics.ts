/**
 * @file: analytics.ts
 * @responsibility: Rastreamento de eventos (Google Analytics 4 + Microsoft Clarity)
 * @note: Meta Pixel é rastreado via lib/track-meta-event.ts
 * @exports: track, trackPageView, EventNames, gtag functions
 */

// Definir tipos para window
declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (
      command: string,
      target: string,
      config?: Record<string, unknown>
    ) => void;
    fbq?: (
      action: string,
      eventName: string,
      parameters?: Record<string, unknown>
    ) => void;
  }
}

// Import Clarity functions
import {
  trackClarityEvent,
  setClarityTag,
  identifyUser,
} from "@/components/Clarity";

// Google Analytics Tracking ID (configurado via env)
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "";

export const EventNames = {
  // Quiz
  QUIZ_VIEW: "quiz_view",
  QUIZ_CTA_CLICK: "quiz_cta_click",
  QUIZ_COMPLETED: "quiz_completed",

  // Lead
  LEAD_SUBMITTED: "lead_submitted",
  LEAD_ERROR: "lead_error",

  // Offer
  OFFER_VIEWED: "offer_viewed",
  CTA_CLICK_CHECKOUT: "cta_click_checkout",
  ORDER_BUMP_VIEW: "order_bump_view",
  ORDER_BUMP_CLICK: "order_bump_click",

  // Report
  VIEW_REPORT_LOCKED: "view_report_locked",
} as const;

export type EventName = (typeof EventNames)[keyof typeof EventNames];

interface EventPayload {
  [key: string]: string | number | boolean | undefined | null;
}

/**
 * Envia evento para GA4 (via gtag) + Microsoft Clarity
 * Nota: Meta Pixel agora é rastreado via trackMetaEvent() para deduplicação
 */
export function track(name: EventName, payload?: EventPayload): void {
  if (typeof window === "undefined") return;

  // GA4 via gtag (método oficial que realmente funciona)
  try {
    if (window.gtag) {
      window.gtag("event", name, payload);
    }
  } catch (error) {
    console.error("[Analytics] Error sending gtag event:", error);
  }

  // Microsoft Clarity
  try {
    trackClarityEvent(name);
  } catch (error) {
    console.error("[Analytics] Error sending to Clarity:", error);
  }

  // Meta Pixel foi REMOVIDO daqui para evitar duplicação
  // Use trackMetaEvent() diretamente para eventos que precisam ir para Meta
}

/**
 * Rastreia visualização de página
 */
export function trackPageView(path: string, title?: string): void {
  if (typeof window === "undefined") return;

  try {
    if (window.dataLayer) {
      window.dataLayer.push({
        event: "page_view",
        page_path: path,
        page_title: title || document.title,
      });
    }
  } catch (error) {
    console.error("[Analytics] Error tracking page view:", error);
  }
}

/**
 * Envia evento genérico para GA4 via gtag
 * Útil para eventos personalizados do Google Analytics
 */
export function gtagEvent(action: string, params?: Record<string, any>): void {
  if (typeof window === "undefined") return;

  try {
    if (window.gtag) {
      window.gtag("event", action, params);
    }
  } catch (error) {
    console.error("[Analytics] Error sending gtag event:", error);
  }
}

/**
 * Rastreia pageview manualmente no GA4 via gtag
 * Útil para SPAs e navegação client-side (Next.js router)
 */
export function gtagPageView(url: string): void {
  if (typeof window === "undefined" || !GA_TRACKING_ID) return;

  try {
    if (window.gtag) {
      window.gtag("config", GA_TRACKING_ID, {
        page_path: url,
      });
    }
  } catch (error) {
    console.error("[Analytics] Error tracking gtag page view:", error);
  }
}

/**
 * Helpers específicos por evento
 */

export function trackQuizView(): void {
  track(EventNames.QUIZ_VIEW);
}

export function trackQuizCTAClick(): void {
  track(EventNames.QUIZ_CTA_CLICK);
}

export function trackQuizCompleted(
  segment: string,
  score: number,
  answersHash?: string
): void {
  track(EventNames.QUIZ_COMPLETED, {
    segment,
    score,
    answers_hash: answersHash,
  });

  // Add Clarity tags for quiz completion
  try {
    setClarityTag("quiz_segment", segment);
    setClarityTag("quiz_score", score.toString());
    setClarityTag("quiz_completed", "true");
  } catch (error) {
    console.error("[Analytics] Error setting Clarity tags:", error);
  }
}

export function trackLeadSubmitted(email: string): void {
  // Não enviar email completo, apenas domínio para privacidade
  const domain = email.split("@")[1] || "unknown";
  track(EventNames.LEAD_SUBMITTED, {
    email_domain: domain,
  });

  // Identify user in Clarity (using email domain as custom ID)
  try {
    identifyUser(domain, undefined, undefined, `User from ${domain}`);
    setClarityTag("lead_source", "quiz_form");
    setClarityTag("email_domain", domain);
  } catch (error) {
    console.error("[Analytics] Error identifying user in Clarity:", error);
  }
}

export function trackLeadError(error: string): void {
  track(EventNames.LEAD_ERROR, {
    error_message: error,
  });
}

export function trackOfferViewed(segment: string): void {
  track(EventNames.OFFER_VIEWED, {
    segment,
  });
}

export function trackCTAClickCheckout(plan: string, price?: number): void {
  track(EventNames.CTA_CLICK_CHECKOUT, {
    plan,
    price,
  });
}

export function trackOrderBumpView(): void {
  track(EventNames.ORDER_BUMP_VIEW);
}

export function trackOrderBumpClick(): void {
  track(EventNames.ORDER_BUMP_CLICK);
}

export function trackViewReportLocked(segment: string): void {
  track(EventNames.VIEW_REPORT_LOCKED, {
    segment,
  });
}
