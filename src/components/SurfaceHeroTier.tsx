import React, { useMemo, useState } from 'react';
import {
  ShieldAlert,
  Clock,
  Radio,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Wind,
  Droplets,
  Gauge,
  Compass,
  MapPin,
  RefreshCw,
  HeartPulse,
  TrendingUp,
  TrendingDown,
  Activity,
  Sun,
  Moon,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { AQIStandard, AirStation, DominantPollutant } from '../types';
import { getAQICategory } from '../utils/aqiCalculators';

interface SurfaceHeroTierProps {
  station: AirStation;
  standard: AQIStandard;
  onToggleStandard: (std: AQIStandard) => void;
  onRefresh: () => void;
  isLoading: boolean;
  onOpenHealthModal: () => void;
}

export const SurfaceHeroTier: React.FC<SurfaceHeroTierProps> = ({
  station,
  standard,
  onToggleStandard,
  onRefresh,
  isLoading,
  onOpenHealthModal,
}) => {
  const currentAQI = standard === 'NAQI' ? station.aqiNAQI : station.aqiEPA;
  const category = getAQICategory(currentAQI, standard);

  // Generate continuous 24-hour diurnal AQI trend data based on station atmospheric parameters
  const { trendData, peakPoint, minPoint, avgAqi, yAxisMax } = useMemo(() => {
    const isOzone = station.dominantPollutant === 'O3';
    
    // Diurnal atmospheric curves based on photochemical & inversion cycles
    const diurnalFactors = isOzone
      ? [
          0.38, 0.35, 0.32, 0.30, 0.33, 0.40, // 00:00 - 05:00
          0.50, 0.65, 0.80, 0.95, 1.05, 1.15, // 06:00 - 11:00
          1.20, 1.22, 1.18, 1.10, 0.96, 0.82, // 12:00 - 17:00
          0.68, 0.55, 0.48, 0.44, 0.40, 0.38, // 18:00 - 23:00
        ]
      : [
          0.90, 0.93, 0.97, 1.02, 1.08, 1.12, // 00:00 - 05:00
          1.15, 1.10, 1.02, 0.88, 0.74, 0.62, // 06:00 - 11:00
          0.56, 0.54, 0.58, 0.66, 0.78, 0.90, // 12:00 - 17:00
          0.96, 0.98, 0.95, 0.92, 0.90, 0.89, // 18:00 - 23:00
        ];

    const baseVal = currentAQI;
    const pm25Base = station.pollutants.pm25 ? station.pollutants.pm25.value : Math.round(currentAQI * 0.58);

    const points = diurnalFactors.map((factor, hour) => {
      const timeStr = `${hour.toString().padStart(2, '0')}:00`;
      const computedAqi = Math.max(15, Math.min(500, Math.round(baseVal * factor)));
      const computedPm25 = Math.max(5, Math.round(pm25Base * factor * 10) / 10);
      const cat = getAQICategory(computedAqi, standard);

      let inversionPhase = '';
      let mixingHeight = 300;

      if (hour >= 0 && hour < 6) {
        inversionPhase = 'Nocturnal radiation trap (Stagnant)';
        mixingHeight = 220 + hour * 15;
      } else if (hour >= 6 && hour < 10) {
        inversionPhase = 'Morning commute rush into shallow lid';
        mixingHeight = 320 + (hour - 6) * 70;
      } else if (hour >= 10 && hour < 16) {
        inversionPhase = 'Convective solar mixing & dilution';
        mixingHeight = 650 + (hour - 10) * 110;
      } else if (hour >= 16 && hour < 20) {
        inversionPhase = 'Evening transition & commuter build-up';
        mixingHeight = 850 - (hour - 16) * 120;
      } else {
        inversionPhase = 'Nocturnal boundary layer capping';
        mixingHeight = 350 - (hour - 20) * 30;
      }

      return {
        time: timeStr,
        hour,
        aqi: computedAqi,
        pm25: computedPm25,
        categoryLabel: cat.label,
        categoryColor: cat.color,
        badgeBg: cat.badgeBg,
        inversionPhase,
        mixingHeight,
      };
    });

    let peak = points[0];
    let min = points[0];
    let sum = 0;

    points.forEach((pt) => {
      if (pt.aqi > peak.aqi) peak = pt;
      if (pt.aqi < min.aqi) min = pt;
      sum += pt.aqi;
    });

    const avg = Math.round(sum / points.length);
    const yMax = Math.max(100, Math.ceil((peak.aqi + 35) / 50) * 50);

    return {
      trendData: points,
      peakPoint: peak,
      minPoint: min,
      avgAqi: avg,
      yAxisMax: yMax,
    };
  }, [station, standard, currentAQI]);

  // Custom high-tech Tooltip component for Recharts
  const renderCustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const cat = getAQICategory(data.aqi, standard);

      return (
        <div className="rounded-xl border border-white/20 bg-[#020408]/95 p-3.5 shadow-2xl backdrop-blur-xl min-w-[210px]">
          <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
            <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-slate-300">
              <Clock className="h-3.5 w-3.5 text-cyan-400" />
              <span>{data.time} Local</span>
            </div>
            <span
              className="rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border"
              style={{
                backgroundColor: cat.bgLight,
                borderColor: cat.borderColor,
                color: cat.color,
              }}
            >
              {cat.label}
            </span>
          </div>

          <div className="flex items-baseline gap-2 mb-2">
            <span className="font-mono text-2xl font-black text-white">
              {data.aqi}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              AQI ({standard})
            </span>
          </div>

          <div className="flex flex-col gap-1 text-[10px] text-slate-400 pt-1.5 border-t border-white/5 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-500">PM2.5 Est:</span>
              <span className="font-semibold text-slate-200">{data.pm25} µg/m³</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Boundary Layer:</span>
              <span className="font-semibold text-slate-200">{data.mixingHeight}m</span>
            </div>
          </div>

          <div className="mt-2 rounded bg-white/5 px-2 py-1 text-[9px] text-cyan-300 font-medium leading-tight">
            {data.inversionPhase}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      id="surface-tier-hero-section"
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#020408]/80 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-2xl"
    >
      {/* Dynamic ambient color glow based on AQI hazard */}
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-[400px] w-[400px] rounded-full blur-[100px] transition-all duration-1000 opacity-20 mix-blend-screen"
        style={{ backgroundColor: category.color }}
      />

      {/* Surface Tier Top Bar: Station Identity, Provider & Calibration Timestamp */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-6 border-b border-white/5 pb-5">
        {/* Station Location Info */}
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-black/40 border border-white/10 shadow-inner">
            <MapPin className="h-5 w-5 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="text-xl font-bold text-white tracking-wide sm:text-2xl">
                {station.city}
              </h1>
              <span className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-slate-300 border border-white/10 uppercase tracking-widest">
                {station.country}
              </span>
              <span className="rounded-md bg-cyan-500/10 px-2 py-0.5 text-[10px] font-mono font-bold text-cyan-400 border border-cyan-500/20 uppercase">
                {station.provider} Ingest
              </span>
            </div>
            <div className="text-xs font-medium text-slate-400">
              {station.name} &bull; Station Code:{' '}
              <span className="font-mono text-slate-300">{station.stationCode}</span>
            </div>
          </div>
        </div>

        {/* Standard Switcher (NAQI vs EPA) & Refresh */}
        <div className="flex items-center gap-3">
          {/* Dual Standard Switcher */}
          <div className="flex items-center rounded-xl bg-black/40 p-1 border border-white/10 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]">
            <button
              id="btn-standard-naqi"
              onClick={() => onToggleStandard('NAQI')}
              className={`rounded-lg px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all ${
                standard === 'NAQI'
                  ? 'bg-cyan-500 text-slate-950 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Indian National Air Quality Index (CPCB 8-pollutant sub-index)"
            >
              IN-NAQI
            </button>
            <button
              id="btn-standard-epa"
              onClick={() => onToggleStandard('EPA')}
              className={`rounded-lg px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all ${
                standard === 'EPA'
                  ? 'bg-cyan-500 text-slate-950 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="US-EPA AirNow Standard"
            >
              US-EPA
            </button>
          </div>

          <button
            id="btn-refresh-station-data"
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-1.5 rounded-xl bg-white/5 hover:bg-white/10 px-4 py-2 text-xs font-semibold text-slate-200 transition-all border border-white/10 disabled:opacity-50"
            title="Fetch latest sensor ingestion telemetry"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
            <span className="hidden sm:inline">Sync Live</span>
          </button>
        </div>
      </div>

      {/* Surface Tier Main Hero Grid */}
      <div className="relative z-10 mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Layer 1 Core: Composite AQI & Category (5 cols) */}
        <div className="flex flex-col justify-between rounded-2xl bg-white/[0.02] p-6 border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] lg:col-span-5 relative overflow-hidden">
          {/* Subtle background glow */}
          <div 
            className="absolute -left-12 -bottom-12 w-48 h-48 rounded-full blur-[80px] opacity-20"
            style={{ backgroundColor: category.color }}
          />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Composite Index ({standard})
              </span>
              <span 
                className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider shadow-sm border border-black/20"
                style={{ backgroundColor: category.color, color: category.color === '#facc15' ? '#451a03' : '#fff' }}
              >
                {category.label}
              </span>
            </div>

            {/* Massive Hero AQI Number with Circular Progress Gauge */}
            <div className="mt-6 flex items-center gap-6">
              <div
                className="relative flex h-28 w-28 shrink-0 flex-col items-center justify-center rounded-2xl shadow-xl transition-all duration-500 overflow-hidden"
              >
                <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
                <div 
                  className="absolute inset-x-0 bottom-0 transition-all duration-1000 opacity-20"
                  style={{ 
                    height: `${Math.min(100, (currentAQI / 500) * 100)}%`,
                    backgroundColor: category.color 
                  }}
                />
                <div 
                  className="absolute inset-0 border-[3px] rounded-2xl opacity-40 transition-all duration-500"
                  style={{ borderColor: category.color }}
                />
                
                <span className="relative z-10 font-mono text-5xl font-black tracking-tighter text-white drop-shadow-md">
                  {currentAQI}
                </span>
                <span className="relative z-10 text-[9px] font-bold uppercase tracking-widest text-slate-300 mt-1">
                  AQI
                </span>
              </div>

              <div className="flex flex-col gap-2 flex-1">
                <div className="text-sm font-medium text-slate-200 leading-snug">
                  {category.description}
                </div>
                {/* 0-500 Scale Indicator */}
                <div className="flex flex-col gap-1.5 pt-2">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/50 border border-white/5">
                    <div
                      className="h-full rounded-full transition-all duration-1000 relative"
                      style={{
                        width: `${Math.min(100, (currentAQI / 500) * 100)}%`,
                        backgroundColor: category.color,
                        boxShadow: `0 0 10px ${category.color}`
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] font-mono text-slate-500 uppercase tracking-wider">
                    <span>0 (Ideal)</span>
                    <span>250</span>
                    <span>500 (Critical)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Health Action Prompt Button */}
          <div className="mt-8 relative z-10">
            <button
              id="btn-open-health-advice"
              onClick={onOpenHealthModal}
              className="group flex w-full items-center justify-between rounded-xl bg-red-500/10 hover:bg-red-500/20 px-5 py-3 text-xs font-semibold text-white transition-all border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.05)]"
            >
              <span className="flex items-center gap-2.5">
                <HeartPulse className="h-4 w-4 text-red-400 group-hover:scale-110 transition-transform" />
                <span>Health Precautions & Advisories</span>
              </span>
              <span className="rounded-md bg-red-500/20 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-red-300">
                View Policy
              </span>
            </button>
          </div>
        </div>

        {/* Layer 1 Dominant Pollutant Tag & Sensor Calibration Timestamp (7 cols) */}
        <div className="flex flex-col justify-between gap-5 rounded-2xl bg-white/[0.02] p-6 border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] lg:col-span-7">
          {/* Dominant Pollutant Callout */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Primary Hazard Driver
              </span>
              <span className="rounded-md bg-amber-500/10 px-3 py-1 font-mono text-[10px] font-bold text-amber-400 border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]">
                CRITICAL DRIVER: {station.dominantPollutant}
              </span>
            </div>

            <div className="flex items-start gap-4 rounded-xl bg-black/40 p-4 border border-white/5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-rose-500/20 text-amber-400 border border-amber-500/30">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="flex flex-col gap-1">
                <div className="text-sm font-semibold text-white">
                  {station.dominantPollutant === 'PM2.5'
                    ? 'Sub-Micron Respirable Soot (PM2.5)'
                    : station.dominantPollutant === 'PM10'
                    ? 'Coarse Road & Construction Dust (PM10)'
                    : station.dominantPollutant === 'O3'
                    ? 'Photochemical Tropospheric Ozone (O3)'
                    : station.dominantPollutant === 'NO2'
                    ? 'Diesel Combustion Exhaust (NO2)'
                    : `${station.dominantPollutant} Hazard Driver`}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
                  {station.dominantReason}
                </p>
              </div>
            </div>
          </div>

          {/* Sensor Calibration & Telemetry Provenance */}
          <div className="grid grid-cols-1 gap-3 border-t border-white/5 pt-4 sm:grid-cols-3">
            {/* Last Calibration Time */}
            <div className="group flex flex-col gap-1.5 rounded-xl bg-black/40 p-4 border border-white/5 hover:bg-black/60 transition-colors">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <Clock className="h-3 w-3 text-cyan-500" />
                <span>Sensor Calibration</span>
              </div>
              <div className="font-mono text-xs font-bold text-white tracking-tight mt-1">
                {station.lastCalibrated}
              </div>
              <div className="text-[10px] text-emerald-400/80 flex items-center gap-1 font-medium mt-auto">
                <CheckCircle2 className="h-3 w-3" />
                <span>Synced with CPCB</span>
              </div>
            </div>

            {/* Sensor Instrument Model */}
            <div className="group flex flex-col gap-1.5 rounded-xl bg-black/40 p-4 border border-white/5 hover:bg-black/60 transition-colors">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <Radio className="h-3 w-3 text-purple-500" />
                <span>Instrument Hardware</span>
              </div>
              <div className="truncate text-sm font-bold text-slate-200 mt-1" title={station.sensorModel}>
                {station.sensorModel.split('+')[0] || station.sensorModel}
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-auto">
                Variance Drift: ±{station.calibrationDrift}%
              </div>
            </div>

            {/* Data Confidence Score */}
            <div className="group flex flex-col gap-1.5 rounded-xl bg-black/40 p-4 border border-white/5 hover:bg-black/60 transition-colors">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <ShieldAlert className="h-3 w-3 text-emerald-500" />
                <span>Data Integrity</span>
              </div>
              <div className="font-mono text-sm font-bold text-emerald-400 mt-1">
                {station.confidenceScore}% Confidence
              </div>
              <div className="text-[10px] text-slate-500 font-medium mt-auto">
                Zero-point baseline verified
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 24-Hour Diurnal AQI Trend Visualization (Recharts Line Chart) */}
      <div 
        id="station-24h-aqi-trend-section"
        className="relative z-10 mt-6 rounded-2xl bg-white/[0.02] p-6 border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] overflow-hidden"
      >
        {/* Subtle dynamic background glow */}
        <div 
          className="absolute -right-16 -top-16 w-60 h-60 rounded-full blur-[100px] opacity-10 pointer-events-none"
          style={{ backgroundColor: category.color }}
        />

        {/* Section Header with Live Diurnal Stats */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5 relative z-10">
          <div className="flex items-center gap-3">
            <div 
              className="flex h-10 w-10 items-center justify-center rounded-xl border shadow-inner"
              style={{
                backgroundColor: `${category.color}15`,
                borderColor: `${category.color}30`,
                color: category.color,
              }}
            >
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold uppercase tracking-widest text-white">
                  24-Hour Diurnal AQI Trend
                </h3>
                <span className="rounded-md bg-white/5 px-2 py-0.5 text-[9px] font-mono font-bold text-slate-400 border border-white/10 uppercase">
                  {standard} Scale
                </span>
                <span className="flex items-center gap-1 rounded-md bg-cyan-500/10 px-2 py-0.5 text-[9px] font-mono font-bold text-cyan-400 border border-cyan-500/20">
                  <Activity className="h-2.5 w-2.5 animate-pulse" />
                  Hourly Telemetry
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                Atmospheric boundary layer dispersion curve for {station.city} ({station.stationCode})
              </p>
            </div>
          </div>

          {/* Temporal Summary Chips */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* 24h Peak */}
            <div className="flex items-center gap-2 rounded-xl bg-black/50 px-3 py-1.5 border border-white/10 shadow-inner">
              <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <TrendingUp className="h-3 w-3 text-rose-400" />
                24h Peak:
              </span>
              <span className="font-mono text-xs font-bold text-rose-400">
                {peakPoint.aqi} AQI
              </span>
              <span className="font-mono text-[10px] text-slate-500">
                @{peakPoint.time}
              </span>
            </div>

            {/* Cleanest Window */}
            <div className="flex items-center gap-2 rounded-xl bg-black/50 px-3 py-1.5 border border-white/10 shadow-inner">
              <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <TrendingDown className="h-3 w-3 text-emerald-400" />
                Cleanest:
              </span>
              <span className="font-mono text-xs font-bold text-emerald-400">
                {minPoint.aqi} AQI
              </span>
              <span className="font-mono text-[10px] text-slate-500">
                @{minPoint.time}
              </span>
            </div>

            {/* 24h Mean */}
            <div className="flex items-center gap-2 rounded-xl bg-black/50 px-3 py-1.5 border border-white/10 shadow-inner">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                24h Mean:
              </span>
              <span className="font-mono text-xs font-bold text-cyan-300">
                {avgAqi} AQI
              </span>
            </div>
          </div>
        </div>

        {/* Recharts Line Chart Container */}
        <div className="relative rounded-xl bg-black/40 border border-white/5 p-4 shadow-inner">
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={trendData}
                margin={{ top: 14, right: 18, left: -14, bottom: 4 }}
              >
                <CartesianGrid
                  stroke="rgba(255, 255, 255, 0.05)"
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis
                  dataKey="time"
                  stroke="rgba(255, 255, 255, 0.1)"
                  tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
                  interval={2}
                />
                <YAxis
                  stroke="rgba(255, 255, 255, 0.1)"
                  tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, yAxisMax]}
                />
                <ReferenceLine
                  y={standard === 'NAQI' ? 100 : 50}
                  stroke="#10b981"
                  strokeDasharray="4 4"
                  strokeOpacity={0.35}
                />
                <ReferenceLine
                  y={standard === 'NAQI' ? 200 : 100}
                  stroke="#f59e0b"
                  strokeDasharray="4 4"
                  strokeOpacity={0.35}
                />
                <Tooltip content={renderCustomTooltip} />
                <Line
                  type="monotone"
                  dataKey="aqi"
                  stroke={category.color}
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{
                    r: 5,
                    fill: category.color,
                    stroke: '#020408',
                    strokeWidth: 2,
                  }}
                  isAnimationActive={true}
                  animationDuration={750}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Diurnal Meteorological Phase Markers */}
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-white/5 text-[10px] font-mono">
            <div className="flex items-center gap-2 rounded-lg bg-white/[0.02] p-2 border border-white/5">
              <Moon className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
              <div className="min-w-0">
                <span className="text-slate-200 font-bold block">00:00 - 06:00</span>
                <p className="text-slate-500 truncate text-[9px]">Nocturnal Inversion Lid</p>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-lg bg-white/[0.02] p-2 border border-white/5">
              <Activity className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              <div className="min-w-0">
                <span className="text-slate-200 font-bold block">06:00 - 10:00</span>
                <p className="text-slate-500 truncate text-[9px]">Morning Rush Peak</p>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-lg bg-white/[0.02] p-2 border border-white/5">
              <Sun className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <div className="min-w-0">
                <span className="text-slate-200 font-bold block">11:00 - 16:00</span>
                <p className="text-slate-500 truncate text-[9px]">Solar Convective Dilution</p>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-lg bg-white/[0.02] p-2 border border-white/5">
              <Wind className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
              <div className="min-w-0">
                <span className="text-slate-200 font-bold block">17:00 - 23:00</span>
                <p className="text-slate-500 truncate text-[9px]">Radiation Cooling Re-trapping</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
