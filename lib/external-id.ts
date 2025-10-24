/**
 * @file: external-id.ts
 * @responsibility: Gera e gerencia external_id único do usuário
 * @exports: getExternalId
 */

const EXTERNAL_ID_KEY = "visitavel_external_id";

/**
 * Gera um external_id único e persistente para o usuário
 * Isso melhora drasticamente o matching entre Pixel e CAPI
 */
export function getExternalId(): string {
  if (typeof window === "undefined") return "";

  // Tentar recuperar do localStorage
  const stored = localStorage.getItem(EXTERNAL_ID_KEY);
  if (stored) {
    return stored;
  }

  // Gerar novo ID único
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 15);
  const externalId = `vq_${timestamp}_${random}`;

  // Salvar no localStorage
  try {
    localStorage.setItem(EXTERNAL_ID_KEY, externalId);
  } catch (error) {
    console.warn("[External ID] Erro ao salvar:", error);
  }

  return externalId;
}

/**
 * Limpa o external_id (útil para testes)
 */
export function clearExternalId(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(EXTERNAL_ID_KEY);
}


