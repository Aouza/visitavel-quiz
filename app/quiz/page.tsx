/**
 * @file: app/quiz/page.tsx
 * @responsibility: Landing page do quiz + modal de captura
 */

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { getLeadInfo, captureUTMsFromURL } from "@/lib/storage";
import {
  trackLandingView,
  trackQuizCTAClick,
  gtagEvent,
} from "@/lib/analytics";
import { trackMetaEventOnce } from "@/lib/track-meta-deduplicated";
import { Check, ArrowRight } from "lucide-react";

export default function QuizPage() {
  const [hasLead, setHasLead] = useState(false);

  useEffect(() => {
    // Capturar UTMs da URL
    captureUTMsFromURL();

    // Verificar se já tem lead
    const leadInfo = getLeadInfo();
    setHasLead(!!leadInfo);

    // Track visualização da landing page (GA4) - sempre executa
    trackLandingView();

    // Track visualização da landing (Meta - landing_view) - proteção contra duplicação
    trackMetaEventOnce("landing_view", {
      eventName: "landing_view",
      customData: {
        page: "landing",
        has_lead: leadInfo ? 1 : 0,
      },
    });
  }, []);

  const handleStartClick = () => {
    // Track GA4
    trackQuizCTAClick();
    gtagEvent("cta_start_quiz", {
      page: "/quiz",
      has_lead: hasLead,
      source: "landing_page",
    });

    // Track Meta - quiz_start (permite múltiplos cliques por sessão)
    trackMetaEventOnce(`quiz_start_${Date.now()}`, {
      eventName: "quiz_start",
      customData: {
        source: "landing_cta",
        has_lead: hasLead ? 1 : 0,
      },
    });

    // Sempre redirecionar para /quiz/start (novo fluxo)
    window.location.href = "/quiz/start";
  };

  // Landing page
  return (
    <div className="relative w-full bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-4xl mx-auto px-3 md:px-4 py-8 md:py-16 lg:py-24 space-y-12 md:space-y-16 lg:space-y-20">
        {/* Hero */}
        <section className="space-y-6 md:space-y-8">
          <div className="flex items-center gap-2 md:gap-3 text-xs uppercase tracking-[0.25em] md:tracking-[0.35em] text-slate-400">
            <span className="h-px w-8 md:w-12 bg-slate-200" />
            Mapa emocional gratuito
          </div>

          <div className="space-y-4 md:space-y-6">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight text-slate-900">
              Você sente que já era pra ter superado, mas ainda pensa nessa
              pessoa todos os dias?
            </h1>

            <div className="space-y-3 md:space-y-4 text-base md:text-lg lg:text-xl text-slate-600 leading-relaxed max-w-3xl">
              <p>
                Esse teste mostra{" "}
                <strong className="text-slate-900">
                  por que você ainda não conseguiu seguir em frente
                </strong>{" "}
                — e{" "}
                <strong className="text-slate-900">
                  o que está te prendendo sem você perceber
                </strong>
                .
              </p>
              <p>
                Não é autoajuda genérica. É uma análise direta baseada no que
                você realmente sente agora.
              </p>
            </div>

            <div className="pt-4 md:pt-6">
              <Button
                size="lg"
                onClick={handleStartClick}
                className="w-full md:w-auto inline-flex items-center justify-center gap-2 md:gap-3 rounded-full bg-slate-900 px-8 md:px-10 py-5 md:py-6 text-base md:text-lg font-semibold text-white transition hover:bg-slate-800 hover:shadow-lg"
              >
                Começar mapeamento gratuito
                <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
              <p className="text-xs md:text-sm text-slate-500 mt-3 md:mt-4 text-center md:text-left">
                ⏱️ Leva apenas 2 minutos • Resultado na hora • 100% gratuito
              </p>
            </div>
          </div>
        </section>

        {/* O que você vai descobrir */}
        <section className="space-y-6 md:space-y-10">
          <div className="space-y-2 md:space-y-3">
            <span className="text-xs uppercase tracking-[0.25em] md:tracking-[0.35em] text-slate-400">
              o que você vai descobrir
            </span>
            <h2 className="text-xl md:text-2xl lg:text-3xl font-medium text-slate-900">
              Respostas diretas para o que você sente agora
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            <div className="flex items-start gap-3 md:gap-4 p-5 md:p-6 rounded-xl md:rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="flex-shrink-0 w-9 h-9 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-slate-900 flex items-center justify-center">
                <span className="text-white text-base md:text-lg font-bold">
                  1
                </span>
              </div>
              <div className="space-y-1 md:space-y-2">
                <h3 className="font-semibold text-slate-900 text-sm md:text-base">
                  Por que você ainda pensa nessa pessoa todo dia
                </h3>
                <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                  Não é fraqueza. É um padrão de comportamento que fica ativo
                  quando algo termina sem respostas claras.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 md:gap-4 p-5 md:p-6 rounded-xl md:rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="flex-shrink-0 w-9 h-9 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-slate-900 flex items-center justify-center">
                <span className="text-white text-base md:text-lg font-bold">
                  2
                </span>
              </div>
              <div className="space-y-1 md:space-y-2">
                <h3 className="font-semibold text-slate-900 text-sm md:text-base">
                  Em que fase do pós-término você está agora
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Cada fase tem sinais específicos. Saber onde você está é o
                  primeiro passo para sair.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
                <span className="text-white text-lg font-bold">3</span>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-slate-900 text-base">
                  O que está te mantendo preso no mesmo ciclo
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Tem um padrão emocional que você repete sem perceber. Vamos te
                  mostrar qual é.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
                <span className="text-white text-lg font-bold">4</span>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-slate-900 text-base">
                  O que fazer de prático a partir de agora
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Ações específicas para aplicar hoje. Sem teoria vaga, só o que
                  funciona de verdade.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Prova social rápida */}
        <section className="space-y-6">
          <div className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
            <span className="text-2xl">🧠</span>
            <div className="text-center">
              <p className="text-sm font-semibold text-emerald-900">
                Mais de 47 mil pessoas já fizeram este mapeamento
              </p>
              <p className="text-xs text-emerald-700">
                98% dizem que o relatório "acertou em cheio o que estavam
                sentindo"
              </p>
            </div>
          </div>
        </section>

        {/* Para quem é */}
        <section className="space-y-8">
          <div className="space-y-3">
            <span className="text-xs uppercase tracking-[0.35em] text-slate-400">
              esse quiz é pra você se
            </span>
            <h2 className="text-2xl md:text-3xl font-medium text-slate-900">
              Você vai se identificar se ainda sente alguma dessas coisas
            </h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3 p-5 rounded-xl bg-slate-50 border border-slate-200">
              <Check className="w-5 h-5 text-slate-700 mt-0.5 flex-shrink-0" />
              <p className="text-slate-700">
                <strong>Você pensa nessa pessoa todos os dias</strong>, mesmo
                tentando focar em outras coisas
              </p>
            </div>

            <div className="flex items-start gap-3 p-5 rounded-xl bg-slate-50 border border-slate-200">
              <Check className="w-5 h-5 text-slate-700 mt-0.5 flex-shrink-0" />
              <p className="text-slate-700">
                <strong>Sua cabeça não desliga</strong> — você fica repassando
                conversas, lembrando momentos, tentando entender o que deu
                errado
              </p>
            </div>

            <div className="flex items-start gap-3 p-5 rounded-xl bg-slate-50 border border-slate-200">
              <Check className="w-5 h-5 text-slate-700 mt-0.5 flex-shrink-0" />
              <p className="text-slate-700">
                <strong>Você já tentou "seguir em frente"</strong> mas sempre
                volta pro mesmo lugar — stalkeando, esperando mensagem, sentindo
                falta
              </p>
            </div>

            <div className="flex items-start gap-3 p-5 rounded-xl bg-slate-50 border border-slate-200">
              <Check className="w-5 h-5 text-slate-700 mt-0.5 flex-shrink-0" />
              <p className="text-slate-700">
                <strong>Você sente que está travado</strong> — entende que
                precisa seguir, mas não consegue agir de verdade
              </p>
            </div>

            <div className="flex items-start gap-3 p-5 rounded-xl bg-slate-50 border border-slate-200">
              <Check className="w-5 h-5 text-slate-700 mt-0.5 flex-shrink-0" />
              <p className="text-slate-700">
                <strong>Você quer clareza</strong> — não aguenta mais palpite
                genérico, quer entender de verdade o que está acontecendo com
                você
              </p>
            </div>
          </div>
        </section>

        {/* Como funciona */}
        <section className="space-y-10">
          <div className="space-y-3">
            <span className="text-xs uppercase tracking-[0.35em] text-slate-400">
              como funciona
            </span>
            <h2 className="text-2xl md:text-3xl font-medium text-slate-900">
              Simples, rápido e direto
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center text-xl font-bold">
                1
              </div>
              <h3 className="text-lg font-semibold text-slate-900">
                Responda 12 perguntas
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Perguntas diretas sobre o que você sente agora — nada de teoria,
                só sua realidade.
              </p>
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center text-xl font-bold">
                2
              </div>
              <h3 className="text-lg font-semibold text-slate-900">
                Receba seu mapa pessoal
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Na hora, você vê em que fase está, por que está preso e o que
                precisa fazer.
              </p>
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center text-xl font-bold">
                3
              </div>
              <h3 className="text-lg font-semibold text-slate-900">
                Comece a agir hoje
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Com clareza do seu padrão, você finalmente sabe o que fazer para
                sair do ciclo.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="space-y-8">
          <div className="space-y-3">
            <span className="text-xs uppercase tracking-[0.35em] text-slate-400">
              perguntas frequentes
            </span>
            <h2 className="text-2xl md:text-3xl font-medium text-slate-900">
              Dúvidas comuns
            </h2>
          </div>

          <div className="space-y-4">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <h3 className="font-semibold text-slate-900 text-base mb-2 flex items-center gap-2">
                <span>❓</span> É gratuito mesmo?
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                <strong>✅ Sim.</strong> Você responde 12 perguntas e recebe a
                análise na hora, 100% grátis.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <h3 className="font-semibold text-slate-900 text-base mb-2 flex items-center gap-2">
                <span>❓</span> É sobre astrologia ou espiritualidade?
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                <strong>✅ Não.</strong> É uma leitura pessoal direta, baseada
                em comportamento real.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <h3 className="font-semibold text-slate-900 text-base mb-2 flex items-center gap-2">
                <span>❓</span> E se eu não estiver sofrendo tanto?
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                <strong>✅ Mesmo assim</strong> ele te mostra onde você ainda se
                prende — às vezes o ciclo continua mesmo quando a dor parece
                menor.
              </p>
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="space-y-6">
          <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 text-center">
            <p className="text-slate-600 text-base leading-relaxed mb-4">
              "Eu finalmente entendi por que não conseguia seguir. A análise foi
              tão direta que parecia que alguém estava lendo minha mente. Em 2
              dias eu já estava melhor."
            </p>
            <p className="text-sm text-slate-500">— Maria, 28 anos</p>
          </div>

          <p className="text-center text-sm text-slate-500">
            Mais de <strong className="text-slate-700">7 mil pessoas</strong> já
            usaram este mapeamento para entender o próprio padrão de
            comportamento
          </p>
        </section>

        {/* CTA Final */}
        <section className="text-center space-y-5 md:space-y-6 py-6 md:py-8">
          <div className="space-y-3 md:space-y-4">
            <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 px-2">
              Pronto para entender o que realmente te prende?
            </h2>
            <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto px-4">
              São apenas 2 minutos. Você vai receber sua análise completa na
              hora — e finalmente ter clareza do que fazer.
            </p>
          </div>

          <Button
            size="lg"
            onClick={handleStartClick}
            className="w-full md:w-auto inline-flex items-center justify-center gap-2 md:gap-3 rounded-full bg-slate-900 px-10 md:px-12 py-5 md:py-6 text-base md:text-lg font-bold text-white transition hover:bg-slate-800 hover:shadow-xl hover:scale-105"
          >
            Começar mapeamento agora
            <ArrowRight className="h-5 w-5 md:h-6 md:w-6" />
          </Button>

          <p className="text-xs md:text-sm text-slate-500">
            ⏱️ 2 minutos • Resultado imediato • Totalmente gratuito
          </p>
        </section>
      </div>
    </div>
  );
}
