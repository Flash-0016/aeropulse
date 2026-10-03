import React from 'react';
import {
  Wind,
  Compass,
  Thermometer,
  Droplets,
  Gauge,
  Eye,
  Layers,
  Activity,
  ArrowUpRight,
} from 'lucide-react';
import { AirStation } from '../types';

interface MicroClimateTierProps {
  station: AirStation;
}

export const MicroClimateTier: React.FC<MicroClimateTierProps> = ({ station }) => {
  const { weather } = station;

  return (
    <div
      id="microclimate-dispersion-tier-panel"
      className="flex flex-col gap-6 rounded-2xl border border-white/10 bg-[#020408]/80 p-6 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative overflow-hidden"
    >
      {/* Background flare */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-900/10 blur-[80px] rounded-full pointer-events-none" />

      {/* Title Bar */}
      <div className="relative z-10 flex flex-wrap items-end justify-between gap-4 border-b border-white/5 pb-4">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/40 border border-white/10 shadow-inner">
            <Wind className="h-5 w-5 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h2 className="text-sm font-bold text-white uppercase tracking-widest">
                Micro-Climate & Boundary Layer Dispersion Tier
              </h2>
              <span className="rounded-md bg-cyan-500/10 px-2 py-0.5 font-mono text-[9px] font-bold text-cyan-400 border border-cyan-500/20 uppercase tracking-widest">
                Layer 3 Telemetry
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Meteorological forcing variables governing atmospheric carrying capacity, particulate stagnation, and thermal dilution
            </p>
          </div>
        </div>

        <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider bg-black/40 px-4 py-2 rounded-lg border border-white/5">
          Surface Barometric Pressure: <span className="font-bold text-white tracking-widest">{weather.pressure} hPa</span>
        </div>
      </div>

      {/* Grid of Micro-Climate Sensors */}
      <div className="relative z-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {/* Wind Speed & Gust */}
        <div className="flex flex-col justify-between rounded-xl bg-black/40 p-4 border border-white/10 shadow-inner hover:bg-black/60 transition-colors">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Wind Vector</span>
            <Wind className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="my-3">
            <div className="font-mono text-3xl font-black text-white tracking-tighter">{weather.windSpeed.toFixed(1)} <span className="text-xs font-normal text-slate-400">m/s</span></div>
            <div className="text-[11px] font-mono text-cyan-500/80 uppercase tracking-wider mt-0.5">{weather.windSpeedKmh.toFixed(1)} km/h</div>
          </div>
          <div className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider">Gust: {weather.windGust} m/s</div>
        </div>

        {/* Compass Bearing */}
        <div className="flex flex-col justify-between rounded-xl bg-black/40 p-4 border border-white/10 shadow-inner hover:bg-black/60 transition-colors">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Wind Bearing</span>
            <Compass className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="my-3">
            <div className="font-mono text-3xl font-black text-white tracking-tighter">{weather.windDeg}°</div>
            <div className="text-[11px] font-semibold text-cyan-500/80 uppercase tracking-wider mt-0.5">
              From {getBearingLabel(weather.windDeg)}
            </div>
          </div>
          <div className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider">Advection Direction</div>
        </div>

        {/* Temperature */}
        <div className="flex flex-col justify-between rounded-xl bg-black/40 p-4 border border-white/10 shadow-inner hover:bg-black/60 transition-colors">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Ambient Temp</span>
            <Thermometer className="h-4 w-4 text-amber-500" />
          </div>
          <div className="my-3">
            <div className="font-mono text-3xl font-black text-white tracking-tighter">{weather.temp.toFixed(1)}°C</div>
            <div className="text-[11px] font-mono text-amber-500/80 uppercase tracking-wider mt-0.5">
              {((weather.temp * 9) / 5 + 32).toFixed(1)}°F
            </div>
          </div>
          <div className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider">Surface Sensor Level</div>
        </div>

        {/* Relative Humidity */}
        <div className="flex flex-col justify-between rounded-xl bg-black/40 p-4 border border-white/10 shadow-inner hover:bg-black/60 transition-colors">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Relative Humidity</span>
            <Droplets className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="my-3">
            <div className="font-mono text-3xl font-black text-white tracking-tighter">{weather.humidity}%</div>
            <div className="text-[11px] font-bold text-cyan-500/80 uppercase tracking-wider mt-0.5">
              {weather.humidity > 70 ? 'High (Fog/Aerosols)' : 'Moderate'}
            </div>
          </div>
          <div className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider">Aerosol Growth</div>
        </div>

        {/* Mixing Depth / Boundary Layer */}
        <div className="flex flex-col justify-between rounded-xl bg-black/40 p-4 border border-white/10 shadow-inner hover:bg-black/60 transition-colors">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Mixing Depth (PBL)</span>
            <Layers className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="my-3">
            <div className="font-mono text-3xl font-black text-white tracking-tighter">{weather.boundaryLayerHeight} <span className="text-xs font-normal text-slate-400">m</span></div>
            <div className="text-[11px] font-bold text-indigo-400/80 uppercase tracking-wider mt-0.5">
              {weather.boundaryLayerHeight < 350 ? 'Severe Cap' : 'Well Mixed'}
            </div>
          </div>
          <div className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider">Planetary Ceiling</div>
        </div>

        {/* Optical Visibility */}
        <div className="flex flex-col justify-between rounded-xl bg-black/40 p-4 border border-white/10 shadow-inner hover:bg-black/60 transition-colors">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Optical Visibility</span>
            <Eye className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="my-3">
            <div className="font-mono text-3xl font-black text-white tracking-tighter">
              {(weather.visibility / 1000).toFixed(1)} <span className="text-xs font-normal text-slate-400">km</span>
            </div>
            <div className="text-[11px] font-mono text-emerald-400/80 uppercase tracking-wider mt-0.5">{weather.visibility} meters</div>
          </div>
          <div className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider">Light Extinction</div>
        </div>
      </div>
    </div>
  );
};

function getBearingLabel(deg: number): string {
  const directions = ['North', 'NNE', 'NE', 'ENE', 'East', 'ESE', 'SE', 'SSE', 'South', 'SSW', 'SW', 'WSW', 'West', 'WNW', 'NW', 'NNW'];
  const index = Math.round(deg / 22.5) % 16;
  return directions[index];
}
