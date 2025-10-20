/**
 * @file: storage.ts
 * @responsibility: Helpers para localStorage (persistência do quiz)
 * @exports: saveQuizProgress, loadQuizProgress, clearQuizProgress, saveUTMs, getUTMs
 */

const QUIZ_STORAGE_KEY = "visitavel_quiz_progress";
const UTMS_STORAGE_KEY = "visitavel_utms";
const LEAD_STORAGE_KEY = "visitavel_lead_info";

export interface QuizProgress {
  currentStep: number;
  answers: Record<string, string | string[]>;
  startedAt: string;
  lastUpdated: string;
}

export interface UTMParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  referrer?: string;
}

export interface LeadInfo {
  email: string;
  whatsapp: string;
  capturedAt: string;
}

// Quiz Progress
export function saveQuizProgress(progress: QuizProgress): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error("Error saving quiz progress:", error);
  }
}

export function loadQuizProgress(): QuizProgress | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(QUIZ_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error("Error loading quiz progress:", error);
    return null;
  }
}

export function clearQuizProgress(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(QUIZ_STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing quiz progress:", error);
  }
}

// UTM Parameters
export function saveUTMs(utms: UTMParams): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(UTMS_STORAGE_KEY, JSON.stringify(utms));
  } catch (error) {
    console.error("Error saving UTMs:", error);
  }
}

export function getUTMs(): UTMParams {
  if (typeof window === "undefined") return {};
  try {
    const stored = localStorage.getItem(UTMS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error("Error loading UTMs:", error);
    return {};
  }
}

export function captureUTMsFromURL(): UTMParams {
  if (typeof window === "undefined") return {};

  const params = new URLSearchParams(window.location.search);
  const utms: UTMParams = {
    referrer: document.referrer || undefined,
  };

  const utmKeys = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
  ];
  utmKeys.forEach((key) => {
    const value = params.get(key);
    if (value) {
      utms[key as keyof UTMParams] = value;
    }
  });

  // Salvar se houver algum UTM
  if (Object.keys(utms).length > 1 || utms.referrer) {
    saveUTMs(utms);
  }

  return utms;
}

// Lead Info
export function saveLeadInfo(lead: LeadInfo): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LEAD_STORAGE_KEY, JSON.stringify(lead));
  } catch (error) {
    console.error("Error saving lead info:", error);
  }
}

export function getLeadInfo(): LeadInfo | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(LEAD_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error("Error loading lead info:", error);
    return null;
  }
}

export function clearLeadInfo(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(LEAD_STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing lead info:", error);
  }
}

// Clear all storage
export function clearAllStorage(): void {
  clearQuizProgress();
  clearLeadInfo();
  // Não limpar UTMs pois podem ser úteis para múltiplas sessões
}
