import React, { useState } from 'react';
import { Layers, AlertCircle, Info, Activity, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { AirStation, PollutantDetail } from '../types';

interface AtmosphericPollutantTierProps {
  station: AirStation;
}

export const AtmosphericPollutantTier: React.FC<AtmosphericPollutantTierProps> = ({ station }) => {
  const [expandedPollutant, setExpandedPollutant] = useState<string | null>('pm25');

  const pollutantsList = Object.entries(station.pollutants) as [string, PollutantDetail][];

  return (
    <div
      id="atmospheric-chemical-tier-panel"
      className="flex flex-col gap-6 rounded-2xl border border-white/10 bg-[#020408]/80 p-6 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative overflow-hidden"
    >
      {/* Background flare */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-900/10 blur-[80px] rounded-full pointer-events-none" />

      {/* Title Bar */}
      <div className="relative z-10 flex flex-wrap items-end justify-between gap-4 border-b border-white/5 pb-4">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/40 border border-white/10 shadow-inner">
            <Layers className="h-5 w-5 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h2 className="text-sm font-bold text-white uppercase tracking-widest">
                Chemical & Particulate Speciation Tier
              </h2>
              <span className="rounded-md bg-cyan-500/10 px-2 py-0.5 font-mono text-[9px] font-bold text-cyan-400 border border-cyan-500/20 uppercase tracking-widest">
                Spectroscopic Sub-Indices
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Breakdown of individual molecular criteria pollutants against WHO and CPCB 24-hour national ambient air quality standards
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 uppercase tracking-wider bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </span>
          <span>7 Continuous Optical Analyzers Active</span>
        </div>
      </div>

      {/* Grid of Pollutant Cards */}
      <div className="relative z-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {pollutantsList.map(([key, item]) => {
          const isExpanded = expandedPollutant === key;
          const ratio = item.value / item.standardLimit24h;
          const isExceeded = ratio > 1.0;

          const statusColor =
            item.status === 'Severe' || item.status === 'Very Poor'
              ? 'border-red-500/30 bg-red-500/10 text-red-400'
              : item.status === 'Poor'
              ? 'border-orange-500/30 bg-orange-500/10 text-orange-400'
              : item.status === 'Moderate'
              ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
              : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400';

          return (
            <div
              key={key}
              onClick={() => setExpandedPollutant(isExpanded ? null : key)}
              className={`flex cursor-pointer flex-col justify-between rounded-xl p-5 transition-all border ${
                isExpanded
                  ? 'border-cyan-500/50 bg-black/60 shadow-[0_0_20px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/20'
                  : 'border-white/10 bg-black/40 hover:border-white/20 hover:bg-black/60 shadow-inner'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-lg font-black text-white">{item.code}</span>
                  <span className={`rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border ${statusColor}`}>
                    {item.status}
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 line-clamp-1 uppercase tracking-widest font-semibold">{item.name}</div>

                {/* Primary Metric Number */}
                <div className="mt-4 flex items-baseline gap-1.5">
                  <span className="font-mono text-3xl font-black text-white tracking-tighter">{item.value.toFixed(1)}</span>
                  <span className="text-[11px] font-mono text-slate-400">{item.unit}</span>
                </div>

                {/* Standard comparison bar */}
                <div className="mt-4 flex flex-col gap-1.5">
                  <div className="flex justify-between text-[9px] text-slate-400 font-mono uppercase tracking-wider">
                    <span>Limit: {item.standardLimit24h} {item.unit}</span>
                    <span className={isExceeded ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                      {ratio.toFixed(1)}x Limit
                    </span>
                  </div>
                  <div className="h-1 w-full overflow-hidden rounded-full bg-white/5 border border-white/5">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${
                        ratio > 2.0
                          ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'
                          : ratio > 1.0
                          ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]'
                          : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]'
                      }`}
                      style={{ width: `${Math.min(100, ratio * 50)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Expansion Details */}
              {isExpanded && (
                <div className="mt-4 border-t border-white/10 pt-4 text-[10px] flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="font-bold uppercase tracking-widest text-slate-500">Primary Source Analysis</span>
                    <span className="text-slate-300 font-medium leading-relaxed">{item.origin}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-bold uppercase tracking-widest text-red-400/80">Physiological Impact</span>
                    <span className="text-slate-300 font-medium leading-relaxed">{item.healthImpact}</span>
                  </div>
                </div>
              )}

              <div className="mt-4 flex items-center justify-between text-[10px] text-slate-500 uppercase font-mono tracking-wider">
                <span>Sub-Index: {item.subIndex}</span>
                <span className="flex items-center gap-1 text-cyan-400">
                  {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  {isExpanded ? 'Hide' : 'Details'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
