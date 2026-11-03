import React from 'react';
import { ChessComMatch } from '../types/chess';
import { ApiErrorCode } from '../services/chessComApi';
import { ChevronRight, Swords, AlertCircle, RefreshCw } from 'lucide-react';
import { FAMOUS_PLAYERS } from '../data/chessData';

interface RealMatchListFeedProps {
  matches: ChessComMatch[];
  selectedMatchId: string | null;
  onSelectMatch: (match: ChessComMatch) => void;
  isLoading?: boolean;
  errorCode?: ApiErrorCode;
  errorMessage?: string;
  searchedUsername?: string;
  onQuickSelectUsername?: (username: string) => void;
}

export function RealMatchListFeed({
  matches,
  selectedMatchId,
  onSelectMatch,
  isLoading = false,
  errorCode,
  errorMessage,
  searchedUsername,
  onQuickSelectUsername,
}: RealMatchListFeedProps) {
  if (isLoading) {
    return (
      <div className="p-6 bg-white rounded-2xl border border-slate-200 space-y-3">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <span>
            Fetching real match archive from Chess.com API
            {searchedUsername ? ` for @${searchedUsername}` : ''}...
          </span>
        </div>
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 bg-slate-50 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (matches.length === 0) {
    const isRateLimited = errorCode === 'RATE_LIMITED';
    const isUserNotFound = errorCode === 'USER_NOT_FOUND';

    return (
      <div className="p-6 bg-slate-50/90 rounded-2xl border border-slate-200/90 text-center space-y-3">
        <div
          className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold border ${
            isRateLimited
              ? 'bg-amber-50 border-amber-200 text-amber-800'
              : 'bg-rose-50 border-rose-200 text-rose-700'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>
            {isRateLimited
              ? 'Chess.com API Rate Limit Reached'
              : isUserNotFound
              ? `Player "${searchedUsername || ''}" not found on Chess.com`
              : 'No recent games found for this username on Chess.com'}
          </span>
        </div>

        <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
          {errorMessage ||
            'The player profile either has zero games recorded in the last 60 days, or does not exist in Chess.com public archives.'}
        </p>

        {onQuickSelectUsername && (
          <div className="pt-1 flex flex-wrap items-center justify-center gap-2">
            <span className="text-[11px] font-medium text-slate-500">
              Load verified GM archives:
            </span>
            {FAMOUS_PLAYERS.map((player) => (
              <button
                key={player.username}
                type="button"
                onClick={() => onQuickSelectUsername(player.username)}
                className="px-2.5 py-1 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-lg text-slate-800 font-semibold text-[11px] transition-all cursor-pointer shadow-2xs flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3 text-emerald-600" />
                <span>@{player.username}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Swords className="w-4 h-4 text-emerald-600" />
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Recent {matches.length} Chess.com Matches
            {searchedUsername ? ` • @${searchedUsername}` : ''}
          </h4>
        </div>
        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
          Click any match to run on-demand Game Review
        </span>
      </div>

      <div className="divide-y divide-slate-100 max-h-[380px] overflow-y-auto">
        {matches.map((match) => {
          const isSelected = match.id === selectedMatchId;
          const opponent = match.userColor === 'white' ? match.black : match.white;
          const userOfficialAcc =
            match.userColor === 'white'
              ? match.officialAccuracy?.white
              : match.officialAccuracy?.black;

          return (
            <button
              key={match.id}
              onClick={() => onSelectMatch(match)}
              className={`w-full p-3.5 flex items-center justify-between text-left transition-all cursor-pointer ${
                isSelected
                  ? 'bg-emerald-50/90 border-l-4 border-l-emerald-600 shadow-xs'
                  : 'hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Result Indicator Badge */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                    match.userWon === true
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : match.userWon === 'draw'
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-rose-100 text-rose-800 border border-rose-300'
                  }`}
                >
                  {match.userWon === true ? 'W' : match.userWon === 'draw' ? 'D' : 'L'}
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      vs {opponent.username}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 tabular-nums">
                      ({opponent.rating})
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                      {match.userColor === 'white' ? '⚪ White' : '⚫ Black'}
                    </span>
                    {typeof userOfficialAcc === 'number' && (
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 tabular-nums">
                        {userOfficialAcc}% Acc
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                    <span className="font-semibold text-slate-700">{match.timeControl}</span>
                    <span>•</span>
                    <span
                      className={`font-medium ${
                        match.userWon === true
                          ? 'text-emerald-700'
                          : match.userWon === 'draw'
                          ? 'text-amber-700'
                          : 'text-rose-700'
                      }`}
                    >
                      {match.userResultText}
                    </span>
                    {match.openingName && (
                      <>
                        <span>•</span>
                        <span className="text-slate-600 truncate max-w-[180px] sm:max-w-[260px]">
                          {match.eco ? `${match.eco}: ` : ''}
                          {match.openingName}
                        </span>
                      </>
                    )}
                    {typeof match.moveCount === 'number' && match.moveCount > 0 && (
                      <>
                        <span>•</span>
                        <span className="font-mono text-slate-500 tabular-nums">
                          {match.moveCount} moves
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-right shrink-0 ml-2">
                <div className="hidden sm:block">
                  <span className="text-[10px] text-slate-400 block">
                    {match.dateFormatted}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700">
                    {isSelected ? 'Analyzed ✓' : 'Click to Analyze →'}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
