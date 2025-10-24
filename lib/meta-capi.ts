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
    ct?: string; // city (hashed)
    st?: string; // state (hashed)
    zp?: string; // zip code (hashed)
    country?: string; // country code (ISO 3166-1 alpha-2, lowercase)
    external_id?: string; // 🆕 CRÍTICO - identificador único
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
  externalId?: string; // 🆕 CRÍTICO para matching
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
  birthdate?: string; // formato YYYYMMDD
  city?: string;
  state?: string;
  country?: string; // código ISO 3166-1 alpha-2 (ex: 'br', 'us')
  zipCode?: string;
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

  if (!pixelId || !accessToken) {
    console.error("[Meta CAPI] Pixel ID ou Access Token não configurados");
    return false;
  }

  try {
    const userData: MetaEventData["user_data"] = {
      client_ip_address: params.ipAddress,
      client_user_agent: params.userAgent,
    };

    // 🆕 External ID (CRÍTICO para matching)
    if (params.externalId) {
      userData.external_id = params.externalId;
    }

    // Hashear email se fornecido (normalizar para melhor correspondência)
    if (params.email) {
      const normalizedEmail = params.email.toLowerCase().trim();
      userData.em = await hashSHA256(normalizedEmail);
    }

    // Hashear telefone se fornecido (normalizar formato internacional)
    if (params.phone) {
      // Remover caracteres não numéricos
      let cleanPhone = params.phone.replace(/\D/g, "");

      // Se começar com 0, remover (formato brasileiro)
      if (cleanPhone.startsWith("0")) {
        cleanPhone = cleanPhone.substring(1);
      }

      // Remover código do país duplicado (5555... -> 55...)
      if (cleanPhone.startsWith("5555")) {
        cleanPhone = cleanPhone.substring(2);
      }

      // Se não tem código do país, adicionar +55 (Brasil)
      // Formato brasileiro: DDD (2 dígitos) + Telefone (8-9 dígitos)
      if (
        cleanPhone.length >= 10 &&
        cleanPhone.length <= 11 &&
        !cleanPhone.startsWith("55")
      ) {
        cleanPhone = "55" + cleanPhone;
      }

      // Se já tem 55 mas está no formato errado, garantir que está correto
      if (cleanPhone.startsWith("55") && cleanPhone.length >= 12) {
        userData.ph = await hashSHA256(cleanPhone);
      } else if (cleanPhone.length >= 10) {
        // Fallback: tentar hashear mesmo se formato não está perfeito
        userData.ph = await hashSHA256(cleanPhone);
      }
    }

    // Hashear campos adicionais para melhorar qualidade de correspondência
    if (params.firstName) {
      // Normalizar nome: remover acentos, converter para minúsculo
      const normalizedFirstName = params.firstName
        .toLowerCase()
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, ""); // Remove acentos
      userData.fn = await hashSHA256(normalizedFirstName);
    }

    if (params.lastName) {
      // Normalizar sobrenome: remover acentos, converter para minúsculo
      const normalizedLastName = params.lastName
        .toLowerCase()
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, ""); // Remove acentos
      userData.ln = await hashSHA256(normalizedLastName);
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

    // 🆕 Dados de geolocalização (melhoram muito o matching)
    if (params.city) {
      const normalizedCity = params.city
        .toLowerCase()
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove acentos
        .replace(/[^a-z0-9\s]/g, ""); // Remove caracteres especiais
      userData.ct = await hashSHA256(normalizedCity);
    }

    if (params.state) {
      // Estado: pode ser sigla (SP) ou nome completo (São Paulo)
      const normalizedState = params.state
        .toLowerCase()
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      userData.st = await hashSHA256(normalizedState);
    }

    if (params.zipCode) {
      // CEP: remover formatação (12345-678 -> 12345678)
      const normalizedZip = params.zipCode.replace(/\D/g, "");
      userData.zp = await hashSHA256(normalizedZip);
    }

    if (params.country) {
      // País: código ISO 3166-1 alpha-2, lowercase (ex: 'br', 'us')
      userData.country = params.country.toLowerCase().trim().slice(0, 2);
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

    // Test Event Code (para debug no Event Manager)
    // Ativar em desenvolvimento para ver eventos em tempo real
    const testEventCode = process.env.META_TEST_EVENT_CODE;

    const requestBody: {
      data: Array<MetaEventData & { event_id: string }>;
      test_event_code?: string;
    } = {
      data: [eventData],
    };

    if (testEventCode) {
      requestBody.test_event_code = testEventCode;
    }

    const response = await fetch(
      `https://graph.facebook.com/v21.0/${pixelId}/events?access_token=${accessToken}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error("[Meta CAPI] Erro na resposta:", result);
      return false;
    }

    if (result.events_received === 1) {
      // Log detalhado de sucesso para debug de matching quality
      const matchingQuality = {
        // Identificadores únicos
        externalId: !!params.externalId,
        fbp: !!params.fbp,
        fbc: !!params.fbc,

        // Dados pessoais (PII)
        email: !!params.email,
        phone: !!params.phone,
        firstName: !!params.firstName,
        lastName: !!params.lastName,
        gender: !!params.gender,
        birthdate: !!params.birthdate,

        // Geolocalização
        city: !!params.city,
        state: !!params.state,
        country: !!params.country,
        zipCode: !!params.zipCode,

        // Dados técnicos
        ipAddress: !!params.ipAddress,
        userAgent: !!params.userAgent,
      };

      const qualityScore =
        Object.values(matchingQuality).filter(Boolean).length;
      const maxScore = Object.keys(matchingQuality).length;

      console.log(
        `[Meta CAPI] ✅ ${params.eventName} | eventId: ${params.eventId.slice(
          0,
          8
        )}... | Matching: ${qualityScore}/${maxScore}`,
        matchingQuality
      );

      return true;
    } else {
      console.error("[Meta CAPI] ❌ Evento não recebido:", result);
      return false;
    }
  } catch (error) {
    console.error("[Meta CAPI] Error sending event:", error);
    return false;
  }
}
