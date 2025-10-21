/**
 * @file: app/quiz/resultado/page.tsx
 * @responsibility: Página de resultado do quiz (resumo básico + CTAs)
 */

"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ResultCard } from "@/components/ResultCard";
import { type Segment } from "@/lib/questions";
import { trackPageView } from "@/lib/analytics";

function ResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [segment, setSegment] = useState<Segment | null>(null);

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
      // Segmento inválido, redirecionar para o quiz
      router.push("/quiz");
      return;
    }

    setSegment(seg);
    trackPageView("/quiz/resultado", `Resultado: ${seg}`);
  }, [searchParams, router]);

  const handlePrimaryAction = () => {
    // Ir para página de oferta
    router.push(`/oferta?seg=${segment}`);
  };

  const handleSecondaryAction = () => {
    // Confirmar envio e ir para oferta mesmo assim
    alert(
      "Perfeito! Vamos enviar o resumo para seu e-mail. Enquanto isso, veja nossa oferta especial."
    );
    router.push(`/oferta?seg=${segment}`);
  };

  if (!segment) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground">Carregando seu resultado...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <ResultCard
        segment={segment}
        onPrimaryAction={handlePrimaryAction}
        onSecondaryAction={handleSecondaryAction}
      />

      {/* Explicação adicional */}
      <div className="max-w-2xl mx-auto mt-8 text-center space-y-4">
        <p className="text-sm text-muted-foreground">
          Este é apenas um resumo gratuito. Para acelerar sua recuperação e
          evitar recaídas, preparamos um Kit Anti-Recaída completo com
          ferramentas práticas e suporte especializado.
        </p>
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
