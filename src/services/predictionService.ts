import type {
  PredictionResponse,
  SurfaceParameters,
  DateRangeAnalysisResult,
  AdvancedFilterCriteria,
  AdvancedFilterResult
} from '../types';
import {
  runFakeInference,
  generateMockSurfaceParameters,
  calculateDateRangeAnalysis,
  matchDatesByConditions
} from './fakeModel';

/**
 * Service layer for predictions and temporal queries.
 * The UI components communicate with this service interface.
 */

export const predictSubsurfaceTemperature = async (
  latitude: number,
  longitude: number,
  date: string
): Promise<PredictionResponse> => {
  const delay = Math.floor(Math.random() * 400) + 400;
  return new Promise((resolve) => {
    setTimeout(() => {
      const response = runFakeInference(latitude, longitude, date);
      resolve(response);
    }, delay);
  });
};

export const getSurfaceObservations = async (
  lat: number,
  lng: number,
  date?: string
): Promise<SurfaceParameters> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(generateMockSurfaceParameters(lat, lng, date));
    }, 150);
  });
};

/**
 * Basic Filter Service: Computes average values for all inputs across a date span
 */
export const getDateRangeAnalysis = async (
  lat: number,
  lng: number,
  startDate: string,
  endDate: string
): Promise<DateRangeAnalysisResult> => {
  const delay = Math.floor(Math.random() * 300) + 300;
  return new Promise((resolve) => {
    setTimeout(() => {
      const result = calculateDateRangeAnalysis(lat, lng, startDate, endDate);
      resolve(result);
    }, delay);
  });
};

/**
 * Advance Filter Service: Evaluates conditions and suggests matching dates
 */
export const getSuggestedDatesForConditions = async (
  lat: number,
  lng: number,
  criteria: AdvancedFilterCriteria,
  searchHorizonYears?: number[]
): Promise<AdvancedFilterResult> => {
  const delay = Math.floor(Math.random() * 350) + 350;
  return new Promise((resolve) => {
    setTimeout(() => {
      const result = matchDatesByConditions(lat, lng, criteria, searchHorizonYears);
      resolve(result);
    }, delay);
  });
};
