/**
 * @file: security.ts
 * @responsibility: Security utilities for input validation and sanitization
 */

/**
 * Sanitize string input to prevent XSS attacks
 */
export function sanitizeString(
  input: string,
  maxLength: number = 1000
): string {
  if (typeof input !== "string") {
    return "";
  }

  return input
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+=/gi, "") // Remove event handlers
    .replace(/data:/gi, "") // Remove data: protocol
    .replace(/vbscript:/gi, "") // Remove vbscript: protocol
    .trim()
    .substring(0, maxLength);
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Validate phone number format (Brazilian)
 */
export function validatePhone(phone: string): boolean {
  const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
  return phoneRegex.test(phone);
}

/**
 * Validate quiz answers
 */
export function validateQuizAnswers(answers: Record<string, any>): boolean {
  // Check if answers object is valid
  if (!answers || typeof answers !== "object") {
    return false;
  }

  // Check for suspicious patterns in answers
  const suspiciousPatterns = [
    /<script/gi,
    /javascript:/gi,
    /on\w+=/gi,
    /union\s+select/gi,
    /drop\s+table/gi,
  ];

  const answersString = JSON.stringify(answers);

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(answersString)) {
      return false;
    }
  }

  return true;
}

/**
 * Sanitize quiz answers
 */
export function sanitizeQuizAnswers(
  answers: Record<string, any>
): Record<string, any> {
  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(answers)) {
    const sanitizedKey = sanitizeString(key, 100);

    if (typeof value === "string") {
      sanitized[sanitizedKey] = sanitizeString(value, 500);
    } else if (Array.isArray(value)) {
      sanitized[sanitizedKey] = value.map((item) =>
        typeof item === "string" ? sanitizeString(item, 500) : item
      );
    } else {
      sanitized[sanitizedKey] = value;
    }
  }

  return sanitized;
}

/**
 * Validate OpenAI API key format
 */
export function validateOpenAIKey(apiKey: string): boolean {
  return apiKey.startsWith("sk-") && apiKey.length > 20;
}

/**
 * Check for SQL injection patterns
 */
export function hasSQLInjection(input: string): boolean {
  const sqlPatterns = [
    /union\s+select/gi,
    /drop\s+table/gi,
    /insert\s+into/gi,
    /delete\s+from/gi,
    /update\s+set/gi,
    /or\s+1\s*=\s*1/gi,
    /and\s+1\s*=\s*1/gi,
  ];

  return sqlPatterns.some((pattern) => pattern.test(input));
}

/**
 * Check for XSS patterns
 */
export function hasXSS(input: string): boolean {
  const xssPatterns = [
    /<script/gi,
    /javascript:/gi,
    /on\w+=/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
    /<link/gi,
    /<meta/gi,
  ];

  return xssPatterns.some((pattern) => pattern.test(input));
}

/**
 * Rate limiting helper
 */
export class RateLimiter {
  private store = new Map<string, { count: number; resetTime: number }>();

  constructor(
    private windowMs: number = 15 * 60 * 1000,
    private maxRequests: number = 100
  ) {}

  isAllowed(key: string): boolean {
    const now = Date.now();
    const record = this.store.get(key);

    if (!record || now > record.resetTime) {
      this.store.set(key, {
        count: 1,
        resetTime: now + this.windowMs,
      });
      return true;
    }

    if (record.count >= this.maxRequests) {
      return false;
    }

    record.count++;
    return true;
  }

  getRemainingRequests(key: string): number {
    const record = this.store.get(key);
    if (!record) return this.maxRequests;

    return Math.max(0, this.maxRequests - record.count);
  }
}

/**
 * Security headers for API responses
 */
export const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy":
    "camera=(), microphone=(), geolocation=(), interest-cohort=()",
} as const;
