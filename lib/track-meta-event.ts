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
    console.warn(
      "[Track Meta] ⚠️ fbq não disponível (window ou fbq undefined)"
    );
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

  // 🔍 LOG: Pixel event sendo disparado
  console.log("[Track Meta] 🎯 Pixel Event:", {
    eventName,
    eventId: eventId.slice(0, 8) + "...",
    isStandard,
    customData,
  });

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

    // 🔍 LOG: Enviando para CAPI
    console.log("[Track Meta] 🌐 Enviando para CAPI:", {
      eventName,
      eventId: eventId.slice(0, 8) + "...",
      has_email: !!params.email,
      has_phone: !!params.phone,
      has_fbp: !!fbp,
      has_fbc: !!fbc,
      fbp_preview: fbp?.slice(0, 15) + "...", // 🔍 Ver preview do cookie
      fbc_preview: fbc?.slice(0, 15) + "...", // 🔍 Ver preview do cookie
      url: window.location.href,
    });

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

    const result = await response.json();

    // 🔍 LOG: Resposta da API
    console.log("[Track Meta] 📬 Resposta CAPI:", {
      status: response.status,
      ok: response.ok,
      result,
    });

    if (!response.ok) {
      console.error("[Track Meta] ❌ Erro na chamada CAPI:", result);
    }
  } catch (error) {
    console.error("[Track Meta] ❌ Erro fatal CAPI:", error);
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
  // CORREÇÃO: Remover hífens para melhor compatibilidade com Meta
  const eventId = generateUUID().replace(/-/g, "");

  console.log("[Track Meta] ⚡ INICIANDO TRACK:", {
    eventName: params.eventName,
    eventId: eventId.slice(0, 8) + "...",
    hasEmail: !!params.email,
    hasPhone: !!params.phone,
    hasFirstName: !!params.firstName,
    hasGender: !!params.gender,
    customData: params.customData,
  });

  // 2. Dispara no Meta Pixel (client-side)
  firePixelEvent(params.eventName, eventId, params.customData);

  // 3. Envia para Conversions API (server-side) de forma assíncrona
  // Não aguardamos para não bloquear a UX
  sendToConversionsAPI(params.eventName, eventId, params).catch((err) => {
    console.error("[Track Meta] ❌ CAPI failed (non-blocking):", err);
  });
}
