import React from 'react';
import { TileLayer } from 'react-leaflet';
import { NASA_GIBS_LAYERS, type ActiveNasaState } from '../../services/nasa/gibsConfig';
import { getGibsTileUrl, checkLayerAvailability } from '../../services/nasa/gibsUtils';

interface NasaTileLayerProps {
  nasaState: ActiveNasaState;
  selectedDate: string;
}

export const NasaTileLayer: React.FC<NasaTileLayerProps> = ({ nasaState, selectedDate }) => {
  const activeLayerIds = Object.keys(nasaState.enabledLayers).filter(
    (id) => nasaState.enabledLayers[id]
  );

  if (activeLayerIds.length === 0) {
    return null;
  }

  return (
    <>
      {activeLayerIds.map((layerId, idx) => {
        const layerDef = NASA_GIBS_LAYERS[layerId];
        if (!layerDef) return null;

        const availability = checkLayerAvailability(layerDef, selectedDate);
        if (!availability.available) return null;

        const tileUrl = getGibsTileUrl(layerId, selectedDate);

        return (
          <TileLayer
            key={`${layerId}-${selectedDate}`}
            url={tileUrl}
            opacity={nasaState.opacity}
            maxNativeZoom={layerDef.maxZoom}
            maxZoom={12}
            attribution={`&copy; <a href="https://nasa-gibs.github.io/gibs-api-docs/" target="_blank" rel="noopener noreferrer">${layerDef.attribution}</a>`}
            zIndex={200 + idx}
          />
        );
      })}
    </>
  );
};
