import React, { useState, useMemo } from 'react';
import { Grid, Info, Clock, ArrowRight } from 'lucide-react';
import { AirStation } from '../types';
import { get24HourHeatmapData, HeatmapCell } from '../utils/airQualityAnalytics';

interface PollutionHeatmapProps {
  station: AirStation;
  colorBlindMode: boolean;
}

export const PollutionHeatmap: React.FC<PollutionHeatmapProps> = ({
  station,
  colorBlindMode,
}) => {
  const [hoveredCell, setHoveredCell] = useState<HeatmapCell | null>(null);

  const cells = useMemo(() => {
    return get24HourHeatmapData(station);
  }, [station]);

  const pollutants = ['PM2.5', 'PM10', 'NO2', 'O3', 'SO2', 'CO'];
  const hours = Array.from({ length: 24 }).map((_, i) => `${i.toString().padStart(2, '0')}:00`);

  const getCellColor = (status: string) => {
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
          return '#8B5CF6';
        default:
          return '#581C87';
      }
    }

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

  return (
    <section className="space-y-4" id="pollution-heatmap-section">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center space-x-2">
            <Grid className="h-5 w-5 text-cyan-400" />
            <span>24-Hour Diurnal Heatmap Matrix</span>
          </h2>
          <p className="text-xs text-slate-400">
            Hourly dispersion pattern mapping diurnal emission peaks vs convective boundary dilution.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-2 text-[11px] text-slate-400">
          <span className="flex items-center space-x-1">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: getCellColor('Good') }} />
            <span>Good</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: getCellColor('Moderate') }} />
            <span>Moderate</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: getCellColor('Very Poor') }} />
            <span>Very Poor</span>
          </span>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#121822] p-5 space-y-4 backdrop-blur-sm">
        {/* Heatmap Matrix Table */}
        <div className="overflow-x-auto custom-scrollbar pb-2">
          <div className="min-w-[760px] space-y-2">
            {/* Header: Hour labels */}
            <div
              className="gap-1 text-center text-[10px] text-slate-500 font-mono items-center"
              style={{ display: 'grid', gridTemplateColumns: '70px repeat(24, minmax(0, 1fr))' }}
            >
              <div className="text-left font-sans font-semibold text-slate-400">Parameter</div>
              {hours.map((h, i) => (
                <div key={h} className={i % 3 === 0 ? 'text-slate-300 font-bold' : 'text-slate-600'}>
                  {i % 2 === 0 ? h.slice(0, 2) : ''}
                </div>
              ))}
            </div>

            {/* Rows for each pollutant */}
            {pollutants.map((pol) => {
              const polCells = cells.filter((c) => c.pollutant === pol);
              return (
                <div
                  key={pol}
                  className="gap-1 items-center"
                  style={{ display: 'grid', gridTemplateColumns: '70px repeat(24, minmax(0, 1fr))' }}
                >
                  {/* Left Label */}
                  <div className="text-xs font-mono font-bold text-slate-300 truncate pr-2">
                    {pol}
                  </div>

                  {/* 24 Cells */}
                  {polCells.map((cell) => {
                    const color = getCellColor(cell.status);
                    const isHovered =
                      hoveredCell?.hour === cell.hour && hoveredCell?.pollutant === cell.pollutant;

                    return (
                      <div
                        key={cell.hour}
                        onMouseEnter={() => setHoveredCell(cell)}
                        onMouseLeave={() => setHoveredCell(null)}
                        className={`h-7 rounded transition-all cursor-pointer flex items-center justify-center text-[9px] font-mono font-bold ${
                          isHovered ? 'ring-2 ring-white scale-110 z-10 shadow-lg' : 'hover:opacity-90'
                        }`}
                        style={{
                          backgroundColor: `${color}35`,
                          border: `1px solid ${color}60`,
                          color: '#FFFFFF',
                        }}
                      >
                        {/* Show value on wider views or just color box */}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* Hover Inspector Tooltip Panel */}
        <div className="rounded-xl border border-white/5 bg-[#0E141D] p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          {hoveredCell ? (
            <>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1.5 text-slate-400">
                  <Clock className="h-3.5 w-3.5 text-cyan-400" />
                  <span className="font-mono font-bold text-white">{hoveredCell.hour}</span>
                </div>
                <span className="text-slate-500">·</span>
                <div>
                  <span className="font-semibold text-white">{hoveredCell.pollutant}: </span>
                  <span className="font-mono text-cyan-300 font-bold">
                    {hoveredCell.value} {hoveredCell.unit}
                  </span>
                  <span className="ml-1 text-slate-400">({hoveredCell.percentageOfLimit}% of limit)</span>
                </div>
              </div>
              <div className="text-slate-400 italic text-[11px] truncate max-w-[380px]">
                {hoveredCell.note}
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-2 text-slate-500 text-xs">
              <Info className="h-3.5 w-3.5 text-slate-400" />
              <span>Hover over any hour cell in the grid to inspect diurnal meteorological conditions.</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
