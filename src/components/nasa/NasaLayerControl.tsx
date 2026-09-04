import React, { useState } from 'react';
import { Satellite, ChevronDown, ChevronUp, AlertCircle, Info, Eye } from 'lucide-react';
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
  const [isOpen, setIsOpen] = useState<boolean>(true);
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
    });
  };

  const handleOpacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    onNasaStateChange({
      ...nasaState,
      opacity: val,
    });
  };

  const activeCount = Object.values(nasaState.enabledLayers).filter(Boolean).length;

  return (
    <div className={`bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-xl shadow-lg font-sans transition-all z-[400] text-slate-800 ${className}`}>
      {/* Header Bar */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between px-3.5 py-2.5 cursor-pointer hover:bg-slate-50/80 transition-colors rounded-xl"
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-sky-50 text-sky-600 rounded-lg border border-sky-100">
            <Satellite className="w-4 h-4 text-sky-600" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                NASA Satellite Data
              </span>
              {activeCount > 0 && (
                <span className="bg-sky-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {activeCount}
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-500 font-medium">NASA GIBS Imagery ({formattedDate})</span>
          </div>
        </div>

        <button className="text-slate-400 hover:text-slate-600 p-1" aria-label="Toggle NASA Layer Control">
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Expanded Content */}
      {isOpen && (
        <div className="px-3.5 pb-3.5 pt-1 space-y-3 border-t border-slate-100">
          {/* Layer Selection Checklist */}
          <div className="space-y-1.5 pt-1">
            {Object.values(NASA_GIBS_LAYERS).map((layer) => {
              const isChecked = !!nasaState.enabledLayers[layer.id];
              return (
                <label
                  key={layer.id}
                  className={`flex items-center justify-between p-2 rounded-lg text-xs font-medium cursor-pointer transition-all border ${
                    isChecked
                      ? 'bg-sky-50/60 border-sky-200/80 text-sky-950 font-semibold'
                      : 'bg-slate-50/50 border-transparent text-slate-600 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleLayer(layer.id)}
                      className="w-3.5 h-3.5 rounded text-sky-600 focus:ring-sky-500 border-slate-300 accent-sky-600 cursor-pointer"
                    />
                    <span>{layer.name}</span>
                  </div>
                  {layer.unit && (
                    <span className="text-[10px] font-mono text-slate-400 bg-white/70 px-1.5 py-0.5 rounded border border-slate-200">
                      {layer.unit}
                    </span>
                  )}
                </label>
              );
            })}
          </div>

          {/* Opacity Slider */}
          {activeCount > 0 && (
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between text-[11px] font-medium text-slate-600 mb-1.5">
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3 text-sky-600" /> Layer Opacity
                </span>
                <span className="font-mono font-bold text-sky-700">{Math.round(nasaState.opacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={nasaState.opacity}
                onChange={handleOpacityChange}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
              />
            </div>
          )}

          {/* Data Availability Alert */}
          {!status.available && status.message && (
            <div className="bg-amber-50 border border-amber-200 p-2 rounded-lg text-[11px] text-amber-800 flex items-start gap-1.5 font-medium">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <span>{status.message}</span>
            </div>
          )}

          {/* Attribution Footnote */}
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1">
            <span className="flex items-center gap-1">
              <Info className="w-3 h-3 text-slate-400" /> NASA GIBS API
            </span>
            <span>EPSG:3857 WMTS</span>
          </div>
        </div>
      )}
    </div>
  );
};
