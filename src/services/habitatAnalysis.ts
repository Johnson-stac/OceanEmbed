import type { MockSpecies } from '../data/mockSpecies';
import type { PredictionResponse } from '../types';

export interface HabitatAnalysisResult {
  score: number;
  category: 'High' | 'Moderate' | 'Low';
  compatibleDepths: [number, number] | null;
  surfaceTemp: number | null;
}

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
    } else {
      if (compatibleStart !== null && compatibleEnd === null) {
        compatibleEnd = p.depth;
      }
    }
  }

  const scoreRatio = preds.length > 0 ? matches / preds.length : 0;
  
  // Calculate a mock score out of 100
  // For demonstration, we boost it a bit so it looks nice if there's any match
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

export const getFisheriesInsight = (result: HabitatAnalysisResult, species: MockSpecies): string => {
  if (!result.compatibleDepths) {
    return `At the selected location, the predicted temperature profile does not intersect the demonstration thermal range (${species.minTemp}-${species.maxTemp}°C) of the selected species. This thermal information could be combined with other biological data in a future habitat modeling system.`;
  }

  return `At the selected location, the predicted temperature profile remains within the demonstration thermal range (${species.minTemp}-${species.maxTemp}°C) of the selected species between approximately ${result.compatibleDepths[0]}m and ${result.compatibleDepths[1]}m. This thermal information could be combined with biological observations, chlorophyll, productivity, currents and fisheries data in a future habitat modeling system.`;
};
