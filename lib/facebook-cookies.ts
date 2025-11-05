/**
 * @file: facebook-cookies.ts
 * @responsibility: Gerenciar cookies do Facebook (_fbp, _fbc) para melhor tracking
 * @exports: ensureFacebookCookies, getCookie, getFbcFromUrlOrStorage
 */

"use client";

const FBC_STORAGE_KEY = "visitavel_fbc";
const FBP_STORAGE_KEY = "visitavel_fbp";

/**
 * Captura fbclid da URL e cria _fbc (Facebook Click ID)
 * 🚀 CRÍTICO: Armazena também no localStorage para iOS/Safari (ITP)
 */
function captureFbcFromUrl(): string | null {
  if (typeof window === "undefined") return null;

  try {
    const url = new URL(window.location.href);
    const fbclid = url.searchParams.get("fbclid");

    if (!fbclid) return null;

    const ts = Math.floor(Date.now() / 1000);
    const fbcValue = `fb.1.${ts}.${fbclid}`;

    // 1. Salvar no cookie (padrão)
    if (!document.cookie.includes("_fbc=")) {
      document.cookie = `_fbc=${fbcValue}; Path=/; Max-Age=${
        60 * 60 * 24 * 90
      }; SameSite=Lax`;
    }

    // 2. 🚀 CRÍTICO: Salvar também no localStorage (fallback para iOS/ITP)
    try {
      localStorage.setItem(FBC_STORAGE_KEY, fbcValue);
    } catch (e) {
      // Ignorar se localStorage não disponível
    }

    return fbcValue;
  } catch (error) {
    return null;
  }
}

/**
 * Pega _fbc do cookie ou localStorage (fallback para iOS)
 */
export function getFbcFromUrlOrStorage(): string | undefined {
  if (typeof window === "undefined") return undefined;

  // 1. Tentar capturar da URL primeiro (se tiver fbclid)
  const fbcFromUrl = captureFbcFromUrl();
  if (fbcFromUrl) return fbcFromUrl;

  // 2. Tentar pegar do cookie
  const fbcFromCookie = getCookie("_fbc");
  if (fbcFromCookie) return fbcFromCookie;

  // 3. 🚀 FALLBACK: Tentar pegar do localStorage (iOS/ITP)
  try {
    const fbcFromStorage = localStorage.getItem(FBC_STORAGE_KEY);
    if (fbcFromStorage) return fbcFromStorage;
  } catch (e) {
    // Ignorar se localStorage não disponível
  }

  return undefined;
}

/**
 * Garante que os cookies _fbp e _fbc existem
 * Isso melhora a qualidade de correspondência no Meta CAPI
 */
export function ensureFacebookCookies(): void {
  if (typeof window === "undefined") return;

  // 1. Capturar _fbc da URL (se tiver fbclid)
  captureFbcFromUrl();

  // 2. Criar _fbp se não existir (fallback para ambientes com bloqueio)
  if (!document.cookie.includes("_fbp=")) {
    const ts = Math.floor(Date.now() / 1000);
    const rand = Math.random().toString(36).slice(2, 15);
    const value = `fb.1.${ts}.${rand}`;

    document.cookie = `_fbp=${value}; Path=/; Max-Age=${
      60 * 60 * 24 * 365 * 2
    }; SameSite=Lax`;

    // 🚀 CRÍTICO: Salvar também no localStorage (fallback para iOS/ITP)
    try {
      localStorage.setItem(FBP_STORAGE_KEY, value);
    } catch (e) {
      // Ignorar se localStorage não disponível
    }
  }
}

/**
 * Pega um cookie específico
 */
export function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) {
    return parts.pop()?.split(";").shift();
  }

  return undefined;
}

/**
 * Pega _fbp do cookie ou localStorage (fallback para iOS)
 */
export function getFbpFromCookieOrStorage(): string | undefined {
  if (typeof window === "undefined") return undefined;

  // 1. Tentar pegar do cookie
  const fbpFromCookie = getCookie("_fbp");
  if (fbpFromCookie) return fbpFromCookie;

  // 2. 🚀 FALLBACK: Tentar pegar do localStorage (iOS/ITP)
  try {
    const fbpFromStorage = localStorage.getItem(FBP_STORAGE_KEY);
    if (fbpFromStorage) return fbpFromStorage;
  } catch (e) {
    // Ignorar se localStorage não disponível
  }

  return undefined;
}
