import React from 'react';
import { MapContainer, TileLayer, Rectangle, Popup, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { MockSpecies } from '../../data/mockSpecies';
import type { SpatialGridCell, SpatialHabitatSummary } from '../../services/habitatAnalysis';
import { Compass, Flame } from 'lucide-react';

interface FisheriesMapProps {
  species: MockSpecies;
  gridCells: SpatialGridCell[];
  summary: SpatialHabitatSummary;
  selectedDepth: number;
  onDepthChange: (depth: number) => void;
}

const DEPTH_OPTIONS = [
  { label: 'Surface (0m)', value: 0 },
  { label: 'Upper Mix (50m)', value: 50 },
  { label: 'Thermocline (100m)', value: 100 },
  { label: 'Subsurface (200m)', value: 200 }
];

export const FisheriesMap: React.FC<FisheriesMapProps> = ({
  species,
  gridCells,
  summary,
  selectedDepth,
  onDepthChange
}) => {
  return (
    <div className="h-full w-full rounded-2xl overflow-hidden border border-slate-300 shadow-md relative z-0 flex flex-col">
      {/* Map Header / Controls Overlay */}
      <div className="absolute top-4 left-4 z-[1000] bg-white/95 backdrop-blur-md px-4 py-3 rounded-xl shadow-lg border border-slate-200/80 max-w-sm">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Spatial Habitat Suitability
          </h3>
        </div>
        <p className="text-xs font-medium text-slate-600 mb-2">
          {species.name} <span className="italic text-slate-400">({species.scientificName})</span>
        </p>

        {/* Depth Filter Toggle */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          {DEPTH_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onDepthChange(opt.value)}
              className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${
                selectedDepth === opt.value
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {opt.label.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Peak Hotspot Banner */}
      {summary.peakLocation && (
        <div className="absolute top-4 right-4 z-[1000] bg-emerald-950/90 text-emerald-100 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-lg border border-emerald-800/50 text-xs font-medium flex items-center gap-2">
          <Flame className="w-4 h-4 text-emerald-400 animate-bounce" />
          <div>
            <div className="font-bold text-emerald-300">Peak Thermal Hotspot</div>
            <div className="text-[11px] text-emerald-200/80">
              {summary.peakLocation.lat}°N, {summary.peakLocation.lng}°E • {summary.peakLocation.temp}°C ({summary.peakLocation.suitability}% Match)
            </div>
          </div>
        </div>
      )}

      {/* Map Legend */}
      <div className="absolute bottom-6 right-6 z-[1000] bg-white/95 backdrop-blur-md p-3 rounded-xl shadow-lg border border-slate-200 text-xs space-y-1.5 min-w-[170px]">
        <div className="font-bold text-slate-800 text-[10px] uppercase tracking-wider mb-1 flex items-center gap-1">
          <Compass className="w-3 h-3 text-indigo-600" /> Habitat Suitability
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <span className="w-3.5 h-3.5 rounded bg-emerald-500/80 border border-emerald-600" />
          <span className="font-semibold text-slate-700">Optimal (75–100%)</span>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <span className="w-3.5 h-3.5 rounded bg-amber-400/80 border border-amber-500" />
          <span className="font-semibold text-slate-700">Moderate (45–74%)</span>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <span className="w-3.5 h-3.5 rounded bg-blue-500/20 border border-blue-400/40" />
          <span className="font-semibold text-slate-500">Sub-optimal (&lt;45%)</span>
        </div>
      </div>

      {/* Leaflet Map Container */}
      <MapContainer
        center={[16.5, 76.5]}
        zoom={5}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        maxBounds={[[-5, 45], [35, 115]]}
        minZoom={4}
        className="z-0 bg-[#06172d]"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.esri.com">Esri World Ocean</a>'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}"
        />

        {/* Spatial Grid Cells */}
        {gridCells.map((cell) => {
          const bounds: [[number, number], [number, number]] = [
            [cell.lat - cell.latStep / 2, cell.lng - cell.lngStep / 2],
            [cell.lat + cell.latStep / 2, cell.lng + cell.lngStep / 2]
          ];

          let fillColor = 'rgba(59, 130, 246, 0.15)';
          let strokeColor = 'rgba(37, 99, 235, 0.3)';
          let fillOpacity = 0.15;
          let weight = 0.5;

          if (cell.category === 'Optimal') {
            fillColor = 'rgba(16, 185, 129, 0.55)';
            strokeColor = '#047857';
            fillOpacity = 0.65;
            weight = 1.2;
          } else if (cell.category === 'Moderate') {
            fillColor = 'rgba(245, 158, 11, 0.40)';
            strokeColor = '#d97706';
            fillOpacity = 0.45;
            weight = 0.8;
          }

          return (
            <Rectangle
              key={cell.id}
              bounds={bounds}
              pathOptions={{
                fillColor,
                fillOpacity,
                color: strokeColor,
                weight
              }}
            >
              <Popup>
                <div className="p-1 min-w-[150px]">
                  <div className="font-bold text-slate-900 text-sm">{species.name}</div>
                  <div className="text-xs text-slate-500 italic mb-2">{species.scientificName}</div>
                  <div className="space-y-1 text-xs text-slate-700 border-t border-slate-200 pt-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Location:</span>
                      <span className="font-mono font-semibold">{cell.lat.toFixed(1)}°N, {cell.lng.toFixed(1)}°E</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Depth:</span>
                      <span className="font-semibold">{selectedDepth}m</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Est. Temp:</span>
                      <span className="font-semibold text-indigo-700">{cell.temp}°C</span>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                      <span className="text-slate-500 font-medium">Suitability:</span>
                      <span
                        className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                          cell.category === 'Optimal'
                            ? 'bg-emerald-100 text-emerald-800'
                            : cell.category === 'Moderate'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {cell.suitability}% ({cell.category})
                      </span>
                    </div>
                  </div>
                </div>
              </Popup>
            </Rectangle>
          );
        })}

        {/* Peak Hotspot Highlight Circle */}
        {summary.peakLocation && (
          <CircleMarker
            center={[summary.peakLocation.lat, summary.peakLocation.lng]}
            radius={10}
            pathOptions={{
              color: '#fbbf24',
              fillColor: '#10b981',
              fillOpacity: 0.9,
              weight: 3
            }}
          >
            <Popup>
              <div className="p-1 font-sans">
                <div className="text-xs font-bold text-emerald-800 uppercase tracking-wide">🏆 Peak Optimal Hotspot</div>
                <div className="text-xs text-slate-700 mt-1">
                  Coords: {summary.peakLocation.lat}°N, {summary.peakLocation.lng}°E<br />
                  Temp: {summary.peakLocation.temp}°C<br />
                  Match: <span className="font-bold text-emerald-600">{summary.peakLocation.suitability}%</span>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        )}
      </MapContainer>
    </div>
  );
};
