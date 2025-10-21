/**
 * @file: StrategicResultCard.tsx
 * @responsibility: Card de resultado estratégico que gera desejo
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { type Segment } from "@/lib/questions";
import { getSegmentContent } from "@/lib/segments";
import { LockedSection } from "@/components/LockedSection";
import {
  Lock,
  Sparkles,
  TrendingUp,
  Heart,
  Target,
  BookOpen,
  Zap,
} from "lucide-react";

interface StrategicResultCardProps {
  segment: Segment;
  onPrimaryAction: () => void;
}

export function StrategicResultCard({
  segment,
  onPrimaryAction,
}: StrategicResultCardProps) {
  const content = getSegmentContent(segment);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Resultado Inicial - Resumo Breve */}
      <Card className="border-2 bg-gradient-to-br from-background to-muted/20">
        <CardHeader className="text-center space-y-4 pb-6">
          <div className="mx-auto text-7xl animate-pulse">{content.icon}</div>
          <CardTitle className={`text-3xl md:text-4xl ${content.color}`}>
            {content.headline}
          </CardTitle>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {content.description}
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Resumo Inicial - Apenas 2 pontos principais */}
          <div className="bg-background rounded-lg p-6 border-2 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-lg">
                Resumo do Seu Momento Atual
              </h3>
            </div>
            <ul className="space-y-3">
              {content.bullets.slice(0, 2).map((bullet, index) => (
                <li key={index} className="flex items-start gap-3 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <span className="leading-relaxed">{bullet}</span>
                </li>
              ))}
            </ul>

            {/* Indicador de mais conteúdo */}
            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-2">
                <Lock className="w-3 h-3" />
                Mais {content.bullets.length - 2} insights importantes no
                relatório completo
              </p>
            </div>
          </div>

          {/* CTA Principal - Destaque */}
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-lg p-6 border-2 border-primary/20 space-y-4">
            <div className="text-center space-y-2">
              <p className="text-sm font-semibold text-primary flex items-center justify-center gap-2">
                <Zap className="w-4 h-4" />
                Desbloqueie o Relatório Completo Agora
              </p>
              <p className="text-xs text-muted-foreground">
                Análise profunda + Plano de ação personalizado + Kit
                Anti-Recaída
              </p>
            </div>
            <Button
              size="lg"
              className="w-full text-base font-semibold shadow-lg hover:shadow-xl transition-all"
              onClick={onPrimaryAction}
            >
              Ver Relatório Completo e Acessar o Kit
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Seções Bloqueadas - Preview do Conteúdo */}
      <div className="space-y-4">
        <div className="text-center space-y-2 py-6">
          <h2 className="text-2xl font-bold">
            Veja o que você vai descobrir no relatório completo
          </h2>
          <p className="text-muted-foreground text-sm">
            Conteúdo personalizado baseado nas suas respostas
          </p>
        </div>

        <LockedSection
          icon={<Target className="w-10 h-10 text-blue-500" />}
          title="Análise Profunda do Seu Estado Emocional"
          preview="Descubra exatamente onde você está no processo de superação, quais padrões emocionais estão te mantendo preso(a) e por que você reage de determinadas formas..."
          isLocked={true}
        />

        <LockedSection
          icon={<Heart className="w-10 h-10 text-rose-500" />}
          title="Pontos de Atenção Críticos"
          preview="Os 4-5 aspectos específicos que podem estar sabotando sua recuperação e que precisam de atenção URGENTE para evitar recaídas emocionais..."
          isLocked={true}
        />

        <LockedSection
          icon={<TrendingUp className="w-10 h-10 text-green-500" />}
          title="Seus Recursos Internos Identificados"
          preview="Forças e características positivas que você JÁ possui e pode usar a seu favor agora. Você tem mais poder do que imagina..."
          isLocked={true}
        />

        <LockedSection
          icon={<BookOpen className="w-10 h-10 text-amber-500" />}
          title="Plano de Ação Personalizado (7 Passos)"
          preview="Ações práticas e específicas que você pode começar HOJE para acelerar sua recuperação. Cada passo foi criado baseado no SEU perfil..."
          isLocked={true}
        />

        <LockedSection
          icon={<Sparkles className="w-10 h-10 text-purple-500" />}
          title="Kit Anti-Recaída Completo"
          preview="Ferramentas, exercícios e estratégias comprovadas para lidar com momentos de fraqueza, impulsos de contato e gatilhos emocionais..."
          isLocked={true}
        />
      </div>

      {/* CTA Final - Reforço */}
      <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-background">
        <CardContent className="pt-8 pb-8 text-center space-y-4">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold">
              Pronto(a) para sua transformação completa?
            </h3>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Milhares de pessoas já usaram nosso método para superar términos
              dolorosos e reconstruir suas vidas. Agora é a sua vez.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button
              size="lg"
              className="w-full sm:w-auto text-base font-semibold px-8"
              onClick={onPrimaryAction}
            >
              Quero Meu Relatório Completo Agora
            </Button>
          </div>

          <div className="pt-4 space-y-1">
            <p className="text-xs text-muted-foreground">
              ✓ Acesso imediato ao relatório completo
            </p>
            <p className="text-xs text-muted-foreground">
              ✓ Kit Anti-Recaída com ferramentas práticas
            </p>
            <p className="text-xs text-muted-foreground">
              ✓ Suporte especializado para sua jornada
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
