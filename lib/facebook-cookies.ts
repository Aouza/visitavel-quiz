/**
 * @file: facebook-cookies.ts
 * @responsibility: Gerenciar cookies do Facebook (_fbp, _fbc) para melhor tracking
 * @exports: ensureFacebookCookies
 */

"use client";

/**
 * Garante que os cookies _fbp e _fbc existem
 * Isso melhora a qualidade de correspondência no Meta CAPI
 */
export function ensureFacebookCookies(): void {
  if (typeof window === "undefined") return;

  // 1. Sintetizar _fbc a partir de fbclid (se presente na URL)
  const url = new URL(window.location.href);
  const fbclid = url.searchParams.get("fbclid");

  if (fbclid && !document.cookie.includes("_fbc=")) {
    const ts = Math.floor(Date.now() / 1000);
    const value = `fb.1.${ts}.${fbclid}`;
    document.cookie = `_fbc=${value}; Path=/; Max-Age=${
      60 * 60 * 24 * 90
    }; SameSite=Lax`;
  }

  // 2. Criar _fbp se não existir (fallback para ambientes com bloqueio)
  if (!document.cookie.includes("_fbp=")) {
    const ts = Math.floor(Date.now() / 1000);
    const rand = Math.random().toString(36).slice(2, 15);
    const value = `fb.1.${ts}.${rand}`;
    document.cookie = `_fbp=${value}; Path=/; Max-Age=${
      60 * 60 * 24 * 365 * 2
    }; SameSite=Lax`;
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
