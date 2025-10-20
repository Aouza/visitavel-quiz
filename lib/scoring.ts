/**
 * @file: scoring.ts
 * @responsibility: Cálculo de score e segmentação do quiz
 * @exports: computeSegment, Segment
 */

import { QUESTIONS, type Segment } from "./questions";

export type SegmentScores = Record<Segment, number>;

export interface QuizResult {
  segment: Segment;
  scores: SegmentScores;
  totalScore: number;
}

const SEGMENT_PRIORITY: Segment[] = [
  "devastacao",
  "abstinencia",
  "interiorizacao",
  "ira",
  "superacao",
];

export function computeSegment(
  answers: Record<string, string | string[]>
): QuizResult {
  const scores: SegmentScores = {
    devastacao: 0,
    abstinencia: 0,
    interiorizacao: 0,
    ira: 0,
    superacao: 0,
  };

  let totalScore = 0;

  // Calcular pontuação por categoria
  QUESTIONS.forEach((question) => {
    const answer = answers[question.id];
    if (!answer || !question.mapTo) return;

    const answerValue = Array.isArray(answer) ? answer[0] : answer;
    const selectedOption = question.options.find(
      (opt) => opt.value === answerValue
    );

    if (selectedOption && selectedOption.weight !== undefined) {
      scores[question.mapTo] += selectedOption.weight;
      totalScore += selectedOption.weight;
    }
  });

  // Encontrar segmento com maior pontuação
  // Em caso de empate, usar prioridade
  let maxScore = -1;
  let primarySegment: Segment = "superacao";

  SEGMENT_PRIORITY.forEach((segment) => {
    if (scores[segment] > maxScore) {
      maxScore = scores[segment];
      primarySegment = segment;
    }
  });

  return {
    segment: primarySegment,
    scores,
    totalScore,
  };
}

export function getSegmentPercentages(
  scores: SegmentScores
): Record<Segment, number> {
  const total = Object.values(scores).reduce((sum, score) => sum + score, 0);

  if (total === 0) {
    return {
      devastacao: 0,
      abstinencia: 0,
      interiorizacao: 0,
      ira: 0,
      superacao: 0,
    };
  }

  return {
    devastacao: Math.round((scores.devastacao / total) * 100),
    abstinencia: Math.round((scores.abstinencia / total) * 100),
    interiorizacao: Math.round((scores.interiorizacao / total) * 100),
    ira: Math.round((scores.ira / total) * 100),
    superacao: Math.round((scores.superacao / total) * 100),
  };
}
