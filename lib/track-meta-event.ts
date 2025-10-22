/**
 * @file: track-meta-event.ts
 * @responsibility: Track unificado - Meta Pixel (client) + Conversions API (server) com deduplicação
 * @exports: trackMetaEvent
 */

import { generateUUID } from "./uuid";

interface TrackMetaEventParams {
  eventName: string;
  email?: string;
  phone?: string;
  customData?: Record<string, string | number>;
}

/**
 * Pega cookie do browser (_fbp, _fbc)
 */
function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) {
    return parts.pop()?.split(";").shift();
  }

  return undefined;
}

/**
 * Dispara evento no Meta Pixel (client-side)
 */
function firePixelEvent(
  eventName: string,
  eventId: string,
  customData?: Record<string, string | number>
) {
  if (typeof window === "undefined" || !window.fbq) return;

  // Eventos padrão do Meta (sem 'Custom' prefix)
  const standardEvents = [
    "Lead",
    "CompleteRegistration",
    "InitiateCheckout",
    "Purchase",
    "ViewContent",
    "PageView",
  ];

  const isStandard = standardEvents.includes(eventName);

  if (isStandard) {
    window.fbq("track", eventName, {
      ...customData,
      eventID: eventId, // event_id para deduplicação
    });
  } else {
    window.fbq("trackCustom", eventName, {
      ...customData,
      eventID: eventId, // event_id para deduplicação
    });
  }
}

/**
 * Envia evento para Conversions API (server-side) via endpoint Next.js
 */
async function sendToConversionsAPI(
  eventName: string,
  eventId: string,
  params: TrackMetaEventParams
): Promise<void> {
  try {
    const fbp = getCookie("_fbp");
    const fbc = getCookie("_fbc");

    await fetch("/api/meta/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventName,
        eventId,
        email: params.email,
        phone: params.phone,
        customData: params.customData,
        fbp,
        fbc,
        eventSourceUrl: window.location.href,
      }),
    });
  } catch (error) {
    console.error("[Track Meta] Error sending to CAPI:", error);
  }
}

/**
 * 🎯 FUNÇÃO PRINCIPAL: Track evento no Meta Pixel E Conversions API
 * Com deduplicação automática via event_id
 */
export async function trackMetaEvent(
  params: TrackMetaEventParams
): Promise<void> {
  // 1. Gerar UUID único para este evento (deduplicação)
  const eventId = generateUUID();

  // 2. Dispara no Meta Pixel (client-side)
  firePixelEvent(params.eventName, eventId, params.customData);

  // 3. Envia para Conversions API (server-side) de forma assíncrona
  // Não aguardamos para não bloquear a UX
  sendToConversionsAPI(params.eventName, eventId, params).catch((err) => {
    console.error("[Track Meta] CAPI failed (non-blocking):", err);
  });
}
