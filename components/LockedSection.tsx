/**
 * @file: LockedSection.tsx
 * @responsibility: Seção bloqueada com preview para criar desejo
 */

"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Lock } from "lucide-react";
import { ReactNode } from "react";

interface LockedSectionProps {
  icon: ReactNode;
  title: string;
  preview: string;
  isLocked?: boolean;
}

export function LockedSection({
  icon,
  title,
  preview,
  isLocked = true,
}: LockedSectionProps) {
  return (
    <Card
      className={`relative overflow-hidden border-2 transition-all hover:shadow-md ${
        isLocked ? "opacity-90" : ""
      }`}
    >
      <CardContent className="pt-6 pb-6">
        <div className="flex items-start gap-4">
          <div className="text-4xl flex-shrink-0">{icon}</div>
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg">{title}</h3>
              {isLocked && <Lock className="w-4 h-4 text-muted-foreground" />}
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {preview}
            </p>
            {isLocked && (
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background flex items-end justify-center pb-4">
                <div className="text-xs font-medium text-primary flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  Conteúdo disponível no relatório completo
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
