import type { MockSpecies } from '../data/mockSpecies';
import type { PredictionResponse } from '../types';
import { getDepthTemperature } from './fakeModel';

export interface SpatialGridCell {
  id: string;
  lat: number;
  lng: number;
  latStep: number;
  lngStep: number;
  temp: number;
  suitability: number; // 0 - 100%
  category: 'Optimal' | 'Moderate' | 'Sub-optimal';
}

export interface SpatialHabitatSummary {
  species: MockSpecies;
  targetDepth: number;
  totalCells: number;
  optimalCells: number;
  moderateCells: number;
  subOptimalCells: number;
  optimalAreaSqKm: number;
  coveragePercent: number;
  peakLocation: { lat: number; lng: number; temp: number; suitability: number } | null;
  avgRegionTemp: number;
}

export interface HabitatAnalysisResult {
  score: number;
  category: 'High' | 'Moderate' | 'Low';
  compatibleDepths: [number, number] | null;
  surfaceTemp: number | null;
}

export const calculateThermalSuitability = (temp: number, species: MockSpecies): number => {
  const { minTemp, optTemp, maxTemp } = species;
  
  if (temp < minTemp - 2 || temp > maxTemp + 2) {
    return Math.max(0, Math.round(15 - Math.abs(temp - optTemp) * 2));
  }
  
  const sigma = (maxTemp - minTemp) / 3.2;
  const score = Math.exp(-Math.pow(temp - optTemp, 2) / (2 * Math.pow(sigma, 2))) * 100;
  
  return Math.min(100, Math.max(0, Math.round(score)));
};

export const generateSpatialHabitatGrid = (
  species: MockSpecies,
  targetDepth: number = 0,
  gridResolution: number = 1.0
): { cells: SpatialGridCell[]; summary: SpatialHabitatSummary } => {
  const latMin = 5;
  const latMax = 28;
  const lngMin = 60;
  const lngMax = 98;
  
  const cells: SpatialGridCell[] = [];
  let optimalCount = 0;
  let moderateCount = 0;
  let subOptimalCount = 0;
  let totalTempSum = 0;
  let peakLocation: { lat: number; lng: number; temp: number; suitability: number } | null = null;
  let highestScore = -1;

  for (let lat = latMin; lat < latMax; lat += gridResolution) {
    for (let lng = lngMin; lng < lngMax; lng += gridResolution) {
      const latCenter = lat + gridResolution / 2;
      const lngCenter = lng + gridResolution / 2;

      const regionalBaseSST = 28.5 
        - (latCenter - 15) * 0.12 
        + Math.sin(lngCenter * 0.1) * 0.8
        + Math.cos(latCenter * 0.15 + lngCenter * 0.1) * 0.5;

      const cellTemp = Number(getDepthTemperature(regionalBaseSST, targetDepth).toFixed(1));
      const suitability = calculateThermalSuitability(cellTemp, species);

      let category: 'Optimal' | 'Moderate' | 'Sub-optimal' = 'Sub-optimal';
      if (suitability >= 75) {
        category = 'Optimal';
        optimalCount++;
      } else if (suitability >= 45) {
        category = 'Moderate';
        moderateCount++;
      } else {
        subOptimalCount++;
      }

      if (suitability > highestScore) {
        highestScore = suitability;
        peakLocation = {
          lat: Number(latCenter.toFixed(2)),
          lng: Number(lngCenter.toFixed(2)),
          temp: cellTemp,
          suitability
        };
      }

      totalTempSum += cellTemp;

      cells.push({
        id: `cell-${lat.toFixed(1)}-${lng.toFixed(1)}`,
        lat: latCenter,
        lng: lngCenter,
        latStep: gridResolution,
        lngStep: gridResolution,
        temp: cellTemp,
        suitability,
        category
      });
    }
  }

  const totalCells = cells.length;
  const approxCellAreaSqKm = 12300 * Math.pow(gridResolution, 2);
  const optimalAreaSqKm = Math.round(optimalCount * approxCellAreaSqKm);
  const coveragePercent = Math.round(((optimalCount + moderateCount * 0.5) / totalCells) * 100);

  const summary: SpatialHabitatSummary = {
    species,
    targetDepth,
    totalCells,
    optimalCells: optimalCount,
    moderateCells: moderateCount,
    subOptimalCells: subOptimalCount,
    optimalAreaSqKm,
    coveragePercent,
    peakLocation,
    avgRegionTemp: Number((totalTempSum / totalCells).toFixed(1))
  };

  return { cells, summary };
};

export const analyzeHabitat = (species: MockSpecies, predictionData: PredictionResponse | null): HabitatAnalysisResult => {
  if (!predictionData || !predictionData.predictions || predictionData.predictions.length === 0) {
    return { score: 0, category: 'Low', compatibleDepths: null, surfaceTemp: null };
  }

  const { minTemp, maxTemp } = species;
  const preds = predictionData.predictions;

  let compatibleStart: number | null = null;
  let compatibleEnd: number | null = null;
  let matches = 0;

  for (const p of preds) {
    if (p.predicted_temperature >= minTemp && p.predicted_temperature <= maxTemp) {
      matches++;
      if (compatibleStart === null) compatibleStart = p.depth;
      compatibleEnd = p.depth;
    }
  }

  const scoreRatio = preds.length > 0 ? matches / preds.length : 0;
  const rawScore = Math.min(100, Math.round((scoreRatio * 100) * 1.5 + (matches > 0 ? 20 : 0)));
  
  let category: 'High' | 'Moderate' | 'Low' = 'Low';
  if (rawScore >= 70) category = 'High';
  else if (rawScore >= 40) category = 'Moderate';

  return {
    score: rawScore,
    category,
    compatibleDepths: compatibleStart !== null ? [compatibleStart, compatibleEnd || compatibleStart] : null,
    surfaceTemp: preds.length > 0 ? preds[0].predicted_temperature : null
  };
};

export const getFisheriesInsight = (result: HabitatAnalysisResult | SpatialHabitatSummary, species: MockSpecies): string => {
  if ('optimalAreaSqKm' in result) {
    return `Based on thermal profiling at ${result.targetDepth}m depth, ${species.name} (${species.scientificName}) has an estimated optimal thermal habitat area of ${result.optimalAreaSqKm.toLocaleString()} km² across the North Indian Ocean (${result.coveragePercent}% regional suitability). Peak thermal match is located near ${result.peakLocation?.lat}°N, ${result.peakLocation?.lng}°E (${result.peakLocation?.temp}°C).`;
  }

  if (!result.compatibleDepths) {
    return `At the selected location, the predicted temperature profile does not intersect the thermal range (${species.minTemp}-${species.maxTemp}°C) of ${species.name}.`;
  }

  return `At the selected location, the predicted temperature profile remains within the thermal range (${species.minTemp}-${species.maxTemp}°C) of ${species.name} between approximately ${result.compatibleDepths[0]}m and ${result.compatibleDepths[1]}m.`;
};
