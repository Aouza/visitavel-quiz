/**
 * @file: MetaPixel.tsx
 * @responsibility: Inicializa e gerencia o Facebook/Meta Pixel para tracking
 * @exports: MetaPixel (default)
 */

"use client";

import { useEffect } from "react";

const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID;

export default function MetaPixel() {
  useEffect(() => {
    if (!FB_PIXEL_ID) return;

    // Verifica se o pixel já foi inicializado (evita duplicação)
    // @ts-ignore - propriedade customizada para controle de inicialização
    if (window.fbq && (window.fbq as any).__initialized) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
      if (f.fbq) return; // Proteção: se já existe, não reinicializa
      n = f.fbq = function () {
        n.callMethod
          ? n.callMethod.apply(n, arguments)
          : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = !0;
      n.version = "2.0";
      n.queue = [];
      t = b.createElement(e);
      t.async = !0;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode?.insertBefore(t, s);
    })(
      window,
      document,
      "script",
      "https://connect.facebook.net/en_US/fbevents.js"
    );

    // Inicializa o Pixel apenas UMA vez
    if (window.fbq && !(window.fbq as any).__initialized) {
      window.fbq("init", FB_PIXEL_ID);
      // @ts-ignore - propriedade customizada para controle de inicialização
      (window.fbq as any).__initialized = true; // Marca como inicializado
      // NÃO dispara PageView aqui - será disparado pelo AnalyticsProvider
    }
  }, []);

  return (
    <noscript>
      <img
        height="1"
        width="1"
        style={{ display: "none" }}
        src={`https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1`}
        alt=""
      />
    </noscript>
  );
}
