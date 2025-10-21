/**
 * @file: ModernResultCard.tsx
 * @responsibility: Card de resultado moderno com UI que encanta
 */

"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { type Segment } from "@/lib/questions";
import { getSegmentContent } from "@/lib/segments";
import { Lock, Sparkles, ArrowRight, Check } from "lucide-react";

interface ModernResultCardProps {
  segment: Segment;
  onPrimaryAction: () => void;
}

export function ModernResultCard({
  segment,
  onPrimaryAction,
}: ModernResultCardProps) {
  const content = getSegmentContent(segment);

  return (
    <div className="relative w-full max-w-6xl mx-auto">
      {/* Background decorativo com gradiente animado */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-pink-200/40 via-purple-200/40 to-blue-200/40 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-amber-200/40 via-rose-200/40 to-purple-200/40 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-6 py-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-white/20 shadow-lg">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-medium text-gray-700">
              Seu Resultado Está Pronto
            </span>
          </div>

          <div className="space-y-4">
            <div className="text-8xl animate-bounce-slow">{content.icon}</div>
            <h1
              className={`text-5xl md:text-6xl font-bold ${content.color} tracking-tight`}
            >
              {content.headline}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {content.description}
            </p>
          </div>
        </div>

        {/* Resumo com Glassmorphism */}
        <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-500">
          <CardContent className="p-8 md:p-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Resumo do Seu Momento
                </h2>
                <p className="text-sm text-gray-500">
                  Insights principais identificados
                </p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              {content.bullets.slice(0, 2).map((bullet, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-4 bg-gradient-to-r from-white/80 to-white/40 backdrop-blur-sm rounded-2xl border border-white/30 hover:scale-[1.02] transition-transform duration-300"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-gray-700 leading-relaxed pt-1">{bullet}</p>
                </div>
              ))}
            </div>

            {/* Indicador de conteúdo bloqueado */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-white/90 backdrop-blur-sm rounded-2xl" />
              <div className="relative p-6 text-center space-y-3">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-lg">
                  <Lock className="w-4 h-4 text-white" />
                  <span className="text-sm font-semibold text-white">
                    +{content.bullets.length - 2} Insights Bloqueados
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Desbloqueie análise completa + plano de ação personalizado
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Principal com destaque */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-500" />
          <Card className="relative bg-gradient-to-br from-purple-600 via-pink-600 to-rose-600 border-0 shadow-2xl hover:shadow-3xl transition-all duration-500">
            <CardContent className="p-8 md:p-12 text-center text-white space-y-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm font-semibold">Oferta Especial</span>
                </div>
                <h3 className="text-3xl md:text-4xl font-bold">
                  Desbloqueie Seu Relatório Completo
                </h3>
                <p className="text-white/90 max-w-2xl mx-auto">
                  Análise profunda + Plano de ação em 7 passos + Kit
                  Anti-Recaída + Suporte especializado
                </p>
              </div>

              <Button
                size="lg"
                onClick={onPrimaryAction}
                className="bg-white text-purple-600 hover:bg-gray-50 font-bold text-lg px-12 py-7 rounded-2xl shadow-xl hover:scale-105 transition-transform duration-300 group"
              >
                Acessar Relatório Completo
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>

              <div className="flex flex-wrap justify-center gap-6 pt-4">
                {[
                  "✓ Acesso Imediato",
                  "✓ 100% Personalizado",
                  "✓ Suporte Incluso",
                ].map((item, i) => (
                  <span key={i} className="text-sm text-white/90 font-medium">
                    {item}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview das seções bloqueadas */}
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              O Que Você Vai Descobrir
            </h2>
            <p className="text-gray-600">
              Conteúdo exclusivo baseado nas suas respostas
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: "🎯",
                title: "Análise Profunda",
                preview: "Estado emocional completo, padrões identificados...",
                color: "from-blue-500 to-cyan-500",
              },
              {
                icon: "❤️",
                title: "Pontos Críticos",
                preview: "Aspectos que podem sabotar sua recuperação...",
                color: "from-rose-500 to-pink-500",
              },
              {
                icon: "📈",
                title: "Seus Recursos",
                preview: "Forças internas que você já possui...",
                color: "from-green-500 to-emerald-500",
              },
              {
                icon: "📖",
                title: "Plano de 7 Passos",
                preview: "Ações práticas para começar hoje...",
                color: "from-amber-500 to-orange-500",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="group relative bg-white/60 backdrop-blur-sm rounded-3xl p-6 border border-white/20 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-10 rounded-full blur-2xl transition-opacity duration-500 group-hover:opacity-20" />

                <div className="relative space-y-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={`text-4xl p-3 bg-gradient-to-br ${item.color} rounded-2xl shadow-lg`}
                    >
                      <span className="filter drop-shadow-lg">{item.icon}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900">
                        {item.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Lock className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">Bloqueado</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {item.preview}
                  </p>

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/80 pointer-events-none" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Final */}
        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 text-white border-0 shadow-2xl">
          <CardContent className="p-8 md:p-12 text-center space-y-6">
            <h3 className="text-3xl md:text-4xl font-bold">
              Pronto Para Sua Transformação?
            </h3>
            <p className="text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Mais de 10.000 pessoas já superaram términos dolorosos com nosso
              método. Agora é a sua vez de reconstruir sua vida.
            </p>
            <Button
              size="lg"
              onClick={onPrimaryAction}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 font-bold text-lg px-12 py-7 rounded-2xl shadow-xl hover:scale-105 transition-transform duration-300"
            >
              Começar Minha Transformação Agora
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
