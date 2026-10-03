import React, { useState } from 'react';
import {
  Gauge,
  Thermometer,
  Layers,
  ArrowUp,
  AlertOctagon,
  CloudSun,
  Wind,
  Info,
  ChevronRight,
} from 'lucide-react';
import { INVERSION_PROFILES } from '../data/mockAirData';
import { InversionProfile } from '../types';

interface AtmosphericInversionGaugeProps {
  currentProfileKey?: 'severe' | 'moderate' | 'free';
}

export const AtmosphericInversionGauge: React.FC<AtmosphericInversionGaugeProps> = ({
  currentProfileKey = 'severe',
}) => {
  const [selectedKey, setSelectedKey] = useState<'severe' | 'moderate' | 'free'>(currentProfileKey);
  const profile: InversionProfile = INVERSION_PROFILES[selectedKey];

  return (
    <div id="atmospheric-inversion-gauge-panel" className="flex flex-col gap-6 rounded-2xl border border-white/10 bg-[#020408]/80 p-6 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative overflow-hidden">
      {/* Background flare */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-amber-900/10 blur-[80px] rounded-full pointer-events-none" />

      {/* Title Bar */}
      <div className="relative z-10 flex flex-wrap items-end justify-between gap-4 border-b border-white/5 pb-4">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/40 border border-white/10 shadow-inner">
            <Gauge className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h2 className="text-sm font-bold text-white uppercase tracking-widest">
                Atmospheric Inversion & Trapping Gauge
              </h2>
              <span className="rounded-md bg-amber-500/10 px-2 py-0.5 font-mono text-[9px] font-bold text-amber-500 border border-amber-500/20 uppercase tracking-widest">
                PBL Sounder Diagnostic
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Thermal boundary layer stratification, mixing depth, and particulate entrapment analysis
            </p>
          </div>
        </div>

        {/* Scenario Toggle */}
        <div className="flex items-center gap-1 rounded-xl bg-black/40 p-1.5 border border-white/10 shadow-inner">
          {[
            { key: 'severe', label: 'Winter Nocturnal Inversion' },
            { key: 'moderate', label: 'Coastal Marine Cap' },
            { key: 'free', label: 'Convective Solar Dispersion' },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setSelectedKey(item.key as typeof selectedKey)}
              className={`rounded-lg px-4 py-2 text-[10px] font-bold uppercase tracking-wider transition-all ${
                selectedKey === item.key
                  ? 'bg-amber-500 text-slate-950 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Metrics & Visual Sounder */}
      <div className="relative z-10 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Trapping Severity Gauge & Key Metrics (5 cols) */}
        <div className="flex flex-col justify-between gap-6 rounded-2xl bg-black/40 p-6 border border-white/10 shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)] lg:col-span-5">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">
              Thermal Trapping Index
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-5xl font-black tracking-tighter text-white">
                {profile.trappingIndex}
              </span>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">/ 100</span>
              <span
                className={`ml-auto rounded-md px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest border ${
                  profile.trappingIndex > 70
                    ? 'bg-red-500/10 text-red-500 border-red-500/20'
                    : profile.trappingIndex > 40
                    ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                }`}
              >
                {profile.status}
              </span>
            </div>

            {/* Visual Gauge Bar */}
            <div className="mt-5 flex flex-col gap-2">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5 border border-white/10">
                <div
                  className={`h-full transition-all duration-700 rounded-full ${
                    profile.trappingIndex > 70
                      ? 'bg-gradient-to-r from-amber-500 to-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'
                      : profile.trappingIndex > 40
                      ? 'bg-gradient-to-r from-teal-500 to-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]'
                      : 'bg-gradient-to-r from-cyan-400 to-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.6)]'
                  }`}
                  style={{ width: `${profile.trappingIndex}%` }}
                />
              </div>
              <div className="flex justify-between text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                <span>Free Dispersion</span>
                <span>Moderate Cap</span>
                <span>Severe Lid</span>
              </div>
            </div>
          </div>

          {/* Meteorological Indices Grid */}
          <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-6">
            <div className="flex flex-col gap-1 rounded-xl bg-black/40 border border-white/5 p-4 shadow-inner hover:bg-black/60 transition-colors">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <Layers className="h-3.5 w-3.5 text-cyan-400" />
                <span>Mixing Layer (PBL)</span>
              </div>
              <div className="mt-2 font-mono text-2xl font-black text-white tracking-tighter">
                {profile.inversionHeightMeters} <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">m</span>
              </div>
              <div className="text-[9px] uppercase tracking-widest text-slate-500 mt-1 font-semibold">
                {profile.inversionHeightMeters < 350
                  ? 'Ultra-shallow compression'
                  : 'Deep vertical dilution'}
              </div>
            </div>

            <div className="flex flex-col gap-1 rounded-xl bg-black/40 border border-white/5 p-4 shadow-inner hover:bg-black/60 transition-colors">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <Wind className="h-3.5 w-3.5 text-emerald-400" />
                <span>Ventilation Coeff</span>
              </div>
              <div
                className={`mt-2 font-mono text-2xl font-black tracking-tighter ${
                  profile.ventilationCoeff < 2000 ? 'text-red-400' : 'text-emerald-400'
                }`}
              >
                {profile.ventilationCoeff}{' '}
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider opacity-60">m²/s</span>
              </div>
              <div className="text-[9px] uppercase tracking-widest text-slate-500 mt-1 font-semibold">
                {profile.ventilationCoeff < 2000 ? 'Critical Stagnation (<2000)' : 'Safe dispersion rate'}
              </div>
            </div>

            <div className="flex flex-col gap-1 rounded-xl bg-black/40 border border-white/5 p-4 shadow-inner hover:bg-black/60 transition-colors">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <Thermometer className="h-3.5 w-3.5 text-amber-500" />
                <span>Surface vs Aloft</span>
              </div>
              <div className="mt-2 font-mono text-lg font-black text-white tracking-tighter">
                {profile.groundTemp}°C <span className="text-slate-500 font-normal">vs</span> {profile.aloftTemp}°C
              </div>
              <div className="text-[9px] uppercase tracking-widest text-slate-500 mt-1 font-semibold">
                {profile.aloftTemp > profile.groundTemp
                  ? 'Thermal Inversion (+ lid)'
                  : 'Normal lapse rate (- aloft)'}
              </div>
            </div>

            <div className="flex flex-col gap-1 rounded-xl bg-black/40 border border-white/5 p-4 shadow-inner hover:bg-black/60 transition-colors">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <AlertOctagon className="h-3.5 w-3.5 text-red-500" />
                <span>Lapse Rate</span>
              </div>
              <div className="mt-2 font-mono text-lg font-black text-white tracking-tighter">
                {profile.lapseRate > 0 ? `+${profile.lapseRate}` : profile.lapseRate} <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">°C/100m</span>
              </div>
              <div className="text-[9px] uppercase tracking-widest text-slate-500 mt-1 font-semibold">
                {profile.lapseRate > 0 ? 'Inverted (stable trapping)' : 'Convective (diluting)'}
              </div>
            </div>
          </div>

          {/* Descriptive Diagnosis */}
          <div className="rounded-xl bg-cyan-900/10 p-4 text-[11px] text-slate-300 border border-cyan-500/20 leading-relaxed font-medium">
            <p className="flex items-start gap-3">
              <Info className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>{profile.description}</span>
            </p>
          </div>
        </div>

        {/* Altitude vs Temperature Sounder Visual Profile (7 cols) */}
        <div className="flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)] p-5 lg:col-span-7">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
              Vertical Radiosonde Sounder Profile <span className="hidden sm:inline">(Altitude vs Temperature)</span>
            </div>
            <div className="flex items-center gap-4 text-[9px] font-bold uppercase tracking-widest font-mono">
              <span className="flex items-center gap-1.5 text-amber-500">
                <span className="h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                Temperature (°C)
              </span>
              <span className="flex items-center gap-1.5 text-red-500">
                <span className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                Trapped PM2.5 Density
              </span>
            </div>
          </div>

          {/* SVG Atmospheric Column Profile */}
          <div className="relative h-[360px] w-full rounded-xl overflow-hidden border border-white/5 bg-[#050810]">
            <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              {/* Altitude horizontal gridlines */}
              {[20, 40, 60, 80].map((altY, idx) => (
                <g key={idx}>
                  <line
                    x1="12"
                    y1={altY}
                    x2="95"
                    y2={altY}
                    stroke="#1E293B"
                    strokeWidth="0.5"
                    strokeDasharray="2 2"
                  />
                  <text x="2" y={altY + 1.5} fill="#64748B" fontSize="2.5" fontFamily="monospace" fontWeight="bold">
                    {2000 - (altY / 100) * 2000}m
                  </text>
                </g>
              ))}

              {/* Inversion Capping Boundary Line */}
              {profile.inversionHeightMeters && (
                <g>
                  {(() => {
                    const capY = 100 - (profile.inversionHeightMeters / 2000) * 100;
                    return (
                      <>
                        <line
                          x1="12"
                          y1={capY}
                          x2="95"
                          y2={capY}
                          stroke="#F59E0B"
                          strokeWidth="1.5"
                          strokeDasharray="3 3"
                        />
                        <rect
                          x="55"
                          y={capY - 5}
                          width="38"
                          height="4.5"
                          rx="1"
                          fill="#78350F"
                          fillOpacity="0.8"
                        />
                        <text x="56" y={capY - 1.5} fill="#FDE68A" fontSize="2.8" fontWeight="bold">
                          Thermal Capping Lid ({profile.inversionHeightMeters}m)
                        </text>

                        {/* Smog trapping shading beneath lid */}
                        <rect
                          x="12"
                          y={capY}
                          width="83"
                          height={100 - capY}
                          fill="#EF4444"
                          fillOpacity={profile.trappingIndex > 70 ? 0.16 : 0.08}
                        />
                      </>
                    );
                  })()}
                </g>
              )}

              {/* Particulate Density Bars on Left Side */}
              {profile.atmosphericLayers.map((layer, idx) => {
                const yPos = 100 - (layer.altitudeM / 2000) * 100;
                const barWidth = (layer.particulateDensity / 100) * 35;
                return (
                  <g key={idx}>
                    <rect
                      x="14"
                      y={yPos - 2}
                      width={barWidth}
                      height="3.5"
                      fill="#EF4444"
                      fillOpacity="0.6"
                      rx="0.8"
                    />
                  </g>
                );
              })}

              {/* Temperature Curve Line */}
              {(() => {
                const points = profile.atmosphericLayers.map((l) => {
                  const y = 100 - (l.altitudeM / 2000) * 100;
                  // Map temp from 5°C to 35°C across x range 45 to 90
                  const x = 50 + ((l.tempC - 8) / 25) * 42;
                  return { x, y, temp: l.tempC };
                });

                const pathString = points.reduce((acc, pt, i) => {
                  return i === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`;
                }, '');

                return (
                  <>
                    <path
                      d={pathString}
                      fill="none"
                      stroke="#F59E0B"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                    {points.map((pt, i) => (
                      <g key={i}>
                        <circle cx={pt.x} cy={pt.y} r="1.6" fill="#F59E0B" stroke="#000" strokeWidth="0.5" />
                        <text x={pt.x + 2.5} y={pt.y + 1} fill="#FDE68A" fontSize="2.5" fontFamily="monospace">
                          {pt.temp.toFixed(1)}°C
                        </text>
                      </g>
                    ))}
                  </>
                );
              })()}

              {/* Bottom Ground Axis */}
              <line x1="12" y1="99" x2="95" y2="99" stroke="#475569" strokeWidth="1.2" />
              <text x="14" y="96" fill="#94A3B8" fontSize="3" fontWeight="bold">
                Ground Surface (0m)
              </text>
            </svg>
          </div>

          <div className="mt-4 flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            <span>Note: Inversions prevent vertical chimney dispersion; pollutants pool at street level.</span>
            <span className="font-mono text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded-md border border-cyan-500/20">WMO Sounding Profile: Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
};
