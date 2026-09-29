import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Polygon, useMap, useMapEvents, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { ArrowRightLeft, MapPin, X, Crosshair } from 'lucide-react';
import type { OceanLocation } from '../../types';
import { DEFAULT_NASA_STATE, type ActiveNasaState } from '../../services/nasa/gibsConfig';
import { NasaTileLayer } from '../nasa/NasaTileLayer';
import { NasaLayerControl } from '../nasa/NasaLayerControl';

interface DashboardMapProps {
  selectedLocation: OceanLocation | null;
  onLocationSelect: (loc: OceanLocation) => void;
  selectedDate: string;
  isComparing: boolean;
  onToggleCompare: () => void;
  comparePointA: OceanLocation | null;
  comparePointB: OceanLocation | null;
  onSetComparePointA: (loc: OceanLocation) => void;
  onSetComparePointB: (loc: OceanLocation) => void;
  onClearCompare: () => void;
}

const STUDY_BOUNDS: [[number, number], [number, number]] = [[5, 60], [30, 100]];
const STUDY_POLYGON: [number, number][] = [
  [5, 60],
  [5, 100],
  [30, 100],
  [30, 60],
];

const PRESET_STATIONS: { name: string; lat: number; lng: number }[] = [
  { name: 'Central Arabian Sea', lat: 15.0, lng: 65.0 },
  { name: 'Equatorial NIO Array', lat: 8.5, lng: 76.2 },
  { name: 'Central Bay of Bengal', lat: 17.5, lng: 89.0 },
  { name: 'Goa Coastal Shelf', lat: 15.4, lng: 73.2 },
  { name: 'Andaman Sea', lat: 13.2, lng: 94.5 },
];

const StudyRegionFitter: React.FC = () => {
  const map = useMap();
  useEffect(() => {
    map.fitBounds(STUDY_BOUNDS, { padding: [16, 16] });
  }, [map]);
  return null;
};

const MapClickController: React.FC<{
  onMapClick: (lat: number, lng: number) => void;
}> = ({ onMapClick }) => {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

export const DashboardMap: React.FC<DashboardMapProps> = ({
  selectedLocation,
  onLocationSelect,
  selectedDate,
  isComparing,
  onToggleCompare,
  comparePointA,
  comparePointB,
  onSetComparePointA,
  onSetComparePointB,
  onClearCompare,
}) => {
  const [nasaState, setNasaState] = useState<ActiveNasaState>(DEFAULT_NASA_STATE);

  const handleMapClick = (lat: number, lng: number) => {
    if (lat < 5 || lat > 30 || lng < 60 || lng > 100) return;

    const loc: OceanLocation = {
      lat: Number(lat.toFixed(3)),
      lng: Number(lng.toFixed(3)),
      name: `Point (${lat.toFixed(2)}°N, ${lng.toFixed(2)}°E)`,
      date: selectedDate,
    };

    if (isComparing) {
      if (!comparePointA) {
        onSetComparePointA(loc);
      } else if (!comparePointB) {
        onSetComparePointB(loc);
      } else {
        onClearCompare();
        onSetComparePointA(loc);
      }
    } else {
      onLocationSelect(loc);
    }
  };

  return (
    <div className="w-full relative h-[280px] xs:h-[320px] sm:h-[380px] md:h-[420px] lg:h-[440px] rounded-none border border-slate-300 dark:border-slate-700 shadow-sm bg-[#0B3A82] overflow-hidden transition-colors">
      <MapContainer
        center={[17.5, 80]}
        zoom={5}
        minZoom={4}
        maxZoom={9}
        scrollWheelZoom
        className="h-full w-full z-0 rounded-none"
        aria-label="OceanEmbed Scientific Map"
      >
        <TileLayer
          attribution="&copy; Esri, GEBCO, NOAA"
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}"
        />

        {/* NASA GIBS True Color Default Satellite Overlay (100% Opacity) */}
        <NasaTileLayer nasaState={nasaState} selectedDate={selectedDate} />

        <StudyRegionFitter />
        <MapClickController onMapClick={handleMapClick} />

        {/* North Indian Ocean Study Boundary in OceanEmbed Blue */}
        <Polygon
          positions={STUDY_POLYGON}
          pathOptions={{
            color: '#0B3A82',
            fillColor: 'transparent',
            weight: 2.5,
            dashArray: '6, 6',
          }}
        />

        {/* Primary Selected Location Marker (Deep Ocean Blue) */}
        {!isComparing && selectedLocation && (
          <CircleMarker
            center={[selectedLocation.lat, selectedLocation.lng]}
            radius={9}
            pathOptions={{
              color: '#ffffff',
              fillColor: '#0B3A82',
              fillOpacity: 1,
              weight: 3,
            }}
          >
            <Tooltip permanent direction="top" offset={[0, -8]} className="rounded-none bg-[#0B3A82] text-white font-mono text-[11px] px-2.5 py-0.5 border border-white/40 shadow-sm">
              {selectedLocation.lat.toFixed(2)}°N, {selectedLocation.lng.toFixed(2)}°E
            </Tooltip>
          </CircleMarker>
        )}

        {/* Point A Marker (Deep Ocean Blue) */}
        {isComparing && comparePointA && (
          <CircleMarker
            center={[comparePointA.lat, comparePointA.lng]}
            radius={10}
            pathOptions={{
              color: '#ffffff',
              fillColor: '#0B3A82',
              fillOpacity: 1,
              weight: 3,
            }}
          >
            <Tooltip permanent direction="top" offset={[0, -8]} className="rounded-none bg-[#0B3A82] text-white font-mono text-[11px] px-2.5 py-0.5 border border-white/40 shadow-sm">
              Point A: {comparePointA.lat.toFixed(2)}°N, {comparePointA.lng.toFixed(2)}°E
            </Tooltip>
          </CircleMarker>
        )}

        {/* Point B Marker (Medium/Light Ocean Blue - No yellow/amber) */}
        {isComparing && comparePointB && (
          <CircleMarker
            center={[comparePointB.lat, comparePointB.lng]}
            radius={10}
            pathOptions={{
              color: '#ffffff',
              fillColor: '#2E78E0',
              fillOpacity: 1,
              weight: 3,
            }}
          >
            <Tooltip permanent direction="top" offset={[0, -8]} className="rounded-none bg-[#155BBD] text-white font-mono text-[11px] px-2.5 py-0.5 border border-white/40 shadow-sm">
              Point B: {comparePointB.lat.toFixed(2)}°N, {comparePointB.lng.toFixed(2)}°E
            </Tooltip>
          </CircleMarker>
        )}
      </MapContainer>

      {/* Top Left: NASA GIBS Layer Control Drawer (Closed by default, labeled LAYERS) */}
      <NasaLayerControl
        nasaState={nasaState}
        onNasaStateChange={setNasaState}
        selectedDate={selectedDate}
        className="absolute top-3 left-3 z-[400]"
      />

      {/* Top Right: Compare Locations Button (Blue & White Only) */}
      <div className="absolute top-3 right-3 z-[400] flex items-center gap-2">
        {!isComparing ? (
          <button
            onClick={onToggleCompare}
            className="flex items-center gap-1.5 px-2 sm:px-3.5 py-1.5 sm:py-2 bg-white hover:bg-[#F0F5FC] text-[#0B3A82] border-2 border-[#0B3A82] text-xs font-bold transition-colors cursor-pointer shadow-sm rounded-none"
            title="Compare two ocean locations side-by-side"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0B3A82]" />
            <span className="hidden sm:inline">COMPARE LOCATIONS</span>
            <span className="inline sm:hidden">COMPARE</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5 sm:gap-2 bg-white px-2 sm:px-3.5 py-1.5 sm:py-2 border-2 border-[#0B3A82] text-xs text-slate-900 shadow-md rounded-none">
            <span className="flex items-center gap-1 text-[#0B3A82] font-bold">
              <Crosshair className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0B3A82]" />
              <span className="hidden sm:inline">
                {!comparePointA
                  ? 'Click map to select Point A'
                  : !comparePointB
                  ? 'Click map to select Point B'
                  : 'Comparing Points A & B'}
              </span>
              <span className="inline sm:hidden">
                {!comparePointA ? 'Tap Point A' : !comparePointB ? 'Tap Point B' : 'A vs B'}
              </span>
            </span>
            <button
              onClick={onClearCompare}
              className="p-1 hover:bg-[#F0F5FC] text-[#0B3A82] transition-colors cursor-pointer rounded-none ml-1"
              title="Clear comparison"
            >
              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Bottom Left: Observatories Presets (Blue & White Only) - Desktop only */}
      <div className="absolute bottom-3 left-3 z-[400] hidden lg:flex items-center gap-1.5 bg-white/95 px-3 py-1.5 border border-slate-300 text-xs text-slate-800 rounded-none shadow-sm">
        <MapPin className="w-3.5 h-3.5 text-[#0B3A82]" />
        <span className="font-bold text-[#0B3A82] mr-1 text-[11px] uppercase tracking-wider">Stations:</span>
        {PRESET_STATIONS.map((station) => (
          <button
            key={station.name}
            onClick={() => handleMapClick(station.lat, station.lng)}
            className="px-2 py-0.5 hover:bg-[#F0F5FC] text-[#0B3A82] font-semibold text-[11px] transition-colors rounded-none cursor-pointer"
          >
            {station.name}
          </button>
        ))}
      </div>

      {/* Bottom Right: Status Indicator - Hidden on small mobile */}
      <div className="absolute bottom-3 right-3 z-[400] hidden sm:flex items-center gap-2.5 bg-white/95 px-3 py-1.5 border border-slate-300 text-[11px] font-mono text-slate-700 rounded-none shadow-sm">
        <span className="font-bold text-[#0B3A82]">NASA GIBS True Color (100%)</span>
        <span className="text-slate-300">|</span>
        <span className="font-semibold text-slate-800 hidden md:inline">5°N–30°N, 60°E–100°E</span>
      </div>
    </div>
  );
};
