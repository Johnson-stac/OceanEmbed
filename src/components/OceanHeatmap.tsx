import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Polygon, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { CalendarDays, Layers3, Activity } from 'lucide-react';
import type { OceanLocation, SurfaceParameters } from '../types';

import { getDepthTemperature } from '../services/fakeModel';
import { DEFAULT_NASA_STATE, type ActiveNasaState } from '../services/nasa/gibsConfig';
import { NasaTileLayer } from './nasa/NasaTileLayer';
import { NasaLayerControl } from './nasa/NasaLayerControl';

interface OceanHeatmapProps {
  location: OceanLocation | null;
  parameters: SurfaceParameters | null;
  selectedDate: string;
  onDateChange: (date: string) => void;
  onLocationSelect?: (loc: OceanLocation) => void;
}

const STUDY_BOUNDS: [[number, number], [number, number]] = [[5, 60], [30, 100]];
const STUDY_POLYGON: [number, number][] = [
  [5, 60],
  [5, 100],
  [30, 100],
  [30, 60],
];

const DEPTHS = [0, 5, 10, 20, 30, 50, 75, 100, 125, 150, 200, 300, 500, 700, 1000];
const MONTHS = Array.from({ length: 60 }, (_, index) => {
  const date = new Date(Date.UTC(2021 + Math.floor(index / 12), index % 12, 15));
  return { date, value: date.toISOString() };
});

const getMonthIndex = (date: string) => Math.max(0, Math.min(59, (new Date(date).getUTCFullYear() - 2021) * 12 + new Date(date).getUTCMonth()));
const formatMonth = (date: Date) => date.toLocaleDateString(undefined, { month: 'short', year: 'numeric', timeZone: 'UTC' });

const COLOR_STOPS = [
  { temperature: 2, color: [8, 47, 73] },
  { temperature: 8, color: [3, 105, 161] },
  { temperature: 14, color: [14, 165, 233] },
  { temperature: 20, color: [45, 212, 191] },
  { temperature: 25, color: [250, 204, 21] },
  { temperature: 29, color: [249, 115, 22] },
  { temperature: 33, color: [220, 38, 38] },
];

const temperatureColor = (temperature: number) => {
  const bounded = Math.min(COLOR_STOPS.at(-1)!.temperature, Math.max(COLOR_STOPS[0].temperature, temperature));
  const upperIndex = COLOR_STOPS.findIndex((stop) => stop.temperature >= bounded);
  const upper = COLOR_STOPS[upperIndex];
  const lower = COLOR_STOPS[Math.max(upperIndex - 1, 0)];
  const ratio = upper.temperature === lower.temperature ? 0 : (bounded - lower.temperature) / (upper.temperature - lower.temperature);
  const color = lower.color.map((channel, index) => Math.round(channel + (upper.color[index] - channel) * ratio));
  return `rgb(${color.join(', ')})`;
};

const StudyRegionFitter: React.FC = () => {
  const map = useMap();
  useEffect(() => { map.fitBounds(STUDY_BOUNDS, { padding: [18, 18] }); }, [map]);
  return null;
};

const MapEvents: React.FC<{ onLocationSelect?: (loc: OceanLocation) => void }> = ({ onLocationSelect }) => {
  useMapEvents({
    click(e) {
      if (onLocationSelect) {
        onLocationSelect({
          lat: e.latlng.lat,
          lng: e.latlng.lng,
          name: `Selected: ${Math.abs(e.latlng.lat).toFixed(3)}°${e.latlng.lat >= 0 ? 'N' : 'S'}, ${Math.abs(e.latlng.lng).toFixed(3)}°${e.latlng.lng >= 0 ? 'E' : 'W'}`,
          date: new Date().toISOString()
        });
      }
    }
  });
  return null;
}

export const OceanHeatmap: React.FC<OceanHeatmapProps> = ({ location, parameters, selectedDate, onDateChange, onLocationSelect }) => {
  const [selectedDepth, setSelectedDepth] = useState(0);
  const [nasaState, setNasaState] = useState<ActiveNasaState>(DEFAULT_NASA_STATE);
  const selectedMonth = getMonthIndex(selectedDate);

  // Generate depth-time plot grid for selected location
  const depthTimeGrid = useMemo(() => {
    if (!parameters) return [];
    const grid = [];
    // Only 24 months for chart clarity
    for (let m = 0; m < 24; m++) {
      const col = [];
      const monthIdx = (selectedMonth + m - 12 + 60) % 60; // 1 year before to 1 year after
      for (let d = 0; d < DEPTHS.length; d++) {
        const depth = DEPTHS[d];
        const seasonalCycle = Math.sin(((monthIdx % 12) / 12) * Math.PI * 2 - 0.7) * 1.45;
        const temp = getDepthTemperature(parameters.sst, depth) + seasonalCycle;
        col.push({ temp, depth, monthIdx });
      }
      grid.push(col);
    }
    return grid;
  }, [selectedMonth, parameters?.sst]);

  // Calculate the approximate temperature at the selected depth/month for display
  const activeTemperature = useMemo(() => {
    if (!parameters) return 0;
    const depth = DEPTHS[selectedDepth];
    const seasonalCycle = Math.sin(((selectedMonth % 12) / 12) * Math.PI * 2 - 0.7) * 1.45;
    return getDepthTemperature(parameters.sst, depth) + seasonalCycle;
  }, [parameters, selectedDepth, selectedMonth]);

  return (
    <div className="flex flex-col h-full w-full bg-white">
      {/* Top Map Section */}
      <div className="flex-1 relative min-h-[300px]">
        <MapContainer center={[17.5, 80]} zoom={5} minZoom={4} maxZoom={8} scrollWheelZoom className="h-full w-full z-0 bg-[#06172d]" aria-label="Base ocean map">
          <TileLayer 
            attribution='&copy; Esri, GEBCO, NOAA, National Geographic' 
            url="https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}" 
          />
          <NasaTileLayer nasaState={nasaState} selectedDate={selectedDate} />
          <StudyRegionFitter />
          <MapEvents onLocationSelect={onLocationSelect} />
          
          {/* Draw Region Border */}
          <Polygon 
            positions={STUDY_POLYGON} 
            pathOptions={{ color: '#38bdf8', fillColor: 'transparent', weight: 2, dashArray: '5, 5' }} 
          />
          
          {location && (
            <CircleMarker 
              center={[location.lat, location.lng]} 
              radius={8} 
              pathOptions={{ color: '#fbbf24', fillColor: '#0f172a', fillOpacity: 1, weight: 3 }} 
            />
          )}
        </MapContainer>

        <NasaLayerControl
          nasaState={nasaState}
          onNasaStateChange={setNasaState}
          selectedDate={selectedDate}
          className="absolute top-4 left-4 z-[400] max-w-[270px]"
        />
      </div>

      {/* Bottom Controls & Chart Section */}
      <div className="h-[220px] bg-white border-t border-slate-200 p-4 shrink-0 flex gap-6">
        
        {/* Left: Sliders */}
        <div className="flex-1 flex flex-col justify-between max-w-sm">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 mb-4">
              <CalendarDays className="h-4 w-4 text-ocean-600" /> Time & Depth Controls
            </h3>
            
            <label className="block mb-6">
              <span className="mb-2 flex items-center justify-between gap-3 text-[11px] font-bold uppercase tracking-wide text-slate-600">
                <span>Time</span>
                <span className="font-mono text-ocean-700">{formatMonth(MONTHS[selectedMonth].date)}</span>
              </span>
              <input type="range" min="0" max="59" step="1" value={selectedMonth} onChange={(event) => onDateChange(MONTHS[Number(event.target.value)].value)} className="h-2 w-full cursor-ew-resize accent-ocean-600" />
            </label>

            <label className="block">
              <span className="mb-2 flex items-center justify-between gap-3 text-[11px] font-bold uppercase tracking-wide text-slate-600">
                <span className="flex items-center gap-1.5"><Layers3 className="h-3.5 w-3.5" /> Depth</span>
                <span className="font-mono text-ocean-700">{DEPTHS[selectedDepth]} m</span>
              </span>
              <input type="range" min="0" max={DEPTHS.length - 1} step="1" value={selectedDepth} onChange={(event) => setSelectedDepth(Number(event.target.value))} className="h-2 w-full cursor-ew-resize accent-ocean-600" />
            </label>
          </div>
          
          {location && parameters && (
            <div className="mt-2 text-[11px] font-semibold text-slate-600">
              <span className="uppercase tracking-wider text-slate-500 mr-2">Est. Temp:</span>
              <span className="text-sm text-slate-900">{activeTemperature.toFixed(1)} °C</span>
            </div>
          )}
        </div>

        {/* Vertical Divider */}
        <div className="w-[1px] bg-slate-200 hidden md:block"></div>

        {/* Right: Depth vs Time Heatmap Chart */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <Activity className="h-4 w-4 text-ocean-600" /> Depth vs Time Profiler
            </h3>
            
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-slate-500">3°C</span>
              <div className="h-1.5 w-24 rounded-full bg-gradient-to-r from-cyan-900 via-sky-400 via-teal-300 via-yellow-300 to-red-500" />
              <span className="text-[10px] text-slate-500">32°C+</span>
            </div>
          </div>
          
          <div className="flex-1 relative bg-slate-50 border border-slate-200 rounded-lg overflow-hidden flex items-center justify-center">
            {location && parameters ? (
              <>
                <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 24 14" className="absolute inset-0">
                  {depthTimeGrid.map((col, x) => (
                    <React.Fragment key={x}>
                      {col.map((cell, y) => (
                        <rect
                          key={`${x}-${y}`}
                          x={x}
                          y={y}
                          width={1.05}
                          height={1.05}
                          fill={temperatureColor(cell.temp)}
                        />
                      ))}
                    </React.Fragment>
                  ))}
                  {/* Highlight current selected month and depth */}
                  <rect x={12} y={0} width={1} height={14} fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth={0.1} />
                  <rect x={0} y={selectedDepth} width={24} height={1} fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth={0.1} />
                  <circle cx={12.5} cy={selectedDepth + 0.5} r={0.3} fill="#fbbf24" stroke="#0f172a" strokeWidth={0.1} />
                </svg>
                
                {/* Labels */}
                <div className="absolute top-1 left-2 text-[9px] font-semibold text-white bg-slate-900/50 px-1.5 py-0.5 rounded shadow-sm pointer-events-none">Surface</div>
                <div className="absolute bottom-1 left-2 text-[9px] font-semibold text-white bg-slate-900/50 px-1.5 py-0.5 rounded shadow-sm pointer-events-none">1000m</div>
                <div className="absolute bottom-1 right-2 text-[9px] font-semibold text-white bg-slate-900/50 px-1.5 py-0.5 rounded shadow-sm pointer-events-none">+1yr</div>
                <div className="absolute bottom-1 left-[50%] -translate-x-1/2 text-[9px] font-semibold text-white bg-slate-900/50 px-1.5 py-0.5 rounded shadow-sm pointer-events-none text-center">Now</div>
              </>
            ) : (
              <div className="text-xs text-slate-400 font-medium">Select a location on the map to view the profile</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
