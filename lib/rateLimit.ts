/**
 * lib/rateLimit.ts
 * In-memory rate limiter using a sliding window counter.
 * Works per IP address. No external dependencies needed.
 */

// Simple in-memory store: Map<ip, timestamps[]>
const ipWindows = new Map<string, number[]>();

/**
 * Returns true if the request is ALLOWED, false if rate limited.
 * @param ip       - The client IP address
 * @param limit    - Max requests allowed in the window
 * @param windowMs - Time window in milliseconds
 */
export function rateLimit(ip: string, limit: number = 100, windowMs: number = 60_000): boolean {
  const now = Date.now();
  const windowStart = now - windowMs;

  const timestamps = (ipWindows.get(ip) || []).filter(t => t > windowStart);
  timestamps.push(now);
  ipWindows.set(ip, timestamps);

  // Periodically clean up old IPs to prevent memory leaks (every ~1000 new IPs)
  if (ipWindows.size > 1000) {
    for (const [key, ts] of ipWindows.entries()) {
      if (ts.every(t => t <= windowStart)) {
        ipWindows.delete(key);
      }
    }
  }

  return timestamps.length <= limit;
}

/**
 * Extract the real client IP from a Next.js Request object,
 * handling Vercel/Cloudflare/Nginx proxy headers.
 */
export function getClientIp(request: Request): string {
  const headers = request.headers;
  return (
    headers.get("cf-connecting-ip") ||         // Cloudflare
    headers.get("x-real-ip") ||                 // Nginx
    headers.get("x-forwarded-for")?.split(",")[0].trim() || // Standard proxy
    "unknown"
  );
}
