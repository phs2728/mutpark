// Security utilities for MutPark application

import { NextRequest } from 'next/server';

// Rate limiting configuration
interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

// Rate limiter class
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
    this.cleanupOldEntries();
  }

  // Check if request is allowed
  checkLimit(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    // Get existing requests for this identifier
    let userRequests = this.requests.get(identifier) || [];

    // Remove old requests outside the window
    userRequests = userRequests.filter(timestamp => timestamp > windowStart);

    // Check if limit exceeded
    const allowed = userRequests.length < this.config.maxRequests;

    if (allowed) {
      userRequests.push(now);
      this.requests.set(identifier, userRequests);
    }

    return {
      allowed,
      remaining: Math.max(0, this.config.maxRequests - userRequests.length),
      resetTime: windowStart + this.config.windowMs,
    };
  }

  // Clean up old entries periodically
  private cleanupOldEntries(): void {
    setInterval(() => {
      const now = Date.now();
      const windowStart = now - this.config.windowMs;

      for (const [identifier, requests] of this.requests.entries()) {
        const validRequests = requests.filter(timestamp => timestamp > windowStart);

        if (validRequests.length === 0) {
          this.requests.delete(identifier);
        } else {
          this.requests.set(identifier, validRequests);
        }
      }
    }, this.config.windowMs);
  }
}

// Create rate limiters for different endpoints
export const rateLimiters = {
  api: new RateLimiter({ windowMs: 15 * 60 * 1000, maxRequests: 100 }), // 100 requests per 15 minutes
  auth: new RateLimiter({ windowMs: 15 * 60 * 1000, maxRequests: 5 }), // 5 login attempts per 15 minutes
  upload: new RateLimiter({ windowMs: 60 * 1000, maxRequests: 10 }), // 10 uploads per minute
  search: new RateLimiter({ windowMs: 60 * 1000, maxRequests: 30 }), // 30 searches per minute
};

// Get client identifier for rate limiting
export function getClientIdentifier(request: NextRequest): string {
  // Try to get real IP from headers (for production with reverse proxy)
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const remoteAddr = request.headers.get('remote-addr');

  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwardedFor.split(',')[0].trim();
  }

  return realIp || remoteAddr || 'unknown';
}

// Input sanitization
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';

  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

// HTML sanitization
export function sanitizeHtml(html: string): string {
  if (typeof html !== 'string') return '';

  // Basic HTML sanitization - in production, use a library like DOMPurify
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove iframe tags
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '') // Remove object tags
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '') // Remove embed tags
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '') // Remove event handlers
    .replace(/javascript:/gi, ''); // Remove javascript: protocol
}

// SQL injection prevention
export function sanitizeSqlInput(input: string): string {
  if (typeof input !== 'string') return '';

  return input
    .replace(/['";\\]/g, '') // Remove dangerous SQL characters
    .replace(/--/g, '') // Remove SQL comments
    .replace(/\/\*/g, '') // Remove SQL block comments start
    .replace(/\*\//g, '') // Remove SQL block comments end
    .trim();
}

// Password strength validation
export interface PasswordStrength {
  score: number; // 0-5
  isValid: boolean;
  feedback: string[];
}

export function validatePasswordStrength(password: string): PasswordStrength {
  const feedback: string[] = [];
  let score = 0;

  if (!password) {
    return { score: 0, isValid: false, feedback: ['비밀번호를 입력해주세요'] };
  }

  // Length check
  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('최소 8자 이상이어야 합니다');
  }

  // Lowercase check
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('소문자를 포함해야 합니다');
  }

  // Uppercase check
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('대문자를 포함해야 합니다');
  }

  // Number check
  if (/[0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push('숫자를 포함해야 합니다');
  }

  // Special character check
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    score += 1;
  } else {
    feedback.push('특수문자를 포함해야 합니다');
  }

  // Common patterns check
  const commonPatterns = [
    /123456/,
    /password/i,
    /qwerty/i,
    /admin/i,
    /mutpark/i,
  ];

  if (commonPatterns.some(pattern => pattern.test(password))) {
    score = Math.max(0, score - 2);
    feedback.push('일반적인 패턴은 사용할 수 없습니다');
  }

  return {
    score,
    isValid: score >= 4,
    feedback: feedback.length === 0 ? ['강력한 비밀번호입니다'] : feedback,
  };
}

// CSRF token generation and validation
export function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    // Fallback for environments without crypto API
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export function validateCSRFToken(token: string, expectedToken: string): boolean {
  if (!token || !expectedToken) return false;
  return token === expectedToken;
}

// Content Security Policy headers
export function getCSPHeader(): string {
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google-analytics.com https://cdn.jsdelivr.net",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https: blob:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://api.iyzipay.com https://www.google-analytics.com",
    "media-src 'self' blob:",
    "object-src 'none'",
    "frame-src 'self' https://www.youtube.com https://player.vimeo.com",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join('; ');

  return csp;
}

// Security headers
export function getSecurityHeaders(): Record<string, string> {
  return {
    'Content-Security-Policy': getCSPHeader(),
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self)',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'X-XSS-Protection': '1; mode=block',
  };
}

// Turkish ID number (TCKN) validation
export function validateTCKN(tckn: string): boolean {
  if (!tckn || tckn.length !== 11) return false;

  // Must be all digits
  if (!/^\d{11}$/.test(tckn)) return false;

  // First digit cannot be 0
  if (tckn[0] === '0') return false;

  // TCKN algorithm
  const digits = tckn.split('').map(Number);

  // Sum of first 10 digits mod 11 should equal 11th digit
  const sum = digits.slice(0, 10).reduce((acc, digit) => acc + digit, 0);
  if (sum % 11 !== digits[10]) return false;

  // More complex TCKN validation
  const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
  const evenSum = digits[1] + digits[3] + digits[5] + digits[7];

  const checkDigit10 = ((oddSum * 7) - evenSum) % 11;
  if (checkDigit10 !== digits[9]) return false;

  return true;
}

// Turkish company tax number (VKN) validation
export function validateVKN(vkn: string): boolean {
  if (!vkn || vkn.length !== 10) return false;

  // Must be all digits
  if (!/^\d{10}$/.test(vkn)) return false;

  // VKN algorithm
  const digits = vkn.split('').map(Number);
  let sum = 0;

  for (let i = 0; i < 9; i++) {
    let temp = (digits[i] + (10 - i)) % 11;
    if (temp < 2) {
      temp = 10 - temp;
    }
    sum += temp;
  }

  const checkDigit = sum % 11;
  const expectedCheckDigit = checkDigit < 2 ? 10 - checkDigit : checkDigit;

  return expectedCheckDigit === digits[9];
}

// Secure random string generation
export function generateSecureRandomString(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);

    for (let i = 0; i < length; i++) {
      result += chars[array[i] % chars.length];
    }
  } else {
    // Fallback for environments without crypto API
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
  }

  return result;
}

// API key validation
export function validateApiKey(apiKey: string): boolean {
  if (!apiKey) return false;

  // API key should be at least 32 characters
  if (apiKey.length < 32) return false;

  // Should contain only alphanumeric characters
  if (!/^[a-zA-Z0-9]+$/.test(apiKey)) return false;

  return true;
}

// Request signature validation (for webhook security)
export function validateRequestSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  if (!payload || !signature || !secret) return false;

  try {
    // In a real implementation, you would use crypto to create HMAC
    // This is a simplified version
    const expectedSignature = btoa(secret + payload);
    return signature === expectedSignature;
  } catch (error) {
    return false;
  }
}

// Security audit logger
export class SecurityAuditLogger {
  static log(event: string, details: Record<string, any>, level: 'info' | 'warn' | 'error' = 'info'): void {
    const auditEntry = {
      timestamp: new Date().toISOString(),
      event,
      details,
      level,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server',
      url: typeof window !== 'undefined' ? window.location.href : 'server',
    };

    // In production, send to secure audit log service
    console.log(`[SECURITY_AUDIT] ${JSON.stringify(auditEntry)}`);

    // Store critical events in localStorage for debugging
    if (level === 'error' && typeof localStorage !== 'undefined') {
      const key = 'mutpark_security_events';
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      existing.push(auditEntry);

      // Keep only last 50 events
      if (existing.length > 50) {
        existing.splice(0, existing.length - 50);
      }

      localStorage.setItem(key, JSON.stringify(existing));
    }
  }
}

// Session timeout management
export class SessionManager {
  private static readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  private static timeoutId: NodeJS.Timeout | null = null;
  private static warningTimeoutId: NodeJS.Timeout | null = null;

  static startSessionTimer(onTimeout: () => void, onWarning?: () => void): void {
    this.clearSessionTimer();

    // Show warning 5 minutes before timeout
    if (onWarning) {
      this.warningTimeoutId = setTimeout(() => {
        onWarning();
      }, this.SESSION_TIMEOUT - 5 * 60 * 1000);
    }

    // Timeout session
    this.timeoutId = setTimeout(() => {
      onTimeout();
      SecurityAuditLogger.log('session_timeout', {}, 'warn');
    }, this.SESSION_TIMEOUT);
  }

  static resetSessionTimer(onTimeout: () => void, onWarning?: () => void): void {
    this.startSessionTimer(onTimeout, onWarning);
  }

  static clearSessionTimer(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    if (this.warningTimeoutId) {
      clearTimeout(this.warningTimeoutId);
      this.warningTimeoutId = null;
    }
  }
}