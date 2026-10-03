import React from 'react';
import { Wind, ShieldCheck, HeartPulse, BookOpen, ExternalLink } from 'lucide-react';
import { ActiveTab } from '../types';

interface FooterProps {
  onNavigate: (tab: ActiveTab) => void;
  onOpenMethodology: () => void;
  onOpenApiKey?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenMethodology, onOpenApiKey }) => {
  return (
    <footer className="w-full border-t border-[rgba(180,210,220,0.08)] bg-[#0B1117] py-10 text-xs text-[#6F828E]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Brand Col */}
          <div className="md:col-span-4 space-y-3">
            <div className="flex items-center space-x-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1AA7B5] shadow-sm">
                <Wind className="h-4 w-4 text-white" />
              </div>
              <span className="text-base font-bold text-[#F3F7F8] tracking-tight">AeroPulse</span>
              <span className="rounded bg-[rgba(34,184,199,0.10)] px-2 py-0.5 text-[10px] font-bold uppercase text-[#4DD4DF] border border-[rgba(34,184,199,0.30)]">
                AQI Intelligence
              </span>
            </div>
            <p className="text-[#8FA2AD] text-xs leading-relaxed max-w-sm">
              Continuous ambient air quality monitoring, atmospheric physics modeling, and clinical public health guidance platform.
            </p>
            <div className="flex items-center space-x-2 text-[11px] text-[#566772] pt-1">
              <span>Sensor Cycle: 60s</span>
              <span>·</span>
              <span>Ensemble WRF-Chem 4.3</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="md:col-span-3 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#C7D3D9]">
              Platform Views
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="text-[#8FA2AD] hover:text-[#4DD4DF] transition-colors"
                >
                  Live Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('map')}
                  className="text-[#8FA2AD] hover:text-[#4DD4DF] transition-colors"
                >
                  Interactive GIS Environmental Map
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('stations')}
                  className="text-[#8FA2AD] hover:text-[#4DD4DF] transition-colors"
                >
                  Monitoring Station Directory
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('analytics')}
                  className="text-[#8FA2AD] hover:text-[#4DD4DF] transition-colors"
                >
                  Atmospheric Trends & Chemistry
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('forecast')}
                  className="text-[#8FA2AD] hover:text-[#4DD4DF] transition-colors"
                >
                  5-Day Air Quality Forecast
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('health')}
                  className="text-[#8FA2AD] hover:text-[#4DD4DF] transition-colors"
                >
                  Clinical Public Health Advisory
                </button>
              </li>
            </ul>
          </div>

          {/* Data Sources & Standards */}
          <div className="md:col-span-5 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#C7D3D9]">
              Data Sources & Regulatory Standards
            </h4>
            <p className="text-xs text-[#8FA2AD] leading-relaxed">
              Synthesized from CAAQMS telemetry stations certified by the Central Pollution Control Board (CPCB), European Environment Agency (EEA), and US Environmental Protection Agency (EPA).
            </p>
            <div className="pt-2 flex flex-wrap gap-2">
              <button
                onClick={onOpenMethodology}
                className="flex items-center space-x-1.5 rounded-lg border border-[rgba(180,210,220,0.12)] bg-[#131D26] px-3 py-1.5 text-xs text-[#4DD4DF] hover:border-[rgba(34,184,199,0.40)] hover:bg-[#182632] transition-colors"
              >
                <BookOpen className="h-3.5 w-3.5 text-[#22B8C7]" />
                <span>Science & Calculation Methodology</span>
              </button>
              {onOpenApiKey && (
                <button
                  onClick={onOpenApiKey}
                  className="flex items-center space-x-1.5 rounded-lg border border-[rgba(180,210,220,0.12)] bg-[#131D26] px-3 py-1.5 text-xs text-[#C7D3D9] hover:border-[rgba(34,184,199,0.40)] hover:text-white hover:bg-[#182632] transition-colors"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-[#4ADE80]" />
                  <span>Configure Live API Key</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Disclaimer & Copyright */}
        <div className="border-t border-[rgba(180,210,220,0.06)] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#566772]">
          <p>
            © {new Date().getFullYear()} AeroPulse Intelligence. Environmental and public health data provided for informational and scientific research purposes.
          </p>
          <div className="flex items-center space-x-3">
            <span className="flex items-center space-x-1 text-[#16A34A]">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>ISO 17025 Calibrated</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
