import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Layers,
  Wind,
  Plus,
  Minus,
  Maximize2,
  Minimize2,
  Compass,
  Check,
  ShieldCheck,
  Activity,
  Filter,
  Navigation,
} from 'lucide-react';
import { AirStation, AQIStandard } from '../types';
import { getAQICategory } from '../utils/aqiCalculators';

interface LiveAirMapProps {
  stations: AirStation[];
  selectedStation: AirStation;
  onSelectStation: (st: AirStation) => void;
  standard: AQIStandard;
  colorBlindMode: boolean;
  standalone?: boolean;
}

export const LiveAirMap: React.FC<LiveAirMapProps> = ({
  stations,
  selectedStation,
  onSelectStation,
  standard,
  colorBlindMode,
  standalone = false,
}) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showWind, setShowWind] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [selectedPollutantLayer, setSelectedPollutantLayer] = useState<'AQI' | 'PM2.5' | 'PM10' | 'NO2' | 'O3'>('AQI');
  const [hoveredStation, setHoveredStation] = useState<AirStation | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Geographic projection projection bounds (World equirectangular mapping to 1000x500 svg)
  const mapWidth = 1000;
  const mapHeight = 500;

  const project = (lat: number, lon: number) => {
    const x = ((lon + 180) / 360) * mapWidth;
    const y = ((90 - lat) / 180) * mapHeight;
    return { x, y };
  };

  // Center on selected station on load or when selectedStation changes
  useEffect(() => {
    if (selectedStation) {
      const { x, y } = project(selectedStation.lat, selectedStation.lon);
      // Pan so that the station is roughly centered
      const centerX = mapWidth / 2;
      const centerY = mapHeight / 2;
      setPan({
        x: (centerX - x) * 0.4,
        y: (centerY - y) * 0.4,
      });
    }
  }, [selectedStation.id]);

  // Animated wind streamlines simulation on canvas overlay
  useEffect(() => {
    if (!showWind) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const particlesCount = 120;
    const particles: Array<{
      x: number;
      y: number;
      speed: number;
      angle: number;
      life: number;
      maxLife: number;
      alpha: number;
    }> = [];

    for (let i = 0; i < particlesCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speed: 0.8 + Math.random() * 1.5,
        angle: (selectedStation.weather.windDeg * Math.PI) / 180 + (Math.random() - 0.5) * 0.3,
        life: Math.random() * 100,
        maxLife: 80 + Math.random() * 60,
        alpha: 0.2 + Math.random() * 0.3,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.life++;
        if (p.life >= p.maxLife) {
          p.life = 0;
          p.x = Math.random() * canvas.width;
          p.y = Math.random() * canvas.height;
          p.angle = (selectedStation.weather.windDeg * Math.PI) / 180 + (Math.random() - 0.5) * 0.3;
        }

        const vx = Math.cos(p.angle) * p.speed;
        const vy = Math.sin(p.angle) * p.speed;

        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + vx * 6, p.y + vy * 6);
        ctx.strokeStyle = `rgba(6, 182, 212, ${p.alpha * 0.7})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();

        p.x += vx;
        p.y += vy;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [showWind, selectedStation.weather.windDeg]);

  // Handle Drag / Pan
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPan({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const getStationColor = (st: AirStation) => {
    const aqi = standard === 'NAQI' ? st.aqiNAQI : st.aqiEPA;
    if (colorBlindMode) {
      if (aqi <= 50) return '#3B82F6';
      if (aqi <= 100) return '#06B6D4';
      if (aqi <= 200) return '#F59E0B';
      if (aqi <= 300) return '#D97706';
      return '#8B5CF6';
    }
    return getAQICategory(aqi, standard).color;
  };

  const getStationValue = (st: AirStation) => {
    if (selectedPollutantLayer === 'AQI') {
      return standard === 'NAQI' ? st.aqiNAQI : st.aqiEPA;
    }
    if (selectedPollutantLayer === 'PM2.5') return st.pollutants.pm25?.value || 0;
    if (selectedPollutantLayer === 'PM10') return st.pollutants.pm10?.value || 0;
    if (selectedPollutantLayer === 'NO2') return st.pollutants.no2?.value || 0;
    if (selectedPollutantLayer === 'O3') return st.pollutants.o3?.value || 0;
    return st.aqiNAQI;
  };

  return (
    <section
      ref={containerRef}
      className={`relative rounded-2xl border border-white/10 bg-[#0C1118] overflow-hidden shadow-2xl transition-all ${
        standalone || isFullscreen ? 'h-[750px] w-full' : 'h-[500px] w-full'
      }`}
      id="live-air-map-section"
    >
      {/* Map Header Overlay */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2 pointer-events-auto">
        <div className="flex items-center space-x-2 rounded-xl border border-white/10 bg-[#131A24]/90 px-3.5 py-2 shadow-lg backdrop-blur-md">
          <MapPin className="h-4 w-4 text-cyan-400" />
          <span className="text-xs font-bold text-white tracking-wide">
            Global Atmospheric GIS Network
          </span>
          <span className="rounded bg-cyan-500/20 px-1.5 py-0.5 text-[10px] font-bold text-cyan-400">
            {stations.length} Active Stations
          </span>
        </div>

        {/* Pollutant Layer Selector */}
        <div className="hidden sm:flex items-center space-x-1 rounded-xl border border-white/10 bg-[#131A24]/90 p-1 shadow-lg backdrop-blur-md text-xs">
          {(['AQI', 'PM2.5', 'PM10', 'NO2', 'O3'] as const).map((layer) => (
            <button
              key={layer}
              onClick={() => setSelectedPollutantLayer(layer)}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all ${
                selectedPollutantLayer === layer
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {layer}
            </button>
          ))}
        </div>
      </div>

      {/* Map Control Tools (Top Right) */}
      <div className="absolute top-4 right-4 z-20 flex items-center space-x-2 pointer-events-auto">
        {/* Toggle Wind Streamlines */}
        <button
          onClick={() => setShowWind(!showWind)}
          title={showWind ? 'Hide Wind Streamlines' : 'Show Wind Streamlines'}
          className={`flex items-center space-x-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium backdrop-blur-md transition-colors ${
            showWind
              ? 'border-cyan-500/40 bg-cyan-500/20 text-cyan-300'
              : 'border-white/10 bg-[#131A24]/90 text-slate-400 hover:text-white'
          }`}
        >
          <Wind className="h-3.5 w-3.5" />
          <span className="hidden md:inline">Wind Vectors</span>
        </button>

        {/* Toggle Heatmap */}
        <button
          onClick={() => setShowHeatmap(!showHeatmap)}
          title={showHeatmap ? 'Hide Pollution Plumes' : 'Show Pollution Plumes'}
          className={`flex items-center space-x-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium backdrop-blur-md transition-colors ${
            showHeatmap
              ? 'border-amber-500/40 bg-amber-500/20 text-amber-300'
              : 'border-white/10 bg-[#131A24]/90 text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          <span className="hidden md:inline">Plume Dispersion</span>
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Map'}
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-[#131A24]/90 text-slate-400 backdrop-blur-md hover:text-white"
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </button>
      </div>

      {/* Zoom / Navigation Controls (Bottom Right) */}
      <div className="absolute bottom-4 right-4 z-20 flex flex-col space-y-1.5 pointer-events-auto">
        <button
          onClick={() => setZoom((z) => Math.min(3.5, z + 0.3))}
          title="Zoom In"
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-[#131A24]/90 text-slate-300 backdrop-blur-md hover:bg-white/10 hover:text-white"
        >
          <Plus className="h-4 w-4" />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(0.7, z - 0.3))}
          title="Zoom Out"
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-[#131A24]/90 text-slate-300 backdrop-blur-md hover:bg-white/10 hover:text-white"
        >
          <Minus className="h-4 w-4" />
        </button>
        <button
          onClick={() => {
            setZoom(1);
            setPan({ x: 0, y: 0 });
          }}
          title="Reset View"
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-[#131A24]/90 text-slate-300 backdrop-blur-md hover:bg-white/10 hover:text-white"
        >
          <Compass className="h-4 w-4" />
        </button>
      </div>

      {/* Map Viewport Area (SVG + Canvas) */}
      <div
        className="relative h-full w-full cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <svg
          viewBox={`0 0 ${mapWidth} ${mapHeight}`}
          className="h-full w-full"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.2s ease-out',
          }}
        >
          {/* Graticule lines (Latitude / Longitude grid) */}
          <g stroke="rgba(255, 255, 255, 0.04)" strokeWidth="0.8" strokeDasharray="4 6">
            {[-60, -30, 0, 30, 60].map((lat) => (
              <line key={lat} x1="0" y1={project(lat, 0).y} x2={mapWidth} y2={project(lat, 0).y} />
            ))}
            {[-120, -60, 0, 60, 120].map((lon) => (
              <line key={lon} x1={project(0, lon).x} y1="0" x2={project(0, lon).x} y2={mapHeight} />
            ))}
          </g>

          {/* Continents Simplified Geospatial Polygonal Outlines */}
          <g fill="#151C26" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="0.75">
            {/* North America */}
            <path d="M 120 70 L 220 60 L 290 90 L 270 160 L 230 200 L 200 240 L 160 210 L 110 160 Z" />
            {/* South America */}
            <path d="M 230 250 L 290 280 L 280 370 L 250 440 L 230 380 L 210 300 Z" />
            {/* Europe */}
            <path d="M 460 70 L 530 60 L 550 110 L 510 140 L 460 140 L 440 100 Z" />
            {/* Africa */}
            <path d="M 450 160 L 540 160 L 560 240 L 540 340 L 490 380 L 450 310 L 430 220 Z" />
            {/* Asia */}
            <path d="M 540 60 L 820 50 L 840 160 L 760 250 L 680 230 L 630 190 L 550 120 Z" />
            {/* Australia */}
            <path d="M 760 320 L 850 310 L 860 380 L 810 420 L 750 370 Z" />
          </g>

          {/* Plume / Dispersion Heatmap Layer around stations */}
          {showHeatmap && (
            <g opacity="0.6">
              <defs>
                {stations.map((st) => {
                  const color = getStationColor(st);
                  return (
                    <radialGradient key={`grad-${st.id}`} id={`plume-${st.id}`} cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor={color} stopOpacity="0.7" />
                      <stop offset="40%" stopColor={color} stopOpacity="0.3" />
                      <stop offset="100%" stopColor={color} stopOpacity="0.0" />
                    </radialGradient>
                  );
                })}
              </defs>
              {stations.map((st) => {
                const { x, y } = project(st.lat, st.lon);
                const aqi = standard === 'NAQI' ? st.aqiNAQI : st.aqiEPA;
                const plumeRadius = Math.max(25, (aqi / 500) * 80);
                return (
                  <circle
                    key={`circle-plume-${st.id}`}
                    cx={x}
                    cy={y}
                    r={plumeRadius}
                    fill={`url(#plume-${st.id})`}
                    className="pointer-events-none"
                  />
                );
              })}
            </g>
          )}

          {/* Station Markers */}
          <g>
            {stations.map((st) => {
              const { x, y } = project(st.lat, st.lon);
              const isSelected = st.id === selectedStation.id;
              const color = getStationColor(st);
              const val = getStationValue(st);

              return (
                <g
                  key={st.id}
                  transform={`translate(${x}, ${y})`}
                  className="cursor-pointer group"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectStation(st);
                  }}
                  onMouseEnter={() => setHoveredStation(st)}
                  onMouseLeave={() => setHoveredStation(null)}
                >
                  {/* Selected Ping Ring */}
                  {isSelected && (
                    <circle
                      r="16"
                      fill="none"
                      stroke={color}
                      strokeWidth="2"
                      strokeDasharray="3 3"
                      className="animate-spin"
                      style={{ animationDuration: '6s' }}
                    />
                  )}

                  {/* Marker Outer Base */}
                  <circle
                    r={isSelected ? "11" : "8"}
                    fill="#0E141D"
                    stroke={color}
                    strokeWidth={isSelected ? "3" : "2"}
                    className="transition-all group-hover:scale-125"
                    filter="drop-shadow(0 2px 6px rgba(0,0,0,0.8))"
                  />

                  {/* Inner Dot */}
                  <circle
                    r={isSelected ? "5" : "3.5"}
                    fill={color}
                  />

                  {/* Label pill above or below */}
                  <g transform="translate(0, -18)">
                    <rect
                      x="-35"
                      y="-11"
                      width="70"
                      height="17"
                      rx="8.5"
                      fill="#121822"
                      stroke={isSelected ? color : 'rgba(255, 255, 255, 0.15)'}
                      strokeWidth={isSelected ? "1.5" : "1"}
                    />
                    <text
                      x="0"
                      y="1"
                      textAnchor="middle"
                      fill="#F8FAFC"
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {st.city.slice(0, 5)}: {val}
                    </text>
                  </g>
                </g>
              );
            })}
          </g>
        </svg>

        {/* Canvas Wind Streamline Overlay */}
        {showWind && (
          <canvas
            ref={canvasRef}
            width={mapWidth}
            height={mapHeight}
            className="pointer-events-none absolute inset-0 h-full w-full"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
            }}
          />
        )}
      </div>

      {/* Floating Selected Station Inspector Panel (Bottom Left) */}
      <div className="absolute bottom-4 left-4 z-20 max-w-sm rounded-xl border border-white/10 bg-[#131A24]/95 p-4 shadow-2xl backdrop-blur-md pointer-events-auto">
        <div className="flex items-start justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
              Selected Station
            </span>
            <h4 className="text-sm font-bold text-white">{selectedStation.city}, {selectedStation.country}</h4>
            <p className="text-xs text-slate-400 truncate max-w-[220px]">{selectedStation.name}</p>
          </div>

          <div
            className="rounded-lg px-2.5 py-1 text-center font-bold"
            style={{
              backgroundColor: `${getStationColor(selectedStation)}20`,
              color: getStationColor(selectedStation),
              border: `1px solid ${getStationColor(selectedStation)}40`,
            }}
          >
            <div className="text-xs uppercase leading-tight font-mono">AQI</div>
            <div className="text-lg font-black leading-none">
              {standard === 'NAQI' ? selectedStation.aqiNAQI : selectedStation.aqiEPA}
            </div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2 border-t border-white/5 pt-2.5 text-center text-xs">
          <div className="rounded bg-white/5 p-1.5">
            <span className="text-[10px] text-slate-400">PM2.5</span>
            <div className="font-mono font-bold text-white">
              {selectedStation.pollutants.pm25?.value || '—'}
            </div>
          </div>
          <div className="rounded bg-white/5 p-1.5">
            <span className="text-[10px] text-slate-400">PM10</span>
            <div className="font-mono font-bold text-white">
              {selectedStation.pollutants.pm10?.value || '—'}
            </div>
          </div>
          <div className="rounded bg-white/5 p-1.5">
            <span className="text-[10px] text-slate-400">Wind</span>
            <div className="font-mono font-bold text-cyan-400">
              {selectedStation.weather.windSpeedKmh} <span className="text-[9px]">km/h</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
