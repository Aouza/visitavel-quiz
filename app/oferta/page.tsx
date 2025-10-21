/**
 * @file: app/oferta/page.tsx
 * @responsibility: Página de oferta com pricing cards
 */

"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PricingCards } from "@/components/PricingCards";
import { type Segment } from "@/lib/questions";
import { getSegmentContent } from "@/lib/segments";
import { trackOfferViewed } from "@/lib/analytics";
import { Shield, Clock, Heart } from "lucide-react";

function OfertaContent() {
  const searchParams = useSearchParams();
  const [segment, setSegment] = useState<Segment | null>(null);

  useEffect(() => {
    const seg = searchParams.get("seg") as Segment;

    if (
      seg &&
      [
        "devastacao",
        "abstinencia",
        "interiorizacao",
        "ira",
        "superacao",
      ].includes(seg)
    ) {
      setSegment(seg);
      trackOfferViewed(seg);
    }
  }, [searchParams]);

  const content = segment ? getSegmentContent(segment) : null;

  return (
    <div className="relative w-full bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-16 md:py-24 space-y-20">
        {/* Header com resultado */}
        {content && (
          <section className="space-y-6">
            <div className="flex items-center gap-3 text-xs uppercase tracking-[0.35em] text-slate-400">
              <span className="h-px w-12 bg-slate-200" />
              Seu diagnóstico
            </div>
            <div className="flex items-start gap-6">
              <div className="hidden md:flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-3xl">
                {content.icon}
              </div>
              <div className="space-y-3">
                <h2 className="text-2xl md:text-3xl font-semibold text-slate-900">
                  {content.headline}
                </h2>
                <p className="text-base md:text-lg text-slate-600 leading-relaxed max-w-2xl">
                  {content.description}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Hero da Oferta */}
        <section className="space-y-8 text-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-semibold leading-tight text-slate-900">
              Agora você tem clareza do problema.
              <br />É hora de resolver de vez.
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              O relatório completo te mostra o <strong>caminho exato</strong>{" "}
              para sair do ciclo de recaídas e recuperar o controle da sua vida
              emocional.
            </p>
          </div>
        </section>

        {/* Benefícios */}
        <section className="space-y-10">
          <div className="space-y-3 text-center">
            <span className="text-xs uppercase tracking-[0.35em] text-slate-400">
              o que você recebe
            </span>
            <h2 className="text-2xl md:text-3xl font-medium text-slate-900">
              O relatório completo desbloqueia 8 camadas essenciais
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                icon: "💬",
                title: "Por que você ainda pensa nessa pessoa",
                description:
                  "Entenda o mecanismo emocional que mantém a obsessão ativa",
              },
              {
                icon: "🧠",
                title: "Como parar o pensamento obsessivo",
                description: "Método prático para interromper o loop mental",
              },
              {
                icon: "🌙",
                title: "Como lidar com a abstinência emocional",
                description: "Equilibre a química emocional sem recaídas",
              },
              {
                icon: "⚡",
                title: "Como recuperar sua autoestima",
                description:
                  "Reconstrua sua confiança sem depender de aprovação",
              },
              {
                icon: "🌑",
                title: "Por que ele parece bem e você não",
                description: "Entenda as fases ocultas e pare de se comparar",
              },
              {
                icon: "🕯",
                title: "Como encerrar de verdade",
                description: "Fechamento emocional real, sem humilhação",
              },
              {
                icon: "🔮",
                title: "Como voltar a se sentir bem",
                description:
                  "Reative sua vitalidade e recupere o prazer de viver",
              },
              {
                icon: "🌅",
                title: "O que vem depois da dor",
                description:
                  "Transforme o aprendizado em força e reconstrua sua identidade",
              },
            ].map((benefit, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <span className="text-2xl mt-0.5 flex-shrink-0">
                  {benefit.icon}
                </span>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1 text-base">
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section className="space-y-10">
          <div className="space-y-3 text-center">
            <span className="text-xs uppercase tracking-[0.35em] text-slate-400">
              escolha seu plano
            </span>
            <h2 className="text-2xl md:text-3xl font-medium text-slate-900">
              Desbloqueie o relatório completo agora
            </h2>
            <p className="text-sm text-slate-600">
              Garantia incondicional de 7 dias • Acesso imediato
            </p>
          </div>

          <PricingCards segment={segment || undefined} />
        </section>

        {/* Garantia */}
        <section className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-900 text-white text-2xl font-bold">
            <Shield className="w-10 h-10" />
          </div>
          <div className="space-y-3">
            <h3 className="text-2xl font-semibold text-slate-900">
              Garantia incondicional de 7 dias
            </h3>
            <p className="text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Se você não sentir que o relatório está te ajudando, basta enviar
              um e-mail em até 7 dias e devolvemos 100% do seu investimento, sem
              perguntas.
            </p>
          </div>
        </section>

        {/* FAQ rápido */}
        <section className="space-y-8">
          <div className="space-y-3 text-center">
            <span className="text-xs uppercase tracking-[0.35em] text-slate-400">
              perguntas frequentes
            </span>
            <h2 className="text-2xl md:text-3xl font-medium text-slate-900">
              Dúvidas comuns
            </h2>
          </div>

          <div className="space-y-4">
            <div className="p-6 rounded-2xl bg-white border border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-2 text-base">
                Quando vou receber o acesso?
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Imediatamente após a confirmação do pagamento. Você receberá um
                e-mail com todos os acessos.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-2 text-base">
                Quanto tempo tenho acesso?
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                O acesso é vitalício. Você pode consultar os materiais sempre
                que precisar.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-2 text-base">
                Funciona para qualquer tipo de término?
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Sim! O relatório foi desenvolvido para ajudar em diferentes
                cenários de término, independente da duração do relacionamento.
              </p>
            </div>
          </div>
        </section>

        {/* Trust badges finais */}
        <section className="flex flex-wrap items-center justify-center gap-8 text-sm text-slate-600 pt-8 border-t border-slate-200">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>Acesso imediato</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span>Garantia de 7 dias</span>
          </div>
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4" />
            <span>+7 mil vidas transformadas</span>
          </div>
        </section>
      </div>
    </div>
  );
}

export default function OfertaPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground">Carregando oferta...</p>
        </div>
      }
    >
      <OfertaContent />
    </Suspense>
  );
}
