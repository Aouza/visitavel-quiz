/**
 * @file: QuizQuestion.tsx
 * @responsibility: Renderização individual de pergunta do quiz
 */

"use client";

import { Controller, Control } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { type Question } from "@/lib/questions";

interface QuizQuestionProps {
  question: Question;
  control: Control<Record<string, string | string[]>>;
  error?: string;
}

export function QuizQuestion({ question, control, error }: QuizQuestionProps) {
  return (
    <div className="space-y-8 w-full">
      <div className="space-y-4">
        <h2 className="text-2xl md:text-3xl font-semibold leading-tight text-slate-900">
          {question.title}
        </h2>
        {question.helper && (
          <p className="text-base text-slate-600 leading-relaxed">
            {question.helper}
          </p>
        )}
        {!question.required && (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200">
            <span className="text-xs text-slate-600">
              💡 Opcional - pode pular se preferir
            </span>
          </div>
        )}
      </div>

      <Controller
        name={question.id}
        control={control}
        rules={{ required: question.required }}
        render={({ field }) => {
          // Date input
          if (question.type === "date") {
            return (
              <div className="space-y-3">
                <Input
                  type="date"
                  value={field.value as string}
                  onChange={field.onChange}
                  max={new Date().toISOString().split("T")[0]}
                  className="max-w-md h-14 text-base rounded-2xl border-slate-300 focus:border-slate-900 focus:ring-slate-900"
                  aria-label={question.title}
                />
              </div>
            );
          }

          // Single choice (Radio)
          if (question.type === "single" || question.type === "likert") {
            return (
              <RadioGroup
                value={field.value as string}
                onValueChange={(value) => {
                  console.log(
                    `✅ RadioGroup onChange: ${question.id} = ${value}`
                  );
                  field.onChange(value);

                  // Forçar sincronização imediata
                  setTimeout(() => {
                    const event = new CustomEvent("quizAnswer", {
                      detail: { questionId: question.id, value },
                    });
                    window.dispatchEvent(event);
                  }, 0);
                }}
                className="space-y-3"
                aria-label={question.title}
              >
                {question.options.map((option) => (
                  <label
                    key={option.value}
                    htmlFor={`${question.id}-${option.value}`}
                    className="flex items-center gap-4 p-5 rounded-2xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    <RadioGroupItem
                      value={option.value}
                      id={`${question.id}-${option.value}`}
                      className="flex-shrink-0"
                    />
                    <span className="flex-1 text-base text-slate-700">
                      {option.label}
                    </span>
                  </label>
                ))}
              </RadioGroup>
            );
          }

          // Multiple choice (Checkbox)
          if (question.type === "multi") {
            const values = (field.value as string[]) || [];

            return (
              <div
                className="space-y-3"
                role="group"
                aria-label={question.title}
              >
                {question.options.map((option) => {
                  const isChecked = values.includes(option.value);

                  return (
                    <label
                      key={option.value}
                      htmlFor={`${question.id}-${option.value}`}
                      className="flex items-center gap-4 p-5 rounded-2xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all cursor-pointer"
                    >
                      <Checkbox
                        id={`${question.id}-${option.value}`}
                        checked={isChecked}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            field.onChange([...values, option.value]);
                          } else {
                            field.onChange(
                              values.filter((v) => v !== option.value)
                            );
                          }
                        }}
                        className="flex-shrink-0"
                      />
                      <span className="flex-1 text-base text-slate-700">
                        {option.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            );
          }

          // Boolean (Yes/No as Radio)
          if (question.type === "boolean") {
            return (
              <RadioGroup
                value={field.value as string}
                onValueChange={field.onChange}
                className="space-y-3"
                aria-label={question.title}
              >
                {question.options.map((option) => (
                  <label
                    key={option.value}
                    htmlFor={`${question.id}-${option.value}`}
                    className="flex items-center gap-4 p-5 rounded-2xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    <RadioGroupItem
                      value={option.value}
                      id={`${question.id}-${option.value}`}
                      className="flex-shrink-0"
                    />
                    <span className="flex-1 text-base text-slate-700">
                      {option.label}
                    </span>
                  </label>
                ))}
              </RadioGroup>
            );
          }

          // Fallback for unsupported question types
          return <div>Unsupported question type</div>;
        }}
      />

      {error && (
        <div className="flex items-center gap-2 p-4 rounded-2xl bg-red-50 border border-red-200">
          <span className="text-sm text-red-700" role="alert">
            ⚠️ {error}
          </span>
        </div>
      )}
    </div>
  );
}
