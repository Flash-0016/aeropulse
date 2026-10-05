import { AQIStandard, DominantPollutant, HealthGuideline } from '../types';

export interface AQICategory {
  label: string;
  min: number;
  max: number;
  color: string;
  bgLight: string;
  borderColor: string;
  textColor: string;
  badgeBg: string;
  description: string;
}

export const NAQI_CATEGORIES: AQICategory[] = [
  {
    label: 'Good',
    min: 0,
    max: 50,
    color: '#16A34A',
    bgLight: 'rgba(22, 163, 74, 0.12)',
    borderColor: 'rgba(22, 163, 74, 0.35)',
    textColor: '#4ADE80',
    badgeBg: 'bg-[rgba(22,163,74,0.12)] text-[#4ADE80] border border-[rgba(22,163,74,0.35)]',
    description: 'Minimal impact. Air quality is considered satisfactory.',
  },
  {
    label: 'Satisfactory',
    min: 51,
    max: 100,
    color: '#84CC16',
    bgLight: 'rgba(132, 204, 22, 0.12)',
    borderColor: 'rgba(132, 204, 22, 0.35)',
    textColor: '#A3E635',
    badgeBg: 'bg-[rgba(132,204,22,0.12)] text-[#A3E635] border border-[rgba(132,204,22,0.35)]',
    description: 'Minor breathing discomfort to sensitive people.',
  },
  {
    label: 'Moderate',
    min: 101,
    max: 200,
    color: '#EAB308',
    bgLight: 'rgba(234, 179, 8, 0.12)',
    borderColor: 'rgba(234, 179, 8, 0.35)',
    textColor: '#FACC15',
    badgeBg: 'bg-[rgba(234,179,8,0.12)] text-[#FACC15] border border-[rgba(234,179,8,0.35)]',
    description: 'Breathing discomfort to people with lung disease, asthma, and children.',
  },
  {
    label: 'Poor',
    min: 201,
    max: 300,
    color: '#F97316',
    bgLight: 'rgba(249, 115, 22, 0.12)',
    borderColor: 'rgba(249, 115, 22, 0.35)',
    textColor: '#FB923C',
    badgeBg: 'bg-[rgba(249,115,22,0.12)] text-[#FB923C] border border-[rgba(249,115,22,0.35)]',
    description: 'Breathing discomfort to most people on prolonged exposure.',
  },
  {
    label: 'Very Poor',
    min: 301,
    max: 400,
    color: '#EF4444',
    bgLight: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.35)',
    textColor: '#F87171',
    badgeBg: 'bg-[rgba(239,68,68,0.12)] text-[#F87171] border border-[rgba(239,68,68,0.35)]',
    description: 'Respiratory illness to the people on prolonged exposure. Significant risk.',
  },
  {
    label: 'Severe',
    min: 401,
    max: 500,
    color: '#991B1B',
    bgLight: 'rgba(153, 27, 27, 0.16)',
    borderColor: 'rgba(153, 27, 27, 0.40)',
    textColor: '#FCA5A5',
    badgeBg: 'bg-[rgba(153,27,27,0.16)] text-[#FCA5A5] border border-[rgba(153,27,27,0.40)]',
    description: 'Affects healthy people and seriously impacts those with existing diseases.',
  },
];

export const EPA_CATEGORIES: AQICategory[] = [
  {
    label: 'Good',
    min: 0,
    max: 50,
    color: '#16A34A',
    bgLight: 'rgba(22, 163, 74, 0.12)',
    borderColor: 'rgba(22, 163, 74, 0.35)',
    textColor: '#4ADE80',
    badgeBg: 'bg-[rgba(22,163,74,0.12)] text-[#4ADE80] border border-[rgba(22,163,74,0.35)]',
    description: 'Air quality is satisfactory and poses little or no risk.',
  },
  {
    label: 'Moderate',
    min: 51,
    max: 100,
    color: '#EAB308',
    bgLight: 'rgba(234, 179, 8, 0.12)',
    borderColor: 'rgba(234, 179, 8, 0.35)',
    textColor: '#FACC15',
    badgeBg: 'bg-[rgba(234,179,8,0.12)] text-[#FACC15] border border-[rgba(234,179,8,0.35)]',
    description: 'Acceptable; however, sensitive individuals may experience minor symptoms.',
  },
  {
    label: 'Unhealthy for Sensitive Groups',
    min: 101,
    max: 150,
    color: '#F97316',
    bgLight: 'rgba(249, 115, 22, 0.12)',
    borderColor: 'rgba(249, 115, 22, 0.35)',
    textColor: '#FB923C',
    badgeBg: 'bg-[rgba(249,115,22,0.12)] text-[#FB923C] border border-[rgba(249,115,22,0.35)]',
    description: 'Members of sensitive groups may experience health effects.',
  },
  {
    label: 'Unhealthy',
    min: 151,
    max: 200,
    color: '#EF4444',
    bgLight: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.35)',
    textColor: '#F87171',
    badgeBg: 'bg-[rgba(239,68,68,0.12)] text-[#F87171] border border-[rgba(239,68,68,0.35)]',
    description: 'Some members of the general public may experience health effects.',
  },
  {
    label: 'Very Unhealthy',
    min: 201,
    max: 300,
    color: '#8B5CF6',
    bgLight: 'rgba(139, 92, 246, 0.12)',
    borderColor: 'rgba(139, 92, 246, 0.35)',
    textColor: '#C4B5FD',
    badgeBg: 'bg-[rgba(139,92,246,0.12)] text-[#C4B5FD] border border-[rgba(139,92,246,0.35)]',
    description: 'Health alert: The risk of health effects is increased for everyone.',
  },
  {
    label: 'Hazardous',
    min: 301,
    max: 500,
    color: '#991B1B',
    bgLight: 'rgba(153, 27, 27, 0.16)',
    borderColor: 'rgba(153, 27, 27, 0.40)',
    textColor: '#FCA5A5',
    badgeBg: 'bg-[rgba(153,27,27,0.16)] text-[#FCA5A5] border border-[rgba(153,27,27,0.40)]',
    description: 'Health warning of emergency conditions: entire population likely affected.',
  },
];


export const ACCESSIBLE_PALETTE: Record<string, { color: string; textColor: string }> = {
  Good: { color: '#2B83BA', textColor: '#7DBBC4' },
  Satisfactory: { color: '#7DBBC4', textColor: '#A5D6DC' },
  Moderate: { color: '#EDDA5B', textColor: '#FCEB82' },
  'Unhealthy for Sensitive Groups': { color: '#FDAE61', textColor: '#FED49B' },
  Poor: { color: '#FDAE61', textColor: '#FED49B' },
  Unhealthy: { color: '#E05342', textColor: '#F19588' },
  'Very Poor': { color: '#E05342', textColor: '#F19588' },
  'Very Unhealthy': { color: '#7B113A', textColor: '#D47595' },
  Hazardous: { color: '#7B113A', textColor: '#D47595' },
  Severe: { color: '#7B113A', textColor: '#D47595' },
};

// Linear interpolation formula: I_p = ((I_hi - I_lo) / (BP_hi - BP_lo)) * (C_p - BP_lo) + I_lo
function interpolateSubIndex(
  conc: number,
  bp: Array<{ cLow: number; cHigh: number; iLow: number; iHigh: number }>
): number {
  if (conc === undefined || conc === null || isNaN(conc) || !isFinite(conc) || conc <= 0) return 0;
  for (const b of bp) {
    if (conc <= b.cHigh) {
      const idx = ((b.iHigh - b.iLow) / (b.cHigh - b.cLow)) * (conc - b.cLow) + b.iLow;
      return Math.round(idx);
    }
  }
  // Exceeding top bracket
  const last = bp[bp.length - 1];
  return Math.min(500, Math.round(((last.iHigh - last.iLow) / (last.cHigh - last.cLow)) * (conc - last.cLow) + last.iLow));
}

// CPCB Indian National AQI (IN-NAQI) 24-hr Breakpoints
export function calculateNaqiSubIndex(pollutant: string, conc: number): number {
  switch (pollutant.toLowerCase()) {
    case 'pm25':
    case 'pm2_5':
      return interpolateSubIndex(conc, [
        { cLow: 0, cHigh: 30, iLow: 0, iHigh: 50 },
        { cLow: 31, cHigh: 60, iLow: 51, iHigh: 100 },
        { cLow: 61, cHigh: 90, iLow: 101, iHigh: 200 },
        { cLow: 91, cHigh: 120, iLow: 201, iHigh: 300 },
        { cLow: 121, cHigh: 250, iLow: 301, iHigh: 400 },
        { cLow: 251, cHigh: 500, iLow: 401, iHigh: 500 },
      ]);
    case 'pm10':
      return interpolateSubIndex(conc, [
        { cLow: 0, cHigh: 50, iLow: 0, iHigh: 50 },
        { cLow: 51, cHigh: 100, iLow: 51, iHigh: 100 },
        { cLow: 101, cHigh: 250, iLow: 101, iHigh: 200 },
        { cLow: 251, cHigh: 350, iLow: 201, iHigh: 300 },
        { cLow: 351, cHigh: 430, iLow: 301, iHigh: 400 },
        { cLow: 431, cHigh: 600, iLow: 401, iHigh: 500 },
      ]);
    case 'no2':
      return interpolateSubIndex(conc, [
        { cLow: 0, cHigh: 40, iLow: 0, iHigh: 50 },
        { cLow: 41, cHigh: 80, iLow: 51, iHigh: 100 },
        { cLow: 81, cHigh: 180, iLow: 101, iHigh: 200 },
        { cLow: 181, cHigh: 280, iLow: 201, iHigh: 300 },
        { cLow: 281, cHigh: 400, iLow: 301, iHigh: 400 },
        { cLow: 401, cHigh: 800, iLow: 401, iHigh: 500 },
      ]);
    case 'o3':
      return interpolateSubIndex(conc, [
        { cLow: 0, cHigh: 50, iLow: 0, iHigh: 50 },
        { cLow: 51, cHigh: 100, iLow: 51, iHigh: 100 },
        { cLow: 101, cHigh: 168, iLow: 101, iHigh: 200 },
        { cLow: 169, cHigh: 208, iLow: 201, iHigh: 300 },
        { cLow: 209, cHigh: 748, iLow: 301, iHigh: 400 },
        { cLow: 749, cHigh: 1000, iLow: 401, iHigh: 500 },
      ]);
    case 'so2':
      return interpolateSubIndex(conc, [
        { cLow: 0, cHigh: 40, iLow: 0, iHigh: 50 },
        { cLow: 41, cHigh: 80, iLow: 51, iHigh: 100 },
        { cLow: 81, cHigh: 380, iLow: 101, iHigh: 200 },
        { cLow: 381, cHigh: 800, iLow: 201, iHigh: 300 },
        { cLow: 801, cHigh: 1600, iLow: 301, iHigh: 400 },
        { cLow: 1601, cHigh: 2000, iLow: 401, iHigh: 500 },
      ]);
    case 'co': // mg/m³
      return interpolateSubIndex(conc, [
        { cLow: 0, cHigh: 1.0, iLow: 0, iHigh: 50 },
        { cLow: 1.1, cHigh: 2.0, iLow: 51, iHigh: 100 },
        { cLow: 2.1, cHigh: 10.0, iLow: 101, iHigh: 200 },
        { cLow: 10.1, cHigh: 17.0, iLow: 201, iHigh: 300 },
        { cLow: 17.1, cHigh: 34.0, iLow: 301, iHigh: 400 },
        { cLow: 34.1, cHigh: 50.0, iLow: 401, iHigh: 500 },
      ]);
    case 'nh3':
      return interpolateSubIndex(conc, [
        { cLow: 0, cHigh: 200, iLow: 0, iHigh: 50 },
        { cLow: 201, cHigh: 400, iLow: 51, iHigh: 100 },
        { cLow: 401, cHigh: 800, iLow: 101, iHigh: 200 },
        { cLow: 801, cHigh: 1200, iLow: 201, iHigh: 300 },
        { cLow: 1201, cHigh: 1800, iLow: 301, iHigh: 400 },
        { cLow: 1801, cHigh: 2500, iLow: 401, iHigh: 500 },
      ]);
    default:
      return Math.round(conc);
  }
}

// US-EPA NowCast / Standard AQI Breakpoints
export function calculateEpaSubIndex(pollutant: string, conc: number): number {
  switch (pollutant.toLowerCase()) {
    case 'pm25':
    case 'pm2_5':
      return interpolateSubIndex(conc, [
        { cLow: 0, cHigh: 12.0, iLow: 0, iHigh: 50 },
        { cLow: 12.1, cHigh: 35.4, iLow: 51, iHigh: 100 },
        { cLow: 35.5, cHigh: 55.4, iLow: 101, iHigh: 150 },
        { cLow: 55.5, cHigh: 150.4, iLow: 151, iHigh: 200 },
        { cLow: 150.5, cHigh: 250.4, iLow: 201, iHigh: 300 },
        { cLow: 250.5, cHigh: 500.4, iLow: 301, iHigh: 500 },
      ]);
    case 'pm10':
      return interpolateSubIndex(conc, [
        { cLow: 0, cHigh: 54, iLow: 0, iHigh: 50 },
        { cLow: 55, cHigh: 154, iLow: 51, iHigh: 100 },
        { cLow: 155, cHigh: 254, iLow: 101, iHigh: 150 },
        { cLow: 255, cHigh: 354, iLow: 151, iHigh: 200 },
        { cLow: 355, cHigh: 424, iLow: 201, iHigh: 300 },
        { cLow: 425, cHigh: 604, iLow: 301, iHigh: 500 },
      ]);
    case 'o3':
      return interpolateSubIndex(conc, [
        { cLow: 0, cHigh: 54, iLow: 0, iHigh: 50 },
        { cLow: 55, cHigh: 70, iLow: 51, iHigh: 100 },
        { cLow: 71, cHigh: 85, iLow: 101, iHigh: 150 },
        { cLow: 86, cHigh: 105, iLow: 151, iHigh: 200 },
        { cLow: 106, cHigh: 200, iLow: 201, iHigh: 300 },
        { cLow: 201, cHigh: 400, iLow: 301, iHigh: 500 },
      ]);
    default:
      return Math.round(conc);
  }
}

export function getAQICategory(
  aqi: number,
  standard: AQIStandard,
  colorBlindMode?: boolean
): AQICategory {
  const categories = standard === 'NAQI' ? NAQI_CATEGORIES : EPA_CATEGORIES;
  const clamped = Math.min(500, Math.max(0, aqi));
  let baseCat = categories[categories.length - 1];
  for (const cat of categories) {
    if (clamped <= cat.max) {
      baseCat = cat;
      break;
    }
  }

  if (colorBlindMode && ACCESSIBLE_PALETTE[baseCat.label]) {
    const acc = ACCESSIBLE_PALETTE[baseCat.label];
    return {
      ...baseCat,
      color: acc.color,
      textColor: acc.textColor,
      bgLight: `${acc.color}20`,
      borderColor: `${acc.color}50`,
      badgeBg: `border border-[${acc.color}60] bg-[${acc.color}20] text-[${acc.textColor}]`,
    };
  }

  return baseCat;
}

export function calculateInhaledMicrograms(
  pm25Conc: number,
  durationMinutes: number,
  commuteMode: 'walking' | 'cycling' | 'car' | 'transit' = 'cycling'
): number {
  // Minute ventilation rates (liters of air inhaled per minute)
  const ventilationRates: Record<string, number> = {
    walking: 14.5,
    cycling: 28.0,
    car: 8.5,
    transit: 9.2,
  };
  const minuteLiters = ventilationRates[commuteMode] || 15;
  const totalLitersInhaled = minuteLiters * durationMinutes;
  const totalCubicMeters = totalLitersInhaled / 1000;
  // Particulate mass = concentration (µg/m³) * volume (m³)
  return Number((pm25Conc * totalCubicMeters).toFixed(1));
}

export function getHealthAdvisory(aqi: number, standard: AQIStandard): HealthGuideline {
  const cat = getAQICategory(aqi, standard);
  if (aqi <= 50) {
    return {
      levelName: 'Ideal Air Quality',
      color: '#10B981',
      textColor: 'text-emerald-400',
      generalPublic: 'Air quality is pristine. Perfect for all outdoor recreation, sports, and ventilation.',
      sensitiveGroups: 'No precautions needed. Breathe easy.',
      outdoorAthletics: {
        allowed: true,
        recommendation: 'Optimal conditions for high-intensity cardio, marathon training, and field sports.',
      },
      maskRequired: {
        needed: false,
        type: 'None',
        details: 'Ambient air is clean; no respiratory protection is required.',
      },
      indoorVentilation: {
        openWindows: true,
        hepaACH: 1.0,
        guidance: 'Open cross-ventilation windows to flush stale indoor CO2 and bring fresh oxygen.',
      },
    };
  }

  if (aqi <= 100) {
    return {
      levelName: 'Moderate Conditions',
      color: '#84CC16',
      textColor: 'text-lime-400',
      generalPublic: 'Air quality is acceptable. Most individuals can engage in outdoor activities normally.',
      sensitiveGroups: 'Unusually sensitive individuals should monitor for throat irritation or mild cough.',
      outdoorAthletics: {
        allowed: true,
        recommendation: 'Outdoor workouts are safe; sensitive individuals may consider morning sessions before traffic peaks.',
      },
      maskRequired: {
        needed: false,
        type: 'Optional',
        details: 'Not needed for general public. Cloth or simple surgical masks do not filter PM2.5 anyway.',
      },
      indoorVentilation: {
        openWindows: true,
        hepaACH: 2.0,
        guidance: 'Window ventilation is safe during mid-day when wind dispersion is highest.',
      },
    };
  }

  if (aqi <= 200) {
    return {
      levelName: 'Unhealthy for Vulnerable / Moderate Hazard',
      color: '#EAB308',
      textColor: 'text-yellow-400',
      generalPublic: 'Elevated fine particulates. Avoid prolonged heavy exertion along congested highway corridors.',
      sensitiveGroups: 'Children, older adults, and individuals with asthma or cardiovascular issues should reduce outdoor exertion.',
      outdoorAthletics: {
        allowed: false,
        recommendation: 'Shift heavy aerobic endurance workouts indoors or restrict to early green canopy zones.',
      },
      maskRequired: {
        needed: true,
        type: 'N95 / FFP2 Recommended',
        details: 'Wear a well-fitted particulate respirator if spending over 45 minutes near arterial roads.',
      },
      indoorVentilation: {
        openWindows: false,
        hepaACH: 3.5,
        guidance: 'Keep windows closed during morning/evening inversion hours. Run HEPA filtration on medium speed.',
      },
    };
  }

  if (aqi <= 300) {
    return {
      levelName: 'Poor / Significant Respiratory Risk',
      color: '#F97316',
      textColor: 'text-orange-400',
      generalPublic: 'Noticeable chemical haze and fine particle intrusion. Everyone may begin to experience adverse effects.',
      sensitiveGroups: 'High alert for asthmatics. Keep rescue inhalers at hand; avoid all non-essential outdoor exposure.',
      outdoorAthletics: {
        allowed: false,
        recommendation: 'Avoid outdoor running, cycling, or bootcamp workouts. Exercise indoors in sealed, filtered environments.',
      },
      maskRequired: {
        needed: true,
        type: 'Certified N95 / KN95 / FFP2 Mandatory',
        details: 'Ensure airtight nose-bridge seal. Cloth and surgical masks offer 0% protection against sub-micron PM2.5 particles.',
      },
      indoorVentilation: {
        openWindows: false,
        hepaACH: 4.5,
        guidance: 'Seal windows and door sweeps. Run HEPA air purifiers at maximum CADR (Clean Air Delivery Rate).',
      },
    };
  }

  // Above 300: Very Poor / Severe / Hazardous
  return {
    levelName: 'Severe / Emergency Air Hazard',
    color: '#EF4444',
    textColor: 'text-rose-400',
    generalPublic: 'Health alert: toxic atmospheric event. Premature mortality risk increases for prolonged exposure.',
    sensitiveGroups: 'Remain strictly indoors in a purified clean-air shelter. Consult physician if experiencing chest tightness.',
    outdoorAthletics: {
      allowed: false,
      recommendation: 'STRICT BAN: Heavy physical exertion in this air leads to deep pulmonary alveolar particulate deposition.',
    },
    maskRequired: {
      needed: true,
      type: 'N99 / FFP3 Respirator or Sealed N95',
      details: 'Do not step outdoors without an airtight particulate respirator with silicone facial seal.',
    },
    indoorVentilation: {
      openWindows: false,
      hepaACH: 6.0,
      guidance: 'Seal all vents and exhaust dampers. Continuous active HEPA filtration required; avoid indoor frying or incense.',
    },
  };
}

export const getHealthGuideline = (aqi: number, standard: AQIStandard = 'NAQI') => getHealthAdvisory(aqi, standard);
