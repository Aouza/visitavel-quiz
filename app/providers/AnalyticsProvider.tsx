/**
 * @file: AnalyticsProvider.tsx
 * @responsibility: Rastreia navegação automática entre páginas no Google Analytics
 * @exports: AnalyticsProvider (default)
 */

"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import { gtagPageView } from "@/lib/analytics";

function AnalyticsContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname) {
      const url =
        pathname + (searchParams.toString() ? `?${searchParams}` : "");
      gtagPageView(url);
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

