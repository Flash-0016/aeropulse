import React, { useState } from 'react';
import { Sparkles, ArrowRight, AlertCircle, Info } from 'lucide-react';
import { AirStation, PollutantDetail, AQIStandard } from '../types';
import { PollutantDetailModal } from './PollutantDetailModal';

interface PollutantBreakdownProps {
  station: AirStation;
  standard: AQIStandard;
  colorBlindMode: boolean;
}

export const PollutantBreakdown: React.FC<PollutantBreakdownProps> = ({
  station,
  standard,
  colorBlindMode,
}) => {
  const [selectedPollutant, setSelectedPollutant] = useState<PollutantDetail | null>(null);

  // Pollutant codes to show in standard environmental priority order
  const pollutantOrder = ['pm25', 'pm10', 'no2', 'o3', 'so2', 'co', 'nh3', 'pb'];

  const getStatusColor = (status: string) => {
    if (colorBlindMode) {
      switch (status) {
        case 'Good':
          return '#3B82F6';
        case 'Satisfactory':
          return '#06B6D4';
        case 'Moderate':
          return '#F59E0B';
        case 'Poor':
          return '#D97706';
        case 'Very Poor':
          return '#9333EA';
        default:
          return '#581C87';
      }
    }

    switch (status) {
      case 'Good':
        return '#16A34A';
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

  return (
    <section className="space-y-4" id="pollutant-breakdown-section">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[#F3F7F8] flex items-center space-x-2">
            <span>Pollutant Breakdown</span>
            <span className="text-xs font-normal text-[#8FA2AD]">
              (8-Pollutant Atmospheric Spec)
            </span>
          </h2>
          <p className="text-xs text-[#8193A0]">
            Real-time concentrations compared to national 24-hour regulatory thresholds. Click any pollutant for detailed analytics.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs text-[#8FA2AD]">
          <span className="flex items-center space-x-1.5 rounded-md border border-[rgba(34,184,199,0.30)] bg-[rgba(34,184,199,0.10)] px-2.5 py-1 text-[#4DD4DF]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#4DD4DF]"></span>
            <span>Primary Pollutant: <strong className="font-semibold">{station.dominantPollutant}</strong></span>
          </span>
        </div>
      </div>

      {/* Grid of 8 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {pollutantOrder.map((key) => {
          const item = station.pollutants[key];
          if (!item) return null;

          const isDominant = (station.dominantPollutant || '').toLowerCase().replace('.', '') === key.replace('.', '');
          const statusColor = getStatusColor(item.status);
          const percentOfLimit = Math.min(250, Math.round((item.value / item.standardLimit24h) * 100));

          return (
            <button
              key={item.code}
              onClick={() => setSelectedPollutant(item)}
              id={`pollutant-card-${item.code.toLowerCase().replace('.', '')}`}
              className={`group relative flex flex-col justify-between rounded-xl p-4 text-left transition-all ${
                isDominant
                  ? 'border border-[rgba(34,184,199,0.40)] bg-[#14222E] shadow-md hover:border-[#22B8C7]'
                  : 'border border-[rgba(180,210,220,0.10)] bg-[#131D26] hover:border-[rgba(180,210,220,0.20)] hover:bg-[#182632]'
              }`}
            >
              {/* Primary Pollutant Badge */}
              {isDominant && (
                <div className="absolute -top-2.5 right-3 flex items-center space-x-1 rounded-full border border-[rgba(34,184,199,0.30)] bg-[rgba(34,184,199,0.15)] backdrop-blur-sm px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#4DD4DF] shadow-sm">
                  <Sparkles className="h-3 w-3" />
                  <span>PRIMARY POLLUTANT</span>
                </div>
              )}

              {/* Top Row: Symbol and Name */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-base font-extrabold text-[#F3F7F8] tracking-tight">
                    {item.code}
                  </span>
                  <span
                    className="rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider"
                    style={{
                      backgroundColor: `${statusColor}18`,
                      color: statusColor,
                      border: `1px solid ${statusColor}35`,
                    }}
                  >
                    {item.status}
                  </span>
                </div>
                <div className="text-xs text-[#8FA2AD] truncate max-w-[190px]">
                  {item.name}
                </div>
              </div>

              {/* Middle Row: Concentration Value */}
              <div className="my-3 flex items-baseline justify-between">
                <div className="flex items-baseline space-x-1">
                  <span className="text-2xl font-black tracking-tight text-[#F5F7F8]">
                    {item.value}
                  </span>
                  <span className="text-xs font-mono text-[#718591]">
                    {item.unit}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-[#566772]">
                  Limit: {item.standardLimit24h}
                </span>
              </div>

              {/* Bottom Row: Horizontal Indicator Bar vs Standard Limit */}
              <div className="space-y-1.5 pt-2 border-t border-[rgba(180,210,220,0.08)]">
                <div className="flex justify-between text-[11px] text-[#8193A0]">
                  <span>Standard Ratio</span>
                  <span className="font-semibold" style={{ color: statusColor }}>
                    {percentOfLimit}%
                  </span>
                </div>
                {/* Progress bar with #1E2B35 background track */}
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#1E2B35]">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min(100, (percentOfLimit / 200) * 100)}%`,
                      backgroundColor: statusColor,
                    }}
                  />
                </div>
                <div className="flex items-center justify-between pt-1 text-[10px] text-[#566772]">
                  <span>Sub-index: {item.subIndex}</span>
                  <span className="flex items-center space-x-0.5 text-[#22B8C7] opacity-0 transition-opacity group-hover:opacity-100 font-medium">
                    <span>Inspect</span>
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>


      {/* Detail Modal if a card was clicked */}
      <PollutantDetailModal
        pollutant={selectedPollutant}
        station={station}
        standard={standard}
        onClose={() => setSelectedPollutant(null)}
      />
    </section>
  );
};
