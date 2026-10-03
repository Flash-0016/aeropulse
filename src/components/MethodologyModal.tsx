import React from 'react';
import { X, BookOpen, ShieldCheck, HelpCircle, CheckCircle2, ChevronRight } from 'lucide-react';

interface MethodologyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MethodologyModal: React.FC<MethodologyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in-50">
      <div
        className="relative w-full max-w-3xl rounded-2xl border border-white/10 bg-[#131A24] p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar"
        id="methodology-modal"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/8 pb-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Atmospheric Science & AQI Calculation</h2>
              <p className="text-xs text-slate-400">
                Mathematical formulation, piecewise linear breakpoints, and regulatory standards.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* The Equation */}
        <div className="rounded-xl border border-white/8 bg-[#0E141C] p-4 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
            Piecewise Linear Interpolation Formula
          </span>
          <div className="rounded-lg bg-[#151D28] p-3 text-center font-mono text-sm sm:text-base font-bold text-slate-200 overflow-x-auto">
            I_p = [ (I_hi - I_lo) / (BP_hi - BP_lo) ] * (C_p - BP_lo) + I_lo
          </div>
          <p className="text-xs text-slate-400 leading-relaxed pt-1">
            Where <strong>C_p</strong> is the truncated concentration of pollutant <em>p</em>,{' '}
            <strong>BP_hi</strong> and <strong>BP_lo</strong> are the breakpoint concentration limits, and{' '}
            <strong>I_hi</strong>, <strong>I_lo</strong> represent the corresponding sub-index boundaries.
          </p>
        </div>

        {/* NAQI vs EPA explanation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="rounded-xl border border-white/5 bg-[#0E141C] p-4 space-y-2">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              1. IN-NAQI Standard (CPCB)
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">
              Considers up to 8 pollutants (PM2.5, PM10, NO2, NH3, SO2, CO, O3, Pb). The overall AQI is taken as the maximum sub-index, provided at least three pollutants are monitored with PM2.5 or PM10 mandatory.
            </p>
          </div>

          <div className="rounded-xl border border-white/5 bg-[#0E141C] p-4 space-y-2">
            <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">
              2. US-EPA NowCast Standard
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">
              Employs the 12-hour weighted NowCast algorithm for PM2.5 and PM10, weighting recent hours more heavily during rapid pollution shifts to provide immediate protective warnings for sensitive groups.
            </p>
          </div>
        </div>

        {/* Breakpoints Table */}
        <div className="rounded-xl border border-white/8 bg-[#0E141C] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              National Air Quality Breakpoints (CPCB Guidelines)
            </span>
            <span className="text-[10px] text-slate-500 font-mono">24h running mean</span>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-white/10 text-[11px] text-slate-400">
                  <th className="py-2 pr-4 font-sans font-semibold">Category</th>
                  <th className="py-2 px-2">AQI Range</th>
                  <th className="py-2 px-2">PM2.5 (µg/m³)</th>
                  <th className="py-2 px-2">PM10 (µg/m³)</th>
                  <th className="py-2 px-2">NO2 (µg/m³)</th>
                  <th className="py-2 pl-2">CO (mg/m³)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                <tr>
                  <td className="py-2 pr-4 font-sans font-bold text-emerald-400">Good</td>
                  <td className="py-2 px-2">0 - 50</td>
                  <td className="py-2 px-2">0 - 30</td>
                  <td className="py-2 px-2">0 - 50</td>
                  <td className="py-2 px-2">0 - 40</td>
                  <td className="py-2 pl-2">0 - 1.0</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-sans font-bold text-lime-400">Satisfactory</td>
                  <td className="py-2 px-2">51 - 100</td>
                  <td className="py-2 px-2">31 - 60</td>
                  <td className="py-2 px-2">51 - 100</td>
                  <td className="py-2 px-2">41 - 80</td>
                  <td className="py-2 pl-2">1.1 - 2.0</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-sans font-bold text-amber-400">Moderate</td>
                  <td className="py-2 px-2">101 - 200</td>
                  <td className="py-2 px-2">61 - 90</td>
                  <td className="py-2 px-2">101 - 250</td>
                  <td className="py-2 px-2">81 - 180</td>
                  <td className="py-2 pl-2">2.1 - 10</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-sans font-bold text-orange-400">Poor</td>
                  <td className="py-2 px-2">201 - 300</td>
                  <td className="py-2 px-2">91 - 120</td>
                  <td className="py-2 px-2">251 - 350</td>
                  <td className="py-2 px-2">181 - 280</td>
                  <td className="py-2 pl-2">10.1 - 17</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-sans font-bold text-rose-400">Very Poor</td>
                  <td className="py-2 px-2">301 - 400</td>
                  <td className="py-2 px-2">121 - 250</td>
                  <td className="py-2 px-2">351 - 430</td>
                  <td className="py-2 px-2">281 - 400</td>
                  <td className="py-2 pl-2">17.1 - 34</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-sans font-bold text-red-600">Severe</td>
                  <td className="py-2 px-2">401 - 500</td>
                  <td className="py-2 px-2">250+</td>
                  <td className="py-2 px-2">430+</td>
                  <td className="py-2 px-2">400+</td>
                  <td className="py-2 pl-2">34+</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-slate-500">
          <span>Standard Reference: MoEFCC / CPCB Guidelines 2014 & US Clean Air Act</span>
          <button
            onClick={onClose}
            className="rounded-lg bg-cyan-500 px-4 py-1.5 font-semibold text-slate-950 hover:bg-cyan-400 transition-colors"
          >
            Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
};
