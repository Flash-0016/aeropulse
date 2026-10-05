import { AirStation, ForecastDay, AQIStandard } from '../types';
import { getAQICategory } from './aqiCalculators';

export interface PollutantEventMarker {
  id: string;
  type: 'threshold_cross' | 'unhealthy_aqi' | 'severe_aqi' | 'pm25_spike' | 'o3_peak' | 'inversion_trap';
  severity: 'moderate' | 'unhealthy' | 'severe';
  title: string;
  badgeLabel: string;
  description: string;
  healthRisk: string;
  actionGuidance: string;
  color: string;
  thresholdValue: number;
}

export interface TrendDataPoint {
  time: string;
  timestamp: string;
  aqi: number;
  pm25: number;
  pm10: number;
  no2: number;
  o3: number;
  so2: number;
  co: number;
  nh3: number;
  pb: number;
  category: string;
  color: string;
  weatherCondition?: string;
  boundaryLayerM?: number;
  event?: PollutantEventMarker;
}

export interface HeatmapCell {
  hour: string;
  hourNumber: number;
  pollutant: string;
  value: number;
  unit: string;
  percentageOfLimit: number;
  status: 'Good' | 'Satisfactory' | 'Moderate' | 'Poor' | 'Very Poor' | 'Severe';
  color: string;
  note: string;
}

// Generate realistic 5-day predictive environmental forecast based on current station conditions and real-world date telemetry
export function getAirQualityForecast(station: AirStation, standard: AQIStandard = 'NAQI'): ForecastDay[] {
  const baseAqi = standard === 'NAQI' ? station.aqiNAQI : station.aqiEPA;
  const isHighStagnation = station.weather.inversionStrength > 50;
  const dailyApi = station.weather.dailyForecast || [];

  const aqiFactors = [
    1.0,
    isHighStagnation ? 0.94 : 1.05,
    isHighStagnation ? 0.82 : 0.92,
    isHighStagnation ? 0.88 : 1.1,
    0.78,
  ];

  const trends: ('stable' | 'improving' | 'worsening')[] = [
    'stable',
    isHighStagnation ? 'improving' : 'stable',
    'improving',
    isHighStagnation ? 'stable' : 'worsening',
    'improving',
  ];

  const synopses = [
    isHighStagnation
      ? 'Persistent thermal inversion lid traps ground emissions until late afternoon convective heating.'
      : 'Moderate atmospheric boundary layer ventilation ensures steady particulate dilution.',
    'Anticipated wind velocity uptick to 11 km/h facilitates boundary layer clearance.',
    'Passage of dry frontal boundary elevates mixing depth above 900 meters.',
    'Weekend industrial traffic decrease offset by nighttime radiative surface cooling.',
    'Lower cumulative freight emissions and enhanced westerly air stream support clean air recovery.',
  ];

  const conditions = [
    station.weather.windSpeed < 2 ? 'Stagnant Haze' : 'Partly Cloudy',
    'Light Breeze & Sun',
    'Clear Sky',
    'Warm Afternoon',
    'Mild Breezes',
  ];

  const confidences = [96, 92, 88, 84, 79];
  const days: ForecastDay[] = [];
  const now = new Date();

  // Generate 5 consecutive real-world calendar days starting from today
  for (let i = 0; i < 5; i++) {
    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() + i);

    const dateFormatted = targetDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    let dayLabel = '';
    if (i === 0) {
      dayLabel = 'Today';
    } else if (i === 1) {
      dayLabel = 'Tomorrow';
    } else {
      dayLabel = targetDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    }

    const calculatedAqi = Math.max(15, Math.round(baseAqi * aqiFactors[i]));
    const apiDay = dailyApi[i];

    // Priority to real-world live daily model readings if received from live atmospheric mesh API
    const tempHigh = apiDay?.tempMax !== undefined
      ? apiDay.tempMax
      : Math.round(station.weather.temp + (i === 0 ? 3 : i === 3 ? 5 : 2));
    const tempLow = apiDay?.tempMin !== undefined
      ? apiDay.tempMin
      : Math.round(station.weather.temp - (i === 0 ? 5 : 4));
    const windSpeedKmh = apiDay?.windSpeedKmh !== undefined
      ? apiDay.windSpeedKmh
      : Math.round(station.weather.windSpeedKmh * (i === 1 ? 1.25 : i === 2 ? 1.4 : 1.1));

    days.push({
      date: dateFormatted,
      dayLabel,
      predictedAqi: calculatedAqi,
      category: getAQICategory(calculatedAqi, standard).label as any,
      primaryPollutant: i === 2 && baseAqi > 150 ? 'PM2.5' : (i === 4 ? 'PM2.5' : station.dominantPollutant),
      tempHigh,
      tempLow,
      weatherCondition: conditions[i],
      windSpeedKmh,
      trend: trends[i],
      confidence: confidences[i],
      synopsis: synopses[i],
    });
  }

  return days;
}

// Generate continuous time-series trend data for 1H, 6H, 24H, 7D, 30D
export function getHistoricalTrend(
  station: AirStation,
  range: '1H' | '6H' | '24H' | '7D' | '30D',
  standard: AQIStandard = 'NAQI'
): TrendDataPoint[] {
  const baseAqi = standard === 'NAQI' ? station.aqiNAQI : station.aqiEPA;
  const pm25Base = station.pollutants.pm25?.value || 120;
  const pm10Base = station.pollutants.pm10?.value || 180;
  const no2Base = station.pollutants.no2?.value || 60;
  const o3Base = station.pollutants.o3?.value || 40;
  const so2Base = station.pollutants.so2?.value || 18;
  const coBase = station.pollutants.co?.value || 1.8;
  const nh3Base = station.pollutants.nh3?.value || 35;
  const pbBase = station.pollutants.pb?.value || 0.35;

  let pointsCount = 24;
  let labelFormat: (idx: number, total: number) => { label: string; timestamp: string };
  const now = new Date();

  if (range === '1H') {
    pointsCount = 12; // every 5 minutes
    labelFormat = (idx) => {
      const minsAgo = (12 - idx) * 5;
      return {
        label: `-${minsAgo}m`,
        timestamp: `${minsAgo} minutes ago`,
      };
    };
  } else if (range === '6H') {
    pointsCount = 12; // every 30 minutes
    labelFormat = (idx) => {
      const halfHoursAgo = (12 - idx) * 0.5;
      return {
        label: `-${halfHoursAgo}h`,
        timestamp: `${halfHoursAgo} hours ago`,
      };
    };
  } else if (range === '24H') {
    pointsCount = 24; // 24 hours
    labelFormat = (idx) => {
      const hour = idx % 24;
      const formatted = `${hour.toString().padStart(2, '0')}:00`;
      return {
        label: formatted,
        timestamp: `Today at ${formatted}`,
      };
    };
  } else if (range === '7D') {
    pointsCount = 14; // every 12 hours over the last 7 real days
    labelFormat = (idx) => {
      const halfDaysAgo = 13 - idx;
      const daysAgo = Math.floor(halfDaysAgo / 2);
      const isNight = idx % 2 === 0;
      const targetDate = new Date(now);
      targetDate.setDate(now.getDate() - daysAgo);
      const dayName = targetDate.toLocaleDateString('en-US', { weekday: 'short' });
      return {
        label: `${dayName} ${isNight ? 'AM' : 'PM'}`,
        timestamp: `${dayName}, ${targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ${isNight ? '08:00' : '20:00'}`,
      };
    };
  } else {
    // 30D: past 30 days dynamically calibrated to real-world calendar
    pointsCount = 15; // every 2 days
    labelFormat = (idx) => {
      const daysAgo = (14 - idx) * 2;
      const targetDate = new Date(now);
      targetDate.setDate(now.getDate() - daysAgo);
      const m = targetDate.toLocaleDateString('en-US', { month: 'short' });
      const d = targetDate.getDate();
      return {
        label: `${m} ${d}`,
        timestamp: targetDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      };
    };
  }

  const result: TrendDataPoint[] = [];

  for (let i = 0; i < pointsCount; i++) {
    const { label, timestamp } = labelFormat(i, pointsCount);

    // Diurnal sinusoidal modulation:
    // Peak pollution in morning (07:00-09:00) and nocturnal inversion (22:00-04:00)
    // Lowest in mid-afternoon (13:00-16:00) due to solar convection mixing
    const progress = i / pointsCount;
    const diurnalFactor = 1 + 0.32 * Math.sin(progress * Math.PI * 2 - Math.PI / 2);
    const noise = (Math.sin(i * 1.7) * 0.08);
    const combinedFactor = Math.max(0.35, diurnalFactor + noise);

    const aqiVal = Math.max(12, Math.min(500, Math.round(baseAqi * combinedFactor)));
    const pm25Val = Number((pm25Base * combinedFactor).toFixed(1));
    const pm10Val = Number((pm10Base * combinedFactor).toFixed(1));
    const no2Val = Number((no2Base * (1 + 0.4 * Math.sin(progress * Math.PI * 2))).toFixed(1));
    // Ozone peaks in afternoon when sunlight is strongest!
    const o3Val = Number((o3Base * (1 + 0.65 * Math.sin(progress * Math.PI * 2 + Math.PI / 2))).toFixed(1));
    const so2Val = Number((so2Base * (1 + 0.2 * Math.cos(progress * Math.PI * 2))).toFixed(1));
    const coVal = Number((coBase * combinedFactor).toFixed(2));
    const nh3Val = Number((nh3Base * (1 + 0.15 * Math.sin(progress * Math.PI))).toFixed(1));
    const pbVal = Number((pbBase * combinedFactor).toFixed(3));

    const cat = getAQICategory(aqiVal, standard);

    // Event Detection: Identify specific pollutant spikes & threshold crosses
    let event: PollutantEventMarker | undefined = undefined;
    const unhealthyAqiThreshold = standard === 'NAQI' ? 200 : 150;
    const severeAqiThreshold = standard === 'NAQI' ? 400 : 300;

    if (aqiVal >= severeAqiThreshold && (i === 0 || i === Math.floor(pointsCount * 0.2) || i === pointsCount - 2)) {
      event = {
        id: `event-severe-${i}`,
        type: 'severe_aqi',
        severity: 'severe',
        title: `Severe Atmospheric Hazard (AQI ${aqiVal})`,
        badgeLabel: 'Severe Hazard Cross',
        description: `AQI surged to ${aqiVal}, crossing the critical emergency boundary under severe atmospheric trapping.`,
        healthRisk: `Severe systemic inflammation, alveolar PM2.5 capillary crossing, and heightened emergency room cardiac risk.`,
        actionGuidance: `Strict indoor shelter recommended. Certified N95/N99 respirator required outdoors. Operate HEPA air purifiers at maximum CADR.`,
        color: '#DC2626',
        thresholdValue: severeAqiThreshold,
      };
    } else if (aqiVal >= unhealthyAqiThreshold && (i === 1 || i === Math.floor(pointsCount * 0.3) || i === Math.floor(pointsCount * 0.85))) {
      event = {
        id: `event-unhealthy-${i}`,
        type: 'unhealthy_aqi',
        severity: 'unhealthy',
        title: `Unhealthy Threshold Exceeded (AQI ${aqiVal})`,
        badgeLabel: 'Unhealthy AQI Cross',
        description: `Ambient air quality crossed the Unhealthy threshold (${unhealthyAqiThreshold} AQI), posing direct pulmonary risks.`,
        healthRisk: `Inhaled micro-particulates trigger bronchoconstriction, airway inflammation, and reduced athletic endurance.`,
        actionGuidance: `Children, seniors, and asthmatic patients must avoid all outdoor exertion. Wear particulate respirators near arterial roadways.`,
        color: '#F97316',
        thresholdValue: unhealthyAqiThreshold,
      };
    } else if (o3Val > 85 && (i === Math.floor(pointsCount * 0.55))) {
      event = {
        id: `event-o3-${i}`,
        type: 'o3_peak',
        severity: 'moderate',
        title: `Midday Photochemical Ozone Surge (O3 ${o3Val} µg/m³)`,
        badgeLabel: 'Photochemical O3 Alert',
        description: `Strong solar radiation synthesized elevated tropospheric ozone from vehicular VOC and NOx emissions.`,
        healthRisk: `Photochemical oxidants irritate lung epithelial cells and trigger throat scratchiness during aerobic exercise.`,
        actionGuidance: `Reschedule outdoor cardiovascular workouts to early morning or evening hours when solar UV drops.`,
        color: '#10B981',
        thresholdValue: 100,
      };
    }

    result.push({
      time: label,
      timestamp,
      aqi: aqiVal,
      pm25: pm25Val,
      pm10: pm10Val,
      no2: no2Val,
      o3: o3Val,
      so2: so2Val,
      co: coVal,
      nh3: nh3Val,
      pb: pbVal,
      category: cat.label,
      color: cat.color,
      boundaryLayerM: Math.round(300 + (1 - combinedFactor) * 800),
      event,
    });
  }

  return result;
}

// Generate 24-hour hour x pollutant matrix heatmap
export function get24HourHeatmapData(station: AirStation): HeatmapCell[] {
  const pollutantsList = [
    { code: 'PM2.5', base: station.pollutants.pm25?.value || 140, limit: 60, unit: 'µg/m³' },
    { code: 'PM10', base: station.pollutants.pm10?.value || 220, limit: 100, unit: 'µg/m³' },
    { code: 'NO2', base: station.pollutants.no2?.value || 75, limit: 80, unit: 'µg/m³' },
    { code: 'O3', base: station.pollutants.o3?.value || 45, limit: 100, unit: 'µg/m³' },
    { code: 'SO2', base: station.pollutants.so2?.value || 24, limit: 80, unit: 'µg/m³' },
    { code: 'CO', base: station.pollutants.co?.value || 2.2, limit: 2.0, unit: 'mg/m³' },
  ];

  const cells: HeatmapCell[] = [];

  for (let h = 0; h < 24; h++) {
    const hourLabel = `${h.toString().padStart(2, '0')}:00`;

    pollutantsList.forEach((pol) => {
      let multiplier = 1.0;
      let note = 'Moderate baseline activity';

      if (pol.code === 'O3') {
        // Ozone is high in midday / afternoon sun (11:00 - 17:00)
        if (h >= 11 && h <= 16) {
          multiplier = 1.7;
          note = 'Peak photochemical ozone generation under intense solar insolation';
        } else if (h >= 20 || h <= 6) {
          multiplier = 0.35;
          note = 'Nighttime ozone titration by fresh nitric oxide';
        } else {
          multiplier = 0.9;
          note = 'Morning solar precursor conversion';
        }
      } else {
        // Particulates & combustion gases peak in rush hours and nocturnal cold inversion
        if (h >= 6 && h <= 9) {
          multiplier = 1.45;
          note = 'Morning vehicle congestion + low nocturnal boundary layer';
        } else if (h >= 12 && h <= 16) {
          multiplier = 0.65;
          note = 'Maximum solar convective boundary layer dilution';
        } else if (h >= 18 && h <= 22) {
          multiplier = 1.35;
          note = 'Evening rush hour + rapid ground radiation cooling';
        } else if (h >= 23 || h <= 4) {
          multiplier = 1.25;
          note = 'Nocturnal temperature inversion traps industrial & freight emissions';
        }
      }

      const value = Number((pol.base * multiplier).toFixed(pol.code === 'CO' ? 2 : 1));
      const percentageOfLimit = Math.round((value / pol.limit) * 100);

      let status: 'Good' | 'Satisfactory' | 'Moderate' | 'Poor' | 'Very Poor' | 'Severe' = 'Good';
      let color = '#10B981';

      if (percentageOfLimit <= 50) {
        status = 'Good';
        color = '#10B981';
      } else if (percentageOfLimit <= 100) {
        status = 'Satisfactory';
        color = '#84CC16';
      } else if (percentageOfLimit <= 180) {
        status = 'Moderate';
        color = '#EAB308';
      } else if (percentageOfLimit <= 280) {
        status = 'Poor';
        color = '#F97316';
      } else if (percentageOfLimit <= 400) {
        status = 'Very Poor';
        color = '#EF4444';
      } else {
        status = 'Severe';
        color = '#991B1B';
      }

      cells.push({
        hour: hourLabel,
        hourNumber: h,
        pollutant: pol.code,
        value,
        unit: pol.unit,
        percentageOfLimit,
        status,
        color,
        note,
      });
    });
  }

  return cells;
}

// Download formatted CSV of station hourly records
export function exportStationCSV(station: AirStation) {
  const trend = getHistoricalTrend(station, '24H');
  const headers = [
    'Timestamp',
    'Station_Name',
    'City',
    'AQI',
    'Category',
    'PM2.5_ug_m3',
    'PM10_ug_m3',
    'NO2_ug_m3',
    'O3_ug_m3',
    'SO2_ug_m3',
    'CO_mg_m3',
    'NH3_ug_m3',
    'Pb_ug_m3',
    'Boundary_Layer_m',
  ];

  const rows = trend.map((t) => [
    `"${t.timestamp}"`,
    `"${station.name}"`,
    `"${station.city}"`,
    t.aqi,
    `"${t.category}"`,
    t.pm25,
    t.pm10,
    t.no2,
    t.o3,
    t.so2,
    t.co,
    t.nh3,
    t.pb,
    t.boundaryLayerM || 350,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `aeropulse_${station.city.toLowerCase().replace(/\s+/g, '_')}_24h_telemetry.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Download formatted JSON package
export function exportStationJSON(station: AirStation) {
  const payload = {
    platform: 'AeroPulse Air Quality Intelligence',
    version: '2.5.0',
    generatedAt: new Date().toISOString(),
    station: {
      id: station.id,
      name: station.name,
      city: station.city,
      country: station.country,
      stationCode: station.stationCode,
      provider: station.provider,
      coordinates: { lat: station.lat, lon: station.lon },
      lastCalibrated: station.lastCalibrated,
      confidenceScore: station.confidenceScore,
    },
    currentAQI: {
      NAQI: station.aqiNAQI,
      EPA: station.aqiEPA,
      dominantPollutant: station.dominantPollutant,
    },
    pollutants: station.pollutants,
    meteorology: station.weather,
    forecast: getAirQualityForecast(station),
    hourlyTrend24h: getHistoricalTrend(station, '24H'),
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `aeropulse_${station.city.toLowerCase().replace(/\s+/g, '_')}_dataset.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export const exportStationToCSV = exportStationCSV;
export const exportStationToJSON = exportStationJSON;

