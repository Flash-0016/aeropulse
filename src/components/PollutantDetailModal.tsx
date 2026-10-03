import React from 'react';
import { X, AlertCircle, TrendingUp, Info, Activity, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { PollutantDetail, AirStation, AQIStandard } from '../types';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface PollutantDetailModalProps {
  pollutant: PollutantDetail | null;
  station: AirStation;
  standard: AQIStandard;
  onClose: () => void;
}

export const PollutantDetailModal: React.FC<PollutantDetailModalProps> = ({
  pollutant,
  station,
  standard,
  onClose,
}) => {
  if (!pollutant) return null;

  // Generate 24-hour mini sparkline points for this specific pollutant
  const baseVal = pollutant.value;
  const sparklineData = Array.from({ length: 24 }).map((_, i) => {
    const hour = `${i.toString().padStart(2, '0')}:00`;
    // diurnal curve
    const factor = 1 + 0.3 * Math.sin((i / 24) * Math.PI * 2 - Math.PI / 2) + ((i % 3) * 0.05 - 0.05);
    const val = Number((baseVal * Math.max(0.4, factor)).toFixed(pollutant.code === 'CO' || pollutant.code === 'Pb' ? 2 : 1));
    return { hour, val };
  });

  const percentageOfLimit = Math.round((pollutant.value / pollutant.standardLimit24h) * 100);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Good':
        return '#10B981';
      case 'Satisfactory':
        return '#84CC16';
      case 'Moderate':
        return '#EAB308';
      case 'Poor':
        return '#F97316';
      case 'Very Poor':
        return '#EF4444';
      default:
        return '#991B1B';
    }
  };

  const statusColor = getStatusColor(pollutant.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md animate-in fade-in-50">
      <div
        className="relative w-full max-w-2xl rounded-2xl border border-white/10 bg-[#131A24] p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar"
        id="pollutant-detail-modal"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/8 pb-4">
          <div className="flex items-center space-x-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl font-bold font-mono text-lg"
              style={{
                backgroundColor: `${statusColor}20`,
                color: statusColor,
                border: `1px solid ${statusColor}40`,
              }}
            >
              {pollutant.code}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-white">{pollutant.name}</h2>
                <span
                  className="rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider"
                  style={{
                    backgroundColor: `${statusColor}15`,
                    color: statusColor,
                    border: `1px solid ${statusColor}30`,
                  }}
                >
                  {pollutant.status}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Monitored at {station.name} ({station.city})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            id="close-pollutant-modal-btn"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Current Metric Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-xl border border-white/5 bg-[#0E141C] p-3.5">
            <span className="text-xs text-slate-400">Current Reading</span>
            <div className="flex items-baseline space-x-1 mt-1">
              <span className="text-2xl font-black text-white">{pollutant.value}</span>
              <span className="text-xs font-mono text-slate-400">{pollutant.unit}</span>
            </div>
            <span className="text-[11px] text-slate-500">24-hour running mean</span>
          </div>

          <div className="rounded-xl border border-white/5 bg-[#0E141C] p-3.5">
            <span className="text-xs text-slate-400">National Standard Limit</span>
            <div className="flex items-baseline space-x-1 mt-1">
              <span className="text-2xl font-black text-cyan-400">{pollutant.standardLimit24h}</span>
              <span className="text-xs font-mono text-slate-400">{pollutant.unit}</span>
            </div>
            <span className="text-[11px] text-slate-500">Regulatory threshold</span>
          </div>

          <div className="rounded-xl border border-white/5 bg-[#0E141C] p-3.5">
            <span className="text-xs text-slate-400">Ratio vs Limit</span>
            <div className="flex items-baseline space-x-1 mt-1">
              <span
                className="text-2xl font-black"
                style={{ color: statusColor }}
              >
                {percentageOfLimit}%
              </span>
            </div>
            <span className="text-[11px] text-slate-500">
              {percentageOfLimit > 100 ? 'Exceeds guideline' : 'Within guideline'}
            </span>
          </div>
        </div>

        {/* 24-Hour Sparkline Chart */}
        <div className="rounded-xl border border-white/5 bg-[#0E141C] p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              24-Hour Concentration Profile
            </span>
            <span className="text-xs font-mono text-slate-500">Unit: {pollutant.unit}</span>
          </div>
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparklineData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id={`grad-${pollutant.code}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={statusColor} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={statusColor} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="hour"
                  stroke="#475569"
                  fontSize={10}
                  tickLine={false}
                  interval={3}
                />
                <YAxis
                  stroke="#475569"
                  fontSize={10}
                  tickLine={false}
                  domain={[0, 'auto']}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#151D28',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [`${val} ${pollutant.unit}`, `${pollutant.name}`]}
                />
                <Area
                  type="monotone"
                  dataKey="val"
                  stroke={statusColor}
                  strokeWidth={2}
                  fill={`url(#grad-${pollutant.code})`}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Origin & Sources */}
        <div className="rounded-xl border border-white/5 bg-[#0E141C] p-4 space-y-2">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
            <Info className="h-4 w-4" />
            <span>Environmental Origin & Emission Pathways</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-medium">
            {pollutant.origin}
          </p>
        </div>

        {/* Health Impacts */}
        <div className="rounded-xl border border-white/5 bg-[#0E141C] p-4 space-y-2">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-rose-400">
            <ShieldAlert className="h-4 w-4" />
            <span>Biological Impact & Toxicology</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-medium">
            {pollutant.healthImpact}
          </p>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-white/5">
          <span>Continuous Ambient Air Monitoring Protocol</span>
          <button
            onClick={onClose}
            className="rounded-lg bg-white/10 px-4 py-1.5 text-xs font-semibold text-white hover:bg-white/20 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
