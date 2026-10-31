import React from 'react';
import { X, ShieldCheck } from 'lucide-react';

interface PolicyModalProps {
  type: 'compliance' | 'privacy' | 'terms' | null;
  onClose: () => void;
}

export function PolicyModal({ type, onClose }: PolicyModalProps) {
  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white rounded-[24px] border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden relative max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">
              {type === 'compliance' && 'Chess.com Public API Compliance'}
              {type === 'privacy' && 'Privacy Policy & Zero-Credential Architecture'}
              {type === 'terms' && 'Terms of Service'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/60 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-600 leading-relaxed">
          {/* Persistent Legal & Security Notice: Free Beta & No Real-Money Purchases */}
          <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 text-slate-700 space-y-1">
            <p className="font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Beta Phase • Free for Development Reasons &amp; Website Adjustments</span>
            </p>
            <p>
              ChessPulse is currently in a Beta phase and is <strong>100% free (0,00 €) for development reasons and ongoing adjustments to the website</strong>. <strong>Nothing can be bought with real money</strong> on this website, and no payment gateways or billing contracts exist.
            </p>
          </div>

          {type === 'compliance' && (
            <>
              <h4 className="text-sm font-bold text-slate-900">Official API Usage Standards</h4>
              <p>
                ChessPulse accesses publicly available player archives strictly via Chess.com's published Read-Only REST endpoints (<code>https://api.chess.com/pub/</code>). All data retrieval is conducted in compliance with public rate limits, user-agent requirements, and Chess.com Developer Terms.
              </p>
              <h4 className="text-sm font-bold text-slate-900">Independent Analytical Software</h4>
              <p>
                ChessPulse is an independent software tool designed for analytical study and chess training. It is not affiliated with, endorsed by, or sponsored by Chess.com LLC. All game records remain the intellectual property of their respective creators.
              </p>
            </>
          )}

          {type === 'privacy' && (
            <>
              <h4 className="text-sm font-bold text-slate-900">Zero Password &amp; Zero Financial Data</h4>
              <p>
                ChessPulse will NEVER prompt you for your Chess.com account password, credit card numbers, or banking details. Because nothing can be bought with real money during our development beta, zero financial or payment telemetry is ever collected.
              </p>
              <h4 className="text-sm font-bold text-slate-900">Data Minimization</h4>
              <p>
                We do not sell, rent, or monetize your game history to third parties. Data processed on ChessPulse is utilized solely to compute blunder rates, tactical puzzle coordinates, and opening repertoire performance charts.
              </p>
            </>
          )}

          {type === 'terms' && (
            <>
              <h4 className="text-sm font-bold text-slate-900">Service Terms &amp; Independent Status</h4>
              <p>
                By using ChessPulse, you agree to utilize the platform for personal chess study and tactical improvement. ChessPulse is an independent third-party telemetry platform and is not affiliated with, endorsed by, or sponsored by Chess.com, LLC.
              </p>
              <h4 className="text-sm font-bold text-slate-900">Development Beta — Nothing Can Be Bought With Real Money</h4>
              <p>
                ChessPulse is currently operated in a 100% Free Beta phase (0,00 €) for development reasons and ongoing adjustments to the website. Clicking on any subscription or paid plan button does not create a paid contract, and nothing on this platform can be bought with real money.
              </p>
            </>
          )}
        </div>

        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
