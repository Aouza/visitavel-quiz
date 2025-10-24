/**
 * @file: ElegantResultCard.tsx
 * @responsibility: Card de resultado elegante com preview real do relatório
 */

"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Marquee } from "@/components/ui/marquee";
import { type Segment } from "@/lib/questions";
import { getSegmentContent } from "@/lib/segments";
import { getLeadInfo } from "@/lib/storage";
import { gtagEvent, trackViewReportLocked } from "@/lib/analytics";
import { trackMetaEventOnce } from "@/lib/track-meta-deduplicated";
import { ArrowRight, Loader2 } from "lucide-react";
import { ReportFreePayload } from "@/types/report-free";

const toStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? [trimmed] : [];
  }
  return [];
};

interface ElegantResultCardProps {
  segment: Segment;
  answers: Record<string, string | string[]>;
  scores: Record<Segment, number>;
  onPrimaryAction: (location?: string) => void;
}

// Depoimentos reais e emocionais
const testimonials = [
  {
    emoji: "😌",
    name: "Carolina M.",
    time: "Há 3 dias",
    text: "Eu achava que nunca ia conseguir parar de pensar nele. Em 5 dias usando o relatório, percebi que consegui dormir uma noite inteira sem acordar com aquela inquietação. Parece pouco, mas pra mim foi gigante.",
  },
  {
    emoji: "💪",
    name: "Rafael S.",
    time: "Há 1 semana",
    text: "O relatório me mostrou exatamente por que eu sempre voltava. Entendi o padrão e finalmente consegui quebrar o ciclo. Hoje não sinto mais aquela vontade de mandar mensagem ou stalker.",
  },
  {
    emoji: "🌱",
    name: "Juliana P.",
    time: "Há 4 dias",
    text: "Eu estava travada, sem conseguir seguir. O relatório me deu passos práticos e claros. Em uma semana eu já sentia diferença — voltei a sair, sorrir e me sentir eu mesma de novo.",
  },
  {
    emoji: "✨",
    name: "Lucas T.",
    time: "Há 2 dias",
    text: "Achei que ia ser mais um texto genérico, mas foi tão certeiro que cheguei a chorar. Ele descreveu exatamente o que eu tava sentindo e me mostrou por que eu não conseguia virar a página.",
  },
  {
    emoji: "🎯",
    name: "Mariana L.",
    time: "Há 5 dias",
    text: "O relatório me ajudou a entender que eu não tava fraca, eu só tava processando errado. Em menos de uma semana, comecei a ter controle sobre meus pensamentos e a dormir melhor.",
  },
  {
    emoji: "🔥",
    name: "Pedro H.",
    time: "Há 1 semana",
    text: "Eu não acreditava que ia funcionar tão rápido. Em 3 dias eu já conseguia passar o dia inteiro sem pensar nela obsessivamente. O relatório me deu ferramentas práticas que realmente funcionam.",
  },
  {
    emoji: "💙",
    name: "Amanda R.",
    time: "Há 6 dias",
    text: "Finalmente entendi por que eu me comparava tanto com a vida dele. O relatório me mostrou o padrão por trás disso e como parar. Hoje eu foco em mim e no meu tempo.",
  },
  {
    emoji: "🌟",
    name: "Gabriel F.",
    time: "Há 3 dias",
    text: "Eu estava me culpando por tudo. O relatório me fez ver que o problema não era eu, era o padrão que eu tava seguindo. Em poucos dias eu já sentia que tinha voltado a ter controle da minha vida.",
  },
];

export function ElegantResultCard({
  segment,
  answers,
  scores,
  onPrimaryAction,
}: ElegantResultCardProps) {
  const content = getSegmentContent(segment);
  const [reportPreview, setReportPreview] = useState<
    ReportFreePayload | string
  >("");
  const [isLoading, setIsLoading] = useState(true);
  const [showStickyCTA, setShowStickyCTA] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [showAdditionalSections, setShowAdditionalSections] = useState(false);

  // Wrapper para adicionar tracking ao CTA principal
  const handleUnlockClick = useCallback(
    (location: string) => {
      // Track GA4
      gtagEvent("cta_unlock_report", {
        segment,
        page: "/quiz/resultado",
        location,
      });

      // Track Meta - InitiateCheckout (intenção de interesse) - proteção contra duplicação
      const leadInfo = getLeadInfo();
      trackMetaEventOnce(`initiate_checkout_${location}`, {
        eventName: "InitiateCheckout",
        email: leadInfo?.email,
        phone: leadInfo?.whatsapp,
        firstName: leadInfo?.name?.split(" ")[0],
        lastName: leadInfo?.name?.split(" ").slice(1).join(" ") || undefined,
        gender: leadInfo?.gender,
        country: "br", // 🆕 ISO 3166-1 alpha-2 (Brasil)
        customData: {
          segment,
          location,
          content_name: "Relatório Completo",
          content_category: "quiz_report",
          value: 0, // Gratuito por enquanto
          currency: "BRL",
          has_lead: leadInfo ? 1 : 0,
        },
      });

      onPrimaryAction(location);
    },
    [segment, onPrimaryAction]
  );

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

  useEffect(() => {
    const controller = new AbortController();

    async function fetchPreview() {
      setIsLoading(true);
      setReportPreview("");

      // Verificar cache em sessionStorage
      if (typeof window !== "undefined") {
        const cachedPreview = window.sessionStorage.getItem(previewCacheKey);
        if (cachedPreview) {
          try {
            // Tentar fazer parse do JSON
            const parsed = JSON.parse(cachedPreview);

            // Validar se é um JSON válido do novo schema (tem header)
            if (parsed && typeof parsed === "object" && parsed.header) {
              setReportPreview(parsed);
              setIsLoading(false);
              return;
            } else {
              // Cache inválido (modo antigo) - limpar e regenerar
              window.sessionStorage.removeItem(previewCacheKey);
            }
          } catch {
            // Cache com formato inválido - limpar e regenerar
            window.sessionStorage.removeItem(previewCacheKey);
          }
        }
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
        // Carregar informações do lead (nome, email, gender, etc.)
        const leadInfo = getLeadInfo();

        // Adicionar o nome e gênero do lead às respostas
        const answersWithName = {
          ...answersPayload,
          name: leadInfo?.name || "",
          leadName: leadInfo?.name || "",
          gender: leadInfo?.gender || "",
        };

        // Criar payload detalhado se disponível
        const detailedAnswers = (answersPayload as any)?.detailedAnswers;

        const response = await fetch("/api/generate-report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            segment,
            answers: answersWithName,
            detailedAnswers: detailedAnswers,
            scores: scoresPayload,
            birthdate,
            exBirthdate,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          console.error("API retornou erro:", response.status);
          setHasError(true);
          setIsLoading(false);
          return;
        }

        const data = await response.json();
        const preview = data.report ?? "";

        // Validar se preview é válido
        if (!preview) {
          console.error("API retornou resposta vazia");
          setHasError(true);
          setIsLoading(false);
          return;
        }

        // Se for objeto, validar estrutura do novo schema (deve ter header)
        if (typeof preview === "object" && !preview.header) {
          console.error(
            "API retornou JSON com estrutura inválida - falta header"
          );
          setHasError(true);
          setIsLoading(false);
          return;
        }

        setReportPreview(preview);
        setHasError(false);
        if (typeof window !== "undefined" && preview) {
          window.sessionStorage.setItem(
            previewCacheKey,
            JSON.stringify(preview)
          );
        }
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          return;
        }
        console.error("Erro ao gerar preview:", error);
        setHasError(true);
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
    previewCacheKey,
  ]);

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => setShowStickyCTA(true), 800);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isLoading]);

  // Revelar seções extras após o relatório estar pronto
  useEffect(() => {
    if (
      !isLoading &&
      !hasError &&
      typeof reportPreview === "object" &&
      reportPreview !== null
    ) {
      // Aguardar um pouco para o usuário ler o relatório, depois revelar as seções extras
      const timer = setTimeout(() => {
        setShowAdditionalSections(true);
      }, 2000); // 2 segundos após o relatório estar pronto

      return () => clearTimeout(timer);
    }
  }, [isLoading, hasError, reportPreview]);

  const handleScrollToLocked = useCallback(() => {
    const lockedZone = document.getElementById("zona-bloqueada");
    lockedZone?.scrollIntoView({ behavior: "smooth", block: "start" });

    // Track when user views locked sections
    trackViewReportLocked(segment);
  }, [segment]);

  const handleRetry = useCallback(() => {
    setHasError(false);
    setIsLoading(true);
    // Limpar cache
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(previewCacheKey);
    }
    // Force re-fetch
    window.location.reload();
  }, [previewCacheKey]);

  // Track when user scrolls to locked sections
  useEffect(() => {
    const handleScroll = () => {
      const lockedZone = document.getElementById("zona-bloqueada");
      if (lockedZone) {
        const rect = lockedZone.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

        if (isVisible) {
          trackViewReportLocked(segment);
        }
      }
    };

    // Add scroll listener with debounce
    let timeoutId: NodeJS.Timeout;
    const debouncedScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleScroll, 500);
    };

    window.addEventListener("scroll", debouncedScroll);
    return () => {
      window.removeEventListener("scroll", debouncedScroll);
      clearTimeout(timeoutId);
    };
  }, [segment]);

  const lockedSections = [
    {
      icon: "💞",
      title:
        "Descubra por que seu cérebro ainda busca essa pessoa — e como parar de reforçar isso",
      summary:
        "Entenda o padrão de comportamento que mantém você preso e aprenda a desativar esse ciclo de busca.",
      cta: "Parar de Pensar",
    },
    {
      icon: "🧠",
      title:
        "Entenda por que sua mente ainda repete a história — e como quebrar esse loop",
      summary:
        "Método prático para interromper o pensamento obsessivo e finalmente dormir em paz.",
      cta: "Silenciar Mente",
    },
    {
      icon: "🌙",
      title: "Aprenda a reduzir o desejo de reconexão sem recaídas",
      summary:
        "Descubra por que seu corpo reage como se estivesse em crise e como equilibrar essa resposta.",
      cta: "Lidar com Saudade",
    },
    {
      icon: "⚡",
      title: "Reconstrua sua autoestima sem depender de aprovação externa",
      summary:
        "Entenda como o término abalou sua confiança e o caminho para recuperá-la de verdade.",
      cta: "Recuperar Confiança",
    },
    {
      icon: "🌑",
      title: "Pare de se comparar e de sentir que está atrasado na cura",
      summary:
        "Compreenda as fases ocultas de cada pessoa e libere-se da culpa e da comparação.",
      cta: "Por que Ele Parece Bem",
    },
    {
      icon: "🕯",
      title:
        "Feche esse ciclo de forma madura, sem precisar apagar ou mandar mensagens",
      summary:
        "Método de fechamento simbólico que traz paz interna sem humilhação ou arrependimento.",
      cta: "Encerrar com Dignidade",
    },
    {
      icon: "🔮",
      title:
        "Recupere sua vitalidade e volte a sentir prazer nas pequenas coisas",
      summary:
        "Reative seu interesse pela vida: sono, apetite, vontade de sair e se cuidar.",
      cta: "Voltar a Me Sentir Bem",
    },
    {
      icon: "🌅",
      title: "Transforme essa dor em aprendizado e reconstrua sua identidade",
      summary:
        "Descubra o significado oculto por trás do fim e use isso como seu ponto de virada.",
      cta: "O que Vem Depois",
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
    <div className="relative w-full max-w-4xl mx-auto space-y-12 md:space-y-24 pb-16 md:pb-32 px-3 md:px-4 text-slate-900 overflow-x-hidden min-h-screen">
      {/* 1. Header / abertura - PRIMEIRO IMPACTO */}
      <section className="space-y-6 md:space-y-8">
        <div className="flex items-center gap-3 text-xs uppercase tracking-[0.35em] text-slate-400">
          <span className="h-px w-8 md:w-12 bg-slate-200" />
          Análise personalizada
        </div>
        <div className="flex items-start gap-4 md:gap-6">
          <div className="hidden md:flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-3xl flex-shrink-0">
            {content.icon}
          </div>
          <div className="space-y-6 md:space-y-8 w-full">
            <div className="space-y-4 md:space-y-6">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight text-slate-900">
                Você ainda pensa nessa história porque seu cérebro ainda está
                preso no ciclo.
                <br className="hidden md:inline" />
                <span className="md:hidden"> </span>
                Mas agora você pode entender — e sair dele.
              </h1>
              <p className="text-base md:text-lg lg:text-xl text-slate-600 max-w-3xl leading-relaxed">
                Tudo o que você sente tem uma explicação. E o{" "}
                <strong>Relatório Completo</strong> te mostra o que a análise
                gratuita ainda não conseguiu revelar:{" "}
                <strong>por que sua mente não desliga</strong>, e o que fazer
                hoje para recuperar o controle.
              </p>
            </div>

            {/* CTA acima da dobra */}
            <div className="pt-2 md:pt-4">
              <Button
                onClick={() => handleUnlockClick("hero_top")}
                size="lg"
                className="w-full md:w-auto inline-flex items-center justify-center gap-2 md:gap-3 rounded-full bg-slate-900 px-6 md:px-10 py-3 md:py-4 text-sm md:text-base font-semibold text-white transition-all hover:bg-slate-800 hover:shadow-xl hover:scale-105"
              >
                <span className="text-center">
                  Quero ver o relatório completo agora
                </span>
                <ArrowRight className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
              </Button>
              <p className="text-xs text-slate-500 mt-3 text-center md:text-left">
                ✓ Acesso imediato • Garantia de 7 dias • Já ajudou +7 mil
                pessoas
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Relatório gratuito */}
      <section className="space-y-6 md:space-y-10">
        <header className="space-y-4 md:space-y-5">
          {/* Tarja verde de validação */}
          <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-emerald-50 border border-emerald-200">
            <span className="text-xs md:text-sm font-semibold text-emerald-700">
              ✅ Análise gratuita concluída
            </span>
          </div>
          <div className="space-y-2 md:space-y-3">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-slate-900 leading-tight">
              Aqui está a sua leitura pessoal
            </h2>
            <p className="text-sm md:text-base lg:text-lg text-slate-600 max-w-3xl leading-relaxed">
              Baseado nas suas respostas, esta análise identifica o padrão de
              comportamento que está te mantendo preso.{" "}
              <strong>Leia com atenção</strong> — ela foi montada
              especificamente para você.
            </p>
          </div>
        </header>

        <div className="relative overflow-hidden rounded-2xl md:rounded-[32px] border-2 border-slate-300 bg-white shadow-lg">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.06),_transparent_70%)]" />

          {isLoading ? (
            <div className="flex flex-col items-center gap-4 py-20 text-center text-slate-500">
              <Loader2 className="h-9 w-9 animate-spin text-slate-400" />
              <p className="font-medium">
                Estamos gerando seu relatório personalizado...
              </p>
              <p className="text-xs text-slate-400">
                Processando suas respostas e montando sua análise
              </p>
            </div>
          ) : hasError ? (
            // EMPTY STATE - Erro ao gerar relatório
            <div className="flex flex-col items-center gap-6 py-16 px-8 text-center">
              <div className="w-20 h-20 rounded-full bg-rose-50 flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-rose-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>

              <div className="space-y-2 max-w-md">
                <h3 className="text-xl font-bold text-slate-900">
                  Não foi possível gerar seu relatório
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Ocorreu um erro ao processar suas respostas. Isso pode ter
                  acontecido por uma instabilidade temporária ou problema de
                  conexão.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleRetry}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-slate-900 text-white font-semibold text-sm transition hover:bg-slate-800 hover:shadow-lg"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Tentar novamente
                </button>

                <button
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      window.location.href = "/";
                    }
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-slate-300 text-slate-700 font-semibold text-sm transition hover:bg-slate-50"
                >
                  Voltar ao início
                </button>
              </div>

              <p className="text-xs text-slate-400 mt-4">
                Se o problema persistir, entre em contato com o suporte
              </p>
            </div>
          ) : typeof reportPreview === "object" && reportPreview !== null ? (
            // RENDERIZAÇÃO DO JSON ESTRUTURADO
            <div className="relative">
              {/* Conteúdo do relatório - Design de documento profissional */}
              <div className="px-4 md:px-8 lg:px-12 py-6 md:py-10 space-y-6 md:space-y-8">
                {/* Badge de qualidade no topo */}
                <div className="flex justify-center pb-2">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200">
                    <span className="text-xs font-semibold text-emerald-700">
                      📊 Baseado nas suas respostas
                    </span>
                  </div>
                </div>

                {reportPreview.header && (
                  <div className="space-y-3 md:space-y-4 text-center">
                    <p className="text-xs md:text-sm uppercase tracking-[0.25em] md:tracking-[0.35em] text-slate-400">
                      Etapa identificada: {reportPreview.header.segment}
                    </p>
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-slate-900 leading-tight">
                      {reportPreview.header.title}
                    </h2>
                    <p className="text-sm md:text-base lg:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                      {reportPreview.header.subtitle}
                    </p>
                  </div>
                )}

                {/* 1. Retrato da Pessoa */}
                {(() => {
                  const personProfile = toStringArray(
                    (reportPreview as any)?.personProfile ??
                      (reportPreview as any)?.profile?.paragraphs
                  );
                  if (personProfile.length === 0) return null;
                  return (
                    <div className="space-y-4 pb-8 border-b border-slate-200">
                      <h3 className="text-2xl font-bold text-slate-900">
                        Retrato de quem você é
                      </h3>
                      <div className="space-y-3">
                        {personProfile.map((paragraph, i) => (
                          <p
                            key={i}
                            className="text-base leading-relaxed text-slate-700"
                          >
                            {renderParagraph(paragraph, i)}
                          </p>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* 2. Visão do relacionamento */}
                {(() => {
                  let relationshipOverview = toStringArray(
                    (reportPreview as any)?.relationshipOverview
                  );
                  if (relationshipOverview.length === 0) {
                    const legacyNarrative = (reportPreview as any)
                      ?.breakupNarrative;
                    relationshipOverview = [
                      ...toStringArray(legacyNarrative?.before),
                      ...toStringArray(legacyNarrative?.during),
                      ...toStringArray(legacyNarrative?.after),
                    ];
                  }
                  if (relationshipOverview.length === 0) return null;
                  return (
                    <div className="space-y-4 pb-8 border-b border-slate-200">
                      <h3 className="text-2xl font-bold text-slate-900">
                        Como essa história se desenrolou
                      </h3>
                      <div className="space-y-3">
                        {relationshipOverview.map((paragraph, i) => (
                          <p
                            key={i}
                            className="text-base leading-relaxed text-slate-700"
                          >
                            {renderParagraph(paragraph, i)}
                          </p>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* 3. Sentimentos atuais */}
                {(() => {
                  const feelings =
                    (reportPreview as any)?.currentFeelings ?? {};
                  const mind = toStringArray(
                    feelings.mind ??
                      (reportPreview as any)?.mindLoop?.paragraphs
                  );
                  const body = toStringArray(
                    feelings.body ??
                      (reportPreview as any)?.bodyState?.paragraphs
                  );
                  const heart = toStringArray(
                    feelings.heart ??
                      (reportPreview as any)?.innerConflict?.paragraphs
                  );
                  if (
                    mind.length === 0 &&
                    body.length === 0 &&
                    heart.length === 0
                  ) {
                    return null;
                  }
                  return (
                    <div className="space-y-4 md:space-y-5 pb-6 md:pb-8 border-b border-slate-200">
                      <h3 className="text-xl md:text-2xl font-bold text-slate-900">
                        O que você sente agora
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                        <div className="rounded-xl md:rounded-2xl border border-slate-200 bg-slate-50 p-4 md:p-5 space-y-2">
                          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                            Mente
                          </p>
                          {mind.map((item, index) => (
                            <p
                              key={index}
                              className="text-sm text-slate-700 leading-relaxed"
                            >
                              {item}
                            </p>
                          ))}
                        </div>
                        <div className="rounded-xl md:rounded-2xl border border-slate-200 bg-slate-50 p-4 md:p-5 space-y-2">
                          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                            Corpo
                          </p>
                          {body.map((item, index) => (
                            <p
                              key={index}
                              className="text-sm text-slate-700 leading-relaxed"
                            >
                              {item}
                            </p>
                          ))}
                        </div>
                        <div className="rounded-xl md:rounded-2xl border border-slate-200 bg-slate-50 p-4 md:p-5 space-y-2">
                          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                            Coração
                          </p>
                          {heart.map((item, index) => (
                            <p
                              key={index}
                              className="text-sm text-slate-700 leading-relaxed"
                            >
                              {item}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* 4. Por que ainda dói */}
                {(() => {
                  const reasons = toStringArray(reportPreview.whyCantMoveOn);
                  if (reasons.length === 0) return null;
                  return (
                    <div className="space-y-4 pb-8 border-b border-slate-200">
                      <h3 className="text-2xl font-bold text-slate-900">
                        Por que ainda dói
                      </h3>
                      <div className="space-y-3">
                        {reasons.map((paragraph, i) => (
                          <p
                            key={i}
                            className="text-base leading-relaxed text-slate-700"
                          >
                            {renderParagraph(paragraph, i)}
                          </p>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* 5. Em que Etapa Você Está Agora */}
                {reportPreview.currentStage && (
                  <div className="space-y-4 pb-8 border-b border-slate-200">
                    <h3 className="text-2xl font-bold text-slate-900">
                      Em que etapa você está agora
                    </h3>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-200">
                      <span className="text-sm font-semibold text-amber-900">
                        {reportPreview.currentStage.name}
                      </span>
                    </div>
                    {(() => {
                      const stageDescription = toStringArray(
                        (reportPreview.currentStage as any)?.description ??
                          (reportPreview.currentStage as any)?.paragraphs
                      );
                      if (stageDescription.length === 0) {
                        return null;
                      }
                      return (
                        <div className="space-y-3">
                          {stageDescription.map((paragraph, i) => (
                            <p
                              key={i}
                              className="text-base leading-relaxed text-slate-700"
                            >
                              {renderParagraph(paragraph, i)}
                            </p>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* 6. O que está na raiz */}
                {(() => {
                  const rootCause = toStringArray(reportPreview.rootCause);
                  if (rootCause.length === 0) return null;
                  return (
                    <div className="space-y-4 pb-8 border-b border-slate-200">
                      <h3 className="text-2xl font-bold text-slate-900">
                        O que está na raiz disso
                      </h3>
                      <div className="space-y-3">
                        {rootCause.map((paragraph, i) => (
                          <p
                            key={i}
                            className="text-base leading-relaxed text-slate-700"
                          >
                            {renderParagraph(paragraph, i)}
                          </p>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* 7. O que ainda te trava */}
                {(() => {
                  const unresolved = toStringArray(
                    (reportPreview as any)?.unresolvedPoints
                  );
                  if (unresolved.length === 0) return null;
                  return (
                    <div className="space-y-4 pb-8 border-b border-slate-200">
                      <h3 className="text-2xl font-bold text-slate-900">
                        O que ainda te trava
                      </h3>
                      <div className="space-y-3">
                        {unresolved.map((paragraph, i) => (
                          <p
                            key={i}
                            className="text-base leading-relaxed text-slate-700"
                          >
                            {renderParagraph(paragraph, i)}
                          </p>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* 8. O que essa história te ensina */}
                {(() => {
                  const learning = toStringArray(reportPreview.learning);
                  if (learning.length === 0) return null;
                  return (
                    <div className="space-y-4 pb-8 border-b border-slate-200">
                      <h3 className="text-2xl font-bold text-slate-900">
                        O que essa história está te mostrando
                      </h3>
                      <div className="space-y-3">
                        {learning.map((paragraph, i) => (
                          <p
                            key={i}
                            className="text-base leading-relaxed text-slate-700"
                          >
                            {renderParagraph(paragraph, i)}
                          </p>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* 9. Dinâmica Entre Vocês (Opcional - Compatibilidade) */}
                {(() => {
                  if (!reportPreview.compatibility) return null;
                  const connection = toStringArray(
                    reportPreview.compatibility.connection
                  );
                  const strengths = toStringArray(
                    reportPreview.compatibility.strengths
                  );
                  const tensions = toStringArray(
                    (reportPreview.compatibility as any).tensions ??
                      (reportPreview.compatibility as any).frictions
                  );
                  const distancing = toStringArray(
                    reportPreview.compatibility.distancing
                  );
                  if (
                    connection.length === 0 &&
                    strengths.length === 0 &&
                    tensions.length === 0 &&
                    distancing.length === 0
                  ) {
                    return null;
                  }
                  return (
                    <div className="space-y-5 pb-8">
                      <h3 className="text-2xl font-bold text-slate-900">
                        Dinâmica entre vocês
                      </h3>

                      {/* Por que vocês se conectaram */}
                      {connection.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-base font-semibold text-slate-900">
                            Por que vocês se conectaram
                          </h4>
                          <div className="space-y-2">
                            {connection.map((c, i) => (
                              <p
                                key={i}
                                className="text-sm text-slate-700 leading-relaxed"
                              >
                                {c}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Pontos fortes da dupla */}
                      {strengths.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-base font-semibold text-slate-900">
                            Pontos fortes da dupla
                          </h4>
                          <div className="space-y-2">
                            {strengths.map((s, i) => (
                              <p
                                key={i}
                                className="text-sm text-slate-700 leading-relaxed"
                              >
                                {s}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Tensões previsíveis */}
                      {tensions.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-base font-semibold text-slate-900">
                            Tensões previsíveis
                          </h4>
                          <div className="space-y-2">
                            {tensions.map((item, i) => (
                              <p
                                key={i}
                                className="text-sm text-slate-700 leading-relaxed"
                              >
                                {item}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Por que se afastaram */}
                      {distancing.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-base font-semibold text-slate-900">
                            Por que se afastaram
                          </h4>
                          <div className="space-y-2">
                            {distancing.map((d, i) => (
                              <p
                                key={i}
                                className="text-sm text-slate-700 leading-relaxed"
                              >
                                {d}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* 10. Resumo e próximo passo */}
                {(() => {
                  const summary =
                    reportPreview.nextStepHint?.summary?.trim() ?? "";
                  const whyFullReport =
                    reportPreview.nextStepHint?.why_full_report?.trim() ?? "";
                  if (!summary && !whyFullReport) return null;
                  return (
                    <div className="space-y-3 pb-8 border-b border-slate-200">
                      <h3 className="text-2xl font-bold text-slate-900">
                        Para onde isso aponta agora
                      </h3>
                      {summary && (
                        <p className="text-base leading-relaxed text-slate-700">
                          {renderParagraph(summary, 9000)}
                        </p>
                      )}
                      {whyFullReport && (
                        <p className="text-sm text-slate-600 leading-relaxed">
                          {renderParagraph(whyFullReport, 9001)}
                        </p>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Rodapé do documento */}
              <div className="px-8 md:px-12 py-6 bg-slate-50 border-t border-slate-200">
                <p className="text-xs text-slate-500 text-center">
                  Esta análise foi gerada especificamente para você, baseada em{" "}
                  {Object.keys(answers).length} respostas do questionário.
                </p>
              </div>
            </div>
          ) : (
            // FALLBACK PARA MODO ANTIGO (string)
            <div className="relative">
              <div className="px-8 md:px-12 py-10 space-y-8">
                <div className="text-sm text-slate-600">
                  {typeof reportPreview === "string" &&
                    reportPreview.split("\n\n").map((paragraph, pIndex) => (
                      <p key={pIndex} className="mb-4 leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {!isLoading &&
        !hasError &&
        typeof reportPreview === "object" &&
        reportPreview !== null && (
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

      {/* Loading das seções extras - Só mostra quando relatório está pronto mas seções ainda não */}
      {!isLoading &&
        !hasError &&
        !showAdditionalSections &&
        typeof reportPreview === "object" &&
        reportPreview !== null && (
          <div className="flex flex-col items-center gap-4 py-12 text-center">
            <div className="flex items-center gap-2 text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm font-medium">
                Gerando próximos passos personalizados...
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-md">
              Com base na sua análise, estamos preparando orientações
              específicas para sua jornada
            </p>
          </div>
        )}

      {/* Novas seções adaptadas - Revelação progressiva */}
      {!isLoading && !hasError && showAdditionalSections && (
        <div className="space-y-16 pt-12 animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
          {/* Título de conexão */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200">
              <span className="text-sm font-semibold text-blue-700">
                ✨ Análise completa gerada
              </span>
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-slate-800">
              Com base na sua análise, aqui estão seus próximos passos
            </h3>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Suas respostas revelaram padrões específicos. Agora você tem um
              mapa completo para sua jornada.
            </p>
          </div>

          {/* Bloco 1 — O que você já ganhou */}
          <div className="space-y-8">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200">
                <span className="text-sm font-semibold text-emerald-700">
                  ✅ Você já descobriu 3 verdades sobre o seu processo
                </span>
              </div>
              <h3 className="text-2xl md:text-3xl font-medium text-slate-900 max-w-2xl mx-auto">
                Com a análise gratuita, você descobriu:
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
                  Não é fraqueza — é um padrão de comportamento que fica ativado
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
                      — e eles explicam por que a dor volta mesmo quando parece
                      que você está bem.
                    </p>

                    {/* CTA interno */}
                    <div className="pt-2">
                      <p className="text-sm font-semibold text-slate-800">
                        O relatório completo desbloqueia todos os 8 processos →
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
                    Desejo intenso de reconexão
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Seu corpo sente a ausência como se fosse uma crise de
                    vínculo rompido.
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
                onClick={() => handleUnlockClick("bloco_2_cta")}
                size="lg"
                className="w-full md:w-auto inline-flex items-center gap-3 rounded-full bg-slate-900 px-6 md:px-10 py-3 md:py-4 text-sm md:text-base font-bold text-white transition-all hover:bg-slate-800 hover:shadow-xl hover:scale-105"
              >
                Desbloquear Relatório Completo Agora
                <ArrowRight className="h-5 w-5" />
              </Button>
              <p className="text-xs text-slate-500 mt-4 px-2">
                ✓ Acesso imediato • Resultados em 3-7 dias • +7 mil pessoas já
                transformaram sua dor em clareza
              </p>
            </div>
          </div>

          {/* 3. Transição e conteúdo bloqueado */}
          <section id="zona-bloqueada" className="space-y-8 md:space-y-12">
            <header className="space-y-2 md:space-y-3">
              <p className="text-xs uppercase tracking-[0.25em] md:tracking-[0.35em] text-slate-400">
                próximo nível
              </p>
              <h3 className="text-xl md:text-2xl lg:text-3xl font-medium text-slate-900 leading-tight">
                Você já entendeu parte da lógica. Agora libere o restante e veja
                o que realmente está por trás do que você sente.
              </h3>
              <p className="text-sm md:text-base text-slate-600 max-w-2xl">
                Essas são as 8 camadas que explicam por completo o padrão que te
                mantém preso. Cada uma detalha uma resposta direta e um caminho
                de ação.
              </p>
            </header>

            <div className="space-y-3 md:space-y-4">
              {lockedSections.map((section) => (
                <article
                  key={section.title}
                  className="group relative overflow-hidden rounded-xl md:rounded-2xl border-2 border-slate-300 bg-slate-50/80 p-4 md:px-6 md:py-6 shadow-sm transition-all duration-300 hover:border-slate-400 hover:shadow-lg hover:bg-slate-50"
                >
                  <div className="flex flex-col md:flex-row md:items-start gap-3 md:gap-4 opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex items-start gap-3 md:gap-4 flex-1">
                      <div className="flex-shrink-0 text-2xl md:text-3xl mt-0.5 md:mt-1 opacity-50 grayscale">
                        {section.icon}
                      </div>

                      <div className="flex-1 space-y-2 md:space-y-3">
                        <h4 className="text-base md:text-lg lg:text-xl font-semibold text-slate-800 leading-snug">
                          {section.title}
                        </h4>
                        <p className="text-xs md:text-sm lg:text-base text-slate-600 leading-relaxed">
                          {section.summary}
                        </p>
                      </div>
                    </div>

                    <div className="flex-shrink-0 w-full md:w-auto">
                      <Button
                        onClick={() => handleUnlockClick("card_locked")}
                        className="w-full md:w-auto inline-flex items-center justify-center gap-1.5 md:gap-2 rounded-full bg-slate-800 px-4 md:px-5 py-2.5 text-xs font-semibold text-white transition-all hover:bg-slate-900 hover:shadow-md hover:scale-105"
                      >
                        <span className="text-sm">🔓</span>
                        <span className="truncate">
                          {section.cta || "Desbloquear"}
                        </span>
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
                Não é mágica — é você entendendo o que te prende e fazendo
                diferente
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
                      Ganha clareza pra não cair nas recaídas e finalmente parar
                      o vai e volta que te esgota
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
                      Sua mente entende que a história acabou e finalmente
                      descansa — sem aquele peso no peito
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
                      Para de se culpar e troca a dor por clareza — você vê o
                      padrão por trás de tudo
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
                      Desativa os gatilhos de comparação e volta a focar em você
                      — no seu tempo e na sua vida
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
                      Reconecta com sua essência e começa a reconstruir sua vida
                      — sem precisar apagar o passado
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA forte com urgência */}
            <div className="text-center pt-4 md:pt-6">
              <Button
                onClick={() => handleUnlockClick("bloco_3_cta")}
                size="lg"
                className="w-full md:w-auto inline-flex items-center justify-center gap-2 md:gap-3 rounded-full bg-slate-900 px-8 md:px-12 py-4 text-base md:text-lg font-bold text-white transition-all hover:bg-slate-800 hover:shadow-xl hover:scale-105"
              >
                Quero Sentir Essa Diferença Agora
                <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
              <p className="text-xs text-slate-500 mt-3 md:mt-4 px-2">
                ✓ Acesso imediato • Garantia de 7 dias • Mais de 7 mil pessoas
                já sentiram a diferença
              </p>
            </div>
          </section>

          {/* Depoimentos - Marquee horizontal */}
          <section className="py-16 space-y-10">
            <div className="text-center space-y-3">
              <h3 className="text-2xl md:text-3xl font-bold text-slate-900">
                Mais de 7 mil pessoas já descobriram o que estava bloqueado
              </h3>
              <p className="text-sm md:text-base text-slate-600 max-w-2xl mx-auto">
                Veja o que elas dizem sobre os primeiros resultados
              </p>
            </div>

            <div className="relative">
              {/* Gradiente único cobrindo tudo - esquerda e direita */}
              <div
                className="pointer-events-none absolute inset-0 z-10"
                style={{
                  background:
                    "linear-gradient(to right, #f4f5f7 0%, transparent 20%, transparent 80%, #fcfcfd 100%)",
                }}
              />

              {/* Primeira linha - direita para esquerda */}
              <div>
                <Marquee reverse pauseOnHover className="[--duration:60s]">
                  {testimonials.slice(0, 4).map((testimonial, index) => (
                    <div
                      key={index}
                      className="relative w-[350px] min-w-[280px] max-w-[350px] rounded-2xl bg-white border border-slate-200 p-6 shadow-sm"
                    >
                      <div className="space-y-4">
                        {/* Aspas decorativas */}
                        <div className="text-4xl text-slate-300 leading-none">
                          "
                        </div>

                        {/* Depoimento */}
                        <p className="text-sm text-slate-700 leading-relaxed line-clamp-4">
                          {testimonial.text}
                        </p>

                        {/* Autor */}
                        <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-lg">
                            {testimonial.emoji}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-slate-900 text-sm">
                              {testimonial.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {testimonial.time}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </Marquee>
              </div>

              {/* Segunda linha - esquerda para direita */}
              <div>
                <Marquee pauseOnHover className="[--duration:60s]">
                  {testimonials.slice(4, 8).map((testimonial, index) => (
                    <div
                      key={index}
                      className="relative w-[350px] min-w-[280px] max-w-[350px] rounded-2xl bg-white border border-slate-200 p-6 shadow-sm"
                    >
                      <div className="space-y-4">
                        {/* Aspas decorativas */}
                        <div className="text-4xl text-slate-300 leading-none">
                          "
                        </div>

                        {/* Depoimento */}
                        <p className="text-sm text-slate-700 leading-relaxed line-clamp-4">
                          {testimonial.text}
                        </p>

                        {/* Autor */}
                        <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-lg">
                            {testimonial.emoji}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-slate-900 text-sm">
                              {testimonial.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {testimonial.time}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </Marquee>
              </div>
            </div>
          </section>

          {/* 4. CTA final com motivação emocional */}
          <section className="space-y-6 md:space-y-8 text-center">
            <div className="space-y-3 md:space-y-4">
              <h4 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-slate-900 max-w-3xl mx-auto leading-tight px-2">
                Agora que você já entendeu parte da lógica, não pare aqui.
              </h4>
              <p className="text-sm md:text-base lg:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed px-4">
                O relatório completo é o que faz você realmente sair do ciclo —
                com orientações claras, ações práticas e resultados em poucos
                dias.
              </p>
            </div>

            <Button
              onClick={() => handleUnlockClick("final_cta")}
              size="lg"
              className="w-full md:w-auto group relative inline-flex items-center justify-center gap-2 md:gap-3 overflow-hidden rounded-full bg-slate-900 px-8 md:px-12 py-4 md:py-5 text-base md:text-lg font-bold text-white transition focus-visible:outline-none hover:bg-slate-800 hover:shadow-2xl hover:scale-105"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-white/[0.08] via-white/[0.16] to-white/[0.08] opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
              <span className="relative flex items-center gap-2">
                Liberar Relatório Completo Agora
                <ArrowRight className="h-5 w-5 md:h-6 md:w-6 transition-transform duration-500 group-hover:translate-x-1" />
              </span>
            </Button>

            {/* Microprovas simbólicas */}
            <div className="pt-6 md:pt-8 space-y-2 md:space-y-3 text-xs md:text-sm text-slate-600 px-4">
              <p className="flex items-center justify-center gap-2">
                ✓ Mais de 7.000 pessoas já descobriram o que estava por trás da
                dor
              </p>
              <p className="flex items-center justify-center gap-2">
                ✓ 92% disseram que o relatório descreveu exatamente o que
                estavam vivendo
              </p>
              <p className="flex items-center justify-center gap-2">
                ✓ Em média, os primeiros resultados aparecem entre 3 e 5 dias
              </p>
            </div>
          </section>
        </div>
      )}

      {/* Espaço final para evitar overlap com CTA sticky */}
      <div className="h-20 md:h-24" />

      {showStickyCTA && (
        <div className="fixed inset-x-0 bottom-0 z-50 md:left-1/2 md:right-auto md:w-[500px] md:-translate-x-1/2 md:bottom-6 md:inset-x-auto">
          <div className="relative overflow-hidden border-t-2 md:border-2 md:rounded-2xl border-slate-300 bg-white shadow-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.08),_transparent_70%)] opacity-0 transition-opacity duration-500 hover:opacity-100" />
            <div className="relative flex flex-col gap-3 px-4 py-4 md:px-6 md:py-5 md:flex-row md:items-center md:gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm md:text-base font-bold text-slate-900 leading-tight mb-1">
                  Ver relatório completo
                </p>
                <p className="text-xs text-slate-600 leading-snug">
                  Desbloqueie todas as 8 camadas agora
                </p>
              </div>
              <Button
                onClick={() => handleUnlockClick("sticky_cta")}
                className="w-full md:w-auto flex-shrink-0 inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-6 py-3 md:py-2.5 text-sm font-semibold text-white transition-all hover:bg-slate-800 hover:shadow-lg whitespace-nowrap"
              >
                Acessar agora
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
