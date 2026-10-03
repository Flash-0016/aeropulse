import React, { useState, useEffect } from 'react';
import { AirStation, AQIStandard, ActiveTab } from './types';
import { INITIAL_STATIONS } from './data/mockAirData';
import { Header } from './components/Header';
import { ContextBar } from './components/ContextBar';
import { HeroAqiGauge } from './components/HeroAqiGauge';
import { PollutantBreakdown } from './components/PollutantBreakdown';
import { LiveAirMap } from './components/LiveAirMap';
import { StationDirectory } from './components/StationDirectory';
import { AnalyticsSection } from './components/AnalyticsSection';
import { PollutionHeatmap } from './components/PollutionHeatmap';
import { WeatherImpact } from './components/WeatherImpact';
import { ForecastSection } from './components/ForecastSection';
import { HealthGuidancePanel } from './components/HealthGuidancePanel';
import { DataQualityAndSource } from './components/DataQualityAndSource';
import { MethodologyModal } from './components/MethodologyModal';
import { AlertsModal } from './components/AlertsModal';
import { ApiKeyModal } from './components/ApiKeyModal';
import { Footer } from './components/Footer';
import { CleanAirCommuteRouter } from './components/CleanAirCommuteRouter';
import { exportStationToCSV } from './utils/airQualityAnalytics';
import { calculateNaqiSubIndex, calculateEpaSubIndex, getAQICategory } from './utils/aqiCalculators';

const USER_API_KEY_STORAGE = 'aeropulse_owm_api_key';

export default function App() {
  const [stations, setStations] = useState<AirStation[]>(INITIAL_STATIONS);
  const [selectedStationId, setSelectedStationId] = useState<string>('delhi-anand-vihar');
  const [standard, setStandard] = useState<AQIStandard>('NAQI');
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [colorBlindMode, setColorBlindMode] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isMethodologyOpen, setIsMethodologyOpen] = useState<boolean>(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState<boolean>(false);
  const [isApiKeyOpen, setIsApiKeyOpen] = useState<boolean>(false);
  const [userApiKey, setUserApiKey] = useState<string>(() => {
    try {
      return localStorage.getItem(USER_API_KEY_STORAGE) || '';
    } catch {
      return '';
    }
  });
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>('Just now');
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'syncing' | 'error'>('connected');
  const [lastPingTime, setLastPingTime] = useState<string>(() => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  });
  const [lastPingLatency, setLastPingLatency] = useState<number | null>(114);

  const currentStation =
    stations.find((s) => s.id === selectedStationId) || stations[0];

  // Fetch live OpenWeatherMap air quality when refreshing
  const fetchLiveAirQuality = async (
    lat: number,
    lon: number,
    stationName?: string,
    overrideKey?: string
  ) => {
    setIsRefreshing(true);
    setConnectionStatus('syncing');
    setRefreshError(null);
    const startTime = performance.now();

    const activeKey = overrideKey !== undefined ? overrideKey : userApiKey;
    const queryParams = new URLSearchParams({
      lat: String(lat),
      lon: String(lon),
    });
    if (activeKey.trim()) {
      queryParams.set('apiKey', activeKey.trim());
    }

    try {
      const headers: Record<string, string> = {};
      if (activeKey.trim()) {
        headers['x-api-key'] = activeKey.trim();
      }

      const res = await fetch(`/api/live-air?${queryParams.toString()}`, { headers });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Live API response failed, maintaining sensor calibration');
      }

      const data = await res.json();
      if (data.success && data.air && data.air.list && data.air.list[0]) {
        const comp = data.air.list[0].components;
        const weather = data.weather || {};
        const wind = weather.wind || {};
        const main = weather.main || {};

        const pm25 = comp.pm2_5 !== undefined ? Number(comp.pm2_5) : currentStation.pollutants.pm25.value;
        const pm10 = comp.pm10 !== undefined ? Number(comp.pm10) : currentStation.pollutants.pm10.value;
        const no2 = comp.no2 !== undefined ? Number(comp.no2) : currentStation.pollutants.no2.value;
        const o3 = comp.o3 !== undefined ? Number(comp.o3) : currentStation.pollutants.o3.value;
        const so2 = comp.so2 !== undefined ? Number(comp.so2) : currentStation.pollutants.so2.value;
        const coMg = comp.co !== undefined ? Number(comp.co) / 1000 : currentStation.pollutants.co.value;
        const nh3 = comp.nh3 !== undefined ? Number(comp.nh3) : (currentStation.pollutants.nh3?.value || 35);
        const pb = currentStation.pollutants.pb?.value || 0.35;

        // Calculate accurate CPCB sub-indices using regulatory piecewise linear breakpoints
        const naqiPm25 = calculateNaqiSubIndex('pm25', pm25);
        const naqiPm10 = calculateNaqiSubIndex('pm10', pm10);
        const naqiNo2 = calculateNaqiSubIndex('no2', no2);
        const naqiO3 = calculateNaqiSubIndex('o3', o3);
        const naqiSo2 = calculateNaqiSubIndex('so2', so2);
        const naqiCo = calculateNaqiSubIndex('co', coMg);
        const naqiNh3 = calculateNaqiSubIndex('nh3', nh3);

        const subIndices: Array<{ code: 'PM2.5' | 'PM10' | 'O3' | 'NO2' | 'SO2' | 'CO' | 'NH3' | 'Pb'; val: number }> = [
          { code: 'PM2.5', val: naqiPm25 },
          { code: 'PM10', val: naqiPm10 },
          { code: 'NO2', val: naqiNo2 },
          { code: 'O3', val: naqiO3 },
          { code: 'SO2', val: naqiSo2 },
          { code: 'CO', val: naqiCo },
          { code: 'NH3', val: naqiNh3 },
        ];

        // Overall IN-NAQI is maximum of sub-indices
        subIndices.sort((a, b) => b.val - a.val);
        const dominant = subIndices[0].code;
        const maxNaqi = Math.max(...subIndices.map((s) => s.val));

        // US-EPA AQI calculation
        const epaPm25 = calculateEpaSubIndex('pm25', pm25);
        const epaPm10 = calculateEpaSubIndex('pm10', pm10);
        const epaO3 = calculateEpaSubIndex('o3', o3);
        const maxEpa = Math.max(epaPm25, epaPm10, epaO3);

        const nowFormatted = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';

        const updatedStation: AirStation = {
          ...currentStation,
          id: stationName ? `custom-${Date.now()}` : currentStation.id,
          name: stationName || currentStation.name,
          lat,
          lon,
          lastCalibrated: nowFormatted,
          aqiNAQI: Math.min(500, Math.max(1, maxNaqi)),
          aqiEPA: Math.min(500, Math.max(1, maxEpa)),
          dominantPollutant: dominant,
          dominantReason: `Live sensor telemetry reporting peak pollutant ${dominant} at ${nowFormatted}.`,
          pollutants: {
            ...currentStation.pollutants,
            pm25: {
              ...currentStation.pollutants.pm25,
              value: Number(pm25.toFixed(1)),
              subIndex: naqiPm25,
              status: getAQICategory(naqiPm25, 'NAQI').label as any,
            },
            pm10: {
              ...currentStation.pollutants.pm10,
              value: Number(pm10.toFixed(1)),
              subIndex: naqiPm10,
              status: getAQICategory(naqiPm10, 'NAQI').label as any,
            },
            no2: {
              ...currentStation.pollutants.no2,
              value: Number(no2.toFixed(1)),
              subIndex: naqiNo2,
              status: getAQICategory(naqiNo2, 'NAQI').label as any,
            },
            o3: {
              ...currentStation.pollutants.o3,
              value: Number(o3.toFixed(1)),
              subIndex: naqiO3,
              status: getAQICategory(naqiO3, 'NAQI').label as any,
            },
            so2: {
              ...currentStation.pollutants.so2,
              value: Number(so2.toFixed(1)),
              subIndex: naqiSo2,
              status: getAQICategory(naqiSo2, 'NAQI').label as any,
            },
            co: {
              ...currentStation.pollutants.co,
              value: Number(coMg.toFixed(2)),
              subIndex: naqiCo,
              status: getAQICategory(naqiCo, 'NAQI').label as any,
            },
            nh3: {
              ...(currentStation.pollutants.nh3 || {
                code: 'NH3',
                name: 'Ammonia',
                unit: 'µg/m³',
                standardLimit24h: 400,
                origin: 'Agricultural fertilizer and waste decomposition',
                healthImpact: 'Precursor to secondary inorganic aerosols',
              }),
              value: Number(nh3.toFixed(1)),
              subIndex: naqiNh3,
              status: getAQICategory(naqiNh3, 'NAQI').label as any,
            },
            pb: {
              ...(currentStation.pollutants.pb || {
                code: 'Pb',
                name: 'Lead (Particulate)',
                unit: 'µg/m³',
                standardLimit24h: 1.0,
                origin: 'Industrial metal fabrication & soil deposition',
                healthImpact: 'Neurotoxic cumulative heavy metal',
              }),
              value: Number(pb.toFixed(2)),
              subIndex: Math.round(pb * 100),
              status: 'Good',
            },
          },
          weather: {
            ...currentStation.weather,
            temp: main.temp !== undefined ? Math.round(main.temp * 10) / 10 : currentStation.weather.temp,
            humidity: main.humidity !== undefined ? main.humidity : currentStation.weather.humidity,
            windSpeed: wind.speed !== undefined ? wind.speed : currentStation.weather.windSpeed,
            windSpeedKmh: wind.speed !== undefined ? Math.round(wind.speed * 3.6) : currentStation.weather.windSpeedKmh,
            windDeg: wind.deg !== undefined ? wind.deg : currentStation.weather.windDeg,
            windGust: wind.gust !== undefined ? wind.gust : currentStation.weather.windGust,
            pressure: main.pressure !== undefined ? main.pressure : currentStation.weather.pressure,
          },
        };

        setStations((prev) => {
          const filtered = prev.filter((s) => s.id !== updatedStation.id);
          return [updatedStation, ...filtered];
        });
        setSelectedStationId(updatedStation.id);
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setLastUpdatedTime(`Live at ${timeStr}`);
        const latency = Math.round(performance.now() - startTime);
        setLastPingLatency(latency);
        setLastPingTime(timeStr);
        setConnectionStatus('connected');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error fetching live data';
      setRefreshError(msg);
      setConnectionStatus('error');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Automatically refresh on mount and whenever selectedStation changes to ensure fresh live data
  useEffect(() => {
    fetchLiveAirQuality(currentStation.lat, currentStation.lon);
  }, [currentStation.id]);

  const handleRefresh = () => {
    fetchLiveAirQuality(currentStation.lat, currentStation.lon);
  };

  const handleSelectStation = (st: AirStation) => {
    setSelectedStationId(st.id);
  };

  const handleSaveApiKey = (key: string) => {
    setUserApiKey(key);
    try {
      if (key) {
        localStorage.setItem(USER_API_KEY_STORAGE, key);
      } else {
        localStorage.removeItem(USER_API_KEY_STORAGE);
      }
    } catch {
      // storage unavailable
    }
    // Instantly refresh with new key
    fetchLiveAirQuality(currentStation.lat, currentStation.lon, undefined, key);
  };

  const handleRemoveApiKey = () => {
    setUserApiKey('');
    try {
      localStorage.removeItem(USER_API_KEY_STORAGE);
    } catch {
      // storage unavailable
    }
    fetchLiveAirQuality(currentStation.lat, currentStation.lon, undefined, '');
  };

  const handleTestKey = async (key: string) => {
    const res = await fetch(`/api/test-key?apiKey=${encodeURIComponent(key)}`, {
      headers: { 'x-api-key': key },
    });
    const data = await res.json();
    return {
      success: !!data.valid,
      message: data.message || (data.valid ? 'API Key verified!' : 'Verification failed'),
    };
  };

  return (
    <div className="min-h-screen bg-[#0B1117] text-[#F3F7F8] selection:bg-[#22B8C7] selection:text-[#0B1117] font-sans antialiased">
      {/* 1. Global Header Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        colorBlindMode={colorBlindMode}
        setColorBlindMode={setColorBlindMode}
        onOpenMethodology={() => setIsMethodologyOpen(true)}
        onOpenAlerts={() => setIsAlertsOpen(true)}
        onOpenApiKey={() => setIsApiKeyOpen(true)}
        onExport={() => exportStationToCSV(currentStation)}
        selectedStation={currentStation}
        hasCustomKey={!!userApiKey.trim()}
        connectionStatus={connectionStatus}
        lastPingTime={lastPingTime}
        lastPingLatency={lastPingLatency}
        onRefresh={handleRefresh}
      />

      {/* 2. Context & Station Selection Sub-bar */}
      <ContextBar
        stations={stations}
        selectedStation={currentStation}
        onSelectStation={handleSelectStation}
        standard={standard}
        onStandardChange={setStandard}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
        lastUpdatedTime={lastUpdatedTime}
        onOpenApiKey={() => setIsApiKeyOpen(true)}
        isCustomKeyActive={!!userApiKey.trim()}
      />

      {/* Live Refresh Notification Banner if Error */}
      {refreshError && (
        <div className="mx-auto max-w-7xl px-4 pt-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between rounded-xl border border-[rgba(249,115,22,0.35)] bg-[rgba(249,115,22,0.12)] p-3 text-xs text-[#FB923C]">
            <span>{refreshError}. Displaying calibrated ambient station readings.</span>
            <button
              onClick={() => setIsApiKeyOpen(true)}
              className="ml-3 underline hover:text-white shrink-0 font-semibold"
            >
              Configure API Key
            </button>
          </div>
        </div>
      )}

      {/* 3. Main Body Content Area */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-8">
        
        {/* Tab 1: Comprehensive Air Quality Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in-50 duration-300">
            {/* Hero AQI Circular Gauge & Health Impact Card */}
            <HeroAqiGauge
              station={currentStation}
              standard={standard}
              colorBlindMode={colorBlindMode}
              onViewFullHealth={() => setActiveTab('health')}
            />

            {/* 8-Pollutant Breakdown Matrix */}
            <PollutantBreakdown
              station={currentStation}
              standard={standard}
              colorBlindMode={colorBlindMode}
            />

            {/* Environmental GIS Map */}
            <LiveAirMap
              stations={stations}
              selectedStation={currentStation}
              onSelectStation={handleSelectStation}
              standard={standard}
              colorBlindMode={colorBlindMode}
            />

            {/* Atmospheric Trend & Multi-pollutant Comparison */}
            <AnalyticsSection
              station={currentStation}
              standard={standard}
              colorBlindMode={colorBlindMode}
              onNavigateToHealth={() => setActiveTab('health')}
            />

            {/* 24-Hour Pollution Diurnal Heatmap */}
            <PollutionHeatmap
              station={currentStation}
              colorBlindMode={colorBlindMode}
            />

            {/* Weather + Dispersion Dynamics */}
            <WeatherImpact station={currentStation} />

            {/* 5-Day Numerical Dispersion Forecast */}
            <ForecastSection
              station={currentStation}
              standard={standard}
              colorBlindMode={colorBlindMode}
            />

            {/* Monitoring Stations Directory */}
            <StationDirectory
              stations={stations}
              selectedStation={currentStation}
              onSelectStation={handleSelectStation}
              standard={standard}
              colorBlindMode={colorBlindMode}
            />

            {/* Commute Routing Optimization */}
            <div className="space-y-3">
              <h3 className="text-base font-bold text-white tracking-tight">
                Exposure-Aware Commute Planning
              </h3>
              <CleanAirCommuteRouter />
            </div>

            {/* Data Quality & Source Provenance */}
            <DataQualityAndSource
              station={currentStation}
              onOpenMethodology={() => setIsMethodologyOpen(true)}
            />
          </div>
        )}

        {/* Tab 2: Full-height Interactive GIS Environmental Map */}
        {activeTab === 'map' && (
          <div className="space-y-6 animate-in fade-in-50 duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white">
                  Interactive Atmospheric GIS Map
                </h2>
                <p className="text-xs text-slate-400">
                  Global station network with wind vector streamlines and chemical plume dispersion layers.
                </p>
              </div>
            </div>

            <LiveAirMap
              stations={stations}
              selectedStation={currentStation}
              onSelectStation={handleSelectStation}
              standard={standard}
              colorBlindMode={colorBlindMode}
              standalone={true}
            />

            <StationDirectory
              stations={stations}
              selectedStation={currentStation}
              onSelectStation={handleSelectStation}
              standard={standard}
              colorBlindMode={colorBlindMode}
            />
          </div>
        )}

        {/* Tab 3: Station Directory */}
        {activeTab === 'stations' && (
          <div className="space-y-6 animate-in fade-in-50 duration-300">
            <StationDirectory
              stations={stations}
              selectedStation={currentStation}
              onSelectStation={handleSelectStation}
              standard={standard}
              colorBlindMode={colorBlindMode}
            />

            <DataQualityAndSource
              station={currentStation}
              onOpenMethodology={() => setIsMethodologyOpen(true)}
            />
          </div>
        )}

        {/* Tab 4: Analytics Deep Dive */}
        {activeTab === 'analytics' && (
          <div className="space-y-8 animate-in fade-in-50 duration-300">
            <AnalyticsSection
              station={currentStation}
              standard={standard}
              colorBlindMode={colorBlindMode}
              onNavigateToHealth={() => setActiveTab('health')}
            />

            <PollutionHeatmap
              station={currentStation}
              colorBlindMode={colorBlindMode}
            />

            <WeatherImpact station={currentStation} />
          </div>
        )}

        {/* Tab 5: 5-Day Outlook */}
        {activeTab === 'forecast' && (
          <div className="space-y-8 animate-in fade-in-50 duration-300">
            <ForecastSection
              station={currentStation}
              standard={standard}
              colorBlindMode={colorBlindMode}
            />

            <WeatherImpact station={currentStation} />

            <AnalyticsSection
              station={currentStation}
              standard={standard}
              colorBlindMode={colorBlindMode}
              onNavigateToHealth={() => setActiveTab('health')}
            />
          </div>
        )}


        {/* Tab 6: Public Health Advisory */}
        {activeTab === 'health' && (
          <div className="space-y-8 animate-in fade-in-50 duration-300">
            <HealthGuidancePanel
              station={currentStation}
              standard={standard}
              colorBlindMode={colorBlindMode}
            />

            <HeroAqiGauge
              station={currentStation}
              standard={standard}
              colorBlindMode={colorBlindMode}
              onViewFullHealth={() => {}}
            />

            <PollutantBreakdown
              station={currentStation}
              standard={standard}
              colorBlindMode={colorBlindMode}
            />
          </div>
        )}

        {/* Tab 7: Reports & Data Export */}
        {activeTab === 'reports' && (
          <div className="space-y-8 animate-in fade-in-50 duration-300">
            <DataQualityAndSource
              station={currentStation}
              onOpenMethodology={() => setIsMethodologyOpen(true)}
            />

            <StationDirectory
              stations={stations}
              selectedStation={currentStation}
              onSelectStation={handleSelectStation}
              standard={standard}
              colorBlindMode={colorBlindMode}
            />
          </div>
        )}
      </main>

      {/* Science & Methodology Modal */}
      <MethodologyModal
        isOpen={isMethodologyOpen}
        onClose={() => setIsMethodologyOpen(false)}
      />

      {/* Environmental Threshold Alerts Modal */}
      <AlertsModal
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
        stations={stations}
        standard={standard}
        onSelectStation={handleSelectStation}
      />

      {/* Live Air API Key Configuration Modal */}
      <ApiKeyModal
        isOpen={isApiKeyOpen}
        onClose={() => setIsApiKeyOpen(false)}
        apiKey={userApiKey}
        onSaveKey={handleSaveApiKey}
        onRemoveKey={handleRemoveApiKey}
        onTestKey={handleTestKey}
      />

      {/* Global Footer */}
      <Footer
        onNavigate={setActiveTab}
        onOpenMethodology={() => setIsMethodologyOpen(true)}
        onOpenApiKey={() => setIsApiKeyOpen(true)}
      />
    </div>
  );
}
