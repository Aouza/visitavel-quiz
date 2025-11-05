/**
 * @file: AnalyticsProvider.tsx
 * @responsibility: Rastreia navegação automática entre páginas no Google Analytics
 * 🚀 CRÍTICO: Evita duplicação de PageView se já foi disparado pelo script inline
 * @exports: AnalyticsProvider (default)
 */

"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import { gtagPageView } from "@/lib/analytics";
import { trackMetaEventOnce } from "@/lib/track-meta-deduplicated";

function AnalyticsContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname) {
      const url =
        pathname + (searchParams.toString() ? `?${searchParams}` : "");
      gtagPageView(url);

      // Track Meta - PageView para páginas importantes
      // 🚀 CRÍTICO: Evita duplicar PageView se já foi disparado pelo script inline
      const importantPages = [
        "/quiz",
        "/quiz/start",
        "/quiz/lead",
        "/quiz/resultado",
      ];

      if (importantPages.includes(pathname)) {
        // Verificar se PageView já foi disparado pelo script inline
        const alreadyTracked =
          typeof window !== "undefined" &&
          sessionStorage.getItem(`meta_pv_${pathname}_tracked`);

        if (!alreadyTracked) {
          trackMetaEventOnce(`pageview_${pathname}`, {
            eventName: "PageView",
            customData: {
              page_path: pathname,
              page_title: document.title,
              content_category: pathname.includes("quiz") ? "quiz" : "general",
            },
          });

          // Marcar como rastreado para evitar duplicação
          if (typeof window !== "undefined") {
            sessionStorage.setItem(`meta_pv_${pathname}_tracked`, "true");
          }
        }
      }
    }
  }, [pathname, searchParams]);

  return null;
}

export default function AnalyticsProvider() {
  return (
    <Suspense fallback={null}>
      <AnalyticsContent />
    </Suspense>
  );
}
