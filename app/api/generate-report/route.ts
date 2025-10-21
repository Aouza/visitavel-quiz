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

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface GenerateReportRequest {
  segment: Segment;
  answers: Record<string, string | string[]>;
  scores: Record<Segment, number>;
  birthdate?: string;
  exBirthdate?: string;
  mode?: "summary" | "full";
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateReportRequest = await request.json();
    const { segment, answers, scores, birthdate, exBirthdate, mode } = body;
    const isSummary = mode === "summary";

    // Validação
    if (!segment || !answers) {
      return NextResponse.json(
        { error: "Segmento e respostas são obrigatórios" },
        { status: 400 }
      );
    }

    // Validar API Key
    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY não configurada");
      return NextResponse.json(
        { error: "Serviço temporariamente indisponível" },
        { status: 500 }
      );
    }

    // Extrair datas de nascimento das respostas (se fornecidas)
    const userBirthdate =
      birthdate || (answers.birthdate as string) || undefined;
    const userExBirthdate =
      exBirthdate || (answers.exBirthdate as string) || undefined;

    // Análise astrológica (se disponível)
    let astrologicalContext = "";

    if (userBirthdate || userExBirthdate) {
      const insights = [];

      if (userBirthdate) {
        const userZodiac = getZodiacSign(userBirthdate);
        if (userZodiac) {
          const personalInsight = getZodiacInsights(userZodiac);
          insights.push(`Perfil comportamental: ${personalInsight}`);
        }
      }

      if (userBirthdate && userExBirthdate) {
        const userZodiac = getZodiacSign(userBirthdate);
        const exZodiac = getZodiacSign(userExBirthdate);

        if (userZodiac && exZodiac) {
          const compatibilityInsight = getCompatibilityInsights(
            userZodiac,
            exZodiac
          );
          insights.push(`Dinâmica do relacionamento: ${compatibilityInsight}`);
        }
      }

      if (insights.length > 0) {
        astrologicalContext = `\n\n**Contexto Adicional de Personalidade:**\n${insights.join(
          "\n\n"
        )}`;
      }
    }

    // Preparar contexto das respostas
    const answersContext = QUESTIONS.map((question) => {
      const answer = answers[question.id];
      const answerValue = Array.isArray(answer) ? answer[0] : answer;
      const selectedOption = question.options.find(
        (opt) => opt.value === answerValue
      );

      return `
Pergunta: ${question.title}
Resposta: ${selectedOption?.label || "Não respondida"}
`;
    }).join("\n");

    // Obter conteúdo do segmento
    const segmentContent = getSegmentContent(segment);

    // Preparar prompt para OpenAI
    const basePrompt = `Você é um psicólogo especializado em relacionamentos e superação de términos amorosos. 
Sua tarefa é criar um relatório personalizado e empático baseado nas respostas de um quiz sobre pós-término.

Você deve:
1. Analisar as respostas com profundidade e empatia
2. Identificar padrões comportamentais e emocionais
3. Fornecer insights personalizados e construtivos
4. Oferecer orientações práticas e aplicáveis
5. Manter um tom acolhedor, mas profissional
6. Evitar julgamentos e manter foco em soluções`;

    const fullReportSections = `
O relatório deve ter as seguintes seções:
- **Análise do Seu Momento Atual**: Uma análise profunda e personalizada do estado emocional da pessoa
- **Pontos de Atenção**: 3-4 aspectos específicos que merecem cuidado imediato
- **Recursos e Forças Identificadas**: Pontos positivos e recursos internos que a pessoa já demonstra
- **Plano de Ação Personalizado**: 5-7 ações práticas e específicas que a pessoa pode começar hoje
- **Mensagem de Apoio**: Uma mensagem final encorajadora e realista`;

    const summarySections = `
Escreva APENAS o Resumo Emocional (não inclua plano completo). Estrutura obrigatória:
1) **Título principal**: nome simbólico do diagnóstico (não cite signos)
2) **Resumo interpretativo**: 1 parágrafo forte, claro e assertivo
3) **Desenvolvimento emocional**: 2 a 3 parágrafos de leitura simbólica profunda
4) **Interrupção estratégica**: uma única linha final que provoque curiosidade, sem parecer teaser vazio

Regras:
- Linguagem humana, íntima e reveladora, sem jargões místicos
- Nunca mencione astrologia, horóscopo ou signos; use apenas as características comportamentais fornecidas no contexto adicional
- Entregue valor real; não prometa conteúdo futuro dentro do texto (a linha final é apenas uma frase de curiosidade)`;

    const systemPrompt = `${basePrompt}
${isSummary ? summarySections : fullReportSections}`;

    const userPrompt = `A pessoa realizou o quiz de pós-término e foi classificada na fase: **${
      segmentContent.headline
    }**

${segmentContent.description}

**Respostas do Quiz:**
${answersContext}

**Distribuição de Scores:**
- Devastação: ${scores.devastacao} pontos
- Abstinência: ${scores.abstinencia} pontos
- Interiorização: ${scores.interiorizacao} pontos
- Ira: ${scores.ira} pontos
- Superação: ${scores.superacao} pontos
${astrologicalContext}

 Por favor, crie ${
   isSummary ? "APENAS o Resumo Emocional solicitado" : "um relatório completo"
 } personalizado, profundo e empático baseado nessas informações. Use markdown para formatação e seja específico nas orientações.

**IMPORTANTE:** Se houver "Contexto Adicional de Personalidade", incorpore esses insights de forma NATURAL e SUTIL no relatório, sem mencionar explicitamente astrologia, horóscopo ou signos. Trate como características comportamentais e de personalidade observadas.`;

    // Chamar OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const report = completion.choices[0]?.message?.content;

    if (!report) {
      throw new Error("Nenhum relatório foi gerado");
    }

    return NextResponse.json({
      success: true,
      report,
      segment,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Erro ao gerar relatório:", error);

    // Tratamento de erro da OpenAI
    if (error instanceof OpenAI.APIError) {
      return NextResponse.json(
        {
          error: "Erro ao processar solicitação",
          details: error.message,
        },
        { status: error.status || 500 }
      );
    }

    return NextResponse.json(
      { error: "Erro ao gerar relatório" },
      { status: 500 }
    );
  }
}
