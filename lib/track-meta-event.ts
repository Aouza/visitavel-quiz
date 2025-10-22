/**
 * @file: track-meta-event.ts
 * @responsibility: Track unificado - Meta Pixel (client) + Conversions API (server) com deduplicação
 * @exports: trackMetaEvent
 */

import { generateUUID } from "./uuid";
import { getCookie } from "./facebook-cookies";

interface TrackMetaEventParams {
  eventName: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
  birthdate?: string; // formato YYYYMMDD
  customData?: Record<string, string | number>;
}

/**
 * Dispara evento no Meta Pixel (client-side)
 */
function firePixelEvent(
  eventName: string,
  eventId: string,
  customData?: Record<string, string | number>
) {
  if (typeof window === "undefined" || !window.fbq) {
    return;
  }

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

    const response = await fetch("/api/meta/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventName,
        eventId,
        email: params.email,
        phone: params.phone,
        firstName: params.firstName, // 🆕 Para melhorar qualidade
        lastName: params.lastName, // 🆕
        gender: params.gender, // 🆕
        birthdate: params.birthdate, // 🆕
        customData: params.customData,
        fbp,
        fbc,
        eventSourceUrl: window.location.href,
      }),
    });

    if (!response.ok) {
      const result = await response.json();
      console.error("[Track Meta] Erro CAPI:", result);
    }
  } catch (error) {
    console.error("[Track Meta] Erro fatal CAPI:", error);
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
  // Remover hífens para melhor compatibilidade com Meta
  const eventId = generateUUID().replace(/-/g, "");

  // 2. Dispara no Meta Pixel (client-side)
  firePixelEvent(params.eventName, eventId, params.customData);

  // 3. Envia para Conversions API (server-side) de forma assíncrona
  // Não aguardamos para não bloquear a UX
  sendToConversionsAPI(params.eventName, eventId, params).catch((err) => {
    console.error("[Track Meta] CAPI failed:", err);
  });
}
