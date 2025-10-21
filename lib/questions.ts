/**
 * @file: questions.ts
 * @responsibility: Definição das perguntas do quiz
 * @exports: QUESTIONS, Option, Question
 */

export type Option = {
  value: string;
  label: string;
  weight?: number;
};

export type QuestionType = "likert" | "single" | "multi" | "boolean" | "date";

export type Segment =
  | "devastacao"
  | "abstinencia"
  | "interiorizacao"
  | "ira"
  | "superacao";

export type Question = {
  id: string;
  title: string;
  helper?: string;
  type: QuestionType;
  options: Option[];
  required?: boolean;
  mapTo?: Segment;
};

export const QUESTIONS: Question[] = [
  {
    id: "tempo_fim",
    title: "Há quanto tempo aconteceu o término?",
    helper: "Escolha o período que melhor representa sua situação",
    type: "single",
    options: [
      { value: "0-7", label: "📅 Até 7 dias", weight: 3 },
      { value: "8-30", label: "📅 8 a 30 dias", weight: 2 },
      { value: "31-90", label: "📅 31 a 90 dias", weight: 1 },
      { value: "90+", label: "📅 Mais de 90 dias", weight: 0 },
    ],
    mapTo: "devastacao",
    required: true,
  },
  {
    id: "checagens",
    title: "Com que frequência você checa redes sociais ou fotos do seu ex?",
    helper: "Seja honesto, isso nos ajuda a entender melhor",
    type: "likert",
    options: [
      { value: "nunca", label: "🚫 Nunca ou raramente", weight: 0 },
      { value: "1-2", label: "📱 1–2 vezes por dia", weight: 1 },
      { value: "3-5", label: "📱 3–5 vezes por dia", weight: 2 },
      { value: "6+", label: "📱 6 ou mais vezes por dia", weight: 3 },
    ],
    mapTo: "abstinencia",
    required: true,
  },
  {
    id: "sono",
    title: "Como está sua qualidade de sono?",
    type: "single",
    options: [
      { value: "normal", label: "😴 Durmo bem, sem alterações", weight: 0 },
      {
        value: "dificuldade",
        label: "😔 Tenho dificuldade para dormir",
        weight: 2,
      },
      {
        value: "acordo",
        label: "😰 Acordo várias vezes pensando nisso",
        weight: 3,
      },
      { value: "insonia", label: "😫 Praticamente não durmo", weight: 3 },
    ],
    mapTo: "devastacao",
    required: true,
  },
  {
    id: "apetite",
    title: "Seu apetite mudou desde o término?",
    type: "single",
    options: [
      { value: "normal", label: "🍽️ Está normal", weight: 0 },
      { value: "diminuiu", label: "😕 Diminuiu bastante", weight: 2 },
      { value: "aumentou", label: "🍕 Aumentou (como compensação)", weight: 2 },
      {
        value: "sem_apetite",
        label: "😔 Perdi totalmente o apetite",
        weight: 3,
      },
    ],
    mapTo: "devastacao",
    required: true,
  },
  {
    id: "impulso_contato",
    title: "Você sente impulso de entrar em contato com seu ex?",
    type: "likert",
    options: [
      { value: "nao", label: "✅ Não, já superei isso", weight: 0 },
      {
        value: "as_vezes",
        label: "🤔 Às vezes, mas consigo controlar",
        weight: 1,
      },
      { value: "frequente", label: "😔 Sim, com frequência", weight: 2 },
      {
        value: "constante",
        label: "😰 O tempo todo, é muito difícil",
        weight: 3,
      },
    ],
    mapTo: "abstinencia",
    required: true,
  },
  {
    id: "idealizacao",
    title: "Você idealiza ou romantiza o relacionamento que acabou?",
    helper: "Pensa apenas nas partes boas e ignora os problemas",
    type: "single",
    options: [
      { value: "nao", label: "⚖️ Não, vejo de forma equilibrada", weight: 0 },
      {
        value: "um_pouco",
        label: "🤷 Um pouco, mas sei que teve problemas",
        weight: 1,
      },
      {
        value: "bastante",
        label: "💭 Sim, só lembro das coisas boas",
        weight: 2,
      },
      {
        value: "totalmente",
        label: "🌟 Totalmente, acho que foi perfeito",
        weight: 3,
      },
    ],
    mapTo: "abstinencia",
    required: true,
  },
  {
    id: "raiva",
    title: "Você sente raiva ou ressentimento em relação ao término?",
    type: "likert",
    options: [
      { value: "nao", label: "😌 Não sinto raiva", weight: 0 },
      { value: "leve", label: "😕 Um pouco, às vezes", weight: 1 },
      { value: "moderada", label: "😠 Sim, com frequência", weight: 2 },
      {
        value: "intensa",
        label: "🔥 Muita raiva, penso nisso o tempo todo",
        weight: 3,
      },
    ],
    mapTo: "ira",
    required: true,
  },
  {
    id: "culpa",
    title: "Você se culpa pelo término?",
    type: "single",
    options: [
      { value: "nao", label: "🙂 Não me culpo", weight: 0 },
      { value: "as_vezes", label: "🤔 Às vezes me questiono", weight: 1 },
      { value: "frequente", label: "😔 Sim, frequentemente", weight: 2 },
      {
        value: "totalmente",
        label: "😞 Me sinto totalmente culpado(a)",
        weight: 3,
      },
    ],
    mapTo: "interiorizacao",
    required: true,
  },
  {
    id: "reflexao",
    title: "Você tem refletido sobre si mesmo e seus padrões?",
    type: "single",
    options: [
      { value: "nao", label: "🙈 Não tenho pensado nisso", weight: 0 },
      { value: "comecando", label: "🤔 Estou começando a refletir", weight: 2 },
      {
        value: "bastante",
        label: "💭 Sim, tenho refletido bastante",
        weight: 3,
      },
      { value: "mudancas", label: "✨ Já estou fazendo mudanças", weight: 1 },
    ],
    mapTo: "interiorizacao",
    required: true,
  },
  {
    id: "futuro",
    title: "Você consegue se imaginar feliz sem essa pessoa?",
    type: "single",
    options: [
      { value: "nao", label: "😔 Não consigo imaginar", weight: 3 },
      {
        value: "dificil",
        label: "😕 É muito difícil, mas às vezes consigo",
        weight: 2,
      },
      {
        value: "aos_poucos",
        label: "🌱 Aos poucos estou conseguindo",
        weight: 1,
      },
      { value: "sim", label: "😊 Sim, consigo me ver feliz", weight: 0 },
    ],
    mapTo: "superacao",
    required: true,
  },
  {
    id: "atividades",
    title: "Você voltou a fazer coisas que gosta?",
    type: "single",
    options: [
      { value: "nao", label: "😔 Não tenho ânimo para nada", weight: 3 },
      { value: "forcando", label: "💪 Estou me forçando a fazer", weight: 2 },
      { value: "voltando", label: "🌱 Estou voltando aos poucos", weight: 1 },
      { value: "sim", label: "✨ Sim, já voltei ao normal", weight: 0 },
    ],
    mapTo: "superacao",
    required: true,
  },
  {
    id: "novas_conexoes",
    title: "Você está aberto a conhecer novas pessoas?",
    helper:
      "Não necessariamente para relacionamento, mas para novas amizades e conexões",
    type: "single",
    options: [
      { value: "nao", label: "💔 Não, só penso nessa pessoa", weight: 3 },
      {
        value: "ainda_nao",
        label: "⏳ Ainda não, preciso de mais tempo",
        weight: 2,
      },
      { value: "comecando", label: "🌱 Estou começando a me abrir", weight: 1 },
      {
        value: "sim",
        label: "✨ Sim, estou aberto a novas conexões",
        weight: 0,
      },
    ],
    mapTo: "superacao",
    required: true,
  },
  {
    id: "birthdate",
    title: "Qual é a sua data de nascimento?",
    helper:
      "Opcional - nos ajuda a criar recomendações mais específicas para você",
    type: "date",
    options: [],
    required: false,
  },
  {
    id: "exBirthdate",
    title: "Qual é a data de nascimento do seu ex?",
    helper:
      "Opcional - permite uma análise mais profunda da dinâmica do relacionamento",
    type: "date",
    options: [],
    required: false,
  },
];
