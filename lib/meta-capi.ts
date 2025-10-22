/**
 * @file: meta-capi.ts
 * @responsibility: Enviar eventos para Meta Conversion API (server-side tracking)
 * @exports: sendMetaEvent
 */

interface MetaEventData {
  event_name: string;
  event_time: number;
  action_source: "website" | "app" | "email" | "phone_call";
  event_source_url: string;
  user_data: {
    em?: string; // email (hashed com SHA256)
    ph?: string; // phone (hashed com SHA256)
    fn?: string; // first name (hashed)
    ln?: string; // last name (hashed)
    ge?: string; // gender (hashed, 'm' or 'f')
    db?: string; // date of birth (hashed, YYYYMMDD)
    client_ip_address?: string;
    client_user_agent?: string;
    fbc?: string; // Facebook click ID
    fbp?: string; // Facebook browser ID
  };
  custom_data?: Record<string, string | number>;
}

interface SendMetaEventParams {
  eventName: string;
  eventId: string; // UUID para deduplicação
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
  birthdate?: string; // formato YYYYMMDD
  ipAddress?: string;
  userAgent?: string;
  eventSourceUrl: string;
  customData?: Record<string, string | number>;
  fbc?: string; // Facebook Click ID (_fbc cookie)
  fbp?: string; // Facebook Browser ID (_fbp cookie)
}

/**
 * Hash string com SHA256 (Meta requer dados sensíveis hasheados)
 */
async function hashSHA256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text.toLowerCase().trim());
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Envia evento para Meta Conversion API
 */
export async function sendMetaEvent(
  params: SendMetaEventParams
): Promise<boolean> {
  const pixelId = process.env.NEXT_PUBLIC_FB_PIXEL_ID;
  const accessToken = process.env.META_ACCESS_TOKEN;

  // 🔍 LOG: Verificar configuração
  console.log("[Meta CAPI] 🚀 Iniciando envio:", {
    eventName: params.eventName,
    eventId: params.eventId?.slice(0, 8) + "...",
    pixelId: pixelId?.slice(0, 8) + "...",
    hasToken: !!accessToken,
    tokenPrefix: accessToken?.slice(0, 6) + "...",
  });

  if (!pixelId || !accessToken) {
    console.warn("[Meta CAPI] ❌ Pixel ID ou Access Token não configurados");
    return false;
  }

  try {
    const userData: MetaEventData["user_data"] = {
      client_ip_address: params.ipAddress,
      client_user_agent: params.userAgent,
    };

    // Hashear email se fornecido
    if (params.email) {
      userData.em = await hashSHA256(params.email);
    }

    // Hashear telefone se fornecido
    if (params.phone) {
      // Remover caracteres não numéricos
      const cleanPhone = params.phone.replace(/\D/g, "");
      userData.ph = await hashSHA256(cleanPhone);
    }

    // 🆕 Hashear campos adicionais para melhorar qualidade de correspondência
    if (params.firstName) {
      userData.fn = await hashSHA256(params.firstName);
    }

    if (params.lastName) {
      userData.ln = await hashSHA256(params.lastName);
    }

    if (params.gender) {
      // Meta aceita 'm' ou 'f' (minúsculo)
      const normalizedGender = params.gender.toLowerCase().charAt(0);
      if (normalizedGender === "m" || normalizedGender === "f") {
        userData.ge = await hashSHA256(normalizedGender);
      }
    }

    if (params.birthdate) {
      // Formato esperado: YYYYMMDD (ex: 19900515)
      userData.db = await hashSHA256(params.birthdate);
    }

    // Adicionar Facebook IDs se disponíveis
    if (params.fbc) userData.fbc = params.fbc;
    if (params.fbp) userData.fbp = params.fbp;

    const eventData: MetaEventData & { event_id: string } = {
      event_name: params.eventName,
      event_id: params.eventId, // UUID para deduplicação
      event_time: Math.floor(Date.now() / 1000),
      action_source: "website",
      event_source_url: params.eventSourceUrl,
      user_data: userData,
    };

    // Adicionar dados customizados se fornecidos
    if (params.customData) {
      eventData.custom_data = params.customData;
    }

    // 🔍 LOG: Dados sendo enviados
    console.log("[Meta CAPI] 📤 Payload:", {
      event_name: eventData.event_name,
      event_id: eventData.event_id.slice(0, 8) + "...",
      has_email: !!userData.em,
      has_phone: !!userData.ph,
      has_fbp: !!userData.fbp,
      has_fbc: !!userData.fbc,
      ip: userData.client_ip_address,
    });

    const response = await fetch(
      `https://graph.facebook.com/v21.0/${pixelId}/events?access_token=${accessToken}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: [eventData],
        }),
      }
    );

    const result = await response.json();

    // 🔍 LOG: Resposta do Meta
    console.log("[Meta CAPI] 📥 Resposta:", {
      status: response.status,
      ok: response.ok,
      result,
    });

    if (!response.ok) {
      console.error("[Meta CAPI] ❌ Erro na resposta:", result);
      return false;
    }

    if (result.events_received === 1) {
      console.log("[Meta CAPI] ✅ Evento enviado com sucesso!");
      return true;
    } else {
      console.error("[Meta CAPI] ⚠️ Evento não recebido:", result);
      return false;
    }
  } catch (error) {
    console.error("[Meta CAPI] Error sending event:", error);
    return false;
  }
}
