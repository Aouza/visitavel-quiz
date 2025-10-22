/**
 * @file: analytics.ts
 * @responsibility: Rastreamento de eventos (GA4 + Meta Pixel)
 * @exports: track, trackPageView, EventNames
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

// Google Analytics Tracking ID (configurado via env)
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "";

export const EventNames = {
  // Quiz
  QUIZ_VIEW: "quiz_view",
  QUIZ_CTA_CLICK: "quiz_cta_click",
  QUIZ_STEP: "quiz_step",
  QUIZ_COMPLETED: "quiz_completed",

  // Lead
  LEAD_SUBMITTED: "lead_submitted",
  LEAD_ERROR: "lead_error",

  // Offer
  OFFER_VIEWED: "offer_viewed",
  CTA_CLICK_CHECKOUT: "cta_click_checkout",
  ORDER_BUMP_VIEW: "order_bump_view",
  ORDER_BUMP_CLICK: "order_bump_click",
} as const;

export type EventName = (typeof EventNames)[keyof typeof EventNames];

interface EventPayload {
  [key: string]: string | number | boolean | undefined | null;
}

/**
 * Envia evento para GA4 (dataLayer) e Meta Pixel (fbq)
 */
export function track(name: EventName, payload?: EventPayload): void {
  if (typeof window === "undefined") return;

  // GA4 via dataLayer
  try {
    if (window.dataLayer) {
      window.dataLayer.push({
        event: name,
        ...payload,
      });
    }
  } catch (error) {
    console.error("[Analytics] Error pushing to dataLayer:", error);
  }

  // Meta Pixel
  try {
    if (window.fbq) {
      window.fbq("trackCustom", name, payload || {});
    }
  } catch (error) {
    console.error("[Analytics] Error tracking Meta Pixel:", error);
  }
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

export function trackQuizStep(stepNumber: number, totalSteps: number): void {
  track(EventNames.QUIZ_STEP, {
    step: stepNumber,
    total_steps: totalSteps,
    progress_percentage: Math.round((stepNumber / totalSteps) * 100),
  });
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
}

export function trackLeadSubmitted(email: string): void {
  // Não enviar email completo, apenas domínio para privacidade
  const domain = email.split("@")[1] || "unknown";
  track(EventNames.LEAD_SUBMITTED, {
    email_domain: domain,
  });
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
