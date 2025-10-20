/**
 * @file: ResultCard.tsx
 * @responsibility: Card de resultado do quiz
 */

"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { type Segment } from "@/lib/questions";
import { getSegmentContent } from "@/lib/segments";
import { Check } from "lucide-react";

interface ResultCardProps {
  segment: Segment;
  onPrimaryAction: () => void;
  onSecondaryAction: () => void;
}

export function ResultCard({
  segment,
  onPrimaryAction,
  onSecondaryAction,
}: ResultCardProps) {
  const content = getSegmentContent(segment);

  return (
    <Card className="w-full max-w-3xl mx-auto border-2">
      <CardHeader className="text-center space-y-4 pb-4">
        <div className="mx-auto text-6xl">{content.icon}</div>
        <CardTitle className={`text-3xl ${content.color}`}>
          {content.headline}
        </CardTitle>
        <CardDescription className="text-base">
          {content.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="bg-muted/50 rounded-lg p-6 space-y-3">
          <h3 className="font-semibold text-lg mb-4">
            O que isso significa para você:
          </h3>
          <ul className="space-y-3">
            {content.bullets.map((bullet, index) => (
              <li key={index} className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm leading-relaxed">{bullet}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t pt-6 space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Este resumo é gratuito. Para o relatório completo com ações guiadas
            + Kit Anti-Recaída personalizado, veja a continuação abaixo.
          </p>

          <div className="flex flex-col gap-3">
            <Button
              size="lg"
              className="w-full text-base"
              onClick={onPrimaryAction}
            >
              {content.ctaPrimary}
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="w-full"
              onClick={onSecondaryAction}
            >
              {content.ctaSecondary}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
