/**
 * @file: env-validation.ts
 * @responsibility: Environment variables validation and security
 */

/**
 * Validate required environment variables
 */
export function validateEnvironment(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Required variables
  const requiredVars = [
    "OPENAI_API_KEY",
    "NEXT_PUBLIC_GA_MEASUREMENT_ID",
    "NEXT_PUBLIC_META_PIXEL_ID",
  ];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      errors.push(`Missing required environment variable: ${varName}`);
    }
  }

  // Validate OpenAI API key format
  if (
    process.env.OPENAI_API_KEY &&
    !process.env.OPENAI_API_KEY.startsWith("sk-")
  ) {
    errors.push("OPENAI_API_KEY has invalid format");
  }

  // Validate GA Measurement ID format
  if (
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID &&
    !process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID.startsWith("G-")
  ) {
    errors.push("NEXT_PUBLIC_GA_MEASUREMENT_ID has invalid format");
  }

  // Validate site URL
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    try {
      new URL(process.env.NEXT_PUBLIC_SITE_URL);
    } catch {
      errors.push("NEXT_PUBLIC_SITE_URL has invalid format");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Get sanitized environment variables
 */
export function getSanitizedEnv() {
  return {
    NODE_ENV: process.env.NODE_ENV || "development",
    NEXT_PUBLIC_SITE_URL:
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    NEXT_PUBLIC_GA_MEASUREMENT_ID:
      process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "",
    NEXT_PUBLIC_META_PIXEL_ID: process.env.NEXT_PUBLIC_META_PIXEL_ID || "",
    NEXT_PUBLIC_CLARITY_PROJECT_ID:
      process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID || "",
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
    LEAD_WEBHOOK_URL: process.env.LEAD_WEBHOOK_URL || "",
  };
}

/**
 * Security configuration
 */
export const SECURITY_CONFIG = {
  // Rate limiting
  RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100,
    API_MAX_REQUESTS: 20,
  },

  // Input validation
  MAX_INPUT_LENGTH: 1000,
  MAX_EMAIL_LENGTH: 254,
  MAX_PHONE_LENGTH: 20,

  // Session security
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes

  // Content Security Policy
  CSP: {
    "default-src": "'self'",
    "script-src":
      "'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://www.clarity.ms",
    "style-src": "'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src": "'self' https://fonts.gstatic.com",
    "img-src": "'self' data: https:",
    "connect-src":
      "'self' https://www.google-analytics.com https://analytics.google.com https://www.clarity.ms https://*.clarity.ms",
    "frame-src": "'none'",
    "object-src": "'none'",
    "base-uri": "'self'",
    "form-action": "'self'",
    "frame-ancestors": "'none'",
  },
} as const;
