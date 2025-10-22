/**
 * @file: app/quiz/resultado/page.tsx
 * @responsibility: Página de resultado elegante com preview real
 */

"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ElegantResultCard } from "@/components/ElegantResultCard";
import { QuizDebugReport } from "@/components/QuizDebugReport";
import { type Segment } from "@/lib/questions";
import { trackPageView } from "@/lib/analytics";
import { loadQuizProgress, loadQuizResult } from "@/lib/storage";
import { computeSegment } from "@/lib/scoring";

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
      router.push("/quiz");
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
        router.push("/quiz");
        return;
      }
    }

    setSegment(seg);
    trackPageView("/quiz/resultado", `Resultado: ${seg}`);
  }, [searchParams, router]);

  const handlePrimaryAction = () => {
    router.push(`/oferta?seg=${segment}`);
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

      {/* Debug Report - só aparece em desenvolvimento */}
      <QuizDebugReport
        answers={quizData.answers}
        scores={quizData.scores}
        segment={segment}
      />
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
