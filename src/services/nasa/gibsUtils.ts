import { NASA_GIBS_LAYERS, type GibsLayerDefinition } from './gibsConfig';

/**
 * Format any date input (ISO string, Date object, or date string) into YYYY-MM-DD format for GIBS API.
 */
export function formatGibsDate(dateInput: string | Date | undefined): string {
  if (!dateInput) {
    return new Date().toISOString().split('T')[0];
  }
  try {
    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) {
      return new Date().toISOString().split('T')[0];
    }
    return d.toISOString().split('T')[0];
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

/**
 * Generate WMTS tile URL for a given GIBS layer and date.
 */
export function getGibsTileUrl(layerId: string, dateInput: string | Date): string {
  const layer = NASA_GIBS_LAYERS[layerId];
  if (!layer) return '';

  const formattedDate = formatGibsDate(dateInput);
  return `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/${layer.gibsLayerId}/default/${formattedDate}/${layer.tileMatrixSet}/{z}/{y}/{x}.${layer.format}`;
}

/**
 * Check whether a layer is available for the specified date.
 */
export function checkLayerAvailability(
  layer: GibsLayerDefinition,
  dateInput: string | Date
): { available: boolean; reason?: string } {
  const formattedDate = formatGibsDate(dateInput);

  if (layer.minDate && formattedDate < layer.minDate) {
    return {
      available: false,
      reason: `Imagery for ${layer.name} is available starting from ${layer.minDate}.`,
    };
  }

  if (layer.maxDate && formattedDate > layer.maxDate) {
    return {
      available: false,
      reason: `Imagery for ${layer.name} is available up to ${layer.maxDate}.`,
    };
  }

  return { available: true };
}

/**
 * Get overall NASA GIBS layer status summary for a selected date and active layers.
 */
export function getNasaDataStatus(
  enabledLayers: Record<string, boolean>,
  dateInput: string | Date
): { available: boolean; activeCount: number; message?: string } {
  const formattedDate = formatGibsDate(dateInput);
  const activeIds = Object.keys(enabledLayers).filter((id) => enabledLayers[id]);

  if (activeIds.length === 0) {
    return { available: true, activeCount: 0 };
  }

  const unavailableLayers: string[] = [];

  for (const id of activeIds) {
    const layer = NASA_GIBS_LAYERS[id];
    if (layer) {
      const status = checkLayerAvailability(layer, dateInput);
      if (!status.available) {
        unavailableLayers.push(layer.name);
      }
    }
  }

  if (unavailableLayers.length > 0) {
    return {
      available: false,
      activeCount: activeIds.length,
      message: `NASA data unavailable for selected date (${formattedDate}) for: ${unavailableLayers.join(', ')}`,
    };
  }

  return {
    available: true,
    activeCount: activeIds.length,
  };
}
