import React, { useState } from 'react';
import { MapContainer, TileLayer, Polygon, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { MockSpecies } from '../../data/mockSpecies';
import type {
  PotentialHabitatPoint,
  HabitatPolygonArea,
  SpatialHabitatSummary,
} from '../../services/habitatAnalysis';
import { Layers, Info } from 'lucide-react';
import { DEFAULT_NASA_STATE, type ActiveNasaState } from '../../services/nasa/gibsConfig';
import { NasaTileLayer } from '../nasa/NasaTileLayer';
import { NasaLayerControl } from '../nasa/NasaLayerControl';

interface FisheriesMapProps {
  species: MockSpecies;
  points: PotentialHabitatPoint[];
  areas: HabitatPolygonArea[];
  summary: SpatialHabitatSummary;
  selectedDepth: number;
  onDepthChange: (depth: number) => void;
  selectedDate: string;
  selectedPoint: PotentialHabitatPoint | null;
  onSelectPoint: (point: PotentialHabitatPoint | null) => void;
}

const DEPTH_OPTIONS = [
  { label: 'Surface', sublabel: '0m', value: 0 },
  { label: 'Mixed Layer', sublabel: '50m', value: 50 },
  { label: 'Thermocline', sublabel: '100m', value: 100 },
  { label: 'Subsurface', sublabel: '200m', value: 200 },
];

export const FisheriesMap: React.FC<FisheriesMapProps> = ({
  species,
  areas,
  selectedDepth,
  onDepthChange,
  selectedDate,
}) => {
  const [nasaState, setNasaState] = useState<ActiveNasaState>(DEFAULT_NASA_STATE);

  return (
    <div className="h-full w-full rounded-none border-2 border-slate-300 relative z-0 flex flex-col bg-slate-100 shadow-none">
      {/* ── Top Left Overlay: Species & Depth Filter ── */}
      <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-[1000] bg-white/95 backdrop-blur-xs border border-slate-300 p-2.5 sm:p-3.5 shadow-sm rounded-none max-w-[240px] sm:max-w-xs">
        <div className="flex items-center justify-between gap-1.5 mb-1 sm:mb-1.5">
          <div className="text-[9px] sm:text-[10px] font-bold text-[#0B3A82] uppercase tracking-wider sm:tracking-widest flex items-center gap-1.5">
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-none bg-[#0B3A82]" />
            Habitat Analysis
          </div>
          <span className="text-[9px] sm:text-[10px] font-bold text-[#0B3A82] bg-[#F0F5FC] border border-[#CBDDF3] px-1.5 sm:px-2 py-0.5 rounded-none uppercase">
            {species.category}
          </span>
        </div>

        <h3 className="text-xs sm:text-sm font-black text-slate-900 leading-tight">
          {species.name}
        </h3>
        <p className="text-[10px] sm:text-[11px] italic text-slate-600 mb-1.5 sm:mb-2.5 font-medium line-clamp-1">
          {species.scientificName}
        </p>

        {/* Depth Selector */}
        <div className="flex flex-col gap-1 border-t border-slate-200 pt-1.5 sm:pt-2">
          <div className="text-[8px] sm:text-[9px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
            <Layers className="w-3 h-3 text-[#0B3A82]" /> Analyzed Depth
          </div>
          <div className="flex gap-1 flex-wrap">
            {DEPTH_OPTIONS.filter(
              (opt) => opt.value >= species.minDepth && opt.value <= species.maxDepth + 50
            ).map((opt) => (
              <button
                key={opt.value}
                onClick={() => onDepthChange(opt.value)}
                className={`px-1.5 sm:px-2.5 py-0.5 sm:py-1 text-[9px] sm:text-[10px] font-bold rounded-none transition-colors border ${
                  selectedDepth === opt.value
                    ? 'bg-[#0B3A82] text-white border-[#0B3A82] shadow-sm'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-[#F0F5FC]'
                }`}
              >
                {opt.label} <span className="opacity-80">({opt.sublabel})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom Right: Legend ── */}
      <div className="absolute bottom-2 right-2 sm:bottom-5 sm:right-4 z-[1000] bg-white/95 backdrop-blur-xs border border-slate-300 p-2 sm:p-3 shadow-sm rounded-none max-w-[170px] sm:min-w-[200px]">
        <div className="font-bold text-[#0B3A82] text-[9px] sm:text-[10px] uppercase tracking-wider mb-1.5 sm:mb-2 flex items-center gap-1 border-b border-slate-200 pb-1">
          <Info className="w-3 h-3 text-[#0B3A82] shrink-0" /> Legend
        </div>
        <div className="space-y-1 sm:space-y-1.5 text-[9px] sm:text-[10px]">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="w-3.5 h-2.5 sm:w-4 sm:h-3 bg-[#0B3A82]/25 border-2 border-dashed border-[#0B3A82] shrink-0 inline-block rounded-none" />
            <span className="text-[#0B3A82] font-semibold text-[9px] sm:text-[10px]">High Suitability</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="w-3.5 h-2.5 sm:w-4 sm:h-3 bg-[#2E78E0]/20 border-2 border-dashed border-[#2E78E0] shrink-0 inline-block rounded-none" />
            <span className="text-slate-700 font-medium text-[9px] sm:text-[10px]">Moderate Zone</span>
          </div>
        </div>
        <div className="hidden sm:block mt-2 pt-1.5 border-t border-slate-200 text-[9px] text-slate-500 leading-tight">
          Area-based mapping — strict ocean masking
        </div>
      </div>

      {/* ── NASA Layer Control (Closed by default, 100% opacity) ── */}
      <div className="absolute bottom-2 left-2 sm:bottom-5 sm:left-4 z-[1000] max-w-[180px] sm:max-w-[240px]">
        <NasaLayerControl
          nasaState={nasaState}
          onNasaStateChange={setNasaState}
          selectedDate={selectedDate}
        />
      </div>

      {/* ── Leaflet Map Container (Dominant, sharp rectangular) ── */}
      <MapContainer
        center={[15.5, 78]}
        zoom={5}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        maxBounds={[
          [0, 50],
          [28, 102],
        ]}
        minZoom={4}
        maxZoom={9}
        className="z-0 bg-slate-200"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.esri.com">Esri Ocean</a>'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}"
          opacity={0.9}
        />

        {/* NASA GIBS Satellite Tile Layer (Defaults to True Color, 100% opacity) */}
        <NasaTileLayer nasaState={nasaState} selectedDate={selectedDate} />

        {/* ── Polygon Habitat Zones ── */}
        {areas.map((area) => (
          <Polygon
            key={area.id}
            positions={area.coordinates}
            pathOptions={{
              color: area.category === 'High' ? '#0B3A82' : '#2E78E0',
              weight: 2.5,
              dashArray: '6, 4',
              fillColor: area.category === 'High' ? '#1D58B5' : '#2E78E0',
              fillOpacity: 0.22,
            }}
          >
            <Popup>
              <div className="p-1 font-sans text-xs">
                <div className="font-bold text-[#0B3A82] uppercase tracking-wider text-[11px] mb-1">
                  HABITAT ZONE — {area.category.toUpperCase()} SUITABILITY
                </div>
                <div className="text-slate-800 font-semibold">{area.name}</div>
                <div className="text-slate-600 mt-0.5">
                  Mean Temp: <span className="font-bold text-[#0B3A82]">{area.avgTemp}°C</span>
                </div>
                <div className="text-slate-600">
                  Suitability: <span className="font-bold text-[#0B3A82]">{area.avgSuitability}%</span>
                </div>
                <div className="mt-1 text-[10px] text-slate-500 italic">
                  Area-based mapping — ocean waters only
                </div>
              </div>
            </Popup>
          </Polygon>
        ))}
      </MapContainer>
    </div>
  );
};
