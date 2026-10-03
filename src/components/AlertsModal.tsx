import React from 'react';
import { X, Bell, AlertTriangle, ShieldAlert, CheckCircle2, Info, MapPin } from 'lucide-react';
import { AirStation, AQIStandard } from '../types';

interface AlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stations: AirStation[];
  standard: AQIStandard;
  onSelectStation: (st: AirStation) => void;
}

export const AlertsModal: React.FC<AlertsModalProps> = ({
  isOpen,
  onClose,
  stations,
  standard,
  onSelectStation,
}) => {
  if (!isOpen) return null;

  // Filter stations in Poor, Very Poor, or Severe status
  const criticalStations = stations.filter((st) => {
    const aqi = standard === 'NAQI' ? st.aqiNAQI : st.aqiEPA;
    return aqi > 200;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in-50">
      <div
        className="relative w-full max-w-xl rounded-2xl border border-white/10 bg-[#131A24] p-6 shadow-2xl space-y-5 max-h-[85vh] overflow-y-auto custom-scrollbar"
        id="alerts-modal"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/8 pb-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Active Environmental Advisories</h2>
              <p className="text-xs text-slate-400">
                Automated threshold alarms and regulatory smog warnings.
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

        {/* Global Alert Notification */}
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-1.5">
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <AlertTriangle className="h-4 w-4" />
            <span>Thermal Inversion & Particulate Accumulation Warning</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Synoptic weather conditions indicate surface cold pool trapping across northern plains and industrial basins. Calm surface winds are hindering nocturnal dispersion of combustion aerosols.
          </p>
        </div>

        {/* Station-specific Alerts List */}
        <div className="space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Stations Exceeding Threshold (AQI &gt; 200)
          </span>

          <div className="space-y-2">
            {criticalStations.map((st) => {
              const aqi = standard === 'NAQI' ? st.aqiNAQI : st.aqiEPA;
              const isSevere = aqi > 400;

              return (
                <div
                  key={st.id}
                  className="flex items-center justify-between rounded-xl border border-white/5 bg-[#0E141D] p-3.5 hover:border-white/20 transition-all"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white text-sm">{st.city}</span>
                      <span
                        className={`rounded px-1.5 py-0.2 text-[10px] font-bold uppercase ${
                          isSevere ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'
                        }`}
                      >
                        {isSevere ? 'Severe Alert' : 'Very Poor'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 truncate max-w-[240px] sm:max-w-xs">
                      {st.name} · Primary: {st.dominantPollutant}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-400 uppercase">AQI</div>
                      <div
                        className="text-lg font-black"
                        style={{ color: isSevere ? '#EF4444' : '#F97316' }}
                      >
                        {aqi}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        onSelectStation(st);
                        onClose();
                      }}
                      className="rounded-lg bg-white/10 px-2.5 py-1.5 text-xs font-medium text-slate-200 hover:bg-cyan-500 hover:text-slate-950 transition-colors"
                    >
                      View
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end pt-2 border-t border-white/5">
          <button
            onClick={onClose}
            className="rounded-lg bg-white/10 px-4 py-1.5 text-xs font-semibold text-white hover:bg-white/20 transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
