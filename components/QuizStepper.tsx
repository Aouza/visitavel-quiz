/**
 * @file: QuizStepper.tsx
 * @responsibility: Componente principal do quiz multi-step
 */

"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ProgressHeader } from "@/components/ProgressHeader";
import { QuizQuestion } from "@/components/QuizQuestion";
import { QUESTIONS, type Option } from "@/lib/questions";
import { computeSegment } from "@/lib/scoring";
import {
  saveQuizProgress,
  loadQuizProgress,
  clearQuizProgress,
  saveQuizResult,
} from "@/lib/storage";
import { trackQuizCompleted, trackQuizStarted } from "@/lib/analytics";
import { trackMetaEventOnce } from "@/lib/track-meta-deduplicated";
import { ArrowLeft, ArrowRight, Save } from "lucide-react";
import { getLeadInfo } from "@/lib/storage";

const extractEmojiFromOption = (option?: Option) => {
  if (!option) return undefined;
  if (option.emoji) return option.emoji;
  const [firstToken] = option.label.trim().split(" ");
  if (!firstToken || /[a-zA-Z0-9]/.test(firstToken)) {
    return undefined;
  }
  return firstToken;
};

export function QuizStepper() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estado local para capturar respostas
  const [localAnswers, setLocalAnswers] = useState<
    Record<string, string | string[]>
  >({});

  // Criar defaultValues com todos os IDs das perguntas
  const defaultValues = useMemo(() => {
    const values: Record<string, string | string[]> = {};
    QUESTIONS.forEach((q) => {
      if (q.type === "multi") {
        values[q.id] = [];
      } else {
        values[q.id] = "";
      }
    });
    return values;
  }, []);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    register,
    formState: { errors },
  } = useForm<Record<string, string | string[]>>({
    defaultValues,
    mode: "all",
  });

  // Track quando o quiz REALMENTE inicia (primeira pergunta aparece)
  useEffect(() => {
    const leadInfo = getLeadInfo();
    const hasLead = !!leadInfo;

    // Track GA4
    trackQuizStarted(hasLead);

    // Track Meta - quiz_started (primeira pergunta apareceu)
    trackMetaEventOnce("quiz_started", {
      eventName: "quiz_started",
      customData: {
        has_lead: hasLead ? 1 : 0,
        total_questions: QUESTIONS.length,
      },
    });
  }, []); // Executa apenas uma vez quando o componente é montado

  // Registrar todos os campos uma única vez e carregar progresso salvo
  useEffect(() => {
    // Registrar todos os campos no formulário
    QUESTIONS.forEach((question) => {
      if (question.type === "multi") {
        register(question.id, { value: [] });
      } else {
        register(question.id, { value: "" });
      }
    });

    // Carregar progresso salvo
    const savedProgress = loadQuizProgress();
    if (savedProgress) {
      setCurrentStep(savedProgress.currentStep);
      setLocalAnswers(savedProgress.answers); // Carregar no estado local
      Object.entries(savedProgress.answers).forEach(([key, value]) => {
        setValue(key, value);
      });
    }
  }, [register, setValue]); // Removido currentStep da dependência

  // Não sincronizar automaticamente - usar getValues() quando necessário

  // Usar watch() para capturar todas as mudanças
  const allFormValues = watch();

  // Salvar progresso automaticamente usando estado local
  useEffect(() => {
    const saveProgress = () => {
      // Usar estado local que mantém as respostas
      const answersToSave =
        Object.keys(localAnswers).length > 0 ? localAnswers : allFormValues;

      saveQuizProgress({
        currentStep,
        answers: answersToSave,
        startedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      });
    };

    const timeoutId = setTimeout(saveProgress, 1000);
    return () => clearTimeout(timeoutId);
  }, [currentStep, localAnswers, allFormValues, getValues]);

  const currentQuestion = QUESTIONS[currentStep];
  const currentAnswer = watch(currentQuestion.id);

  // Sincronizar estado local com React Hook Form
  useEffect(() => {
    if (currentAnswer && currentAnswer !== "") {
      setLocalAnswers((prev) => ({
        ...prev,
        [currentQuestion.id]: currentAnswer,
      }));
      setValue(currentQuestion.id, currentAnswer);
    }
  }, [currentAnswer, currentQuestion.id, setValue]);

  // Escutar evento customizado do QuizQuestion
  useEffect(() => {
    const handleQuizAnswer = (event: CustomEvent) => {
      const { questionId, value } = event.detail;
      setLocalAnswers((prev) => ({
        ...prev,
        [questionId]: value,
      }));
    };

    window.addEventListener("quizAnswer", handleQuizAnswer as EventListener);
    return () => {
      window.removeEventListener(
        "quizAnswer",
        handleQuizAnswer as EventListener
      );
    };
  }, []);

  // Perguntas opcionais podem ser puladas
  const isAnswered =
    !currentQuestion.required ||
    (currentAnswer !== undefined &&
      currentAnswer !== "" &&
      (Array.isArray(currentAnswer) ? currentAnswer.length > 0 : true));

  const handleNext = handleSubmit(() => {
    // Perguntas opcionais podem ser puladas
    if (!isAnswered && currentQuestion.required) {
      return;
    }

    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // Última pergunta - calcular resultado
      handleFinish();
    }
  });

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSaveAndContinueLater = () => {
    const currentAnswers = getValues();
    saveQuizProgress({
      currentStep,
      answers: currentAnswers,
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
      // Usar estado local que mantém todas as respostas
      const currentAnswers =
        Object.keys(localAnswers).length > 0 ? localAnswers : getValues();

      // Criar payload detalhado para a API
      const detailedAnswers = QUESTIONS.map((question) => {
        const rawAnswer = currentAnswers[question.id];
        const answerValues = Array.isArray(rawAnswer)
          ? rawAnswer
          : rawAnswer
          ? [rawAnswer]
          : [];
        const matchedOptions = answerValues
          .map((value) => question.options.find((opt) => opt.value === value))
          .filter((opt): opt is Option => Boolean(opt));

        const answerLabel =
          matchedOptions.length > 0
            ? matchedOptions.map((opt) => opt.label).join(", ")
            : answerValues.length > 0
            ? answerValues.join(", ")
            : "Não respondida";

        const weight = matchedOptions.reduce(
          (total, option) => total + (option.weight ?? 0),
          0
        );

        const emoji =
          matchedOptions
            .map((option) => extractEmojiFromOption(option))
            .filter(Boolean)
            .join(" ") || "❓";

        const answerContent = Array.isArray(rawAnswer)
          ? rawAnswer.length > 0
            ? rawAnswer
            : "Não respondida"
          : typeof rawAnswer === "string" && rawAnswer.trim().length > 0
          ? rawAnswer
          : "Não respondida";

        return {
          questionId: question.id,
          question: question.title,
          answer: answerContent,
          answerLabel,
          weight,
          segment: question.mapTo ?? "general",
          emoji,
        };
      });

      const result = computeSegment(currentAnswers);

      // Salvar resultado final (mantém as respostas)
      saveQuizResult({
        segment: result.segment,
        answers: currentAnswers,
        detailedAnswers: detailedAnswers,
        scores: result.scores,
        completedAt: new Date().toISOString(),
      });

      // Track conclusão (GA4)
      trackQuizCompleted(
        result.segment,
        result.totalScore,
        JSON.stringify(currentAnswers).substring(0, 50)
      );

      // Track conclusão (Meta - quiz_complete) - proteção contra duplicação
      trackMetaEventOnce("quiz_complete", {
        eventName: "quiz_complete",
        customData: {
          segment: result.segment,
          score: result.totalScore,
        },
      });

      // Limpar progresso salvo (mas mantém o resultado)
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
      <div className="w-full max-w-3xl mx-auto px-3 md:px-8 py-4 md:py-8 lg:py-12">
        {/* Progress Header */}
        <div className="mb-6 md:mb-12">
          <ProgressHeader
            currentStep={currentStep + 1}
            totalSteps={QUESTIONS.length}
          />
        </div>

        {/* Question Card */}
        <div className="relative overflow-hidden rounded-2xl md:rounded-[32px] border border-slate-200 bg-white shadow-sm mb-6 md:mb-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.04),_transparent_70%)]" />
          <div className="relative px-5 md:px-8 lg:px-10 py-6 md:py-10 lg:py-12 min-h-[280px] md:min-h-[400px]">
            <QuizQuestion
              question={currentQuestion}
              control={control}
              error={errorMessage}
            />
          </div>
        </div>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-between items-stretch sm:items-center">
          <div className="flex gap-2 md:gap-3 order-2 sm:order-1">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="inline-flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 text-xs md:text-sm font-medium text-slate-700 border border-slate-300 rounded-full hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <ArrowLeft className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden sm:inline">Voltar</span>
            </button>

            <button
              type="button"
              onClick={handleSaveAndContinueLater}
              className="inline-flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 text-xs md:text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-full transition"
              title="Salvar progresso"
            >
              <Save className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden sm:inline">Salvar</span>
            </button>
          </div>

          <Button
            type="button"
            onClick={handleNext}
            disabled={!isAnswered || isSubmitting}
            className="inline-flex items-center justify-center gap-2 md:gap-3 rounded-full bg-slate-900 px-6 md:px-8 py-4 md:py-6 text-sm md:text-base font-semibold text-white transition hover:bg-slate-800 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto order-1 sm:order-2"
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
        <p className="text-center text-xs text-slate-400 mt-4 md:mt-6 px-2">
          💡 Seu progresso é salvo automaticamente
        </p>
      </div>
    </div>
  );
}
