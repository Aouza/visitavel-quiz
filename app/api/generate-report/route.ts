/**
 * @file: app/api/generate-report/route.ts
 * @responsibility: API route para gerar relatório personalizado com OpenAI
 * @exports: POST handler
 */

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { QUESTIONS, type Segment } from "@/lib/questions";
import { getSegmentContent } from "@/lib/segments";
import {
  getZodiacSign,
  getZodiacInsights,
  getCompatibilityInsights,
} from "@/lib/astrology";
import { ReportFreePayload } from "@/types/report-free";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface DetailedAnswer {
  questionId: string;
  question: string;
  answer: string | string[];
  answerLabel: string;
  weight: number;
  segment: string;
  emoji: string;
}

interface GenerateReportRequest {
  segment: Segment;
  answers: Record<string, string | string[]>;
  detailedAnswers?: DetailedAnswer[];
  scores: Record<Segment, number>;
  birthdate?: string;
  exBirthdate?: string;
}

// ===================== Helpers =====================

function safeLog(...args: any[]) {
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.log(...args);
  }
}

const TEMPO_FIM_TO_DAYS: Record<string, number> = {
  "0-7": 5,
  "8-30": 20,
  "31-90": 60,
  "90+": 120,
};

type SymptomFlags = {
  sleepDisruption: boolean;
  severeInsomnia: boolean;
  appetiteLoss: boolean;
  emotionalEating: boolean;
  frequentSocialChecks: boolean;
  compulsiveSocialChecks: boolean;
  impulseToContact: boolean;
  romanticizingPast: boolean;
  intenseAnger: boolean;
  heavyGuilt: boolean;
  futureFeelsImpossible: boolean;
  lowEnergy: boolean;
  closedToNewConnections: boolean;
};

const DEFAULT_FLAGS: SymptomFlags = {
  sleepDisruption: false,
  severeInsomnia: false,
  appetiteLoss: false,
  emotionalEating: false,
  frequentSocialChecks: false,
  compulsiveSocialChecks: false,
  impulseToContact: false,
  romanticizingPast: false,
  intenseAnger: false,
  heavyGuilt: false,
  futureFeelsImpossible: false,
  lowEnergy: false,
  closedToNewConnections: false,
};

function deriveDaysSinceBreakup(
  answers: Record<string, string | string[]>
): number | null {
  const raw = answers["tempo_fim"];
  if (!raw || Array.isArray(raw)) {
    return null;
  }
  return TEMPO_FIM_TO_DAYS[raw] ?? null;
}

function deriveSymptomFlags(
  answers: Record<string, string | string[]>
): SymptomFlags {
  const flags: SymptomFlags = { ...DEFAULT_FLAGS };

  const sleep = answers["sono"];
  if (typeof sleep === "string") {
    if (["dificuldade", "acordo", "insonia"].includes(sleep)) {
      flags.sleepDisruption = true;
    }
    if (sleep === "insonia") {
      flags.severeInsomnia = true;
    }
  }

  const appetite = answers["apetite"];
  if (typeof appetite === "string") {
    if (["diminuiu", "sem_apetite"].includes(appetite)) {
      flags.appetiteLoss = true;
    }
    if (appetite === "aumentou") {
      flags.emotionalEating = true;
    }
  }

  const checks = answers["checagens"];
  if (typeof checks === "string") {
    if (["1-2", "3-5", "6+"].includes(checks)) {
      flags.frequentSocialChecks = true;
    }
    if (["3-5", "6+"].includes(checks)) {
      flags.compulsiveSocialChecks = true;
    }
  }

  const impulse = answers["impulso_contato"];
  if (typeof impulse === "string") {
    if (["frequente", "constante"].includes(impulse)) {
      flags.impulseToContact = true;
    }
  }

  const idealization = answers["idealizacao"];
  if (typeof idealization === "string") {
    if (["bastante", "totalmente"].includes(idealization)) {
      flags.romanticizingPast = true;
    }
  }

  const anger = answers["raiva"];
  if (typeof anger === "string") {
    if (["moderada", "intensa"].includes(anger)) {
      flags.intenseAnger = true;
    }
  }

  const guilt = answers["culpa"];
  if (typeof guilt === "string") {
    if (["frequente", "totalmente"].includes(guilt)) {
      flags.heavyGuilt = true;
    }
  }

  const future = answers["futuro"];
  if (typeof future === "string") {
    if (["nao", "dificil"].includes(future)) {
      flags.futureFeelsImpossible = true;
    }
  }

  const activities = answers["atividades"];
  if (typeof activities === "string") {
    if (["nao", "forcando"].includes(activities)) {
      flags.lowEnergy = true;
    }
  }

  const newConnections = answers["novas_conexoes"];
  if (typeof newConnections === "string") {
    if (["nao", "ainda_nao"].includes(newConnections)) {
      flags.closedToNewConnections = true;
    }
  }

  return flags;
}

function insightToTraits(insight?: string | null): string[] {
  if (!insight) return [];
  return insight
    .split(/[.;]\s+/)
    .map((piece) => piece.replace(/\.$/, "").trim())
    .filter((piece) => piece.length > 0);
}

const NAME_KEYS = ["name", "nome", "firstName", "leadName"];

function deriveFirstName(answers: Record<string, string | string[]>): string {
  for (const key of NAME_KEYS) {
    const value = answers[key];
    if (typeof value === "string") {
      const cleaned = value.trim();
      if (cleaned) {
        const firstToken = cleaned.split(/\s+/)[0];
        return firstToken.charAt(0).toUpperCase() + firstToken.slice(1);
      }
    }
  }
  return "Você";
}

function deriveGender(
  answers: Record<string, string | string[]>
): "M" | "F" | null {
  const gender = answers["gender"];
  if (typeof gender === "string") {
    const normalized = gender.trim().toUpperCase();
    if (normalized === "M" || normalized === "MASCULINO") return "M";
    if (normalized === "F" || normalized === "FEMININO") return "F";
  }
  return null;
}

function getPronounSet(gender: "M" | "F" | null): {
  dele_dela: string;
  ele_ela: string;
  o_a: string;
  preso_presa: string;
  mesmo_mesma: string;
} {
  if (gender === "M") {
    return {
      dele_dela: "dele",
      ele_ela: "ele",
      o_a: "o",
      preso_presa: "preso",
      mesmo_mesma: "mesmo",
    };
  }
  return {
    dele_dela: "dela",
    ele_ela: "ela",
    o_a: "a",
    preso_presa: "presa",
    mesmo_mesma: "mesma",
  };
}

const FLAG_LABELS: Record<keyof SymptomFlags, string> = {
  sleepDisruption: "sono desregulado",
  severeInsomnia: "insônia intensa",
  appetiteLoss: "apetite reduzido",
  emotionalEating: "compensação na comida",
  frequentSocialChecks: "checagem frequente das redes",
  compulsiveSocialChecks: "checagem compulsiva das redes",
  impulseToContact: "impulsos de contato",
  romanticizingPast: "idealização do passado",
  intenseAnger: "raiva recorrente",
  heavyGuilt: "culpa persistente",
  futureFeelsImpossible: "dificuldade de imaginar futuro sem a pessoa",
  lowEnergy: "energia baixa/paralisação",
  closedToNewConnections: "resistência a novas conexões",
};

function buildFlagSummary(flags: SymptomFlags): string[] {
  return (Object.entries(FLAG_LABELS) as Array<[keyof SymptomFlags, string]>)
    .filter(([key]) => flags[key])
    .map(([, label]) => label);
}

// ===================== Handler =====================

export async function POST(request: NextRequest) {
  try {
    safeLog("📥 API /generate-report chamada");
    const body: GenerateReportRequest = await request.json();
    const {
      segment,
      answers,
      detailedAnswers,
      scores,
      birthdate,
      exBirthdate,
    } = body;
    safeLog(`📊 Gerando relatório de entendimento - Segmento: ${segment}`);

    if (!segment || !answers) {
      return NextResponse.json(
        { error: "Segmento e respostas são obrigatórios" },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY não configurada");
      return NextResponse.json(
        { error: "Serviço temporariamente indisponível" },
        { status: 500 }
      );
    }

    const userBirthdate =
      birthdate || (answers.birthdate as string) || undefined;
    const userExBirthdate =
      exBirthdate || (answers.exBirthdate as string) || undefined;

    const daysSinceBreakup = deriveDaysSinceBreakup(answers);
    const symptomFlags = deriveSymptomFlags(answers);

    const userBehaviorTraits: string[] = [];
    const exBehaviorTraits: string[] = [];
    const compatibilityHighlights: string[] = [];

    const userZodiac = userBirthdate ? getZodiacSign(userBirthdate) : null;
    const exZodiac = userExBirthdate ? getZodiacSign(userExBirthdate) : null;

    if (userZodiac) {
      userBehaviorTraits.push(
        ...insightToTraits(getZodiacInsights(userZodiac))
      );
    }

    if (exZodiac) {
      exBehaviorTraits.push(...insightToTraits(getZodiacInsights(exZodiac)));
    }

    if (userZodiac && exZodiac) {
      compatibilityHighlights.push(
        ...insightToTraits(getCompatibilityInsights(userZodiac, exZodiac))
      );
    }

    const answersContext = detailedAnswers
      ? detailedAnswers
          .map(
            (item) =>
              `Pergunta: ${item.question}\nResposta: ${item.emoji} ${item.answerLabel}\nPeso: ${item.weight} pts → ${item.segment}\n`
          )
          .join("\n")
      : QUESTIONS.map((question) => {
          const answer = answers[question.id];
          const answerValue = Array.isArray(answer) ? answer[0] : answer;
          const selectedOption = question.options.find(
            (opt) => opt.value === answerValue
          );
          return `Pergunta: ${question.title}\nResposta: ${
            selectedOption?.label || "Não respondida"
          }\n`;
        }).join("\n");

    const segmentContent = getSegmentContent(segment);
    const userFirstName = deriveFirstName(answers);
    const userGender = deriveGender(answers);
    const pronouns = getPronounSet(userGender);

    safeLog(
      `👤 Nome: ${userFirstName}, Gênero: ${userGender || "não informado"}`
    );

    const userTraitsBlock = userBehaviorTraits.length
      ? userBehaviorTraits.map((trait) => `- ${trait}`).join("\n")
      : "- Traços derivados não disponíveis; use apenas as respostas para inferir.";

    const exTraitsBlock = exBehaviorTraits.length
      ? exBehaviorTraits.map((trait) => `- ${trait}`).join("\n")
      : "- Dados insuficientes para derivar traços (se não houver, ignore).";

    const compatibilityBlock = compatibilityHighlights.length
      ? compatibilityHighlights.map((trait) => `- ${trait}`).join("\n")
      : "- Sem dados suficientes; omita a seção de compatibility se continuar sem base.";

    const shouldIncludeCompatibility = compatibilityHighlights.length > 0;
    const flagSummaryList = buildFlagSummary(symptomFlags);
    const flagsHumanReadable = flagSummaryList.length
      ? flagSummaryList.join(", ")
      : "sem sintomas de alta intensidade detectados";
    const flagsForPrompt = JSON.stringify(symptomFlags, null, 2);

    // ===== Schema de ENTENDIMENTO (free) =====
    const understandingSchema = `
SAÍDA OBRIGATÓRIA: JSON VÁLIDO (UTF-8), SEM markdown.

⚠️ IMPORTANTE:
- Os textos narrativos NUNCA podem citar "quiz", "perguntas", "respostas", "formulário" ou "pesquisa".
- Ao referenciar evidências no texto, use formas neutras: "pelos seus sinais", "pelo que você contou", "pelas suas reações".
- As evidências técnicas ficam APENAS nos campos *_evidences (para uso interno).

{
  "header": {
    "title": "O que realmente está acontecendo com você",
    "subtitle": "Leitura clara do que você sente e por que isso acontece",
    "segment": "Nome da etapa REAL identificada (ex.: Devastação, Abstinência emocional, Interiorização, Ira, Aceitação frágil, Reconstrução)"
  },

  "intro": "Parágrafo curto e personalizado para {{userFirstName}}, adaptado ao segmento, com tom empático e direto. Ex.: 'Você, {{userFirstName}}, está tentando seguir, mas seu corpo não acompanha. Este relatório vai doer um pouco, mas ele explica — de forma simples — por que isso ainda prende você.'",

  "one_liner": "Resumo em 1 frase, direta, sobre o momento atual de {{userFirstName}}.",

  "stage_confidence": 0.85,

  "stage_signals": [
    { "signal": "Ex.: 'Acorda durante a noite'", "evidence": [{ "questionId": "sono", "answerLabel": "Acordo várias vezes" }] },
    { "signal": "Ex.: 'Dificuldade real de imaginar futuro sem a pessoa'", "evidence": [{ "questionId": "futuro", "answerLabel": "Não consigo imaginar" }] }
  ],

  "personProfile": [
    "Escreva 2-3 parágrafos cirúrgicos, usando o nome {{userFirstName}}. Explique como {{userFirstName}} sente, pensa e se protege emocionalmente. Traga exemplos concretos (sono, apetite, checagens, energia), sem mencionar 'quiz'. Seja direto, humano e específico. Evite poesia."
  ],
  "personProfile_evidences": [
    { "questionId": "sono", "answerLabel": "Dificuldade para dormir" },
    { "questionId": "apetite", "answerLabel": "Sem apetite" }
  ],

  "relationshipOverview": [
    "Explique, em 2-3 parágrafos, por que a conexão aconteceu, onde começou a se perder e o que ficou em aberto. Mostre a cola emocional (rotina, promessas, sensação de 'quase deu certo'). Linguagem simples."
  ],
  "relationshipOverview_evidences": [
    { "questionId": "idealizacao", "answerLabel": "Costuma idealizar" },
    { "questionId": "tempo_fim", "answerLabel": "31-90 dias" }
  ],

  "currentFeelings": {
    "mind": [
      "Explique os loops da mente de {{userFirstName}} de forma direta (ex.: revisa conversas, procura sinais, cria cenários). Zero misticismo."
    ],
    "body": [
      "Mostre como o corpo reage (sono/apetite/energia/tensão) e por que isso é normal nesta etapa. Linguagem simples."
    ],
    "heart": [
      "Explique o que o coração sente (saudade, medo, comparação, injustiça) e como isso se mistura. Direto, concreto."
    ]
  },
  "currentFeelings_evidences": [
    { "questionId": "sono", "answerLabel": "Insônia" },
    { "questionId": "raiva", "answerLabel": "Moderada" }
  ],

  "whyCantMoveOn": [
    "Mostre, em 2-3 parágrafos, o que mantém o vínculo ativo: memória boa, rotina quebrada, necessidade de sentido, medo de soltar, comparação. Conecte com tempo desde o fim. Nada de conselhos."
  ],
  "whyCantMoveOn_evidences": [
    { "questionId": "checagens", "answerLabel": "3-5 vezes/dia" },
    { "questionId": "impulso_contato", "answerLabel": "Frequente" }
  ],

  "currentStage": {
    "name": "Etapa REAL identificada (DEVE SER IGUAL a header.segment)",
    "description": [
      "Explique, em 2-3 parágrafos, sinais concretos desta etapa, por que {{userFirstName}} está nela e o que a sustenta. Use linguagem simples e direta."
    ]
  },
  "currentStage_evidences": [
    { "questionId": "futuro", "answerLabel": "Difícil me imaginar feliz" },
    { "questionId": "atividades", "answerLabel": "Forçando rotina" }
  ],

  "rootCause": [
    "Explique, em 2-3 parágrafos, o padrão central (ex.: controle, validação, medo de abandono, idealização) e como ele aparece aqui. Zero julgamento, só clareza."
  ],
  "rootCause_evidences": [
    { "questionId": "culpa", "answerLabel": "Frequente" },
    { "questionId": "idealizacao", "answerLabel": "Bastante" }
  ],

  "unresolvedPoints": [
    "Liste 3-5 frases curtas e diretas sobre o que AINDA puxa {{userFirstName}} para trás. Ex.: 'Você ainda busca confirmação do outro para se acalmar.'",
    "Frases de impacto, sem rodeios, sem tarefas."
  ],

  "learning": [
    "Explique, em 2-3 parágrafos, o que essa história mostra sobre o padrão emocional de {{userFirstName}}. Nada de moral da história. Apenas clareza sobre o padrão."
  ],
  "learning_evidences": [
    { "questionId": "reflexao", "answerLabel": "Já comecei a rever hábitos" },
    { "questionId": "novas_conexoes", "answerLabel": "Ainda não" }
  ],

  "compatibility": {
    "connection": ["Se houver dados do ex, explique por que conectaram (traços semelhantes/complementares)."],
    "strengths": ["Pontos fortes da dupla."],
    "frictions": ["Fontes previsíveis de atrito."],
    "distancing": ["Por que se afastaram (dinâmicas que não fechavam)."]
  },

  "nextStepHint": {
    "summary": "Resumo curto do que {{userFirstName}} já entendeu e do que AINDA está em aberto.",
    "why_full_report": "1 frase clara explicando por que o Relatório Completo é importante neste caso (destrava pontos cegos específicos)."
  },

  "closing_archetype": "Frase forte de 1 linha que sintetiza o momento de {{userFirstName}} sem soar poética demais. Ex.: 'Não é sobre voltar no tempo — é sobre recuperar o comando do que você sente agora.'"
}

REGRAS NÃO NEGOCIÁVEIS:
1) Use o nome {{userFirstName}} pelo menos 3 vezes ao longo do relatório.
2) No texto NUNCA mencione 'quiz', 'perguntas' ou 'respostas'. Prefira: 'pelos seus sinais', 'pelo que você contou', 'pelas suas reações'.
3) Nada de texto genérico. Traga exemplos concretos (sono, apetite, checagens, comparações, impulsos).
4) Zero poesia, zero autoajuda. Direto, humano, brasileiro.
5) 'header.segment' DEVE ser exatamente igual a 'currentStage.name'.
6) 'stage_confidence' entre 0 e 1.
7) Cada *_evidences deve ter ao menos 2 evidências reais (questionId + answerLabel).
8) Se não houver dados do ex, omita 'compatibility' do JSON final.
`;

    const schemaForPrompt = understandingSchema.replace(
      /\{\{userFirstName\}\}/g,
      userFirstName
    );

    const systemPromptFree = `
Você é um especialista em análise emocional pós-término. Gere um relatório direto, humano e cirúrgico para ${userFirstName}.

🔤 GÊNERO E PRONOMES:
${
  userGender === "M"
    ? "O leitor é MASCULINO."
    : "A leitora é FEMININA (ou gênero não informado)."
}
Use pronomes coerentes nos exemplos e na narração quando necessário.
- Ex.: "${pronouns.dele_dela}" / "${pronouns.ele_ela}" / "${
      pronouns.preso_presa
    }" / artigo "${pronouns.o_a}".
- NUNCA use “você mesma”/“você mesmo”. Prefira neutro: “você contou”, “você indicou”, “seus sinais mostram”.

TOM OBRIGATÓRIO:
- Direto, empático, provocativo quando útil.
- Zero misticismo, zero poesia, zero autoajuda.
- Comparações simples são bem-vindas (ex.: "parece música repetindo na cabeça").
- O objetivo é a pessoa se reconhecer de primeira e pensar: “é isso”.

PROIBIÇÕES NO TEXTO PARA O LEITOR:
- Não fale “no quiz você respondeu…”, “na pesquisa…”, “no formulário…”. 
- Se precisar referenciar, diga “pelos seus sinais”, “pelo que você contou” (sem citar o mecanismo).

SAÍDA OBRIGATÓRIA:
- JSON válido seguindo o schema abaixo (SEM markdown).
- Inclua "intro", "one_liner", "closing_archetype".
- 'header.segment' === 'currentStage.name'.
- Preencha *_evidences com questionId + answerLabel (uso interno). Não exponha isso no texto narrativo.
- 'stage_confidence' entre 0 e 1. 'stage_signals' com 2-4 itens com evidências.

CONTEXTO DO CASO:
- Segmento: ${segmentContent.headline}
- Descrição: ${segmentContent.description}
- Período desde o término: ${daysSinceBreakup ?? "não informado"} dias
- Sintomas principais: ${flagsHumanReadable}
- Traços do usuário (derivados, se houver): 
${userTraitsBlock}
- Traços do ex (se houver): 
${exTraitsBlock}
- Compatibilidade (se houver base): 
${compatibilityBlock}

${schemaForPrompt}
`;

    const systemPrompt = systemPromptFree;

    const userPrompt = `
LEITOR: ${userFirstName}
GÊNERO: ${
      userGender === "M"
        ? "Masculino"
        : userGender === "F"
        ? "Feminino"
        : "Não informado"
    }
PRONOMES: ${pronouns.dele_dela} / ${pronouns.ele_ela} / ${
      pronouns.preso_presa
    } / ${pronouns.o_a}

SEGMENTO IDENTIFICADO: ${segmentContent.headline}
DESCRIÇÃO DO SEGMENTO: ${segmentContent.description}

DIAS DESDE O TÉRMINO (aprox.): ${daysSinceBreakup ?? "não informado"}

SINTOMAS / BANDEIRAS DETECTADOS (resumo humano):
${flagsHumanReadable}
Mapa bruto das flags:
${flagsForPrompt}

SCORES DO QUIZ:
- Devastação: ${scores.devastacao}
- Abstinência: ${scores.abstinencia}
- Interiorização: ${scores.interiorizacao}
- Ira: ${scores.ira}
- Superação: ${scores.superacao}

TRAÇOS DO USUÁRIO (derivados de contexto — não citar signos no texto):
${userTraitsBlock}

TRAÇOS DO EX (se houver dados — não citar signos no texto):
${exTraitsBlock}

DINÂMICA ENTRE VOCÊS (se houver base — texto não deve citar “quiz”):
${compatibilityBlock}

RESPOSTAS DETALHADAS (para embasar *_evidences; NÃO citar no texto narrativo):
${answersContext}

RESTRIÇÕES CRÍTICAS:
- Gere apenas o JSON no formato exigido (SEM markdown).
- "header.segment" DEVE ser EXATAMENTE IGUAL a "currentStage.name".
- Use o nome ${userFirstName} pelo menos 3 vezes no texto.
- Não use “você mesma/você mesmo”; prefira “você” neutro.
- Se não houver base para "compatibility", omita essa seção do JSON final.
`;

    // ===== Chamada OpenAI =====
    safeLog("🤖 Chamando OpenAI...");
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.5,
      max_tokens: 3800,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("Nenhum relatório foi gerado pela OpenAI");

    // ===== Parse e validação =====
    let report: ReportFreePayload;

    try {
      report = JSON.parse(content) as ReportFreePayload;

      if (
        !report?.header ||
        !report?.intro ||
        !report?.one_liner ||
        typeof report?.stage_confidence !== "number" ||
        !Array.isArray(report?.stage_signals) ||
        !Array.isArray(report?.personProfile) ||
        !Array.isArray(report?.personProfile_evidences) ||
        !Array.isArray(report?.relationshipOverview) ||
        !Array.isArray(report?.relationshipOverview_evidences) ||
        !report?.currentFeelings ||
        !Array.isArray(report?.currentFeelings_evidences) ||
        !report?.currentStage ||
        !Array.isArray(report?.currentStage_evidences) ||
        !Array.isArray(report?.whyCantMoveOn) ||
        !Array.isArray(report?.whyCantMoveOn_evidences) ||
        !Array.isArray(report?.rootCause) ||
        !Array.isArray(report?.rootCause_evidences) ||
        !Array.isArray(report?.unresolvedPoints) ||
        !Array.isArray(report?.learning) ||
        !Array.isArray(report?.learning_evidences) ||
        !report?.nextStepHint ||
        typeof report.nextStepHint.summary !== "string" ||
        typeof report.nextStepHint.why_full_report !== "string" ||
        !report?.closing_archetype ||
        typeof report.closing_archetype !== "string"
      ) {
        safeLog("❌ JSON inválido (faltam campos):", Object.keys(report || {}));
        throw new Error("Estrutura do relatório inválida");
      }

      if (report.header.segment !== report.currentStage.name) {
        safeLog(
          `⚠️ Inconsistência: header.segment (${report.header.segment}) !== currentStage.name (${report.currentStage.name}) — ajustando.`
        );
        report.currentStage.name = report.header.segment;
      }

      if (report.stage_confidence < 0 || report.stage_confidence > 1) {
        safeLog(
          `⚠️ stage_confidence fora do range (${report.stage_confidence}), ajustando para 0.75`
        );
        report.stage_confidence = 0.75;
      }
    } catch (err) {
      safeLog("❌ Erro ao parsear JSON:", err);
      safeLog(
        "📄 Conteúdo recebido (500 chars):",
        content.substring(0, 500) + "..."
      );
      throw new Error("Erro ao processar relatório (parse JSON)");
    }

    return NextResponse.json({
      success: true,
      report,
      segment,
      days_since_breakup: daysSinceBreakup ?? null,
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("❌ ERRO GERAL ao gerar relatório:", error);

    if (error instanceof OpenAI.APIError) {
      return NextResponse.json(
        {
          error: "Erro ao processar solicitação",
          details: (error as any).message,
        },
        { status: (error as any).status || 500 }
      );
    }

    const msg = (error as Error)?.message || "Erro ao gerar relatório";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
