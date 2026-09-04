import React, { useState } from 'react';
import { MapContainer, TileLayer, Rectangle, Tooltip, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Navigation, Info, Zap } from 'lucide-react';
import type { 
  GridPointData, 
  MonthState, 
  DepthType, 
  VariableType, 
  ViewMode 
} from './timeMachineTypes';
import { VARIABLE_META } from './timeMachineData';
import { DEFAULT_NASA_STATE, type ActiveNasaState } from '../../services/nasa/gibsConfig';
import { NasaTileLayer } from '../../components/nasa/NasaTileLayer';
import { NasaLayerControl } from '../../components/nasa/NasaLayerControl';

interface TimeMachineMapProps {
  gridData: GridPointData[];
  currentMonthState: MonthState;
  depth: DepthType;
  variable: VariableType;
  mode: ViewMode;
  selectedLocation: { lat: number; lng: number } | null;
  onLocationSelect: (loc: { lat: number; lng: number }) => void;
  isRevealed: boolean;
  onToggleReveal: () => void;
}

// Custom Leaflet pin icon for selected coordinate
const customPinIcon = L.divIcon({
  className: 'custom-pin-marker',
  html: `<div class="w-6 h-6 rounded-full bg-cyan-600 border-2 border-white shadow-lg flex items-center justify-center animate-bounce">
          <div class="w-2 h-2 rounded-full bg-white"></div>
        </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

// Color mapping function for grid cells
function getColorForValue(val: number, variable: VariableType, mode: ViewMode): { fill: string; border: string; opacity: number } {
  if (mode === 'Anomaly' || mode === 'Change' || variable === 'Temperature Anomaly') {
    const norm = Math.max(-1, Math.min(1, val / 2.5));
    if (norm < 0) {
      // Blue tones for negative anomaly
      const abs = Math.abs(norm);
      return {
        fill: `rgba(37, 99, 235, ${0.45 + abs * 0.4})`,
        border: 'rgba(29, 78, 216, 0.7)',
        opacity: 0.5 + abs * 0.35
      };
    } else {
      // Warm Red/Orange tones for positive anomaly
      return {
        fill: `rgba(225, 29, 72, ${0.45 + norm * 0.4})`,
        border: 'rgba(190, 18, 60, 0.7)',
        opacity: 0.5 + norm * 0.35
      };
    }
  }

  const meta = VARIABLE_META[variable] || VARIABLE_META['Temperature'];
  const norm = Math.max(0, Math.min(1, (val - meta.min) / (meta.max - meta.min)));

  if (norm < 0.25) {
    return { fill: 'rgba(14, 116, 144, 0.65)', border: 'rgba(8, 145, 178, 0.8)', opacity: 0.65 };
  } else if (norm < 0.5) {
    return { fill: 'rgba(16, 185, 129, 0.65)', border: 'rgba(5, 150, 105, 0.8)', opacity: 0.65 };
  } else if (norm < 0.75) {
    return { fill: 'rgba(245, 158, 11, 0.7)', border: 'rgba(217, 119, 6, 0.85)', opacity: 0.7 };
  } else {
    return { fill: 'rgba(239, 68, 68, 0.75)', border: 'rgba(220, 38, 38, 0.9)', opacity: 0.75 };
  }
}



export const TimeMachineMap: React.FC<TimeMachineMapProps> = ({
  gridData,
  currentMonthState,
  depth,
  variable,
  mode,
  selectedLocation,
  onLocationSelect,
  isRevealed,
  onToggleReveal
}) => {
  const [nasaState, setNasaState] = useState<ActiveNasaState>(DEFAULT_NASA_STATE);
  const meta = VARIABLE_META[variable] || VARIABLE_META['Temperature'];
  const currentDateIso = `${currentMonthState.year}-${currentMonthState.month < 10 ? '0' + currentMonthState.month : currentMonthState.month}-15`;

  // Map step size for rectangular ocean grid cell bounds (~0.8° cell step)
  const STEP = 0.8;

  return (
    <div className="relative w-full h-full min-h-[580px] bg-slate-100 rounded-2xl overflow-hidden border border-slate-300 shadow-md flex flex-col z-0">
      
      {/* Leaflet Map Engine */}
      <MapContainer
        center={[16.5, 78.0]}
        zoom={5}
        minZoom={4}
        maxZoom={9}
        scrollWheelZoom={true}
        maxBounds={[[-5, 45], [35, 115]]}
        style={{ height: '100%', width: '100%', position: 'absolute' }}
        className="z-0 bg-[#e5f0f8]"
      >
        {/* Esri World Ocean Basemap Tile Layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.esri.com">Esri World Ocean</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}"
        />

        {/* NASA GIBS Satellite Tile Layers */}
        <NasaTileLayer nasaState={nasaState} selectedDate={currentDateIso} />

        {/* Dynamic Ocean Grid Rectangles */}
        {gridData.map((pt, idx) => {
          const bounds: [[number, number], [number, number]] = [
            [pt.lat - STEP / 2, pt.lng - STEP / 2],
            [pt.lat + STEP / 2, pt.lng + STEP / 2]
          ];
          const style = getColorForValue(pt.val, variable, mode);
          const isSelected = selectedLocation && Math.abs(selectedLocation.lat - pt.lat) < 0.3 && Math.abs(selectedLocation.lng - pt.lng) < 0.3;

          return (
            <Rectangle
              key={`${pt.lat}-${pt.lng}-${idx}`}
              bounds={bounds}
              pathOptions={{
                fillColor: style.fill,
                fillOpacity: isSelected ? 0.95 : style.opacity,
                color: isSelected ? '#06b6d4' : style.border,
                weight: isSelected ? 2.5 : 0.4
              }}
              eventHandlers={{
                click: () => onLocationSelect({ lat: pt.lat, lng: pt.lng })
              }}
            >
              <Tooltip sticky className="custom-leaflet-tooltip font-sans text-xs">
                <div className="font-bold text-slate-900 mb-0.5">
                  {pt.lat}°N, {pt.lng}°E • <span className="text-cyan-700">{depth}m</span>
                </div>
                <div className="text-slate-600">
                  {variable}: <strong className="text-slate-900">{pt.val} {meta.unit}</strong>
                </div>
                <div className="text-slate-600">
                  Anomaly: <strong className={pt.anomaly >= 0 ? 'text-amber-600' : 'text-cyan-700'}>
                    {pt.anomaly >= 0 ? `+${pt.anomaly}` : pt.anomaly} {meta.unit}
                  </strong>
                </div>
              </Tooltip>
            </Rectangle>
          );
        })}

        {/* Selected Marker Pin */}
        {selectedLocation && (
          <Marker
            position={[selectedLocation.lat, selectedLocation.lng]}
            icon={customPinIcon}
          />
        )}
      </MapContainer>

      {/* Top Left: Prominent Current Date Display & Seasonal Badge */}
      <div className="absolute top-5 left-5 z-[1000] flex flex-col gap-2 pointer-events-none">
        <div className="bg-white/95 backdrop-blur-md border border-slate-200 px-5 py-3 rounded-2xl shadow-md flex items-center gap-4">
          <div className="w-3 h-3 rounded-full bg-cyan-600 animate-ping" />
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
              {currentMonthState.fullLabel}
            </h2>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mt-0.5">
              <Navigation className="w-3.5 h-3.5 text-cyan-600" />
              <span>North Indian Ocean</span>
              <span className="text-slate-300">•</span>
              <span className="text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200 font-bold">
                {currentMonthState.season}
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Depth & Variable Pill */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <span className="bg-white/90 backdrop-blur text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
            Variable: <strong className="text-cyan-700 font-bold">{variable}</strong>
          </span>
          <span className="bg-white/90 backdrop-blur text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
            Depth: <strong className="text-cyan-700 font-bold">{depth}m</strong>
          </span>
          {mode !== 'Normal' && (
            <span className="bg-amber-50 text-amber-800 text-xs font-semibold px-3 py-1.5 rounded-xl border border-amber-200 shadow-sm">
              Mode: {mode}
            </span>
          )}
        </div>
      </div>

      {/* Top Right: "Reveal Hidden Ocean" Button & Simulated Notice */}
      <div className="absolute top-5 right-5 z-[1000] flex flex-col items-end gap-3 pointer-events-auto">
        <button
          onClick={onToggleReveal}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md border ${
            isRevealed
              ? 'bg-cyan-600 text-white border-cyan-700 shadow-cyan-200 animate-pulse'
              : 'bg-white hover:bg-slate-50 text-cyan-700 border-slate-300 hover:border-cyan-500'
          }`}
        >
          <Zap className="w-4 h-4 text-cyan-600" />
          <span>{isRevealed ? '🌊 Subsurface Active (0m → 1000m)' : '🌊 REVEAL HIDDEN OCEAN'}</span>
        </button>

        <div className="bg-white/90 backdrop-blur text-[11px] text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200 flex items-center gap-1.5 shadow-sm">
          <Info className="w-3.5 h-3.5 text-cyan-600" />
          <span>Simulated Ocean State • Demonstration Data</span>
        </div>
      </div>

      {/* Bottom Left: NASA Satellite Data Layer Control */}
      <div className="absolute bottom-5 left-5 z-[1000] max-w-[275px] pointer-events-auto">
        <NasaLayerControl
          nasaState={nasaState}
          onNasaStateChange={setNasaState}
          selectedDate={currentDateIso}
        />
      </div>

    </div>
  );
};
