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
    <div className="space-y-4 w-full">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold leading-tight">
          {question.title}
        </h2>
        {question.helper && (
          <p className="text-sm text-muted-foreground">{question.helper}</p>
        )}
        {!question.required && (
          <p className="text-xs text-muted-foreground italic">
            Esta pergunta é opcional - você pode pular se preferir
          </p>
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
                  className="max-w-md"
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
                onValueChange={field.onChange}
                className="space-y-3"
                aria-label={question.title}
              >
                {question.options.map((option) => (
                  <div
                    key={option.value}
                    className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-accent transition-colors cursor-pointer"
                  >
                    <RadioGroupItem
                      value={option.value}
                      id={`${question.id}-${option.value}`}
                    />
                    <Label
                      htmlFor={`${question.id}-${option.value}`}
                      className="flex-1 cursor-pointer font-normal"
                    >
                      {option.label}
                    </Label>
                  </div>
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
                    <div
                      key={option.value}
                      className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-accent transition-colors"
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
                      />
                      <Label
                        htmlFor={`${question.id}-${option.value}`}
                        className="flex-1 cursor-pointer font-normal"
                      >
                        {option.label}
                      </Label>
                    </div>
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
                  <div
                    key={option.value}
                    className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-accent transition-colors cursor-pointer"
                  >
                    <RadioGroupItem
                      value={option.value}
                      id={`${question.id}-${option.value}`}
                    />
                    <Label
                      htmlFor={`${question.id}-${option.value}`}
                      className="flex-1 cursor-pointer font-normal"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            );
          }

          // Fallback for unsupported question types
          return <div>Unsupported question type</div>;
        }}
      />

      {error && (
        <p className="text-sm text-red-600 mt-2" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
