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
    <div className="relative w-full bg-gradient-to-br from-slate-50 via-white to-slate-50 min-h-screen">
      <div className="w-full max-w-3xl mx-auto px-4 py-12 md:py-16">
        {/* Progress Header */}
        <div className="mb-12">
          <ProgressHeader
            currentStep={currentStep + 1}
            totalSteps={QUESTIONS.length}
          />
        </div>

        {/* Question Card */}
        <div className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm mb-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.04),_transparent_70%)]" />
          <div className="relative px-6 md:px-10 py-10 md:py-12 min-h-[400px]">
            <QuizQuestion
              question={currentQuestion}
              control={control}
              error={errorMessage}
            />
          </div>
        </div>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="flex gap-3 order-2 sm:order-1">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 border border-slate-300 rounded-full hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </button>

            <button
              type="button"
              onClick={handleSaveAndContinueLater}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-full transition"
              title="Salvar progresso"
            >
              <Save className="w-4 h-4" />
              <span className="hidden sm:inline">Salvar</span>
            </button>
          </div>

          <Button
            type="button"
            onClick={handleNext}
            disabled={!isAnswered || isSubmitting}
            className="inline-flex items-center gap-3 rounded-full bg-slate-900 px-8 py-6 text-base font-semibold text-white transition hover:bg-slate-800 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto order-1 sm:order-2"
          >
            {currentStep === QUESTIONS.length - 1 ? (
              isSubmitting ? (
                "Processando..."
              ) : (
                <>
                  Ver meu resultado
                  <ArrowRight className="w-5 h-5" />
                </>
              )
            ) : (
              <>
                {!currentQuestion.required && !isAnswered ? "Pular" : "Próxima"}
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </Button>
        </div>

        {/* Hint */}
        <p className="text-center text-xs text-slate-400 mt-6">
          💡 Seu progresso é salvo automaticamente
        </p>
      </div>
    </div>
  );
}
