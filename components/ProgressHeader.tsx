/**
 * @file: ProgressHeader.tsx
 * @responsibility: Cabeçalho com barra de progresso do quiz
 */

"use client";

import { Progress } from "@/components/ui/progress";

interface ProgressHeaderProps {
  currentStep: number;
  totalSteps: number;
}

export function ProgressHeader({
  currentStep,
  totalSteps,
}: ProgressHeaderProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center gap-3 text-xs uppercase tracking-[0.35em] text-slate-400">
        <span className="h-px w-12 bg-slate-200" />
        Diagnóstico emocional
      </div>

      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-slate-600">
          Pergunta {currentStep} de {totalSteps}
        </span>
        <span className="text-sm font-semibold text-slate-900">
          {Math.round(progress)}%
        </span>
      </div>

      <div className="relative w-full h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full bg-slate-900 transition-all duration-500 ease-out rounded-full"
          style={{ width: `${progress}%` }}
          aria-label={`Progresso: ${Math.round(progress)}%`}
        />
      </div>
    </div>
  );
}
