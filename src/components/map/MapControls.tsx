import React from 'react';
import { useMap } from 'react-leaflet';
import { RefreshCw } from 'lucide-react';
import type { OceanLocation } from '../../types';

interface MapControlsProps {
  hoverLocation?: OceanLocation | null;
  defaultCenter: [number, number];
  defaultZoom: number;
}

export const MapControls: React.FC<MapControlsProps> = ({ hoverLocation, defaultCenter, defaultZoom }) => {
  const map = useMap();

  const handleReset = () => {
    map.setView(defaultCenter, defaultZoom);
  };

  return (
    <>
      <div className="absolute top-4 left-4 z-[400] flex flex-col gap-2">
        <div className="bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-md border border-slate-200 pointer-events-none">
          <h3 className="font-semibold text-slate-800 text-sm">North Indian Ocean</h3>
          <p className="text-xs text-slate-500 mb-2">Study region · 5–30°N, 60–100°E</p>
          
          <div className="text-[10px] font-mono text-slate-400 bg-slate-50 p-1 rounded border border-slate-100 min-h-[22px]">
            {hoverLocation ? (
              <span>Lat: {hoverLocation.lat.toFixed(3)} | Lng: {hoverLocation.lng.toFixed(3)}</span>
            ) : (
              <span>Hover over map</span>
            )}
          </div>
        </div>
      </div>

      <div className="absolute top-4 right-4 z-[400]">
        <button 
          onClick={handleReset}
          className="bg-white/90 backdrop-blur-sm hover:bg-slate-50 text-slate-700 p-2 rounded-lg shadow-md border border-slate-200 transition-colors flex items-center justify-center"
          title="Reset View"
          aria-label="Reset map view"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>
    </>
  );
};
