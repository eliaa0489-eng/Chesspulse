import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Scale, ShieldCheck, Lock, Server, FileText, Globe } from 'lucide-react';

interface LegalPagesProps {
  page: 'impressum' | 'datenschutz';
  onNavigate: (page: 'home' | 'puzzles' | 'impressum' | 'datenschutz') => void;
}

export function LegalPages({ page, onNavigate }: LegalPagesProps) {
  const isImpressum = page === 'impressum';

  return (
    <main className="min-h-screen bg-[#F8FAFC] border-t border-[#E2E8F0] py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Top Breadcrumb & Navigation Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#E2E8F0] hover:border-slate-300 text-xs font-bold text-slate-700 hover:text-slate-900 shadow-2xs transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#059669]" />
            <span>Back to Overview</span>
          </button>

          {/* Segmented Legal Switcher */}
          <div className="inline-flex items-center p-1 rounded-xl bg-white border border-[#E2E8F0] shadow-2xs">
            <button
              type="button"
              onClick={() => onNavigate('impressum')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                isImpressum
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Impressum (§ 5 DDG)
            </button>
            <button
              type="button"
              onClick={() => onNavigate('datenschutz')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                !isImpressum
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Datenschutz (DSGVO / GDPR)
            </button>
          </div>
        </div>

        {/* Main Legal Document Card */}
        <motion.div
          key={page}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="bg-white rounded-3xl border border-[#E2E8F0] shadow-xs overflow-hidden"
        >
          {/* Document Header */}
          <div className="px-6 sm:px-10 py-8 border-b border-[#E2E8F0] bg-white">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#059669] mb-2">
              {isImpressum ? (
                <>
                  <Scale className="w-3.5 h-3.5" />
                  <span>Legal Notice • Impressum</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Data Protection • Datenschutzerklärung</span>
                </>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {isImpressum
                ? 'Impressum / Legal Disclosure'
                : 'Privacy Policy & Data Protection (DSGVO / GDPR)'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
              {isImpressum
                ? 'Information in accordance with § 5 DDG (Digitale-Dienste-Gesetz) for the non-commercial public beta of ChessPulse.'
                : 'Transparent overview of how ChessPulse processes public Chess.com match archives with zero password or payment collection.'}
            </p>
          </div>

          {/* Document Body */}
          {isImpressum ? (
            <div className="p-6 sm:p-10 space-y-8 text-xs sm:text-sm text-slate-600 leading-relaxed">
              {/* Public Beta / Non-Commercial Project Notice */}
              <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200/90 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <span className="w-2 h-2 rounded-full bg-[#059669]" />
                  <span>Development Beta Notice — Free for Development Reasons &amp; Website Adjustments (No Real-Money Purchases)</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  <strong>ChessPulse</strong> is currently in a <strong>Beta phase</strong> and is provided <strong>100% free of charge (0,00 €) for software development reasons and ongoing adjustments to the website</strong>. <strong>Nothing can be bought with real money</strong> on this website. All subscription tiers or pricing figures shown on the user interface are strictly non-binding preview placeholders; no payment gateways, checkout systems, or real-money transactions exist.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 rounded-2xl border border-[#E2E8F0] bg-white space-y-2">
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#059669]" />
                    <span>1. Angaben gemäß § 5 DDG</span>
                  </h2>
                  <div className="text-xs text-slate-600 space-y-1 font-normal">
                    <p className="font-semibold text-slate-900">
                      ChessPulse — Private Beta Engineering Project
                    </p>
                    <p>Project Maintainer: [Vorname Nachname / Project Lead]</p>
                    <p>c/o Technical Project Sandbox (Non-Commercial Beta)</p>
                    <p>Musterstraße 1 · 10115 Berlin · Germany</p>
                  </div>
                </div>

                <div className="p-5 rounded-2xl border border-[#E2E8F0] bg-white space-y-2">
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-[#059669]" />
                    <span>2. Kontakt / Contact Information</span>
                  </h2>
                  <div className="text-xs text-slate-600 space-y-1 font-normal">
                    <p>
                      E-Mail:{' '}
                      <span className="font-mono font-semibold text-slate-900">
                        support@chesspulse.app
                      </span>
                    </p>
                    <p>
                      API User-Agent Identifier:{' '}
                      <span className="font-mono text-slate-800">
                        ChessPulse-App/1.0
                      </span>
                    </p>
                    <p className="text-[11px] text-slate-500 pt-1">
                      Electronic inquiries are typically answered within 48 hours.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-[#E2E8F0]">
                <h2 className="text-sm font-bold text-slate-900">
                  3. Zero Real-Money Purchases &amp; Development Beta Status
                </h2>
                <p>
                  Clicking on any subscription option, upgrade button, or pricing tier within ChessPulse does <strong>not</strong> initiate a purchase or create a legally binding payment obligation. The platform is operated in a <strong>free Beta mode for development reasons and ongoing adjustments to the website</strong>. Because <strong>nothing can be bought with real money</strong>, no billing contracts, invoices, or recurring charges can ever occur.
                </p>
              </div>

              <div className="space-y-3 pt-2 border-t border-[#E2E8F0]">
                <h2 className="text-sm font-bold text-slate-900">
                  4. Independence &amp; Non-Affiliation Disclaimer (Chess.com LLC)
                </h2>
                <p>
                  ChessPulse is an independent analytical and tactical training application. It is <strong>not affiliated with, endorsed by, or sponsored by Chess.com LLC</strong>. All game records and ratings displayed when a user queries a handle are retrieved on-demand from the publicly accessible Chess.com Published-Data API (<span className="font-mono text-xs text-slate-800">api.chess.com/pub/</span>) in compliance with its read-only terms.
                </p>
              </div>

              <div className="space-y-3 pt-2 border-t border-[#E2E8F0]">
                <h2 className="text-sm font-bold text-slate-900">
                  5. Haftung für Inhalte &amp; Links (Liability for Content &amp; Links)
                </h2>
                <p>
                  As a service provider we are responsible for our own content on these pages in accordance with general legislation (§ 7 (1) DDG). However, we are not obligated to monitor transmitted or external public match data or to investigate circumstances that indicate unlawful activity. Obligations to remove or block the use of information under general law remain unaffected.
                </p>
              </div>

              <div className="space-y-3 pt-2 border-t border-[#E2E8F0]">
                <h2 className="text-sm font-bold text-slate-900">
                  6. EU Dispute Resolution (Streitschlichtung)
                </h2>
                <p>
                  Because ChessPulse operates exclusively as a free, non-commercial development beta where nothing can be bought with real money and no paid consumer contracts exist, we are neither willing nor obligated to participate in dispute resolution proceedings before a consumer arbitration board (Verbraucherschlichtungsstelle).
                </p>
              </div>
            </div>
          ) : (
            <div className="p-6 sm:p-10 space-y-8 text-xs sm:text-sm text-slate-600 leading-relaxed">
              {/* Zero-Trust Architecture Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                    <Lock className="w-3.5 h-3.5 text-[#059669]" />
                    <span>Zero Passwords</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    We never request or store Chess.com passwords, OAuth tokens, or private account credentials.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                    <Server className="w-3.5 h-3.5 text-[#059669]" />
                    <span>Server Proxy Guard</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Public Chess.com queries are routed through our backend proxy so your browser IP is not exposed to third-party APIs.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#059669]" />
                    <span>No Real-Money Purchases</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Free in Beta for development reasons &amp; website adjustments. Nothing can be bought with real money.
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-[#E2E8F0]">
                <h2 className="text-sm font-bold text-slate-900">
                  1. Overview of Data Processing &amp; Zero Real-Money Policy (Datenschutz &amp; Zahlungssicherheit)
                </h2>
                <p>
                  ChessPulse is engineered around a strict data-minimization principle (Art. 5 (1)(c) DSGVO / GDPR). Furthermore, the platform is currently in a <strong>Beta phase and is 100% free for development reasons and ongoing adjustments to the website</strong>. <strong>Nothing can be bought with real money</strong> on this website—we do not integrate any payment processors (such as Stripe or PayPal), and we never request, process, or store credit card numbers, IBANs, or billing addresses.
                </p>
              </div>

              <div className="space-y-3 pt-2 border-t border-[#E2E8F0]">
                <h2 className="text-sm font-bold text-slate-900">
                  2. Public Chess.com API Proxy &amp; Ephemeral Caching
                </h2>
                <p>
                  When you enter a Chess.com username, our server-side Express proxy (<span className="font-mono text-xs text-slate-800">/api/chesscom/...</span>) sanitizes the handle (<span className="font-mono text-xs text-slate-800">username.trim().toLowerCase()</span>) and queries publicly available match archives from <span className="font-mono text-xs text-slate-800">https://api.chess.com/pub/player/&#123;username&#125;</span> using the mandatory <span className="font-mono text-xs text-slate-800">User-Agent: ChessPulse-App/1.0</span> header.
                </p>
                <p>
                  Responses are cached in volatile server memory (RAM) for 60 seconds solely to prevent upstream rate-limit blocks and are automatically Purged thereafter. No permanent database of player profiles or PGN archives is maintained.
                </p>
              </div>

              <div className="space-y-3 pt-2 border-t border-[#E2E8F0]">
                <h2 className="text-sm font-bold text-slate-900">
                  3. Server Log Files &amp; In-Memory Rate Limiting
                </h2>
                <p>
                  To protect the platform against automated abuse and denial-of-service requests (Art. 6 (1)(f) DSGVO legitimate interest in operational security), our server maintains a transient, in-memory rate-limiting counter (maximum 60 API requests per minute per connection) that expires automatically after 60 seconds. Standard hosting access logs (timestamp, HTTP status code, requested route) are not merged with personal profiles.
                </p>
              </div>

              <div className="space-y-3 pt-2 border-t border-[#E2E8F0]">
                <h2 className="text-sm font-bold text-slate-900">
                  4. Client-Side LocalStorage (No Tracking Cookies)
                </h2>
                <p>
                  ChessPulse does not use third-party advertising cookies or cross-site tracking pixels. If you choose to save your active Chess.com handle or solved puzzle state, this preference is stored locally in your own browser&apos;s <span className="font-mono text-xs text-slate-800">localStorage</span> (<span className="font-mono text-xs text-slate-800">chesspulse_user</span>, <span className="font-mono text-xs text-slate-800">chesspulse_plan</span>). You can clear this data at any time by clicking Sign Out or clearing your browser site data.
                </p>
              </div>

              <div className="space-y-3 pt-2 border-t border-[#E2E8F0]">
                <h2 className="text-sm font-bold text-slate-900">
                  5. Your Rights under DSGVO / GDPR
                </h2>
                <p>
                  Under the General Data Protection Regulation (Arts. 15–21 DSGVO), you have the right to request information about any personal data processed, as well as the right to rectification, erasure, restriction of processing, and data portability. For any privacy-related requests, contact <span className="font-mono font-semibold text-slate-900">support@chesspulse.app</span>.
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </main>
  );
}
