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
    client_ip_address?: string;
    client_user_agent?: string;
    fbc?: string; // Facebook click ID
    fbp?: string; // Facebook browser ID
  };
  custom_data?: Record<string, string | number>;
}

interface SendMetaEventParams {
  eventName: string;
  email?: string;
  phone?: string;
  ipAddress?: string;
  userAgent?: string;
  eventSourceUrl: string;
  customData?: Record<string, string | number>;
  fbc?: string;
  fbp?: string;
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

  if (!pixelId || !accessToken) {
    console.warn("[Meta CAPI] Pixel ID ou Access Token não configurados");
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

    // Adicionar Facebook IDs se disponíveis
    if (params.fbc) userData.fbc = params.fbc;
    if (params.fbp) userData.fbp = params.fbp;

    const eventData: MetaEventData = {
      event_name: params.eventName,
      event_time: Math.floor(Date.now() / 1000),
      action_source: "website",
      event_source_url: params.eventSourceUrl,
      user_data: userData,
    };

    // Adicionar dados customizados se fornecidos
    if (params.customData) {
      eventData.custom_data = params.customData;
    }

    const response = await fetch(
      `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${accessToken}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: [eventData],
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("[Meta CAPI] Error response:", errorData);
      return false;
    }

    const result = await response.json();

    if (result.events_received === 1) {
      return true;
    } else {
      console.error("[Meta CAPI] Event not received:", result);
      return false;
    }
  } catch (error) {
    console.error("[Meta CAPI] Error sending event:", error);
    return false;
  }
}
