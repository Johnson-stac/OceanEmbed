export type VariableType = 
  | 'Temperature'
  | 'Temperature Anomaly'
  | 'Salinity'
  | 'Sea Level Anomaly'
  | 'Surface Current'
  | 'Ocean Heat Content'
  | 'Habitat Suitability';

export type DepthType = 0 | 50 | 100 | 200 | 500 | 1000;

export type ViewMode = 'Normal' | 'Anomaly' | 'Change';

export interface MonthState {
  year: number;
  month: number; // 1-12
  label: string; // e.g. "Jun 2023"
  fullLabel: string; // e.g. "JUNE 2023"
  isoDate: string; // "2023-06-01"
  season: 'Pre-Monsoon' | 'Southwest Monsoon' | 'Post-Monsoon' | 'Winter';
}

export interface GridPointData {
  lat: number;
  lng: number;
  val: number;
  anomaly: number;
  baseVal: number;
}

export interface LocationSnapshot {
  lat: number;
  lng: number;
  dateLabel: string;
  depth: DepthType;
  variable: VariableType;
  val: number;
  anomaly: number;
  unit: string;
  confidence: number;
}

export interface TimeSeriesPoint {
  dateLabel: string;
  year: number;
  month: number;
  val: number;
  anomaly: number;
  isCurrent: boolean;
}

export interface DepthTimeCell {
  depth: DepthType;
  dateLabel: string;
  val: number;
}
