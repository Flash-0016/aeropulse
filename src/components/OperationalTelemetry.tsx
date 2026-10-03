import React, { useState, useEffect } from 'react';
import {
  Activity,
  Server,
  Cpu,
  Wifi,
  Database,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  HardDrive,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { TelemetryData } from '../types';
import { INITIAL_TELEMETRY } from '../data/mockAirData';

interface OperationalTelemetryProps {
  initialTelemetry?: TelemetryData;
}

export const OperationalTelemetry: React.FC<OperationalTelemetryProps> = ({
  initialTelemetry = INITIAL_TELEMETRY,
}) => {
  const [telemetry, setTelemetry] = useState<TelemetryData>(initialTelemetry);
  const [activeHourIndex, setActiveHourIndex] = useState<number>(14); // 2 PM default

  // Diurnal 24-hour curve data
  const diurnalPoints = [
    { hour: '00:00', aqi: 280, pm25: 165, note: 'Nocturnal Inversion trapped' },
    { hour: '02:00', aqi: 310, pm25: 184, note: 'Peak nighttime compression' },
    { hour: '04:00', aqi: 335, pm25: 198, note: 'Coldest ground surface layer' },
    { hour: '06:00', aqi: 342, pm25: 205, note: 'Early morning stagnation peak' },
    { hour: '08:00', aqi: 320, pm25: 188, note: 'Morning commuter traffic spike' },
    { hour: '10:00', aqi: 255, pm25: 142, note: 'Solar heating begins breaking lid' },
    { hour: '12:00', aqi: 185, pm25: 98, note: 'Boundary layer expands to 900m' },
    { hour: '14:00', aqi: 140, pm25: 68, note: 'Peak solar convective mixing (Cleanest)' },
    { hour: '16:00', aqi: 165, pm25: 84, note: 'Wind shear maintains dilution' },
    { hour: '18:00', aqi: 230, pm25: 130, note: 'Evening rush hour + solar loss' },
    { hour: '20:00', aqi: 275, pm25: 158, note: 'Radiative cooling reforms inversion' },
    { hour: '22:00', aqi: 295, pm25: 172, note: 'Trapped boundary layer lowers to 300m' },
  ];

  // Live telemetry pulse
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry((prev) => ({
        ...prev,
        ingestRatePerSec: Math.floor(1380 + Math.random() * 80),
        networkLatencyMs: Math.floor(28 + Math.random() * 8),
        cpcbDataRelayMs: Math.floor(115 + Math.random() * 20),
        sensorDriftAvg: Number((0.05 + Math.random() * 0.02).toFixed(3)),
      }));
    }, 2800);

    return () => clearInterval(interval);
  }, []);

  const activeDiurnal = diurnalPoints[Math.min(activeHourIndex, diurnalPoints.length - 1)];

  return (
    <div
      id="operational-telemetry-panel"
      className="flex flex-col gap-6 rounded-2xl border border-white/10 bg-[#020408]/80 p-6 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative overflow-hidden"
    >
      {/* Background flare */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-900/10 blur-[80px] rounded-full pointer-events-none" />

      {/* Title Bar */}
      <div className="relative z-10 flex flex-wrap items-end justify-between gap-4 border-b border-white/5 pb-4">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/40 border border-white/10 shadow-inner">
            <Activity className="h-5 w-5 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-0.5">
              <h2 className="text-sm font-bold text-white uppercase tracking-widest">
                Monitoring & Operational Telemetry Suite
              </h2>
              <span className="flex items-center gap-1.5 rounded-md bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[9px] font-bold text-emerald-400 border border-emerald-500/20 uppercase tracking-widest">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                PIPELINE HEALTHY
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Simultaneous physical diurnal trend diagnostics and real-time digital ingestion pipeline integrity telemetry
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
          <span>Uptime:</span>
          <span className="text-emerald-400">{telemetry.uptimePercentage}%</span>
          <span className="text-white/20 mx-1">|</span>
          <span>SLA Target: 99.95%</span>
        </div>
      </div>

      {/* Grid: 24h Physical Diurnal Curve + Digital Pipeline Telemetry */}
      <div className="relative z-10 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Part A: 24-Hour Diurnal Physical Air Quality Trend (7 cols) */}
        <div className="flex flex-col justify-between rounded-2xl bg-black/40 p-5 border border-white/10 shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)] lg:col-span-7">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-[11px] font-bold text-white uppercase tracking-wider">
                24-Hour Diurnal Trend: Nocturnal Inversion vs Convective Dilution
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                Click or hover along the curve to inspect hour-by-hour dynamics
              </p>
            </div>
            <div className="flex items-center gap-3 font-mono text-[10px] font-bold uppercase tracking-widest">
              <span className="rounded-md bg-red-500/10 px-2 py-1 text-red-500 border border-red-500/20">
                AQI {activeDiurnal.aqi}
              </span>
              <span className="text-slate-500">at {activeDiurnal.hour}</span>
            </div>
          </div>

          {/* SVG Trend Chart */}
          <div className="relative h-[240px] w-full bg-[#050810] rounded-xl overflow-hidden border border-white/5">
            <svg className="h-full w-full" viewBox="0 0 100 60" preserveAspectRatio="none">
              <defs>
                <linearGradient id="diurnalGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#EF4444" stopOpacity="0.3" />
                  <stop offset="60%" stopColor="#F59E0B" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Reference Lines */}
              {[15, 30, 45].map((y, idx) => (
                <line
                  key={idx}
                  x1="5"
                  y1={y}
                  x2="95"
                  y2={y}
                  stroke="#1E293B"
                  strokeWidth="0.5"
                  strokeDasharray="2 2"
                />
              ))}

              {/* Curve Points */}
              {(() => {
                const coords = diurnalPoints.map((pt, idx) => {
                  const x = 6 + (idx / (diurnalPoints.length - 1)) * 88;
                  // Map AQI 100-360 to Y (52 to 8)
                  const y = 52 - ((pt.aqi - 100) / 260) * 44;
                  return { x, y, pt };
                });

                const pathString = coords.reduce((acc, c, i) => {
                  return i === 0 ? `M ${c.x},${c.y}` : `${acc} L ${c.x},${c.y}`;
                }, '');

                const areaString = `${pathString} L ${coords[coords.length - 1].x},55 L ${coords[0].x},55 Z`;

                return (
                  <>
                    <path d={areaString} fill="url(#diurnalGradient)" />
                    <path d={pathString} fill="none" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" />
                    {coords.map((c, i) => {
                      const isActive = i === activeHourIndex;
                      return (
                        <g
                          key={i}
                          className="cursor-pointer"
                          onClick={() => setActiveHourIndex(i)}
                          onMouseEnter={() => setActiveHourIndex(i)}
                        >
                          <circle
                            cx={c.x}
                            cy={c.y}
                            r={isActive ? 3 : 1.5}
                            fill={isActive ? '#FFFFFF' : '#F59E0B'}
                            stroke={isActive ? '#EF4444' : 'none'}
                            strokeWidth={isActive ? "1" : "0"}
                            className="transition-all duration-300"
                          />
                        </g>
                      );
                    })}
                  </>
                );
              })()}
            </svg>
          </div>

          {/* Hour labels & inspection badge */}
          <div className="flex justify-between text-[9px] text-slate-500 font-bold uppercase tracking-wider font-mono px-2 pt-3 border-t border-white/5 mt-2">
            <span>00:00 (Inversion)</span>
            <span>06:00 (Peak Trap)</span>
            <span>12:00 (Solar Dilution)</span>
            <span>18:00 (Cooling)</span>
            <span>22:00 (Re-Trap)</span>
          </div>

          {/* Selected Hour Diagnosis */}
          <div className="mt-4 rounded-xl bg-black/40 p-3 text-xs text-slate-300 border border-white/10 flex items-center justify-between shadow-inner">
            <div className="flex items-center gap-2 text-[11px]">
              <span className="font-bold text-white font-mono bg-white/10 px-2 py-0.5 rounded">{activeDiurnal.hour}</span>
              <span className="text-slate-400 font-medium">{activeDiurnal.note}</span>
            </div>
            <div className="font-mono text-[11px] text-amber-500 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              PM2.5: {activeDiurnal.pm25} µg/m³
            </div>
          </div>
        </div>

        {/* Part B: Digital Pipeline Health & Reliability Diagnostics (5 cols) */}
        <div className="flex flex-col justify-between gap-6 rounded-2xl bg-black/40 p-6 border border-white/10 shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)] lg:col-span-5">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-[11px] font-bold text-white uppercase tracking-wider">
                Digital Pipeline Telemetry
              </h3>
              <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                Live Ingest Engine v4.2
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              Sensor drift tracking, packet drop rates, and cross-station validation
            </p>
          </div>

          {/* Key Pipeline Metrics Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Ingestion Rate */}
            <div className="rounded-xl bg-black/40 p-4 border border-white/5 shadow-inner hover:bg-black/60 transition-colors">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <Zap className="h-3.5 w-3.5 text-amber-500" />
                <span>Ingestion Rate</span>
              </div>
              <div className="mt-2 font-mono text-2xl font-black tracking-tighter text-white">
                {telemetry.ingestRatePerSec}{' '}
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">pkts/sec</span>
              </div>
              <div className="mt-1 text-[9px] uppercase font-bold tracking-widest text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3" />
                <span>Zero backpressure</span>
              </div>
            </div>

            {/* Active Nodes */}
            <div className="rounded-xl bg-black/40 p-4 border border-white/5 shadow-inner hover:bg-black/60 transition-colors">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <Server className="h-3.5 w-3.5 text-cyan-400" />
                <span>Active Sensor Nodes</span>
              </div>
              <div className="mt-2 font-mono text-2xl font-black tracking-tighter text-white">
                {telemetry.activeNodesCount}{' '}
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">stations</span>
              </div>
              <div className="mt-1 text-[9px] uppercase font-bold tracking-widest text-slate-500">
                CPCB + EPA + OpenWeather
              </div>
            </div>

            {/* Sensor Drift Variance */}
            <div className="rounded-xl bg-black/40 p-4 border border-white/5 shadow-inner hover:bg-black/60 transition-colors">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <Cpu className="h-3.5 w-3.5 text-purple-400" />
                <span>Zero-Point Drift</span>
              </div>
              <div className="mt-2 font-mono text-2xl font-black tracking-tighter text-white">
                ±{telemetry.sensorDriftAvg}%
              </div>
              <div className="mt-1 text-[9px] uppercase font-bold tracking-widest text-emerald-400">
                Well within ±0.5% tolerance
              </div>
            </div>

            {/* Relay Latency */}
            <div className="rounded-xl bg-black/40 p-4 border border-white/5 shadow-inner hover:bg-black/60 transition-colors">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <Wifi className="h-3.5 w-3.5 text-emerald-400" />
                <span>Network Latency</span>
              </div>
              <div className="mt-2 font-mono text-2xl font-black tracking-tighter text-white">
                {telemetry.networkLatencyMs} <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">ms</span>
              </div>
              <div className="mt-1 text-[9px] uppercase font-bold tracking-widest text-slate-500 font-mono">
                CPCB Bridge: {telemetry.cpcbDataRelayMs}ms
              </div>
            </div>
          </div>

          {/* Validation Checksum & Reliability Footer */}
          <div className="flex flex-col gap-2 rounded-xl bg-white/5 p-4 text-[10px] font-bold uppercase tracking-wider border border-white/5">
            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                Synthetic Cryptographic Checksum
              </span>
              <span className="font-mono text-[9px] text-slate-500 bg-black/40 px-2 py-0.5 rounded border border-white/5">
                {telemetry.validationChecksum}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-400 border-t border-white/5 pt-2">
              <span>Packets Dropped (24h):</span>
              <span className="font-mono text-[10px] text-emerald-400">
                {telemetry.packetsDropped24h} (0.000002%)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
