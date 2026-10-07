import React, { useState } from 'react';
import {
  MapPin,
  RefreshCw,
  SlidersHorizontal,
  ChevronDown,
  Building2,
  Check,
  Search,
  Clock,
  ShieldCheck,
  Key,
} from 'lucide-react';
import { AirStation, AQIStandard } from '../types';

interface ContextBarProps {
  stations: AirStation[];
  selectedStation: AirStation;
  onSelectStation: (station: AirStation) => void;
  standard: AQIStandard;
  onStandardChange: (standard: AQIStandard) => void;
  isRefreshing: boolean;
  onRefresh: () => void;
  lastUpdatedTime: string;
  activeApiKeySlot?: 'Key 1' | 'Key 2';
  usedFallback?: boolean;
}

export const ContextBar: React.FC<ContextBarProps> = ({
  stations,
  selectedStation,
  onSelectStation,
  standard,
  onStandardChange,
  isRefreshing,
  onRefresh,
  lastUpdatedTime,
  activeApiKeySlot = 'Key 1',
  usedFallback = false,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStations = stations.filter(
    (st) =>
      st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative z-30 w-full border-b border-[rgba(180,210,220,0.12)] bg-[#111B24] py-2.5 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        {/* Left: Location & Station Picker */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              id="station-selector-dropdown-btn"
              className="group flex items-center space-x-2 rounded-lg border border-[rgba(180,210,220,0.14)] bg-[#151F28] px-3 py-1.5 text-xs font-medium text-[#E2E9EC] transition-colors hover:border-[rgba(34,184,199,0.30)] hover:bg-[#1B2933]"
            >
              <MapPin className="h-3.5 w-3.5 text-[#22B8C7]" />
              <div className="flex items-center space-x-1.5">
                <span className="font-semibold text-[#F3F7F8]">{selectedStation.city}</span>
                <span className="text-[#566772]">·</span>
                <span className="max-w-[140px] truncate text-[#899BA5] sm:max-w-[200px]">
                  {selectedStation.name}
                </span>
              </div>
              <ChevronDown className={`h-3 w-3 text-[#718591] transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Station Menu */}
            {dropdownOpen && (
              <div className="absolute left-0 mt-1.5 w-72 sm:w-80 rounded-xl border border-[rgba(180,210,220,0.16)] bg-[#182631] p-2 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in-50 zoom-in-95">
                {/* Search input */}
                <div className="relative mb-2">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[#718591]" />
                  <input
                    type="text"
                    placeholder="Search city, station or code..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-lg border border-[rgba(180,210,220,0.12)] bg-[#101922] py-1.5 pl-8 pr-3 text-xs text-[#F3F7F8] placeholder-[#566772] focus:border-[#22B8C7] focus:outline-none"
                    autoFocus
                  />
                </div>

                <div className="max-h-60 overflow-y-auto space-y-1 custom-scrollbar">
                  {filteredStations.map((station) => {
                    const isSelected = station.id === selectedStation.id;
                    const aqi = standard === 'NAQI' ? station.aqiNAQI : station.aqiEPA;
                    return (
                      <button
                        key={station.id}
                        onClick={() => {
                          onSelectStation(station);
                          setDropdownOpen(false);
                          setSearchQuery('');
                        }}
                        className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition-colors ${
                          isSelected
                            ? 'bg-[rgba(34,184,199,0.12)] text-[#4DD4DF] font-medium border border-[rgba(34,184,199,0.30)]'
                            : 'text-[#B7C5CE] hover:bg-[#151F28] hover:text-white'
                        }`}
                      >
                        <div className="truncate pr-2">
                          <div className="font-semibold text-[#F3F7F8]">{station.city}, {station.country}</div>
                          <div className="truncate text-[11px] text-[#718591]">{station.name}</div>
                        </div>
                        <div className="flex items-center space-x-2 shrink-0">
                          <span
                            className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                              aqi <= 50
                                ? 'bg-[rgba(22,163,74,0.12)] text-[#4ADE80] border border-[rgba(22,163,74,0.35)]'
                                : aqi <= 100
                                ? 'bg-[rgba(132,204,22,0.12)] text-[#A3E635] border border-[rgba(132,204,22,0.35)]'
                                : aqi <= 200
                                ? 'bg-[rgba(234,179,8,0.12)] text-[#FACC15] border border-[rgba(234,179,8,0.35)]'
                                : aqi <= 300
                                ? 'bg-[rgba(249,115,22,0.12)] text-[#FB923C] border border-[rgba(249,115,22,0.35)]'
                                : aqi <= 400
                                ? 'bg-[rgba(239,68,68,0.12)] text-[#F87171] border border-[rgba(239,68,68,0.35)]'
                                : 'bg-[rgba(153,27,27,0.16)] text-[#FCA5A5] border border-[rgba(153,27,27,0.40)]'
                            }`}
                          >
                            AQI {aqi}
                          </span>
                          {isSelected && <Check className="h-3.5 w-3.5 text-[#22B8C7]" />}
                        </div>
                      </button>
                    );
                  })}
                  {filteredStations.length === 0 && (
                    <p className="py-4 text-center text-xs text-[#566772]">No stations match search.</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Provider Badge */}
          <div className="hidden sm:flex items-center space-x-1.5 rounded-md border border-[rgba(34,184,199,0.20)] bg-[rgba(34,184,199,0.08)] px-2 py-1 text-[11px] text-[#78C9D2]">
            <ShieldCheck className="h-3 w-3 text-[#22B8C7]" />
            <span className="text-[#899BA5]">Source:</span>
            <span className="font-medium text-[#78C9D2]">{selectedStation.provider}</span>
          </div>

          {/* Active Key Status Indicator */}
          <div
            className={`hidden md:flex items-center space-x-1.5 rounded-md border px-2 py-1 text-[11px] font-mono transition-all ${
              activeApiKeySlot === 'Key 2'
                ? 'border-amber-500/35 bg-amber-500/10 text-amber-300'
                : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
            }`}
            title={
              activeApiKeySlot === 'Key 2'
                ? 'Primary Key 1 rate limit exceeded. Auto-failover to Fallback Key 2 active.'
                : 'Primary OpenWeather API Key 1 is currently active.'
            }
          >
            <Key className="h-3 w-3" />
            <span>API {activeApiKeySlot}</span>
            <span className="text-[10px] font-sans opacity-80">
              {activeApiKeySlot === 'Key 2' ? '(Fallback)' : '(Active)'}
            </span>
          </div>
        </div>

        {/* Right: Standard Switcher + Refresh + Timestamp */}
        <div className="flex items-center space-x-3 text-xs">
          {/* AQI Standard Toggle */}
          <div className="flex items-center space-x-1 rounded-lg border border-[rgba(180,210,220,0.12)] bg-[#101922] p-0.5">
            <button
              onClick={() => onStandardChange('NAQI')}
              id="standard-toggle-naqi"
              className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                standard === 'NAQI'
                  ? 'bg-[#1AA7B5] text-white shadow-sm'
                  : 'text-[#8193A0] hover:text-[#C7D3D9]'
              }`}
              title="Indian National Air Quality Index (CPCB 8-pollutant sub-index)"
            >
              IN-NAQI
            </button>
            <button
              onClick={() => onStandardChange('EPA')}
              id="standard-toggle-epa"
              className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                standard === 'EPA'
                  ? 'bg-[#1AA7B5] text-white shadow-sm'
                  : 'text-[#8193A0] hover:text-[#C7D3D9]'
              }`}
              title="US Environmental Protection Agency NowCast AQI Standard"
            >
              US-EPA
            </button>
          </div>

          {/* Timestamp Indicator */}
          <div className="hidden md:flex items-center space-x-1.5 text-[#718591] text-[11px]">
            <Clock className="h-3 w-3 text-[#566772]" />
            <span>Updated: <strong className="font-medium text-[#B7C5CE]">{lastUpdatedTime}</strong></span>
          </div>

          {/* Refresh Action (Secondary style) */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            id="refresh-data-btn"
            title="Fetch latest station sensor readings"
            className="flex items-center space-x-1.5 rounded-lg border border-[rgba(180,210,220,0.14)] bg-[#151F28] px-2.5 py-1.5 text-[#C7D3D9] transition-all hover:bg-[#1B2933] hover:text-white disabled:opacity-50"
          >
            <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin text-[#22B8C7]' : 'text-[#8FA2AD]'}`} />
            <span className="hidden sm:inline font-medium text-[11px]">{isRefreshing ? 'Syncing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>
    </div>

  );
};
