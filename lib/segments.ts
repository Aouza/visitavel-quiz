/**
 * @file: segments.ts
 * @responsibility: Conteúdos dinâmicos por segmento
 * @exports: SEGMENT_CONTENT, SegmentContent
 */

import { type Segment } from "./questions";

export interface SegmentContent {
  headline: string;
  description: string;
  bullets: string[];
  ctaPrimary: string;
  ctaSecondary: string;
  color: string;
  icon: string;
}

export const SEGMENT_CONTENT: Record<Segment, SegmentContent> = {
  devastacao: {
    headline: "Você está na fase de Devastação",
    description:
      "O término ainda está muito recente e intenso. Você está sentindo o impacto emocional de forma aguda, com dificuldades no sono, apetite e foco.",
    bullets: [
      "É normal sentir-se sobrecarregado(a) neste momento",
      "Seu corpo e mente estão reagindo a uma perda significativa",
      "Cuidados básicos com sono e alimentação são fundamentais agora",
      "Apoio próximo e estruturado pode acelerar sua recuperação",
      "Não tome decisões importantes nesta fase",
    ],
    ctaPrimary: "Quero o Kit Anti-Recaída Completo",
    ctaSecondary: "Receber resumo por e-mail",
    color: "text-red-600",
    icon: "💔",
  },
  abstinencia: {
    headline: "Você está na fase de Abstinência",
    description:
      "Você sente forte necessidade de contato com seu(sua) ex, como se estivesse passando por uma crise de abstinência. Os impulsos são intensos e difíceis de controlar.",
    bullets: [
      "Checagens constantes nas redes sociais são um sintoma comum",
      "O impulso de entrar em contato é natural, mas pode atrasar sua cura",
      "Você pode estar idealizando o relacionamento",
      "Existem técnicas específicas para lidar com esses impulsos",
      "É possível romper esse ciclo com as estratégias certas",
    ],
    ctaPrimary: "Quero o Kit Anti-Recaída Completo",
    ctaSecondary: "Receber resumo por e-mail",
    color: "text-orange-600",
    icon: "🔄",
  },
  interiorizacao: {
    headline: "Você está na fase de Interiorização",
    description:
      "Você está voltando para dentro, refletindo sobre si mesmo(a), seus padrões e o que pode aprender com tudo isso. Pode estar sentindo culpa ou questionando suas escolhas.",
    bullets: [
      "A reflexão é importante, mas a culpa excessiva não ajuda",
      "Você está começando a processar a experiência de forma mais profunda",
      "É hora de transformar insights em ações práticas",
      "Autocrítica saudável é diferente de autopunição",
      "Este é um momento crucial para crescimento pessoal",
    ],
    ctaPrimary: "Quero o Kit Anti-Recaída Completo",
    ctaSecondary: "Receber resumo por e-mail",
    color: "text-blue-600",
    icon: "🤔",
  },
  ira: {
    headline: "Você está na fase de Ira",
    description:
      "Você sente raiva, ressentimento ou frustração em relação ao término. Esses sentimentos são válidos, mas podem estar impedindo sua evolução.",
    bullets: [
      "A raiva é uma emoção natural e válida no processo",
      "O importante é não ficar preso(a) nela",
      "Existem formas saudáveis de processar esse sentimento",
      "A raiva não resolvida pode virar amargura",
      "Você pode transformar essa energia em crescimento",
    ],
    ctaPrimary: "Quero o Kit Anti-Recaída Completo",
    ctaSecondary: "Receber resumo por e-mail",
    color: "text-purple-600",
    icon: "😤",
  },
  superacao: {
    headline: "Você está na fase de Superação",
    description:
      "Parabéns! Você já percorreu um caminho importante. Consegue se imaginar feliz, está voltando às suas atividades e começando a se abrir para novas possibilidades.",
    bullets: [
      "Você já fez grande parte do trabalho mais difícil",
      "Manter-se neste caminho requer atenção e cuidado",
      "É normal ter altos e baixos ocasionais",
      "Fortalecer sua base emocional previne recaídas",
      "Você está pronto(a) para consolidar sua evolução",
    ],
    ctaPrimary: "Quero consolidar minha evolução",
    ctaSecondary: "Receber resumo por e-mail",
    color: "text-green-600",
    icon: "🌟",
  },
};

export function getSegmentContent(segment: Segment): SegmentContent {
  return SEGMENT_CONTENT[segment];
}
