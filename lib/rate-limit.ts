import { NextResponse } from "next/server";

export interface RateLimitConfig {
  /** Time window in milliseconds. */
  windowMs: number;
  /** Maximum requests allowed within the window. */
  max: number;
}


let _limiterInstance: import("@upstash/ratelimit").Ratelimit | null = null;
let _limiterConfig: string | null = null;

async function getLimiter(
  config: RateLimitConfig
): Promise<import("@upstash/ratelimit").Ratelimit | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    if (process.env.NODE_ENV === "production") {
      console.warn(
        "[rate-limit] UPSTASH_REDIS_REST_URL / TOKEN not set — rate limiting is DISABLED in production!"
      );
    }
    return null;
  }

  const configKey = `${config.windowMs}:${config.max}`;

  // Reuse the existing instance if the config is the same.
  if (_limiterInstance && _limiterConfig === configKey) {
    return _limiterInstance;
  }

  const { Ratelimit } = await import("@upstash/ratelimit");
  const { Redis } = await import("@upstash/redis");

  const redis = new Redis({ url, token });
  _limiterInstance = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(config.max, `${config.windowMs} ms`),
    analytics: false,
    prefix: "shopsafe:rl",
  });
  _limiterConfig = configKey;

  return _limiterInstance;
}

function getIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "anonymous"
  );
}

/**
 * Returns a 429 NextResponse if the caller is rate-limited, null otherwise.
 *
 * Usage:
 *   const limited = await rateLimit(req, { windowMs: 60000, max: 30 });
 *   if (limited) return limited;
 */
export async function rateLimit(
  req: Request,
  config: RateLimitConfig
): Promise<NextResponse | null> {
  const limiter = await getLimiter(config);

  // No Redis configured — fail open.
  if (!limiter) return null;

  const ip = getIp(req);
  const { success, reset } = await limiter.limit(ip);

  if (!success) {
    const retryAfter = Math.ceil((reset - Date.now()) / 1000);
    return NextResponse.json(
      { error: "Too many requests — please slow down" },
      {
        status: 429,
        headers: { "Retry-After": String(retryAfter) },
      }
    );
  }

  return null;
}



export function verifyCsrfOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");

  // No Origin header → server-to-server call → allow.
  if (!origin) return true;

  const allowed = process.env.NEXT_PUBLIC_BASE_URL;
  if (!allowed) {
    // In development without BASE_URL set, allow localhost origins.
    return (
      process.env.NODE_ENV !== "production" ||
      origin.startsWith("http://localhost")
    );
  }

  return origin === allowed || origin === allowed.replace(/\/$/, "");
}