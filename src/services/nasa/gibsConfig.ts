export interface GibsLayerDefinition {
  id: string;
  name: string;
  gibsLayerId: string;
  format: 'png' | 'jpg';
  tileMatrixSet: string;
  maxZoom: number;
  description: string;
  unit?: string;
  defaultOpacity: number;
  category: 'temperature' | 'biology' | 'imagery';
  minDate?: string; // YYYY-MM-DD
  maxDate?: string; // YYYY-MM-DD
  attribution: string;
}

export const NASA_GIBS_LAYERS: Record<string, GibsLayerDefinition> = {
  sst: {
    id: 'sst',
    name: 'Sea Surface Temperature',
    gibsLayerId: 'GHRSST_L4_MUR_Sea_Surface_Temperature',
    format: 'png',
    tileMatrixSet: 'GoogleMapsCompatible_Level7',
    maxZoom: 7,
    description: 'GHRSST Level 4 MUR Global Foundation Sea Surface Temperature',
    unit: '°C / K',
    defaultOpacity: 0.75,
    category: 'temperature',
    minDate: '2002-06-01',
    attribution: 'NASA EOSDIS GIBS / GHRSST MUR',
  },
  sst_anomaly: {
    id: 'sst_anomaly',
    name: 'SST Anomaly',
    gibsLayerId: 'GHRSST_L4_MUR_Sea_Surface_Temperature_Anomalies',
    format: 'png',
    tileMatrixSet: 'GoogleMapsCompatible_Level7',
    maxZoom: 7,
    description: 'GHRSST Level 4 MUR Sea Surface Temperature Anomalies',
    unit: '°C Anomaly',
    defaultOpacity: 0.75,
    category: 'temperature',
    minDate: '2002-06-01',
    attribution: 'NASA EOSDIS GIBS / GHRSST MUR',
  },
  chlorophyll: {
    id: 'chlorophyll',
    name: 'Chlorophyll-a',
    gibsLayerId: 'VIIRS_NOAA20_Chlorophyll_a',
    format: 'png',
    tileMatrixSet: 'GoogleMapsCompatible_Level7',
    maxZoom: 7,
    description: 'VIIRS NOAA-20 Surface Chlorophyll-a Concentration',
    unit: 'mg/m³',
    defaultOpacity: 0.75,
    category: 'biology',
    minDate: '2018-01-01',
    attribution: 'NASA EOSDIS GIBS / NOAA VIIRS',
  },
  true_color: {
    id: 'true_color',
    name: 'True Color',
    gibsLayerId: 'VIIRS_NOAA20_CorrectedReflectance_TrueColor',
    format: 'jpg',
    tileMatrixSet: 'GoogleMapsCompatible_Level9',
    maxZoom: 9,
    description: 'VIIRS NOAA-20 Corrected Reflectance True Color Satellite Imagery',
    defaultOpacity: 0.85,
    category: 'imagery',
    minDate: '2018-01-01',
    attribution: 'NASA EOSDIS GIBS / NOAA VIIRS',
  },
};

export interface ActiveNasaState {
  enabledLayers: Record<string, boolean>;
  opacity: number;
}

export const DEFAULT_NASA_STATE: ActiveNasaState = {
  enabledLayers: {
    sst: true,
    sst_anomaly: false,
    chlorophyll: false,
    true_color: false,
  },
  opacity: 0.75,
};
