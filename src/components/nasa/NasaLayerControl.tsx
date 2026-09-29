import React, { useState } from 'react';
import { Satellite, ChevronUp, AlertCircle, Info, Layers } from 'lucide-react';
import { NASA_GIBS_LAYERS, type ActiveNasaState } from '../../services/nasa/gibsConfig';
import { getNasaDataStatus, formatGibsDate } from '../../services/nasa/gibsUtils';

interface NasaLayerControlProps {
  nasaState: ActiveNasaState;
  onNasaStateChange: (newState: ActiveNasaState) => void;
  selectedDate: string;
  className?: string;
}

export const NasaLayerControl: React.FC<NasaLayerControlProps> = ({
  nasaState,
  onNasaStateChange,
  selectedDate,
  className = '',
}) => {
  // Closed by default per requirement #8
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const formattedDate = formatGibsDate(selectedDate);
  const status = getNasaDataStatus(nasaState.enabledLayers, selectedDate);

  const toggleLayer = (layerId: string) => {
    const updatedLayers = {
      ...nasaState.enabledLayers,
      [layerId]: !nasaState.enabledLayers[layerId],
    };
    onNasaStateChange({
      ...nasaState,
      enabledLayers: updatedLayers,
      opacity: 1.0, // Fixed at 100% opacity per requirement #10
    });
  };

  const activeCount = Object.values(nasaState.enabledLayers).filter(Boolean).length;

  return (
    <div className={`font-sans z-[400] text-slate-800 ${className}`}>
      {/* Closed State: Compact LAYERS Button */}
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-xs font-bold transition-colors shadow-sm rounded-none cursor-pointer"
          title="Open Satellite Layer Controls"
        >
          <Layers className="w-3.5 h-3.5 text-ocean-700" />
          <span>LAYERS</span>
          {activeCount > 0 && (
            <span className="bg-ocean-700 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-none">
              {activeCount}
            </span>
          )}
        </button>
      ) : (
        /* Expanded Control Panel - White with Sharp Borders */
        <div className="bg-white border border-slate-300 shadow-md w-72 text-slate-900 rounded-none">
          {/* Header */}
          <div
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-between px-3.5 py-2.5 cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors border-b border-slate-200"
          >
            <div className="flex items-center gap-2">
              <Satellite className="w-4 h-4 text-ocean-700" />
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-900 block">
                  NASA SATELLITE LAYERS
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Date: {formattedDate}</span>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              className="text-slate-500 hover:text-slate-900 p-1 rounded-none cursor-pointer"
              aria-label="Close Layer Control"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          </div>

          {/* Layer Options */}
          <div className="p-3 space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Active Layers (100% Opacity)
            </div>

            {Object.values(NASA_GIBS_LAYERS).map((layer) => {
              const isChecked = !!nasaState.enabledLayers[layer.id];
              return (
                <label
                  key={layer.id}
                  className={`flex items-center justify-between p-2 text-xs cursor-pointer border transition-colors rounded-none ${
                    isChecked
                      ? 'bg-ocean-50 border-ocean-500 text-ocean-900 font-semibold'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleLayer(layer.id)}
                      className="w-3.5 h-3.5 rounded-none text-ocean-700 focus:ring-ocean-600 border-slate-300 accent-ocean-700 cursor-pointer"
                    />
                    <span>{layer.name}</span>
                  </div>
                  {layer.unit && (
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 border border-slate-200">
                      {layer.unit}
                    </span>
                  )}
                </label>
              );
            })}

            {!status.available && status.message && (
              <div className="bg-amber-50 border border-amber-300 p-2 text-[10px] text-amber-900 flex items-start gap-1.5 font-medium rounded-none">
                <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                <span>{status.message}</span>
              </div>
            )}

            <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-2 border-t border-slate-200">
              <span className="flex items-center gap-1">
                <Info className="w-3 h-3 text-slate-400" /> NASA GIBS API
              </span>
              <span>EPSG:3857 WMTS</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
