/**
 * @file: report-free.ts
 * @responsibility: Schema do relatório de entendimento profundo (pós-término)
 * Cruza: signo (sem citar) + respostas do quiz + período + scores
 * Linguagem: direta, brasileira, zero floreio
 * Objetivo: entendimento profundo (não tarefas/planos)
 */

export interface Evidence {
  questionId: string;
  answerLabel: string;
}

export interface StageSignal {
  signal: string;
  evidence: Evidence[];
}

export interface ReportFreePayload {
  header: {
    title: string;
    subtitle: string;
    segment: string;
  };

  intro: string;
  one_liner: string;
  stage_confidence: number;
  stage_signals: StageSignal[];

  personProfile: string[];
  personProfile_evidences: Evidence[];

  relationshipOverview: string[];
  relationshipOverview_evidences: Evidence[];

  currentFeelings: {
    mind: string[];
    body: string[];
    heart: string[];
  };
  currentFeelings_evidences: Evidence[];

  whyCantMoveOn: string[];
  whyCantMoveOn_evidences: Evidence[];

  currentStage: {
    name: string;
    description: string[];
  };
  currentStage_evidences: Evidence[];

  rootCause: string[];
  rootCause_evidences: Evidence[];

  unresolvedPoints: string[];

  learning: string[];
  learning_evidences: Evidence[];

  compatibility?: {
    connection: string[];
    strengths: string[];
    frictions: string[];
    distancing: string[];
  };

  nextStepHint: {
    summary: string;
    why_full_report: string;
  };

  closing_archetype: string;
}
