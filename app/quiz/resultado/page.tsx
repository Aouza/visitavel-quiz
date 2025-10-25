/**
 * @file: app/quiz/resultado/page.tsx
 * @responsibility: Página de resultado elegante com preview real
 */

"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ElegantResultCard } from "@/components/ElegantResultCard";
import { type Segment } from "@/lib/questions";
import { trackPageView } from "@/lib/analytics";
import { loadQuizProgress, loadQuizResult, getLeadInfo } from "@/lib/storage";
import { computeSegment } from "@/lib/scoring";
import { trackMetaEventOnce } from "@/lib/track-meta-deduplicated";

function ResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [segment, setSegment] = useState<Segment | null>(null);
  const [quizData, setQuizData] = useState<{
    answers: Record<string, string | string[]>;
    scores: Record<Segment, number>;
  } | null>(null);

  useEffect(() => {
    const seg = searchParams.get("seg") as Segment;

    if (
      !seg ||
      ![
        "devastacao",
        "abstinencia",
        "interiorizacao",
        "ira",
        "superacao",
      ].includes(seg)
    ) {
      router.push("/quiz/start");
      return;
    }

    // Verificar se existe lead capturado
    const leadInfo = getLeadInfo();
    if (!leadInfo) {
      // Se não tem lead, redirecionar para captura
      router.push("/quiz/lead");
      return;
    }

    // Tentar carregar resultado salvo primeiro
    const savedResult = loadQuizResult();
    if (savedResult?.answers) {
      setQuizData({
        answers: savedResult.answers,
        scores: savedResult.scores,
      });
    } else {
      // Fallback: tentar carregar do progresso em andamento
      const savedProgress = loadQuizProgress();
      if (savedProgress?.answers) {
        const result = computeSegment(savedProgress.answers);
        setQuizData({
          answers: savedProgress.answers,
          scores: result.scores,
        });
      } else {
        // Se não houver dados salvos, redirecionar para o quiz
        alert("Você precisa completar o quiz primeiro!");
        router.push("/quiz/start");
        return;
      }
    }

    setSegment(seg);
    trackPageView("/quiz/resultado", `Resultado: ${seg}`);

    // Track Meta - ViewContent (visualização do resultado)
    // 🆕 Melhorar matching com dados do lead (reutilizar leadInfo já declarado)
    const nameParts = leadInfo?.name?.trim().split(" ") || [];
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ") || undefined;

    // 🆕 Chave única para permitir múltiplos acessos (usuário pode voltar)
    const resultKey = `result_viewed_${seg}_${Date.now()}`;

    trackMetaEventOnce(resultKey, {
      eventName: "ViewContent",
      email: leadInfo?.email, // 🆕 Dados do lead para melhor matching
      phone: leadInfo?.whatsapp, // 🆕
      firstName, // 🆕
      lastName, // 🆕
      gender: leadInfo?.gender, // 🆕
      country: "br", // 🆕 ISO 3166-1 alpha-2
      customData: {
        content_type: "quiz_result",
        content_name: `Resultado: ${seg}`,
        content_category: "quiz",
        segment: seg,
        value: 0, // Gratuito
        currency: "BRL",
        has_lead: leadInfo ? 1 : 0, // 🆕 Flag para análise
        lead_source: "post_quiz_capture", // 🆕
      },
    });
  }, [searchParams, router]);

  const handlePrimaryAction = (location?: string) => {
    // 🆕 Fake door: redirecionar para página de interesse
    router.push(`/interesse?seg=${segment}&loc=${location || "unknown"}`);
  };

  if (!segment || !quizData) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="inline-flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-600">Carregando seu resultado...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f9fafb] via-[#f3f4f6] to-[#ffffff] text-slate-900">
      <div className="container mx-auto px-4 pt-16 pb-28">
        <ElegantResultCard
          segment={segment}
          answers={quizData.answers}
          scores={quizData.scores}
          onPrimaryAction={handlePrimaryAction}
        />
      </div>
    </div>
  );
}

export default function ResultadoPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground">Carregando seu resultado...</p>
        </div>
      }
    >
      <ResultContent />
    </Suspense>
  );
}
