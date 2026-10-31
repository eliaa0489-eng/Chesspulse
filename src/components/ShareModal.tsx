import React, { useState } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  Twitter,
  MessageCircle,
  ExternalLink,
  Sparkles,
  Trophy,
  Award,
  Flame,
} from 'lucide-react';

export interface ShareData {
  title: string;
  description: string;
  url?: string;
  type?: 'profile' | 'puzzle' | 'match' | 'certificate';
  stats?: {
    username?: string;
    elo?: number;
    allTimeWins?: number;
    brilliantMoves?: number;
    winRate?: number;
  };
}

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ShareData;
}

export function ShareModal({ isOpen, onClose, data }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareUrl =
    data.url || (typeof window !== 'undefined' ? window.location.href : 'https://chesspulse.app');

  const shareText = `${data.title} — ${data.description} ♟️ Analyzed with @ChessPulse`;

  const handleCopy = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: data.title,
          text: data.description,
          url: shareUrl,
        });
      } catch {
        // User cancelled or unsupported
      }
    } else {
      handleCopy();
    }
  };

  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    shareText
  )}&url=${encodeURIComponent(shareUrl)}`;

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `${shareText} ${shareUrl}`
  )}`;

  const redditUrl = `https://reddit.com/submit?url=${encodeURIComponent(
    shareUrl
  )}&title=${encodeURIComponent(data.title)}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Share with Chess Community</h3>
              <p className="text-[11px] text-slate-500">Inspire friends, rivals & club members</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/60 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Card Body */}
        <div className="p-6 space-y-5">
          {/* Visual Rich Share Preview Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white shadow-lg relative overflow-hidden border border-slate-700">
            {/* Background watermark */}
            <div className="absolute -right-4 -bottom-6 opacity-10 pointer-events-none select-none text-8xl font-serif">
              ♟
            </div>

            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-bold tracking-wider text-emerald-400 uppercase">
                  ChessPulse Verified Record
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Stockfish 16.1</span>
            </div>

            <h4 className="text-base font-extrabold text-white mb-1">{data.title}</h4>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">{data.description}</p>

            {data.stats && (
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-700/60">
                <div className="bg-slate-800/80 rounded-xl p-2 text-center border border-slate-700">
                  <div className="flex items-center justify-center gap-1 text-[10px] text-amber-400 font-bold mb-0.5">
                    <Trophy className="w-3 h-3" />
                    <span>WINS</span>
                  </div>
                  <span className="text-sm font-extrabold text-white tabular-nums">
                    {data.stats.allTimeWins?.toLocaleString() || '1,240'}
                  </span>
                </div>

                <div className="bg-slate-800/80 rounded-xl p-2 text-center border border-slate-700">
                  <div className="flex items-center justify-center gap-1 text-[10px] text-emerald-400 font-bold mb-0.5">
                    <Award className="w-3 h-3" />
                    <span>ELO</span>
                  </div>
                  <span className="text-sm font-extrabold text-white tabular-nums">
                    {data.stats.elo || 1850}
                  </span>
                </div>

                <div className="bg-cyan-950/60 rounded-xl p-2 text-center border border-cyan-800/60">
                  <div className="flex items-center justify-center gap-1 text-[10px] text-cyan-400 font-bold mb-0.5">
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    <span>BRILLIANT</span>
                  </div>
                  <span className="text-sm font-extrabold text-cyan-300 tabular-nums">
                    {data.stats.brilliantMoves || 42} !!
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Social Quick Share Buttons */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 block">Quick Share To</label>
            <div className="grid grid-cols-3 gap-2.5">
              <a
                href={tweetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                <Twitter className="w-4 h-4 fill-current" />
                <span>Post on 𝕏</span>
              </a>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>WhatsApp</span>
              </a>

              <a
                href={redditUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#FF4500] hover:bg-[#e03d00] text-white text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Reddit</span>
              </a>
            </div>
          </div>

          {/* Copy Direct Link Bar */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">Shareable Web Link</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 px-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-xl text-slate-600 font-mono truncate select-all focus:outline-none"
              />
              <button
                onClick={handleCopy}
                className={`py-2 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Native Web Share Button (Mobile / Supported Browsers) */}
          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button
              onClick={handleNativeShare}
              className="w-full py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Open Device Share Menu (AirDrop, Messages, etc.)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
