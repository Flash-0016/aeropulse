export type AQIStandard = 'NAQI' | 'EPA';

export type DominantPollutant = 'PM2.5' | 'PM10' | 'O3' | 'NO2' | 'SO2' | 'CO' | 'NH3' | 'Pb';

export type ActiveTab = 'dashboard' | 'map' | 'stations' | 'analytics' | 'forecast' | 'health' | 'reports';

export type StationStatusFilter = 'All' | 'Good' | 'Satisfactory' | 'Moderate' | 'Poor' | 'Very Poor' | 'Severe';

export type StationSortOption = 'aqi-desc' | 'aqi-asc' | 'name' | 'last-updated';

export interface ForecastDay {
  date: string;
  dayLabel: string;
  predictedAqi: number;
  category: 'Good' | 'Satisfactory' | 'Moderate' | 'Poor' | 'Very Poor' | 'Severe';
  primaryPollutant: string;
  tempHigh: number;
  tempLow: number;
  weatherCondition: string;
  windSpeedKmh: number;
  trend: 'improving' | 'worsening' | 'stable';
  confidence: number;
  synopsis: string;
}

export interface PollutantDetail {
  code: string;
  name: string;
  value: number; // in µg/m³ (or mg/m³ for CO)
  unit: string;
  subIndex: number;
  status: 'Good' | 'Satisfactory' | 'Moderate' | 'Poor' | 'Very Poor' | 'Severe';
  standardLimit24h: number;
  origin: string;
  healthImpact: string;
}

export interface AirStation {
  id: string;
  name: string;
  city: string;
  country: string;
  lat: number;
  lon: number;
  provider: 'CPCB' | 'US-EPA' | 'OpenWeather' | 'EEA';
  stationCode: string;
  sensorModel: string;
  lastCalibrated: string;
  calibrationStatus?: string;
  calibrationDrift: number; // e.g. 0.18%
  confidenceScore: number; // e.g. 99.4%
  aqiNAQI: number;
  aqiEPA: number;
  dominantPollutant: DominantPollutant;
  dominantReason: string;
  pollutants: Record<string, PollutantDetail>;
  weather: {
    temp: number; // Celsius
    humidity: number; // %
    windSpeed: number; // m/s
    windSpeedKmh: number; // km/h
    windDeg: number; // degrees
    windGust: number; // m/s
    pressure: number; // hPa
    visibility: number; // meters
    boundaryLayerHeight: number; // meters
    inversionStrength: number; // 0 - 100
    ventilationIndex: number; // m²/s
  };
}

export interface CommuteRoute {
  id: string;
  title: string;
  type: 'highway' | 'green_corridor' | 'transit_eco';
  distanceKm: number;
  durationMins: number;
  avgAqi: number;
  pm25ExposureUcg: number; // Micrograms inhaled
  pathPoints: Array<{ x: number; y: number; aqi: number; label?: string }>;
  description: string;
  tags: string[];
  shieldingFactor: string; // e.g. "Canopy foliage traps 45% of particulates"
}

export interface InversionProfile {
  groundTemp: number; // °C
  aloftTemp: number; // °C at 600m
  inversionHeightMeters: number;
  trappingIndex: number; // 0 - 100
  status: 'Severe Capping' | 'Moderate Trapping' | 'Neutral Transition' | 'Free Dispersion';
  lapseRate: number; // °C / 100m
  ventilationCoeff: number; // m²/s
  description: string;
  atmosphericLayers: Array<{
    altitudeM: number;
    tempC: number;
    particulateDensity: number; // 0-100%
  }>;
}

export interface TelemetryData {
  pipelineStatus: 'OPERATIONAL' | 'DEGRADED' | 'MAINTENANCE';
  uptimePercentage: number;
  ingestRatePerSec: number;
  activeNodesCount: number;
  lastSyncTimestamp: string;
  sensorDriftAvg: number;
  networkLatencyMs: number;
  cpcbDataRelayMs: number;
  packetsDropped24h: number;
  validationChecksum: string;
}

export interface HealthGuideline {
  levelName: string;
  color: string;
  textColor: string;
  generalPublic: string;
  sensitiveGroups: string;
  outdoorAthletics: {
    allowed: boolean;
    recommendation: string;
  };
  maskRequired: {
    needed: boolean;
    type: string;
    details: string;
  };
  indoorVentilation: {
    openWindows: boolean;
    hepaACH: number;
    guidance: string;
  };
}
