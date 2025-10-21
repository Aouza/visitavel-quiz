/**
 * @file: ElegantResultCard.tsx
 * @responsibility: Card de resultado elegante com preview real do relatório
 */

"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { type Segment } from "@/lib/questions";
import { getSegmentContent } from "@/lib/segments";
import { ArrowRight, Loader2, Lock } from "lucide-react";

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

    const parts = sanitized.split(/\n\s*\n/).map((paragraph) => paragraph.trim());
    return parts.filter(Boolean);
  }, [reportPreview, emotionalPreview]);

  const lockedSections = [
    {
      icon: "💞",
      title: "Ciclos de Recaída e Libertação",
      summary:
        "Por que você volta para a mesma história e como cortar o movimento de recaída.",
      veil:
        "Mostra o momento exato em que você começa a ceder, quais mensagens fazem você reabrir a conversa e o passo claro para interromper antes de responder.",
      badge: "⚡ Atenção urgente para evitar recaídas emocionais.",
      loss:
        "Sem desbloquear, você repete o looping sem perceber o gatilho principal.",
      unlocks: [
        "Linha do tempo das recaídas com exemplos práticos e o que sentir em cada fase.",
        "Checklist de sinais no corpo e na mente para agir antes de mandar mensagem.",
        "Frase-guia para encerrar sem culpa e seguir firme após o primeiro dia.",
      ],
      aura: "from-rose-200/70 via-fuchsia-200/50 to-amber-100/40",
    },
    {
      icon: "🧠",
      title: "Seu Mapa Emocional Profundo",
      summary:
        "Como você se protege quando ama e onde você se abandona sem notar.",
      veil:
        "Explica as regras que você criou para ser escolhido(a), o quanto se cobra e como transformar isso em pedido claro por cuidado.",
      badge: "✨ Inclui exercícios guiados para reorganizar mente e corpo.",
      loss:
        "Sem desbloquear, você continua aceitando migalhas achando que é o normal.",
      unlocks: [
        "Perfil das suas defesas emocionais com tradução simples do que cada uma tenta evitar.",
        "Mapa dos acordos silenciosos que você repete e como quebrar cada um.",
        "Exercícios rápidos para pedir apoio sem sentir que está pesando.",
      ],
      aura: "from-sky-200/70 via-indigo-200/60 to-purple-200/40",
    },
    {
      icon: "🌙",
      title: "Caminho de Cura e Recomeço",
      summary:
        "O passo a passo para sair do luto e montar uma rotina de recomeço.",
      veil:
        "Mostra o que fazer nos próximos 7 dias, como falar com quem precisa ouvir e quais limites mantêm você firme.",
      badge: "🌱 Ativa em você a sensação de recomeço possível.",
      loss:
        "Sem desbloquear, você fica preso(a) entre saudade e medo de seguir sozinho(a).",
      unlocks: [
        "Sequência de 7 dias com tarefas simples de manhã, tarde e noite.",
        "Roteiro de conversa para encerrar pendências ou pedir espaço.",
        "Lista de limites práticos para proteger sua energia sem afastar quem você gosta.",
      ],
      aura: "from-emerald-200/70 via-teal-200/50 to-lime-100/40",
    },
    {
      icon: "🔮",
      title: "Sinais e Oportunidades Futuras",
      summary:
        "Os sinais que mostram se é recaída ou chance de verdade para seguir.",
      veil:
        "Traduz coincidências, mensagens e encontros e mostra como responder sem cair em cilada.",
      badge: "🕰 Atualizações incluídas sempre que o relatório ganhar novos sinais.",
      loss:
        "Sem desbloquear, você confunde qualquer sinal com destino e perde chances reais de avanço.",
      unlocks: [
        "Radar de sinais verdes, amarelos e vermelhos com exemplos do dia a dia.",
        "Plano de ação para reencontros, novos contatinhos e convites do passado.",
        "Atualizações contínuas com novos alertas e oportunidades da comunidade.",
      ],
      aura: "from-violet-200/70 via-fuchsia-200/60 to-blue-200/40",
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
      {/* 1. Introdução emocional */}
      <section className="space-y-8">
        <div className="flex items-center gap-3 text-xs uppercase tracking-[0.35em] text-slate-400">
          <span className="h-px w-12 bg-slate-200" />
          Relatório emocional
        </div>
        <div className="flex items-start gap-6">
          <div className="hidden md:flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-3xl">
            {content.icon}
          </div>
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-semibold leading-tight text-slate-900">
              Você ainda pensa nessa história porque faltam respostas diretas. Aqui começa a explicação.
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-3xl leading-relaxed">
              Tudo o que você vê a seguir é montado a partir das suas respostas. A ideia é simples: explicar seu padrão, mostrar o que trava e entregar o que fazer depois.
            </p>
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                {content.headline}
              </span>
              <span className="italic">
                Mais de 7 mil pessoas já usaram este relatório para entender o próprio padrão antes de mudar de rota.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Relatório gratuito */}
      <section className="space-y-10">
        <header className="space-y-3">
          <span className="text-xs uppercase tracking-[0.35em] text-slate-400">
            primeira camada
          </span>
          <h2 className="text-2xl md:text-3xl font-medium text-slate-900">
            O diagnóstico gratuito que já revela a lógica do seu vínculo
          </h2>
        </header>

        <div className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white px-8 md:px-10 py-10 shadow-sm">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.06),_transparent_70%)]" />
          <div className="relative space-y-6 text-base md:text-lg leading-loose text-slate-600">
            {isLoading ? (
              <div className="flex flex-col items-center gap-4 py-10 text-center text-slate-500">
                <Loader2 className="h-9 w-9 animate-spin text-slate-400" />
                <p>
                  Estamos decodificando os dados do seu padrão emocional...
                </p>
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
          <div className="space-y-4 text-center md:text-left">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
              O que prende você de verdade ainda está bloqueado.
            </p>
            <button
              type="button"
              onClick={handleScrollToLocked}
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 underline decoration-slate-300 underline-offset-8 transition hover:text-slate-900 hover:decoration-slate-500"
            >
              Quero avançar para as próximas camadas →
            </button>
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
            O que você ainda não sabe — mas precisa descobrir.
          </h3>
          <p className="text-sm md:text-base text-slate-600 max-w-2xl">
            Essas são as camadas ocultas que o relatório completo revela. Elas funcionam como uma travessia: cada bloco destrava uma visão nova sobre quem você é quando ama.
          </p>
        </header>

        <div className="space-y-12">
          {lockedSections.map((section) => (
            <article
              key={section.title}
              className="group relative overflow-hidden rounded-[36px] border border-slate-200 bg-white px-8 md:px-12 py-12 shadow-sm transition-all duration-500"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.08),_transparent_70%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div
                className={`pointer-events-none absolute -top-32 right-0 h-64 w-64 rounded-full blur-[110px] opacity-40 transition-opacity duration-500 group-hover:opacity-70 bg-gradient-to-br ${section.aura}`}
              />
              <div
                className={`pointer-events-none absolute -bottom-24 left-10 h-56 w-56 rounded-full blur-[120px] opacity-30 transition-opacity duration-500 group-hover:opacity-60 bg-gradient-to-br ${section.aura}`}
              />
              <div className="relative space-y-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-sm uppercase tracking-[0.25em] text-slate-400">
                      <span className="text-2xl">{section.icon}</span>
                      <span>camada bloqueada</span>
                    </div>
                    <h4 className="text-xl md:text-2xl font-semibold text-slate-900">
                      {section.title}
                    </h4>
                    <p className="text-base text-slate-600 max-w-xl">
                      {section.summary}
                    </p>
                    <p className="text-sm text-slate-600 max-w-xl">
                      <span className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-rose-500">
                        Sem desbloquear
                      </span>
                      <span className="mt-2 block text-slate-600">
                        {section.loss}
                      </span>
                    </p>
                  </div>
                  <span className="text-xs font-medium uppercase tracking-[0.3em] text-slate-400">
                    {section.badge}
                  </span>
                </div>

                <div className="relative mt-4 overflow-hidden rounded-[28px] border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-slate-50 px-6 md:px-8 py-8">
                  <div className="absolute inset-0 bg-white/75 transition duration-500 group-hover:bg-white/90" />
                  <div className="relative space-y-6 text-slate-600">
                    <p className="text-sm md:text-base leading-relaxed">
                      {section.veil}
                    </p>
                    <div className="space-y-3">
                      <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-600">
                        Você desbloqueia
                      </span>
                      <ul className="space-y-2 text-sm md:text-base text-slate-600">
                        {section.unlocks.map((item) => (
                          <li
                            key={item}
                            className="flex items-start gap-3 leading-relaxed"
                          >
                            <span className="mt-1 inline-flex h-2.5 w-2.5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white">
                              •
                            </span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <span className="text-xs uppercase tracking-[0.3em] text-slate-400">
                        Conteúdo disponível no relatório completo
                      </span>
                      <Button
                        onClick={onPrimaryAction}
                        variant="outline"
                        className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-medium text-slate-800 transition hover:border-slate-400 hover:bg-slate-100"
                      >
                        <Lock className="h-4 w-4" />
                        Quero ver o que está por trás
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 4. CTA final */}
      <section className="space-y-6 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
          decisão
        </p>
        <h4 className="text-3xl font-semibold text-slate-900">
          Você já viu que esta leitura descreve o que você vive. Agora destrave o restante e mude o cenário com clareza.
        </h4>
        <p className="text-base text-slate-600 max-w-2xl mx-auto">
          Desbloqueie o relatório completo e avance pelas camadas que revelam seus ciclos, forças ocultas, caminhos de cura e sinais do próximo capítulo.
        </p>
        <Button
          onClick={onPrimaryAction}
          size="lg"
          className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full border border-slate-300 bg-slate-900 px-10 py-4 text-base font-semibold text-white transition focus-visible:outline-none hover:bg-slate-800"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-white/[0.08] via-white/[0.16] to-white/[0.08] opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
          <span className="relative flex items-center gap-2">
            🔓 Desbloquear meu Relatório Completo
            <ArrowRight className="h-5 w-5 transition-transform duration-500 group-hover:translate-x-1" />
          </span>
        </Button>
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
