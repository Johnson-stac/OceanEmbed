import type { DepthPrediction, ChatContext } from '../types';

export interface OceanInsights {
  warmestDepth: number | null;
  warmestTemp: number | null;
  coolestDepth: number | null;
  coolestTemp: number | null;
  surfaceToDeepestDiff: number | null;
  maxAdjacentDecrease: number | null;
  maxAdjacentDecreaseInterval: string | null;
}

export function generateOceanInsights(predictions: DepthPrediction[]): OceanInsights {
  if (!predictions || predictions.length === 0) {
    return {
      warmestDepth: null,
      warmestTemp: null,
      coolestDepth: null,
      coolestTemp: null,
      surfaceToDeepestDiff: null,
      maxAdjacentDecrease: null,
      maxAdjacentDecreaseInterval: null
    };
  }

  let warmest = predictions[0];
  let coolest = predictions[0];
  let maxDecrease = 0;
  let maxDecreaseInterval = '';

  for (let i = 0; i < predictions.length; i++) {
    const current = predictions[i];
    
    if (current.predicted_temperature > warmest.predicted_temperature) {
      warmest = current;
    }
    
    if (current.predicted_temperature < coolest.predicted_temperature) {
      coolest = current;
    }

    if (i > 0) {
      const prev = predictions[i - 1];
      const decrease = prev.predicted_temperature - current.predicted_temperature;
      if (decrease > maxDecrease) {
        maxDecrease = decrease;
        maxDecreaseInterval = `${prev.depth}m to ${current.depth}m`;
      }
    }
  }

  const surface = predictions[0];
  const deepest = predictions[predictions.length - 1];
  const diff = surface.predicted_temperature - deepest.predicted_temperature;

  return {
    warmestDepth: warmest.depth,
    warmestTemp: Number(warmest.predicted_temperature.toFixed(2)),
    coolestDepth: coolest.depth,
    coolestTemp: Number(coolest.predicted_temperature.toFixed(2)),
    surfaceToDeepestDiff: Number(diff.toFixed(2)),
    maxAdjacentDecrease: Number(maxDecrease.toFixed(2)),
    maxAdjacentDecreaseInterval: maxDecreaseInterval,
  };
}

export function buildSystemPrompt(context: ChatContext | null): string {
  let contextStr = "No data selected.";
  
  if (context && context.location) {
    const { date, location, surfaceParameters, predictions } = context;
    const insights = generateOceanInsights(predictions);
    
    contextStr = `Observation Date: ${new Date(date).toLocaleDateString()}

Location:
Latitude: ${location.lat.toFixed(2)}°
Longitude: ${location.lng.toFixed(2)}°

Surface Observations:
SST: ${surfaceParameters?.sst?.toFixed(2) || 'N/A'} °C
SSS: ${surfaceParameters?.sss?.toFixed(2) || 'N/A'} PSU
SLA: ${surfaceParameters?.sla?.toFixed(2) || 'N/A'} m
Eastward Current: ${surfaceParameters?.current_u?.toFixed(2) || 'N/A'} m/s
Northward Current: ${surfaceParameters?.current_v?.toFixed(2) || 'N/A'} m/s

Predicted Subsurface Temperature:
${predictions ? predictions.map(p => `${p.depth} m: ${p.predicted_temperature.toFixed(2)} °C`).join('\n') : 'N/A'}

Key Insights:
Largest predicted temperature decrease: ${insights.maxAdjacentDecrease} °C (Depth interval: ${insights.maxAdjacentDecreaseInterval})
Warmest depth: ${insights.warmestDepth}m (${insights.warmestTemp} °C)
Coolest depth: ${insights.coolestDepth}m (${insights.coolestTemp} °C)
`;
  }

  return `You are the OceanEmbed AI Ocean Analyst. Your job is to explain the model output in understandable scientific language.

CRITICAL INSTRUCTIONS:
1. Explain oceanographic concepts, interpret temperature profiles, and explain surface observations.
2. The provided data is an AI prediction/reconstruction system, NOT a direct measurement instrument. Distinguish between "Observed surface variables" and "AI-predicted subsurface temperatures".
3. Use scientifically responsible wording. Use terms like "predicted", "estimated", "model output", "may indicate", "suggests", "could be associated with".
4. DO NOT present predictions as guaranteed facts. DO NOT invent measurements, depths, temperatures, currents, fish species, vessel fuel consumption, cyclone intensity, or weather forecasts.
5. If information is not present, say so.
6. Keep responses concise and use Markdown for formatting if appropriate.

CURRENT CONTEXT:
${contextStr}
`;
}
