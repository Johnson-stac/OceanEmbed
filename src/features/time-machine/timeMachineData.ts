import type { 
  VariableType, 
  DepthType, 
  MonthState, 
  GridPointData, 
  LocationSnapshot,
  TimeSeriesPoint,
  DepthTimeCell
} from './timeMachineTypes';

// Generate 49 monthly states from Jan 2021 to Jan 2025
export const MONTH_STATES: MonthState[] = [];
const startYear = 2021;
const endYear = 2025;

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

for (let y = startYear; y <= endYear; y++) {
  for (let m = 1; m <= 12; m++) {
    if (y === 2025 && m > 1) break; // Stop at Jan 2025
    
    let season: MonthState['season'] = 'Winter';
    if (m >= 3 && m <= 5) season = 'Pre-Monsoon';
    else if (m >= 6 && m <= 9) season = 'Southwest Monsoon';
    else if (m >= 10 && m <= 11) season = 'Post-Monsoon';

    const mm = m < 10 ? `0${m}` : `${m}`;
    MONTH_STATES.push({
      year: y,
      month: m,
      label: `${MONTH_SHORT[m - 1]} ${y}`,
      fullLabel: `${MONTH_NAMES[m - 1].toUpperCase()} ${y}`,
      isoDate: `${y}-${mm}-01`,
      season
    });
  }
}

export const DEPTH_OPTIONS: DepthType[] = [0, 50, 100, 200, 500, 1000];

export const VARIABLE_META: Record<VariableType, { unit: string; min: number; max: number; desc: string }> = {
  'Temperature': { unit: '°C', min: 4, max: 32, desc: 'Subsurface thermal distribution' },
  'Temperature Anomaly': { unit: '°C', min: -3.5, max: 3.5, desc: 'Deviation from 10-year mean' },
  'Salinity': { unit: 'PSU', min: 31, max: 37, desc: 'Oceanic salt concentration' },
  'Sea Level Anomaly': { unit: 'm', min: -0.25, max: 0.25, desc: 'Altimetry surface height variation' },
  'Surface Current': { unit: 'm/s', min: 0.0, max: 1.5, desc: 'Geostrophic surface flow speed' },
  'Ocean Heat Content': { unit: 'GJ/m²', min: 1.5, max: 9.0, desc: 'Integrated upper 300m heat content' },
  'Habitat Suitability': { unit: 'Index', min: 0.0, max: 1.0, desc: 'Species thermal suitability score' }
};

// Generate spatial grid covering North Indian Ocean (Lat: 5 to 28, Lng: 60 to 98)
const GRID_POINTS: { lat: number; lng: number }[] = [];
const LAT_MIN = 5.0;
const LAT_MAX = 27.5;
const LNG_MIN = 60.0;
const LNG_MAX = 98.0;
const STEP = 0.8; // Grid step in degrees (~88km grid cells)

for (let lat = LAT_MIN; lat <= LAT_MAX; lat += STEP) {
  for (let lng = LNG_MIN; lng <= LNG_MAX; lng += STEP) {
    // Mask land masses roughly (India peninsular landmass, Sri Lanka, SE Asia land)
    // Peninsular India rough triangle: lat > 8 & lat < 23 & lng between 73 and 85
    const inIndiaLand = (lat > 8.5 && lat < 22 && lng > 73.5 && lng < 85.5 && (lat - 8.5) * 0.8 + 73.5 < lng && lng < 86 - (lat - 8.5) * 0.6);
    const inMyanmarLand = (lat > 16 && lng > 94);
    const inArabiaLand = (lat > 20 && lng < 63);
    
    if (!inIndiaLand && !inMyanmarLand && !inArabiaLand) {
      GRID_POINTS.push({ lat: Number(lat.toFixed(2)), lng: Number(lng.toFixed(2)) });
    }
  }
}

/**
 * Calculates physical temperature value at given lat, lng, date, and depth
 */

function calculateBaseTemperature(lat: number, lng: number, month: number, year: number, depth: DepthType): { val: number; anomaly: number; baseVal: number } {
  // 1. Latitude gradient: warmer south (~29°C), cooler north (~24°C)
  const latFactor = (28 - lat) * 0.22;

  // 2. Longitude / Basin factor: Arabian Sea (lng 60-77) vs Bay of Bengal (lng 80-98)
  const isArabianSea = lng < 77;
  const basinFactor = isArabianSea ? 0.3 : -0.2;

  // 3. Seasonal cycle: solar heating peaks in April-May (m=4,5) & Oct (m=10). Cooling in SW monsoon (m=7,8 upwelling) & Jan (m=1)
  const seasonalRad = ((month - 1) / 12) * 2 * Math.PI;
  let seasonalSST = Math.cos(seasonalRad - 1.2) * 1.8; // Peak around May
  if (month >= 6 && month <= 8 && isArabianSea) {
    // Upwelling along Oman & West Coast of India during SW monsoon cools SST
    seasonalSST -= 1.4;
  }

  // 4. Interannual warming trend (2021 to 2025: ~0.15°C/year) + simulated IOD/El Nino anomaly pulse in 2023-2024
  const yearOffset = year - 2021;
  const interannualTrend = yearOffset * 0.18;
  const iodPulse = (year === 2023 && month >= 8) || (year === 2024 && month <= 4) ? 0.9 : 0.0;

  // 5. Surface Temperature (SST) base at 0m
  const baseSST = 27.2 + latFactor + basinFactor + seasonalSST + interannualTrend + iodPulse;

  // 6. Depth attenuation (Thermocline physics)
  let baseTempAtDepth = baseSST;

  if (depth === 0) {
    baseTempAtDepth = baseSST;
  } else if (depth === 50) {
    baseTempAtDepth = baseSST - 2.8 - (month === 7 ? 1.5 : 0); // Mixed layer depth shift
  } else if (depth === 100) {
    baseTempAtDepth = baseSST - 8.5; // Main thermocline sharp drop
  } else if (depth === 200) {
    baseTempAtDepth = 15.2 + (latFactor * 0.3) + (interannualTrend * 0.4);
  } else if (depth === 500) {
    baseTempAtDepth = 9.8 + (latFactor * 0.1);
  } else if (depth === 1000) {
    baseTempAtDepth = 5.2 + (latFactor * 0.05);
  }

  // 7. Smooth Spatial Noise / Eddies
  const spatialNoise = Math.sin(lat * 0.45 + lng * 0.35 + month * 0.5) * 0.45 
                     + Math.cos(lat * 0.8 - lng * 0.6 + year * 0.4) * 0.3;

  const finalVal = Number(Math.max(4.0, Math.min(32.5, baseTempAtDepth + spatialNoise)).toFixed(2));

  // Climatology baseline (without interannual trend & IOD pulse)
  const baseVal = Number(Math.max(4.0, Math.min(32.5, baseTempAtDepth - interannualTrend - iodPulse)).toFixed(2));
  
  // Anomaly calculation
  const anomaly = Number((finalVal - baseVal).toFixed(2));

  return { val: finalVal, anomaly, baseVal };
}

/**
 * Returns deterministic grid data for a specific date, depth, variable, and mode
 */
export function getMonthlyGridData(
  year: number,
  month: number,
  variable: VariableType,
  depth: DepthType,
  mode: 'Normal' | 'Anomaly' | 'Change' = 'Normal',
  compareYear: number = 2021,
  compareMonth: number = 1
): GridPointData[] {
  return GRID_POINTS.map(pt => {
    const main = calculateBaseTemperature(pt.lat, pt.lng, month, year, depth);

    if (mode === 'Change') {
      const comp = calculateBaseTemperature(pt.lat, pt.lng, compareMonth, compareYear, depth);
      const diff = Number((main.val - comp.val).toFixed(2));
      return {
        lat: pt.lat,
        lng: pt.lng,
        val: diff,
        anomaly: diff,
        baseVal: comp.val
      };
    }

    if (variable === 'Temperature') {
      return {
        lat: pt.lat,
        lng: pt.lng,
        val: mode === 'Anomaly' ? main.anomaly : main.val,
        anomaly: main.anomaly,
        baseVal: main.baseVal
      };
    }

    if (variable === 'Temperature Anomaly') {
      return {
        lat: pt.lat,
        lng: pt.lng,
        val: main.anomaly,
        anomaly: main.anomaly,
        baseVal: main.baseVal
      };
    }

    if (variable === 'Salinity') {
      // Salinity: Arabian Sea ~36.2 PSU, Bay of Bengal ~32.8 PSU due to rivers
      const isAS = pt.lng < 78;
      const baseSal = isAS ? 35.8 : 33.2;
      const seasonalSal = Math.sin((month / 12) * 2 * Math.PI) * 0.4;
      const depthSal = depth > 200 ? 34.8 : baseSal;
      const salVal = Number((depthSal + seasonalSal + (pt.lat - 15) * 0.05).toFixed(2));
      const salAnom = Number((seasonalSal * 0.8).toFixed(2));
      return {
        lat: pt.lat,
        lng: pt.lng,
        val: mode === 'Anomaly' ? salAnom : salVal,
        anomaly: salAnom,
        baseVal: salVal - salAnom
      };
    }

    if (variable === 'Sea Level Anomaly') {
      const sla = Number((Math.sin(pt.lat * 0.3 + month * 0.5) * 0.12 + (year - 2021) * 0.02).toFixed(2));
      return {
        lat: pt.lat,
        lng: pt.lng,
        val: sla,
        anomaly: sla,
        baseVal: 0
      };
    }

    if (variable === 'Surface Current') {
      const speed = Number((0.35 + Math.abs(Math.sin((month / 12) * Math.PI * 2 + pt.lat * 0.2)) * 0.75).toFixed(2));
      return {
        lat: pt.lat,
        lng: pt.lng,
        val: speed,
        anomaly: Number((speed - 0.5).toFixed(2)),
        baseVal: 0.5
      };
    }

    if (variable === 'Ocean Heat Content') {
      const ohc = Number((4.5 + main.val * 0.14 + (year - 2021) * 0.2).toFixed(2));
      const ohcAnom = Number((main.anomaly * 0.3).toFixed(2));
      return {
        lat: pt.lat,
        lng: pt.lng,
        val: mode === 'Anomaly' ? ohcAnom : ohc,
        anomaly: ohcAnom,
        baseVal: ohc - ohcAnom
      };
    }

    // Habitat Suitability (0 to 1)
    const optTemp = 26.5;
    const tempDev = Math.abs(main.val - optTemp);
    const suit = Number(Math.max(0, 1 - tempDev / 6.5).toFixed(2));
    return {
      lat: pt.lat,
      lng: pt.lng,
      val: suit,
      anomaly: Number((suit - 0.6).toFixed(2)),
      baseVal: 0.6
    };
  });
}

/**
 * Returns location snapshot details for selected coordinate
 */
export function getLocationSnapshot(
  lat: number,
  lng: number,
  monthState: MonthState,
  depth: DepthType,
  variable: VariableType
): LocationSnapshot {
  const data = calculateBaseTemperature(lat, lng, monthState.month, monthState.year, depth);
  const meta = VARIABLE_META[variable];

  let displayVal = data.val;
  if (variable === 'Temperature Anomaly') displayVal = data.anomaly;
  else if (variable === 'Salinity') displayVal = Number((lng < 78 ? 36.1 : 33.4).toFixed(2));
  else if (variable === 'Sea Level Anomaly') displayVal = Number((Math.sin(lat * 0.3 + monthState.month) * 0.1).toFixed(2));
  else if (variable === 'Surface Current') displayVal = Number((0.4 + Math.sin(monthState.month) * 0.3).toFixed(2));
  else if (variable === 'Ocean Heat Content') displayVal = Number((5.2 + data.val * 0.12).toFixed(2));
  else if (variable === 'Habitat Suitability') displayVal = Number((Math.max(0, 1 - Math.abs(data.val - 26.5) / 6.5)).toFixed(2));

  return {
    lat: Number(lat.toFixed(2)),
    lng: Number(lng.toFixed(2)),
    dateLabel: monthState.fullLabel,
    depth,
    variable,
    val: displayVal,
    anomaly: data.anomaly,
    unit: meta.unit,
    confidence: 94.8
  };
}

/**
 * Returns full time series (2021-2025) for a selected location
 */
export function getLocationTimeSeries(
  lat: number,
  lng: number,
  currentMonthIndex: number,
  depth: DepthType,
  variable: VariableType
): TimeSeriesPoint[] {
  return MONTH_STATES.map((ms, idx) => {
    const calc = calculateBaseTemperature(lat, lng, ms.month, ms.year, depth);
    let val = calc.val;
    if (variable === 'Temperature Anomaly') val = calc.anomaly;
    else if (variable === 'Salinity') val = Number((lng < 78 ? 36.0 : 33.2) + Math.sin(ms.month) * 0.3);
    else if (variable === 'Ocean Heat Content') val = Number((5.0 + calc.val * 0.12).toFixed(2));

    return {
      dateLabel: ms.label,
      year: ms.year,
      month: ms.month,
      val: Number(val.toFixed(2)),
      anomaly: calc.anomaly,
      isCurrent: idx === currentMonthIndex
    };
  });
}

/**
 * Returns Depth x Time matrix for a selected location
 */
export function getDepthTimeHeatmap(
  lat: number,
  lng: number,
  currentMonthState: MonthState
): DepthTimeCell[] {
  const result: DepthTimeCell[] = [];
  
  // Pick sample dates around the active year
  const sampleMonths = MONTH_STATES.filter(ms => ms.year === currentMonthState.year || ms.year === currentMonthState.year - 1).slice(0, 12);
  
  DEPTH_OPTIONS.forEach(d => {
    sampleMonths.forEach(ms => {
      const calc = calculateBaseTemperature(lat, lng, ms.month, ms.year, d);
      result.push({
        depth: d,
        dateLabel: ms.label,
        val: calc.val
      });
    });
  });

  return result;
}
