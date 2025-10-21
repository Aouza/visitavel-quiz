/**
 * @file: QuizStepper.tsx
 * @responsibility: Componente principal do quiz multi-step
 */

"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ProgressHeader } from "@/components/ProgressHeader";
import { QuizQuestion } from "@/components/QuizQuestion";
import { QUESTIONS } from "@/lib/questions";
import { computeSegment } from "@/lib/scoring";
import {
  saveQuizProgress,
  loadQuizProgress,
  clearQuizProgress,
} from "@/lib/storage";
import { trackQuizStep, trackQuizCompleted } from "@/lib/analytics";
import { ArrowLeft, ArrowRight, Save } from "lucide-react";

export function QuizStepper() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Record<string, string | string[]>>({
    defaultValues: {},
  });

  // Carregar progresso salvo
  useEffect(() => {
    const savedProgress = loadQuizProgress();
    if (savedProgress) {
      setCurrentStep(savedProgress.currentStep);
      Object.entries(savedProgress.answers).forEach(([key, value]) => {
        setValue(key, value);
      });
    }
  }, [setValue]);

  // Salvar progresso automaticamente
  const answers = watch();
  useEffect(() => {
    const saveProgress = () => {
      saveQuizProgress({
        currentStep,
        answers,
        startedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      });
    };

    const timeoutId = setTimeout(saveProgress, 1000);
    return () => clearTimeout(timeoutId);
  }, [currentStep, answers]);

  const currentQuestion = QUESTIONS[currentStep];
  const currentAnswer = answers[currentQuestion.id];

  // Perguntas opcionais podem ser puladas
  const isAnswered =
    !currentQuestion.required ||
    (currentAnswer !== undefined &&
      currentAnswer !== "" &&
      (Array.isArray(currentAnswer) ? currentAnswer.length > 0 : true));

  const handleNext = () => {
    // Perguntas opcionais podem ser puladas
    if (!isAnswered && currentQuestion.required) return;

    // Track step
    trackQuizStep(currentStep + 1, QUESTIONS.length);

    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // Última pergunta - calcular resultado
      handleFinish();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSaveAndContinueLater = () => {
    saveQuizProgress({
      currentStep,
      answers,
      startedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    });

    alert(
      "Progresso salvo! Você pode voltar mais tarde e continuar de onde parou."
    );
  };

  const handleFinish = async () => {
    setIsSubmitting(true);

    try {
      const result = computeSegment(answers);

      // Track conclusão
      trackQuizCompleted(
        result.segment,
        result.totalScore,
        JSON.stringify(answers).substring(0, 50)
      );

      // Limpar progresso salvo
      clearQuizProgress();

      // Redirecionar para resultado com segmento
      router.push(`/quiz/resultado?seg=${result.segment}`);
    } catch (error) {
      console.error("Error finishing quiz:", error);
      alert("Erro ao processar resultado. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const errorMessage = errors[currentQuestion.id]?.message as
    | string
    | undefined;

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8">
      <Card className="border-2">
        <CardContent className="pt-6 space-y-6">
          <ProgressHeader
            currentStep={currentStep + 1}
            totalSteps={QUESTIONS.length}
          />

          <div className="min-h-[400px] flex items-start justify-center py-8">
            <QuizQuestion
              question={currentQuestion}
              control={control}
              error={errorMessage}
            />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={handleSaveAndContinueLater}
              className="gap-2"
              title="Salvar e continuar depois"
            >
              <Save className="w-4 h-4" />
              <span className="hidden sm:inline">Salvar</span>
            </Button>
          </div>

          <Button
            type="button"
            onClick={handleNext}
            disabled={!isAnswered || isSubmitting}
            size="lg"
            className="gap-2 w-full sm:w-auto"
          >
            {currentStep === QUESTIONS.length - 1 ? (
              isSubmitting ? (
                "Processando..."
              ) : (
                "Ver meu resultado"
              )
            ) : (
              <>
                {!currentQuestion.required && !isAnswered ? "Pular" : "Próximo"}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Keyboard navigation hint */}
      <p className="text-center text-xs text-muted-foreground mt-4">
        Dica: Use as setas do teclado para navegar (após responder)
      </p>
    </div>
  );
}
