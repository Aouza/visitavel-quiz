/**
 * @file: app/quiz/page.tsx
 * @responsibility: Landing page do quiz + modal de captura
 */

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LeadModal } from "@/components/LeadModal";
import { QuizStepper } from "@/components/QuizStepper";
import { getLeadInfo, captureUTMsFromURL } from "@/lib/storage";
import { trackQuizView, trackQuizCTAClick } from "@/lib/analytics";
import { Check, Heart } from "lucide-react";

export default function QuizPage() {
  const [showLeadModal, setShowLeadModal] = useState(false);
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
  }, []);

  const handleStartClick = () => {
    trackQuizCTAClick();

    if (hasLead) {
      // Já tem lead, ir direto pro quiz
      setIsStarting(true);
    } else {
      // Abrir modal de captura
      setShowLeadModal(true);
    }
  };

  const handleLeadSuccess = () => {
    setShowLeadModal(false);
    setHasLead(true);
    setIsStarting(true);
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
    <>
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Hero */}
        <div className="text-center space-y-6 mb-12">
          <div className="inline-flex items-center gap-2 text-primary mb-4">
            <Heart className="w-6 h-6" />
            <span className="font-semibold">Quiz Pós-Término</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            Descubra em que fase do pós-término você está
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Em apenas 2 minutos, receba um resumo personalizado com orientações
            práticas para o seu momento atual.
          </p>

          <div className="pt-4">
            <Button
              size="lg"
              onClick={handleStartClick}
              className="text-lg px-8 py-6"
            >
              Iniciar teste gratuito
            </Button>
          </div>
        </div>

        {/* Benefits */}
        <Card className="mb-12">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-semibold mb-6 text-center">
              O que você vai receber:
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                "Identificação precisa da sua fase de luto amoroso",
                "Resumo personalizado do seu momento emocional",
                "Orientações práticas para aplicar hoje mesmo",
                "Recomendações específicas baseadas nas suas respostas",
                "Acesso imediato ao resultado completo",
                "Material adicional exclusivo (opcional)",
              ].map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{benefit}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* How it works */}
        <div className="text-center space-y-8 mb-12">
          <h2 className="text-2xl font-semibold">Como funciona</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto">
                1
              </div>
              <h3 className="font-semibold">Responda 12 perguntas</h3>
              <p className="text-sm text-muted-foreground">
                Perguntas simples e objetivas sobre como você está se sentindo
                agora
              </p>
            </div>
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto">
                2
              </div>
              <h3 className="font-semibold">Receba seu resultado</h3>
              <p className="text-sm text-muted-foreground">
                Descubra sua fase e receba orientações personalizadas
              </p>
            </div>
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto">
                3
              </div>
              <h3 className="font-semibold">Aplique as ações</h3>
              <p className="text-sm text-muted-foreground">
                Siga o plano de ação específico para o seu momento
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center space-y-4 py-8">
          <h2 className="text-2xl font-semibold">
            Pronto(a) para começar sua jornada de superação?
          </h2>
          <Button
            size="lg"
            onClick={handleStartClick}
            className="text-lg px-8 py-6"
          >
            Começar agora
          </Button>
          <p className="text-sm text-muted-foreground">
            ⏱️ Leva apenas 2 minutos • 100% gratuito
          </p>
        </div>
      </div>

      {/* Lead Modal */}
      <LeadModal
        open={showLeadModal}
        onOpenChange={setShowLeadModal}
        onSuccess={handleLeadSuccess}
      />
    </>
  );
}
