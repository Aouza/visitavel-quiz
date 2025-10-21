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

  useEffect(() => {
    const controller = new AbortController();

    async function fetchPreview() {
      setIsLoading(true);
      setReportPreview("");

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
        setReportPreview(data.report ?? "");
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          return;
        }
        console.error("Erro ao gerar preview:", error);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    fetchPreview();

    return () => controller.abort();
    // answersKey e scoresKey garantem dependências estáveis
  }, [segment, answersKey, scoresKey, answersPayload, scoresPayload]);

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

  const emotionalPreview = useMemo(
    () => [
      "Você ainda sente a presença dele porque, sempre que o vazio aparece, sua mente corre para quem um dia segurou sua mão nos momentos mais difíceis. Essa lembrança não é fraqueza: é a forma que o seu coração encontrou para manter viva a ideia de que **laços intensos** precisam durar para terem valido a pena.",
      "Seu padrão emocional não é apego cego; é uma busca obstinada por sentido. Você se doa com profundidade, testa se o outro enxerga sua entrega e, quando percebe distância, tenta decifrar onde foi que deixou escapar um sinal. Você merece **respostas honestas**, não mais tentativas infindáveis.",
      "Existe uma parte sua que aprendeu a medir o amor pelo esforço que coloca para salvar histórias. Esse impulso te fez suportar mais do que deveria e hoje cria uma névoa entre o que você sente e o que você precisa. Entender esse ponto escondido é o primeiro passo para reconstruir **sua força de dentro para fora**.",
      "Seu corpo tem dado pistas: a tensão no peito quando a mensagem não chega, o suspiro curto antes de dormir, a energia que some quando você pensa em recomeçar. Esses sintomas emocionais não são aleatórios — são códigos que o seu sistema nervoso envia pedindo **mudança, não resistência**.",
      "Você está começando a enxergar a raiz do seu padrão. Reconhecer o que te prende já te coloca além do ciclo. Mas há algo mais profundo que o relatório completo revela — e é isso que muda tudo.",
    ],
    []
  );

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
        "Por que você sempre retorna — e o que o universo tenta te mostrar quando isso acontece.",
      veil:
        "Decodifica os gatilhos que antecedem a recaída emocional, o limite invisível que você ultrapassa e o gesto que encerra o ciclo sem culpa.",
      badge: "⚡ Atenção urgente para evitar recaídas emocionais.",
    },
    {
      icon: "🧠",
      title: "Seu Mapa Emocional Profundo",
      summary:
        "Como você se protege quando ama — e quais códigos antigos continuam guiando suas escolhas.",
      veil:
        "Revela os acordos silenciosos que você faz para merecer cuidado, os traços herdados que moldam sua entrega e o ponto em que autocuidado vira autossabotagem.",
      badge: "✨ Inclui exercícios guiados para reorganizar mente e corpo.",
    },
    {
      icon: "🌙",
      title: "Caminho de Cura e Recomeço",
      summary:
        "O roteiro íntimo para recuperar clareza, força e autonomia após esse fim.",
      veil:
        "Entrega rituais de aterramento, conversas que reorganizam sua narrativa e limites que protegem sem erguer muros.",
      badge: "🌱 Ativa em você a sensação de recomeço possível.",
    },
    {
      icon: "🔮",
      title: "Sinais e Oportunidades Futuras",
      summary:
        "Os sinais que anunciam o próximo capítulo — e como acolher o que chega sem repetir o passado.",
      veil:
        "Mostra quais coincidências são chamados reais, como diferenciar recaída de oportunidade e quais encontros sustentam sua expansão.",
      badge: "🕰 Atualizações incluídas sempre que o relatório ganhar novos sinais.",
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
              Você ainda sente o eco do que viveu. Agora, a lógica emocional por trás disso começa a ser revelada.
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-3xl leading-relaxed">
              Nada aqui é genérico. Cada insight foi construído a partir da forma como você respondeu, do peso das suas memórias e dos sinais que o seu corpo ainda carrega. Respire fundo: você está entrando em uma leitura feita sob medida para a sua história.
            </p>
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                {content.headline}
              </span>
              <span className="italic">
                “Milhares de pessoas já desbloquearam esse relatório e descobriram a raiz emocional do próprio padrão.”
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
              Mas há algo que ainda não foi revelado — e ele muda tudo.
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
                  </div>
                  <span className="text-xs font-medium uppercase tracking-[0.3em] text-slate-400">
                    {section.badge}
                  </span>
                </div>

                <div className="relative mt-4 overflow-hidden rounded-[28px] border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-slate-50 px-6 md:px-8 py-8">
                  <div className="absolute inset-0 bg-white/70 transition duration-500 group-hover:bg-white/85" />
                  <div className="relative space-y-6 text-slate-600">
                    <p className="text-sm md:text-base leading-relaxed">
                      {section.veil}
                    </p>
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
          Você já sentiu o quanto essa leitura fala sobre você. Agora veja o que está escondido — e o que ainda pode ser transformado.
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
