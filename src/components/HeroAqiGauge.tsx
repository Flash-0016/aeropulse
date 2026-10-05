import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  HeartPulse,
  Info,
  ArrowUpRight,
  Wind,
  Activity,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { AirStation, AQIStandard } from '../types';
import { getAQICategory, getHealthGuideline } from '../utils/aqiCalculators';

interface HeroAqiGaugeProps {
  station: AirStation;
  standard: AQIStandard;
  colorBlindMode: boolean;
  onViewFullHealth: () => void;
}

export const HeroAqiGauge: React.FC<HeroAqiGaugeProps> = ({
  station,
  standard,
  colorBlindMode,
  onViewFullHealth,
}) => {
  const aqiValue = standard === 'NAQI' ? station.aqiNAQI : station.aqiEPA;
  const category = getAQICategory(aqiValue, standard, colorBlindMode);
  const healthGuide = getHealthGuideline(aqiValue);

  // Gauge stroke color according to standard and category
  const gaugeColor = category.color;
  const gaugeTextColor = category.textColor;

  // Arc Gauge Geometry calculation (260-degree sweep)
  const radius = 88;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;
  const sweepPercent = 260 / 360;
  const maxArcLength = circumference * sweepPercent;
  const currentRatio = Math.min(500, Math.max(0, aqiValue)) / 500;
  const strokeDashoffset = maxArcLength * (1 - currentRatio);

  const dominantKey = station.dominantPollutant
    ? station.dominantPollutant.toLowerCase().replace('.', '')
    : 'pm25';
  const dominantPollutantDetail = station.pollutants ? station.pollutants[dominantKey] : undefined;

  const legendItems = standard === 'NAQI'
    ? [
        { label: '0–50 Good', color: '#16A34A', active: aqiValue <= 50 },
        { label: '51–100 Satisfactory', color: '#84CC16', active: aqiValue > 50 && aqiValue <= 100 },
        { label: '101–200 Moderate', color: '#EAB308', active: aqiValue > 100 && aqiValue <= 200 },
        { label: '201–300 Poor', color: '#F97316', active: aqiValue > 200 && aqiValue <= 300 },
        { label: '301–400 Very Poor', color: '#EF4444', active: aqiValue > 300 && aqiValue <= 400 },
        { label: '401–500 Severe', color: '#991B1B', active: aqiValue > 400 },
      ]
    : [
        { label: '0–50 Good', color: '#16A34A', active: aqiValue <= 50 },
        { label: '51–100 Moderate', color: '#84CC16', active: aqiValue > 50 && aqiValue <= 100 },
        { label: '101–150 Sensitive', color: '#EAB308', active: aqiValue > 100 && aqiValue <= 150 },
        { label: '151–200 Unhealthy', color: '#F97316', active: aqiValue > 150 && aqiValue <= 200 },
        { label: '201–300 Very Unhealthy', color: '#EF4444', active: aqiValue > 200 && aqiValue <= 300 },
        { label: '301–500 Hazardous', color: '#991B1B', active: aqiValue > 300 },
      ];

  return (
    <div
      className="rounded-2xl border border-[rgba(180,210,220,0.10)] p-5 lg:p-7 shadow-[0_8px_30px_rgba(0,0,0,0.20)] relative overflow-hidden"
      style={{
        backgroundColor: '#101921',
        backgroundImage: `
          radial-gradient(circle at 10% 10%, rgba(47, 118, 128, 0.14) 0%, transparent 40%),
          radial-gradient(circle at 50% 50%, rgba(20, 70, 78, 0.08) 0%, transparent 60%),
          radial-gradient(circle at 90% 90%, rgba(5, 12, 18, 0.25) 0%, transparent 50%)
        `,
      }}
      id="hero-aqi-gauge-card"
    >
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center relative z-10">
        
        {/* Left Column: Station Location & Telemetry Context (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-xs font-semibold text-[#22B8C7] uppercase tracking-wider">
              <span className="h-1.5 w-1.5 rounded-full bg-[#22B8C7]"></span>
              <span>Active Monitoring Station</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F3F7F8]">
              {station.city}
            </h1>
            <p className="text-sm text-[#B7C5CE] font-medium leading-relaxed">
              {station.name}
            </p>
          </div>

          <div className="rounded-xl border border-[rgba(180,210,220,0.10)] bg-[#131D26] p-3.5 space-y-2.5 text-xs">
            <div className="flex items-center justify-between text-[#8193A0]">
              <span>Station Identifier:</span>
              <span className="font-mono font-semibold text-[#F3F7F8]">{station.stationCode}</span>
            </div>
            <div className="flex items-center justify-between text-[#8193A0]">
              <span>Geo Coordinates:</span>
              <span className="font-mono text-[#B7C5CE]">
                {station.lat.toFixed(4)}°N, {station.lon.toFixed(4)}°E
              </span>
            </div>
            <div className="flex items-center justify-between text-[#8193A0]">
              <span>Sensor Hardware:</span>
              <span className="truncate max-w-[170px] text-[#B7C5CE] text-right font-medium" title={station.sensorModel}>
                {station.sensorModel.split(' ')[0]} {station.sensorModel.split(' ')[1] || 'Analyzer'}
              </span>
            </div>
            <div className="flex items-center justify-between text-[#8193A0] border-t border-[rgba(180,210,220,0.08)] pt-2">
              <span>Confidence Index:</span>
              <span className="flex items-center space-x-1 font-semibold text-[#4ADE80]">
                <CheckCircle2 className="h-3 w-3" />
                <span>{station.confidenceScore}%</span>
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-[11px] text-[#718591]">
            <Info className="h-3.5 w-3.5 text-[#566772] shrink-0" />
            <span>Standard: {standard === 'NAQI' ? 'CPCB National Air Quality Index (NAQI)' : 'US-EPA NowCast AQI Formula'}</span>
          </div>
        </div>

        {/* Center Column: Circular AQI Gauge & Compact AQI Legend (4 cols) */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center text-center">
          <div className="relative flex items-center justify-center">
            {/* SVG Arc Gauge */}
            <svg
              className="w-56 h-56 sm:w-64 sm:h-64 transform -rotate-130"
              viewBox="0 0 220 220"
            >
              {/* Secondary background track */}
              <circle
                cx="110"
                cy="110"
                r={radius}
                fill="transparent"
                stroke="#1A252D"
                strokeWidth={strokeWidth}
                strokeDasharray={`${maxArcLength} ${circumference}`}
                strokeLinecap="round"
              />

              {/* Foreground track */}
              <circle
                cx="110"
                cy="110"
                r={radius}
                fill="transparent"
                stroke="#25323B"
                strokeWidth={strokeWidth - 2}
                strokeDasharray={`${maxArcLength} ${circumference}`}
                strokeLinecap="round"
              />

              {/* Six subtle interval markers */}
              <circle
                cx="110"
                cy="110"
                r={radius}
                fill="transparent"
                stroke="rgba(180, 210, 220, 0.12)"
                strokeWidth={2}
                strokeDasharray={`2 ${circumference / 6 - 2}`}
                strokeLinecap="butt"
              />

              {/* Dynamic filled arc */}
              <circle
                cx="110"
                cy="110"
                r={radius}
                fill="transparent"
                stroke={gaugeColor}
                strokeWidth={strokeWidth}
                strokeDasharray={`${maxArcLength} ${circumference}`}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{
                  transition: 'stroke-dashoffset 1.2s cubic-bezier(0.34, 1.56, 0.64, 1), stroke 0.5s ease',
                  filter: `drop-shadow(0 0 8px ${gaugeColor}25)`,
                }}
              />
            </svg>

            {/* Inner Content inside circle */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#718591]">
                Current AQI
              </span>
              <div className="flex items-baseline space-x-1 my-1">
                <span className="text-5xl sm:text-6xl font-black tracking-tight text-[#F5F7F8]" id="hero-aqi-number">
                  {aqiValue}
                </span>
                <span className="text-xs font-semibold text-[#718591]">/ 500</span>
              </div>

              {/* Status Badge */}
              <div
                className="mt-1 inline-flex items-center space-x-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider"
                style={{
                  backgroundColor: category.bgLight,
                  color: gaugeTextColor,
                  border: `1px solid ${category.borderColor}`,
                }}
              >
                {aqiValue <= 100 ? (
                  <ShieldCheck className="h-3.5 w-3.5" />
                ) : aqiValue <= 200 ? (
                  <AlertTriangle className="h-3.5 w-3.5" />
                ) : (
                  <ShieldAlert className="h-3.5 w-3.5" />
                )}
                <span>{category.label}</span>
              </div>
            </div>
          </div>

          {/* Primary Pollutant Callout */}
          <div className="mt-3 flex items-center space-x-1.5 rounded-lg border border-[rgba(34,184,199,0.30)] bg-[rgba(34,184,199,0.10)] px-3 py-1.5 text-xs text-[#4DD4DF]">
            <span className="text-[#8193A0]">PRIMARY POLLUTANT: </span>
            <strong className="font-semibold text-[#4DD4DF]">{station.dominantPollutant}</strong>
            {dominantPollutantDetail && (
              <span className="text-[#B7C5CE] font-mono">
                ({dominantPollutantDetail.value} {dominantPollutantDetail.unit})
              </span>
            )}
          </div>

          {/* Compact AQI Reference Legend */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5 pt-2 text-[10px]">
            {legendItems.map((item) => (
              <span
                key={item.label}
                className={`flex items-center space-x-1 rounded px-1.5 py-0.5 border ${
                  item.active
                    ? 'border-white/30 font-bold text-white bg-white/10'
                    : 'border-transparent text-[#718591]'
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span>{item.label}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Right Column: Health Advisory & Impact Card (4 cols) */}
        <div className="lg:col-span-4 rounded-xl border border-[rgba(180,210,220,0.10)] bg-[#111B24] p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <HeartPulse className="h-4 w-4 text-[#4DD4DF]" />
              <h3 className="text-sm font-bold text-[#F3F7F8] tracking-wide">
                Health Impact & Guidelines
              </h3>
            </div>
            <span
              className="rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
              style={{
                backgroundColor: category.bgLight,
                color: category.textColor,
                border: `1px solid ${category.borderColor}`,
              }}
            >
              {category.label}
            </span>
          </div>

          <p className="text-xs font-medium text-[#B7C5CE] leading-relaxed">
            {healthGuide.generalPublic}
          </p>

          {/* Quick Action Matrix */}
          <div className="space-y-2 pt-1 border-t border-[rgba(180,210,220,0.08)] text-xs">
            <div className="flex items-start space-x-2.5">
              <div
                className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded text-[10px] font-bold ${
                  healthGuide.maskRequired.needed
                    ? 'bg-[rgba(234,179,8,0.12)] text-[#FACC15] border border-[rgba(234,179,8,0.35)]'
                    : 'bg-[rgba(22,163,74,0.12)] text-[#4ADE80] border border-[rgba(22,163,74,0.35)]'
                }`}
              >
                M
              </div>
              <div>
                <span className="font-semibold text-[#F3F7F8]">Mask: </span>
                <span className="text-[#8193A0]">{healthGuide.maskRequired.type}</span>
              </div>
            </div>

            <div className="flex items-start space-x-2.5">
              <div
                className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded text-[10px] font-bold ${
                  !healthGuide.outdoorAthletics.allowed
                    ? 'bg-[rgba(239,68,68,0.12)] text-[#F87171] border border-[rgba(239,68,68,0.35)]'
                    : 'bg-[rgba(22,163,74,0.12)] text-[#4ADE80] border border-[rgba(22,163,74,0.35)]'
                }`}
              >
                O
              </div>
              <div>
                <span className="font-semibold text-[#F3F7F8]">Outdoor Exertion: </span>
                <span className="text-[#8193A0]">
                  {healthGuide.outdoorAthletics.allowed ? 'Safe for outdoor exercise' : 'Limit heavy cardio outdoors'}
                </span>
              </div>
            </div>

            <div className="flex items-start space-x-2.5">
              <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded text-[10px] font-bold bg-[rgba(34,184,199,0.12)] text-[#4DD4DF] border border-[rgba(34,184,199,0.30)]">
                P
              </div>
              <div>
                <span className="font-semibold text-[#F3F7F8]">Air Purifier: </span>
                <span className="text-[#8193A0]">
                  {healthGuide.indoorVentilation.openWindows ? 'Natural airflow OK' : `Keep windows closed; HEPA ${healthGuide.indoorVentilation.hepaACH} ACH`}
                </span>
              </div>
            </div>
          </div>

          {/* Action to switch to Health Tab (Secondary button style) */}
          <button
            onClick={onViewFullHealth}
            id="view-complete-health-guidance-btn"
            className="group flex w-full items-center justify-between rounded-lg border border-[rgba(180,210,220,0.14)] bg-[#151F28] px-3.5 py-2 text-xs font-semibold text-[#C7D3D9] transition-all hover:bg-[#1B2933] hover:text-[#F3F7F8] hover:border-[rgba(34,184,199,0.30)]"
          >
            <span>Complete Public Health Advisory</span>
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 text-[#22B8C7]" />
          </button>
        </div>

      </div>
    </div>
  );
};

