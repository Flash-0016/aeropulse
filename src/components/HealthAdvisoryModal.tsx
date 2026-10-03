import React from 'react';
import {
  X,
  HeartPulse,
  ShieldAlert,
  AlertTriangle,
  Wind,
  Home,
  Activity,
  CheckCircle,
  XCircle,
  HelpCircle,
} from 'lucide-react';
import { AQIStandard } from '../types';
import { getHealthAdvisory, getAQICategory } from '../utils/aqiCalculators';

interface HealthAdvisoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  aqi: number;
  standard: AQIStandard;
  city: string;
}

export const HealthAdvisoryModal: React.FC<HealthAdvisoryModalProps> = ({
  isOpen,
  onClose,
  aqi,
  standard,
  city,
}) => {
  if (!isOpen) return null;

  const advisory = getHealthAdvisory(aqi, standard);
  const category = getAQICategory(aqi, standard);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020408]/90 backdrop-blur-sm animate-fade-in">
      <div
        id="health-advisory-dialog"
        className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-black/80 shadow-[0_16px_64px_rgba(0,0,0,0.8)] backdrop-blur-2xl"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/5 p-6 bg-white/5">
          <div className="flex items-center gap-4">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl border shadow-inner"
              style={{
                backgroundColor: category.bgLight,
                borderColor: category.borderColor,
                color: category.color,
                boxShadow: `inset 0 0 15px ${category.borderColor}40, 0 0 10px ${category.borderColor}20`,
              }}
            >
              <HeartPulse className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest">
                  Health & Respiratory Advisory
                </h3>
                <span
                  className="rounded-md px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest border"
                  style={{
                    backgroundColor: category.bgLight,
                    borderColor: category.borderColor,
                    color: category.color,
                  }}
                >
                  AQI {aqi} • {category.label}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Calibrated clinical precautions for {city} based on current particulate hazard
              </p>
            </div>
          </div>

          <button
            id="btn-close-health-modal"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-all border border-transparent hover:border-white/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex flex-col gap-4 overflow-y-auto p-6 text-[11px] text-slate-300">
          {/* Executive Overview Banner */}
          <div
            className="rounded-xl border p-5 leading-relaxed shadow-inner"
            style={{
              backgroundColor: category.bgLight,
              borderColor: category.borderColor,
            }}
          >
            <div className="font-bold text-white mb-2 flex items-center gap-2 uppercase tracking-widest text-[10px]">
              <ShieldAlert className="h-4 w-4" style={{ color: category.color }} />
              <span>Current Status: {advisory.levelName}</span>
            </div>
            <p className="text-white/90 text-sm font-medium">{advisory.generalPublic}</p>
          </div>

          {/* Sensitive Populations Callout */}
          <div className="rounded-xl bg-black/40 p-5 border border-white/5 shadow-inner hover:bg-black/60 transition-colors">
            <div className="font-bold text-amber-500 mb-2 flex items-center gap-2 uppercase tracking-widest text-[10px]">
              <AlertTriangle className="h-4 w-4" />
              <span>High-Risk Populations (Asthma, Cardiac, Elderly & Children)</span>
            </div>
            <p className="text-slate-300 leading-relaxed font-medium">{advisory.sensitiveGroups}</p>
          </div>

          {/* Mask Efficacy Matrix */}
          <div className="rounded-xl bg-black/40 p-5 border border-white/5 shadow-inner hover:bg-black/60 transition-colors">
            <div className="flex flex-wrap items-center justify-between mb-3 gap-2">
              <span className="font-bold text-white flex items-center gap-2 uppercase tracking-widest text-[10px]">
                <Wind className="h-4 w-4 text-cyan-400" />
                <span>Certified Respiratory Mask Recommendation</span>
              </span>
              <span
                className={`font-mono font-bold text-[10px] uppercase tracking-widest bg-white/5 px-3 py-1 rounded-md border border-white/10 ${
                  advisory.maskRequired.needed ? 'text-red-400' : 'text-emerald-400'
                }`}
              >
                {advisory.maskRequired.type}
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed mb-4 font-medium">
              {advisory.maskRequired.details}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[10px] font-bold uppercase tracking-wider">
              <div className="flex items-center gap-3 rounded-lg bg-black/60 p-3 text-slate-500 border border-white/5 shadow-inner">
                <XCircle className="h-4 w-4 shrink-0 text-red-500" />
                <span>Cloth & Surgical: 0% PM2.5 filtering</span>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-black/60 p-3 text-slate-300 border border-emerald-500/20 shadow-inner">
                <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />
                <span className="text-emerald-400">Certified N95 / FFP2: 95%+ filtration</span>
              </div>
            </div>
          </div>

          {/* Indoor Environment & Ventilation Guidance */}
          <div className="rounded-xl bg-black/40 p-5 border border-white/5 shadow-inner hover:bg-black/60 transition-colors">
            <div className="flex flex-wrap items-center justify-between mb-3 gap-2">
              <span className="font-bold text-white flex items-center gap-2 uppercase tracking-widest text-[10px]">
                <Home className="h-4 w-4 text-purple-400" />
                <span>Indoor Shelter & HEPA Purification</span>
              </span>
              <span className="font-mono text-[10px] font-bold text-purple-400 bg-purple-500/10 px-3 py-1 rounded-md border border-purple-500/20 uppercase tracking-widest">
                Required ACH: {advisory.indoorVentilation.hepaACH}
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed mb-3 font-medium">
              {advisory.indoorVentilation.guidance}
            </p>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold bg-white/5 p-3 rounded-lg border border-white/5">
              <span className="text-slate-300 mr-2">Window Ventilation Rule:</span>
              {advisory.indoorVentilation.openWindows
                ? <span className="text-emerald-400">Windows may be opened for fresh air exchange.</span>
                : <span className="text-red-400">Keep windows strictly sealed during morning and evening temperature inversions.</span>}
            </div>
          </div>

          {/* Outdoor Athletic Guidance */}
          <div className="rounded-xl bg-black/40 p-5 border border-white/5 shadow-inner hover:bg-black/60 transition-colors">
            <div className="flex flex-wrap items-center justify-between mb-3 gap-2">
              <span className="font-bold text-white flex items-center gap-2 uppercase tracking-widest text-[10px]">
                <Activity className="h-4 w-4 text-emerald-400" />
                <span>Outdoor Cardio & Athletics</span>
              </span>
              <span
                className={`font-mono text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-md border ${
                  advisory.outdoorAthletics.allowed ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-red-400 bg-red-500/10 border-red-500/20'
                }`}
              >
                {advisory.outdoorAthletics.allowed ? 'Safe for Training' : 'Restrict Exertion'}
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed font-medium">
              {advisory.outdoorAthletics.recommendation}
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end border-t border-white/5 bg-black/60 p-6">
          <button
            onClick={onClose}
            className="rounded-xl bg-white/10 hover:bg-white/20 px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white transition-all border border-white/10 hover:border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.05)]"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};
