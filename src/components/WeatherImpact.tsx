import React from 'react';
import {
  CloudSun,
  Wind,
  Droplets,
  Gauge,
  Eye,
  Thermometer,
  Layers,
  Compass,
  ArrowUp,
  Info,
} from 'lucide-react';
import { AirStation } from '../types';

interface WeatherImpactProps {
  station: AirStation;
}

export const WeatherImpact: React.FC<WeatherImpactProps> = ({ station }) => {
  const { weather } = station;

  // Calculate cardinal wind direction from degrees
  const getCardinalDirection = (angle: number) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    if (isNaN(angle) || angle === undefined || angle === null) return 'N';
    const normalized = ((angle % 360) + 360) % 360;
    const index = Math.round(normalized / 22.5) % 16;
    return directions[index] || 'N';
  };

  const cardinal = getCardinalDirection(weather.windDeg);

  // Generate scientific weather influence narrative
  const getWeatherInfluenceNarrative = () => {
    if (weather.windSpeed < 2.0 && weather.inversionStrength > 65) {
      return `Severe thermal inversion capping at ${weather.boundaryLayerHeight}m combined with low wind velocity (${weather.windSpeed} m/s) severely suppresses vertical atmospheric convection. Particulates and chemical precursors remain concentrated within the pedestrian breathing zone.`;
    }
    if (weather.humidity > 80 && weather.windSpeed < 3.0) {
      return `High relative humidity (${weather.humidity}%) accelerates hygroscopic growth of fine aerosol particles, increasing secondary sulfate and nitrate formation. Calm boundary layer restricts natural aerodynamic dilution.`;
    }
    if (weather.windSpeed >= 4.5) {
      return `Active horizontal advection (${weather.windSpeedKmh} km/h from ${cardinal}) and an elevated planetary boundary layer (${weather.boundaryLayerHeight}m) generate effective mechanical turbulence, dispersing surface emissions into upper air strata.`;
    }
    return `Moderate wind shear (${weather.windSpeedKmh} km/h) and ventilation index (${weather.ventilationIndex} m²/s) maintain steady equilibrium between localized ground emissions and ambient tropospheric mixing.`;
  };

  return (
    <section className="space-y-4" id="weather-air-quality-section">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center space-x-2">
            <CloudSun className="h-5 w-5 text-cyan-400" />
            <span>Meteorological Parameters & Dispersion Physics</span>
          </h2>
          <p className="text-xs text-slate-400">
            Coupled weather sensor telemetry driving ambient pollutant transport and stagnation models.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: 6 Weather Parameter Cards (8 cols) */}
        <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {/* Temperature */}
          <div className="rounded-xl border border-white/8 bg-[#121822] p-3.5 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Ambient Temp</span>
              <Thermometer className="h-4 w-4 text-amber-400" />
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-black text-white">{weather.temp}°</span>
              <span className="text-xs font-mono text-slate-400">C</span>
            </div>
            <span className="text-[10px] text-slate-500">Surface thermocouple</span>
          </div>

          {/* Humidity */}
          <div className="rounded-xl border border-white/8 bg-[#121822] p-3.5 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Relative Humidity</span>
              <Droplets className="h-4 w-4 text-cyan-400" />
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-black text-white">{weather.humidity}%</span>
            </div>
            <span className="text-[10px] text-slate-500">Hygroscopic particle growth</span>
          </div>

          {/* Wind Speed & Direction */}
          <div className="rounded-xl border border-white/8 bg-[#121822] p-3.5 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Wind Velocity</span>
              <div className="flex items-center space-x-1 text-teal-400">
                <Compass className="h-3.5 w-3.5" />
                <span className="font-bold text-[11px]">{cardinal}</span>
              </div>
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-black text-white">{weather.windSpeedKmh}</span>
              <span className="text-xs font-mono text-slate-400">km/h</span>
            </div>
            <div className="flex items-center space-x-1 text-[10px] text-slate-400">
              <span>Gusts: {weather.windGust} m/s</span>
            </div>
          </div>

          {/* Atmospheric Pressure */}
          <div className="rounded-xl border border-white/8 bg-[#121822] p-3.5 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Barometric Pressure</span>
              <Gauge className="h-4 w-4 text-indigo-400" />
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-black text-white">{weather.pressure}</span>
              <span className="text-xs font-mono text-slate-400">hPa</span>
            </div>
            <span className="text-[10px] text-slate-500">Synoptic pressure system</span>
          </div>

          {/* Visibility */}
          <div className="rounded-xl border border-white/8 bg-[#121822] p-3.5 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Optical Visibility</span>
              <Eye className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-black text-white">
                {(weather.visibility / 1000).toFixed(1)}
              </span>
              <span className="text-xs font-mono text-slate-400">km</span>
            </div>
            <span className="text-[10px] text-slate-500">Transmissometer optical extinction</span>
          </div>

          {/* Boundary Layer Height */}
          <div className="rounded-xl border border-white/8 bg-[#121822] p-3.5 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Boundary Layer (PBL)</span>
              <Layers className="h-4 w-4 text-rose-400" />
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-black text-white">{weather.boundaryLayerHeight}</span>
              <span className="text-xs font-mono text-slate-400">m</span>
            </div>
            <span className="text-[10px] text-slate-500">Vertical convective mixing lid</span>
          </div>
        </div>

        {/* Right Column: Weather Influence Analysis (4 cols) */}
        <div className="lg:col-span-4 rounded-xl border border-white/8 bg-[#121822] p-4 flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
              <Info className="h-4 w-4" />
              <span>Modeled Weather Influence</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              {getWeatherInfluenceNarrative()}
            </p>
          </div>

          <div className="rounded-lg bg-[#0E141C] p-2.5 border border-white/5 text-xs space-y-1.5">
            <div className="flex justify-between text-slate-400">
              <span>Ventilation Index:</span>
              <span className="font-mono font-bold text-white">{weather.ventilationIndex} m²/s</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Inversion Trapping:</span>
              <span
                className={`font-semibold ${
                  weather.inversionStrength > 70
                    ? 'text-rose-400'
                    : weather.inversionStrength > 40
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {weather.inversionStrength > 70
                  ? 'Severe Capping'
                  : weather.inversionStrength > 40
                  ? 'Moderate Trap'
                  : 'Free Convection'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
