/**
 * @file: validators.ts
 * @responsibility: Schemas de validação com Zod
 * @exports: leadSchema, quizAnswersSchema
 */

import { z } from "zod";
import { QUESTIONS } from "./questions";

// Schema para captura de lead
export const leadSchema = z.object({
  email: z.string().min(1, "E-mail é obrigatório").email("E-mail inválido"),
  whatsapp: z
    .string()
    .min(10, "WhatsApp deve ter pelo menos 10 dígitos")
    .max(16, "WhatsApp deve ter no máximo 16 dígitos")
    .regex(/^\d+$/, "WhatsApp deve conter apenas números"),
  consent: z.boolean().refine((val) => val === true, {
    message: "Você precisa concordar para continuar",
  }),
});

export type LeadFormData = z.infer<typeof leadSchema>;

// Schema dinâmico para respostas do quiz
const createQuizAnswersSchema = () => {
  const shape: Record<string, z.ZodString | z.ZodArray<z.ZodString>> = {};

  QUESTIONS.forEach((question) => {
    if (question.type === "multi") {
      shape[question.id] = z
        .array(z.string())
        .min(1, "Selecione pelo menos uma opção");
    } else {
      shape[question.id] = z.string().min(1, "Esta pergunta é obrigatória");
    }
  });

  return z.object(shape);
};

export const quizAnswersSchema = createQuizAnswersSchema();

export type QuizAnswersData = z.infer<typeof quizAnswersSchema>;

// Helper para normalizar WhatsApp (remover tudo exceto números)
export function normalizeWhatsApp(whatsapp: string): string {
  return whatsapp.replace(/\D/g, "");
}

// Helper para formatar WhatsApp com máscara
export function formatWhatsApp(whatsapp: string): string {
  const cleaned = normalizeWhatsApp(whatsapp);

  // Formato: +55 (11) 91234-5678
  if (cleaned.length === 13) {
    return `+${cleaned.slice(0, 2)} (${cleaned.slice(2, 4)}) ${cleaned.slice(
      4,
      9
    )}-${cleaned.slice(9)}`;
  }

  // Formato: +55 (11) 1234-5678 (fixo)
  if (cleaned.length === 12) {
    return `+${cleaned.slice(0, 2)} (${cleaned.slice(2, 4)}) ${cleaned.slice(
      4,
      8
    )}-${cleaned.slice(8)}`;
  }

  return whatsapp;
}

// Validar se WhatsApp tem formato brasileiro válido
export function isValidBrazilianWhatsApp(whatsapp: string): boolean {
  const cleaned = normalizeWhatsApp(whatsapp);

  // Deve ter 12 (fixo) ou 13 (celular) dígitos e começar com 55 (Brasil)
  if (cleaned.length < 12 || cleaned.length > 13) {
    return false;
  }

  if (!cleaned.startsWith("55")) {
    return false;
  }

  return true;
}
