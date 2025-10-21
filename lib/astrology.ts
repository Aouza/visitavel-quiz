/**
 * @file: lib/astrology.ts
 * @responsibility: Helpers para astrologia e compatibilidade
 * @exports: getZodiacSign, getZodiacInsights, getCompatibilityInsights
 */

export type ZodiacSign =
  | "aries"
  | "taurus"
  | "gemini"
  | "cancer"
  | "leo"
  | "virgo"
  | "libra"
  | "scorpio"
  | "sagittarius"
  | "capricorn"
  | "aquarius"
  | "pisces";

interface ZodiacInfo {
  sign: ZodiacSign;
  name: string;
  element: "fire" | "earth" | "air" | "water";
  quality: "cardinal" | "fixed" | "mutable";
}

const ZODIAC_DATES: Array<{
  sign: ZodiacSign;
  name: string;
  element: "fire" | "earth" | "air" | "water";
  quality: "cardinal" | "fixed" | "mutable";
  startMonth: number;
  startDay: number;
  endMonth: number;
  endDay: number;
}> = [
  {
    sign: "capricorn",
    name: "Capricórnio",
    element: "earth",
    quality: "cardinal",
    startMonth: 12,
    startDay: 22,
    endMonth: 1,
    endDay: 19,
  },
  {
    sign: "aquarius",
    name: "Aquário",
    element: "air",
    quality: "fixed",
    startMonth: 1,
    startDay: 20,
    endMonth: 2,
    endDay: 18,
  },
  {
    sign: "pisces",
    name: "Peixes",
    element: "water",
    quality: "mutable",
    startMonth: 2,
    startDay: 19,
    endMonth: 3,
    endDay: 20,
  },
  {
    sign: "aries",
    name: "Áries",
    element: "fire",
    quality: "cardinal",
    startMonth: 3,
    startDay: 21,
    endMonth: 4,
    endDay: 19,
  },
  {
    sign: "taurus",
    name: "Touro",
    element: "earth",
    quality: "fixed",
    startMonth: 4,
    startDay: 20,
    endMonth: 5,
    endDay: 20,
  },
  {
    sign: "gemini",
    name: "Gêmeos",
    element: "air",
    quality: "mutable",
    startMonth: 5,
    startDay: 21,
    endMonth: 6,
    endDay: 20,
  },
  {
    sign: "cancer",
    name: "Câncer",
    element: "water",
    quality: "cardinal",
    startMonth: 6,
    startDay: 21,
    endMonth: 7,
    endDay: 22,
  },
  {
    sign: "leo",
    name: "Leão",
    element: "fire",
    quality: "fixed",
    startMonth: 7,
    startDay: 23,
    endMonth: 8,
    endDay: 22,
  },
  {
    sign: "virgo",
    name: "Virgem",
    element: "earth",
    quality: "mutable",
    startMonth: 8,
    startDay: 23,
    endMonth: 9,
    endDay: 22,
  },
  {
    sign: "libra",
    name: "Libra",
    element: "air",
    quality: "cardinal",
    startMonth: 9,
    startDay: 23,
    endMonth: 10,
    endDay: 22,
  },
  {
    sign: "scorpio",
    name: "Escorpião",
    element: "water",
    quality: "fixed",
    startMonth: 10,
    startDay: 23,
    endMonth: 11,
    endDay: 21,
  },
  {
    sign: "sagittarius",
    name: "Sagitário",
    element: "fire",
    quality: "mutable",
    startMonth: 11,
    startDay: 22,
    endMonth: 12,
    endDay: 21,
  },
];

export function getZodiacSign(dateString: string): ZodiacInfo | null {
  try {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();

    for (const zodiac of ZODIAC_DATES) {
      if (zodiac.startMonth === zodiac.endMonth) {
        if (
          month === zodiac.startMonth &&
          day >= zodiac.startDay &&
          day <= zodiac.endDay
        ) {
          return zodiac;
        }
      } else {
        // Handle signs that span across year boundary (like Capricorn)
        if (
          (month === zodiac.startMonth && day >= zodiac.startDay) ||
          (month === zodiac.endMonth && day <= zodiac.endDay)
        ) {
          return zodiac;
        }
      }
    }

    return null;
  } catch (error) {
    console.error("Error calculating zodiac sign:", error);
    return null;
  }
}

export function getZodiacInsights(sign: ZodiacInfo): string {
  const insights: Record<string, string> = {
    aries:
      "Natureza energética e impulsiva, tende a agir rapidamente nas emoções. Precisa canalizar a intensidade para processar o luto de forma saudável.",
    taurus:
      "Busca estabilidade e segurança. Pode ter dificuldade com mudanças e finais, necessitando de tempo para processar e aceitar.",
    gemini:
      "Mente ativa que pode oscilar entre racionalizar demais e evitar sentimentos profundos. Beneficia-se de expressão verbal e conexões sociais.",
    cancer:
      "Altamente emocional e conectado aos sentimentos. Pode tender à nostalgia e idealização do passado, necessitando de validação emocional.",
    leo: "Orgulho e autoestima podem estar abalados. Necessita reconhecer o valor próprio independente da relação e recuperar a confiança.",
    virgo:
      "Tende a analisar excessivamente e autocriticar. Precisa ser gentil consigo mesmo(a) e entender que nem tudo depende de seu controle.",
    libra:
      "Busca equilíbrio e harmonia, pode ter dificuldade com conflitos não resolvidos. Necessita aprender a estar bem consigo mesmo(a).",
    scorpio:
      "Intensidade emocional profunda. Pode vivenciar o luto de forma intensa, necessitando transformar a dor em crescimento pessoal.",
    sagittarius:
      "Busca liberdade e significado. Pode beneficiar-se ao ver o término como oportunidade de expansão e novos horizontes.",
    capricorn:
      "Responsabilidade e controle são importantes. Pode carregar culpa excessiva, necessitando reconhecer limites e permitir-se vulnerabilidade.",
    aquarius:
      "Tende a racionalizar emoções e manter distância. Beneficia-se ao permitir-se sentir profundamente e buscar conexão autêntica.",
    pisces:
      "Altamente sensível e empático. Pode absorver emoções do outro, necessitando estabelecer limites saudáveis e cuidar de si primeiro.",
  };

  return insights[sign.sign] || "";
}

export function getCompatibilityInsights(
  userSign: ZodiacInfo,
  exSign: ZodiacInfo
): string {
  // Elements compatibility
  const compatibleElements = {
    fire: ["fire", "air"],
    earth: ["earth", "water"],
    air: ["air", "fire"],
    water: ["water", "earth"],
  };

  const elementsMatch = compatibleElements[userSign.element].includes(
    exSign.element
  );

  // Quality compatibility
  const sameQuality = userSign.quality === exSign.quality;

  let insight = "";

  if (elementsMatch && sameQuality) {
    insight =
      "A dinâmica natural entre vocês era intensa e conectada, o que pode tornar o desapego mais desafiador. É importante reconhecer que essa conexão, embora forte, não define sua capacidade de ser feliz.";
  } else if (elementsMatch) {
    insight =
      "Vocês tinham uma compatibilidade natural que facilitava a comunicação e conexão. Isso pode explicar a dificuldade em deixar ir, mas também indica que você possui as ferramentas emocionais para se recuperar.";
  } else if (userSign.element === "fire" && exSign.element === "water") {
    insight =
      "A dinâmica entre vocês podia ser de extremos - paixão intensa alternando com conflitos emocionais. Reconhecer esses padrões ajuda a entender o que buscar (ou evitar) em relacionamentos futuros.";
  } else if (userSign.element === "earth" && exSign.element === "air") {
    insight =
      "Vocês representavam energias diferentes - estabilidade versus liberdade. Essa tensão natural pode ter criado desafios, mas também lições valiosas sobre equilíbrio e necessidades individuais.";
  } else {
    insight =
      "A dinâmica entre vocês requeria esforço consciente e adaptação. Isso não significa que foi errado, mas sim que o aprendizado dessa experiência é especialmente valioso para seu crescimento.";
  }

  return insight;
}
