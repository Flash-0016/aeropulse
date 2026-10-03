import React, { useMemo } from 'react';
import {
  Calendar,
  TrendingDown,
  TrendingUp,
  Minus,
  CheckCircle2,
  Wind,
  CloudSun,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { AirStation, AQIStandard, ForecastDay } from '../types';
import { getAirQualityForecast } from '../utils/airQualityAnalytics';
import { getAQICategory } from '../utils/aqiCalculators';

interface ForecastSectionProps {
  station: AirStation;
  standard: AQIStandard;
  colorBlindMode: boolean;
}

export const ForecastSection: React.FC<ForecastSectionProps> = ({
  station,
  standard,
  colorBlindMode,
}) => {
  const forecastDays = useMemo(() => {
    return getAirQualityForecast(station, standard);
  }, [station, standard]);

  const getCategoryColor = (category: string) => {
    if (colorBlindMode) {
      switch (category) {
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

    switch (category) {
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
    <section className="space-y-4" id="forecast-section">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-cyan-400" />
            <span>5-Day Atmospheric Quality Outlook</span>
          </h2>
          <p className="text-xs text-slate-400">
            Coupled chemistry-transport atmospheric numerical dispersion projections.
          </p>
        </div>

        <div className="flex items-center space-x-1.5 text-xs text-slate-400">
          <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
          <span>Forecast Model: Ensemble WRF-Chem v4.3</span>
        </div>
      </div>

      {/* 5 Horizontal Forecast Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {forecastDays.map((day, idx) => {
          const color = getCategoryColor(day.category);
          const isToday = idx === 0;

          return (
            <div
              key={day.date}
              className={`flex flex-col justify-between rounded-xl p-4 transition-all backdrop-blur-sm ${
                isToday
                  ? 'border-2 border-cyan-500/40 bg-[#16202C] shadow-lg shadow-cyan-500/5'
                  : 'border border-white/8 bg-[#121822] hover:border-white/20'
              }`}
            >
              {/* Day Header */}
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white tracking-wide">
                    {day.dayLabel}
                  </span>
                  <div className="flex items-center space-x-1">
                    {day.trend === 'improving' ? (
                      <span className="flex items-center text-[10px] font-semibold text-emerald-400">
                        <TrendingDown className="h-3 w-3 mr-0.5" />
                        Improving
                      </span>
                    ) : day.trend === 'worsening' ? (
                      <span className="flex items-center text-[10px] font-semibold text-rose-400">
                        <TrendingUp className="h-3 w-3 mr-0.5" />
                        Worsening
                      </span>
                    ) : (
                      <span className="flex items-center text-[10px] font-semibold text-slate-400">
                        <Minus className="h-3 w-3 mr-0.5" />
                        Stable
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-[11px] text-slate-500 font-mono">{day.date}</div>

                {/* AQI Prediction Pill */}
                <div className="my-3 flex items-center justify-between rounded-lg bg-[#0E141C] p-2.5">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500">Predicted AQI</span>
                    <div className="text-2xl font-black" style={{ color }}>
                      {day.predictedAqi}
                    </div>
                  </div>
                  <span
                    className="rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                    style={{
                      backgroundColor: `${color}18`,
                      color,
                      border: `1px solid ${color}35`,
                    }}
                  >
                    {day.category}
                  </span>
                </div>

                {/* Meteorology snapshot */}
                <div className="space-y-1.5 text-xs text-slate-300">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Temp Range:</span>
                    <span className="font-semibold text-slate-200">
                      {day.tempLow}° - {day.tempHigh}°C
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Wind Velocity:</span>
                    <span className="font-mono text-cyan-300 font-medium">
                      {day.windSpeedKmh} km/h
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Primary:</span>
                    <span className="font-semibold text-white">{day.primaryPollutant}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Synopsis */}
              <div className="mt-3 border-t border-white/5 pt-2 text-[11px] text-slate-400 leading-snug">
                <p className="line-clamp-2 italic">{day.synopsis}</p>
                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                  <span>Confidence: {day.confidence}%</span>
                  <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
