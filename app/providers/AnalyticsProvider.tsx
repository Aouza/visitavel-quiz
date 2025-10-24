/**
 * @file: AnalyticsProvider.tsx
 * @responsibility: Rastreia navegação automática entre páginas no Google Analytics
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
      const importantPages = [
        "/quiz",
        "/quiz/start",
        "/quiz/lead",
        "/quiz/resultado",
      ];

      if (importantPages.includes(pathname)) {
        trackMetaEventOnce(`pageview_${pathname}`, {
          eventName: "PageView",
          customData: {
            page_path: pathname,
            page_title: document.title,
            content_category: pathname.includes("quiz") ? "quiz" : "general",
          },
        });
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
