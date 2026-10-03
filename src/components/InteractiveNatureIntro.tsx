import React, { useEffect, useRef, useState } from 'react';
import { Wind, Volume2, VolumeX, Sparkles, Sliders, Play, RefreshCw, Sun, CloudFog } from 'lucide-react';
import { windAudio } from '../utils/audioSynthesizer';

interface InteractiveNatureIntroProps {
  onExploreTelemetry?: () => void;
  compactMode?: boolean;
}

interface Spore {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  seedAngle: number;
  opacity: number;
  color: string;
}

interface GrassBlade {
  x: number;
  height: number;
  width: number;
  lean: number;
  curve: number;
  color: string;
}

export const InteractiveNatureIntro: React.FC<InteractiveNatureIntroProps> = ({
  onExploreTelemetry,
  compactMode = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [windSpeed, setWindSpeed] = useState<number>(6.5); // m/s
  const [smogLevel, setSmogLevel] = useState<number>(20); // 0 to 100%
  const [isAudioOn, setIsAudioOn] = useState<boolean>(false);
  const [timeOfDay, setTimeOfDay] = useState<'dawn' | 'noon' | 'sunset' | 'night'>('noon');
  const [mousePos, setMousePos] = useState<{ x: number; y: number; active: boolean; vx: number; vy: number }>({
    x: 0,
    y: 0,
    active: false,
    vx: 0,
    vy: 0,
  });
  const [burstCount, setBurstCount] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(true);

  // References for animation state
  const animationFrameRef = useRef<number | null>(null);
  const sporesRef = useRef<Spore[]>([]);
  const grassRef = useRef<GrassBlade[]>([]);
  const lastMouseRef = useRef<{ x: number; y: number; time: number }>({ x: 0, y: 0, time: 0 });

  // Initialize grass and spores
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.width;
    const height = canvas.height;

    // Grass blades
    const blades: GrassBlade[] = [];
    const bladeCount = Math.floor(width / 3.5);
    for (let i = 0; i < bladeCount; i++) {
      blades.push({
        x: (i / bladeCount) * width + (Math.random() * 4 - 2),
        height: 60 + Math.random() * 85,
        width: 2.2 + Math.random() * 2,
        lean: (Math.random() - 0.5) * 12,
        curve: Math.random() * 8 + 4,
        color: `hsl(${135 + Math.random() * 30}, ${55 + Math.random() * 30}%, ${30 + Math.random() * 25}%)`,
      });
    }
    grassRef.current = blades;

    // Spores / dandelion seeds
    const spores: Spore[] = [];
    const sporeCount = 70;
    for (let i = 0; i < sporeCount; i++) {
      spores.push({
        x: Math.random() * width,
        y: Math.random() * height * 0.85,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.4,
        size: 2.5 + Math.random() * 3.5,
        seedAngle: Math.random() * Math.PI * 2,
        opacity: 0.4 + Math.random() * 0.5,
        color: 'rgba(255, 255, 255, 0.85)',
      });
    }
    sporesRef.current = spores;
  }, []);

  // Update audio wind speed when changed
  useEffect(() => {
    if (isAudioOn) {
      windAudio.setWindSpeed(windSpeed);
    }
  }, [windSpeed, isAudioOn]);

  const toggleAudio = async () => {
    if (isAudioOn) {
      windAudio.stop();
      setIsAudioOn(false);
    } else {
      const success = await windAudio.start();
      if (success) {
        windAudio.setWindSpeed(windSpeed);
        setIsAudioOn(true);
      }
    }
  };

  const handleBurstGust = () => {
    setWindSpeed((prev) => Math.min(24, prev + 8));
    setBurstCount((b) => b + 1);
    // Disperse smog with the blast!
    setSmogLevel((s) => Math.max(0, s - 25));
    setTimeout(() => {
      setWindSpeed(6.5);
    }, 3500);
  };

  // Canvas loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;

    const render = () => {
      if (!isPaused) {
        time += 0.02;
      }
      
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // 1. Sky & Atmosphere Gradient
      let skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      if (timeOfDay === 'dawn') {
        skyGrad.addColorStop(0, '#1E293B');
        skyGrad.addColorStop(0.5, '#F59E0B');
        skyGrad.addColorStop(1, '#FEF3C7');
      } else if (timeOfDay === 'noon') {
        skyGrad.addColorStop(0, '#0284C7');
        skyGrad.addColorStop(0.6, '#38BDF8');
        skyGrad.addColorStop(1, '#BAE6FD');
      } else if (timeOfDay === 'sunset') {
        skyGrad.addColorStop(0, '#4C1D95');
        skyGrad.addColorStop(0.4, '#EA580C');
        skyGrad.addColorStop(1, '#FDE047');
      } else {
        skyGrad.addColorStop(0, '#0F172A');
        skyGrad.addColorStop(0.7, '#1E293B');
        skyGrad.addColorStop(1, '#334155');
      }
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Smog / Atmospheric Inversion Layer Overlay
      if (smogLevel > 0) {
        const smogAlpha = (smogLevel / 100) * 0.72;
        const smogGrad = ctx.createLinearGradient(0, height * 0.25, 0, height);
        smogGrad.addColorStop(0, `rgba(180, 150, 120, 0)`);
        smogGrad.addColorStop(0.5, `rgba(168, 142, 114, ${smogAlpha * 0.6})`);
        smogGrad.addColorStop(1, `rgba(130, 105, 80, ${smogAlpha})`);
        ctx.fillStyle = smogGrad;
        ctx.fillRect(0, 0, width, height);

        // Smog particulate grain
        ctx.fillStyle = `rgba(90, 75, 55, ${smogAlpha * 0.15})`;
        for (let i = 0; i < Math.floor(smogLevel * 1.5); i++) {
          const px = (Math.sin(time * 0.5 + i * 23) * 0.5 + 0.5) * width;
          const py = height * 0.35 + (Math.cos(time * 0.3 + i * 47) * 0.5 + 0.5) * height * 0.55;
          ctx.beginPath();
          ctx.arc(px, py, 1.2 + (i % 3), 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 3. Distant Mountain Silhouettes with Atmospheric Haze
      ctx.fillStyle = timeOfDay === 'night' ? 'rgba(30, 41, 59, 0.7)' : 'rgba(56, 110, 150, 0.45)';
      ctx.beginPath();
      ctx.moveTo(0, height * 0.7);
      for (let x = 0; x <= width; x += 40) {
        const my = height * 0.62 + Math.sin(x * 0.005 + 1.2) * 50 + Math.cos(x * 0.012) * 25;
        ctx.lineTo(x, my);
      }
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fill();

      // 4. Update and Render Dandelion / Botanical Spores
      const baseWindForce = (windSpeed / 10) * 1.8;
      const spores = sporesRef.current;

      for (let i = 0; i < spores.length; i++) {
        const s = spores[i];

        // Natural wind drift + turbulence
        const turbulence = Math.sin(time * 2 + s.y * 0.02) * 0.6;
        s.vx = baseWindForce + turbulence + (Math.random() - 0.5) * 0.2;
        s.vy += Math.sin(time * 1.5 + s.x * 0.01) * 0.15 - 0.03; // Gentle buoyancy

        // Interactive Cursor Wind Vortex
        if (mousePos.active && !isPaused) {
          const dx = s.x - mousePos.x;
          const dy = s.y - mousePos.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 160 && dist > 1) {
            const pushFactor = (1 - dist / 160) * 4;
            s.vx += (dx / dist) * pushFactor + mousePos.vx * 0.4;
            s.vy += (dy / dist) * pushFactor + mousePos.vy * 0.4;
          }
        }

        if (!isPaused) {
          s.x += s.vx;
          s.y += s.vy;
        }

        // Wrap around boundaries
        if (s.x > width + 20) s.x = -20;
        if (s.x < -20) s.x = width + 20;
        if (s.y > height * 0.88) {
          s.y = height * 0.88;
          s.vy = -Math.abs(s.vy) * 0.6;
        }
        if (s.y < 10) {
          s.y = 10;
          s.vy = Math.abs(s.vy);
        }

        // Render Spore (Center seed + delicate radial parachute filaments)
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(time * 0.5 + s.seedAngle);

        // Core seed
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(0, 0, s.size * 0.6, 0, Math.PI * 2);
        ctx.fill();

        // Delicate seed filaments
        ctx.strokeStyle = `rgba(255, 255, 255, ${s.opacity * (1 - smogLevel * 0.005)})`;
        ctx.lineWidth = 0.8;
        for (let a = 0; a < 6; a++) {
          const angle = (a / 6) * Math.PI * 2;
          const fx = Math.cos(angle) * (s.size * 2.8);
          const fy = Math.sin(angle) * (s.size * 2.8);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(fx, fy);
          ctx.stroke();
        }
        ctx.restore();
      }

      // 5. Grass Meadow with Physics Swaying
      const blades = grassRef.current;
      const groundY = height;

      for (let i = 0; i < blades.length; i++) {
        const b = blades[i];

        // Calculate bend based on wind speed + procedural wave + cursor proximity
        const wave = Math.sin(time * 2.5 + b.x * 0.015) * (windSpeed * 1.6);
        let cursorInfluence = 0;

        if (mousePos.active) {
          const mdx = b.x - mousePos.x;
          if (Math.abs(mdx) < 90) {
            cursorInfluence = (1 - Math.abs(mdx) / 90) * (mdx > 0 ? 25 : -25);
          }
        }

        const tipX = b.x + b.lean + wave + cursorInfluence + windSpeed * 2.5;
        const tipY = groundY - b.height;
        const controlX = b.x + (tipX - b.x) * 0.5 + b.curve;
        const controlY = groundY - b.height * 0.45;

        ctx.strokeStyle = b.color;
        ctx.lineWidth = b.width;
        ctx.beginPath();
        ctx.moveTo(b.x, groundY);
        ctx.quadraticCurveTo(controlX, controlY, tipX, tipY);
        ctx.stroke();
      }

      // 6. Interactive Wind Streamlines near cursor
      if (mousePos.active) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 6]);
        ctx.beginPath();
        ctx.arc(mousePos.x, mousePos.y, 45 + Math.sin(time * 6) * 8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [windSpeed, smogLevel, timeOfDay, mousePos, isPaused]);

  // Track canvas size dynamically
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

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const now = performance.now();

    const dt = Math.max(1, now - lastMouseRef.current.time);
    const vx = ((x - lastMouseRef.current.x) / dt) * 12;
    const vy = ((y - lastMouseRef.current.y) / dt) * 12;

    lastMouseRef.current = { x, y, time: now };
    setMousePos({ x, y, active: true, vx, vy });
  };

  const handleMouseLeave = () => {
    setMousePos((p) => ({ ...p, active: false }));
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  return (
    <div
      id="interactive-nature-hero"
      className={`relative w-full overflow-hidden rounded-2xl border border-white/10 bg-[#020408] shadow-[0_8px_32px_rgba(0,0,0,0.4)] ${
        compactMode ? 'h-[360px]' : 'h-[500px]'
      }`}
      onMouseEnter={() => setShowHint(false)}
    >
      {/* Interactive 60fps Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full cursor-crosshair touch-none mix-blend-screen"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />

      {/* Floating HUD Controls Overlay */}
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-5">
        {/* Top Header & Brand */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="pointer-events-auto flex items-center gap-4 rounded-2xl bg-black/40 px-5 py-3 backdrop-blur-xl border border-white/10 shadow-lg">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-cyan-500/80 mb-0.5">
                Atmospheric Biosphere Engine
              </div>
              <div className="text-sm font-bold text-white tracking-wide">
                Live Wind Vector & Canopy Simulation
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 items-end">
            {/* Audio, Pause & Time of Day Controls */}
            <div className="pointer-events-auto flex items-center gap-2">
              <button
                onClick={togglePause}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium backdrop-blur-md transition-all border ${
                  isPaused
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                    : 'bg-black/40 border-white/10 text-slate-300 hover:bg-black/60 hover:text-white'
                }`}
                title="Pause/Play Simulation"
              >
                <RefreshCw className={`h-4 w-4 ${!isPaused && 'animate-spin-slow'}`} />
                <span>{isPaused ? 'Paused' : 'Running'}</span>
              </button>

              <button
                id="btn-toggle-nature-audio"
                onClick={toggleAudio}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium backdrop-blur-md transition-all border ${
                  isAudioOn
                    ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.15)]'
                    : 'bg-black/40 border-white/10 text-slate-300 hover:bg-black/60 hover:text-white'
                }`}
                title="Toggle procedural atmospheric wind audio"
              >
                {isAudioOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </button>

              {/* Time of Day Toggle */}
              <div className="flex items-center rounded-xl bg-black/40 p-1 border border-white/10 backdrop-blur-md">
                {(['dawn', 'noon', 'sunset', 'night'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setTimeOfDay(mode)}
                    className={`rounded-lg px-2.5 py-1.5 text-[11px] capitalize transition-all ${
                      timeOfDay === mode
                        ? 'bg-white/15 text-white font-semibold shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Compact Legend */}
            <div className="pointer-events-auto flex items-center gap-3 rounded-xl bg-black/40 px-3 py-2 border border-white/10 backdrop-blur-md text-[10px] text-slate-300 font-medium">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-cyan-400 opacity-80" /> Wind Vectors</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-600 opacity-60" /> Particulates</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-700 opacity-80" /> Vegetation</span>
            </div>
          </div>
        </div>

        {/* Center Prompt / Touch Tip */}
        <div className={`flex justify-center transition-opacity duration-1000 ${showHint ? 'opacity-100' : 'opacity-0'}`}>
          <div className="pointer-events-none rounded-full bg-black/60 px-5 py-2 text-[11px] font-medium text-slate-300 backdrop-blur-md border border-white/10 animate-pulse tracking-wide">
            Hover or drag your cursor to stir air currents & deflect vegetation
          </div>
        </div>

        {/* Bottom Interactive Wind & Smog Modulator */}
        <div className="pointer-events-auto flex flex-wrap items-end justify-between gap-4 rounded-2xl bg-black/50 p-4 backdrop-blur-xl border border-white/10 shadow-lg">
          <div className="flex flex-wrap items-center gap-8">
            {/* Wind Velocity Controller */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[11px] text-slate-300 uppercase tracking-wider font-semibold">
                <span className="flex items-center gap-1.5">
                  <Wind className="h-3 w-3 text-cyan-400" />
                  Wind Velocity Vector
                </span>
                <span className="font-mono text-cyan-400">{windSpeed.toFixed(1)} m/s</span>
              </div>
              <input
                id="slider-nature-wind-speed"
                type="range"
                min="0.5"
                max="25"
                step="0.5"
                value={windSpeed}
                onChange={(e) => setWindSpeed(parseFloat(e.target.value))}
                className="h-1.5 w-36 sm:w-48 cursor-pointer appearance-none rounded-full bg-white/10 accent-cyan-400 focus:outline-none"
              />
            </div>

            {/* Smog Inversion Slider */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[11px] text-slate-300 uppercase tracking-wider font-semibold">
                <span className="flex items-center gap-1.5">
                  <CloudFog className="h-3 w-3 text-amber-500" />
                  Pollution Haze Trapping
                </span>
                <span className="font-mono text-amber-500">{smogLevel}%</span>
              </div>
              <input
                id="slider-nature-smog-level"
                type="range"
                min="0"
                max="100"
                step="5"
                value={smogLevel}
                onChange={(e) => setSmogLevel(parseInt(e.target.value))}
                className="h-1.5 w-36 sm:w-48 cursor-pointer appearance-none rounded-full bg-white/10 accent-amber-500 focus:outline-none"
              />
            </div>

            {/* Cleansing Gale Blast Button */}
            <button
              id="btn-burst-wind-gust"
              onClick={handleBurstGust}
              className="flex items-center gap-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 text-[11px] font-bold text-white transition-all active:scale-95"
            >
              <Wind className="h-3.5 w-3.5 text-cyan-300" />
              <span>Simulate Cleansing Gale</span>
            </button>
          </div>

          {/* Telemetry Navigation Call to Action */}
          {onExploreTelemetry && (
            <button
              id="btn-jump-to-telemetry"
              onClick={onExploreTelemetry}
              className="flex items-center gap-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all hover:scale-[1.02] active:scale-95"
            >
              <span>View Air Pollution Telemetry</span>
              <Play className="h-3.5 w-3.5 fill-current" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
