/**
 * @file: MetaPixel.tsx
 * @responsibility: Gerencia cookies do Facebook - PIXEL JÁ É INICIALIZADO NO LAYOUT.TSX
 * @exports: MetaPixel (default)
 *
 * 🚀 CRÍTICO: Pixel é inicializado pelo script inline no layout.tsx (beforeInteractive)
 * Este componente agora apenas garante que os cookies existem (não inicializa o Pixel)
 */

"use client";

import { useEffect } from "react";
import { ensureFacebookCookies } from "@/lib/facebook-cookies";

const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID;

export default function MetaPixel() {
  useEffect(() => {
    if (!FB_PIXEL_ID) return;

    // 🆕 Garantir que os cookies Facebook existem
    // O Pixel já foi inicializado pelo script inline no layout.tsx
    ensureFacebookCookies();
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
