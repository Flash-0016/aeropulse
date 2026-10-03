import React, { useEffect, useRef, useState } from 'react';
import {
  Wind,
  Compass,
  Factory,
  Car,
  Flame,
  Building2,
  Trash2,
  Play,
  Pause,
  Layers,
  Gauge,
  Sparkles,
  Info,
} from 'lucide-react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  sourceType: 'factory' | 'traffic' | 'wildfire' | 'ambient';
}

interface Emitter {
  id: string;
  x: number;
  y: number;
  type: 'factory' | 'traffic' | 'wildfire';
  emissionRate: number;
  label: string;
}

interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
}

interface WindVectorDispersionProps {
  initialWindSpeed?: number;
  initialWindDeg?: number;
}

export const WindVectorDispersion: React.FC<WindVectorDispersionProps> = ({
  initialWindSpeed = 3.5,
  initialWindDeg = 280,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [windSpeed, setWindSpeed] = useState<number>(initialWindSpeed);
  const [windDeg, setWindDeg] = useState<number>(initialWindDeg);
  const [stabilityClass, setStabilityClass] = useState<'A' | 'C' | 'F'>('C'); // Pasquill Atmospheric Stability
  const [selectedTool, setSelectedTool] = useState<'inspect' | 'factory' | 'traffic' | 'wildfire' | 'obstacle'>('inspect');
  const [viewMode, setViewMode] = useState<'particles' | 'vectors' | 'both'>('both');
  const [particleCountDisplay, setParticleCountDisplay] = useState<number>(0);

  // Simulation state refs
  const particlesRef = useRef<Particle[]>([]);
  const emittersRef = useRef<Emitter[]>([
    { id: '1', x: 120, y: 220, type: 'factory', emissionRate: 3, label: 'Industrial Smelter Stack' },
    { id: '2', x: 260, y: 140, type: 'traffic', emissionRate: 2, label: 'Bypass Freeway Interchange' },
  ]);
  const obstaclesRef = useRef<Obstacle[]>([
    { x: 380, y: 160, width: 70, height: 110, label: 'Commercial High-Rise' },
    { x: 500, y: 220, width: 60, height: 80, label: 'Hospital Complex' },
  ]);
  const animationFrameRef = useRef<number | null>(null);

  // Sync prop changes
  useEffect(() => {
    if (initialWindSpeed) setWindSpeed(initialWindSpeed);
    if (initialWindDeg) setWindDeg(initialWindDeg);
  }, [initialWindSpeed, initialWindDeg]);

  // Main Canvas Render & Physics Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Convert meteorological wind degrees (direction wind is coming FROM) to radian vector
    const rad = ((windDeg - 90) * Math.PI) / 180;
    const baseVx = Math.cos(rad) * (windSpeed * 0.9);
    const baseVy = Math.sin(rad) * (windSpeed * 0.9);

    let frame = 0;

    const render = () => {
      frame++;
      const width = canvas.width;
      const height = canvas.height;

      // Dark atmospheric grid backdrop
      ctx.fillStyle = '#090D16';
      ctx.fillRect(0, 0, width, height);

      // 1. Draw subtle vector flow grid
      if (viewMode === 'vectors' || viewMode === 'both') {
        const gridStep = 45;
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
        ctx.lineWidth = 1;

        for (let gx = 20; gx < width; gx += gridStep) {
          for (let gy = 20; gy < height; gy += gridStep) {
            // Check obstacle deflection
            let localVx = baseVx;
            let localVy = baseVy;

            for (const obs of obstaclesRef.current) {
              const cx = obs.x + obs.width / 2;
              const cy = obs.y + obs.height / 2;
              const dx = gx - cx;
              const dy = gy - cy;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < obs.width + 40 && dist > 1) {
                // Deflection
                localVx += (dx / dist) * 1.5;
                localVy += (dy / dist) * 1.5;
              }
            }

            const angle = Math.atan2(localVy, localVx);
            const arrowLen = 14;

            ctx.beginPath();
            ctx.moveTo(gx, gy);
            ctx.lineTo(gx + Math.cos(angle) * arrowLen, gy + Math.sin(angle) * arrowLen);
            ctx.stroke();

            // Arrow head
            ctx.beginPath();
            ctx.arc(gx + Math.cos(angle) * arrowLen, gy + Math.sin(angle) * arrowLen, 1.2, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
            ctx.fill();
          }
        }
      }

      // 2. Draw Obstacles (Buildings creating street canyons)
      for (const obs of obstaclesRef.current) {
        // Shadow/wake zone behind building
        ctx.fillStyle = 'rgba(239, 68, 68, 0.08)';
        ctx.fillRect(obs.x + baseVx * 4, obs.y + baseVy * 4, obs.width, obs.height);

        // Building block
        ctx.fillStyle = '#1E293B';
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(obs.x, obs.y, obs.width, obs.height, 6);
        ctx.fill();
        ctx.stroke();

        // Label
        ctx.fillStyle = '#94A3B8';
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.fillText(obs.label, obs.x + 4, obs.y - 6);
        ctx.fillStyle = 'rgba(244, 63, 94, 0.8)';
        ctx.fillText('Wake Trapping Zone', obs.x + 4, obs.y + obs.height / 2);
      }

      // 3. Emit new particles from active emitters
      if (isRunning) {
        const turbulenceMultiplier = stabilityClass === 'A' ? 2.5 : stabilityClass === 'C' ? 1.2 : 0.4;

        for (const emitter of emittersRef.current) {
          for (let i = 0; i < emitter.emissionRate; i++) {
            const angleJitter = (Math.random() - 0.5) * 0.4 * turbulenceMultiplier;
            const currentRad = rad + angleJitter;
            const speedJitter = (0.7 + Math.random() * 0.6) * windSpeed;

            let color = 'rgba(249, 115, 22, 0.85)'; // traffic orange
            let size = 2.5;

            if (emitter.type === 'factory') {
              color = 'rgba(239, 68, 68, 0.85)'; // factory toxic red
              size = 3.5;
            } else if (emitter.type === 'wildfire') {
              color = 'rgba(217, 119, 6, 0.9)'; // wildfire amber
              size = 4.0;
            }

            particlesRef.current.push({
              x: emitter.x + (Math.random() - 0.5) * 6,
              y: emitter.y + (Math.random() - 0.5) * 6,
              vx: Math.cos(currentRad) * speedJitter,
              vy: Math.sin(currentRad) * speedJitter,
              life: 0,
              maxLife: 160 + Math.random() * 80,
              size,
              color,
              sourceType: emitter.type,
            });
          }
        }

        // Ambient background particulates
        if (frame % 3 === 0 && particlesRef.current.length < 850) {
          particlesRef.current.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: baseVx * (0.8 + Math.random() * 0.4),
            vy: baseVy * (0.8 + Math.random() * 0.4),
            life: 0,
            maxLife: 120,
            size: 1.8,
            color: 'rgba(148, 163, 184, 0.4)',
            sourceType: 'ambient',
          });
        }
      }

      // 4. Update and Render Particles
      const particles = particlesRef.current;
      const aliveParticles: Particle[] = [];

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.life++;

        if (isRunning) {
          // Obstacle collision and wake suction
          for (const obs of obstaclesRef.current) {
            if (
              p.x > obs.x &&
              p.x < obs.x + obs.width &&
              p.y > obs.y &&
              p.y < obs.y + obs.height
            ) {
              // Deflect around obstacle edges
              p.vx *= -0.4;
              p.vy *= 1.2;
              p.x += p.vx * 2;
            }
          }

          // Turbulence drift
          p.x += p.vx;
          p.y += p.vy;

          // Dissipate slightly over distance
          p.vx *= 0.995;
          p.vy *= 0.995;
        }

        // Retain if within life and bounds
        if (p.life < p.maxLife && p.x >= 0 && p.x <= width && p.y >= 0 && p.y <= height) {
          aliveParticles.push(p);

          if (viewMode === 'particles' || viewMode === 'both') {
            const lifeRatio = 1 - p.life / p.maxLife;
            ctx.fillStyle = p.color;
            ctx.globalAlpha = lifeRatio * 0.9;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * (1 + (1 - lifeRatio) * 0.8), 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1.0;
          }
        }
      }

      particlesRef.current = aliveParticles;
      if (frame % 10 === 0) {
        setParticleCountDisplay(aliveParticles.length);
      }

      // 5. Draw Emitter Anchors & Icons
      for (const emitter of emittersRef.current) {
        ctx.beginPath();
        ctx.arc(emitter.x, emitter.y, 10, 0, Math.PI * 2);
        ctx.fillStyle =
          emitter.type === 'factory'
            ? 'rgba(239, 68, 68, 0.4)'
            : emitter.type === 'traffic'
            ? 'rgba(249, 115, 22, 0.4)'
            : 'rgba(217, 119, 6, 0.4)';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(emitter.x, emitter.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = '11px Plus Jakarta Sans, sans-serif';
        ctx.fillText(emitter.label, emitter.x + 14, emitter.y + 4);
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [windSpeed, windDeg, stabilityClass, isRunning, viewMode]);

  // Dynamic canvas sizing
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (selectedTool === 'factory') {
      emittersRef.current.push({
        id: Date.now().toString(),
        x,
        y,
        type: 'factory',
        emissionRate: 3,
        label: 'Industrial Stack #' + (emittersRef.current.length + 1),
      });
    } else if (selectedTool === 'traffic') {
      emittersRef.current.push({
        id: Date.now().toString(),
        x,
        y,
        type: 'traffic',
        emissionRate: 2,
        label: 'Traffic Hotspot #' + (emittersRef.current.length + 1),
      });
    } else if (selectedTool === 'wildfire') {
      emittersRef.current.push({
        id: Date.now().toString(),
        x,
        y,
        type: 'wildfire',
        emissionRate: 4,
        label: 'Biomass Fire Plume',
      });
    } else if (selectedTool === 'obstacle') {
      obstaclesRef.current.push({
        x: x - 30,
        y: y - 40,
        width: 60,
        height: 80,
        label: 'Urban Block',
      });
    }
  };

  const handleClearAll = () => {
    emittersRef.current = [];
    obstaclesRef.current = [];
    particlesRef.current = [];
  };

  const handleResetDefaults = () => {
    emittersRef.current = [
      { id: '1', x: 120, y: 220, type: 'factory', emissionRate: 3, label: 'Industrial Smelter Stack' },
      { id: '2', x: 260, y: 140, type: 'traffic', emissionRate: 2, label: 'Bypass Freeway Interchange' },
    ];
    obstaclesRef.current = [
      { x: 380, y: 160, width: 70, height: 110, label: 'Commercial High-Rise' },
      { x: 500, y: 220, width: 60, height: 80, label: 'Hospital Complex' },
    ];
    particlesRef.current = [];
    setWindSpeed(4.0);
    setWindDeg(270);
  };

  return (
    <div id="wind-vector-dispersion-panel" className="flex flex-col gap-6 rounded-2xl border border-white/10 bg-[#020408]/80 p-6 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative overflow-hidden">
      {/* Background flare */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-900/10 blur-[80px] rounded-full pointer-events-none" />

      {/* Module Title Bar */}
      <div className="relative z-10 flex flex-wrap items-end justify-between gap-4 border-b border-white/5 pb-4">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/40 border border-white/10 shadow-inner">
            <Wind className="h-5 w-5 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h2 className="text-sm font-bold text-white uppercase tracking-widest">
                Real-Time Wind Vector Dispersion Particles
              </h2>
              <span className="rounded-md bg-cyan-500/10 px-2 py-0.5 font-mono text-[9px] font-bold text-cyan-400 border border-cyan-500/20 uppercase tracking-widest">
                Eulerian-Lagrangian Model
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Interactive particulate advection & plume dispersion physics governed by planetary boundary layer vectors
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            id="btn-play-pause-dispersion"
            onClick={() => setIsRunning(!isRunning)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-[11px] font-bold uppercase tracking-wider transition-all border ${
              isRunning
                ? 'bg-black/40 border-white/10 text-slate-300 hover:bg-black/60 hover:text-white'
                : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
            }`}
          >
            {isRunning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            <span>{isRunning ? 'Pause Flow' : 'Resume Flow'}</span>
          </button>

          <button
            id="btn-reset-dispersion-defaults"
            onClick={handleResetDefaults}
            className="flex items-center gap-2 rounded-xl bg-black/40 hover:bg-black/60 border border-white/10 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-300 transition-all"
            title="Reset to default industrial corridor"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>Reset Setup</span>
          </button>

          <button
            id="btn-clear-dispersion-canvas"
            onClick={handleClearAll}
            className="flex items-center gap-2 rounded-xl bg-black/40 hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:text-red-400 transition-all"
            title="Clear all emitters and obstacles"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Interactive Tool Palette */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-black/40 p-3 border border-white/10 shadow-inner">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mr-2">Add Emitter on Click:</span>
          <button
            id="tool-select-inspect"
            onClick={() => setSelectedTool('inspect')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all ${
              selectedTool === 'inspect'
                ? 'bg-cyan-500 text-slate-950 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span>Inspect Mode</span>
          </button>

          <button
            id="tool-select-factory"
            onClick={() => setSelectedTool('factory')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all ${
              selectedTool === 'factory'
                ? 'bg-red-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.3)]'
                : 'bg-white/5 text-red-400/80 hover:bg-white/10 hover:text-red-300'
            }`}
          >
            <Factory className="h-3.5 w-3.5" />
            <span>Factory Stack</span>
          </button>

          <button
            id="tool-select-traffic"
            onClick={() => setSelectedTool('traffic')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all ${
              selectedTool === 'traffic'
                ? 'bg-orange-500 text-white shadow-[0_0_10px_rgba(249,115,22,0.3)]'
                : 'bg-white/5 text-orange-400/80 hover:bg-white/10 hover:text-orange-300'
            }`}
          >
            <Car className="h-3.5 w-3.5" />
            <span>Traffic Gridlock</span>
          </button>

          <button
            id="tool-select-wildfire"
            onClick={() => setSelectedTool('wildfire')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all ${
              selectedTool === 'wildfire'
                ? 'bg-amber-500 text-white shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                : 'bg-white/5 text-amber-400/80 hover:bg-white/10 hover:text-amber-300'
            }`}
          >
            <Flame className="h-3.5 w-3.5" />
            <span>Biomass Burning</span>
          </button>

          <button
            id="tool-select-obstacle"
            onClick={() => setSelectedTool('obstacle')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all ${
              selectedTool === 'obstacle'
                ? 'bg-indigo-500 text-white shadow-[0_0_10px_rgba(99,102,241,0.3)]'
                : 'bg-white/5 text-indigo-400/80 hover:bg-white/10 hover:text-indigo-300'
            }`}
          >
            <Building2 className="h-3.5 w-3.5" />
            <span>Urban Building</span>
          </button>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 rounded-xl bg-black/50 p-1 border border-white/10 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]">
          {(['both', 'particles', 'vectors'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all ${
                viewMode === mode
                  ? 'bg-white/15 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Main Physics Canvas */}
      <div className="relative z-10 h-[450px] w-full overflow-hidden rounded-2xl border border-white/10 bg-[#090d16] shadow-inner">
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="h-full w-full cursor-crosshair mix-blend-screen"
        />

        {/* HUD Live Telemetry Overlay */}
        <div className="pointer-events-none absolute bottom-4 left-4 flex flex-wrap items-center gap-4 rounded-xl bg-black/60 px-4 py-2 backdrop-blur-md border border-white/10 shadow-lg text-[10px] font-mono text-slate-300 uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-500"></span>
            </span>
            <span>Active Particulates:</span>
            <span className="font-bold text-white text-xs">{particleCountDisplay}</span>
          </div>
          <div className="text-slate-600">|</div>
          <div>
            <span>Active Emitters:</span>{' '}
            <span className="font-bold text-cyan-400 text-xs">{emittersRef.current.length}</span>
          </div>
          <div className="text-slate-600">|</div>
          <div>
            <span>Urban Obstacles:</span>{' '}
            <span className="font-bold text-indigo-400 text-xs">{obstaclesRef.current.length}</span>
          </div>
        </div>
      </div>

      {/* Dynamic Meteorological Wind Sliders */}
      <div className="relative z-10 grid grid-cols-1 gap-5 rounded-2xl bg-white/[0.02] p-5 border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] sm:grid-cols-3">
        {/* Wind Speed */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-[11px] text-slate-300 uppercase tracking-wider font-semibold">
            <span className="flex items-center gap-1.5">
              <Wind className="h-4 w-4 text-cyan-400" />
              Wind Vector Speed
            </span>
            <span className="font-mono font-bold text-cyan-400 text-xs">{windSpeed.toFixed(1)} m/s <span className="text-[10px] font-normal text-slate-500">({(windSpeed * 3.6).toFixed(1)} km/h)</span></span>
          </div>
          <input
            id="slider-dispersion-wind-speed"
            type="range"
            min="0.5"
            max="20"
            step="0.5"
            value={windSpeed}
            onChange={(e) => setWindSpeed(parseFloat(e.target.value))}
            className="h-1.5 cursor-pointer appearance-none rounded-full bg-white/10 accent-cyan-400 focus:outline-none"
          />
          <div className="flex justify-between text-[9px] text-slate-500 font-mono uppercase tracking-widest mt-1">
            <span>Calm</span>
            <span>Moderate</span>
            <span>Gale</span>
          </div>
        </div>

        {/* Wind Compass Direction */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-[11px] text-slate-300 uppercase tracking-wider font-semibold">
            <span className="flex items-center gap-1.5">
              <Compass className="h-4 w-4 text-amber-500" />
              Wind Direction Bearing
            </span>
            <span className="font-mono font-bold text-amber-500 text-xs">{windDeg}° <span className="text-[10px] font-normal text-slate-500">({getCompassSector(windDeg)})</span></span>
          </div>
          <input
            id="slider-dispersion-wind-deg"
            type="range"
            min="0"
            max="359"
            step="5"
            value={windDeg}
            onChange={(e) => setWindDeg(parseInt(e.target.value))}
            className="h-1.5 cursor-pointer appearance-none rounded-full bg-white/10 accent-amber-500 focus:outline-none"
          />
          <div className="flex justify-between text-[9px] text-slate-500 font-mono uppercase tracking-widest mt-1">
            <span>0°(N)</span>
            <span>90°(E)</span>
            <span>180°(S)</span>
            <span>270°(W)</span>
          </div>
        </div>

        {/* Pasquill Atmospheric Stability Class */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-[11px] text-slate-300 uppercase tracking-wider font-semibold">
            <span className="flex items-center gap-1.5">
              <Gauge className="h-4 w-4 text-teal-400" />
              Atmospheric Stability
            </span>
            <span className="font-mono font-bold text-teal-400 text-xs">Class {stabilityClass}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-1">
            <button
              onClick={() => setStabilityClass('A')}
              className={`rounded-lg py-1.5 text-center text-[10px] font-bold uppercase tracking-wider transition-all border ${
                stabilityClass === 'A'
                  ? 'bg-teal-500 text-slate-950 border-teal-400 shadow-[0_0_10px_rgba(20,184,166,0.3)]'
                  : 'bg-black/40 text-slate-400 border-white/5 hover:text-slate-200 hover:bg-black/60'
              }`}
              title="Class A: Extremely Unstable (Rapid Thermal Mixing)"
            >
              A (Conv)
            </button>
            <button
              onClick={() => setStabilityClass('C')}
              className={`rounded-lg py-1.5 text-center text-[10px] font-bold uppercase tracking-wider transition-all border ${
                stabilityClass === 'C'
                  ? 'bg-teal-500 text-slate-950 border-teal-400 shadow-[0_0_10px_rgba(20,184,166,0.3)]'
                  : 'bg-black/40 text-slate-400 border-white/5 hover:text-slate-200 hover:bg-black/60'
              }`}
              title="Class C: Slightly Unstable / Neutral"
            >
              C (Neut)
            </button>
            <button
              onClick={() => setStabilityClass('F')}
              className={`rounded-lg py-1.5 text-center text-[10px] font-bold uppercase tracking-wider transition-all border ${
                stabilityClass === 'F'
                  ? 'bg-red-500 text-white border-red-400 shadow-[0_0_10px_rgba(239,68,68,0.3)]'
                  : 'bg-black/40 text-slate-400 border-white/5 hover:text-slate-200 hover:bg-black/60'
              }`}
              title="Class F: Moderately Stable (Inversion Trapping)"
            >
              F (Inv)
            </button>
          </div>
          <p className="text-[9px] text-slate-400 uppercase tracking-widest mt-1">
            {stabilityClass === 'A'
              ? 'Rapid Vertical Dispersion'
              : stabilityClass === 'C'
              ? 'Standard Gaussian Profile'
              : 'Strong Inversion Trapping'}
          </p>
        </div>
      </div>
    </div>
  );
};

function getCompassSector(deg: number): string {
  const sectors = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(deg / 22.5) % 16;
  return sectors[index];
}
