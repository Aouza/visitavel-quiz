/**
 * @file: app/quiz/page.tsx
 * @responsibility: Landing page do quiz + modal de captura
 */

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { QuizStepper } from "@/components/QuizStepper";
import { getLeadInfo, captureUTMsFromURL } from "@/lib/storage";
import { trackQuizView, trackQuizCTAClick } from "@/lib/analytics";
import { Check, ArrowRight } from "lucide-react";

export default function QuizPage() {
  const [hasLead, setHasLead] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    // Capturar UTMs da URL
    captureUTMsFromURL();

    // Verificar se já tem lead
    const leadInfo = getLeadInfo();
    setHasLead(!!leadInfo);

    // Track visualização
    trackQuizView();

    // Se tem lead E veio de ?autostart=1, iniciar automaticamente
    const urlParams = new URLSearchParams(window.location.search);
    const shouldAutoStart = urlParams.get("autostart") === "1";

    if (leadInfo && shouldAutoStart) {
      setIsStarting(true);
    }
  }, []);

  const handleStartClick = () => {
    trackQuizCTAClick();

    if (hasLead) {
      // Já tem lead, ir direto pro quiz
      setIsStarting(true);
    } else {
      // Redirecionar para página de captura
      window.location.href = "/quiz/start";
    }
  };

  // Se já iniciou o quiz, mostrar o stepper
  if (isStarting) {
    return (
      <div className="container mx-auto py-8">
        <QuizStepper />
      </div>
    );
  }

  // Landing page
  return (
    <div className="relative w-full bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-16 md:py-24 space-y-20">
        {/* Hero */}
        <section className="space-y-8">
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.35em] text-slate-400">
            <span className="h-px w-12 bg-slate-200" />
            Diagnóstico emocional gratuito
          </div>

          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-semibold leading-tight text-slate-900">
              Você ainda pensa nessa pessoa todos os dias?
            </h1>

            <div className="space-y-4 text-lg md:text-xl text-slate-600 leading-relaxed max-w-3xl">
              <p>
                Esse quiz vai te mostrar{" "}
                <strong className="text-slate-900">
                  exatamente em que fase você está
                </strong>{" "}
                e{" "}
                <strong className="text-slate-900">
                  por que ainda não conseguiu seguir em frente
                </strong>
                .
              </p>
              <p>
                Não é autoajuda genérica. É um diagnóstico direto baseado no que
                você realmente sente agora.
              </p>
            </div>

            <div className="pt-6">
              <Button
                size="lg"
                onClick={handleStartClick}
                className="inline-flex items-center gap-3 rounded-full bg-slate-900 px-10 py-6 text-lg font-semibold text-white transition hover:bg-slate-800 hover:shadow-lg"
              >
                Começar diagnóstico gratuito
                <ArrowRight className="h-5 w-5" />
              </Button>
              <p className="text-sm text-slate-500 mt-4">
                ⏱️ Leva apenas 2 minutos • Resultado na hora • 100% gratuito
              </p>
            </div>
          </div>
        </section>

        {/* O que você vai descobrir */}
        <section className="space-y-10">
          <div className="space-y-3">
            <span className="text-xs uppercase tracking-[0.35em] text-slate-400">
              o que você vai descobrir
            </span>
            <h2 className="text-2xl md:text-3xl font-medium text-slate-900">
              Respostas diretas para o que você sente agora
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div className="flex items-start gap-4 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
                <span className="text-white text-lg font-bold">1</span>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-slate-900 text-base">
                  Por que você ainda pensa nessa pessoa todo dia
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Não é fraqueza. É um mecanismo emocional que fica ativo quando
                  algo termina sem respostas claras.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
                <span className="text-white text-lg font-bold">2</span>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-slate-900 text-base">
                  Em que fase do pós-término você está agora
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Cada fase tem sintomas específicos. Saber onde você está é o
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

        {/* Para quem é */}
        <section className="space-y-8">
          <div className="space-y-3">
            <span className="text-xs uppercase tracking-[0.35em] text-slate-400">
              esse quiz é pra você se
            </span>
            <h2 className="text-2xl md:text-3xl font-medium text-slate-900">
              Você se identifica com pelo menos 2 dessas situações
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
                Receba seu diagnóstico
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

        {/* Social Proof */}
        <section className="space-y-6">
          <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 text-center">
            <p className="text-slate-600 text-base leading-relaxed mb-4">
              "Eu finalmente entendi por que não conseguia seguir. O diagnóstico
              foi tão direto que parecia que alguém estava lendo minha mente. Em
              2 dias eu já estava melhor."
            </p>
            <p className="text-sm text-slate-500">— Maria, 28 anos</p>
          </div>

          <p className="text-center text-sm text-slate-500">
            Mais de <strong className="text-slate-700">7 mil pessoas</strong> já
            usaram este diagnóstico para entender o próprio padrão emocional
          </p>
        </section>

        {/* CTA Final */}
        <section className="text-center space-y-6 py-8">
          <div className="space-y-4">
            <h2 className="text-3xl font-semibold text-slate-900">
              Pronto para entender o que realmente te prende?
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              São apenas 2 minutos. Você vai receber seu diagnóstico completo na
              hora — e finalmente ter clareza do que fazer.
            </p>
          </div>

          <Button
            size="lg"
            onClick={handleStartClick}
            className="inline-flex items-center gap-3 rounded-full bg-slate-900 px-12 py-6 text-lg font-bold text-white transition hover:bg-slate-800 hover:shadow-xl hover:scale-105"
          >
            Começar diagnóstico agora
            <ArrowRight className="h-6 w-6" />
          </Button>

          <p className="text-sm text-slate-500">
            ⏱️ 2 minutos • Resultado imediato • Totalmente gratuito
          </p>
        </section>
      </div>
    </div>
  );
}
