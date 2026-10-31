import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Mandatory server-side User-Agent header for Chess.com Public API compliance.
 * Never exposed to or modifiable by client-side requests.
 */
const CHESSCOM_USER_AGENT =
  'ChessPulse-App/1.0 (https://chesspulse.app; support@chesspulse.app)';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const apiCache = new Map<string, CacheEntry<unknown>>();
const CACHE_TTL_MS = 60 * 1000; // 60 seconds TTL

function getCached<T>(key: string): T | null {
  const entry = apiCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    apiCache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCached<T>(key: string, data: T, ttlMs = CACHE_TTL_MS): void {
  if (apiCache.size > 500) {
    const oldestKey = apiCache.keys().next().value;
    if (oldestKey) apiCache.delete(oldestKey);
  }
  apiCache.set(key, { data, expiresAt: Date.now() + ttlMs });
}

/**
 * Strict input sanitization for Chess.com handles:
 * Lowercases, trims, and enforces strict alphanumeric/underscore/hyphen characters
 * to prevent path traversal, SSRF, or injection attacks.
 */
const SAFE_HANDLE_REGEX = /^[a-z0-9_-]{2,35}$/;
const SAFE_ARCHIVE_URL_REGEX =
  /^https:\/\/api\.chess\.com\/pub\/player\/[a-z0-9_-]{2,35}\/games\/\d{4}\/\d{2}$/;

function sanitizeChessUsername(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const cleaned = raw.trim().toLowerCase();
  if (!SAFE_HANDLE_REGEX.test(cleaned)) {
    return null;
  }
  return cleaned;
}

/**
 * In-memory sliding-window rate limiter per client IP.
 */
interface RateLimitBucket {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitBucket>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute window
const RATE_LIMIT_MAX_REQUESTS = 60; // 60 API calls per minute per IP

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const bucket = rateLimitStore.get(ip) || { timestamps: [] };
  bucket.timestamps = bucket.timestamps.filter(
    (ts) => now - ts < RATE_LIMIT_WINDOW_MS
  );

  if (bucket.timestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
    rateLimitStore.set(ip, bucket);
    return { allowed: false, remaining: 0 };
  }

  bucket.timestamps.push(now);
  rateLimitStore.set(ip, bucket);

  if (rateLimitStore.size > 2000) {
    const firstKey = rateLimitStore.keys().next().value;
    if (firstKey) rateLimitStore.delete(firstKey);
  }

  return {
    allowed: true,
    remaining: Math.max(0, RATE_LIMIT_MAX_REQUESTS - bucket.timestamps.length),
  };
}

async function fetchChessComJson(
  url: string,
  timeoutMs = 7000
): Promise<{
  ok: boolean;
  status: number;
  data: any;
}> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'User-Agent': CHESSCOM_USER_AGENT,
      },
    });
    clearTimeout(timer);
    if (!res.ok) {
      return { ok: false, status: res.status, data: null };
    }
    const data = await res.json();
    return { ok: true, status: res.status, data };
  } catch {
    clearTimeout(timer);
    return { ok: false, status: 503, data: null };
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.disable('x-powered-by');
  app.use(express.json({ limit: '16kb' }));

  // Global Security Headers & Production HTTPS Enforcement (Punkt 4)
  app.use((req, res, next) => {
    const proto = req.headers['x-forwarded-proto'];
    const host = req.headers.host || '';
    const isLocal =
      host.startsWith('localhost') ||
      host.startsWith('127.0.0.1') ||
      host.startsWith('0.0.0.0');

    if (process.env.NODE_ENV === 'production' && proto === 'http' && !isLocal) {
      res.redirect(301, `https://${host}${req.originalUrl}`);
      return;
    }

    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=(), payment=()'
    );
    next();
  });

  // Dynamic robots.txt & sitemap.xml for SEO (Punkt 9)
  app.get('/robots.txt', (req, res) => {
    const baseUrl = (
      process.env.APP_URL ||
      `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host || 'chesspulse.app'}`
    ).replace(/\/$/, '');

    res.type('text/plain').send(
      [
        'User-agent: *',
        'Allow: /',
        'Allow: /puzzles',
        'Allow: /impressum',
        'Allow: /datenschutz',
        'Disallow: /api/',
        '',
        `Sitemap: ${baseUrl}/sitemap.xml`,
      ].join('\n')
    );
  });

  app.get('/sitemap.xml', (req, res) => {
    const baseUrl = (
      process.env.APP_URL ||
      `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host || 'chesspulse.app'}`
    ).replace(/\/$/, '');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/puzzles</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/impressum</loc>
    <changefreq>monthly</changefreq>
    <priority>0.4</priority>
  </url>
  <url>
    <loc>${baseUrl}/datenschutz</loc>
    <changefreq>monthly</changefreq>
    <priority>0.4</priority>
  </url>
</urlset>`;
    res.type('application/xml').send(xml);
  });

  // Zero-Trust API Rate Limiting Middleware (Punkt 18)
  app.use('/api', (req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');

    const forwarded = req.headers['x-forwarded-for'];
    const clientIp =
      (typeof forwarded === 'string'
        ? forwarded.split(',')[0].trim()
        : req.ip) || 'unknown';

    const rateStatus = checkRateLimit(clientIp);
    res.setHeader('X-RateLimit-Limit', String(RATE_LIMIT_MAX_REQUESTS));
    res.setHeader('X-RateLimit-Remaining', String(rateStatus.remaining));

    if (!rateStatus.allowed) {
      res.status(429).json({
        code: 'RATE_LIMITED',
        error:
          'Too many requests from this connection. Please wait 60 seconds and try again.',
      });
      return;
    }

    next();
  });

  // Privacy-First Anonymous Analytics Collector (Punkt 19)
  const analyticsCounters: Record<string, number> = {
    page_views: 0,
    profile_scans: 0,
    puzzle_solves: 0,
  };

  app.post('/api/analytics/event', (req, res) => {
    // Reject honeypot spam bots
    if (req.body?.website_url) {
      res.status(204).end();
      return;
    }
    const rawEvent =
      typeof req.body?.event === 'string'
        ? req.body.event.trim().replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 48)
        : 'unknown';
    if (rawEvent) {
      analyticsCounters[rawEvent] = (analyticsCounters[rawEvent] || 0) + 1;
    }
    res.status(202).json({ ok: true });
  });

  app.get('/api/analytics/summary', (_req, res) => {
    res.json({ code: 'OK', metrics: analyticsCounters });
  });

  /**
   * POST /api/beta-waitlist
   * Registers user handle/email for the free public beta & pro launch notifications
   * with spam honeypot validation and zero payment data collection.
   */
  app.post('/api/beta-waitlist', (req, res) => {
    // Honeypot spam filter (Punkt 18)
    if (typeof req.body?.website_url === 'string' && req.body.website_url.trim() !== '') {
      res.status(400).json({
        code: 'SPAM_DETECTED',
        error: 'Automated submission blocked.',
      });
      return;
    }

    const rawHandle = typeof req.body?.handle === 'string' ? req.body.handle : '';
    const cleanHandle = sanitizeChessUsername(rawHandle.replace(/^@/, '')) || 'beta_player';
    const rawPlan =
      typeof req.body?.planName === 'string'
        ? req.body.planName.trim().slice(0, 64)
        : 'Pro Monthly';

    analyticsCounters.beta_waitlist = (analyticsCounters.beta_waitlist || 0) + 1;

    res.json({
      code: 'OK',
      status: 'BETA_ACCESS_UNLOCKED',
      handle: cleanHandle,
      planName: rawPlan,
      message:
        'ChessPulse Pro is currently in free public beta. Enjoy uninhibited access during our launch phase!',
    });
  });

  /**
   * GET /api/chesscom/player/:username
   * Proxies Chess.com player profile + stats with mandatory User-Agent header.
   */
  app.get('/api/chesscom/player/:username', async (req, res) => {
    const rawUsername = req.params.username || '';
    const cleanUsername = sanitizeChessUsername(rawUsername);

    if (!cleanUsername) {
      res.status(400).json({
        code: 'USER_NOT_FOUND',
        error:
          'Invalid Chess.com username format. Use 2–35 letters, numbers, underscores, or hyphens.',
      });
      return;
    }

    const cacheKey = `profile:${cleanUsername}`;
    const cached = getCached<any>(cacheKey);
    if (cached) {
      res.json(cached);
      return;
    }

    const encoded = encodeURIComponent(cleanUsername);
    const [profileRes, statsRes] = await Promise.all([
      fetchChessComJson(`https://api.chess.com/pub/player/${encoded}`),
      fetchChessComJson(`https://api.chess.com/pub/player/${encoded}/stats`),
    ]);

    if (!profileRes.ok) {
      if (profileRes.status === 404) {
        res.status(404).json({
          code: 'USER_NOT_FOUND',
          error: `Player "${cleanUsername}" was not found on Chess.com.`,
        });
        return;
      }
      if (profileRes.status === 429) {
        res.status(429).json({
          code: 'RATE_LIMITED',
          error: 'Chess.com API rate limit reached. Please retry in a few seconds.',
        });
        return;
      }
      res.status(profileRes.status || 502).json({
        code: 'NETWORK_ERROR',
        error: 'Unable to reach Chess.com public API right now.',
      });
      return;
    }

    const payload = {
      code: 'OK',
      profile: profileRes.data,
      stats: statsRes.ok ? statsRes.data : {},
    };

    setCached(cacheKey, payload);
    res.json(payload);
  });

  /**
   * GET /api/chesscom/player/:username/stats
   * Proxies real player statistics directly from Chess.com Public API (/pub/player/{username}/stats)
   * along with live profile metadata and recent game rating/accuracy history.
   */
  app.get('/api/chesscom/player/:username/stats', async (req, res) => {
    const rawUsername = req.params.username || '';
    const cleanUsername = sanitizeChessUsername(rawUsername);

    if (!cleanUsername) {
      res.status(400).json({
        code: 'USER_NOT_FOUND',
        error:
          'Invalid Chess.com username format. Use 2–35 letters, numbers, underscores, or hyphens.',
      });
      return;
    }

    const cacheKey = `live_stats:${cleanUsername}`;
    const cached = getCached<any>(cacheKey);
    if (cached) {
      res.json(cached);
      return;
    }

    const encoded = encodeURIComponent(cleanUsername);
    const [profileRes, statsRes, archivesRes] = await Promise.all([
      fetchChessComJson(`https://api.chess.com/pub/player/${encoded}`),
      fetchChessComJson(`https://api.chess.com/pub/player/${encoded}/stats`),
      fetchChessComJson(`https://api.chess.com/pub/player/${encoded}/games/archives`),
    ]);

    if (!profileRes.ok || !statsRes.ok) {
      const status = !profileRes.ok ? profileRes.status : statsRes.status;
      if (status === 404) {
        res.status(404).json({
          code: 'USER_NOT_FOUND',
          error: `Player "${cleanUsername}" was not found on Chess.com.`,
        });
        return;
      }
      if (status === 429) {
        res.status(429).json({
          code: 'RATE_LIMITED',
          error: 'Chess.com API rate limit reached. Please retry in a few seconds.',
        });
        return;
      }
      res.status(status || 502).json({
        code: 'NETWORK_ERROR',
        error: 'Unable to reach Chess.com public API right now.',
      });
      return;
    }

    // Extract real recent games from the latest monthly archive for live accuracy & rating trend
    let recentGamesSummary: Array<{
      endTime: number;
      timeClass: string;
      userRating: number;
      opponentUsername: string;
      opponentRating: number;
      result: 'win' | 'loss' | 'draw';
      accuracy: number | null;
    }> = [];

    const archivesList: string[] = archivesRes.ok ? archivesRes.data?.archives || [] : [];
    const safeArchives = archivesList.filter(
      (u) => typeof u === 'string' && SAFE_ARCHIVE_URL_REGEX.test(u)
    );

    if (safeArchives.length > 0) {
      const latestArchiveUrl = safeArchives[safeArchives.length - 1];
      const latestArchive = await fetchChessComJson(latestArchiveUrl, 6500);
      if (latestArchive.ok && Array.isArray(latestArchive.data?.games)) {
        const rawGames = [...latestArchive.data.games]
          .sort((a, b) => (b.end_time || 0) - (a.end_time || 0))
          .slice(0, 12);

        recentGamesSummary = rawGames.map((g: any) => {
          const isWhite = (g.white?.username || '').toLowerCase() === cleanUsername;
          const userSide = isWhite ? g.white : g.black;
          const oppSide = isWhite ? g.black : g.white;
          const rawResult = userSide?.result || '';
          const isWin = rawResult === 'win';
          const isDraw =
            rawResult === 'agreed' ||
            rawResult === 'repetition' ||
            rawResult === 'timevsinsufficient' ||
            rawResult === 'stalemate' ||
            rawResult === '50move' ||
            rawResult === 'insufficient';

          const rawAcc = isWhite ? g.accuracies?.white : g.accuracies?.black;
          const accuracy =
            typeof rawAcc === 'number' && !Number.isNaN(rawAcc)
              ? Math.round(rawAcc * 10) / 10
              : null;

          return {
            endTime: g.end_time || 0,
            timeClass: g.time_class || 'blitz',
            userRating: userSide?.rating || 0,
            opponentUsername: oppSide?.username || 'Opponent',
            opponentRating: oppSide?.rating || 0,
            result: isWin ? 'win' : isDraw ? 'draw' : 'loss',
            accuracy,
          };
        });
      }
    }

    const payload = {
      code: 'OK',
      profile: profileRes.data,
      stats: statsRes.data,
      recentGames: recentGamesSummary,
    };

    setCached(cacheKey, payload);
    res.json(payload);
  });

  /**
   * GET /api/chesscom/player/:username/matches
   * Proxies Chess.com monthly game archives and returns the 10 most recent games.
   */
  app.get('/api/chesscom/player/:username/matches', async (req, res) => {
    const rawUsername = req.params.username || '';
    const cleanUsername = sanitizeChessUsername(rawUsername);

    if (!cleanUsername) {
      res.status(400).json({
        code: 'USER_NOT_FOUND',
        error:
          'Invalid Chess.com username format. Use 2–35 letters, numbers, underscores, or hyphens.',
        games: [],
      });
      return;
    }

    const cacheKey = `matches:${cleanUsername}`;
    const cached = getCached<any>(cacheKey);
    if (cached) {
      res.json(cached);
      return;
    }

    const encoded = encodeURIComponent(cleanUsername);
    const archivesRes = await fetchChessComJson(
      `https://api.chess.com/pub/player/${encoded}/games/archives`
    );

    if (!archivesRes.ok) {
      if (archivesRes.status === 404) {
        res.status(404).json({
          code: 'USER_NOT_FOUND',
          error: `No Chess.com profile found for "${cleanUsername}".`,
          games: [],
        });
        return;
      }
      if (archivesRes.status === 429) {
        res.status(429).json({
          code: 'RATE_LIMITED',
          error: 'Chess.com API rate limit reached. Please wait a moment and retry.',
          games: [],
        });
        return;
      }
      res.status(archivesRes.status || 502).json({
        code: 'NETWORK_ERROR',
        error: 'Unable to connect to Chess.com match archive service.',
        games: [],
      });
      return;
    }

    const archivesList: string[] = archivesRes.data?.archives || [];
    const safeArchives = archivesList.filter(
      (u) => typeof u === 'string' && SAFE_ARCHIVE_URL_REGEX.test(u)
    );

    if (safeArchives.length === 0) {
      const emptyPayload = {
        code: 'NO_GAMES_FOUND',
        error: `No public game archives found for @${cleanUsername} on Chess.com.`,
        games: [],
      };
      setCached(cacheKey, emptyPayload);
      res.json(emptyPayload);
      return;
    }

    // Fetch up to the last 2 monthly archives to guarantee recent games
    const recentArchiveUrls = safeArchives.slice(-2);
    const archiveResults = await Promise.all(
      recentArchiveUrls.map((url) => fetchChessComJson(url, 8000))
    );

    const allGames: any[] = [];
    for (const archive of archiveResults) {
      if (archive.ok && Array.isArray(archive.data?.games)) {
        allGames.push(...archive.data.games);
      }
    }

    allGames.sort((a, b) => (b.end_time || 0) - (a.end_time || 0));
    const recentGames = allGames.slice(0, 10);

    const payload = {
      code: recentGames.length > 0 ? 'OK' : 'NO_GAMES_FOUND',
      games: recentGames,
    };

    setCached(cacheKey, payload);
    res.json(payload);
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ChessPulse server listening on http://localhost:${PORT}`);
  });
}

startServer();
