import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const CHESSCOM_USER_AGENT = 'ChessPulse-App/1.0 (contact: support@chesspulse.app)';
const USERNAME_REGEX = /^[a-z0-9_-]{2,40}$/;
const MAX_UPSTREAM_BYTES = 25 * 1024 * 1024; // 25 MB cap to support active grandmaster monthly archives

// Canonical Base URL — never trust unvalidated req.headers.host
function getCanonicalBaseUrl(): string {
  const raw = (process.env.APP_URL || `http://localhost:${PORT}`).trim().replace(/\/+$/, '');
  try {
    const parsed = new URL(raw);
    return parsed.origin;
  } catch {
    return `http://localhost:${PORT}`;
  }
}

// --- In-Memory Rate Limiter (strictly keyed by req.ip with trust proxy = 1) ---
interface RateLimitEntry {
  count: number;
  resetAt: number;
}
const rateLimitMap = new Map<string, RateLimitEntry>();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 60; // 60 requests per minute per IP

function getClientIp(req: Request): string {
  return req.ip || req.socket.remoteAddress || 'unknown';
}

function rateLimitMiddleware(req: Request, res: Response, next: NextFunction) {
  const ip = getClientIp(req);
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return next();
  }

  entry.count += 1;
  if (entry.count > RATE_LIMIT_MAX_REQUESTS) {
    res.setHeader('Retry-After', Math.ceil((entry.resetAt - now) / 1000).toString());
    return res.status(429).json({
      error: 'Too many requests. Please wait a moment before trying again.',
      code: 'RATE_LIMITED',
    });
  }

  return next();
}

// Periodic cleanup of expired rate-limit entries
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap.entries()) {
    if (now > entry.resetAt) {
      rateLimitMap.delete(ip);
    }
  }
}, 60_000).unref();

// --- Short-lived In-Memory Cache for Chess.com API (60s TTL) ---
interface CacheEntry<T = unknown> {
  data: T;
  expiresAt: number;
}
const apiCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 60_000;

function getCached<T>(key: string): T | null {
  const entry = apiCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    apiCache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCached<T>(key: string, data: T, ttlMs = CACHE_TTL_MS) {
  apiCache.set(key, { data, expiresAt: Date.now() + ttlMs });
}

// --- Hardened Upstream Fetch (redirect: 'error' + 25 MB Stream Cap) ---
async function fetchChessComJson(url: string, timeoutMs = 15000): Promise<{ status: number; data: unknown }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'error',
      headers: {
        'User-Agent': CHESSCOM_USER_AGENT,
        Accept: 'application/json',
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      return { status: response.status, data: null };
    }

    const contentLengthHeader = response.headers.get('content-length');
    if (contentLengthHeader && Number(contentLengthHeader) > MAX_UPSTREAM_BYTES) {
      throw new Error('Upstream response exceeds maximum allowed size (25 MB).');
    }

    if (!response.body) {
      return { status: response.status, data: null };
    }

    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let receivedBytes = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        receivedBytes += value.byteLength;
        if (receivedBytes > MAX_UPSTREAM_BYTES) {
          await reader.cancel();
          throw new Error('Upstream response stream exceeded 2 MB limit.');
        }
        chunks.push(value);
      }
    }

    const combined = new Uint8Array(receivedBytes);
    let offset = 0;
    for (const chunk of chunks) {
      combined.set(chunk, offset);
      offset += chunk.byteLength;
    }

    const text = new TextDecoder('utf-8').decode(combined);
    const data: unknown = JSON.parse(text);
    return { status: response.status, data };
  } finally {
    clearTimeout(timer);
  }
}

function sanitizeUsername(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const cleaned = raw.trim().toLowerCase();
  if (!USERNAME_REGEX.test(cleaned)) return null;
  return cleaned;
}

function validateOfficialChessComUrl(rawUrl: unknown): string | undefined {
  if (typeof rawUrl !== 'string' || !rawUrl.trim()) return undefined;
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== 'https:') return undefined;
    const host = parsed.hostname.toLowerCase();
    if (host === 'chess.com' || host === 'www.chess.com' || host.endsWith('.chess.com')) {
      return parsed.toString();
    }
    return undefined;
  } catch {
    return undefined;
  }
}

// --- Strict DTO Builders (Data Minimization & Zero External Avatar Leaks) ---
interface SafeProfileDto {
  username: string;
  title?: string;
  status?: string;
  joined?: number;
  last_online?: number;
  followers?: number;
  url?: string;
  avatar: string; // Always local proxy/SVG path, never external CDN
}

function buildSafeProfileDto(raw: unknown, fallbackUsername: string): SafeProfileDto {
  const obj = typeof raw === 'object' && raw !== null ? (raw as Record<string, unknown>) : {};
  const username =
    typeof obj.username === 'string' && USERNAME_REGEX.test(obj.username.trim().toLowerCase())
      ? obj.username.trim()
      : fallbackUsername;

  return {
    username,
    title: typeof obj.title === 'string' ? obj.title.slice(0, 12) : undefined,
    status: typeof obj.status === 'string' ? obj.status.slice(0, 24) : undefined,
    joined: typeof obj.joined === 'number' && Number.isFinite(obj.joined) ? obj.joined : undefined,
    last_online:
      typeof obj.last_online === 'number' && Number.isFinite(obj.last_online) ? obj.last_online : undefined,
    followers:
      typeof obj.followers === 'number' && Number.isFinite(obj.followers) ? obj.followers : undefined,
    url: validateOfficialChessComUrl(obj.url) || `https://www.chess.com/member/${encodeURIComponent(username.toLowerCase())}`,
    avatar: `/api/chesscom/avatar/${encodeURIComponent(username.toLowerCase())}`,
  };
}

interface SafeCategoryStatDto {
  last?: { rating: number; date?: number };
  best?: { rating: number; date?: number };
  record?: { win: number; loss: number; draw: number };
}

interface SafeStatsDto {
  chess_rapid?: SafeCategoryStatDto;
  chess_blitz?: SafeCategoryStatDto;
  chess_bullet?: SafeCategoryStatDto;
  tactics?: { highest?: { rating: number } };
}

function extractCategoryStatDto(rawCat: unknown): SafeCategoryStatDto | undefined {
  if (typeof rawCat !== 'object' || rawCat === null) return undefined;
  const cat = rawCat as Record<string, unknown>;
  const lastObj = typeof cat.last === 'object' && cat.last !== null ? (cat.last as Record<string, unknown>) : null;
  const bestObj = typeof cat.best === 'object' && cat.best !== null ? (cat.best as Record<string, unknown>) : null;
  const recObj = typeof cat.record === 'object' && cat.record !== null ? (cat.record as Record<string, unknown>) : null;

  return {
    last:
      lastObj && typeof lastObj.rating === 'number' && Number.isFinite(lastObj.rating)
        ? {
            rating: Math.round(lastObj.rating),
            date: typeof lastObj.date === 'number' ? lastObj.date : undefined,
          }
        : undefined,
    best:
      bestObj && typeof bestObj.rating === 'number' && Number.isFinite(bestObj.rating)
        ? {
            rating: Math.round(bestObj.rating),
            date: typeof bestObj.date === 'number' ? bestObj.date : undefined,
          }
        : undefined,
    record: recObj
      ? {
          win: typeof recObj.win === 'number' && Number.isFinite(recObj.win) ? Math.max(0, Math.round(recObj.win)) : 0,
          loss:
            typeof recObj.loss === 'number' && Number.isFinite(recObj.loss) ? Math.max(0, Math.round(recObj.loss)) : 0,
          draw:
            typeof recObj.draw === 'number' && Number.isFinite(recObj.draw) ? Math.max(0, Math.round(recObj.draw)) : 0,
        }
      : undefined,
  };
}

function buildSafeStatsDto(raw: unknown): SafeStatsDto {
  const obj = typeof raw === 'object' && raw !== null ? (raw as Record<string, unknown>) : {};
  const tacticsObj =
    typeof obj.tactics === 'object' && obj.tactics !== null ? (obj.tactics as Record<string, unknown>) : null;
  const highestObj =
    tacticsObj && typeof tacticsObj.highest === 'object' && tacticsObj.highest !== null
      ? (tacticsObj.highest as Record<string, unknown>)
      : null;

  return {
    chess_rapid: extractCategoryStatDto(obj.chess_rapid),
    chess_blitz: extractCategoryStatDto(obj.chess_blitz),
    chess_bullet: extractCategoryStatDto(obj.chess_bullet),
    tactics:
      highestObj && typeof highestObj.rating === 'number' && Number.isFinite(highestObj.rating)
        ? { highest: { rating: Math.round(highestObj.rating) } }
        : undefined,
  };
}

interface SafeMatchGameDto {
  url?: string;
  pgn?: string;
  time_control: string;
  end_time: number;
  rated: boolean;
  time_class: string;
  rules: string;
  accuracies?: {
    white?: number;
    black?: number;
  };
  white: {
    rating: number;
    result: string;
    username: string;
  };
  black: {
    rating: number;
    result: string;
    username: string;
  };
}

function buildSafeMatchGameDto(rawGame: unknown): SafeMatchGameDto | null {
  if (typeof rawGame !== 'object' || rawGame === null) return null;
  const g = rawGame as Record<string, unknown>;
  const whiteObj = typeof g.white === 'object' && g.white !== null ? (g.white as Record<string, unknown>) : null;
  const blackObj = typeof g.black === 'object' && g.black !== null ? (g.black as Record<string, unknown>) : null;
  if (!whiteObj || !blackObj) return null;

  const whiteUsername = typeof whiteObj.username === 'string' ? whiteObj.username.slice(0, 40) : 'White';
  const blackUsername = typeof blackObj.username === 'string' ? blackObj.username.slice(0, 40) : 'Black';

  const accObj =
    typeof g.accuracies === 'object' && g.accuracies !== null ? (g.accuracies as Record<string, unknown>) : null;

  const rawPgn = typeof g.pgn === 'string' && g.pgn.length <= 100_000 ? g.pgn : undefined;

  return {
    url: validateOfficialChessComUrl(g.url),
    pgn: rawPgn,
    time_control: typeof g.time_control === 'string' ? g.time_control.slice(0, 24) : '600',
    end_time: typeof g.end_time === 'number' && Number.isFinite(g.end_time) ? g.end_time : 0,
    rated: Boolean(g.rated),
    time_class: typeof g.time_class === 'string' ? g.time_class.slice(0, 20) : 'rapid',
    rules: typeof g.rules === 'string' ? g.rules.slice(0, 20) : 'chess',
    accuracies: accObj
      ? {
          white:
            typeof accObj.white === 'number' && Number.isFinite(accObj.white)
              ? Math.round(accObj.white * 10) / 10
              : undefined,
          black:
            typeof accObj.black === 'number' && Number.isFinite(accObj.black)
              ? Math.round(accObj.black * 10) / 10
              : undefined,
        }
      : undefined,
    white: {
      rating: typeof whiteObj.rating === 'number' && Number.isFinite(whiteObj.rating) ? Math.round(whiteObj.rating) : 1200,
      result: typeof whiteObj.result === 'string' ? whiteObj.result.slice(0, 32) : 'unknown',
      username: whiteUsername,
    },
    black: {
      rating: typeof blackObj.rating === 'number' && Number.isFinite(blackObj.rating) ? Math.round(blackObj.rating) : 1200,
      result: typeof blackObj.result === 'string' ? blackObj.result.slice(0, 32) : 'unknown',
      username: blackUsername,
    },
  };
}

// --- Prototype-Pollution-Safe In-Memory Telemetry Counter ---
const ALLOWED_ANALYTICS_EVENTS = new Set<string>([
  'page_view',
  'profile_scans',
  'puzzle_solves',
  'user_handle_connected',
  'plan_modal_opened',
  'cookie_consent_accepted',
  'web_vitals_ready',
  'beta_waitlist',
]);

const analyticsCounters: Record<string, number> = Object.create(null);
for (const evt of ALLOWED_ANALYTICS_EVENTS) {
  analyticsCounters[evt] = 0;
}

const ALLOWED_WAITLIST_PLANS = new Set<string>(['free', 'pro', 'club']);

function normalizeWaitlistPlan(rawPlan: unknown): 'free' | 'pro' | 'club' | null {
  if (typeof rawPlan !== 'string') return null;
  const lower = rawPlan.trim().toLowerCase();
  if (ALLOWED_WAITLIST_PLANS.has(lower)) {
    return lower as 'free' | 'pro' | 'club';
  }
  if (lower.includes('free') || lower.includes('starter')) return 'free';
  if (lower.includes('pro') || lower.includes('grandmaster') || lower.includes('annual')) return 'pro';
  if (lower.includes('club') || lower.includes('coach') || lower.includes('academ')) return 'club';
  return null;
}

const app = express();
const isProd = process.env.NODE_ENV === 'production';

app.disable('x-powered-by');
// Trust only the first reverse proxy hop so req.ip cannot be spoofed via client X-Forwarded-For
app.set('trust proxy', 1);

  // Content-Security-Policy & Security Headers via Helmet in production
  if (isProd) {
    app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:'],
            fontSrc: ["'self'", 'data:'],
            connectSrc: ["'self'", 'https://api.chess.com'],
            objectSrc: ["'none'"],
            baseUri: ["'self'"],
            frameAncestors: ["'self'"],
          },
        },
        hsts: {
          maxAge: 31536000,
          includeSubDomains: true,
          preload: false,
        },
        referrerPolicy: {
          policy: 'strict-origin-when-cross-origin',
        },
      })
    );
  }

  // Baseline Security & Transport Headers + Safe HTTPS Redirect using APP_URL
  app.use((req: Request, res: Response, next: NextFunction) => {
    const forwardedProto = req.headers['x-forwarded-proto'];
    if (isProd && forwardedProto && forwardedProto !== 'https') {
      const canonicalBase = getCanonicalBaseUrl().replace(/^http:/, 'https:');
      return res.redirect(301, `${canonicalBase}${req.originalUrl}`);
    }

    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
    next();
  });

  app.use(express.json({ limit: '32kb' }));

  // --- SEO & Crawler Routes (Never trust req.headers.host) ---
  app.get('/robots.txt', (_req: Request, res: Response) => {
    const baseUrl = getCanonicalBaseUrl();
    res.type('text/plain').send(
      [
        'User-agent: *',
        'Allow: /',
        'Disallow: /api/',
        '',
        `Sitemap: ${baseUrl}/sitemap.xml`,
      ].join('\n')
    );
  });

  app.get('/sitemap.xml', (_req: Request, res: Response) => {
    const baseUrl = getCanonicalBaseUrl();
    const today = new Date().toISOString().split('T')[0];
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/?view=puzzles</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/?view=impressum</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.4</priority>
  </url>
  <url>
    <loc>${baseUrl}/?view=datenschutz</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.4</priority>
  </url>
</urlset>`;
    res.type('application/xml').send(xml);
  });

  // --- Health Check Route ---
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'ChessPulse Secure Proxy',
      betaMode: true,
      timestamp: new Date().toISOString(),
    });
  });

  // --- Privacy-First Analytics Endpoints ---
  app.post('/api/analytics/event', rateLimitMiddleware, (req: Request, res: Response) => {
    const rawEvent = typeof req.body?.event === 'string' ? req.body.event.trim() : '';
    if (!ALLOWED_ANALYTICS_EVENTS.has(rawEvent)) {
      return res.status(202).json({ ok: true, ignored: true });
    }
    analyticsCounters[rawEvent] = (analyticsCounters[rawEvent] || 0) + 1;
    return res.status(202).json({ ok: true });
  });

  app.get('/api/analytics/summary', rateLimitMiddleware, (req: Request, res: Response) => {
    const adminToken = process.env.ADMIN_TOKEN;
    const authHeader = req.headers.authorization || '';
    if (!adminToken || authHeader !== `Bearer ${adminToken}`) {
      return res.status(403).json({
        error: 'Forbidden. Valid administrator token required.',
        code: 'FORBIDDEN',
      });
    }
    return res.json({ status: 'ok', counters: { ...analyticsCounters } });
  });

  // --- Local Deterministic SVG Avatar Endpoint (DSGVO Zero External CDN Requests) ---
  app.get('/api/chesscom/avatar/:username', rateLimitMiddleware, (req: Request, res: Response) => {
    const username = sanitizeUsername(req.params.username) || 'cp';
    const initials = username.slice(0, 2).toUpperCase();
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80">
  <rect width="80" height="80" rx="20" fill="#0F172A"/>
  <circle cx="64" cy="16" r="6" fill="#059669"/>
  <text x="40" y="47" text-anchor="middle" fill="#FFFFFF" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="24" font-weight="800">${initials}</text>
</svg>`;
    res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.send(svg);
  });

  // --- Secure Server-Side Proxy for Chess.com Public API ---
  app.use('/api/chesscom', rateLimitMiddleware);

  // 1. Player Profile & Stats Combined Proxy (Strict DTOs)
  app.get('/api/chesscom/player/:username/overview', async (req: Request, res: Response) => {
    const username = sanitizeUsername(req.params.username);
    if (!username) {
      return res.status(400).json({
        error: 'Invalid Chess.com username format.',
        code: 'INVALID_HANDLE',
      });
    }

    const cacheKey = `overview:${username}`;
    const cached = getCached<{ profile: SafeProfileDto; stats: SafeStatsDto }>(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    try {
      const [profileRes, statsRes] = await Promise.all([
        fetchChessComJson(`https://api.chess.com/pub/player/${encodeURIComponent(username)}`),
        fetchChessComJson(`https://api.chess.com/pub/player/${encodeURIComponent(username)}/stats`),
      ]);

      if (profileRes.status === 404) {
        return res.status(404).json({
          error: `Player "${username}" was not found on Chess.com.`,
          code: 'USER_NOT_FOUND',
        });
      }

      if (profileRes.status === 429 || statsRes.status === 429) {
        return res.status(429).json({
          error: 'Upstream Chess.com API rate limit reached. Please retry shortly.',
          code: 'RATE_LIMITED',
        });
      }

      if (profileRes.status !== 200 || !profileRes.data) {
        return res.status(502).json({
          error: 'Unable to retrieve profile from Chess.com API.',
          code: 'UPSTREAM_ERROR',
        });
      }

      const payload = {
        profile: buildSafeProfileDto(profileRes.data, username),
        stats: buildSafeStatsDto(statsRes.data),
      };

      setCached(cacheKey, payload);
      return res.json(payload);
    } catch {
      return res.status(502).json({
        error: 'Upstream Chess.com API request failed or timed out.',
        code: 'UPSTREAM_ERROR',
      });
    }
  });

  // 2. Player Profile Proxy (Strict DTO)
  app.get('/api/chesscom/player/:username', async (req: Request, res: Response) => {
    const username = sanitizeUsername(req.params.username);
    if (!username) {
      return res.status(400).json({ error: 'Invalid Chess.com username format.', code: 'INVALID_HANDLE' });
    }

    const cacheKey = `profile:${username}`;
    const cached = getCached<SafeProfileDto>(cacheKey);
    if (cached) return res.json(cached);

    try {
      const { status, data } = await fetchChessComJson(
        `https://api.chess.com/pub/player/${encodeURIComponent(username)}`
      );
      if (status === 404) {
        return res.status(404).json({ error: 'Player not found on Chess.com.', code: 'USER_NOT_FOUND' });
      }
      if (status !== 200 || !data) {
        return res.status(502).json({ error: 'Chess.com API error.', code: 'UPSTREAM_ERROR' });
      }
      const dto = buildSafeProfileDto(data, username);
      setCached(cacheKey, dto);
      return res.json(dto);
    } catch {
      return res.status(502).json({ error: 'Failed to connect to Chess.com API.', code: 'UPSTREAM_ERROR' });
    }
  });

  // 3. Player Stats Proxy (Strict DTO) - Supports /api/chesscom/player/:username/stats & /api/stats/:username
  app.get(['/api/chesscom/player/:username/stats', '/api/stats/:username', '/api/stats'], rateLimitMiddleware, async (req: Request, res: Response) => {
    const rawUser = req.params.username || req.query.username;
    const username = sanitizeUsername(rawUser);
    if (!username) {
      return res.status(400).json({ error: 'Invalid Chess.com username format.', code: 'INVALID_HANDLE' });
    }

    const cacheKey = `stats_combined:${username}`;
    const cached = getCached<SafeStatsDto & { profile: SafeProfileDto; stats: SafeStatsDto }>(cacheKey);
    if (cached) return res.json(cached);

    try {
      const [profileRes, statsRes] = await Promise.all([
        fetchChessComJson(`https://api.chess.com/pub/player/${encodeURIComponent(username)}`),
        fetchChessComJson(`https://api.chess.com/pub/player/${encodeURIComponent(username)}/stats`),
      ]);
      if (profileRes.status === 404 || statsRes.status === 404) {
        return res.status(404).json({ error: 'Player stats not found.', code: 'USER_NOT_FOUND' });
      }
      if (statsRes.status !== 200 || !statsRes.data) {
        return res.status(502).json({ error: 'Chess.com stats API error.', code: 'UPSTREAM_ERROR' });
      }
      const profileDto = buildSafeProfileDto(profileRes.data, username);
      const statsDto = buildSafeStatsDto(statsRes.data);
      const combined = {
        ...statsDto,
        profile: profileDto,
        stats: statsDto,
      };
      setCached(cacheKey, combined);
      return res.json(combined);
    } catch {
      return res.status(502).json({ error: 'Failed to connect to Chess.com stats API.', code: 'UPSTREAM_ERROR' });
    }
  });

  // 4. Player Recent Matches Proxy (Strict DTOs) - Supports /api/chesscom/player/:username/matches & /api/matches/:username
  app.get(['/api/chesscom/player/:username/matches', '/api/matches/:username', '/api/matches'], rateLimitMiddleware, async (req: Request, res: Response) => {
    const rawUser = req.params.username || req.query.username;
    const username = sanitizeUsername(rawUser);
    if (!username) {
      return res.status(400).json({ error: 'Invalid Chess.com username format.', code: 'INVALID_HANDLE' });
    }

    const rawLimit = Number(req.query.limit);
    const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(1, Math.floor(rawLimit)), 25) : 12;

    const cacheKey = `matches:${username}:${limit}`;
    const cached = getCached<{ games: SafeMatchGameDto[] }>(cacheKey);
    if (cached) return res.json(cached);

    try {
      const archivesRes = await fetchChessComJson(
        `https://api.chess.com/pub/player/${encodeURIComponent(username)}/games/archives`
      );

      if (archivesRes.status === 404) {
        return res.status(404).json({ error: 'No game archives found for this player.', code: 'USER_NOT_FOUND' });
      }

      const archivesObj =
        typeof archivesRes.data === 'object' && archivesRes.data !== null
          ? (archivesRes.data as { archives?: unknown[] })
          : {};
      const archiveList = Array.isArray(archivesObj.archives) ? archivesObj.archives : [];

      if (archivesRes.status !== 200 || archiveList.length === 0) {
        return res.json({ games: [] });
      }

      const latestArchiveRaw = archiveList[archiveList.length - 1];
      if (typeof latestArchiveRaw !== 'string') {
        return res.json({ games: [] });
      }

      // Strictly verify the archive URL points to api.chess.com
      const archiveUrl = new URL(latestArchiveRaw);
      if (archiveUrl.protocol !== 'https:' || archiveUrl.hostname !== 'api.chess.com') {
        return res.status(400).json({ error: 'Invalid archive URL returned by upstream.', code: 'UPSTREAM_ERROR' });
      }

      const gamesRes = await fetchChessComJson(archiveUrl.toString(), 10000);
      const gamesObj =
        typeof gamesRes.data === 'object' && gamesRes.data !== null
          ? (gamesRes.data as { games?: unknown[] })
          : {};
      const rawGames = Array.isArray(gamesObj.games) ? gamesObj.games : [];

      if (gamesRes.status !== 200 || rawGames.length === 0) {
        return res.json({ games: [] });
      }

      const sortedRawGames = [...rawGames].sort((a, b) => {
        const endA = typeof (a as Record<string, unknown>)?.end_time === 'number' ? ((a as Record<string, unknown>).end_time as number) : 0;
        const endB = typeof (b as Record<string, unknown>)?.end_time === 'number' ? ((b as Record<string, unknown>).end_time as number) : 0;
        return endB - endA;
      });

      const games: SafeMatchGameDto[] = [];
      for (const item of sortedRawGames) {
        if (games.length >= limit) break;
        const safeDto = buildSafeMatchGameDto(item);
        if (safeDto) {
          games.push(safeDto);
        }
      }

      const payload = { games };
      setCached(cacheKey, payload);
      return res.json(payload);
    } catch {
      return res.status(502).json({ error: 'Failed to retrieve recent matches from Chess.com.', code: 'UPSTREAM_ERROR' });
    }
  });

  // 5. Beta Waitlist Registration (Strict Whitelist, Zero Input Reflection)
  app.post('/api/beta-waitlist', rateLimitMiddleware, (req: Request, res: Response) => {
    const rawHandle = typeof req.body?.handle === 'string' ? req.body.handle : '';
    const sanitizedHandle = sanitizeUsername(rawHandle);
    const normalizedPlan = normalizeWaitlistPlan(req.body?.planName);

    if (!normalizedPlan) {
      return res.status(400).json({
        error: 'Invalid beta plan selection. Allowed tiers: free, pro, club.',
        code: 'INVALID_PLAN',
      });
    }

    analyticsCounters.beta_waitlist = (analyticsCounters.beta_waitlist || 0) + 1;

    return res.json({
      success: true,
      betaMode: true,
      planTier: normalizedPlan,
      handleVerified: Boolean(sanitizedHandle),
      message:
        'ChessPulse is currently in free public beta for development and website adjustments (0,00 €). Nothing can be bought with real money.',
    });
  });

  // --- Frontend Serving (Vite Dev Middleware vs Production Static Dist) ---
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ChessPulse server running on http://localhost:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
