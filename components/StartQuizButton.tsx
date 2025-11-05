/**
 * @file: StartQuizButton.tsx
 * @responsibility: CTA principal da landing do quiz com rastreamento não bloqueante
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { captureUTMsFromURL, getLeadInfo } from "@/lib/storage";
import {
  gtagEvent,
  trackLandingView,
  trackQuizCTAClick,
} from "@/lib/analytics";
import { trackMetaEventOnce } from "@/lib/track-meta-deduplicated";

function scheduleIdleTask(task: () => void) {
  if (typeof window === "undefined") return;

  const requestIdle = window.requestIdleCallback;
  if (typeof requestIdle === "function") {
    requestIdle(task, { timeout: 1500 });
  } else {
    window.setTimeout(task, 0);
  }
}

type StartQuizButtonVariant = "hero" | "footer";

const VARIANT_CONFIG: Record<
  StartQuizButtonVariant,
  {
    wrapperClassName: string;
    buttonClassName: string;
    description: string;
    textAlign: string;
    iconClassName: string;
  }
> = {
  hero: {
    wrapperClassName: "pt-4 md:pt-6 items-center md:items-start",
    buttonClassName:
      "w-full md:w-auto inline-flex items-center justify-center gap-2 md:gap-3 rounded-full bg-slate-900 px-8 md:px-10 py-5 md:py-6 text-base md:text-lg font-semibold text-white transition hover:bg-slate-800 hover:shadow-lg",
    description:
      "⏱️ Leva apenas 2 minutos • Resultado na hora • 100% gratuito",
    textAlign: "text-center md:text-left",
    iconClassName: "h-4 w-4 md:h-5 md:w-5",
  },
  footer: {
    wrapperClassName: "items-center",
    buttonClassName:
      "w-full md:w-auto inline-flex items-center justify-center gap-2 md:gap-3 rounded-full bg-slate-900 px-10 md:px-12 py-5 md:py-6 text-base md:text-lg font-bold text-white transition hover:bg-slate-800 hover:shadow-xl hover:scale-105",
    description: "⏱️ 2 minutos • Resultado imediato • Totalmente gratuito",
    textAlign: "text-center",
    iconClassName: "h-5 w-5 md:h-6 md:w-6",
  },
};

interface StartQuizButtonProps {
  variant?: StartQuizButtonVariant;
}

export function StartQuizButton({ variant = "hero" }: StartQuizButtonProps) {
  const [hasLead, setHasLead] = useState(false);
  const router = useRouter();
  const initializedRef = useRef(false);
  const config = VARIANT_CONFIG[variant];

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    captureUTMsFromURL();

    const leadInfo = getLeadInfo();
    const leadDetected = Boolean(leadInfo);
    setHasLead(leadDetected);

    Promise.resolve(router.prefetch("/quiz/start")).catch(() => {
      // Prefetch é uma micro-otimização — ignore falhas em ambientes sem suporte
    });

    scheduleIdleTask(() => {
      trackLandingView();
      trackMetaEventOnce("landing_view", {
        eventName: "landing_view",
        customData: {
          page: "landing",
          has_lead: leadDetected ? 1 : 0,
        },
      });
    });
  }, [router]);

  const handleStart = useCallback(() => {
    trackQuizCTAClick();
    gtagEvent("cta_start_quiz", {
      page: "/quiz",
      has_lead: hasLead,
      source: "landing_page",
    });

    scheduleIdleTask(() => {
      trackMetaEventOnce(`quiz_start_${Date.now()}`, {
        eventName: "quiz_start",
        customData: {
          source: "landing_cta",
          has_lead: hasLead ? 1 : 0,
        },
      });
    });

    router.push("/quiz/start");
  }, [hasLead, router]);

  return (
    <div
      className={cn(
        "flex flex-col gap-3 md:gap-4",
        config.wrapperClassName,
        config.textAlign
      )}
    >
      <Button
        size="lg"
        onClick={handleStart}
        className={config.buttonClassName}
      >
        {variant === "footer"
          ? "Começar mapeamento agora"
          : "Começar mapeamento gratuito"}
        <ArrowRight className={config.iconClassName} />
      </Button>
      <p className={cn("text-xs md:text-sm text-slate-500", config.textAlign)}>
        {config.description}
      </p>
    </div>
  );
}
