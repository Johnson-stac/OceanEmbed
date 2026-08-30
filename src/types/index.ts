export interface OceanLocation {
  lat: number;
  lng: number;
  name?: string;
  date?: string;
  temperature?: number;
}

export interface SurfaceParameters {
  sst: number;
  sss: number;
  sla: number;
  current_u: number;
  current_v: number;
  wind_u: number;
  wind_v: number;
}

export interface DepthPrediction {
  depth: number; // meters
  predicted_temperature: number; // Celsius
  lower_bound: number;
  upper_bound: number;
}

export interface PredictionResponse {
  location: {
    lat: number;
    lng: number;
  };
  date: string;
  surface_parameters: SurfaceParameters;
  predictions: DepthPrediction[];
  correlations: CorrelationResult[];
  /** Demonstration-only model confidence; not scientifically validated. */
  demo_confidence: number;
  model_status: "DEMO";
}

export interface CorrelationResult {
  parameter: string;
  correlationCoefficient: number;
  importanceScore: number;
}
