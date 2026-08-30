import type { PredictionResponse, SurfaceParameters } from '../types';
import { runFakeInference, generateMockSurfaceParameters } from './fakeModel';

/**
 * Service layer for predictions.
 * The UI should ONLY communicate with this service.
 */
export const predictSubsurfaceTemperature = async (
  latitude: number,
  longitude: number,
  date: string
): Promise<PredictionResponse> => {
  // Simulate network delay to make the demo feel like a real ML inference request (500 - 1000ms)
  const delay = Math.floor(Math.random() * 500) + 500;
  
  return new Promise((resolve) => {
    setTimeout(() => {
      // In the future, this will be replaced with a real `fetch` or `axios` call to the ML API.
      const response = runFakeInference(latitude, longitude, date);
      resolve(response);
    }, delay);
  });
};

export const getSurfaceObservations = async (lat: number, lng: number): Promise<SurfaceParameters> => {
  // Simulate a very fast API call for surface data
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(generateMockSurfaceParameters(lat, lng));
    }, 200);
  });
};
