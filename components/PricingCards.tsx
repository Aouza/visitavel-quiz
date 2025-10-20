/**
 * @file: PricingCards.tsx
 * @responsibility: Cards de pricing da oferta
 */

"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Star } from "lucide-react";
import { trackCTAClickCheckout } from "@/lib/analytics";
import { getUTMs } from "@/lib/storage";

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: string;
  priceNumeric: number;
  checkoutUrl: string;
  features: string[];
  recommended?: boolean;
  badge?: string;
}

const PLANS: PricingPlan[] = [
  {
    id: "report-only",
    name: "Relatório Completo",
    description: "Análise detalhada do seu momento",
    price: "R$ 47",
    priceNumeric: 47,
    checkoutUrl: "https://pay.hotmart.com/placeholder-report-only",
    features: [
      "Relatório personalizado completo (15-20 páginas)",
      "Análise profunda da sua fase",
      "Ações recomendadas para hoje",
      "Acesso por 12 meses",
    ],
  },
  {
    id: "kit-complete",
    name: "Kit Anti-Recaída Completo",
    description: "Recomendado para resultados concretos",
    price: "R$ 97",
    priceNumeric: 97,
    checkoutUrl: "https://pay.hotmart.com/placeholder-kit-complete",
    features: [
      "Tudo do Relatório Completo",
      "Kit Anti-Recaída com ferramentas práticas",
      "Guia de ações diárias por 30 dias",
      "Templates e exercícios em PDF",
      "Acesso ao Grupo VIP de suporte (WhatsApp)",
      "🎁 Bônus: Meditações guiadas (áudio)",
      "🎁 Bônus: Checklist de autocuidado",
    ],
    recommended: true,
    badge: "Mais Popular",
  },
  {
    id: "summary-free",
    name: "Resumo Gratuito",
    description: "Apenas o básico por e-mail",
    price: "Grátis",
    priceNumeric: 0,
    checkoutUrl: "#free-summary",
    features: [
      "Resumo básico da sua fase (3-5 páginas)",
      "Orientações gerais",
      "Enviado por e-mail",
    ],
  },
];

interface PricingCardsProps {
  segment?: string;
}

export function PricingCards({ segment }: PricingCardsProps) {
  const handleCheckoutClick = (plan: PricingPlan) => {
    // Track evento
    trackCTAClickCheckout(plan.id, plan.priceNumeric);

    // Para o plano gratuito, não redirecionar
    if (plan.id === "summary-free") {
      alert("Resumo já foi enviado para seu e-mail cadastrado!");
      return;
    }

    // Adicionar UTMs ao link de checkout
    const utms = getUTMs();
    const url = new URL(plan.checkoutUrl);

    if (segment) {
      url.searchParams.set("seg", segment);
    }

    Object.entries(utms).forEach(([key, value]) => {
      if (value) {
        url.searchParams.set(key, value);
      }
    });

    // Abrir checkout em nova aba
    window.open(url.toString(), "_blank");
  };

  return (
    <div className="grid md:grid-cols-3 gap-6 w-full max-w-6xl mx-auto">
      {PLANS.map((plan) => (
        <Card
          key={plan.id}
          className={`relative flex flex-col ${
            plan.recommended ? "border-primary border-2 shadow-lg" : ""
          }`}
        >
          {plan.badge && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
              <Star className="w-3 h-3" />
              {plan.badge}
            </div>
          )}

          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl">{plan.name}</CardTitle>
            <CardDescription>{plan.description}</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">{plan.price}</span>
              {plan.priceNumeric > 0 && (
                <span className="text-sm text-muted-foreground ml-1">
                  /único
                </span>
              )}
            </div>
          </CardHeader>

          <CardContent className="flex-grow">
            <ul className="space-y-3">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>

          <CardFooter>
            <Button
              size="lg"
              variant={plan.recommended ? "default" : "outline"}
              className="w-full"
              onClick={() => handleCheckoutClick(plan)}
            >
              {plan.priceNumeric === 0 ? "Já recebi" : "Quero este plano"}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
