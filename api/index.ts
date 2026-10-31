import express, { Request, Response } from 'express';

const CHESSCOM_USER_AGENT = 'ChessPulse-App/1.0 (contact: support@chesspulse.app)';
const USERNAME_REGEX = /^[a-z0-9_-]{2,40}$/;

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);
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

async function fetchChessComJson(url: string, timeoutMs = 15000): Promise<{ status: number; data: any }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': CHESSCOM_USER_AGENT,
        Accept: 'application/json',
      },
      signal: controller.signal,
    });
    if (!response.ok) {
      return { status: response.status, data: null };
    }
    const data = await response.json();
    return { status: response.status, data };
  } finally {
    clearTimeout(timer);
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

app.post('/api/analytics/event', (_req: Request, res: Response) => {
  res.status(202).json({ ok: true });
});

app.get('/api/chesscom/avatar/:username', (req: Request, res: Response) => {
  const username = sanitizeUsername(req.params.username) || 'cp';
  const initials = username.slice(0, 2).toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80">
  <rect width="80" height="80" rx="20" fill="#0F172A"/>
  <circle cx="64" cy="16" r="6" fill="#059669"/>
  <text x="40" y="47" text-anchor="middle" fill="#FFFFFF" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="24" font-weight="800">${initials}</text>
</svg>`;
  res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.send(svg);
});

app.get(['/api/chesscom/player/:username/overview', '/api/chesscom/player/:username/stats', '/api/stats/:username', '/api/stats'], async (req: Request, res: Response) => {
  const username = sanitizeUsername(req.params.username || req.query.username);
  if (!username) {
    return res.status(400).json({ error: 'Invalid Chess.com username format.', code: 'INVALID_HANDLE' });
  }
  try {
    const [profileRes, statsRes] = await Promise.all([
      fetchChessComJson(`https://api.chess.com/pub/player/${encodeURIComponent(username)}`),
      fetchChessComJson(`https://api.chess.com/pub/player/${encodeURIComponent(username)}/stats`),
    ]);
    if (profileRes.status === 404) {
      return res.status(404).json({ error: `Player "${username}" was not found on Chess.com.`, code: 'USER_NOT_FOUND' });
    }
    if (profileRes.status !== 200 || !profileRes.data) {
      return res.status(502).json({ error: 'Unable to retrieve profile from Chess.com API.', code: 'UPSTREAM_ERROR' });
    }
    const profileDto = buildSafeProfileDto(profileRes.data, username);
    const statsDto = buildSafeStatsDto(statsRes.data);
    return res.json({
      ...statsDto,
      profile: profileDto,
      stats: statsDto,
    });
  } catch {
    return res.status(502).json({ error: 'Upstream Chess.com API request failed.', code: 'UPSTREAM_ERROR' });
  }
});

app.get(['/api/chesscom/player/:username/matches', '/api/matches/:username', '/api/matches'], async (req: Request, res: Response) => {
  const username = sanitizeUsername(req.params.username || req.query.username);
  if (!username) {
    return res.status(400).json({ error: 'Invalid Chess.com username format.', code: 'INVALID_HANDLE' });
  }
  const rawLimit = Number(req.query.limit);
  const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(1, Math.floor(rawLimit)), 25) : 12;

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
    const latestArchiveUrl = archiveList[archiveList.length - 1];
    const gamesRes = await fetchChessComJson(latestArchiveUrl, 15000);
    const rawGames = Array.isArray(gamesRes.data?.games) ? gamesRes.data.games : [];
    const sorted = [...rawGames].sort((a, b) => (b?.end_time || 0) - (a?.end_time || 0));
    const games = [];
    for (const item of sorted) {
      if (games.length >= limit) break;
      const dto = buildSafeMatchGameDto(item);
      if (dto) games.push(dto);
    }
    return res.json({ games });
  } catch {
    return res.status(502).json({ error: 'Failed to retrieve recent matches from Chess.com.', code: 'UPSTREAM_ERROR' });
  }
});

app.post('/api/beta-waitlist', (_req: Request, res: Response) => {
  res.json({
    success: true,
    betaMode: true,
    message: 'ChessPulse is currently in free public beta (0,00 €). Nothing can be bought with real money.',
  });
});

export default app;
