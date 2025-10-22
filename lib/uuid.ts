/**
 * @file: uuid.ts
 * @responsibility: Gera UUID v4 para event_id (deduplicação Meta)
 * @exports: generateUUID
 */

/**
 * Gera um UUID v4 compatível com RFC4122
 * Usado para deduplicação entre Meta Pixel e Conversions API
 */
export function generateUUID(): string {
  // Gera 16 bytes aleatórios
  const bytes = new Uint8Array(16);

  if (typeof window !== "undefined" && window.crypto) {
    // Browser: usar crypto.getRandomValues
    window.crypto.getRandomValues(bytes);
  } else if (typeof global !== "undefined" && global.crypto) {
    // Node.js: usar crypto.randomBytes
    global.crypto.getRandomValues(bytes);
  } else {
    // Fallback (não recomendado para produção)
    for (let i = 0; i < 16; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }

  // Ajusta bits para UUID v4
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // versão 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // variante RFC4122

  // Converte para string hexadecimal no formato UUID
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join(
    ""
  );

  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(
    12,
    16
  )}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
