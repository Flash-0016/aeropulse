import React, { useState } from 'react';
import {
  Navigation,
  ShieldCheck,
  Clock,
  Activity,
  Bike,
  Footprints,
  Bus,
  Car,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  TreePine,
  Wind,
  Info,
} from 'lucide-react';
import { CommuteRoute } from '../types';
import { COMMUTE_ROUTES } from '../data/mockAirData';
import { calculateInhaledMicrograms } from '../utils/aqiCalculators';

export const CleanAirCommuteRouter: React.FC = () => {
  const [routes, setRoutes] = useState<CommuteRoute[]>(COMMUTE_ROUTES);
  const [selectedRouteId, setSelectedRouteId] = useState<string>('route-green-corridor');
  const [commuteMode, setCommuteMode] = useState<'cycling' | 'walking' | 'transit' | 'car'>('cycling');
  const [departureTime, setDepartureTime] = useState<string>('08:30');

  const selectedRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];
  const highwayRoute = routes.find((r) => r.type === 'highway') || routes[0];

  // Calculate dynamic inhaled dose based on chosen mode
  const currentInhaledDose = calculateInhaledMicrograms(
    selectedRoute.avgAqi * 0.75, // approximate PM2.5
    selectedRoute.durationMins,
    commuteMode
  );

  const highwayInhaledDose = calculateInhaledMicrograms(
    highwayRoute.avgAqi * 0.75,
    highwayRoute.durationMins,
    commuteMode
  );

  const doseDeltaPercent = Math.round(
    ((highwayInhaledDose - currentInhaledDose) / highwayInhaledDose) * 100
  );

  return (
    <div id="clean-air-commute-router" className="flex flex-col gap-6 rounded-2xl border border-white/10 bg-[#020408]/80 p-6 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative overflow-hidden">
      {/* Background flare */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-900/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Header Bar */}
      <div className="relative z-10 flex flex-wrap items-end justify-between gap-4 border-b border-white/5 pb-4">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/40 border border-white/10 shadow-inner">
            <Navigation className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h2 className="text-sm font-bold text-white uppercase tracking-widest">
                The "Clean-Air Commute" Router
              </h2>
              <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 font-mono text-[9px] font-bold text-emerald-400 border border-emerald-500/20 uppercase tracking-widest">
                Aero-Biometric Exposure Engine
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Calculate pulmonary particulate intake across urban corridors and optimize routes for minimal toxic lung deposition
            </p>
          </div>
        </div>

        {/* Commute Mode Selector */}
        <div className="flex items-center gap-1 rounded-xl bg-black/40 p-1.5 border border-white/10 shadow-inner">
          {[
            { id: 'cycling', label: 'Cycling', icon: Bike, ventilation: '28 L/min' },
            { id: 'walking', label: 'Walking', icon: Footprints, ventilation: '14.5 L/min' },
            { id: 'transit', label: 'Transit', icon: Bus, ventilation: '9.2 L/min' },
            { id: 'car', label: 'Car', icon: Car, ventilation: '8.5 L/min' },
          ].map((mode) => {
            const Icon = mode.icon;
            const isSelected = commuteMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => setCommuteMode(mode.id as typeof commuteMode)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-[10px] font-bold uppercase tracking-wider transition-all ${
                  isSelected
                    ? 'bg-emerald-500 text-slate-950 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
                title={`Ventilation rate: ${mode.ventilation}`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{mode.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Interactive Map Vector Visualizer + Route Cards */}
      <div className="relative z-10 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Interactive SVG Route Map (7 cols) */}
        <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)] p-5 lg:col-span-7">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-300">
              <span>Metropolitan Air Quality Heatmap</span>
              <span className="rounded-md bg-black/60 px-2 py-0.5 text-[9px] text-emerald-400 border border-white/5">Live Telemetry</span>
            </div>
            <div className="flex items-center gap-4 text-[9px] font-bold uppercase tracking-widest">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                Clean (&lt;100)
              </span>
              <span className="flex items-center gap-1.5 text-amber-500">
                <span className="h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                Moderate
              </span>
              <span className="flex items-center gap-1.5 text-red-500">
                <span className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                Hazardous
              </span>
            </div>
          </div>

          {/* SVG Canvas Map */}
          <div className="relative h-[320px] w-full rounded-xl overflow-hidden border border-white/5 bg-[#050810]">
            <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                {/* Smog ambient haze gradient */}
                <radialGradient id="smogHotspot" cx="50%" cy="65%" r="45%">
                  <stop offset="0%" stopColor="#EF4444" stopOpacity="0.32" />
                  <stop offset="60%" stopColor="#F97316" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#0F172A" stopOpacity="0" />
                </radialGradient>

                {/* Green canopy biosink gradient */}
                <radialGradient id="greenBioSink" cx="45%" cy="30%" r="40%">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
                  <stop offset="80%" stopColor="#065F46" stopOpacity="0.05" />
                  <stop offset="100%" stopColor="#0F172A" stopOpacity="0" />
                </radialGradient>

                {/* Animated dash pattern for active route */}
                <linearGradient id="routeGradientGreen" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="50%" stopColor="#34D399" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
              </defs>

              {/* Background Pollution Heatmap Zones */}
              <rect x="0" y="0" width="100" height="100" fill="#090D16" />
              <ellipse cx="52" cy="65" rx="35" ry="25" fill="url(#smogHotspot)" />
              <ellipse cx="48" cy="30" rx="36" ry="22" fill="url(#greenBioSink)" />

              {/* River / Blue Corridor */}
              <path
                d="M 5,20 Q 30,35 60,25 T 98,35"
                fill="none"
                stroke="#0284C7"
                strokeWidth="1.8"
                strokeOpacity="0.45"
              />

              {/* All Commute Routes */}
              {routes.map((route) => {
                const isSelected = route.id === selectedRouteId;
                const pathString = route.pathPoints.reduce((acc, pt, idx) => {
                  return idx === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`;
                }, '');

                const strokeColor =
                  route.type === 'highway'
                    ? '#EF4444'
                    : route.type === 'green_corridor'
                    ? '#10B981'
                    : '#38BDF8';

                return (
                  <g key={route.id} className="cursor-pointer" onClick={() => setSelectedRouteId(route.id)}>
                    {/* Shadow highlight */}
                    <path
                      d={pathString}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth={isSelected ? '3.5' : '1.8'}
                      strokeOpacity={isSelected ? 0.9 : 0.4}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Animated moving pulse for selected route */}
                    {isSelected && (
                      <path
                        d={pathString}
                        fill="none"
                        stroke="#FFFFFF"
                        strokeWidth="2"
                        strokeDasharray="3 6"
                        className="animate-pulse"
                      />
                    )}

                    {/* Waypoint nodes */}
                    {route.pathPoints.map((pt, pIdx) => (
                      <circle
                        key={pIdx}
                        cx={pt.x}
                        cy={pt.y}
                        r={isSelected ? (pIdx === 0 || pIdx === route.pathPoints.length - 1 ? 3 : 2) : 1.5}
                        fill={strokeColor}
                        stroke="#FFFFFF"
                        strokeWidth="0.8"
                      />
                    ))}
                  </g>
                );
              })}

              {/* Origin & Destination Flags */}
              <text x="7" y="82" fill="#E2E8F0" fontSize="3.5" fontWeight="bold">
                Origin (Home)
              </text>
              <text x="82" y="36" fill="#E2E8F0" fontSize="3.5" fontWeight="bold">
                Dest (Office)
              </text>
              <text x="35" y="22" fill="#34D399" fontSize="3" fontWeight="bold">
                Botanical Forest Bio-Filter
              </text>
              <text x="44" y="73" fill="#F87171" fontSize="3" fontWeight="bold">
                Congested Highway Canyon
              </text>
            </svg>

            {/* Float badge indicator on active map */}
            <div className="absolute top-3 left-3 rounded-lg bg-slate-900/90 px-3 py-1.5 backdrop-blur-md border border-slate-700 text-xs">
              <span className="text-slate-400">Selected Path: </span>
              <span className="font-bold text-white">{selectedRoute.title}</span>
            </div>
          </div>

          {/* Departure Optimization Insight */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-slate-900/80 p-3 border border-slate-800">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-400" />
              <div className="text-xs">
                <span className="font-semibold text-white">Optimal Clean-Air Departure: </span>
                <span className="font-bold text-amber-400">09:15 AM</span>
                <span className="text-slate-400"> (Solar thermal mixing breaks morning ground inversion)</span>
              </div>
            </div>
            <div className="text-xs font-mono text-emerald-400">
              Save an extra 28% inhaled fine soot
            </div>
          </div>
        </div>

        {/* Route Exposure Comparisons (5 cols) */}
        <div className="flex flex-col gap-3 lg:col-span-5">
          {routes.map((route) => {
            const isSelected = route.id === selectedRouteId;
            const dose = calculateInhaledMicrograms(route.avgAqi * 0.75, route.durationMins, commuteMode);

            return (
              <div
                key={route.id}
                onClick={() => setSelectedRouteId(route.id)}
                className={`flex cursor-pointer flex-col gap-3 rounded-2xl p-5 transition-all border ${
                  isSelected
                    ? 'border-emerald-500/50 bg-black/60 ring-1 ring-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                    : 'border-white/10 bg-black/40 hover:border-white/20 hover:bg-black/60 shadow-inner'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span
                      className={`h-3 w-3 rounded-full shadow-[0_0_8px_currentColor] ${
                        route.type === 'highway'
                          ? 'bg-red-500 text-red-500'
                          : route.type === 'green_corridor'
                          ? 'bg-emerald-500 text-emerald-500'
                          : 'bg-cyan-500 text-cyan-500'
                      }`}
                    />
                    <h4 className="text-sm font-bold uppercase tracking-widest text-white">{route.title}</h4>
                  </div>
                  <span
                    className={`rounded-md px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider border ${
                      route.avgAqi > 200
                        ? 'bg-red-500/10 text-red-400 border-red-500/20'
                        : route.avgAqi > 100
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}
                  >
                    AQI {route.avgAqi}
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 font-medium leading-relaxed">{route.description}</p>

                {/* Metrics Breakdown */}
                <div className="mt-3 grid grid-cols-3 gap-3 border-t border-white/5 pt-4 text-center">
                  <div className="flex flex-col gap-1 rounded-xl bg-black/40 border border-white/5 p-2 shadow-inner">
                    <div className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">Travel Time</div>
                    <div className="font-mono text-sm font-black text-white tracking-tighter">{route.durationMins} <span className="text-[10px] font-normal text-slate-400 tracking-normal">mins</span></div>
                  </div>

                  <div className="flex flex-col gap-1 rounded-xl bg-black/40 border border-white/5 p-2 shadow-inner">
                    <div className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">Distance</div>
                    <div className="font-mono text-sm font-black text-white tracking-tighter">{route.distanceKm} <span className="text-[10px] font-normal text-slate-400 tracking-normal">km</span></div>
                  </div>

                  <div className="flex flex-col gap-1 rounded-xl bg-black/40 border border-white/5 p-2 shadow-inner">
                    <div className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">Inhaled Dose</div>
                    <div
                      className={`font-mono text-sm font-black tracking-tighter ${
                        dose > 60 ? 'text-red-400' : dose > 30 ? 'text-amber-400' : 'text-emerald-400'
                      }`}
                    >
                      {dose} <span className="text-[10px] font-normal opacity-70 tracking-normal">µg</span>
                    </div>
                  </div>
                </div>

                {/* Shielding note */}
                <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-wider text-slate-400 bg-white/5 px-3 py-2 rounded-lg mt-2">
                  <TreePine className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>{route.shieldingFactor}</span>
                </div>
              </div>
            );
          })}

          {/* Lung Protection Summary Card */}
          {selectedRoute.type === 'green_corridor' && (
            <div className="flex items-center justify-between rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-5 shadow-[inset_0_0_20px_rgba(16,185,129,0.05)]">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)] border border-emerald-500/20">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
                    Net Health Protection: +{doseDeltaPercent}% 
                  </div>
                  <div className="text-[11px] font-medium text-slate-300">
                    Trading +6 mins of commute saves ~<span className="font-bold text-white font-mono">{(highwayInhaledDose - currentInhaledDose).toFixed(1)} µg</span> of deep lung soot
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
