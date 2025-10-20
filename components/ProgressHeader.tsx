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
    <div className="w-full space-y-2">
      <div className="flex justify-between items-center text-sm">
        <span className="font-medium text-muted-foreground">
          Pergunta {currentStep} de {totalSteps}
        </span>
        <span className="font-medium text-primary">
          {Math.round(progress)}%
        </span>
      </div>
      <Progress
        value={progress}
        className="h-2"
        aria-label={`Progresso: ${Math.round(progress)}%`}
      />
    </div>
  );
}
