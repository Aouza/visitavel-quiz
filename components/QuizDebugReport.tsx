/**
 * @file: QuizDebugReport.tsx
 * @responsibility: Componente de debug para análise detalhada das respostas do quiz
 */

"use client";

import { useState } from "react";
import { QUESTIONS, type Segment } from "@/lib/questions";
import { ChevronDown, ChevronUp } from "lucide-react";

interface QuizDebugReportProps {
  answers: Record<string, string | string[]>;
  scores: Record<Segment, number>;
  segment: Segment;
}

export function QuizDebugReport({
  answers,
  scores,
  segment,
}: QuizDebugReportProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-lg shadow-lg hover:bg-slate-800 transition"
        >
          🐛 Debug Report
          <ChevronUp className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Calcular total de pontos
  const totalScore = Object.values(scores).reduce(
    (sum, score) => sum + score,
    0
  );

  // Ordenar segmentos por pontuação
  const sortedSegments = Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .map(([seg, score]) => ({ segment: seg as Segment, score }));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm">
      <div className="min-h-screen flex items-start justify-center p-4 pt-20">
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                🐛 Relatório de Debug - Quiz
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Análise completa das respostas e cálculo de scores
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-200 transition"
            >
              Fechar
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Scores Summary */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-slate-900">
                📊 Resultado Final
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <p className="text-sm text-emerald-700 font-medium">
                    Segmento Identificado
                  </p>
                  <p className="text-2xl font-bold text-emerald-900 mt-1 capitalize">
                    {segment}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                  <p className="text-sm text-slate-600 font-medium">
                    Pontuação Total
                  </p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {totalScore} pontos
                  </p>
                </div>
              </div>
            </div>

            {/* Scores Breakdown */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-slate-900">
                🎯 Pontuação por Segmento
              </h3>
              <div className="space-y-2">
                {sortedSegments.map(({ segment: seg, score }, index) => {
                  const percentage =
                    totalScore > 0 ? (score / totalScore) * 100 : 0;
                  const isWinner = seg === segment;

                  return (
                    <div
                      key={seg}
                      className={`p-4 rounded-lg border ${
                        isWinner
                          ? "bg-emerald-50 border-emerald-300"
                          : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {index === 0 && <span className="text-lg">🏆</span>}
                          <span
                            className={`font-semibold capitalize ${
                              isWinner ? "text-emerald-900" : "text-slate-900"
                            }`}
                          >
                            {seg}
                          </span>
                          {isWinner && (
                            <span className="px-2 py-0.5 bg-emerald-200 text-emerald-800 text-xs font-bold rounded-full">
                              VENCEDOR
                            </span>
                          )}
                        </div>
                        <span
                          className={`text-sm font-bold ${
                            isWinner ? "text-emerald-900" : "text-slate-700"
                          }`}
                        >
                          {score} pts ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            isWinner ? "bg-emerald-600" : "bg-slate-400"
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Detailed Answers */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-slate-900">
                📝 Respostas Detalhadas
              </h3>
              <div className="space-y-3">
                {QUESTIONS.filter((q) => q.mapTo).map((question) => {
                  const answer = answers[question.id];
                  const answerValue = Array.isArray(answer)
                    ? answer[0]
                    : answer;
                  const selectedOption = question.options.find(
                    (opt) => opt.value === answerValue
                  );
                  const weight = selectedOption?.weight ?? 0;

                  return (
                    <div
                      key={question.id}
                      className="p-4 bg-slate-50 border border-slate-200 rounded-lg"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-900 mb-2">
                            {question.title}
                          </p>
                          <p className="text-sm text-slate-700">
                            <span className="font-medium">Resposta:</span>{" "}
                            {selectedOption?.label || "Não respondida"}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              weight === 0
                                ? "bg-green-100 text-green-800"
                                : weight === 1
                                ? "bg-yellow-100 text-yellow-800"
                                : weight === 2
                                ? "bg-orange-100 text-orange-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {weight} pts
                          </span>
                          <span className="px-2 py-1 bg-slate-200 text-slate-700 text-xs font-medium rounded capitalize">
                            → {question.mapTo}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Legenda */}
            <div className="p-4 bg-slate-100 border border-slate-200 rounded-lg">
              <p className="text-xs text-slate-600 font-semibold mb-2">
                📌 Como funciona:
              </p>
              <ul className="text-xs text-slate-600 space-y-1">
                <li>
                  • Cada resposta tem um <strong>peso</strong> (0-3 pontos)
                </li>
                <li>
                  • Perguntas são mapeadas para um <strong>segmento</strong>{" "}
                  específico
                </li>
                <li>• Os pontos são somados por segmento</li>
                <li>
                  • O segmento com <strong>mais pontos</strong> vence
                </li>
                <li>
                  • Em caso de empate, segue prioridade: devastacao →
                  abstinencia → interiorizacao → ira → superacao
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
