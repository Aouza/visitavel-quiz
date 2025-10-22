/**
 * @file: middleware.ts
 * @responsibility: Security middleware for request validation and rate limiting
 */

import { NextRequest, NextResponse } from "next/server";

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limiting configuration (only applies in production)
const RATE_LIMIT = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per window
  apiMaxRequests: 50, // 50 API requests per window (increased from 20 for better UX)
};

function getRateLimitKey(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0] : "unknown";
  return ip;
}

function isRateLimited(key: string, isApi: boolean = false): boolean {
  // Disable rate limiting in development
  if (process.env.NODE_ENV === "development") {
    return false;
  }

  const now = Date.now();
  const limit = isApi ? RATE_LIMIT.apiMaxRequests : RATE_LIMIT.maxRequests;

  const record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + RATE_LIMIT.windowMs,
    });
    return false;
  }

  if (record.count >= limit) {
    return true;
  }

  record.count++;
  return false;
}

function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+=/gi, "") // Remove event handlers
    .trim()
    .substring(0, 1000); // Limit length
}

function validateRequest(request: NextRequest): {
  isValid: boolean;
  error?: string;
} {
  const url = request.url;

  // Check for suspicious patterns
  const suspiciousPatterns = [
    /\.\.\//g, // Directory traversal
    /<script/gi, // Script injection
    /javascript:/gi, // JavaScript protocol
    /on\w+=/gi, // Event handlers
    /union\s+select/gi, // SQL injection
    /drop\s+table/gi, // SQL injection
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(url)) {
      return { isValid: false, error: "Suspicious request pattern detected" };
    }
  }

  // Check Content-Type for POST requests
  if (request.method === "POST") {
    const contentType = request.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return { isValid: false, error: "Invalid content type" };
    }
  }

  return { isValid: true };
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files, Next.js internals, and file extensions
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/static/") ||
    pathname.startsWith("/favicon") ||
    pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/i)
  ) {
    return NextResponse.next();
  }

  // Rate limiting
  const clientKey = getRateLimitKey(request);
  const isApi = pathname.startsWith("/api/");

  if (isRateLimited(clientKey, isApi)) {
    return new NextResponse("Too Many Requests", { status: 429 });
  }

  // Request validation
  const validation = validateRequest(request);
  if (!validation.isValid) {
    return new NextResponse(validation.error, { status: 400 });
  }

  // Security headers for API routes
  if (isApi) {
    const response = NextResponse.next();

    // Add security headers
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-XSS-Protection", "1; mode=block");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (files with extensions)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)).*)",
  ],
};
