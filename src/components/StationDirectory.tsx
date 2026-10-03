import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Building2,
  Check,
  ChevronRight,
  ShieldCheck,
  Radio,
  MapPin,
} from 'lucide-react';
import { AirStation, AQIStandard, StationStatusFilter, StationSortOption } from '../types';
import { getAQICategory } from '../utils/aqiCalculators';

interface StationDirectoryProps {
  stations: AirStation[];
  selectedStation: AirStation;
  onSelectStation: (st: AirStation) => void;
  standard: AQIStandard;
  colorBlindMode: boolean;
}

export const StationDirectory: React.FC<StationDirectoryProps> = ({
  stations,
  selectedStation,
  onSelectStation,
  standard,
  colorBlindMode,
}) => {
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<StationStatusFilter>('All');
  const [sortBy, setSortBy] = useState<StationSortOption>('aqi-desc');

  const categoriesList: StationStatusFilter[] = [
    'All',
    'Good',
    'Satisfactory',
    'Moderate',
    'Poor',
    'Very Poor',
    'Severe',
  ];

  const filteredStations = useMemo(() => {
    return stations
      .filter((st) => {
        const matchesSearch =
          st.name.toLowerCase().includes(search.toLowerCase()) ||
          st.city.toLowerCase().includes(search.toLowerCase()) ||
          st.country.toLowerCase().includes(search.toLowerCase()) ||
          st.stationCode.toLowerCase().includes(search.toLowerCase());

        if (!matchesSearch) return false;

        if (filterCategory === 'All') return true;

        const aqi = standard === 'NAQI' ? st.aqiNAQI : st.aqiEPA;
        const cat = getAQICategory(aqi, standard);
        return cat.label === filterCategory;
      })
      .sort((a, b) => {
        const aqiA = standard === 'NAQI' ? a.aqiNAQI : a.aqiEPA;
        const aqiB = standard === 'NAQI' ? b.aqiNAQI : b.aqiEPA;

        if (sortBy === 'aqi-desc') return aqiB - aqiA;
        if (sortBy === 'aqi-asc') return aqiA - aqiB;
        if (sortBy === 'name') return a.city.localeCompare(b.city);
        return b.confidenceScore - a.confidenceScore;
      });
  }, [stations, search, filterCategory, sortBy, standard]);

  const getAqiColor = (aqi: number) => {
    if (colorBlindMode) {
      if (aqi <= 50) return '#3B82F6';
      if (aqi <= 100) return '#06B6D4';
      if (aqi <= 200) return '#F59E0B';
      if (aqi <= 300) return '#D97706';
      return '#8B5CF6';
    }
    return getAQICategory(aqi, standard).color;
  };

  return (
    <section className="space-y-5" id="monitoring-stations-section">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center space-x-2">
            <Building2 className="h-5 w-5 text-cyan-400" />
            <span>Monitoring Station Directory</span>
          </h2>
          <p className="text-xs text-slate-400">
            Real-time telemetry from validated continuous ambient air monitoring stations (CAAQMS).
          </p>
        </div>

        <span className="text-xs text-slate-400">
          Showing <strong className="text-cyan-400">{filteredStations.length}</strong> of {stations.length} stations
        </span>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search station name, city, country, or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            id="station-search-input"
            className="w-full rounded-xl border border-white/10 bg-[#121822] py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
          />
        </div>

        {/* Sort Select */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 rounded-xl border border-white/10 bg-[#121822] px-3 py-1.5 text-xs text-slate-300">
            <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-slate-500 hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as StationSortOption)}
              className="bg-transparent font-medium text-white focus:outline-none cursor-pointer"
              id="station-sort-select"
            >
              <option value="aqi-desc" className="bg-[#121822]">Highest AQI</option>
              <option value="aqi-asc" className="bg-[#121822]">Lowest AQI</option>
              <option value="name" className="bg-[#121822]">City Name</option>
              <option value="last-updated" className="bg-[#121822]">Confidence</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category Pills Filter */}
      <div className="flex overflow-x-auto space-x-1.5 pb-1 custom-scrollbar">
        {categoriesList.map((cat) => {
          const isActive = filterCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`whitespace-nowrap rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'border border-white/8 bg-[#121822] text-slate-400 hover:text-white hover:border-white/20'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Station Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredStations.map((st) => {
          const aqi = standard === 'NAQI' ? st.aqiNAQI : st.aqiEPA;
          const isSelected = st.id === selectedStation.id;
          const aqiColor = getAqiColor(aqi);
          const cat = getAQICategory(aqi, standard);

          return (
            <div
              key={st.id}
              onClick={() => onSelectStation(st)}
              className={`group relative flex flex-col justify-between rounded-xl p-4 transition-all cursor-pointer backdrop-blur-sm ${
                isSelected
                  ? 'border-2 border-cyan-400 bg-[#16212E] shadow-lg shadow-cyan-500/10'
                  : 'border border-white/8 bg-[#121822] hover:border-white/20 hover:bg-[#161F2C]'
              }`}
            >
              {/* Top Row: City + Live Indicator + AQI */}
              <div>
                <div className="flex items-start justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="text-base font-bold text-white">{st.city}</span>
                      <span className="text-xs text-slate-400">· {st.country}</span>
                    </div>
                    <div className="text-xs text-slate-400 truncate max-w-[190px]">
                      {st.name}
                    </div>
                  </div>

                  {/* AQI Indicator */}
                  <div
                    className="flex flex-col items-end rounded-lg px-2.5 py-1"
                    style={{
                      backgroundColor: `${aqiColor}20`,
                      border: `1px solid ${aqiColor}40`,
                    }}
                  >
                    <span className="text-[10px] uppercase font-bold text-slate-400">AQI</span>
                    <span className="text-xl font-black" style={{ color: aqiColor }}>
                      {aqi}
                    </span>
                  </div>
                </div>

                {/* Sub info */}
                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 border-t border-white/5 pt-2">
                  <span className="flex items-center space-x-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                    <span>● Online</span>
                    <span className="text-slate-500">({st.provider})</span>
                  </span>
                  <span
                    className="rounded px-1.5 py-0.2 font-semibold uppercase text-[10px]"
                    style={{ color: aqiColor }}
                  >
                    {cat.label}
                  </span>
                </div>
              </div>

              {/* Pollutant snapshot */}
              <div className="mt-3 grid grid-cols-3 gap-2 rounded-lg bg-[#0E141C] p-2 text-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-500">PM2.5</span>
                  <div className="font-mono font-bold text-slate-200">
                    {st.pollutants.pm25?.value || '—'}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500">PM10</span>
                  <div className="font-mono font-bold text-slate-200">
                    {st.pollutants.pm10?.value || '—'}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500">Primary</span>
                  <div className="font-mono font-bold text-cyan-400">
                    {st.dominantPollutant}
                  </div>
                </div>
              </div>

              {/* Bottom Action */}
              <div className="mt-3 flex items-center justify-between pt-2 border-t border-white/5 text-xs">
                <span className="font-mono text-[10px] text-slate-500">
                  {st.stationCode}
                </span>
                <span className="flex items-center space-x-1 font-semibold text-cyan-400">
                  <span>{isSelected ? 'Active Station' : 'Select Station'}</span>
                  {isSelected ? <Check className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
