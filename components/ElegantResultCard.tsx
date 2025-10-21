/**
 * @file: ElegantResultCard.tsx
 * @responsibility: Card de resultado elegante com preview real do relatório
 */

"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { type Segment } from "@/lib/questions";
import { getSegmentContent } from "@/lib/segments";
import { ArrowRight, Loader2 } from "lucide-react";

interface ElegantResultCardProps {
  segment: Segment;
  answers: Record<string, string | string[]>;
  scores: Record<Segment, number>;
  onPrimaryAction: () => void;
}

export function ElegantResultCard({
  segment,
  answers,
  scores,
  onPrimaryAction,
}: ElegantResultCardProps) {
  const content = getSegmentContent(segment);
  const [reportPreview, setReportPreview] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [showStickyCTA, setShowStickyCTA] = useState(false);
  const isProduction = process.env.NODE_ENV === "production";
  const forceReportApi =
    process.env.NEXT_PUBLIC_FORCE_REPORT_API === "true" || isProduction;
  const useMockReport =
    process.env.NEXT_PUBLIC_USE_MOCK_REPORT === "true" || !forceReportApi;
  const answersKey = useMemo(() => JSON.stringify(answers), [answers]);
  const scoresKey = useMemo(() => JSON.stringify(scores), [scores]);
  const answersPayload = useMemo(
    () => JSON.parse(answersKey) as Record<string, string | string[]>,
    [answersKey]
  );
  const scoresPayload = useMemo(
    () => JSON.parse(scoresKey) as Record<Segment, number>,
    [scoresKey]
  );
  const previewCacheKey = useMemo(
    () => `report-preview:${segment}:${answersKey}:${scoresKey}`,
    [segment, answersKey, scoresKey]
  );
  const emotionalPreview = useMemo(
    () => [
      "Você volta a pensar nele toda vez que bate o vazio porque sua mente ainda não entendeu onde a história travou. Isso não é fraqueza; é um pedido por resposta clara.",
      "Seu jeito de amar não é apego cego. Você quer saber se o esforço vale. Quando não enxerga retorno, acaba se culpando. Você precisa de respostas simples, não de tentativas no escuro.",
      "Você aprendeu a salvar relação sozinho(a) e passou do seu limite muitas vezes. Por isso hoje fica sem energia e sem voz. Identificar esse ponto é o primeiro passo para recuperar força.",
      "Seu corpo já avisou: aperto no peito, sono ruim, mente acelerada. Esses sinais pedem mudança real, não insistência.",
      "Você já começou a ver onde o ciclo prende você. O relatório completo mostra o gatilho principal, o momento da virada e o plano direto para sair desse looping.",
    ],
    []
  );

  useEffect(() => {
    const controller = new AbortController();

    async function fetchPreview() {
      setIsLoading(true);
      setReportPreview("");

      // Se estiver em modo mock ou cache em sessionStorage, evitar nova chamada
      if (typeof window !== "undefined") {
        const cachedPreview = window.sessionStorage.getItem(previewCacheKey);
        if (cachedPreview) {
          setReportPreview(cachedPreview);
          setIsLoading(false);
          return;
        }
      }

      if (useMockReport) {
        const mock = emotionalPreview.join("\n\n");
        setReportPreview(mock);
        if (typeof window !== "undefined") {
          window.sessionStorage.setItem(previewCacheKey, mock);
        }
        setIsLoading(false);
        return;
      }

      const birthdate =
        typeof (answersPayload as Record<string, unknown>).birthdate ===
        "string"
          ? (answersPayload as Record<string, string>).birthdate
          : undefined;
      const exBirthdate =
        typeof (answersPayload as Record<string, unknown>).exBirthdate ===
        "string"
          ? (answersPayload as Record<string, string>).exBirthdate
          : undefined;

      try {
        const response = await fetch("/api/generate-report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            segment,
            answers: answersPayload,
            scores: scoresPayload,
            birthdate,
            exBirthdate,
            mode: "summary",
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          return;
        }

        const data = await response.json();
        const preview = data.report ?? "";
        setReportPreview(preview);
        if (typeof window !== "undefined" && preview) {
          window.sessionStorage.setItem(previewCacheKey, preview);
        }
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          return;
        }
        console.error("Erro ao gerar preview:", error);
        const fallback = emotionalPreview.join("\n\n");
        setReportPreview(fallback);
        if (typeof window !== "undefined") {
          window.sessionStorage.setItem(previewCacheKey, fallback);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    fetchPreview();

    return () => controller.abort();
    // answersKey e scoresKey garantem dependências estáveis
  }, [
    segment,
    answersKey,
    scoresKey,
    answersPayload,
    scoresPayload,
    emotionalPreview,
    previewCacheKey,
    useMockReport,
  ]);

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => setShowStickyCTA(true), 800);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isLoading]);

  const handleScrollToLocked = useCallback(() => {
    const lockedZone = document.getElementById("zona-bloqueada");
    lockedZone?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const previewParagraphs = useMemo(() => {
    if (reportPreview.trim().length === 0) {
      return emotionalPreview;
    }

    const sanitized = reportPreview.trim();

    const parts = sanitized
      .split(/\n\s*\n/)
      .map((paragraph) => paragraph.trim());
    return parts.filter(Boolean);
  }, [reportPreview, emotionalPreview]);

  const lockedSections = [
    {
      icon: "💞",
      title:
        "Descubra por que seu cérebro ainda busca essa pessoa — e como parar de reforçar isso",
      summary:
        "Entenda o mecanismo emocional que mantém você preso e aprenda a desativar esse padrão de busca.",
      cta: "Ver como parar de pensar nessa pessoa",
    },
    {
      icon: "🧠",
      title:
        "Entenda por que sua mente ainda repete a história — e como quebrar esse loop",
      summary:
        "Método prático para interromper o pensamento obsessivo e finalmente dormir em paz.",
      cta: "Ver como silenciar minha mente",
    },
    {
      icon: "🌙",
      title: "Aprenda a reduzir a abstinência emocional sem recaídas",
      summary:
        "Descubra por que seu corpo reage como se estivesse em crise e como equilibrar essa resposta.",
      cta: "Ver como lidar com a saudade",
    },
    {
      icon: "⚡",
      title: "Reconstrua sua autoestima sem depender de aprovação externa",
      summary:
        "Entenda como o término abalou sua confiança e o caminho para recuperá-la de verdade.",
      cta: "Ver como recuperar minha confiança",
    },
    {
      icon: "🌑",
      title: "Pare de se comparar e de sentir que está atrasado na cura",
      summary:
        "Compreenda as fases ocultas de cada pessoa e libere-se da culpa e da comparação.",
      cta: "Ver por que ele parece bem",
    },
    {
      icon: "🕯",
      title:
        "Feche esse ciclo de forma madura, sem precisar apagar ou mandar mensagens",
      summary:
        "Método de encerramento emocional que traz paz interna sem humilhação ou arrependimento.",
      cta: "Ver como encerrar com dignidade",
    },
    {
      icon: "🔮",
      title:
        "Recupere sua vitalidade e volte a sentir prazer nas pequenas coisas",
      summary:
        "Reative seu interesse pela vida: sono, apetite, vontade de sair e se cuidar.",
      cta: "Ver como voltar a me sentir bem",
    },
    {
      icon: "🌅",
      title: "Transforme essa dor em aprendizado e reconstrua sua identidade",
      summary:
        "Descubra o significado oculto por trás do fim e use isso como seu ponto de virada.",
      cta: "Ver o que vem depois",
    },
  ];

  const renderParagraph = useCallback(
    (paragraph: string, paragraphIndex: number) => {
      const segments = paragraph.split("**");
      return segments.map((segment, segmentIndex) => {
        const key = `${paragraphIndex}-${segmentIndex}`;
        if (segmentIndex % 2 === 1) {
          return (
            <span key={key} className="font-semibold text-slate-900">
              {segment}
            </span>
          );
        }
        return <span key={key}>{segment}</span>;
      });
    },
    []
  );

  return (
    <div className="relative w-full max-w-4xl mx-auto space-y-24 pb-32 text-slate-900">
      {/* 1. Header / abertura - PRIMEIRO IMPACTO */}
      <section className="space-y-8">
        <div className="flex items-center gap-3 text-xs uppercase tracking-[0.35em] text-slate-400">
          <span className="h-px w-12 bg-slate-200" />
          Relatório emocional
        </div>
        <div className="flex items-start gap-6">
          <div className="hidden md:flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-3xl">
            {content.icon}
          </div>
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-semibold leading-tight text-slate-900">
                Você ainda pensa nessa história porque seu cérebro ainda está
                preso no ciclo.
                <br />
                Mas agora você pode entender — e sair dele.
              </h1>
              <p className="text-lg md:text-xl text-slate-600 max-w-3xl leading-relaxed">
                Tudo o que você sente tem uma explicação. E o{" "}
                <strong>Relatório Completo</strong> te mostra o que o
                diagnóstico gratuito ainda não conseguiu revelar:{" "}
                <strong>por que sua mente não desliga</strong>, e o que fazer
                hoje para recuperar o controle.
              </p>
            </div>

            {/* CTA acima da dobra */}
            <div className="pt-4">
              <Button
                onClick={onPrimaryAction}
                size="lg"
                className="inline-flex items-center gap-3 rounded-full bg-slate-900 px-10 py-4 text-base font-semibold text-white transition-all hover:bg-slate-800 hover:shadow-xl hover:scale-105"
              >
                Quero ver o relatório completo agora
                <ArrowRight className="h-5 w-5" />
              </Button>
              <p className="text-xs text-slate-500 mt-3">
                ✓ Acesso imediato • Garantia de 7 dias • Já ajudou +7 mil
                pessoas
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Relatório gratuito */}
      <section className="space-y-10">
        <header className="space-y-5">
          {/* Tarja verde de validação */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200">
            <span className="text-sm font-semibold text-emerald-700">
              ✅ Diagnóstico gratuito concluído
            </span>
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl md:text-4xl font-semibold text-slate-900 leading-tight">
              Aqui está o seu diagnóstico emocional personalizado
            </h2>
            <p className="text-base md:text-lg text-slate-600 max-w-3xl leading-relaxed">
              Baseado nas suas respostas, este diagnóstico identifica o padrão
              emocional que está te mantendo preso.{" "}
              <strong>Leia com atenção</strong> — ele foi montado
              especificamente para você.
            </p>
          </div>
        </header>

        <div className="relative overflow-hidden rounded-[32px] border-2 border-slate-300 bg-white px-8 md:px-10 py-10 shadow-lg">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.06),_transparent_70%)]" />

          {/* Badge de qualidade */}
          <div className="absolute top-6 right-6 hidden md:block">
            <div className="px-3 py-1.5 rounded-full bg-emerald-100 border border-emerald-200">
              <span className="text-xs font-semibold text-emerald-700">
                📊 Baseado nas suas respostas
              </span>
            </div>
          </div>
          <div className="relative space-y-6 text-base md:text-lg leading-loose text-slate-600">
            {isLoading ? (
              <div className="flex flex-col items-center gap-4 py-10 text-center text-slate-500">
                <Loader2 className="h-9 w-9 animate-spin text-slate-400" />
                <p>Estamos decodificando os dados do seu padrão emocional...</p>
              </div>
            ) : (
              previewParagraphs.map((paragraph, index) => (
                <p key={index} className="text-left">
                  {renderParagraph(paragraph, index)}
                </p>
              ))
            )}
          </div>
        </div>

        {!isLoading && (
          <div className="text-center space-y-4 pt-8">
            <div className="h-px w-24 bg-slate-200 mx-auto" />
            <p className="text-sm text-slate-500 italic">
              Isso é apenas a primeira camada do seu padrão emocional
            </p>
            <button
              type="button"
              onClick={handleScrollToLocked}
              className="inline-flex items-center gap-2 text-base font-semibold text-slate-700 underline decoration-slate-300 underline-offset-8 transition hover:text-slate-900 hover:decoration-slate-500"
            >
              Ver o que ainda está oculto →
            </button>
          </div>
        )}

        {/* Novas seções adaptadas */}
        {!isLoading && (
          <div className="space-y-16 pt-12">
            {/* Bloco 1 — O que você já ganhou */}
            <div className="space-y-8">
              <div className="text-center space-y-3">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200">
                  <span className="text-sm font-semibold text-emerald-700">
                    ✅ Você já descobriu 3 verdades sobre o seu processo
                  </span>
                </div>
                <h3 className="text-2xl md:text-3xl font-medium text-slate-900 max-w-2xl mx-auto">
                  Com o diagnóstico gratuito, você descobriu:
                </h3>
              </div>

              <div className="grid gap-5 md:grid-cols-3 max-w-4xl mx-auto">
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center">
                      <span className="text-white text-base font-bold">1</span>
                    </div>
                  </div>
                  <h4 className="font-bold text-slate-900 text-base mb-2">
                    Sua mente ainda procura sentido
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Não é fraqueza — é um mecanismo emocional que fica ativado
                    quando a história termina sem respostas claras.
                  </p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center">
                      <span className="text-white text-base font-bold">2</span>
                    </div>
                  </div>
                  <h4 className="font-bold text-slate-900 text-base mb-2">
                    O vínculo ainda está ativo
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Você repete um padrão inconsciente que te prende à mesma
                    história.
                  </p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center">
                      <span className="text-white text-base font-bold">3</span>
                    </div>
                  </div>
                  <h4 className="font-bold text-slate-900 text-base mb-2">
                    Você não tem culpa
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Seu cérebro está tentando te proteger. O primeiro ponto que
                    precisa ser resolvido para sair dessa fase.
                  </p>
                </div>
              </div>

              <div className="text-center pt-6">
                <div className="relative max-w-2xl mx-auto">
                  {/* Destaque visual suave */}
                  <div className="relative overflow-hidden rounded-3xl border-2 border-slate-300 bg-gradient-to-br from-slate-50 via-amber-50/30 to-slate-50 p-8 shadow-lg">
                    {/* Brilho sutil */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-transparent" />

                    <div className="relative space-y-5">
                      {/* Badge de alerta suave */}
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800 text-white">
                        <span className="text-lg">⚡</span>
                        <span className="text-xs font-bold uppercase tracking-wider">
                          Apenas 1 de 8 revelada
                        </span>
                      </div>

                      {/* Headline impactante */}
                      <h3 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight">
                        Mas isso é só o começo
                      </h3>

                      {/* Counter visual */}
                      <div className="flex items-center justify-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                        <div className="h-2 w-2 rounded-full bg-slate-300" />
                        <div className="h-2 w-2 rounded-full bg-slate-300" />
                        <div className="h-2 w-2 rounded-full bg-slate-300" />
                        <div className="h-2 w-2 rounded-full bg-slate-300" />
                        <div className="h-2 w-2 rounded-full bg-slate-300" />
                        <div className="h-2 w-2 rounded-full bg-slate-300" />
                        <div className="h-2 w-2 rounded-full bg-slate-300" />
                      </div>

                      {/* Copy emocional */}
                      <p className="text-base md:text-lg text-slate-700 leading-relaxed max-w-xl mx-auto">
                        Existem{" "}
                        <strong className="text-slate-900">
                          7 processos emocionais críticos ainda ocultos
                        </strong>{" "}
                        — e eles explicam por que a dor volta mesmo quando
                        parece que você está bem.
                      </p>

                      {/* CTA interno */}
                      <div className="pt-2">
                        <p className="text-sm font-semibold text-slate-800">
                          O relatório completo desbloqueia todos os 8 processos
                          →
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bloco 2 — O que ainda falta - REDESIGN MODERNO */}
            <div className="space-y-10">
              {/* Header emocional com gradiente */}
              <div className="relative text-center space-y-6 p-8 rounded-3xl bg-gradient-to-br from-slate-50 to-rose-50/20">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/50 to-transparent" />

                <div className="relative space-y-4">
                  <h3 className="text-2xl md:text-4xl font-bold text-slate-900 max-w-3xl mx-auto leading-tight">
                    Mesmo sabendo que acabou, esses gatilhos ainda te fazem
                    reviver tudo de novo.
                  </h3>
                  <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                    É por isso que, mesmo tentando seguir, você volta pro mesmo
                    ponto — um ciclo de pensamentos, recaídas e arrependimentos.
                  </p>

                  {/* Badge de alerta integrado */}
                  <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-red-500 text-white shadow-lg">
                    <span className="text-base">⚠️</span>
                    <span className="text-xs font-bold uppercase tracking-wider">
                      8 processos ativos no inconsciente
                    </span>
                  </div>
                </div>
              </div>

              {/* Grid moderno com glassmorphism */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
                <div className="group relative overflow-hidden rounded-2xl border-2 border-red-200/50 bg-gradient-to-br from-red-50 to-rose-50 backdrop-blur-sm p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:border-red-300">
                  <div className="absolute top-2 right-2 text-6xl font-black text-red-900/5 select-none">
                    01
                  </div>
                  <div className="relative space-y-3">
                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-600 text-white text-xs font-bold">
                      01
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm leading-snug min-h-[40px]">
                      Abstinência emocional ativa
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Seu corpo sente a ausência como se fosse uma crise de
                      abstinência.
                    </p>
                    <div className="flex items-center gap-1.5 pt-1">
                      <div className="h-1 w-1 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-xs font-medium text-slate-500">
                        Bloqueado
                      </span>
                    </div>
                  </div>
                </div>

                <div className="group relative overflow-hidden rounded-2xl border-2 border-red-200/50 bg-gradient-to-br from-red-50 to-rose-50 backdrop-blur-sm p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:border-red-300">
                  <div className="absolute top-2 right-2 text-6xl font-black text-red-900/5 select-none">
                    02
                  </div>
                  <div className="relative space-y-3">
                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-600 text-white text-xs font-bold">
                      02
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm leading-snug min-h-[40px]">
                      Autoestima fragmentada
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      O fim abalou a forma como você se enxerga.
                    </p>
                    <div className="flex items-center gap-1.5 pt-1">
                      <div className="h-1 w-1 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-xs font-medium text-slate-500">
                        Bloqueado
                      </span>
                    </div>
                  </div>
                </div>

                <div className="group relative overflow-hidden rounded-2xl border-2 border-red-200/50 bg-gradient-to-br from-red-50 to-rose-50 backdrop-blur-sm p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:border-red-300">
                  <div className="absolute top-2 right-2 text-6xl font-black text-red-900/5 select-none">
                    03
                  </div>
                  <div className="relative space-y-3">
                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-600 text-white text-xs font-bold">
                      03
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm leading-snug min-h-[40px]">
                      Comparação destrutiva
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Ver o outro bem enquanto você sofre machuca.
                    </p>
                    <div className="flex items-center gap-1.5 pt-1">
                      <div className="h-1 w-1 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-xs font-medium text-slate-500">
                        Bloqueado
                      </span>
                    </div>
                  </div>
                </div>

                <div className="group relative overflow-hidden rounded-2xl border-2 border-red-200/50 bg-gradient-to-br from-red-50 to-rose-50 backdrop-blur-sm p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:border-red-300">
                  <div className="absolute top-2 right-2 text-6xl font-black text-red-900/5 select-none">
                    04
                  </div>
                  <div className="relative space-y-3">
                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-600 text-white text-xs font-bold">
                      04
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm leading-snug min-h-[40px]">
                      Fechamento incompleto
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Você quer soltar, mas sente que apagar é injusto.
                    </p>
                    <div className="flex items-center gap-1.5 pt-1">
                      <div className="h-1 w-1 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-xs font-medium text-slate-500">
                        Bloqueado
                      </span>
                    </div>
                  </div>
                </div>

                <div className="group relative overflow-hidden rounded-2xl border-2 border-red-200/50 bg-gradient-to-br from-red-50 to-rose-50 backdrop-blur-sm p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:border-red-300">
                  <div className="absolute top-2 right-2 text-6xl font-black text-red-900/5 select-none">
                    05
                  </div>
                  <div className="relative space-y-3">
                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-600 text-white text-xs font-bold">
                      05
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm leading-snug min-h-[40px]">
                      Paralisação da reconstrução
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Travado e sem energia para reconstruir rotina.
                    </p>
                    <div className="flex items-center gap-1.5 pt-1">
                      <div className="h-1 w-1 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-xs font-medium text-slate-500">
                        Bloqueado
                      </span>
                    </div>
                  </div>
                </div>

                <div className="group relative overflow-hidden rounded-2xl border-2 border-red-200/50 bg-gradient-to-br from-red-50 to-rose-50 backdrop-blur-sm p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:border-red-300">
                  <div className="absolute top-2 right-2 text-6xl font-black text-red-900/5 select-none">
                    06
                  </div>
                  <div className="relative space-y-3">
                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-600 text-white text-xs font-bold">
                      06
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm leading-snug min-h-[40px]">
                      Pensamento obsessivo recorrente
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Sua mente volta sempre para a mesma pessoa.
                    </p>
                    <div className="flex items-center gap-1.5 pt-1">
                      <div className="h-1 w-1 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-xs font-medium text-slate-500">
                        Bloqueado
                      </span>
                    </div>
                  </div>
                </div>

                <div className="group relative overflow-hidden rounded-2xl border-2 border-red-200/50 bg-gradient-to-br from-red-50 to-rose-50 backdrop-blur-sm p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:border-red-300">
                  <div className="absolute top-2 right-2 text-6xl font-black text-red-900/5 select-none">
                    07
                  </div>
                  <div className="relative space-y-3">
                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-600 text-white text-xs font-bold">
                      07
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm leading-snug min-h-[40px]">
                      Injustiça emocional percebida
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Ver o outro bem enquanto você sofre parece injusto.
                    </p>
                    <div className="flex items-center gap-1.5 pt-1">
                      <div className="h-1 w-1 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-xs font-medium text-slate-500">
                        Bloqueado
                      </span>
                    </div>
                  </div>
                </div>

                <div className="group relative overflow-hidden rounded-2xl border-2 border-red-200/50 bg-gradient-to-br from-red-50 to-rose-50 backdrop-blur-sm p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:border-red-300">
                  <div className="absolute top-2 right-2 text-6xl font-black text-red-900/5 select-none">
                    08
                  </div>
                  <div className="relative space-y-3">
                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-600 text-white text-xs font-bold">
                      08
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm leading-snug min-h-[40px]">
                      Identidade fragmentada
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Você não sabe mais quem é sem essa pessoa.
                    </p>
                    <div className="flex items-center gap-1.5 pt-1">
                      <div className="h-1 w-1 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-xs font-medium text-slate-500">
                        Bloqueado
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bloco 3 — Por que o relatório completo (REORGANIZADO) */}
            <div className="space-y-8">
              {/* Header */}
              <div className="text-center space-y-4">
                <h3 className="text-3xl md:text-4xl font-semibold text-slate-900 max-w-3xl mx-auto leading-tight">
                  O relatório completo te mostra como sair disso — passo a passo
                </h3>
                <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                  Em poucos minutos, você entende a origem dos seus gatilhos e o
                  que fazer hoje para começar a se sentir melhor.
                </p>
              </div>

              {/* 3 Pilares - com ícones emocionais */}
              <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto pt-4">
                <div className="text-center p-6 rounded-2xl bg-white border border-slate-200 space-y-4">
                  <div className="flex items-center justify-center h-20">
                    <div className="text-5xl">💡</div>
                  </div>
                  <h4 className="font-semibold text-slate-900 text-lg">
                    Clareza do problema
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Você vê exatamente o que te prende e por que sua mente ainda
                    não desligou
                  </p>
                </div>

                <div className="text-center p-6 rounded-2xl bg-white border border-slate-200 space-y-4">
                  <div className="flex items-center justify-center h-20">
                    <div className="text-5xl">🧭</div>
                  </div>
                  <h4 className="font-semibold text-slate-900 text-lg">
                    Passos práticos
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    O que fazer hoje para começar a mudar, com ações claras e
                    diretas
                  </p>
                </div>

                <div className="text-center p-6 rounded-2xl bg-white border border-slate-200 space-y-4">
                  <div className="flex items-center justify-center h-20">
                    <div className="text-5xl">🌱</div>
                  </div>
                  <h4 className="font-semibold text-slate-900 text-lg">
                    Controle real
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Você age com clareza, em vez de só esperar o tempo passar
                  </p>
                </div>
              </div>

              {/* CTA */}
              <div className="text-center pt-6">
                <Button
                  onClick={onPrimaryAction}
                  size="lg"
                  className="inline-flex items-center gap-3 rounded-full bg-slate-900 px-10 py-4 text-base font-bold text-white transition-all hover:bg-slate-800 hover:shadow-xl hover:scale-105"
                >
                  Desbloquear Relatório Completo Agora
                  <ArrowRight className="h-5 w-5" />
                </Button>
                <p className="text-xs text-slate-500 mt-4">
                  ✓ Acesso imediato • Resultados em 3-7 dias • +7 mil pessoas já
                  transformaram sua dor em clareza
                </p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 3. Transição e conteúdo bloqueado */}
      <section id="zona-bloqueada" className="space-y-12">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
            próximo nível
          </p>
          <h3 className="text-2xl md:text-3xl font-medium text-slate-900">
            Você já entendeu parte da lógica. Agora libere o restante e veja o
            que realmente está por trás do que você sente.
          </h3>
          <p className="text-sm md:text-base text-slate-600 max-w-2xl">
            Essas são as 8 camadas que explicam por completo o padrão que te
            mantém preso. Cada uma detalha uma resposta direta e um caminho de
            ação.
          </p>
        </header>

        <div className="space-y-4">
          {lockedSections.map((section) => (
            <article
              key={section.title}
              className="group relative overflow-hidden rounded-2xl border-2 border-slate-300 bg-slate-50/80 px-6 py-6 shadow-sm transition-all duration-300 hover:border-slate-400 hover:shadow-lg hover:bg-slate-50"
            >
              <div className="flex items-start gap-4 opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                <div className="flex-shrink-0 text-3xl mt-1 opacity-50 grayscale">
                  {section.icon}
                </div>

                <div className="flex-1 space-y-3">
                  <h4 className="text-lg md:text-xl font-semibold text-slate-800 leading-snug">
                    {section.title}
                  </h4>
                  <p className="text-sm md:text-base text-slate-600 leading-relaxed">
                    {section.summary}
                  </p>
                </div>

                <div className="flex-shrink-0">
                  <Button
                    onClick={onPrimaryAction}
                    className="inline-flex items-center gap-2 rounded-full bg-slate-800 px-5 py-2.5 text-xs font-semibold text-white transition-all hover:bg-slate-900 hover:shadow-md hover:scale-105"
                  >
                    <span className="text-sm">🔓</span>
                    {section.cta || "Desbloquear"}
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Transformação em 3-7 dias - EMOTIONAL IMPACT */}
      <section className="space-y-10">
        <div className="text-center space-y-4">
          <h3 className="text-3xl md:text-4xl font-bold text-slate-900 max-w-3xl mx-auto leading-tight">
            Em 3 a 7 dias você começa a sentir a diferença
          </h3>
          <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto">
            Não é mágica — é você entendendo o que te prende e fazendo diferente
          </p>
        </div>

        {/* Grid de transformações - ESTILO VERCEL */}
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 space-y-4">
              <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center text-2xl">
                🔁
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-base">
                  Sua mente desacelera
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Os pensamentos obsessivos perdem força e você volta a ter
                  espaço mental pra respirar
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 space-y-4">
              <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center text-2xl">
                📵
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-base">
                  Você para de agir por impulso
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Ganha clareza pra não cair nas recaídas e finalmente parar o
                  vai e volta que te esgota
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 space-y-4">
              <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center text-2xl">
                😴
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-base">
                  Dorme melhor e acorda mais leve
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Sua mente entende que a história acabou e finalmente descansa
                  — sem aquele peso no peito
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 space-y-4">
              <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center text-2xl">
                🧩
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-base">
                  Entende por que tudo aconteceu
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Para de se culpar e troca a dor por clareza — você vê a lógica
                  emocional por trás de tudo
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 space-y-4">
              <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center text-2xl">
                🔒
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-base">
                  Para de se torturar com o outro
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Desativa os gatilhos de comparação e volta a focar em você —
                  no seu tempo e na sua vida
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 space-y-4">
              <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center text-2xl">
                🌱
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-base">
                  Volta a sentir vontade de viver pra si
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Reconecta com sua essência e começa a reconstruir sua vida —
                  sem precisar apagar o passado
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA forte com urgência */}
        <div className="text-center pt-6">
          <Button
            onClick={onPrimaryAction}
            size="lg"
            className="inline-flex items-center gap-3 rounded-full bg-slate-900 px-12 py-4 text-lg font-bold text-white transition-all hover:bg-slate-800 hover:shadow-xl hover:scale-105"
          >
            Quero Sentir Essa Diferença Agora
            <ArrowRight className="h-5 w-5" />
          </Button>
          <p className="text-xs text-slate-500 mt-4">
            ✓ Acesso imediato • Garantia de 7 dias • Mais de 7 mil pessoas já
            sentiram a diferença
          </p>
        </div>
      </section>

      {/* 4. CTA final com motivação emocional */}
      <section className="space-y-8 text-center">
        <div className="space-y-4">
          <h4 className="text-3xl md:text-4xl font-semibold text-slate-900 max-w-3xl mx-auto leading-tight">
            Agora que você já entendeu parte da lógica, não pare aqui.
          </h4>
          <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            O relatório completo é o que faz você realmente sair do ciclo — com
            orientações claras, ações práticas e resultados em poucos dias.
          </p>
        </div>

        <Button
          onClick={onPrimaryAction}
          size="lg"
          className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-slate-900 px-12 py-5 text-lg font-bold text-white transition focus-visible:outline-none hover:bg-slate-800 hover:shadow-2xl hover:scale-105"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-white/[0.08] via-white/[0.16] to-white/[0.08] opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
          <span className="relative flex items-center gap-2">
            Liberar Relatório Completo Agora
            <ArrowRight className="h-6 w-6 transition-transform duration-500 group-hover:translate-x-1" />
          </span>
        </Button>

        {/* Microprovas simbólicas */}
        <div className="pt-8 space-y-3 text-sm text-slate-600">
          <p className="flex items-center justify-center gap-2">
            ✓ Mais de 7.000 pessoas já descobriram o que estava por trás da dor
          </p>
          <p className="flex items-center justify-center gap-2">
            ✓ 92% disseram que o relatório descreveu exatamente o que estavam
            vivendo
          </p>
          <p className="flex items-center justify-center gap-2">
            ✓ Em média, os primeiros resultados aparecem entre 3 e 5 dias
          </p>
        </div>
      </section>

      {/* Espaço final para evitar overlap com CTA sticky */}
      <div className="h-10 md:h-16" />

      {showStickyCTA && (
        <div className="fixed inset-x-4 bottom-6 z-50 md:inset-x-auto md:left-1/2 md:w-[480px] md:-translate-x-1/2">
          <div className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-white/95 shadow-lg backdrop-blur">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.08),_transparent_70%)] opacity-0 transition-opacity duration-500 hover:opacity-100" />
            <div className="relative flex flex-col gap-3 px-6 py-5 md:flex-row md:items-center md:gap-4">
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-slate-900">
                  Pronto(a) para atravessar o véu do que ainda está oculto?
                </p>
                <p className="text-xs text-slate-500">
                  Relatório completo liberado imediatamente após o desbloqueio.
                </p>
              </div>
              <Button
                onClick={onPrimaryAction}
                size="sm"
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                🔓 Quero liberar agora
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
