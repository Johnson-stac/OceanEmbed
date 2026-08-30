import type { SurfaceParameters, DepthPrediction, PredictionResponse, CorrelationResult } from '../types';

/**
 * ARCHITECTURE NOTE:
 * This fakeModel.ts file is a placeholder simulation layer.
 * 
 * IMPORTANT: The real machine learning model is NOT ready yet.
 * Do not import this file directly into any UI components.
 * 
 * Once the real model or backend API is ready, you will replace 
 * the logic in `predictionService.ts` to call the real API instead of this file.
 */

export const generateMockSurfaceParameters = (lat: number, lng: number): SurfaceParameters => {
  // Generate pseudo-random but plausible values based roughly on coordinates
  // to give some spatial variation.
  const latFactor = (lat - 5) / 25; // 0 to 1 across 5N to 30N
  
  const baseSst = 30 - (latFactor * 4); // Warmer south, cooler north
  // Deterministic variation keeps the observed inputs consistent with the
  // subsequent mock inference for the same location.
  const sst = baseSst + (Math.sin(lng) * 1.5) + (Math.sin(lat + lng) * 0.25);
  
  const sss = 34.5 + (Math.cos(lat) * 1.2) + (Math.cos(lng) * 0.2); // PSU
  const sla = 0.3 + (Math.sin(lat * lng) * 0.2) + (Math.sin(lat + lng) * 0.05); // Meters
  
  const current_u = (Math.cos(lat * 0.1) * 0.5) + (Math.sin(lng) * 0.1); // m/s
  const current_v = (Math.sin(lng * 0.1) * 0.5) + (Math.cos(lat) * 0.1); // m/s
  
  const wind_u = (Math.cos(lng * 0.2) * 5.0) + Math.sin(lat) // m/s
  const wind_v = (Math.sin(lat * 0.2) * 5.0) + Math.cos(lng) // m/s

  return { sst, sss, sla, current_u, current_v, wind_u, wind_v };
};

const generateMockDepthProfile = (surfaceTemp: number): DepthPrediction[] => {
  const depths = [0, 5, 10, 20, 30, 50, 75, 100, 125, 150, 200, 300, 500, 700, 1000];
  const predictions: DepthPrediction[] = [];
  
  let currentTemp = surfaceTemp;

  depths.forEach((depth, index) => {
    // Temperature generally decreases with depth
    // Mixed layer depth is usually around 20-40m in the Indian Ocean, so drop becomes sharper after.
    let drop = 0;
    if (depth <= 20) {
      drop = Math.random() * 0.5; // Small drop in mixed layer
    } else if (depth <= 50) {
      drop = 1.0 + Math.random() * 2.0; // Sharper thermocline
    } else {
      drop = 2.0 + Math.random() * 3.0; // Deep water
    }
    
    currentTemp = currentTemp - drop;
    
    // Uncertainty increases slightly with depth
    const uncertainty = 0.2 + (index * 0.15) + (Math.random() * 0.1);

    predictions.push({
      depth,
      predicted_temperature: currentTemp,
      lower_bound: currentTemp - uncertainty,
      upper_bound: currentTemp + uncertainty,
    });
  });

  return predictions;
};

const generateMockCorrelations = (): CorrelationResult[] => {
  return [
    { parameter: 'SST', correlationCoefficient: 0.85, importanceScore: 0.9 }, // Strong positive
    { parameter: 'SSS', correlationCoefficient: -0.65, importanceScore: 0.7 }, // Strong negative
    { parameter: 'SLA', correlationCoefficient: 0.45, importanceScore: 0.5 }, // Weak positive
    { parameter: 'Current U', correlationCoefficient: 0.15, importanceScore: 0.2 }, // Near zero
    { parameter: 'Current V', correlationCoefficient: -0.25, importanceScore: 0.3 }, // Weak negative
    { parameter: 'Wind U', correlationCoefficient: -0.10, importanceScore: 0.1 }, // Near zero
    { parameter: 'Wind V', correlationCoefficient: 0.05, importanceScore: 0.1 }, // Near zero
  ];
};

export const runFakeInference = (lat: number, lng: number, date: string): PredictionResponse => {
  const surface_parameters = generateMockSurfaceParameters(lat, lng);
  const predictions = generateMockDepthProfile(surface_parameters.sst);
  const correlations = generateMockCorrelations();

  return {
    location: {
      lat,
      lng
    },
    date,
    surface_parameters,
    predictions,
    correlations,
    // Kept in the mock data layer so the UI can be swapped to a real API later.
    demo_confidence: 87,
    model_status: "DEMO"
  };
};
