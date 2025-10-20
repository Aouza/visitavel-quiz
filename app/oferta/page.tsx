/**
 * @file: app/oferta/page.tsx
 * @responsibility: Página de oferta com pricing cards
 */

"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { PricingCards } from "@/components/PricingCards";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { type Segment } from "@/lib/questions";
import { getSegmentContent } from "@/lib/segments";
import {
  trackOfferViewed,
  trackOrderBumpView,
  trackOrderBumpClick,
} from "@/lib/analytics";
import { Check, Gift } from "lucide-react";

function OfertaContent() {
  const searchParams = useSearchParams();
  const [segment, setSegment] = useState<Segment | null>(null);
  const [orderBump, setOrderBump] = useState(false);

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

  const handleOrderBumpChange = (checked: boolean) => {
    setOrderBump(checked);
    if (checked) {
      trackOrderBumpClick();
    }
  };

  const content = segment ? getSegmentContent(segment) : null;

  return (
    <div className="container mx-auto px-4 py-12 space-y-12">
      {/* Topbar com resultado */}
      {content && (
        <Card className="border-2 border-primary">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="text-4xl">{content.icon}</div>
              <div className="flex-1 text-center md:text-left">
                <h2 className={`text-2xl font-bold ${content.color} mb-2`}>
                  Seu resultado: {content.headline}
                </h2>
                <p className="text-muted-foreground">
                  {content.description.substring(0, 150)}...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hero da Oferta */}
      <div className="text-center space-y-6 max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold leading-tight">
          Acelere sua recuperação com o Kit Anti-Recaída
        </h1>
        <p className="text-xl text-muted-foreground">
          Mais de 80% das pessoas que tentam superar um término sozinhas acabam
          tendo recaídas. Não deixe isso acontecer com você.
        </p>
      </div>

      {/* Benefícios */}
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-2xl font-semibold mb-6 text-center">
              O que você ganha com o Kit Anti-Recaída:
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  title: "Plano de ação diário",
                  description:
                    "Saiba exatamente o que fazer a cada dia pelos próximos 30 dias",
                },
                {
                  title: "Protocolo anti-recaída",
                  description:
                    "Técnicas comprovadas para quando bater o impulso de voltar",
                },
                {
                  title: "Suporte em grupo VIP",
                  description:
                    "Acesso ao grupo exclusivo no WhatsApp com outras pessoas na mesma jornada",
                },
                {
                  title: "Ferramentas práticas",
                  description:
                    "Templates, exercícios e checklists prontos para usar",
                },
                {
                  title: "Meditações guiadas",
                  description:
                    "Áudios exclusivos para momentos de crise e ansiedade",
                },
                {
                  title: "Atualizações vitalícias",
                  description:
                    "Receba novos conteúdos e ferramentas sem custo adicional",
                },
              ].map((benefit, index) => (
                <div key={index} className="flex gap-3">
                  <Check className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pricing */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold">Escolha seu plano</h2>
          <p className="text-muted-foreground">
            Todos os planos incluem garantia de 7 dias
          </p>
        </div>

        <PricingCards segment={segment || undefined} />
      </div>

      {/* Order Bump */}
      <div
        className="max-w-2xl mx-auto"
        onMouseEnter={() => trackOrderBumpView()}
      >
        <Card className="border-2 border-orange-500 bg-orange-50 dark:bg-orange-950">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Checkbox
                id="order-bump"
                checked={orderBump}
                onCheckedChange={handleOrderBumpChange}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Gift className="w-5 h-5 text-orange-600" />
                  <Label
                    htmlFor="order-bump"
                    className="text-lg font-bold cursor-pointer"
                  >
                    🔥 Oferta especial: Acesso antecipado ao Grupo Anti-Recaída
                  </Label>
                </div>
                <p className="text-sm mb-3">
                  Entre no grupo VIP HOJE mesmo (normalmente liberado após 48h)
                  e receba suporte imediato de pessoas que já superaram. Apenas
                  R$ 27 extras.
                </p>
                <ul className="space-y-1 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-orange-600" />
                    Acesso imediato ao grupo
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-orange-600" />
                    Lives semanais exclusivas
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-orange-600" />
                    Suporte 24/7 da comunidade
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Garantia */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary text-primary-foreground text-3xl font-bold">
          7d
        </div>
        <h3 className="text-2xl font-bold">Garantia incondicional de 7 dias</h3>
        <p className="text-muted-foreground">
          Se você não sentir que o Kit Anti-Recaída está te ajudando, basta
          enviar um e-mail em até 7 dias e devolvemos 100% do seu investimento,
          sem perguntas.
        </p>
      </div>

      {/* FAQ rápido */}
      <div className="max-w-2xl mx-auto space-y-6">
        <h2 className="text-2xl font-bold text-center mb-8">
          Perguntas frequentes
        </h2>

        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">
                Quando vou receber o acesso?
              </h3>
              <p className="text-sm text-muted-foreground">
                Imediatamente após a confirmação do pagamento. Você receberá um
                e-mail com todos os acessos.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">Quanto tempo tenho acesso?</h3>
              <p className="text-sm text-muted-foreground">
                O acesso é vitalício. Você pode consultar os materiais sempre
                que precisar.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">
                Funciona para qualquer tipo de término?
              </h3>
              <p className="text-sm text-muted-foreground">
                Sim! O Kit foi desenvolvido para ajudar em diferentes cenários
                de término, independente da duração do relacionamento.
              </p>
            </CardContent>
          </Card>
        </div>
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
