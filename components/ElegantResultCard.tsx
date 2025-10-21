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
      title: "Por que você ainda pensa nessa pessoa",
      summary:
        "Ainda há vínculo emocional ativo. Você sente falta porque sua mente acredita que algo ficou inacabado.",
      veil: "Vamos te mostrar como o corpo e a mente se mantêm presos num laço emocional invisível, e o que fazer pra cortar esse elo sem precisar bloquear ou reprimir. Você vai conseguir parar de stalkear e de esperar mensagem.",
      badge: "🔓 Conteúdo exclusivo",
      loss: "Você continua preso(a) ao ciclo de espera passiva.",
      unlocks: [
        "Resultado: alívio imediato da obsessão mental e das vontades impulsivas.",
      ],
      aura: "from-rose-200/70 via-fuchsia-200/50 to-amber-100/40",
      cta: "Quero entender o que me prende",
    },
    {
      icon: "🧠",
      title: "Por que sua cabeça não desliga",
      summary:
        "Isso não é falta de controle. É o seu cérebro tentando resolver algo que ainda ficou em aberto.",
      veil: "Vamos te explicar a lógica por trás do pensamento repetitivo, e te ensinar um método simples pra interromper o loop mental. Você vai conseguir dormir em paz sem ficar repassando tudo.",
      badge: "🔓 Conteúdo exclusivo",
      loss: "Você fica no looping mental sem saber como parar.",
      unlocks: [
        "Resultado: clareza mental e sensação de paz — como se o ruído interno finalmente diminuísse.",
      ],
      aura: "from-sky-200/70 via-indigo-200/60 to-purple-200/40",
      cta: "Quero parar de pensar nisso o tempo todo",
    },
    {
      icon: "🌙",
      title: "Por que a falta dói tanto (abstinência emocional)",
      summary:
        "Não é carência — é química emocional. O corpo ainda espera o mesmo padrão de conexão.",
      veil: "Vamos te mostrar por que o corpo reage como se estivesse em crise de abstinência, e o que fazer pra equilibrar essa resposta física. Você vai conseguir lidar com a saudade sem recaídas.",
      badge: "🔓 Conteúdo exclusivo",
      loss: "A abstinência emocional continua controlando você.",
      unlocks: [
        "Resultado: sensação real de leveza e autocontrole nas horas de saudade.",
      ],
      aura: "from-emerald-200/70 via-teal-200/50 to-lime-100/40",
      cta: "Quero aprender a lidar com a falta",
    },
    {
      icon: "⚡",
      title: "Por que o fim abalou sua autoestima",
      summary:
        "O término não destrói só o vínculo — abala a forma como você se enxerga.",
      veil: "Vamos te ajudar a entender como o fim ativa feridas antigas de rejeição, e como reconstruir a percepção do seu valor sem depender de aprovação. Você vai parar de sentir que não foi suficiente.",
      badge: "🔓 Conteúdo exclusivo",
      loss: "Você continua se culpando e duvidando do próprio valor.",
      unlocks: [
        "Resultado: retomada da autoconfiança e fim da sensação de 'fui substituído(a)'.",
      ],
      aura: "from-amber-200/70 via-yellow-200/50 to-orange-100/40",
      cta: "Quero recuperar minha confiança",
    },
    {
      icon: "🌑",
      title: "Por que ele parece bem e você ainda sofre",
      summary:
        "Cada pessoa processa o fim de um jeito, e o que parece indiferença pode ser fuga.",
      veil: "Vamos te mostrar as fases emocionais ocultas do outro lado, e por que comparar o seu tempo de cura só atrasa o seu próprio. Você vai parar de se sentir injustiçado(a) por ele estar bem.",
      badge: "🔓 Conteúdo exclusivo",
      loss: "Você continua se comparando e se culpando por 'estar atrasado(a)'.",
      unlocks: ["Resultado: liberação imediata da culpa e da comparação."],
      aura: "from-slate-200/70 via-gray-200/60 to-zinc-100/40",
      cta: "Quero parar de me comparar",
    },
    {
      icon: "🕯",
      title: "Como encerrar de verdade (sem humilhação)",
      summary: "O fechamento real vem com compreensão, não com esquecimento.",
      veil: "Vamos te ensinar um método prático de encerramento emocional, pra liberar o vínculo sem apagar memórias e sem sentir vergonha do que viveu. Você vai conseguir fechar esse ciclo com dignidade.",
      badge: "🔓 Conteúdo exclusivo",
      loss: "Você fica na sensação de história mal resolvida.",
      unlocks: [
        "Resultado: paz interna e sensação de capítulo encerrado — sem recaídas.",
      ],
      aura: "from-teal-200/70 via-emerald-200/50 to-green-100/40",
      cta: "Quero encerrar esse ciclo de vez",
    },
    {
      icon: "🔮",
      title: "Como voltar a se sentir bem (recuperar prazer)",
      summary: "Falta reconstruir rotina, energia e presença.",
      veil: "Vamos te ajudar a reativar sua vitalidade emocional e recuperar o prazer nas pequenas coisas (sono, foco, vontade de viver). Você vai voltar a comer, dormir e sentir vontade de sair.",
      badge: "🔓 Conteúdo exclusivo",
      loss: "Você fica sabendo o que fazer mas sem ação real.",
      unlocks: [
        "Resultado: leveza no corpo e sensação de estar voltando pra si mesmo.",
      ],
      aura: "from-sky-200/70 via-cyan-200/50 to-blue-100/40",
      cta: "Quero começar minha recuperação",
    },
    {
      icon: "🌅",
      title: "O que vem depois da dor (reconstruir identidade)",
      summary:
        "Agora é hora de entender o sentido do que viveu e transformar isso em força.",
      veil: "Vamos te mostrar o aprendizado oculto por trás do fim — e como ele pode se tornar o seu ponto de virada. Você vai recuperar sua identidade e saber quem é sem essa pessoa.",
      badge: "🔓 Conteúdo exclusivo",
      loss: "Você carrega o peso sem extrair o aprendizado.",
      unlocks: [
        "Resultado: clareza, maturidade e um sentimento novo de paz com o passado.",
      ],
      aura: "from-orange-200/70 via-rose-200/50 to-pink-100/40",
      cta: "Quero entender o que vem depois",
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
              Você ainda pensa nessa história porque faltam respostas diretas.
              Aqui começa a explicação.
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-3xl leading-relaxed">
              Tudo o que você vê a seguir é montado a partir das suas respostas.
              A ideia é simples: explicar seu padrão, mostrar o que trava e
              entregar o que fazer depois.
            </p>
            <p className="text-base md:text-lg text-slate-700 max-w-3xl leading-relaxed font-medium">
              Você não está preso por fraqueza — está preso por lógica
              emocional. E essa lógica é o que o relatório completo vai te
              mostrar.
            </p>
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                {content.headline}
              </span>
              <span className="italic">
                Mais de 7 mil pessoas já usaram este relatório para entender o
                próprio padrão antes de mudar de rota.
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

              <div className="text-center pt-4">
                <div className="inline-flex items-start gap-3 px-8 py-4 bg-amber-50 border border-amber-200 rounded-2xl max-w-2xl">
                  <span className="text-2xl mt-0.5">⚡</span>
                  <div className="text-left">
                    <p className="text-slate-900 text-base font-semibold mb-1">
                      Mas isso é só o começo: Existem 8 processos emocionais
                      críticos ainda ativos — e eles explicam por que a dor
                      volta mesmo quando parece que você está bem.
                    </p>
                    <p className="text-sm text-slate-600">
                      O relatório completo te ajuda a entender e resolver esses{" "}
                      <strong>8 processos emocionais</strong> que mantêm você
                      preso.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bloco 2 — O que ainda falta */}
            <div className="space-y-8">
              <div className="text-center space-y-3">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-100 border-2 border-rose-300">
                  <span className="text-sm font-bold text-rose-700">
                    ⚠️ 8 processos emocionais ainda ativos no seu inconsciente
                  </span>
                </div>
                <h3 className="text-2xl md:text-3xl font-medium text-slate-900 max-w-3xl mx-auto">
                  Esses processos internos ainda estão ativos e continuam te
                  puxando pro mesmo ciclo
                </h3>
                <p className="text-sm text-slate-600 max-w-2xl mx-auto">
                  (Você só consegue entender e resolver com o relatório
                  completo)
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
                <div className="rounded-2xl border-2 border-rose-200 bg-rose-50/30 p-6 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-2.5 w-2.5 rounded-full bg-rose-500"></div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      1. Abstinência emocional ativa
                    </h4>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Seu corpo sente a ausência como se fosse uma crise de
                    abstinência. Você precisa entender como desativar esse
                    processo sem recaídas.
                  </p>
                </div>

                <div className="rounded-2xl border-2 border-rose-200 bg-rose-50/30 p-6 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-2.5 w-2.5 rounded-full bg-rose-500"></div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      2. Autoestima fragmentada
                    </h4>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    O fim abalou a forma como você se enxerga. Precisa
                    reconstruir essa percepção antes de conseguir seguir.
                  </p>
                </div>

                <div className="rounded-2xl border-2 border-rose-200 bg-rose-50/30 p-6 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-2.5 w-2.5 rounded-full bg-rose-500"></div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      3. Comparação destrutiva
                    </h4>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Ver o outro bem enquanto você ainda sofre machuca porque os
                    tempos de cura não são iguais. Precisa desativar essa
                    comparação.
                  </p>
                </div>

                <div className="rounded-2xl border-2 border-rose-200 bg-rose-50/30 p-6 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-2.5 w-2.5 rounded-full bg-rose-500"></div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      4. Fechamento incompleto
                    </h4>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Você quer soltar, mas sente que apagar a história é injusto.
                    Precisa criar um encerramento interno real, sem se humilhar.
                  </p>
                </div>

                <div className="rounded-2xl border-2 border-rose-200 bg-rose-50/30 p-6 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-2.5 w-2.5 rounded-full bg-rose-500"></div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      5. Paralisação da reconstrução
                    </h4>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Você já entendeu tudo, mas ainda está travado e sem energia
                    para reconstruir rotina e voltar a sentir prazer.
                  </p>
                </div>

                <div className="rounded-2xl border-2 border-rose-200 bg-rose-50/30 p-6 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-2.5 w-2.5 rounded-full bg-rose-500"></div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      6. Pensamento obsessivo recorrente
                    </h4>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Sua mente volta sempre para a mesma pessoa e a mesma
                    história. Precisa interromper esse loop mental que não te
                    deixa em paz.
                  </p>
                </div>

                <div className="rounded-2xl border-2 border-rose-200 bg-rose-50/30 p-6 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-2.5 w-2.5 rounded-full bg-rose-500"></div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      7. Injustiça emocional percebida
                    </h4>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Ver o outro bem enquanto você sofre parece injusto. Precisa
                    entender os tempos diferentes de processamento emocional.
                  </p>
                </div>

                <div className="rounded-2xl border-2 border-rose-200 bg-rose-50/30 p-6 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-2.5 w-2.5 rounded-full bg-rose-500"></div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      8. Identidade fragmentada pós-término
                    </h4>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Você não sabe mais quem é sem essa pessoa. Precisa
                    reconstruir sua identidade e transformar a dor em
                    aprendizado.
                  </p>
                </div>
              </div>
            </div>

            {/* Bloco 3 — Por que o relatório completo */}
            <div className="space-y-8">
              <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 border-2 border-emerald-300">
                  <span className="text-sm font-bold text-emerald-700">
                    💎 A solução está no relatório completo
                  </span>
                </div>
                <h3 className="text-2xl md:text-3xl font-semibold text-slate-900 max-w-3xl mx-auto leading-tight">
                  O relatório completo te mostra o que o diagnóstico gratuito
                  não conseguiu revelar
                </h3>
                <div className="max-w-2xl mx-auto space-y-3 text-left">
                  <p className="text-base text-slate-700 leading-relaxed">
                    <strong>Por que o seu corpo ainda reage</strong> como se a
                    relação não tivesse acabado.
                  </p>
                  <p className="text-base text-slate-700 leading-relaxed">
                    <strong>Por que cada tentativa de seguir em frente</strong>{" "}
                    ativa o mesmo padrão.
                  </p>
                  <p className="text-base text-slate-700 leading-relaxed">
                    <strong>E o que exatamente precisa mudar</strong> pra você
                    se sentir em paz de verdade.
                  </p>
                </div>
                <p className="text-lg font-semibold text-emerald-700 pt-4">
                  Você não precisa mais adivinhar o que sente. Agora você pode
                  entender — e sair do ciclo.
                </p>
              </div>

              <div className="max-w-2xl mx-auto space-y-4">
                <p className="text-sm font-semibold text-slate-900">
                  ⚡ Ele foi feito pra quem:
                </p>

                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-base mt-0.5">✓</span>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">
                        Sente que entende tudo, mas continua voltando
                      </p>
                      <p className="text-sm text-slate-600">
                        Já tentou "seguir em frente", mas não consegue.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-base mt-0.5">✓</span>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">
                        Quer clareza prática e emocional pra sair desse ciclo
                      </p>
                      <p className="text-sm text-slate-600">
                        Não quer mais palpites — quer soluções que funcionam.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                    <span className="text-base mt-0.5">💬</span>
                    <div>
                      <p className="font-semibold text-emerald-900 text-sm">
                        Resultado: agir com clareza e controle
                      </p>
                      <p className="text-sm text-emerald-700">
                        Você deixa de "esperar o tempo curar" e passa a agir com
                        clareza e controle.
                      </p>
                    </div>
                  </div>
                </div>
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

      {/* Benefícios do relatório completo - Transformação pessoal */}
      <section className="space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 border-2 border-emerald-300">
            <span className="text-sm font-bold text-emerald-700">
              💪 Quando você terminar, vai sentir diferença de verdade
            </span>
          </div>
          <h3 className="text-2xl md:text-3xl font-semibold text-slate-900 max-w-3xl mx-auto">
            É isso que você conquista com o relatório completo:
          </h3>
        </div>

        <div className="grid gap-4 md:grid-cols-2 max-w-5xl mx-auto">
          <div className="flex items-start gap-3 p-5 rounded-xl bg-emerald-50 border-2 border-emerald-200">
            <span className="text-2xl mt-0.5">🛡️</span>
            <div>
              <h4 className="font-bold text-slate-900 text-base mb-1">
                Controle total sobre seus impulsos emocionais
              </h4>
              <p className="text-sm text-slate-600">
                Você para de stalkear, de esperar mensagem e de ter recaídas
                digitais. Finalmente tem o controle do dedo — não o impulso.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-5 rounded-xl bg-emerald-50 border-2 border-emerald-200">
            <span className="text-2xl mt-0.5">😌</span>
            <div>
              <h4 className="font-bold text-slate-900 text-base mb-1">
                Paz mental e clareza pra não voltar pro ciclo
              </h4>
              <p className="text-sm text-slate-600">
                Sua cabeça desliga. Você dorme sem ficar repassando tudo, sem
                aquele ruído mental que te perseguia.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-5 rounded-xl bg-emerald-50 border-2 border-emerald-200">
            <span className="text-2xl mt-0.5">💪</span>
            <div>
              <h4 className="font-bold text-slate-900 text-base mb-1">
                Autoestima firme e sem comparação
              </h4>
              <p className="text-sm text-slate-600">
                Você para de se sentir "insuficiente" ou "substituído(a)".
                Recupera sua confiança sem depender de ninguém.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-5 rounded-xl bg-emerald-50 border-2 border-emerald-200">
            <span className="text-2xl mt-0.5">🔓</span>
            <div>
              <h4 className="font-bold text-slate-900 text-base mb-1">
                Liberação real do vínculo com o passado
              </h4>
              <p className="text-sm text-slate-600">
                Para de se comparar, de sentir injustiça por ele estar bem. Você
                se libera dessa culpa de verdade.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-5 rounded-xl bg-emerald-50 border-2 border-emerald-200">
            <span className="text-2xl mt-0.5">🌱</span>
            <div>
              <h4 className="font-bold text-slate-900 text-base mb-1">
                Capacidade de sentir prazer e rotina novamente
              </h4>
              <p className="text-sm text-slate-600">
                Volta a comer, dormir, sentir vontade de sair. Recupera o prazer
                nas pequenas coisas da vida.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-5 rounded-xl bg-emerald-50 border-2 border-emerald-200">
            <span className="text-2xl mt-0.5">✨</span>
            <div>
              <h4 className="font-bold text-slate-900 text-base mb-1">
                Certeza de que superou — sem fingir, de verdade
              </h4>
              <p className="text-sm text-slate-600">
                Fecha o ciclo com dignidade, sem apagar memórias, sem vergonha.
                Com paz e compreensão real.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center pt-6">
          <Button
            onClick={onPrimaryAction}
            size="lg"
            className="inline-flex items-center gap-3 rounded-full bg-emerald-600 px-12 py-4 text-lg font-bold text-white transition-all hover:bg-emerald-700 hover:shadow-xl hover:scale-105"
          >
            <span className="text-2xl">🔓</span>
            Desbloquear e ver o restante agora →
          </Button>
        </div>
      </section>

      {/* 4. CTA final */}
      <section className="space-y-6 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
          decisão
        </p>
        <h4 className="text-3xl font-semibold text-slate-900">
          Você já viu que essa leitura te descreve. Agora descubra o que ainda
          te prende — e como finalmente sair desse ciclo.
        </h4>
        <p className="text-base text-slate-600 max-w-2xl mx-auto">
          Desbloqueie o relatório completo e avance pelas camadas que revelam
          seus ciclos, forças ocultas, caminhos de cura e sinais do próximo
          capítulo.
        </p>
        <Button
          onClick={onPrimaryAction}
          size="lg"
          className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full border border-slate-300 bg-slate-900 px-10 py-4 text-base font-semibold text-white transition focus-visible:outline-none hover:bg-slate-800"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-white/[0.08] via-white/[0.16] to-white/[0.08] opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
          <span className="relative flex items-center gap-2">
            🔓 Desbloquear e ver o restante agora
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
