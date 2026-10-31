import React from 'react';
import { Database, TrendingUp, Zap, ShieldCheck } from 'lucide-react';

export function KeyMetricsStrip() {
  const clubs = [
    { name: 'Saint Louis Chess Club', location: 'USA', tag: 'STL CHESS' },
    { name: 'Marshall Chess Club', location: 'NYC', tag: 'MARSHALL 1915' },
    { name: 'Charlotte Chess Center', location: 'NC', tag: 'CCC MASTERS' },
    { name: 'European Chess Union', location: 'Europe', tag: 'ECU ACADEMY' },
    { name: 'FIDE Trainer Network', location: 'Global', tag: 'FIDE PRO' },
    { name: 'London Chess Classic', location: 'UK', tag: 'LCC LEAGUE' },
  ];

  const metrics = [
    {
      value: '500k+',
      label: 'Games Scanned',
      detail: 'Continuous blunder parsing across Blitz, Rapid & Bullet',
      icon: Database,
    },
    {
      value: '+140 ELO',
      label: 'Avg. Player Gain',
      detail: 'Measured across active members after 60 days of blunder drills',
      icon: TrendingUp,
      accent: true,
    },
    {
      value: '< 10s',
      label: 'Real-time API Sync',
      detail: 'Automated retrieval via official Chess.com public archives',
      icon: Zap,
    },
    {
      value: '0 Passwords',
      label: 'Frictionless Scan',
      detail: '100% web-based. Enter your handle and train immediately',
      icon: ShieldCheck,
    },
  ];

  return (
    <section className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      {/* 1. Trusted Brands / Social Proof Strip (Specification Match: "Trusted by players from top chess clubs" + monochrome row) */}
      <div className="text-center space-y-5">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
          Trusted by players from top chess clubs & federations
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 items-center">
          {clubs.map((club) => (
            <div
              key={club.name}
              className="py-3 px-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-center gap-2 opacity-75 grayscale hover:grayscale-0 hover:opacity-100 hover:border-slate-300 transition-all cursor-default group"
            >
              <span className="text-base font-serif text-slate-800 font-bold select-none group-hover:text-emerald-700 transition-colors">
                ♟
              </span>
              <div className="text-left">
                <span className="text-[11px] font-extrabold text-slate-800 tracking-tight block leading-tight">
                  {club.tag}
                </span>
                <span className="text-[9px] text-slate-400 font-medium block">
                  {club.location}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Key Metrics Strip */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          {metrics.map((metric, idx) => {
            const Icon = metric.icon;
            return (
              <div
                key={idx}
                className={`${idx > 0 ? 'pt-6 sm:pt-0 sm:pl-6' : ''} flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`w-4 h-4 ${metric.accent ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {metric.label}
                    </span>
                  </div>
                  <div
                    className={`text-3xl sm:text-4xl font-extrabold tracking-tight tabular-nums ${
                      metric.accent ? 'text-emerald-600' : 'text-slate-900'
                    }`}
                  >
                    {metric.value}
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  {metric.detail}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
