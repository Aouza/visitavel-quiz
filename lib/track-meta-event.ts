/**
 * @file: track-meta-event.ts
 * @responsibility: Track unificado - Meta Pixel (client) + Conversions API (server) com deduplicação
 * @exports: trackMetaEvent
 */

import { generateUUID } from "./uuid";
import { getCookie } from "./facebook-cookies";
import { getExternalId } from "./external-id";

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
  country?: string;
  zipCode?: string;
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
 *
 * IMPORTANTE: Adiciona delay de 300ms para garantir que Pixel chegue primeiro
 * Isso melhora a taxa de deduplicação (CAPI deve chegar ligeiramente depois)
 */
async function sendToConversionsAPI(
  eventName: string,
  eventId: string,
  params: TrackMetaEventParams
): Promise<void> {
  try {
    // ⏱️ Delay estratégico: Pixel precisa chegar primeiro para deduplicação funcionar
    // Meta recomenda que CAPI chegue 0.5-2 segundos depois do Pixel
    await new Promise((resolve) => setTimeout(resolve, 300));

    const fbp = getCookie("_fbp");
    const fbc = getCookie("_fbc");
    const externalId = getExternalId(); // Identificador único do usuário

    const response = await fetch("/api/meta/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventName,
        eventId,
        externalId, // 🆕 CRÍTICO para matching
        email: params.email,
        phone: params.phone,
        firstName: params.firstName,
        lastName: params.lastName,
        gender: params.gender,
        birthdate: params.birthdate,
        city: params.city,
        state: params.state,
        country: params.country,
        zipCode: params.zipCode,
        customData: params.customData,
        fbp,
        fbc,
        eventSourceUrl: window.location.href,
        userAgent: navigator.userAgent, // Enviar do client também
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
