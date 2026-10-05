import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Sliders,
  Calendar,
  Layers,
  Info,
  Check,
  AlertTriangle,
  ShieldAlert,
  HeartPulse,
  ArrowRight,
  Sparkles,
  Eye,
  Activity,
  X,
  Compass,
  Zap,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceDot,
  CartesianGrid,
  Legend,
} from 'recharts';
import { AirStation, AQIStandard } from '../types';
import {
  getHistoricalTrend,
  TrendDataPoint,
  PollutantEventMarker,
} from '../utils/airQualityAnalytics';

interface AnalyticsSectionProps {
  station: AirStation;
  standard: AQIStandard;
  colorBlindMode: boolean;
  onNavigateToHealth?: () => void;
}

export const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({
  station,
  standard,
  colorBlindMode,
  onNavigateToHealth,
}) => {
  const [timeRange, setTimeRange] = useState<'1H' | '6H' | '24H' | '7D' | '30D'>('24H');
  const [selectedMetric, setSelectedMetric] = useState<string>('aqi');
  const [showEventMarkers, setShowEventMarkers] = useState<boolean>(true);
  const [selectedEvent, setSelectedEvent] = useState<PollutantEventMarker | null>(null);

  // Multi-pollutant toggle states
  const [visiblePollutants, setVisiblePollutants] = useState<{
    pm25: boolean;
    pm10: boolean;
    no2: boolean;
    o3: boolean;
    so2: boolean;
  }>({
    pm25: true,
    pm10: true,
    no2: true,
    o3: true,
    so2: false,
  });

  const trendData = useMemo(() => {
    return getHistoricalTrend(station, timeRange, standard);
  }, [station, timeRange, standard]);

  // Extract all points that have events
  const detectedEvents = useMemo(() => {
    return trendData
      .filter((d) => d.event !== undefined)
      .map((d) => ({
        point: d,
        event: d.event as PollutantEventMarker,
      }));
  }, [trendData]);

  // Auto-select first event if none selected
  useMemo(() => {
    if (detectedEvents.length > 0 && !selectedEvent) {
      setSelectedEvent(detectedEvents[0].event);
    }
  }, [detectedEvents, selectedEvent]);

  const togglePollutant = (key: keyof typeof visiblePollutants) => {
    setVisiblePollutants((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Psychological color mappings: each wavelength mapped to human cognitive & biological alertness
  const metricConfig: Record<
    string,
    {
      label: string;
      unit: string;
      color: string;
      limit?: number;
      psychologicalEffect: string;
    }
  > = {
    aqi: {
      label: 'Air Quality Index',
      unit: 'AQI',
      color: '#06B6D4', // Cyan: Clear respiratory perception & clarity
      limit: standard === 'NAQI' ? 200 : 150,
      psychologicalEffect: 'Standard atmospheric index · Blue/Cyan promotes focused cognitive attention',
    },
    pm25: {
      label: 'PM2.5 Fine Particles',
      unit: 'µg/m³',
      color: '#EF4444', // High-urgency Crimson: Direct biological defense signal
      limit: 60,
      psychologicalEffect: 'Sub-micron particulates · Red activates instinctual respiratory defense',
    },
    pm10: {
      label: 'PM10 Coarse Inhalable Dust',
      unit: 'µg/m³',
      color: '#F97316', // Coral Orange: Sensory irritation alert
      limit: 100,
      psychologicalEffect: 'Thoracic dust · Orange prompts cautionary reduction of physical exertion',
    },
    no2: {
      label: 'Nitrogen Dioxide',
      unit: 'µg/m³',
      color: '#8B5CF6', // Deep Violet: Chemical combustion warning
      limit: 80,
      psychologicalEffect: 'Traffic combustion · Violet conveys solemn chemical caution',
    },
    o3: {
      label: 'Tropospheric Ozone',
      unit: 'µg/m³',
      color: '#10B981', // Emerald-Teal: Sunlight-induced oxidant
      limit: 100,
      psychologicalEffect: 'Photochemical oxidant · Green-teal signals diurnal solar interaction',
    },
    so2: {
      label: 'Sulfur Dioxide',
      unit: 'µg/m³',
      color: '#EC4899', // Hot Pink / Magenta: Acid gas irritant
      limit: 80,
      psychologicalEffect: 'Industrial emissions · Magenta signals pungent olfactory alert',
    },
    co: {
      label: 'Carbon Monoxide',
      unit: 'mg/m³',
      color: '#EAB308', // Amber: Asphyxiation hazard
      limit: 2.0,
      psychologicalEffect: 'Incomplete combustion · Amber promotes heightened vigilance',
    },
  };

  const activeMetric = metricConfig[selectedMetric] || metricConfig.aqi;

  // Custom interactive dot renderer with scientific clarity on threshold events
  const renderInteractiveDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (!payload) return null;

    const event = payload.event as PollutantEventMarker | undefined;

    if (!event || !showEventMarkers) {
      return (
        <circle
          key={`dot-${payload.time}`}
          cx={cx}
          cy={cy}
          r={2.5}
          fill={activeMetric.color}
          stroke="none"
          opacity={0.8}
        />
      );
    }

    const isSelected = selectedEvent?.id === event.id;
    const pulseColor = event.color || '#EF4444';

    return (
      <g
        key={`event-marker-${payload.time}`}
        className="cursor-pointer transition-transform hover:scale-125"
        onClick={(e) => {
          e.stopPropagation();
          setSelectedEvent(event);
        }}
      >
        {/* Scientific Event Marker: border #EF4444, fill rgba(239,68,68,0.25) */}
        <circle
          cx={cx}
          cy={cy}
          r={isSelected ? 11 : 7}
          fill="rgba(239, 68, 68, 0.25)"
          stroke="#EF4444"
          strokeWidth={isSelected ? 2.5 : 1.5}
        />
        {/* Central Core Indicator */}
        <circle
          cx={cx}
          cy={cy}
          r={isSelected ? 4 : 2.5}
          fill={isSelected ? '#FFFFFF' : '#EF4444'}
          stroke="#111A22"
          strokeWidth={1}
        />
      </g>
    );
  };

  return (
    <section className="space-y-6" id="analytics-section">
      {/* Section Heading & Time Range Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[rgba(180,210,220,0.10)] pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[rgba(34,184,199,0.10)] text-[#4DD4DF] border border-[rgba(34,184,199,0.25)]">
              <TrendingUp className="h-4 w-4" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[#F3F7F8]">
              Atmospheric Trend & Temporal Dynamics
            </h2>
          </div>
          <p className="text-xs text-[#8193A0] mt-1 pl-10">
            Interactive threshold event tracking and boundary-layer photochemical dispersion.
          </p>
        </div>

        {/* Controls: Event Marker Toggle & Time Range */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Toggle Interactive Event Markers */}
          <button
            onClick={() => setShowEventMarkers(!showEventMarkers)}
            className={`flex items-center space-x-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all ${
              showEventMarkers
                ? 'border-[rgba(234,179,8,0.40)] bg-[rgba(234,179,8,0.12)] text-[#FACC15]'
                : 'border-[rgba(180,210,220,0.14)] bg-[#151F28] text-[#8193A0] hover:text-[#F3F7F8]'
            }`}
            title="Toggle interactive threshold crossing markers on chart"
          >
            <Zap className={`h-3.5 w-3.5 ${showEventMarkers ? 'text-[#FACC15]' : 'text-[#718591]'}`} />
            <span>Event Markers ({detectedEvents.length})</span>
          </button>

          {/* Time Range Selector */}
          <div className="flex items-center space-x-1 rounded-xl border border-[rgba(180,210,220,0.12)] bg-[#111A22] p-1 text-xs">
            {(['1H', '6H', '24H', '7D', '30D'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                id={`trend-range-${r.toLowerCase()}`}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                  timeRange === r
                    ? 'bg-[#1AA7B5] text-white shadow-sm font-bold'
                    : 'text-[#8193A0] hover:text-[#C7D3D9] hover:bg-[#151F28]'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Threshold Events Notification Banner */}
      {showEventMarkers && detectedEvents.length > 0 && (
        <div className="rounded-2xl border border-[rgba(180,210,220,0.10)] bg-[#141F2A] p-4 shadow-md space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[rgba(180,210,220,0.08)] pb-2.5">
            <div className="flex items-center space-x-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-[#EAB308]"></span>
              <span className="text-xs font-bold uppercase tracking-wider text-[#FACC15]">
                Active Threshold Events & Exceedance Markers
              </span>
              <span className="rounded bg-[rgba(180,210,220,0.08)] px-2 py-0.5 text-[10px] font-mono text-[#B7C5CE]">
                Click any marker to inspect & access clinical guidance
              </span>
            </div>
            <span className="text-[11px] text-[#718591] font-mono">
              {standard === 'NAQI' ? 'CPCB NAQI Thresholds' : 'US-EPA Standards'}
            </span>
          </div>

          {/* Event Chips List */}
          <div className="flex flex-wrap items-center gap-2">
            {detectedEvents.map(({ point, event }) => {
              const isSelected = selectedEvent?.id === event.id;

              return (
                <button
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  className={`group flex items-center space-x-2 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all ${
                    isSelected
                      ? 'border-[rgba(34,184,199,0.40)] bg-[rgba(34,184,199,0.15)] text-[#F3F7F8]'
                      : 'border-[rgba(180,210,220,0.10)] bg-[#111A22] text-[#8193A0] hover:border-[rgba(180,210,220,0.20)] hover:text-[#C7D3D9]'
                  }`}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: event.color }}
                  />
                  <span>{point.time}</span>
                  <span className="text-[#566772]">·</span>
                  <span
                    className="font-bold text-[11px]"
                    style={{ color: event.color }}
                  >
                    {event.badgeLabel}
                  </span>
                  {isSelected && (
                    <span className="ml-1 rounded bg-[rgba(34,184,199,0.20)] px-1 py-0.2 text-[9px] uppercase font-bold text-[#4DD4DF]">
                      Active
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Single Metric Trend Chart Card */}
      <div className="rounded-2xl border border-[rgba(180,210,220,0.10)] bg-[#111A22] p-5 lg:p-6 space-y-5 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Metric Selector Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {Object.keys(metricConfig).map((key) => {
              const cfg = metricConfig[key];
              const isSelected = selectedMetric === key;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedMetric(key)}
                  id={`metric-select-${key}`}
                  className={`flex items-center space-x-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-[#15232F] text-[#F3F7F8] border border-[rgba(34,184,199,0.30)]'
                      : 'text-[#8193A0] hover:text-[#C7D3D9] hover:bg-[#151F28] border border-transparent'
                  }`}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: cfg.color }}
                  />
                  <span>{key.toUpperCase()}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <div className="flex items-center space-x-1.5 text-[#C7D3D9]">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: activeMetric.color }}></span>
              <span className="font-bold">{activeMetric.label}</span>
              <span className="text-[#718591] font-mono">({activeMetric.unit})</span>
            </div>
            {activeMetric.limit && (
              <span className="rounded-md bg-[rgba(234,179,8,0.10)] border border-[rgba(234,179,8,0.25)] px-2 py-0.5 text-[10px] font-bold text-[#FACC15]">
                Limit: {activeMetric.limit} {activeMetric.unit}
              </span>
            )}
          </div>
        </div>

        {/* Psychological Color & Cognitive Note */}
        <div className="rounded-xl border border-[rgba(180,210,220,0.08)] bg-[#0E161E] px-3.5 py-2 text-xs flex items-center justify-between text-[#8193A0]">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-3.5 w-3.5 text-[#22B8C7]" />
            <span className="text-[#B7C5CE] font-medium">{activeMetric.psychologicalEffect}</span>
          </div>
          <span className="text-[10px] text-[#566772] font-mono hidden sm:inline">
            Interactive Dot Click = Immediate Clinical Advisory
          </span>
        </div>

        {/* Chart Viewport */}
        <div className="h-72 sm:h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={280}>
            <LineChart
              data={trendData}
              margin={{ top: 15, right: 20, left: -15, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(180, 210, 220, 0.06)" vertical={false} />
              <XAxis
                dataKey="time"
                stroke="#6F828E"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: 'rgba(180, 210, 220, 0.12)' }}
              />
              <YAxis
                stroke="#6F828E"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: 'rgba(180, 210, 220, 0.12)' }}
                domain={[0, 'auto']}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#121D27',
                  borderColor: 'rgba(180, 210, 220, 0.16)',
                  borderRadius: '12px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                  fontSize: '12px',
                  color: '#F3F7F8',
                }}
                formatter={(val: any) => [`${val} ${activeMetric.unit}`, activeMetric.label]}
                labelFormatter={(label, items) => {
                  const item = items[0]?.payload as TrendDataPoint;
                  return item?.timestamp || label;
                }}
              />

              {/* Reference Regulatory Threshold Line (#EAB308 or #F97316) */}
              {activeMetric.limit && (
                <ReferenceLine
                  y={activeMetric.limit}
                  stroke="#EAB308"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{
                    value: `Threshold (${activeMetric.limit} ${activeMetric.unit})`,
                    fill: '#EAB308',
                    fontSize: 10,
                    position: 'insideTopRight',
                  }}
                />
              )}

              {/* The Active Metric Line with Custom Interactive Dots */}
              <Line
                type="monotone"
                dataKey={selectedMetric}
                stroke={activeMetric.color}
                strokeWidth={2.5}
                dot={renderInteractiveDot}
                activeDot={{
                  r: 6,
                  fill: activeMetric.color,
                  stroke: '#F3F7F8',
                  strokeWidth: 2,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Selected Event Detail & DIRECT LINK TO HEALTH GUIDANCE */}
        {selectedEvent && (
          <div
            className="rounded-xl border p-4 transition-all duration-300 relative overflow-hidden"
            style={{
              borderColor: `${selectedEvent.color}50`,
              backgroundColor: `${selectedEvent.color}10`,
            }}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center space-x-2">
                  <span
                    className="flex h-2 w-2 rounded-full"
                    style={{ backgroundColor: selectedEvent.color }}
                  />
                  <span
                    className="text-xs font-bold uppercase tracking-wider"
                    style={{ color: selectedEvent.color }}
                  >
                    {selectedEvent.badgeLabel}
                  </span>
                  <span className="text-[#566772]">·</span>
                  <span className="text-xs font-mono text-[#B7C5CE]">
                    Threshold: {selectedEvent.thresholdValue}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-[#F3F7F8] flex items-center space-x-2">
                  <span>{selectedEvent.title}</span>
                </h4>

                <p className="text-xs text-[#B7C5CE] leading-relaxed">
                  {selectedEvent.description}
                </p>

                <div className="pt-1 flex flex-col sm:flex-row sm:items-center gap-2 text-xs">
                  <span className="text-[#8193A0] font-semibold">Physiological Risk:</span>
                  <span className="text-[#E2E9EC]">{selectedEvent.healthRisk}</span>
                </div>
              </div>

              {/* Direct Link to Health Guidance Button */}
              <div className="shrink-0 flex flex-col sm:flex-row items-center gap-2">
                {onNavigateToHealth && (
                  <button
                    onClick={onNavigateToHealth}
                    className="w-full sm:w-auto flex items-center justify-center space-x-2 rounded-xl bg-[#1AA7B5] hover:bg-[#22B8C7] px-4 py-2.5 text-xs font-bold text-white shadow-md transition-all active:scale-95 group"
                  >
                    <HeartPulse className="h-4 w-4 text-white" />
                    <span>View Health Guidance</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </button>
                )}

                <button
                  onClick={() => setSelectedEvent(null)}
                  className="rounded-lg p-1.5 text-[#8193A0] hover:bg-white/10 hover:text-white transition-colors"
                  title="Dismiss detail card"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Multi-Pollutant Comparative Analysis Card */}
      <div className="rounded-2xl border border-[rgba(180,210,220,0.10)] bg-[#111A22] p-5 lg:p-6 space-y-4 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-[#F3F7F8] flex items-center space-x-2">
              <Layers className="h-4 w-4 text-[#22B8C7]" />
              <span>Multi-Pollutant Chemical Interaction Analysis</span>
            </h3>
            <p className="text-xs text-[#8193A0] mt-0.5">
              Correlate particulate accumulation against oxidant precursors over identical intervals.
            </p>
          </div>

          {/* Interactive Legend / Toggles */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {[
              { key: 'pm25' as const, label: 'PM2.5', color: '#EF4444' },
              { key: 'pm10' as const, label: 'PM10', color: '#F97316' },
              { key: 'no2' as const, label: 'NO2', color: '#8B5CF6' },
              { key: 'o3' as const, label: 'O3', color: '#10B981' },
              { key: 'so2' as const, label: 'SO2', color: '#EC4899' },
            ].map(({ key, label, color }) => {
              const active = visiblePollutants[key];
              return (
                <button
                  key={key}
                  onClick={() => togglePollutant(key)}
                  className={`flex items-center space-x-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all ${
                    active
                      ? 'border-[rgba(180,210,220,0.20)] bg-[#182632] text-[#F3F7F8] shadow-sm'
                      : 'border-transparent text-[#566772] opacity-50 hover:opacity-80'
                  }`}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: active ? color : '#566772' }}
                  />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={280}>
            <LineChart
              data={trendData}
              margin={{ top: 10, right: 20, left: -15, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(180, 210, 220, 0.06)" vertical={false} />
              <XAxis dataKey="time" stroke="#6F828E" fontSize={11} tickLine={false} axisLine={{ stroke: 'rgba(180, 210, 220, 0.12)' }} />
              <YAxis stroke="#6F828E" fontSize={11} tickLine={false} domain={[0, 'auto']} axisLine={{ stroke: 'rgba(180, 210, 220, 0.12)' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#121D27',
                  borderColor: 'rgba(180, 210, 220, 0.16)',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: '#F3F7F8',
                }}
              />
              {visiblePollutants.pm25 && (
                <Line
                  type="monotone"
                  dataKey="pm25"
                  name="PM2.5 (µg/m³)"
                  stroke="#EF4444"
                  strokeWidth={2}
                  dot={false}
                />
              )}
              {visiblePollutants.pm10 && (
                <Line
                  type="monotone"
                  dataKey="pm10"
                  name="PM10 (µg/m³)"
                  stroke="#F97316"
                  strokeWidth={2}
                  dot={false}
                />
              )}
              {visiblePollutants.no2 && (
                <Line
                  type="monotone"
                  dataKey="no2"
                  name="NO2 (µg/m³)"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  dot={false}
                />
              )}
              {visiblePollutants.o3 && (
                <Line
                  type="monotone"
                  dataKey="o3"
                  name="O3 (µg/m³)"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={false}
                />
              )}
              {visiblePollutants.so2 && (
                <Line
                  type="monotone"
                  dataKey="so2"
                  name="SO2 (µg/m³)"
                  stroke="#EC4899"
                  strokeWidth={2}
                  dot={false}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Scientific Spectrum Footer */}
        <div className="border-t border-[rgba(180,210,220,0.08)] pt-4 flex flex-wrap items-center justify-between gap-3 text-[11px] text-[#8193A0]">
          <div className="flex items-center space-x-3">
            <span className="font-semibold text-[#B7C5CE]">Biophysical Spectrum:</span>
            <span className="flex items-center space-x-1">
              <span className="h-2 w-2 rounded-full bg-[#16A34A]"></span>
              <span>Good</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="h-2 w-2 rounded-full bg-[#EAB308]"></span>
              <span>Moderate</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="h-2 w-2 rounded-full bg-[#EF4444]"></span>
              <span>Respiratory Risk</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="h-2 w-2 rounded-full bg-[#8B5CF6]"></span>
              <span>Photochemical Trap</span>
            </span>
          </div>

          {onNavigateToHealth && (
            <button
              onClick={onNavigateToHealth}
              className="text-[#22B8C7] hover:text-[#4DD4DF] font-semibold flex items-center space-x-1 transition-colors"
            >
              <span>Explore Clinical Health Protocols</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

