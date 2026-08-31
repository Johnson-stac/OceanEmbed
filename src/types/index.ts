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

// Temporal Range & Spatiotemporal Query Types

export interface ParameterStats {
  avg: number;
  min: number;
  max: number;
  stdDev: number;
}

export interface TemporalDataPoint {
  date: string;
  formattedDate: string;
  sst: number;
  sss: number;
  sla: number;
  current_u: number;
  current_v: number;
  current_speed: number;
  wind_u: number;
  wind_v: number;
  wind_speed: number;
}

export interface DateRangeAnalysisResult {
  location: OceanLocation;
  startDate: string;
  endDate: string;
  totalDays: number;
  samplePointsCount: number;
  averages: SurfaceParameters & {
    wind_speed: number;
    current_speed: number;
  };
  stats: {
    sst: ParameterStats;
    sss: ParameterStats;
    sla: ParameterStats;
    wind_speed: ParameterStats;
    current_speed: ParameterStats;
  };
  timeSeries: TemporalDataPoint[];
  depthProfile: DepthPrediction[];
}

// Advanced Filter / Condition Matcher Types

export interface ParameterCondition {
  enabled: boolean;
  min: number;
  max: number;
}

export interface AdvancedFilterCriteria {
  sst: ParameterCondition;
  sss: ParameterCondition;
  sla: ParameterCondition;
  wind_speed: ParameterCondition;
  current_speed: ParameterCondition;
  searchHorizonYears?: number[];
  strictness?: 'strict' | 'moderate' | 'flexible';
}

export interface ParameterMatchDetail {
  parameter: string;
  label: string;
  unit: string;
  actualValue: number;
  targetMin: number;
  targetMax: number;
  isSatisfied: boolean;
  score: number; // 0 to 100
}

export interface SuggestedDateMatch {
  id: string;
  date: string;
  formattedDate: string;
  seasonTag: string;
  matchScore: number; // 0 to 100%
  overallSuitability: 'Excellent' | 'Good' | 'Moderate';
  parameters: SurfaceParameters & {
    wind_speed: number;
    current_speed: number;
  };
  parameterMatches: ParameterMatchDetail[];
  subsurfaceTemp50m: number;
  subsurfaceTemp200m: number;
  description: string;
}

export interface AdvancedFilterResult {
  location: OceanLocation;
  searchedPointsCount: number;
  matchedCount: number;
  activeConditionsCount: number;
  criteria: AdvancedFilterCriteria;
  suggestedDates: SuggestedDateMatch[];
  monthlySuitabilityDistribution: {
    month: string;
    monthIndex: number;
    averageScore: number;
    matchCount: number;
  }[];
}
