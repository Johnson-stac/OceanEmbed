import type {
  SurfaceParameters,
  DepthPrediction,
  PredictionResponse,
  CorrelationResult,
  DateRangeAnalysisResult,
  TemporalDataPoint,
  ParameterStats,
  AdvancedFilterCriteria,
  AdvancedFilterResult,
  SuggestedDateMatch,
  ParameterMatchDetail
} from '../types';

/**
 * ARCHITECTURE NOTE:
 * This fakeModel.ts file is a simulation layer for oceanographic inference.
 * 
 * It models spatial gradients and seasonal cycles (SW Monsoon, NE Monsoon,
 * Pre-Monsoon, Post-Monsoon) across the North Indian Ocean (5°N–30°N, 60°E–100°E).
 * 
 * Once the real ML model or backend API is deployed, the service calls in
 * `predictionService.ts` can be redirected to the API endpoint.
 */

// Helper to compute day-of-year and year fraction for seasonal oscillations
const getDayOfYear = (d: Date): number => {
  const start = new Date(Date.UTC(d.getUTCFullYear(), 0, 0));
  const diff = d.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
};

const getSeasonName = (dayOfYear: number): string => {
  if (dayOfYear >= 60 && dayOfYear < 151) return 'Pre-Monsoon (Spring)';
  if (dayOfYear >= 151 && dayOfYear < 274) return 'SW Monsoon (Summer)';
  if (dayOfYear >= 274 && dayOfYear < 335) return 'Post-Monsoon (Autumn)';
  return 'NE Monsoon (Winter)';
};

export const generateMockSurfaceParameters = (
  lat: number,
  lng: number,
  dateStr?: string
): SurfaceParameters => {
  const date = dateStr ? new Date(dateStr) : new Date(Date.UTC(2022, 5, 15));
  const dayOfYear = getDayOfYear(date);
  const yearOffset = (date.getUTCFullYear() - 2021) * 0.08;

  // Normalized coordinates across North Indian Ocean (5N to 30N, 60E to 100E)
  const latFactor = (lat - 5) / 25; // 0 (equator) to 1 (north)
  const lngFactor = (lng - 60) / 40; // 0 (Arabian Sea) to 1 (Bay of Bengal)

  // 1. Seasonal Solar & Monsoonal Cycle
  // Peak pre-monsoon heating in May (day ~135), secondary post-monsoon peak in Oct (day ~290), winter cool in Jan (day ~15)
  const seasonalSolar = Math.cos(((dayOfYear - 135) / 365) * Math.PI * 2);
  const semiAnnual = Math.cos(((dayOfYear - 120) / 182.5) * Math.PI * 2) * 0.6;
  
  // Upwelling cooling during peak summer monsoon (July/Aug, days 180-240) on western boundaries
  const isSummerMonsoon = dayOfYear >= 150 && dayOfYear <= 270;
  const upwellingEffect = isSummerMonsoon && lng < 75 ? (1 - lngFactor) * 1.8 * Math.sin(((dayOfYear - 150) / 120) * Math.PI) : 0;

  // Sea Surface Temperature (°C)
  const baseSst = 29.5 - (latFactor * 4.2) + (Math.sin(lng * 0.15) * 0.6);
  const sst = baseSst + (seasonalSolar * 1.8) + semiAnnual - upwellingEffect + yearOffset + (Math.sin(lat + lng + dayOfYear * 0.05) * 0.2);

  // Sea Surface Salinity (PSU)
  // Arabian Sea (~35.5 - 36.8 PSU) vs Bay of Bengal (~31.5 - 34.0 PSU with strong monsoon freshwater dip)
  const baseSalinity = 36.4 - (lngFactor * 3.8) + (latFactor * 0.5);
  // Post-monsoon river runoff reduces Bay of Bengal salinity in August-November
  const riverRunoffDip = (lngFactor > 0.4 && dayOfYear >= 200 && dayOfYear <= 320)
    ? lngFactor * 2.2 * Math.sin(((dayOfYear - 200) / 120) * Math.PI)
    : 0;
  const sss = baseSalinity - riverRunoffDip + (Math.cos(lat * 0.2) * 0.3) + (Math.sin(dayOfYear * 0.017) * 0.25);

  // Sea Level Anomaly (m)
  // Cyclonic / anticyclonic gyres and seasonal coastal Kelvin waves
  const seasonalSla = Math.sin(((dayOfYear - 90) / 365) * Math.PI * 2) * 0.18;
  const sla = 0.12 + seasonalSla + (Math.sin(lat * 0.4 + lng * 0.3) * 0.12) - (upwellingEffect * 0.08);

  // Wind Fields (m/s)
  // SW Monsoon (Jun-Sep): strong positive u, v in Arabian Sea; NE Monsoon (Dec-Feb): negative u, v
  let baseWindU = 0;
  let baseWindV = 0;
  if (dayOfYear >= 130 && dayOfYear <= 280) {
    // Summer SW Monsoon
    const monsoonIntensity = Math.sin(((dayOfYear - 130) / 150) * Math.PI);
    baseWindU = 6.0 + monsoonIntensity * 7.5 * (1.2 - latFactor * 0.5);
    baseWindV = 4.5 + monsoonIntensity * 6.0 * (1.1 - lngFactor * 0.4);
  } else {
    // Winter / NE Monsoon & transitions
    const winterIntensity = Math.cos(((dayOfYear + 15) / 120) * Math.PI);
    baseWindU = -2.5 - Math.max(0, winterIntensity) * 4.0;
    baseWindV = -2.0 - Math.max(0, winterIntensity) * 3.5;
  }
  const wind_u = baseWindU + (Math.cos(lng * 0.3 + dayOfYear * 0.1) * 0.8);
  const wind_v = baseWindV + (Math.sin(lat * 0.3 + dayOfYear * 0.1) * 0.8);

  // Surface Currents (m/s)
  // Responds to monsoon reversal
  const current_u = (wind_u * 0.04) + (Math.sin(lat * 0.2 + dayOfYear * 0.02) * 0.15);
  const current_v = (wind_v * 0.04) + (Math.cos(lng * 0.2 + dayOfYear * 0.02) * 0.12);

  return {
    sst: Number(sst.toFixed(2)),
    sss: Number(sss.toFixed(2)),
    sla: Number(sla.toFixed(3)),
    current_u: Number(current_u.toFixed(2)),
    current_v: Number(current_v.toFixed(2)),
    wind_u: Number(wind_u.toFixed(2)),
    wind_v: Number(wind_v.toFixed(2)),
  };
};

export const getDepthTemperature = (sst: number, depth: number): number => {
  if (depth <= 0) return sst;
  let drop = 0;
  if (depth <= 5) {
    drop = 0.1 * (depth / 5);
  } else if (depth <= 10) {
    drop = 0.1 + 0.2 * ((depth - 5) / 5);
  } else if (depth <= 20) {
    drop = 0.3 + 0.2 * ((depth - 10) / 10);
  } else if (depth <= 30) {
    drop = 0.5 + 0.2 * ((depth - 20) / 10);
  } else if (depth <= 50) {
    drop = 0.7 + 0.6 * ((depth - 30) / 20);
  } else if (depth <= 75) {
    drop = 1.3 + 0.7 * ((depth - 50) / 25);
  } else if (depth <= 100) {
    drop = 2.0 + 1.0 * ((depth - 75) / 25);
  } else if (depth <= 125) {
    drop = 3.0 + 6.2 * ((depth - 100) / 25); // Thermocline rapid transition
  } else if (depth <= 150) {
    drop = 9.2 + 2.7 * ((depth - 125) / 25);
  } else if (depth <= 200) {
    drop = 11.9 + 1.9 * ((depth - 150) / 50);
  } else if (depth <= 300) {
    drop = 13.8 + 3.1 * ((depth - 200) / 100);
  } else if (depth <= 500) {
    drop = 16.9 + 2.0 * ((depth - 300) / 200);
  } else if (depth <= 700) {
    drop = 18.9 + 0.8 * ((depth - 500) / 200);
  } else {
    drop = 19.7 + 2.0 * (Math.min(depth, 1000) - 700) / 300;
  }
  return Math.max(3.5, sst - drop);
};

export const generateMockDepthProfile = (surfaceTemp: number): DepthPrediction[] => {
  const depths = [0, 5, 10, 20, 30, 50, 75, 100, 125, 150, 200, 300, 500, 700, 1000];
  return depths.map((depth, index) => {
    const temp = getDepthTemperature(surfaceTemp, depth);
    const uncertainty = 0.15 + (index * 0.12);

    return {
      depth,
      predicted_temperature: Number(temp.toFixed(2)),
      lower_bound: Number((temp - uncertainty).toFixed(2)),
      upper_bound: Number((temp + uncertainty).toFixed(2)),
    };
  });
};

const generateMockCorrelations = (): CorrelationResult[] => {
  return [
    { parameter: 'SST', correlationCoefficient: 0.85, importanceScore: 0.9 },
    { parameter: 'SSS', correlationCoefficient: -0.65, importanceScore: 0.7 },
    { parameter: 'SLA', correlationCoefficient: 0.45, importanceScore: 0.5 },
    { parameter: 'Current U', correlationCoefficient: 0.15, importanceScore: 0.2 },
    { parameter: 'Current V', correlationCoefficient: -0.25, importanceScore: 0.3 },
    { parameter: 'Wind U', correlationCoefficient: -0.10, importanceScore: 0.1 },
    { parameter: 'Wind V', correlationCoefficient: 0.05, importanceScore: 0.1 },
  ];
};

export const runFakeInference = (lat: number, lng: number, date: string): PredictionResponse => {
  const surface_parameters = generateMockSurfaceParameters(lat, lng, date);
  const predictions = generateMockDepthProfile(surface_parameters.sst);
  const correlations = generateMockCorrelations();

  return {
    location: { lat, lng },
    date,
    surface_parameters,
    predictions,
    correlations,
    demo_confidence: 89,
    model_status: "DEMO"
  };
};

// ==========================================
// BASIC FILTER: DATE RANGE ANALYSIS & AVERAGES
// ==========================================

const computeStats = (values: number[]): ParameterStats => {
  if (values.length === 0) return { avg: 0, min: 0, max: 0, stdDev: 0 };
  const sum = values.reduce((acc, v) => acc + v, 0);
  const avg = sum / values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const variance = values.reduce((acc, v) => acc + Math.pow(v - avg, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  return {
    avg: Number(avg.toFixed(2)),
    min: Number(min.toFixed(2)),
    max: Number(max.toFixed(2)),
    stdDev: Number(stdDev.toFixed(2))
  };
};

export const calculateDateRangeAnalysis = (
  lat: number,
  lng: number,
  startDateStr: string,
  endDateStr: string
): DateRangeAnalysisResult => {
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  
  // Ensure start <= end
  const startTime = Math.min(start.getTime(), end.getTime());
  const endTime = Math.max(start.getTime(), end.getTime());
  const dayDuration = 1000 * 60 * 60 * 24;
  const totalDays = Math.max(1, Math.round((endTime - startTime) / dayDuration) + 1);

  // Sample intelligently: if < 90 days, daily; if < 365 days, every 3-5 days; else every 7-14 days
  const stepDays = totalDays <= 45 ? 1 : totalDays <= 180 ? 3 : totalDays <= 500 ? 7 : 14;
  
  const timeSeries: TemporalDataPoint[] = [];
  const sstList: number[] = [];
  const sssList: number[] = [];
  const slaList: number[] = [];
  const windUList: number[] = [];
  const windVList: number[] = [];
  const windSpeedList: number[] = [];
  const curUList: number[] = [];
  const curVList: number[] = [];
  const curSpeedList: number[] = [];

  for (let t = startTime; t <= endTime; t += stepDays * dayDuration) {
    const curDate = new Date(t);
    const dateIso = curDate.toISOString();
    const formattedDate = curDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
    
    const params = generateMockSurfaceParameters(lat, lng, dateIso);
    const windSpeed = Math.sqrt(params.wind_u * params.wind_u + params.wind_v * params.wind_v);
    const curSpeed = Math.sqrt(params.current_u * params.current_u + params.current_v * params.current_v);

    sstList.push(params.sst);
    sssList.push(params.sss);
    slaList.push(params.sla);
    windUList.push(params.wind_u);
    windVList.push(params.wind_v);
    windSpeedList.push(windSpeed);
    curUList.push(params.current_u);
    curVList.push(params.current_v);
    curSpeedList.push(curSpeed);

    timeSeries.push({
      date: dateIso,
      formattedDate,
      sst: params.sst,
      sss: params.sss,
      sla: params.sla,
      current_u: params.current_u,
      current_v: params.current_v,
      current_speed: Number(curSpeed.toFixed(2)),
      wind_u: params.wind_u,
      wind_v: params.wind_v,
      wind_speed: Number(windSpeed.toFixed(2)),
    });
  }

  // Calculate overall averages
  const sstStats = computeStats(sstList);
  const sssStats = computeStats(sssList);
  const slaStats = computeStats(slaList);
  const windSpeedStats = computeStats(windSpeedList);
  const curSpeedStats = computeStats(curSpeedList);

  const avgCurrentU = Number((curUList.reduce((a, b) => a + b, 0) / curUList.length).toFixed(2));
  const avgCurrentV = Number((curVList.reduce((a, b) => a + b, 0) / curVList.length).toFixed(2));
  const avgWindU = Number((windUList.reduce((a, b) => a + b, 0) / windUList.length).toFixed(2));
  const avgWindV = Number((windVList.reduce((a, b) => a + b, 0) / windVList.length).toFixed(2));

  const averageProfile = generateMockDepthProfile(sstStats.avg);

  return {
    location: {
      lat,
      lng,
      name: `${Math.abs(lat).toFixed(2)}°${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lng).toFixed(2)}°${lng >= 0 ? 'E' : 'W'}`
    },
    startDate: new Date(startTime).toISOString().split('T')[0],
    endDate: new Date(endTime).toISOString().split('T')[0],
    totalDays,
    samplePointsCount: timeSeries.length,
    averages: {
      sst: sstStats.avg,
      sss: sssStats.avg,
      sla: slaStats.avg,
      current_u: avgCurrentU,
      current_v: avgCurrentV,
      wind_u: avgWindU,
      wind_v: avgWindV,
      wind_speed: windSpeedStats.avg,
      current_speed: curSpeedStats.avg,
    },
    stats: {
      sst: sstStats,
      sss: sssStats,
      sla: slaStats,
      wind_speed: windSpeedStats,
      current_speed: curSpeedStats,
    },
    timeSeries,
    depthProfile: averageProfile
  };
};

// ==========================================
// ADVANCE FILTER: CONDITION-BASED DATE MATCHING
// ==========================================

export const matchDatesByConditions = (
  lat: number,
  lng: number,
  criteria: AdvancedFilterCriteria,
  searchHorizonYears: number[] = [2021, 2022, 2023, 2024, 2025]
): AdvancedFilterResult => {
  const activeConditions: {
    key: keyof Omit<AdvancedFilterCriteria, 'searchHorizonYears' | 'strictness'>;
    label: string;
    unit: string;
    min: number;
    max: number;
  }[] = [];

  if (criteria.sst?.enabled) {
    activeConditions.push({ key: 'sst', label: 'Sea Surface Temp', unit: '°C', min: criteria.sst.min, max: criteria.sst.max });
  }
  if (criteria.sss?.enabled) {
    activeConditions.push({ key: 'sss', label: 'Salinity', unit: 'PSU', min: criteria.sss.min, max: criteria.sss.max });
  }
  if (criteria.sla?.enabled) {
    activeConditions.push({ key: 'sla', label: 'Sea Level Anomaly', unit: 'm', min: criteria.sla.min, max: criteria.sla.max });
  }
  if (criteria.wind_speed?.enabled) {
    activeConditions.push({ key: 'wind_speed', label: 'Wind Speed', unit: 'm/s', min: criteria.wind_speed.min, max: criteria.wind_speed.max });
  }
  if (criteria.current_speed?.enabled) {
    activeConditions.push({ key: 'current_speed', label: 'Current Velocity', unit: 'm/s', min: criteria.current_speed.min, max: criteria.current_speed.max });
  }

  const strictness = criteria.strictness || 'moderate';
  const minThreshold = strictness === 'strict' ? 95 : strictness === 'flexible' ? 65 : 80;

  const candidateMatches: SuggestedDateMatch[] = [];
  const monthScores: { [monthIdx: number]: { totalScore: number; count: number; matchCount: number } } = {};
  for (let m = 0; m < 12; m++) {
    monthScores[m] = { totalScore: 0, count: 0, matchCount: 0 };
  }

  let totalSearched = 0;

  // Sample across the years (every 5 days)
  searchHorizonYears.forEach((year) => {
    for (let day = 1; day <= 365; day += 5) {
      totalSearched++;
      const date = new Date(Date.UTC(year, 0, day));
      const dateIso = date.toISOString();
      const monthIdx = date.getUTCMonth();
      const params = generateMockSurfaceParameters(lat, lng, dateIso);
      const windSpeed = Math.sqrt(params.wind_u * params.wind_u + params.wind_v * params.wind_v);
      const curSpeed = Math.sqrt(params.current_u * params.current_u + params.current_v * params.current_v);

      const fullParams = {
        ...params,
        wind_speed: Number(windSpeed.toFixed(2)),
        current_speed: Number(curSpeed.toFixed(2)),
      };

      if (activeConditions.length === 0) {
        monthScores[monthIdx].count++;
        continue;
      }

      let totalScore = 0;
      const matchDetails: ParameterMatchDetail[] = [];

      activeConditions.forEach(cond => {
        let actual = 0;
        if (cond.key === 'sst') actual = fullParams.sst;
        else if (cond.key === 'sss') actual = fullParams.sss;
        else if (cond.key === 'sla') actual = fullParams.sla;
        else if (cond.key === 'wind_speed') actual = fullParams.wind_speed;
        else if (cond.key === 'current_speed') actual = fullParams.current_speed;

        let paramScore = 0;
        const isWithin = actual >= cond.min && actual <= cond.max;

        if (isWithin) {
          paramScore = 100;
        } else {
          // Compute smooth distance decay
          const rangeSpan = Math.max(0.5, cond.max - cond.min);
          const distance = actual < cond.min ? cond.min - actual : actual - cond.max;
          const normalizedDist = distance / rangeSpan;
          paramScore = Math.max(0, Math.round(100 * Math.exp(-2 * normalizedDist)));
        }

        totalScore += paramScore;
        matchDetails.push({
          parameter: cond.key,
          label: cond.label,
          unit: cond.unit,
          actualValue: actual,
          targetMin: cond.min,
          targetMax: cond.max,
          isSatisfied: isWithin,
          score: paramScore
        });
      });

      const avgScore = Math.round(totalScore / activeConditions.length);
      monthScores[monthIdx].totalScore += avgScore;
      monthScores[monthIdx].count++;

      if (avgScore >= minThreshold) {
        monthScores[monthIdx].matchCount++;
        const seasonTag = `${getSeasonName(day)} ${year}`;
        const overallSuitability = avgScore >= 95 ? 'Excellent' : avgScore >= 85 ? 'Good' : 'Moderate';

        // Calculate subsurface preview
        const depthProfile = generateMockDepthProfile(fullParams.sst);
        const temp50m = depthProfile.find(d => d.depth === 50)?.predicted_temperature ?? (fullParams.sst - 2.5);
        const temp200m = depthProfile.find(d => d.depth === 200)?.predicted_temperature ?? (fullParams.sst - 12);

        const satisfiedCount = matchDetails.filter(m => m.isSatisfied).length;
        const desc = `${satisfiedCount}/${matchDetails.length} target conditions satisfied (${avgScore}% overall score)`;

        candidateMatches.push({
          id: `${year}-${day}`,
          date: dateIso.split('T')[0],
          formattedDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }),
          seasonTag,
          matchScore: avgScore,
          overallSuitability,
          parameters: fullParams,
          parameterMatches: matchDetails,
          subsurfaceTemp50m: temp50m,
          subsurfaceTemp200m: temp200m,
          description: desc
        });
      }
    }
  });

  // Sort candidate matches by score descending, then by date descending
  candidateMatches.sort((a, b) => b.matchScore - a.matchScore || new Date(b.date).getTime() - new Date(a.date).getTime());

  // Cap suggested dates to top 40 distinct periods
  const suggestedDates = candidateMatches.slice(0, 40);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlySuitabilityDistribution = monthNames.map((name, idx) => {
    const stats = monthScores[idx];
    const avgScore = stats.count > 0 ? Math.round(stats.totalScore / stats.count) : 0;
    return {
      month: name,
      monthIndex: idx,
      averageScore: avgScore,
      matchCount: stats.matchCount
    };
  });

  return {
    location: {
      lat,
      lng,
      name: `${Math.abs(lat).toFixed(2)}°${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lng).toFixed(2)}°${lng >= 0 ? 'E' : 'W'}`
    },
    searchedPointsCount: totalSearched,
    matchedCount: candidateMatches.length,
    activeConditionsCount: activeConditions.length,
    criteria,
    suggestedDates,
    monthlySuitabilityDistribution
  };
};
