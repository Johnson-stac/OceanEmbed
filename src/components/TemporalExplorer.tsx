import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Polygon, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {
  CalendarRange,
  Search,
  Filter,
  TrendingUp,
  Compass,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRight,
  RefreshCw,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Wind,
  Droplets,
  Layers,
  Thermometer,
  Activity
} from 'lucide-react';
import { DEFAULT_NASA_STATE, type ActiveNasaState } from '../services/nasa/gibsConfig';
import { NasaTileLayer } from './nasa/NasaTileLayer';
import { NasaLayerControl } from './nasa/NasaLayerControl';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import type {
  OceanLocation,
  DateRangeAnalysisResult,
  AdvancedFilterCriteria,
  AdvancedFilterResult
} from '../types';
import { getDateRangeAnalysis, getSuggestedDatesForConditions } from '../services/predictionService';

const STUDY_BOUNDS: [[number, number], [number, number]] = [[5, 60], [30, 100]];
const STUDY_POLYGON: [number, number][] = [
  [5, 60],
  [5, 100],
  [30, 100],
  [30, 60],
];

const PRESET_STATIONS: { name: string; lat: number; lng: number; tag: string }[] = [
  { name: 'Central Arabian Sea', lat: 15.5, lng: 65.0, tag: 'High Salinity & Upwelling' },
  { name: 'Central Bay of Bengal', lat: 14.0, lng: 88.0, tag: 'River Runoff & Cyclones' },
  { name: 'Equatorial Indian Ocean', lat: 6.0, lng: 78.5, tag: 'Warm Pool & Jets' },
  { name: 'Lakshadweep Sea', lat: 10.5, lng: 72.8, tag: 'Coastal Current' },
  { name: 'Andaman Sea', lat: 11.8, lng: 93.5, tag: 'Stratified Warm Layer' },
];

const PRESET_DATE_SPANS = [
  { label: 'Full Year 2023', start: '2023-01-01', end: '2023-12-31' },
  { label: 'SW Monsoon 2023', start: '2023-06-01', end: '2023-09-30' },
  { label: 'Pre-Monsoon 2023', start: '2023-03-01', end: '2023-05-31' },
  { label: 'Winter / NE Monsoon', start: '2023-12-01', end: '2024-02-28' },
  { label: '2-Year Range (2022–2023)', start: '2022-01-01', end: '2023-12-31' },
];

const PRESET_CONDITION_SCENARIOS: {
  name: string;
  description: string;
  criteria: Partial<AdvancedFilterCriteria>;
}[] = [
  {
    name: 'Cyclone Genesis Conditions',
    description: 'High SST (>28.8°C), low vertical wind shear / calm winds (<5.5 m/s)',
    criteria: {
      sst: { enabled: true, min: 28.8, max: 31.5 },
      wind_speed: { enabled: true, min: 1.0, max: 5.5 },
      sla: { enabled: true, min: 0.05, max: 0.35 }
    }
  },
  {
    name: 'Peak Monsoon Surge',
    description: 'Strong winds (>8.0 m/s), energetic currents (>0.35 m/s)',
    criteria: {
      wind_speed: { enabled: true, min: 8.0, max: 15.0 },
      current_speed: { enabled: true, min: 0.35, max: 0.9 },
      sst: { enabled: false, min: 26.0, max: 30.0 }
    }
  },
  {
    name: 'High Salinity / Evaporation Regime',
    description: 'Arabian Sea saline core (SSS > 36.0 PSU, SST 27.5–29.5°C)',
    criteria: {
      sss: { enabled: true, min: 36.0, max: 37.5 },
      sst: { enabled: true, min: 27.5, max: 29.5 }
    }
  },
  {
    name: 'Bay of Bengal Freshwater Cap',
    description: 'Low salinity surface layer (SSS < 33.2 PSU) post-monsoon',
    criteria: {
      sss: { enabled: true, min: 30.0, max: 33.2 },
      sla: { enabled: true, min: 0.08, max: 0.30 }
    }
  }
];

const StudyRegionFitter: React.FC = () => {
  const map = useMap();
  useEffect(() => {
    map.fitBounds(STUDY_BOUNDS, { padding: [16, 16] });
  }, [map]);
  return null;
};

const MapEvents: React.FC<{ onLocationSelect: (loc: OceanLocation) => void }> = ({ onLocationSelect }) => {
  useMapEvents({
    click(e) {
      const lat = Number(e.latlng.lat.toFixed(2));
      const lng = Number(e.latlng.lng.toFixed(2));
      onLocationSelect({
        lat,
        lng,
        name: `Selected: ${Math.abs(lat).toFixed(2)}°${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lng).toFixed(2)}°${lng >= 0 ? 'E' : 'W'}`,
        date: new Date().toISOString()
      });
    }
  });
  return null;
};

interface TemporalExplorerProps {
  initialLocation?: OceanLocation | null;
  onApplyLocationAndDate?: (location: OceanLocation, date: string) => void;
}

export const TemporalExplorer: React.FC<TemporalExplorerProps> = ({
  initialLocation,
  onApplyLocationAndDate
}) => {
  // Selected location (defaults to Central Bay of Bengal if none given)
  const [location, setLocation] = useState<OceanLocation>(
    initialLocation || { lat: 15.0, lng: 88.0, name: 'Bay of Bengal (15.00°N, 88.00°E)' }
  );
  const [locationError, setLocationError] = useState<string | null>(null);

  // --- NASA Satellite State ---
  const [nasaState, setNasaState] = useState<ActiveNasaState>(DEFAULT_NASA_STATE);

  // Mode: 'basic' = Date Range -> Avg Inputs, 'advance' = Selected Inputs -> Suggested Dates
  const [filterMode, setFilterMode] = useState<'basic' | 'advance'>('basic');

  // --- Basic Filter State ---
  const [startDate, setStartDate] = useState<string>('2023-01-01');
  const [endDate, setEndDate] = useState<string>('2023-12-31');
  const [isLoadingRange, setIsLoadingRange] = useState<boolean>(false);
  const [rangeResult, setRangeResult] = useState<DateRangeAnalysisResult | null>(null);
  const [visibleSeries, setVisibleSeries] = useState<{ [key: string]: boolean }>({
    sst: true,
    sss: true,
    sla: true,
    wind_speed: true,
    current_speed: false
  });

  // --- Advance Filter State ---
  const [criteria, setCriteria] = useState<AdvancedFilterCriteria>({
    sst: { enabled: true, min: 28.5, max: 30.5 },
    sss: { enabled: false, min: 34.0, max: 36.0 },
    sla: { enabled: false, min: 0.05, max: 0.30 },
    wind_speed: { enabled: true, min: 2.0, max: 6.5 },
    current_speed: { enabled: false, min: 0.1, max: 0.5 },
    strictness: 'moderate'
  });
  const [isLoadingAdvance, setIsLoadingAdvance] = useState<boolean>(false);
  const [advanceResult, setAdvanceResult] = useState<AdvancedFilterResult | null>(null);
  const [expandedDateId, setExpandedDateId] = useState<string | null>(null);

  // Validate location inside study domain
  const handleSelectLocation = (newLoc: OceanLocation) => {
    const inRegion = newLoc.lat >= 5 && newLoc.lat <= 30 && newLoc.lng >= 60 && newLoc.lng <= 100;
    if (!inRegion) {
      setLocationError('Selected coordinate is outside the North Indian Ocean domain (5°N–30°N, 60°E–100°E).');
      return;
    }
    setLocationError(null);
    setLocation(newLoc);
  };

  // Run Basic Filter analysis
  const runDateRangeQuery = React.useCallback(async () => {
    if (!location) return;
    setIsLoadingRange(true);
    try {
      const data = await getDateRangeAnalysis(location.lat, location.lng, startDate, endDate);
      setRangeResult(data);
    } catch (err) {
      console.error('Failed to compute date range averages:', err);
    } finally {
      setIsLoadingRange(false);
    }
  }, [location, startDate, endDate]);

  // Run Advance Filter condition matching
  const runConditionMatcher = React.useCallback(async () => {
    if (!location) return;
    setIsLoadingAdvance(true);
    try {
      const data = await getSuggestedDatesForConditions(location.lat, location.lng, criteria);
      setAdvanceResult(data);
    } catch (err) {
      console.error('Failed to match dates for conditions:', err);
    } finally {
      setIsLoadingAdvance(false);
    }
  }, [location, criteria]);

  // Auto-run on location or mode change
  useEffect(() => {
    if (filterMode === 'basic') {
      runDateRangeQuery();
    } else {
      runConditionMatcher();
    }
  }, [filterMode, runDateRangeQuery, runConditionMatcher]);

  // Handle Preset Condition Scenario selection
  const applyConditionPreset = (presetCriteria: Partial<AdvancedFilterCriteria>) => {
    setCriteria(prev => ({
      ...prev,
      sst: presetCriteria.sst || { ...prev.sst, enabled: false },
      sss: presetCriteria.sss || { ...prev.sss, enabled: false },
      sla: presetCriteria.sla || { ...prev.sla, enabled: false },
      wind_speed: presetCriteria.wind_speed || { ...prev.wind_speed, enabled: false },
      current_speed: presetCriteria.current_speed || { ...prev.current_speed, enabled: false },
    }));
  };

  return (
    <div className="flex flex-col gap-8 pb-16 w-full max-w-[1520px] mx-auto">
      
      {/* Top Banner & Context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-ocean-50 text-ocean-700 rounded-lg border border-ocean-200 shadow-sm">
              <CalendarRange className="w-6 h-6 text-cyan-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Spatiotemporal Explorer
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Interactive North Indian Ocean Domain · Forward Date Span Averages &amp; Inverse Condition-Based Date Matcher
              </p>
            </div>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner">
          <button
            onClick={() => setFilterMode('basic')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              filterMode === 'basic'
                ? 'bg-white text-cyan-700 shadow-sm border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Basic Filter</span>
          </button>

          <button
            onClick={() => setFilterMode('advance')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              filterMode === 'advance'
                ? 'bg-white text-cyan-700 shadow-sm border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Advanced Filter</span>
          </button>
        </div>
      </div>

      {/* PRIMARY SECTION: Interactive Map First (Anchor) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        {/* Map Header bar */}
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-cyan-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Primary Map Target (North Indian Ocean)
            </span>
            <span className="text-[11px] font-mono text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200 font-semibold">
              {location.lat.toFixed(2)}°N, {location.lng.toFixed(2)}°E
            </span>
          </div>

          {/* Quick preset buoy/station buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Preset Stations:</span>
            {PRESET_STATIONS.map(station => (
              <button
                key={station.name}
                onClick={() => handleSelectLocation({ lat: station.lat, lng: station.lng, name: station.name })}
                className={`text-[11px] px-2.5 py-1 rounded-md border font-medium transition-all ${
                  Math.abs(location.lat - station.lat) < 0.1 && Math.abs(location.lng - station.lng) < 0.1
                    ? 'bg-cyan-600 text-white border-cyan-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
                title={station.tag}
              >
                {station.name}
              </button>
            ))}
          </div>
        </div>

        {/* Map View Canvas */}
        <div className="h-[340px] sm:h-[400px] w-full relative">
          <MapContainer
            center={[location.lat, location.lng]}
            zoom={5}
            minZoom={4}
            maxZoom={8}
            scrollWheelZoom={true}
            className="h-full w-full z-0 bg-[#06172d]"
          >
            <TileLayer
              attribution='&copy; Esri, GEBCO, NOAA'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}"
            />
            <NasaTileLayer nasaState={nasaState} selectedDate={startDate} />
            <StudyRegionFitter />
            <MapEvents onLocationSelect={handleSelectLocation} />

            {/* Study domain bounding box */}
            <Polygon
              positions={STUDY_POLYGON}
              pathOptions={{ color: '#0284c7', fillColor: '#38bdf8', fillOpacity: 0.04, weight: 2, dashArray: '6, 6' }}
            />

            {/* Selected Location Marker */}
            <CircleMarker
              center={[location.lat, location.lng]}
              radius={9}
              pathOptions={{ color: '#0284c7', fillColor: '#fbbf24', fillOpacity: 1, weight: 3 }}
            />
          </MapContainer>

          <NasaLayerControl
            nasaState={nasaState}
            onNasaStateChange={setNasaState}
            selectedDate={startDate}
            className="absolute top-3 right-3 z-[1000] max-w-[265px]"
          />

          {/* Map Overlay Floating Badge */}
          <div className="absolute bottom-3 left-3 z-[1000] bg-slate-900/85 backdrop-blur-md text-white px-3 py-2 rounded-lg border border-slate-700/60 shadow-lg text-xs flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></div>
            <div>
              <div className="font-semibold text-slate-200">Click anywhere on the map to re-center query</div>
              <div className="text-[10px] text-slate-400 font-mono">Boundaries: 5°N–30°N, 60°E–100°E</div>
            </div>
          </div>
        </div>

        {locationError && (
          <div className="px-4 py-2.5 bg-rose-50 border-t border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{locationError}</span>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: BASIC FILTER (Date Range -> Avg Inputs) */}
      {/* ========================================================================= */}
      {filterMode === 'basic' && (
        <div className="flex flex-col gap-6">
          
          {/* Date Span Configuration Controls */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              
              {/* Range Inputs */}
              <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Start Date
                  </label>
                  <input
                    type="date"
                    min="2021-01-01"
                    max="2025-12-31"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full text-sm font-medium border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div className="hidden sm:flex items-center justify-center pt-5 text-slate-400 font-bold">
                  &rarr;
                </div>

                <div className="flex-1">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    End Date
                  </label>
                  <input
                    type="date"
                    min="2021-01-01"
                    max="2025-12-31"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full text-sm font-medium border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div className="sm:pt-5">
                  <button
                    onClick={runDateRangeQuery}
                    disabled={isLoadingRange}
                    className="w-full sm:w-auto px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold rounded-lg transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoadingRange ? 'animate-spin' : ''}`} />
                    <span>{isLoadingRange ? 'Computing Model...' : 'Calculate Span Averages'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Presets Bar */}
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Date Span Presets:</span>
              {PRESET_DATE_SPANS.map(preset => (
                <button
                  key={preset.label}
                  onClick={() => {
                    setStartDate(preset.start);
                    setEndDate(preset.end);
                  }}
                  className={`text-[11px] px-3 py-1 rounded-full border transition-all ${
                    startDate === preset.start && endDate === preset.end
                      ? 'bg-cyan-50 text-cyan-700 border-cyan-300 font-bold'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Model Output: Average Values Display Grid */}
          {rangeResult && (
            <>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-cyan-600" />
                      Model-Simulated Average Surface Inputs ({rangeResult.totalDays} Days Span)
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Computed over {rangeResult.startDate} to {rangeResult.endDate} at {rangeResult.location.name}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {/* SST Card */}
                  <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-rose-500" />
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-bold text-slate-800">Sea Surface Temp (SST)</span>
                        <Thermometer className="w-4 h-4 text-rose-500" />
                      </div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wide mt-0.5">Thermal State</div>
                      <div className="mt-3 flex items-baseline gap-1">
                        <span className="text-2xl font-black text-slate-900">{rangeResult.averages.sst.toFixed(2)}</span>
                        <span className="text-xs font-bold text-slate-500">°C</span>
                      </div>
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-slate-100 text-[10px] text-slate-500 flex justify-between font-mono">
                      <span>Min: {rangeResult.stats.sst.min}°C</span>
                      <span>Max: {rangeResult.stats.sst.max}°C</span>
                      <span>σ: {rangeResult.stats.sst.stdDev}</span>
                    </div>
                  </div>

                  {/* SSS Card */}
                  <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 to-blue-600" />
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-bold text-slate-800">Sea Surface Salinity</span>
                        <Droplets className="w-4 h-4 text-blue-500" />
                      </div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wide mt-0.5">Halinity Index</div>
                      <div className="mt-3 flex items-baseline gap-1">
                        <span className="text-2xl font-black text-slate-900">{rangeResult.averages.sss.toFixed(2)}</span>
                        <span className="text-xs font-bold text-slate-500">PSU</span>
                      </div>
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-slate-100 text-[10px] text-slate-500 flex justify-between font-mono">
                      <span>Min: {rangeResult.stats.sss.min}</span>
                      <span>Max: {rangeResult.stats.sss.max}</span>
                      <span>σ: {rangeResult.stats.sss.stdDev}</span>
                    </div>
                  </div>

                  {/* SLA Card */}
                  <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 to-emerald-600" />
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-bold text-slate-800">Sea Level Anomaly</span>
                        <Layers className="w-4 h-4 text-teal-500" />
                      </div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wide mt-0.5">Altimetry Deviation</div>
                      <div className="mt-3 flex items-baseline gap-1">
                        <span className="text-2xl font-black text-slate-900">
                          {rangeResult.averages.sla >= 0 ? `+${rangeResult.averages.sla.toFixed(3)}` : rangeResult.averages.sla.toFixed(3)}
                        </span>
                        <span className="text-xs font-bold text-slate-500">m</span>
                      </div>
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-slate-100 text-[10px] text-slate-500 flex justify-between font-mono">
                      <span>Min: {rangeResult.stats.sla.min}m</span>
                      <span>Max: {rangeResult.stats.sla.max}m</span>
                      <span>σ: {rangeResult.stats.sla.stdDev}</span>
                    </div>
                  </div>

                  {/* Wind Field Card */}
                  <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-400 to-indigo-600" />
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-bold text-slate-800">Mean Wind Speed</span>
                        <Wind className="w-4 h-4 text-sky-500" />
                      </div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wide mt-0.5">Atmospheric Forcing</div>
                      <div className="mt-3 flex items-baseline gap-1">
                        <span className="text-2xl font-black text-slate-900">{rangeResult.averages.wind_speed.toFixed(2)}</span>
                        <span className="text-xs font-bold text-slate-500">m/s</span>
                      </div>
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-slate-100 text-[10px] text-slate-500 flex justify-between font-mono">
                      <span>U: {rangeResult.averages.wind_u} m/s</span>
                      <span>V: {rangeResult.averages.wind_v} m/s</span>
                    </div>
                  </div>

                  {/* Ocean Currents Card */}
                  <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 to-pink-600" />
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-bold text-slate-800">Mean Surface Current</span>
                        <Activity className="w-4 h-4 text-purple-500" />
                      </div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wide mt-0.5">Surface Advection</div>
                      <div className="mt-3 flex items-baseline gap-1">
                        <span className="text-2xl font-black text-slate-900">{rangeResult.averages.current_speed.toFixed(2)}</span>
                        <span className="text-xs font-bold text-slate-500">m/s</span>
                      </div>
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-slate-100 text-[10px] text-slate-500 flex justify-between font-mono">
                      <span>U: {rangeResult.averages.current_u} m/s</span>
                      <span>V: {rangeResult.averages.current_v} m/s</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Time Series Evolution Graph */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Temporal Evolution Over Selected Span
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Visualizing input variations and seasonal transitions ({rangeResult.timeSeries.length} simulated sample points)
                    </p>
                  </div>

                  {/* Series Toggles */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => setVisibleSeries(s => ({ ...s, sst: !s.sst }))}
                      className={`text-xs px-2.5 py-1 rounded-md border font-semibold transition-all ${
                        visibleSeries.sst ? 'bg-rose-50 text-rose-700 border-rose-200 shadow-sm' : 'bg-slate-50 text-slate-400 border-slate-200'
                      }`}
                    >
                      ● SST (°C)
                    </button>
                    <button
                      onClick={() => setVisibleSeries(s => ({ ...s, sss: !s.sss }))}
                      className={`text-xs px-2.5 py-1 rounded-md border font-semibold transition-all ${
                        visibleSeries.sss ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm' : 'bg-slate-50 text-slate-400 border-slate-200'
                      }`}
                    >
                      ● SSS (PSU)
                    </button>
                    <button
                      onClick={() => setVisibleSeries(s => ({ ...s, sla: !s.sla }))}
                      className={`text-xs px-2.5 py-1 rounded-md border font-semibold transition-all ${
                        visibleSeries.sla ? 'bg-teal-50 text-teal-700 border-teal-200 shadow-sm' : 'bg-slate-50 text-slate-400 border-slate-200'
                      }`}
                    >
                      ● SLA (m)
                    </button>
                    <button
                      onClick={() => setVisibleSeries(s => ({ ...s, wind_speed: !s.wind_speed }))}
                      className={`text-xs px-2.5 py-1 rounded-md border font-semibold transition-all ${
                        visibleSeries.wind_speed ? 'bg-sky-50 text-sky-700 border-sky-200 shadow-sm' : 'bg-slate-50 text-slate-400 border-slate-200'
                      }`}
                    >
                      ● Wind (m/s)
                    </button>
                    <button
                      onClick={() => setVisibleSeries(s => ({ ...s, current_speed: !s.current_speed }))}
                      className={`text-xs px-2.5 py-1 rounded-md border font-semibold transition-all ${
                        visibleSeries.current_speed ? 'bg-purple-50 text-purple-700 border-purple-200 shadow-sm' : 'bg-slate-50 text-slate-400 border-slate-200'
                      }`}
                    >
                      ● Current (m/s)
                    </button>
                  </div>
                </div>

                <div className="h-[320px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={rangeResult.timeSeries} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="formattedDate" tick={{ fontSize: 11, fill: '#64748b' }} minTickGap={30} />
                      <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#64748b' }} />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          color: '#fff',
                          borderRadius: '8px',
                          border: 'none',
                          fontSize: '12px',
                          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                      {visibleSeries.sst && (
                        <Line yAxisId="left" type="monotone" dataKey="sst" name="SST (°C)" stroke="#f43f5e" strokeWidth={2.5} dot={false} />
                      )}
                      {visibleSeries.sss && (
                        <Line yAxisId="left" type="monotone" dataKey="sss" name="SSS (PSU)" stroke="#3b82f6" strokeWidth={2} dot={false} />
                      )}
                      {visibleSeries.sla && (
                        <Line yAxisId="left" type="monotone" dataKey="sla" name="SLA (m)" stroke="#14b8a6" strokeWidth={2} dot={false} />
                      )}
                      {visibleSeries.wind_speed && (
                        <Line yAxisId="left" type="monotone" dataKey="wind_speed" name="Wind Speed (m/s)" stroke="#0284c7" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                      )}
                      {visibleSeries.current_speed && (
                        <Line yAxisId="left" type="monotone" dataKey="current_speed" name="Current (m/s)" stroke="#a855f7" strokeWidth={2} strokeDasharray="2 2" dot={false} />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Subsurface Average Profile Preview */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Mean Subsurface Temperature Profile
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Estimated vertical temperature distribution averaged across the {rangeResult.totalDays}-day span
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 gap-3">
                  {rangeResult.depthProfile.slice(0, 8).map((dp) => (
                    <div key={dp.depth} className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">{dp.depth}m</span>
                      <div className="text-base font-bold text-slate-900 mt-1">
                        {dp.predicted_temperature.toFixed(1)}°C
                      </div>
                      <span className="text-[9px] text-slate-400 font-mono">
                        [{dp.lower_bound.toFixed(1)}–{dp.upper_bound.toFixed(1)}]
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: ADVANCE FILTER (Selected Inputs -> Suggested Dates) */}
      {/* ========================================================================= */}
      {filterMode === 'advance' && (
        <div className="flex flex-col gap-6">
          
          {/* Condition Builder Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <Filter className="w-5 h-5 text-cyan-600" />
                  Multi-Input Inverse Condition Matcher
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select one or multiple desired ocean surface conditions; the model will search historical timeline simulations to suggest matching dates.
                </p>
              </div>

              {/* Strictness selector */}
              <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 uppercase px-2">Match Strictness:</span>
                {(['strict', 'moderate', 'flexible'] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setCriteria(c => ({ ...c, strictness: mode }))}
                    className={`px-3 py-1 rounded text-xs font-semibold capitalize transition-all ${
                      criteria.strictness === mode
                        ? 'bg-cyan-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Condition Presets */}
            <div className="mb-6">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Quick Oceanographic Scenarios:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {PRESET_CONDITION_SCENARIOS.map(scenario => (
                  <button
                    key={scenario.name}
                    onClick={() => applyConditionPreset(scenario.criteria)}
                    className="text-left p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-cyan-50 hover:border-cyan-300 transition-all group"
                  >
                    <div className="text-xs font-bold text-slate-800 group-hover:text-cyan-900 flex items-center justify-between">
                      <span>{scenario.name}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-600 transition-transform group-hover:translate-x-0.5" />
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1 leading-tight">
                      {scenario.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Parameter Condition Selectors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {/* SST Condition */}
              <div className={`p-4 rounded-xl border transition-all ${
                criteria.sst.enabled ? 'border-rose-300 bg-rose-50/40' : 'border-slate-200 bg-slate-50/50 opacity-75'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={criteria.sst.enabled}
                      onChange={(e) => setCriteria(c => ({ ...c, sst: { ...c.sst, enabled: e.target.checked } }))}
                      className="w-4 h-4 accent-rose-500 rounded cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-900">Sea Surface Temp (SST)</span>
                  </label>
                  <span className="text-[11px] font-mono font-bold text-rose-600 bg-white px-2 py-0.5 rounded border border-rose-200">
                    °C
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <span className="text-[10px] text-slate-500 uppercase">Min °C</span>
                    <input
                      type="number"
                      step="0.1"
                      disabled={!criteria.sst.enabled}
                      value={criteria.sst.min}
                      onChange={(e) => setCriteria(c => ({ ...c, sst: { ...c.sst, min: parseFloat(e.target.value) || 0 } }))}
                      className="w-full text-xs font-semibold border border-slate-300 rounded px-2 py-1.5 bg-white disabled:bg-slate-100"
                    />
                  </div>
                  <span className="text-slate-400 text-xs mt-3">—</span>
                  <div className="flex-1">
                    <span className="text-[10px] text-slate-500 uppercase">Max °C</span>
                    <input
                      type="number"
                      step="0.1"
                      disabled={!criteria.sst.enabled}
                      value={criteria.sst.max}
                      onChange={(e) => setCriteria(c => ({ ...c, sst: { ...c.sst, max: parseFloat(e.target.value) || 0 } }))}
                      className="w-full text-xs font-semibold border border-slate-300 rounded px-2 py-1.5 bg-white disabled:bg-slate-100"
                    />
                  </div>
                </div>
              </div>

              {/* SSS Condition */}
              <div className={`p-4 rounded-xl border transition-all ${
                criteria.sss.enabled ? 'border-blue-300 bg-blue-50/40' : 'border-slate-200 bg-slate-50/50 opacity-75'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={criteria.sss.enabled}
                      onChange={(e) => setCriteria(c => ({ ...c, sss: { ...c.sss, enabled: e.target.checked } }))}
                      className="w-4 h-4 accent-blue-500 rounded cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-900">Salinity (SSS)</span>
                  </label>
                  <span className="text-[11px] font-mono font-bold text-blue-600 bg-white px-2 py-0.5 rounded border border-blue-200">
                    PSU
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <span className="text-[10px] text-slate-500 uppercase">Min PSU</span>
                    <input
                      type="number"
                      step="0.1"
                      disabled={!criteria.sss.enabled}
                      value={criteria.sss.min}
                      onChange={(e) => setCriteria(c => ({ ...c, sss: { ...c.sss, min: parseFloat(e.target.value) || 0 } }))}
                      className="w-full text-xs font-semibold border border-slate-300 rounded px-2 py-1.5 bg-white disabled:bg-slate-100"
                    />
                  </div>
                  <span className="text-slate-400 text-xs mt-3">—</span>
                  <div className="flex-1">
                    <span className="text-[10px] text-slate-500 uppercase">Max PSU</span>
                    <input
                      type="number"
                      step="0.1"
                      disabled={!criteria.sss.enabled}
                      value={criteria.sss.max}
                      onChange={(e) => setCriteria(c => ({ ...c, sss: { ...c.sss, max: parseFloat(e.target.value) || 0 } }))}
                      className="w-full text-xs font-semibold border border-slate-300 rounded px-2 py-1.5 bg-white disabled:bg-slate-100"
                    />
                  </div>
                </div>
              </div>

              {/* SLA Condition */}
              <div className={`p-4 rounded-xl border transition-all ${
                criteria.sla.enabled ? 'border-teal-300 bg-teal-50/40' : 'border-slate-200 bg-slate-50/50 opacity-75'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={criteria.sla.enabled}
                      onChange={(e) => setCriteria(c => ({ ...c, sla: { ...c.sla, enabled: e.target.checked } }))}
                      className="w-4 h-4 accent-teal-500 rounded cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-900">Sea Level Anomaly (SLA)</span>
                  </label>
                  <span className="text-[11px] font-mono font-bold text-teal-600 bg-white px-2 py-0.5 rounded border border-teal-200">
                    m
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <span className="text-[10px] text-slate-500 uppercase">Min m</span>
                    <input
                      type="number"
                      step="0.01"
                      disabled={!criteria.sla.enabled}
                      value={criteria.sla.min}
                      onChange={(e) => setCriteria(c => ({ ...c, sla: { ...c.sla, min: parseFloat(e.target.value) || 0 } }))}
                      className="w-full text-xs font-semibold border border-slate-300 rounded px-2 py-1.5 bg-white disabled:bg-slate-100"
                    />
                  </div>
                  <span className="text-slate-400 text-xs mt-3">—</span>
                  <div className="flex-1">
                    <span className="text-[10px] text-slate-500 uppercase">Max m</span>
                    <input
                      type="number"
                      step="0.01"
                      disabled={!criteria.sla.enabled}
                      value={criteria.sla.max}
                      onChange={(e) => setCriteria(c => ({ ...c, sla: { ...c.sla, max: parseFloat(e.target.value) || 0 } }))}
                      className="w-full text-xs font-semibold border border-slate-300 rounded px-2 py-1.5 bg-white disabled:bg-slate-100"
                    />
                  </div>
                </div>
              </div>

              {/* Wind Speed Condition */}
              <div className={`p-4 rounded-xl border transition-all ${
                criteria.wind_speed.enabled ? 'border-sky-300 bg-sky-50/40' : 'border-slate-200 bg-slate-50/50 opacity-75'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={criteria.wind_speed.enabled}
                      onChange={(e) => setCriteria(c => ({ ...c, wind_speed: { ...c.wind_speed, enabled: e.target.checked } }))}
                      className="w-4 h-4 accent-sky-500 rounded cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-900">Wind Speed</span>
                  </label>
                  <span className="text-[11px] font-mono font-bold text-sky-600 bg-white px-2 py-0.5 rounded border border-sky-200">
                    m/s
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <span className="text-[10px] text-slate-500 uppercase">Min m/s</span>
                    <input
                      type="number"
                      step="0.5"
                      disabled={!criteria.wind_speed.enabled}
                      value={criteria.wind_speed.min}
                      onChange={(e) => setCriteria(c => ({ ...c, wind_speed: { ...c.wind_speed, min: parseFloat(e.target.value) || 0 } }))}
                      className="w-full text-xs font-semibold border border-slate-300 rounded px-2 py-1.5 bg-white disabled:bg-slate-100"
                    />
                  </div>
                  <span className="text-slate-400 text-xs mt-3">—</span>
                  <div className="flex-1">
                    <span className="text-[10px] text-slate-500 uppercase">Max m/s</span>
                    <input
                      type="number"
                      step="0.5"
                      disabled={!criteria.wind_speed.enabled}
                      value={criteria.wind_speed.max}
                      onChange={(e) => setCriteria(c => ({ ...c, wind_speed: { ...c.wind_speed, max: parseFloat(e.target.value) || 0 } }))}
                      className="w-full text-xs font-semibold border border-slate-300 rounded px-2 py-1.5 bg-white disabled:bg-slate-100"
                    />
                  </div>
                </div>
              </div>

              {/* Current Speed Condition */}
              <div className={`p-4 rounded-xl border transition-all ${
                criteria.current_speed.enabled ? 'border-purple-300 bg-purple-50/40' : 'border-slate-200 bg-slate-50/50 opacity-75'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={criteria.current_speed.enabled}
                      onChange={(e) => setCriteria(c => ({ ...c, current_speed: { ...c.current_speed, enabled: e.target.checked } }))}
                      className="w-4 h-4 accent-purple-500 rounded cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-900">Current Velocity</span>
                  </label>
                  <span className="text-[11px] font-mono font-bold text-purple-600 bg-white px-2 py-0.5 rounded border border-purple-200">
                    m/s
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <span className="text-[10px] text-slate-500 uppercase">Min m/s</span>
                    <input
                      type="number"
                      step="0.05"
                      disabled={!criteria.current_speed.enabled}
                      value={criteria.current_speed.min}
                      onChange={(e) => setCriteria(c => ({ ...c, current_speed: { ...c.current_speed, min: parseFloat(e.target.value) || 0 } }))}
                      className="w-full text-xs font-semibold border border-slate-300 rounded px-2 py-1.5 bg-white disabled:bg-slate-100"
                    />
                  </div>
                  <span className="text-slate-400 text-xs mt-3">—</span>
                  <div className="flex-1">
                    <span className="text-[10px] text-slate-500 uppercase">Max m/s</span>
                    <input
                      type="number"
                      step="0.05"
                      disabled={!criteria.current_speed.enabled}
                      value={criteria.current_speed.max}
                      onChange={(e) => setCriteria(c => ({ ...c, current_speed: { ...c.current_speed, max: parseFloat(e.target.value) || 0 } }))}
                      className="w-full text-xs font-semibold border border-slate-300 rounded px-2 py-1.5 bg-white disabled:bg-slate-100"
                    />
                  </div>
                </div>
              </div>

              {/* Action Box */}
              <div className="p-4 rounded-xl border border-cyan-200 bg-cyan-50/50 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-bold text-cyan-900">Run Inverse Match</div>
                  <div className="text-[11px] text-cyan-700 mt-1">
                    Scans 2021–2025 timeline at this coordinate for dates that satisfy all checked criteria.
                  </div>
                </div>

                <button
                  onClick={runConditionMatcher}
                  disabled={isLoadingAdvance}
                  className="mt-4 w-full py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold rounded-lg transition-all shadow flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Search className={`w-4 h-4 ${isLoadingAdvance ? 'animate-spin' : ''}`} />
                  <span>{isLoadingAdvance ? 'Evaluating Dates...' : 'Find Matching Dates'}</span>
                </button>
              </div>

            </div>
          </div>

          {/* Results Section */}
          {advanceResult && (
            <div className="flex flex-col gap-6">
              
              {/* Header metrics */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    Found {advanceResult.matchedCount} Suitable Date Windows
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Evaluated across {advanceResult.searchedPointsCount} simulation points with {advanceResult.activeConditionsCount} active condition constraints
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-600">Strictness:</span>
                  <span className="text-xs font-mono font-bold bg-slate-100 text-slate-800 px-2.5 py-1 rounded border">
                    {advanceResult.criteria.strictness?.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Monthly Seasonality Distribution */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                  Monthly Suitability Distribution
                </h4>
                <p className="text-xs text-slate-500 mb-4">
                  Shows which months naturally have the highest probability of satisfying the specified input conditions
                </p>

                <div className="h-[180px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={advanceResult.monthlySuitabilityDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} unit="%" />
                      <RechartsTooltip
                        formatter={(val: any) => [`${val}% Suitability`, 'Average Score']}
                        contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', border: 'none', fontSize: '11px' }}
                      />
                      <Bar dataKey="averageScore" radius={[4, 4, 0, 0]}>
                        {advanceResult.monthlySuitabilityDistribution.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.averageScore >= 80 ? '#059669' : entry.averageScore >= 60 ? '#0284c7' : '#94a3b8'}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Suggested Dates Cards / Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Model-Suggested Appropriate Dates (Ranked by Compatibility)
                  </h4>
                  <span className="text-xs text-slate-500">
                    Showing top {advanceResult.suggestedDates.length} matches
                  </span>
                </div>

                {advanceResult.suggestedDates.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    <Filter className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-semibold text-slate-700">No dates found matching the current strict criteria.</p>
                    <p className="text-xs text-slate-500 mt-1">Try relaxing the min/max bounds or changing the match strictness to 'Flexible'.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {advanceResult.suggestedDates.map(match => {
                      const isExpanded = expandedDateId === match.id;
                      return (
                        <div
                          key={match.id}
                          className={`rounded-xl border p-4.5 transition-all ${
                            match.matchScore >= 90
                              ? 'border-emerald-200 bg-emerald-50/20 hover:border-emerald-400'
                              : 'border-slate-200 bg-slate-50/40 hover:border-cyan-300'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-slate-900">{match.formattedDate}</span>
                                <span className="text-[10px] font-bold text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded">
                                  {match.seasonTag}
                                </span>
                              </div>
                              <div className="text-xs text-slate-500 mt-1">
                                {match.description}
                              </div>
                            </div>

                            {/* Match Score Badge */}
                            <div className="flex flex-col items-end shrink-0">
                              <span className={`text-xs font-black px-2.5 py-1 rounded-full ${
                                match.matchScore >= 90
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : match.matchScore >= 80
                                  ? 'bg-cyan-100 text-cyan-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {match.matchScore}% Match
                              </span>
                              <span className="text-[9px] text-slate-400 mt-0.5">{match.overallSuitability}</span>
                            </div>
                          </div>

                          {/* Parameters Quick Chips */}
                          <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                            <div className="bg-white border border-slate-200 rounded p-1.5">
                              <span className="text-[9px] text-slate-400 uppercase block">SST</span>
                              <span className="font-bold text-slate-800">{match.parameters.sst.toFixed(1)}°C</span>
                            </div>
                            <div className="bg-white border border-slate-200 rounded p-1.5">
                              <span className="text-[9px] text-slate-400 uppercase block">Wind</span>
                              <span className="font-bold text-slate-800">{match.parameters.wind_speed.toFixed(1)} m/s</span>
                            </div>
                            <div className="bg-white border border-slate-200 rounded p-1.5">
                              <span className="text-[9px] text-slate-400 uppercase block">Salinity</span>
                              <span className="font-bold text-slate-800">{match.parameters.sss.toFixed(1)} PSU</span>
                            </div>
                          </div>

                          {/* Expandable Breakdown Button */}
                          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                            <button
                              onClick={() => setExpandedDateId(isExpanded ? null : match.id)}
                              className="text-[11px] text-cyan-700 hover:text-cyan-900 font-semibold flex items-center gap-1"
                            >
                              {isExpanded ? (
                                <>
                                  <ChevronUp className="w-3.5 h-3.5" /> Hide Breakdown
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="w-3.5 h-3.5" /> View Condition Breakdown
                                </>
                              )}
                            </button>

                            {onApplyLocationAndDate && (
                              <button
                                onClick={() => onApplyLocationAndDate(location, match.date)}
                                className="text-[11px] bg-slate-900 hover:bg-slate-800 text-white px-2.5 py-1 rounded font-semibold transition-colors flex items-center gap-1"
                              >
                                <span>Inspect in Dashboard</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>

                          {/* Expanded Parameter Comparison */}
                          {isExpanded && (
                            <div className="mt-3 pt-3 border-t border-slate-200 space-y-2">
                              <div className="text-[10px] font-bold text-slate-400 uppercase">
                                Parameter vs Target Bounds:
                              </div>
                              {match.parameterMatches.map(pm => (
                                <div key={pm.parameter} className="flex items-center justify-between text-xs bg-white p-2 rounded border border-slate-100">
                                  <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${pm.isSatisfied ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                                    <span className="font-medium text-slate-700">{pm.label}</span>
                                  </div>
                                  <div className="font-mono text-[11px]">
                                    <span className="font-bold text-slate-900">{pm.actualValue} {pm.unit}</span>
                                    <span className="text-slate-400 ml-1.5">(Target: {pm.targetMin}–{pm.targetMax})</span>
                                  </div>
                                </div>
                              ))}
                              
                              <div className="text-[10px] text-slate-500 italic mt-1">
                                Subsurface estimates on this date: 50m ~ {match.subsurfaceTemp50m.toFixed(1)}°C | 200m ~ {match.subsurfaceTemp200m.toFixed(1)}°C
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
};
