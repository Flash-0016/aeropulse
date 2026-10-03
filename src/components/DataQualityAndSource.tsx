import React from 'react';
import {
  ShieldCheck,
  Download,
  BookOpen,
  CheckCircle2,
  Clock,
  Cpu,
  FileText,
  FileCode,
} from 'lucide-react';
import { AirStation } from '../types';
import { exportStationToCSV, exportStationToJSON } from '../utils/airQualityAnalytics';

interface DataQualityAndSourceProps {
  station: AirStation;
  onOpenMethodology: () => void;
}

export const DataQualityAndSource: React.FC<DataQualityAndSourceProps> = ({
  station,
  onOpenMethodology,
}) => {
  return (
    <section className="rounded-2xl border border-white/10 bg-[#121822] p-5 sm:p-6 backdrop-blur-sm space-y-5" id="data-quality-section">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/8 pb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <span>Telemetry Provenance & QA/QC Audit</span>
          </h3>
          <p className="text-xs text-slate-400">
            Automated sensor drift compensation and zero-span calibration metrics.
          </p>
        </div>

        {/* Export Data Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => exportStationToCSV(station)}
            id="download-csv-btn"
            className="flex items-center space-x-1.5 rounded-lg border border-white/10 bg-[#16202C] px-3 py-1.5 text-xs font-semibold text-slate-200 transition-colors hover:border-cyan-500/40 hover:text-white"
          >
            <FileText className="h-3.5 w-3.5 text-cyan-400" />
            <span>CSV Export</span>
          </button>
          <button
            onClick={() => exportStationToJSON(station)}
            id="download-json-btn"
            className="flex items-center space-x-1.5 rounded-lg border border-white/10 bg-[#16202C] px-3 py-1.5 text-xs font-semibold text-slate-200 transition-colors hover:border-cyan-500/40 hover:text-white"
          >
            <FileCode className="h-3.5 w-3.5 text-amber-400" />
            <span>JSON Telemetry</span>
          </button>
        </div>
      </div>

      {/* Sensor Metrics Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="rounded-xl border border-white/5 bg-[#0E141D] p-3.5 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Hardware Status</span>
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <div className="text-sm font-bold text-emerald-400 flex items-center space-x-1">
            <CheckCircle2 className="h-4 w-4" />
            <span>Online & Transmitting</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Sampling cycle: 60 sec</span>
        </div>

        <div className="rounded-xl border border-white/5 bg-[#0E141D] p-3.5 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Calibration Protocol</span>
            <Cpu className="h-3.5 w-3.5 text-cyan-400" />
          </div>
          <div className="text-sm font-bold text-white">
            {station.calibrationStatus || 'Auto NIST Span (Active)'}
          </div>
          <span className="text-[10px] text-slate-500">BAM-1020 standard span</span>
        </div>

        <div className="rounded-xl border border-white/5 bg-[#0E141D] p-3.5 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Data Completeness</span>
            <CheckCircle2 className="h-3.5 w-3.5 text-teal-400" />
          </div>
          <div className="text-sm font-bold text-teal-400 font-mono">
            {station.confidenceScore}% Validated
          </div>
          <span className="text-[10px] text-slate-500">Zero packet drop in 24h</span>
        </div>

        <div className="rounded-xl border border-white/5 bg-[#0E141D] p-3.5 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Ingestion Latency</span>
            <Clock className="h-3.5 w-3.5 text-slate-400" />
          </div>
          <div className="text-sm font-bold text-white font-mono">
            ~45 seconds
          </div>
          <span className="text-[10px] text-slate-500">Real-time edge gateway</span>
        </div>
      </div>

      {/* Regulatory Attribution & Methodology Callout */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-white/5 bg-[#0E141C] p-4 text-xs">
        <div className="space-y-0.5">
          <div className="font-semibold text-slate-300">
            Continuous Ambient Air Quality Monitoring Station (CAAQMS) Network
          </div>
          <div className="text-slate-500">
            Data verified by {station.provider} adhering to ISO/IEC 17025 environmental testing standards.
          </div>
        </div>

        <button
          onClick={onOpenMethodology}
          id="open-methodology-footer-btn"
          className="flex items-center space-x-1.5 rounded-lg border border-white/10 bg-[#151D28] px-3.5 py-2 text-xs font-semibold text-cyan-300 hover:border-cyan-500/40 hover:bg-[#1C2634] transition-colors shrink-0"
        >
          <BookOpen className="h-3.5 w-3.5 text-cyan-400" />
          <span>Science & Calculation Methodology</span>
        </button>
      </div>
    </section>
  );
};
