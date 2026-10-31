import React, { useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState('');

  const faqs = [
    {
      q: 'Do I need to enter my Chess.com password?',
      a: "Absolutely not. We only fetch publicly available match data via Chess.com's official public API. Your account credentials, password, and payment methods never interact with our servers.",
      category: 'Security',
    },
    {
      q: 'How is this better than Stockfish or standard analysis?',
      a: 'Stockfish analyzes a single move in isolation and tells you +1.4 or -3.2. ChessPulse spots macro-patterns across hundreds of your games, isolates your recurring blind spots, and converts your actual missed wins into interactive, playable training drills you will remember next time you play.',
      category: 'Training',
    },
    {
      q: 'Can I use this on mobile?',
      a: 'Yes! The web dashboard is fully responsive and designed to run smoothly on iOS Safari and Android Chrome without any app store download. You can even add it to your home screen for one-tap daily training.',
      category: 'Platform',
    },
    {
      q: 'How frequently does ChessPulse fetch my latest games?',
      a: 'With Pro access, our background engine checks for new matches every time you visit the dashboard. You can also trigger an instant manual rescan right after finishing a session.',
      category: 'Sync',
    },
    {
      q: 'Can I export my blunders to PGN or study tools?',
      a: 'Yes. Pro subscribers can export customized PGN archives tagged with engine evaluations and move times, suitable for importing into ChessBase, Lichess Studies, or spaced-repetition flashcards.',
      category: 'Export',
    },
    {
      q: 'Does ChessPulse support Lichess as well?',
      a: 'Currently our live integration is optimized for Chess.com public archives. Lichess sync and combined cross-platform rating tracking are currently in private beta for Pro Annual members.',
      category: 'Platform',
    },
  ];

  const filteredFaqs = faqs.filter(
    (item) =>
      item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleAccordion = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12 space-y-3">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-700">
          <span>Frequently Asked Questions</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Got questions? We've got answers.
        </h2>
        <p className="text-sm sm:text-base text-slate-600 font-normal">
          Everything you need to know about our data integration and training engine.
        </p>

        {/* Quick Search */}
        <div className="pt-4 max-w-md mx-auto">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search questions (password, mobile, Stockfish...)"
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
            />
          </div>
        </div>
      </div>

      {/* Accordion Container */}
      <div className="space-y-3">
        {filteredFaqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className={`rounded-2xl border transition-all ${
                isOpen
                  ? 'bg-white border-slate-300 shadow-sm'
                  : 'bg-[#F8FAF9] border-slate-200/90 hover:border-slate-300'
              }`}
            >
              <button
                onClick={() => toggleAccordion(idx)}
                className="w-full px-6 py-5 flex items-center justify-between text-left gap-4 cursor-pointer"
              >
                <span className="text-base font-bold text-slate-900 leading-snug">
                  {faq.q}
                </span>
                <span className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                  isOpen ? 'bg-slate-100 rotate-180 text-slate-900' : 'bg-slate-100/60 text-slate-500'
                }`}>
                  <ChevronDown className="w-4 h-4" />
                </span>
              </button>

              {isOpen && (
                <div className="px-6 pb-5 pt-1 text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}

        {filteredFaqs.length === 0 && (
          <div className="text-center py-8 text-xs text-slate-500">
            No questions matched "{searchQuery}". Try searching for "API", "mobile", or "Stockfish".
          </div>
        )}
      </div>
    </section>
  );
}
