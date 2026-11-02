import express, { Request, Response, NextFunction } from 'express';

const CHESSCOM_USER_AGENT = 'ChessPulse-App/1.0 (contact: support@chesspulse.app)';
const USERNAME_REGEX = /^[a-z0-9_-]{2,40}$/;
const MAX_UPSTREAM_BYTES = 25 * 1024 * 1024; // 25 MB cap for large monthly archives

// --- Bounded In-Memory Rate Limiter (keyed by req.ip) ---
interface RateLimitEntry {
  count: number;
  resetAt: number;
}
const rateLimitMap = new Map<string, RateLimitEntry>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 60;
const MAX_RATE_LIMIT_ENTRIES = 1000;

function rateLimitMiddleware(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    if (rateLimitMap.size >= MAX_RATE_LIMIT_ENTRIES) {
      const oldestKey = rateLimitMap.keys().next().value;
      if (oldestKey !== undefined) rateLimitMap.delete(oldestKey);
    }
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

// --- Bounded In-Memory Upstream Cache (60s TTL) ---
interface CacheEntry<T = unknown> {
  data: T;
  expiresAt: number;
}
const apiCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 60_000;
const MAX_CACHE_ENTRIES = 200;

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
  if (apiCache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = apiCache.keys().next().value;
    if (oldestKey !== undefined) apiCache.delete(oldestKey);
  }
  apiCache.set(key, { data, expiresAt: Date.now() + ttlMs });
}

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);

// Strict Security Headers on all API responses
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  next();
});

app.use(express.json({ limit: '32kb' }));

function sanitizeUsername(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const cleaned = raw.trim().replace(/^@/, '').toLowerCase();
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

function getAbortSignal(timeoutMs = 6000): { signal: AbortSignal; cleanup: () => void } {
  if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') {
    return { signal: AbortSignal.timeout(timeoutMs), cleanup: () => {} };
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return {
    signal: controller.signal,
    cleanup: () => clearTimeout(timer),
  };
}

async function fetchChessComJson(url: string, timeoutMs = 6000): Promise<{ status: number; data: any }> {
  const { signal, cleanup } = getAbortSignal(timeoutMs);
  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'error',
      headers: {
        'User-Agent': CHESSCOM_USER_AGENT,
        Accept: 'application/json',
      },
      signal,
    });
    if (!response.ok) {
      return { status: response.status, data: null };
    }
    const contentLengthHeader = response.headers.get('content-length');
    if (contentLengthHeader && Number(contentLengthHeader) > MAX_UPSTREAM_BYTES) {
      throw new Error('Upstream response exceeds maximum allowed size (25 MB).');
    }
    const data = await response.json();
    return { status: response.status, data };
  } finally {
    cleanup();
  }
}

function buildSafeProfileDto(raw: any, fallbackUsername: string) {
  const obj = typeof raw === 'object' && raw !== null ? raw : {};
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
    url:
      validateOfficialChessComUrl(obj.url) ||
      `https://www.chess.com/member/${encodeURIComponent(username.toLowerCase())}`,
    avatar: `/api/chesscom/avatar/${encodeURIComponent(username.toLowerCase())}`,
  };
}

function extractCategoryStatDto(rawCat: any) {
  if (typeof rawCat !== 'object' || rawCat === null) return undefined;
  return {
    last:
      rawCat.last && typeof rawCat.last.rating === 'number'
        ? { rating: Math.round(rawCat.last.rating), date: rawCat.last.date }
        : undefined,
    best:
      rawCat.best && typeof rawCat.best.rating === 'number'
        ? { rating: Math.round(rawCat.best.rating), date: rawCat.best.date }
        : undefined,
    record: rawCat.record
      ? {
          win: typeof rawCat.record.win === 'number' ? Math.max(0, Math.round(rawCat.record.win)) : 0,
          loss: typeof rawCat.record.loss === 'number' ? Math.max(0, Math.round(rawCat.record.loss)) : 0,
          draw: typeof rawCat.record.draw === 'number' ? Math.max(0, Math.round(rawCat.record.draw)) : 0,
        }
      : undefined,
  };
}

function buildSafeStatsDto(raw: any) {
  const obj = typeof raw === 'object' && raw !== null ? raw : {};
  return {
    chess_rapid: extractCategoryStatDto(obj.chess_rapid),
    chess_blitz: extractCategoryStatDto(obj.chess_blitz),
    chess_bullet: extractCategoryStatDto(obj.chess_bullet),
    tactics:
      typeof obj.tactics?.highest?.rating === 'number'
        ? { highest: { rating: Math.round(obj.tactics.highest.rating) } }
        : undefined,
  };
}

function buildSafeMatchGameDto(g: any) {
  if (typeof g !== 'object' || g === null || !g.white || !g.black) return null;
  const rawPgn = typeof g.pgn === 'string' && g.pgn.length <= 100_000 ? g.pgn : undefined;
  return {
    url: validateOfficialChessComUrl(g.url),
    pgn: rawPgn,
    time_control: typeof g.time_control === 'string' ? g.time_control.slice(0, 24) : '600',
    end_time: typeof g.end_time === 'number' ? g.end_time : 0,
    rated: Boolean(g.rated),
    time_class: typeof g.time_class === 'string' ? g.time_class.slice(0, 20) : 'rapid',
    rules: typeof g.rules === 'string' ? g.rules.slice(0, 20) : 'chess',
    accuracies: g.accuracies
      ? {
          white: typeof g.accuracies.white === 'number' ? Math.round(g.accuracies.white * 10) / 10 : undefined,
          black: typeof g.accuracies.black === 'number' ? Math.round(g.accuracies.black * 10) / 10 : undefined,
        }
      : undefined,
    white: {
      rating: typeof g.white.rating === 'number' ? Math.round(g.white.rating) : 1200,
      result: typeof g.white.result === 'string' ? g.white.result.slice(0, 32) : 'unknown',
      username: typeof g.white.username === 'string' ? g.white.username.slice(0, 40) : 'White',
    },
    black: {
      rating: typeof g.black.rating === 'number' ? Math.round(g.black.rating) : 1200,
      result: typeof g.black.result === 'string' ? g.black.result.slice(0, 32) : 'unknown',
      username: typeof g.black.username === 'string' ? g.black.username.slice(0, 40) : 'Black',
    },
  };
}

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'ChessPulse Vercel Proxy', betaMode: true });
});

app.post('/api/analytics/event', rateLimitMiddleware, (_req: Request, res: Response) => {
  res.status(202).json({ ok: true });
});

app.get('/api/chesscom/avatar/:username', rateLimitMiddleware, (req: Request, res: Response) => {
  const username = sanitizeUsername(req.params.username) || 'cp';
  const initials = username.slice(0, 2).toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80">
  <rect width="80" height="80" rx="20" fill="#0F172A"/>
  <circle cx="64" cy="16" r="6" fill="#059669"/>
  <text x="40" y="47" text-anchor="middle" fill="#FFFFFF" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="24" font-weight="800">${initials}</text>
</svg>`;
  res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
  res.send(svg);
});

app.get(
  ['/api/chesscom/player/:username/overview', '/api/chesscom/player/:username/stats', '/api/stats/:username', '/api/stats'],
  rateLimitMiddleware,
  async (req: Request, res: Response) => {
    const username = sanitizeUsername(req.params.username || req.query.username);
    if (!username) {
      return res.status(400).json({ error: 'Invalid Chess.com username format.', code: 'INVALID_HANDLE' });
    }

    const cacheKey = `overview:${username}`;
    const cached = getCached<any>(cacheKey);
    if (cached) {
      res.setHeader('Cache-Control', 'public, max-age=30, s-maxage=60, stale-while-revalidate=120');
      return res.json(cached);
    }

    try {
      const [profileRes, statsRes] = await Promise.all([
        fetchChessComJson(`https://api.chess.com/pub/player/${encodeURIComponent(username)}`),
        fetchChessComJson(`https://api.chess.com/pub/player/${encodeURIComponent(username)}/stats`),
      ]);
      if (profileRes.status === 404) {
        return res.status(404).json({ error: `Player "${username}" was not found on Chess.com.`, code: 'USER_NOT_FOUND' });
      }
      if (profileRes.status === 429 || statsRes.status === 429) {
        return res.status(429).json({ error: 'Upstream Chess.com API rate limit reached.', code: 'RATE_LIMITED' });
      }
      if (profileRes.status !== 200 || !profileRes.data) {
        return res.status(502).json({ error: 'Unable to retrieve profile from Chess.com API.', code: 'UPSTREAM_ERROR' });
      }
      const profileDto = buildSafeProfileDto(profileRes.data, username);
      const statsDto = buildSafeStatsDto(statsRes.data);
      const payload = {
        ...statsDto,
        profile: profileDto,
        stats: statsDto,
      };
      setCached(cacheKey, payload);
      res.setHeader('Cache-Control', 'public, max-age=30, s-maxage=60, stale-while-revalidate=120');
      return res.json(payload);
    } catch {
      return res.status(502).json({ error: 'Upstream Chess.com API request failed.', code: 'UPSTREAM_ERROR' });
    }
  }
);

app.get(
  ['/api/chesscom/player/:username/matches', '/api/matches/:username', '/api/matches'],
  rateLimitMiddleware,
  async (req: Request, res: Response) => {
    const username = sanitizeUsername(req.params.username || req.query.username);
    if (!username) {
      return res.status(400).json({ error: 'Invalid Chess.com username format.', code: 'INVALID_HANDLE' });
    }
    const rawLimit = Number(req.query.limit);
    const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(1, Math.floor(rawLimit)), 25) : 12;

    const cacheKey = `matches:${username}:${limit}`;
    const cached = getCached<{ games: any[] }>(cacheKey);
    if (cached) {
      res.setHeader('Cache-Control', 'public, max-age=30, s-maxage=60, stale-while-revalidate=120');
      return res.json(cached);
    }

    try {
      const archivesRes = await fetchChessComJson(
        `https://api.chess.com/pub/player/${encodeURIComponent(username)}/games/archives`
      );
      if (archivesRes.status === 404) {
        return res.status(404).json({ error: 'No game archives found for this player.', code: 'USER_NOT_FOUND' });
      }
      const archiveList = Array.isArray(archivesRes.data?.archives) ? archivesRes.data.archives : [];
      if (archiveList.length === 0) {
        return res.json({ games: [] });
      }
      const latestArchiveRaw = archiveList[archiveList.length - 1];
      if (typeof latestArchiveRaw !== 'string') {
        return res.json({ games: [] });
      }
      // Strict SSRF validation: archive URL must point to https://api.chess.com
      const archiveUrl = new URL(latestArchiveRaw);
      if (archiveUrl.protocol !== 'https:' || archiveUrl.hostname !== 'api.chess.com') {
        return res.status(400).json({ error: 'Invalid archive URL returned by upstream.', code: 'UPSTREAM_ERROR' });
      }

      const gamesRes = await fetchChessComJson(archiveUrl.toString(), 6000);
      const rawGames = Array.isArray(gamesRes.data?.games) ? gamesRes.data.games : [];
      const sorted = [...rawGames].sort((a, b) => (b?.end_time || 0) - (a?.end_time || 0));
      const games = [];
      for (const item of sorted) {
        if (games.length >= limit) break;
        const dto = buildSafeMatchGameDto(item);
        if (dto) games.push(dto);
      }
      const payload = { games };
      setCached(cacheKey, payload);
      res.setHeader('Cache-Control', 'public, max-age=30, s-maxage=60, stale-while-revalidate=120');
      return res.json(payload);
    } catch {
      return res.status(502).json({ error: 'Failed to retrieve recent matches from Chess.com.', code: 'UPSTREAM_ERROR' });
    }
  }
);

// All-Time Archive List Route
app.get('/api/chesscom/player/:username/archives', rateLimitMiddleware, async (req: Request, res: Response) => {
  const username = sanitizeUsername(req.params.username);
  if (!username) {
    return res.status(400).json({ error: 'Invalid Chess.com username format.', code: 'INVALID_HANDLE' });
  }

  const cacheKey = `archives_list:${username}`;
  const cached = getCached<{ archives: string[] }>(cacheKey);
  if (cached) {
    res.setHeader('Cache-Control', 'public, max-age=120, s-maxage=300');
    return res.json(cached);
  }

  try {
    const archivesRes = await fetchChessComJson(
      `https://api.chess.com/pub/player/${encodeURIComponent(username)}/games/archives`,
      6000
    );
    if (archivesRes.status === 404) {
      return res.status(404).json({ error: 'Player archives not found.', code: 'USER_NOT_FOUND' });
    }
    const rawList = Array.isArray(archivesRes.data?.archives) ? archivesRes.data.archives : [];
    const safeArchives = rawList.filter(
      (u: unknown): u is string =>
        typeof u === 'string' && /^https:\/\/api\.chess\.com\/pub\/player\/[a-z0-9_-]+\/games\/\d{4}\/\d{2}$/i.test(u)
    );
    const payload = { archives: safeArchives };
    setCached(cacheKey, payload, 120_000);
    res.setHeader('Cache-Control', 'public, max-age=120, s-maxage=300');
    return res.json(payload);
  } catch {
    return res.status(502).json({ error: 'Failed to retrieve archive list from Chess.com.', code: 'UPSTREAM_ERROR' });
  }
});

// Single Monthly Archive Games Route (YYYY/MM)
app.get(
  '/api/chesscom/player/:username/archive/:year/:month',
  rateLimitMiddleware,
  async (req: Request, res: Response) => {
    const username = sanitizeUsername(req.params.username);
    const year = String(req.params.year || '').trim();
    const month = String(req.params.month || '').trim().padStart(2, '0');
    if (!username || !/^\d{4}$/.test(year) || !/^(0[1-9]|1[0-2])$/.test(month)) {
      return res.status(400).json({ error: 'Invalid archive parameters.', code: 'INVALID_PARAMS' });
    }

    const cacheKey = `archive_month:${username}:${year}:${month}`;
    const cached = getCached<{ games: any[] }>(cacheKey);
    if (cached) {
      res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=600');
      return res.json(cached);
    }

    try {
      const url = `https://api.chess.com/pub/player/${encodeURIComponent(username)}/games/${year}/${month}`;
      const gamesRes = await fetchChessComJson(url, 6000);
      if (gamesRes.status === 404) {
        return res.json({ games: [] });
      }
      const rawGames = Array.isArray(gamesRes.data?.games) ? gamesRes.data.games : [];
      const games = [];
      for (const item of rawGames) {
        const dto = buildSafeMatchGameDto(item);
        if (dto) games.push(dto);
      }
      const payload = { games };
      setCached(cacheKey, payload, 300_000);
      res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=600');
      return res.json(payload);
    } catch {
      return res.status(502).json({ error: 'Failed to retrieve monthly archive.', code: 'UPSTREAM_ERROR' });
    }
  }
);

app.post('/api/beta-waitlist', rateLimitMiddleware, (_req: Request, res: Response) => {
  res.json({
    success: true,
    betaMode: true,
    message: 'ChessPulse is currently in free public beta (0,00 €). Nothing can be bought with real money.',
  });
});

const FEN_SAFE_REGEX = /^[rnbqkpRNBQKP1-8/]+ [wb] (-|[KQkq]{1,4}) (-|[a-h][36])( \d+ \d+)?$/;

async function queryLichessCloudFen(rawFen: unknown) {
  if (typeof rawFen !== 'string') return { found: false };
  const fen = rawFen.trim();
  if (fen.length < 15 || fen.length > 100 || !FEN_SAFE_REGEX.test(fen)) {
    return { found: false };
  }

  const cacheKey = `lichess_eval_mpv3:${fen}`;
  const cached = getCached<any>(cacheKey);
  if (cached) return cached;

  const { signal, cleanup } = getAbortSignal(2800);
  try {
    const response = await fetch(
      `https://lichess.org/api/cloud-eval?fen=${encodeURIComponent(fen)}&multiPv=3`,
      {
        method: 'GET',
        redirect: 'error',
        headers: {
          'User-Agent': CHESSCOM_USER_AGENT,
          Accept: 'application/json',
        },
        signal,
      }
    );

    if (!response.ok) {
      const miss = { found: false };
      setCached(cacheKey, miss, 300_000);
      return miss;
    }

    const data: any = await response.json();
    const rawPvs = Array.isArray(data?.pvs) ? data.pvs : [];
    if (rawPvs.length === 0 || typeof rawPvs[0]?.moves !== 'string') {
      const miss = { found: false };
      setCached(cacheKey, miss, 300_000);
      return miss;
    }

    const parsedPvs = rawPvs.slice(0, 3).map((pv: any) => {
      const uciMoves =
        typeof pv?.moves === 'string'
          ? pv.moves
              .trim()
              .split(/\s+/)
              .filter((m: string) => /^[a-h][1-8][a-h][1-8][qrbn]?$/.test(m))
              .slice(0, 6)
          : [];
      return {
        cp: typeof pv?.cp === 'number' && Number.isFinite(pv.cp) ? pv.cp : undefined,
        mate: typeof pv?.mate === 'number' && Number.isFinite(pv.mate) ? pv.mate : undefined,
        uciMoves,
      };
    });

    const firstPv = parsedPvs[0];
    const hit = {
      found: true,
      depth: typeof data.depth === 'number' ? data.depth : 22,
      knodes: typeof data.knodes === 'number' ? data.knodes : undefined,
      cp: firstPv.cp,
      mate: firstPv.mate,
      uciMoves: firstPv.uciMoves,
      pvs: parsedPvs,
    };
    setCached(cacheKey, hit, 300_000);
    return hit;
  } catch {
    return { found: false };
  } finally {
    cleanup();
  }
}

async function queryLichessOpeningExplorer(rawFen: unknown) {
  if (typeof rawFen !== 'string') return { isBook: false };
  const fen = rawFen.trim();
  if (fen.length < 15 || fen.length > 100 || !FEN_SAFE_REGEX.test(fen)) {
    return { isBook: false };
  }

  const cacheKey = `lichess_masters:${fen}`;
  const cached = getCached<any>(cacheKey);
  if (cached) return cached;

  const { signal, cleanup } = getAbortSignal(2500);
  try {
    const response = await fetch(
      `https://explorer.lichess.ovh/masters?fen=${encodeURIComponent(fen)}&moves=5&topGames=0`,
      {
        method: 'GET',
        redirect: 'error',
        headers: {
          'User-Agent': CHESSCOM_USER_AGENT,
          Accept: 'application/json',
        },
        signal,
      }
    );

    if (!response.ok) {
      return { isBook: false };
    }

    const data: any = await response.json();
    const white = typeof data?.white === 'number' ? data.white : 0;
    const draws = typeof data?.draws === 'number' ? data.draws : 0;
    const black = typeof data?.black === 'number' ? data.black : 0;
    const totalGames = white + draws + black;
    const opening = data?.opening;

    const result = {
      isBook: totalGames >= 2 || Boolean(opening?.name),
      eco: typeof opening?.eco === 'string' ? opening.eco : undefined,
      name: typeof opening?.name === 'string' ? opening.name : undefined,
      totalGames,
    };
    setCached(cacheKey, result, 600_000);
    return result;
  } catch {
    return { isBook: false };
  } finally {
    cleanup();
  }
}

app.get('/api/chesscom/cloud-eval', rateLimitMiddleware, async (req: Request, res: Response) => {
  const result = await queryLichessCloudFen(req.query.fen);
  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=600');
  return res.json(result);
});

app.post('/api/chesscom/cloud-eval-batch', rateLimitMiddleware, async (req: Request, res: Response) => {
  const rawFens = Array.isArray(req.body?.fens) ? req.body.fens.slice(0, 14) : [];
  const results: Record<string, any> = Object.create(null);

  await Promise.all(
    rawFens.map(async (fenItem: unknown) => {
      if (typeof fenItem === 'string' && fenItem.length <= 100) {
        results[fenItem] = await queryLichessCloudFen(fenItem);
      }
    })
  );

  return res.json({ evaluations: results });
});

app.get('/api/chesscom/opening-explorer', rateLimitMiddleware, async (req: Request, res: Response) => {
  const result = await queryLichessOpeningExplorer(req.query.fen);
  res.setHeader('Cache-Control', 'public, max-age=600, s-maxage=1200');
  return res.json(result);
});

export default app;

