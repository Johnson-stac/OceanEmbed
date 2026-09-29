import type { MockSpecies } from '../data/mockSpecies';
import type { PredictionResponse } from '../types';
import { getDepthTemperature, generateMockSurfaceParameters } from './fakeModel';

// ─── STRICT OCEAN-ONLY MASKING ────────────────────────────────────────────────
// The user mandate strictly requires:
// "NEVER plot fish habitat points on land. All Fisheries points/areas must be
//  constrained to ocean/water regions. Before rendering a point:
//  1. Check its geographic coordinates.
//  2. Check against an ocean/land mask or valid ocean geometry.
//  3. Reject points falling on land.
//  4. Only render valid ocean coordinates."

/**
 * Standard ray-casting point-in-polygon algorithm
 */
function isPointInPolygon(point: [number, number], polygon: [number, number][]): boolean {
  const [x, y] = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

// Peninsular India Land Polygon
const INDIA_LAND_POLYGON: [number, number][] = [
  [8.08, 77.55], // Kanyakumari
  [8.5, 76.9],
  [9.5, 76.3],
  [10.5, 76.0],
  [12.0, 75.3],
  [13.5, 74.7],
  [15.0, 74.0],
  [16.5, 73.4],
  [18.5, 72.85], // Mumbai coast
  [19.5, 72.8],
  [20.5, 72.8], // Gulf of Khambhat east
  [21.7, 72.3],
  [21.7, 72.1],
  [21.0, 71.8],
  [20.7, 71.0], // Saurashtra south
  [20.9, 70.2],
  [21.5, 69.5],
  [22.2, 69.0], // Dwarka
  [22.7, 69.7],
  [22.9, 70.3],
  [23.2, 69.8],
  [23.8, 68.6], // Kutch west
  [24.5, 68.8], // Indo-Pak border coast
  [25.0, 69.5],
  [26.5, 70.0],
  [28.0, 70.0],
  [30.0, 73.0],
  [31.0, 76.0],
  [30.0, 80.0],
  [27.0, 85.0],
  [26.5, 88.0],
  [25.0, 89.5],
  [24.0, 90.0],
  [22.8, 89.5],
  [22.0, 89.0], // Sundarbans
  [21.6, 87.5], // Digha / Odisha border
  [20.5, 86.8], // Paradip
  [19.8, 85.8], // Puri
  [19.0, 84.8], // Gopalpur
  [17.7, 83.3], // Visakhapatnam
  [16.5, 82.2], // Kakinada
  [15.8, 80.8], // Machilipatnam
  [14.5, 80.1], // Nellore
  [13.1, 80.3], // Chennai
  [11.9, 79.8], // Puducherry
  [10.8, 79.8], // Nagapattinam
  [9.3, 79.1],  // Rameswaram
  [8.8, 78.1],  // Tuticorin
  [8.08, 77.55], // Kanyakumari
];

// Sri Lanka Land Polygon
const SRI_LANKA_LAND_POLYGON: [number, number][] = [
  [5.9, 80.5],
  [6.0, 80.1],
  [7.0, 79.8],
  [8.0, 79.8],
  [9.0, 79.8],
  [9.8, 80.2],
  [9.5, 80.8],
  [8.6, 81.3],
  [7.5, 81.8],
  [6.5, 81.8],
  [6.0, 81.0],
  [5.9, 80.5],
];

/**
 * Validates whether a given latitude and longitude coordinate lies strictly within
 * the ocean waters of the Northern Indian Ocean / Arabian Sea / Bay of Bengal.
 * Completely rejects points falling on Indian mainland, Sri Lanka, Bangladesh, Pakistan,
 * Oman, and Myanmar landmasses.
 */
export function isPointInOcean(lat: number, lng: number): boolean {
  // Study domain boundary check: 2°N–25°N, 58°E–97°E
  if (lat < 2 || lat > 25.5 || lng < 58 || lng > 97) return false;

  // Land check: Peninsular India
  if (isPointInPolygon([lat, lng], INDIA_LAND_POLYGON)) return false;

  // Land check: Sri Lanka
  if (isPointInPolygon([lat, lng], SRI_LANKA_LAND_POLYGON)) return false;

  // Land check: Pakistan / Makran / Sindh coast
  if (lat >= 24.8 && lng <= 68.2) return false;
  if (lat >= 25.2) return false; // North of Karachi/Oman gulf

  // Land check: Oman / Arabian Peninsula
  if (lng <= 59.0 && lat >= 21.0) return false;
  if (lng <= 55.0 && lat >= 15.0) return false;

  // Land check: Bangladesh & Gangetic Delta head
  if (lat >= 21.6 && lng >= 88.5 && lng <= 92.5) return false;

  // Land check: Myanmar / Indochina
  if (lat >= 16.0 && lng >= 94.2) return false;
  if (lat >= 9.8 && lng >= 98.2) return false;

  return true;
}

// ─── INTERFACES ─────────────────────────────────────────────────────────────

export interface PotentialHabitatPoint {
  id: string;
  lat: number;
  lng: number;
  depth: number;
  temp: number;
  suitability: number;        // 0–100
  suitabilityCategory: 'High' | 'Moderate' | 'Lower';
  regionName: string;
  confidence: 'High' | 'Moderate' | 'Low';
  label: string;              // "Potential Thermal Habitat"
}

export interface HabitatPolygonArea {
  id: string;
  name: string;
  category: 'High' | 'Moderate' | 'Low';
  avgSuitability: number;
  avgTemp: number;
  depth: number;
  coordinates: [number, number][]; // [lat, lng][] strictly in ocean
}

export interface SpatialHabitatSummary {
  species: MockSpecies;
  targetDepth: number;
  totalPoints: number;
  optimalPoints: number;
  moderatePoints: number;
  subOptimalPoints: number;
  optimalAreaSqKm: number;
  coveragePercent: number;
  peakLocation: { lat: number; lng: number; temp: number; suitability: number; regionName: string } | null;
  avgRegionTemp: number;
  hotspots: HabitatHotspot[];
}

export interface HabitatHotspot {
  rank: number;
  regionName: string;
  lat: number;
  lng: number;
  avgSuitability: number;
  peakTemp: number;
  category: 'High' | 'Moderate' | 'Low';
}

export interface HabitatAnalysisResult {
  score: number;
  category: 'High' | 'Moderate' | 'Low';
  compatibleDepths: [number, number] | null;
  surfaceTemp: number | null;
  optimalDepthRange: [number, number] | null;
}

export interface DepthSuitabilityPoint {
  depth: number;
  temp: number;
  suitability: number;
  category: 'Optimal' | 'Moderate' | 'Sub-optimal';
}

// ─── NAMED OCEAN REGIONS ─────────────────────────────────────────────────────

interface NamedRegion {
  name: string;
  latMin: number;
  latMax: number;
  lngMin: number;
  lngMax: number;
  priority: number;
}

const NAMED_REGIONS: NamedRegion[] = [
  { name: 'Gulf of Oman',             latMin: 21, latMax: 25, lngMin: 58, lngMax: 63, priority: 2 },
  { name: 'Northwestern Arabian Sea', latMin: 18, latMax: 24, lngMin: 59, lngMax: 68, priority: 3 },
  { name: 'Central Arabian Sea',      latMin: 12, latMax: 20, lngMin: 62, lngMax: 72, priority: 4 },
  { name: 'Southeastern Arabian Sea', latMin:  8, latMax: 16, lngMin: 70, lngMax: 76, priority: 5 },
  { name: 'Laccadive Sea',            latMin:  6, latMax: 13, lngMin: 71, lngMax: 76, priority: 6 },
  { name: 'Gulf of Mannar',           latMin:  8, latMax:  9.5, lngMin: 78, lngMax: 80, priority: 7 },
  { name: 'Northern Bay of Bengal',   latMin: 17, latMax: 21.5, lngMin: 84, lngMax: 92, priority: 8 },
  { name: 'Central Bay of Bengal',    latMin: 11, latMax: 17, lngMin: 81, lngMax: 93, priority: 9 },
  { name: 'Southern Bay of Bengal',   latMin:  5, latMax: 11, lngMin: 81, lngMax: 94, priority: 10 },
  { name: 'Andaman Sea',              latMin:  6, latMax: 15, lngMin: 92, lngMax: 97, priority: 11 },
  { name: 'Equatorial Indian Ocean',  latMin:  2, latMax:  6, lngMin: 60, lngMax: 95, priority: 12 },
  { name: 'North Indian Ocean',       latMin:  2, latMax: 25, lngMin: 58, lngMax: 97, priority: 99 },
];

export const getRegionName = (lat: number, lng: number): string => {
  const matches = NAMED_REGIONS.filter(
    r => lat >= r.latMin && lat <= r.latMax && lng >= r.lngMin && lng <= r.lngMax
  );
  if (matches.length === 0) return 'North Indian Ocean';
  matches.sort((a, b) => a.priority - b.priority);
  return matches[0].name;
};

// ─── SUITABILITY FUNCTION ─────────────────────────────────────────────────────

/**
 * Trapezoidal-Gaussian thermal habitat suitability function.
 */
export const calculateThermalSuitability = (temp: number, species: MockSpecies): number => {
  const { minTemp, optTempMin, optTempMax, maxTemp } = species;

  // Within optimal plateau → 100%
  if (temp >= optTempMin && temp <= optTempMax) return 100;

  const hardLow = minTemp - 2;
  const hardHigh = maxTemp + 2;

  // Outside hard tolerance → near zero (≤5)
  if (temp < hardLow || temp > hardHigh) {
    const dist = temp < hardLow ? hardLow - temp : temp - hardHigh;
    return Math.max(0, Math.round(5 * Math.exp(-dist * 1.5)));
  }

  if (temp < optTempMin) {
    // Below optimal plateau — Gaussian decay toward minTemp
    const sigma1 = Math.max(0.5, (optTempMin - minTemp) / 1.8);
    const score = 100 * Math.exp(-Math.pow(optTempMin - temp, 2) / (2 * sigma1 * sigma1));
    return Math.min(100, Math.max(0, Math.round(score)));
  }

  // Above optimal plateau — Gaussian decay toward maxTemp
  const sigma2 = Math.max(0.5, (maxTemp - optTempMax) / 1.8);
  const score = 100 * Math.exp(-Math.pow(temp - optTempMax, 2) / (2 * sigma2 * sigma2));
  return Math.min(100, Math.max(0, Math.round(score)));
};

// ─── DEPTH-AWARE SUITABILITY ──────────────────────────────────────────────────

export const calculateDepthProfileSuitability = (
  surfaceSST: number,
  species: MockSpecies
): DepthSuitabilityPoint[] => {
  const depths = [0, 5, 10, 20, 30, 50, 75, 100, 125, 150, 200, 300, 500];
  return depths
    .filter(d => d >= species.minDepth && d <= species.maxDepth + 50)
    .map(depth => {
      const temp = Number(getDepthTemperature(surfaceSST, depth).toFixed(2));
      const suitability = calculateThermalSuitability(temp, species);
      let category: 'Optimal' | 'Moderate' | 'Sub-optimal' = 'Sub-optimal';
      if (suitability >= 75) category = 'Optimal';
      else if (suitability >= 45) category = 'Moderate';
      return { depth, temp, suitability, category };
    });
};

// ─── DISCRETE OCEAN-ONLY HABITAT GENERATOR ────────────────────────────────────

/**
 * Generates discrete potential habitat points and small irregular ocean-only areas.
 * - STRICT OCEAN MASKING: Absolutely NO points or polygon vertices are allowed on land.
 * - NO generic continuous heatmap: Discrete scientific markers showing potential thermal habitat.
 */
export const generateSpatialHabitatGrid = (
  species: MockSpecies,
  targetDepth: number = 0,
  _gridResolution: number = 1.0,
  date: string = '2022-05-15'
): {
  points: PotentialHabitatPoint[];
  areas: HabitatPolygonArea[];
  summary: SpatialHabitatSummary;
} => {
  const points: PotentialHabitatPoint[] = [];
  let optimalCount = 0;
  let moderateCount = 0;
  let subOptimalCount = 0;
  let totalTempSum = 0;
  let peakLocation: SpatialHabitatSummary['peakLocation'] = null;
  let highestScore = -1;

  // Region accumulation for hotspot detection
  const regionAccumulator: Map<string, { totalSuit: number; count: number; peakTemp: number; lat: number; lng: number }> = new Map();

  // Sampling grid across the North Indian Ocean at 1.5° resolution
  const latMin = 3;
  const latMax = 24.5;
  const lngMin = 59;
  const lngMax = 96;
  const step = 1.5;

  for (let lat = latMin; lat <= latMax; lat += step) {
    for (let lng = lngMin; lng <= lngMax; lng += step) {
      // 1. STRICT OCEAN MASK CHECK
      if (!isPointInOcean(lat, lng)) {
        continue; // REJECT LAND IMMEDIATELY
      }

      // Check species regional constraints
      if (!species.arabianSea && lng < 77.5) continue;
      if (!species.bayOfBengal && lng > 79.0) continue;

      // Date-aware SST from OceanEmbed deterministic simulation
      const sstAtPoint = generateMockSurfaceParameters(lat, lng, date).sst;
      const cellTemp = Number(getDepthTemperature(sstAtPoint, targetDepth).toFixed(1));
      const suitability = calculateThermalSuitability(cellTemp, species);

      let suitabilityCategory: 'High' | 'Moderate' | 'Lower';
      if (suitability >= 70) {
        suitabilityCategory = 'High';
        optimalCount++;
      } else if (suitability >= 40) {
        suitabilityCategory = 'Moderate';
        moderateCount++;
      } else {
        suitabilityCategory = 'Lower';
        subOptimalCount++;
      }

      const regionName = getRegionName(lat, lng);

      // Accumulate region stats
      if (!regionAccumulator.has(regionName)) {
        regionAccumulator.set(regionName, { totalSuit: 0, count: 0, peakTemp: cellTemp, lat, lng });
      }
      const acc = regionAccumulator.get(regionName)!;
      acc.totalSuit += suitability;
      acc.count++;
      if (suitability > calculateThermalSuitability(acc.peakTemp, species)) {
        acc.peakTemp = cellTemp;
        acc.lat = lat;
        acc.lng = lng;
      }

      if (suitability > highestScore) {
        highestScore = suitability;
        peakLocation = {
          lat: Number(lat.toFixed(2)),
          lng: Number(lng.toFixed(2)),
          temp: cellTemp,
          suitability,
          regionName
        };
      }

      totalTempSum += cellTemp;

      // Add to potential habitat points
      points.push({
        id: `pt-${lat.toFixed(1)}-${lng.toFixed(1)}`,
        lat,
        lng,
        depth: targetDepth,
        temp: cellTemp,
        suitability,
        suitabilityCategory,
        regionName,
        confidence: species.sourceConfidence,
        label: 'Potential Thermal Habitat'
      });
    }
  }

  const totalPoints = points.length;
  const approxPointAreaSqKm = 14500;
  const optimalAreaSqKm = Math.round(optimalCount * approxPointAreaSqKm);
  const coveragePercent = totalPoints > 0 ? Math.round(((optimalCount + moderateCount * 0.5) / totalPoints) * 100) : 0;

  // Build hotspot list from regional aggregation
  const hotspots: HabitatHotspot[] = Array.from(regionAccumulator.entries())
    .filter(([, v]) => v.count >= 2)
    .map(([name, v]) => {
      const avgSuitability = Math.round(v.totalSuit / v.count);
      const cat: HabitatHotspot['category'] =
        avgSuitability >= 65 ? 'High' : avgSuitability >= 40 ? 'Moderate' : 'Low';
      return {
        rank: 0,
        regionName: name,
        lat: v.lat,
        lng: v.lng,
        avgSuitability,
        peakTemp: Number(v.peakTemp.toFixed(1)),
        category: cat
      };
    })
    .sort((a, b) => b.avgSuitability - a.avgSuitability)
    .slice(0, 6)
    .map((h, i) => ({ ...h, rank: i + 1 }));

  // Generate ocean-only habitat polygon zones for High AND Moderate hotspots
  const areas: HabitatPolygonArea[] = [];
  const zoneHotspots = hotspots.filter(h => h.category !== 'Low').slice(0, 6);

  zoneHotspots.forEach((hs, idx) => {
    // Generate larger rectangular-ish polygon vertices around hotspot center
    const radiusLat = hs.category === 'High' ? 1.8 : 1.2;
    const radiusLng = hs.category === 'High' ? 2.0 : 1.5;
    const candidateVertices: [number, number][] = [
      [hs.lat + radiusLat,        hs.lng - radiusLng * 0.4],
      [hs.lat + radiusLat * 0.8,  hs.lng + radiusLng],
      [hs.lat + radiusLat * 0.1,  hs.lng + radiusLng * 1.1],
      [hs.lat - radiusLat * 0.8,  hs.lng + radiusLng * 0.9],
      [hs.lat - radiusLat,        hs.lng - radiusLng * 0.1],
      [hs.lat - radiusLat * 0.4,  hs.lng - radiusLng],
      [hs.lat + radiusLat * 0.5,  hs.lng - radiusLng * 0.9],
    ];

    // Strictly ensure all polygon vertices remain in the ocean
    const validVertices = candidateVertices.filter(([vlat, vlng]) => isPointInOcean(vlat, vlng));
    if (validVertices.length >= 3) {
      areas.push({
        id: `area-${idx}-${hs.regionName.replace(/\s+/g, '-').toLowerCase()}`,
        name: `${hs.regionName} Thermal Zone`,
        category: hs.category,
        avgSuitability: hs.avgSuitability,
        avgTemp: hs.peakTemp,
        depth: targetDepth,
        coordinates: validVertices
      });
    }
  });

  const summary: SpatialHabitatSummary = {
    species,
    targetDepth,
    totalPoints,
    optimalPoints: optimalCount,
    moderatePoints: moderateCount,
    subOptimalPoints: subOptimalCount,
    optimalAreaSqKm,
    coveragePercent,
    peakLocation,
    avgRegionTemp: totalPoints > 0 ? Number((totalTempSum / totalPoints).toFixed(1)) : 26.5,
    hotspots
  };

  return { points, areas, summary };
};

// ─── POINT HABITAT ANALYSIS ───────────────────────────────────────────────────

export const analyzeHabitat = (
  species: MockSpecies,
  predictionData: PredictionResponse | null
): HabitatAnalysisResult => {
  if (!predictionData || !predictionData.predictions || predictionData.predictions.length === 0) {
    return { score: 0, category: 'Low', compatibleDepths: null, surfaceTemp: null, optimalDepthRange: null };
  }

  const preds = predictionData.predictions;
  const compatiblePoints: number[] = [];
  const optimalPoints: number[] = [];

  for (const p of preds) {
    const s = calculateThermalSuitability(p.predicted_temperature, species);
    if (s >= 30) compatiblePoints.push(p.depth);
    if (s >= 70) optimalPoints.push(p.depth);
  }

  const scoreRatio = preds.length > 0
    ? preds.reduce((sum, p) => sum + calculateThermalSuitability(p.predicted_temperature, species), 0) / preds.length
    : 0;

  const rawScore = Math.min(100, Math.round(scoreRatio));
  let category: 'High' | 'Moderate' | 'Low' = 'Low';
  if (rawScore >= 70) category = 'High';
  else if (rawScore >= 40) category = 'Moderate';

  return {
    score: rawScore,
    category,
    compatibleDepths: compatiblePoints.length > 0
      ? [compatiblePoints[0], compatiblePoints[compatiblePoints.length - 1]]
      : null,
    optimalDepthRange: optimalPoints.length > 0
      ? [optimalPoints[0], optimalPoints[optimalPoints.length - 1]]
      : null,
    surfaceTemp: preds.length > 0 ? preds[0].predicted_temperature : null
  };
};

// ─── INSIGHT TEXT GENERATOR ───────────────────────────────────────────────────

export const getFisheriesInsight = (
  result: HabitatAnalysisResult | SpatialHabitatSummary,
  species: MockSpecies
): string => {
  if ('optimalAreaSqKm' in result) {
    const depthLabel = result.targetDepth === 0 ? 'surface' : `${result.targetDepth}m`;
    return `Based on OceanEmbed thermal profiling at ${depthLabel} depth, ${species.name} (${species.scientificName}) demonstrates an estimated optimal thermal habitat extent of ${result.optimalAreaSqKm.toLocaleString()} km² across the North Indian Ocean (${result.coveragePercent}% regional suitability). Peak potential thermal habitat detected at ${result.peakLocation?.lat}°N, ${result.peakLocation?.lng}°E (${result.peakLocation?.temp}°C, ${result.peakLocation?.suitability}% suitability) in ${result.peakLocation?.regionName}.`;
  }

  if (!result.compatibleDepths) {
    return `At the selected coordinates, the OceanEmbed reconstructed temperature profile does not intersect the thermal tolerance range (${species.minTemp}–${species.maxTemp}°C) of ${species.name}. The area is thermally unsuitable at this depth and date.`;
  }

  const optStr = result.optimalDepthRange
    ? ` Optimal thermal conditions (${species.optTempMin}–${species.optTempMax}°C) occur between ${result.optimalDepthRange[0]}m and ${result.optimalDepthRange[1]}m.`
    : '';

  return `At the selected coordinates, the OceanEmbed reconstructed temperature profile remains within the thermal tolerance range (${species.minTemp}–${species.maxTemp}°C) of ${species.name} between approximately ${result.compatibleDepths[0]}m and ${result.compatibleDepths[1]}m.${optStr}`;
};

