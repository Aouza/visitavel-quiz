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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-6 w-full max-w-6xl mx-auto px-4 md:px-0">
      {PLANS.map((plan) => (
        <div
          key={plan.id}
          className={`relative flex flex-col rounded-2xl md:rounded-[28px] border bg-white shadow-sm transition-all duration-300 hover:shadow-lg ${
            plan.recommended
              ? "border-2 border-slate-900 shadow-md md:scale-105"
              : "border-slate-200"
          }`}
        >
          {plan.badge && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-3 md:px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 whitespace-nowrap">
              <Star className="w-3 h-3 fill-white" />
              {plan.badge}
            </div>
          )}

          <div className="text-center p-6 md:p-8 pb-4 md:pb-6">
            <h3 className="text-lg md:text-xl font-semibold text-slate-900 mb-2">
              {plan.name}
            </h3>
            <p className="text-xs md:text-sm text-slate-600 mb-4 md:mb-6">
              {plan.description}
            </p>
            <div>
              <span className="text-3xl md:text-4xl font-bold text-slate-900">
                {plan.price}
              </span>
              {plan.priceNumeric > 0 && (
                <span className="text-xs md:text-sm text-slate-500 ml-1">
                  /único
                </span>
              )}
            </div>
          </div>

          <div className="flex-grow px-6 md:px-8 pb-4 md:pb-6">
            <ul className="space-y-2 md:space-y-3">
              {plan.features.map((feature, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-xs md:text-sm"
                >
                  <Check className="w-4 h-4 text-slate-700 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-700 leading-relaxed">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-6 md:p-8 pt-3 md:pt-4">
            <button
              onClick={() => handleCheckoutClick(plan)}
              className={`w-full px-4 md:px-6 py-3 md:py-3.5 rounded-full font-semibold text-sm transition-all ${
                plan.recommended
                  ? "bg-slate-900 text-white hover:bg-slate-800 hover:shadow-md"
                  : "border-2 border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-50"
              }`}
            >
              {plan.priceNumeric === 0 ? "Já recebi" : "Quero este plano"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
