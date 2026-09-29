import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Plot from 'react-plotly.js';
import { Header } from '../components/Header';
import { OceanMap } from '../components/map/OceanMap';
import { getDepthTemperature, generateMockSurfaceParameters } from '../services/fakeModel';
import type { OceanLocation, DepthPrediction } from '../types';
import { Box, Layers, Globe2, MapPin, RotateCcw, Crosshair } from 'lucide-react';

const PRESET_LOCATIONS: { name: string; lat: number; lng: number }[] = [
  { name: 'Central Arabian Sea', lat: 15.5, lng: 65.2 },
  { name: 'Central Bay of Bengal', lat: 16.0, lng: 88.5 },
  { name: 'Equatorial Indian Ocean', lat: 7.5, lng: 76.5 },
  { name: 'Goa Coastal Slope', lat: 15.2, lng: 73.0 },
];

const MAJOR_LAYERS = [0, 50, 100, 200, 500, 1000];
const ALL_DEPTHS = [0, 10, 30, 50, 75, 100, 150, 200, 300, 500, 700, 1000];

export const ThreeDOceanPage: React.FC = () => {
  const routerLocation = useLocation();
  const navState = routerLocation.state as {
    location?: OceanLocation;
    date?: string;
    selectedDepth?: number;
    predictions?: DepthPrediction[];
  } | undefined;

  const [viewMode, setViewMode] = useState<'subsurface' | 'globe'>('subsurface');
  const [selectedLocation, setSelectedLocation] = useState<OceanLocation>(
    navState?.location || PRESET_LOCATIONS[0]
  );
  const [selectedDate, setSelectedDate] = useState<string>(
    navState?.date ? new Date(navState.date).toISOString().split('T')[0] : '2022-05-15'
  );
  const [activeDepthLayer, setActiveDepthLayer] = useState<number>(
    navState?.selectedDepth ?? 100
  );

  // Read router location if transferred
  useEffect(() => {
    if (navState?.location) {
      setSelectedLocation(navState.location);
    }
    if (navState?.date) {
      setSelectedDate(new Date(navState.date).toISOString().split('T')[0]);
    }
    if (navState?.selectedDepth !== undefined) {
      setActiveDepthLayer(navState.selectedDepth);
    }
  }, [navState]);

  // Compute surface parameters
  const surfaceParams = useMemo(() => {
    return generateMockSurfaceParameters(selectedLocation.lat, selectedLocation.lng, selectedDate);
  }, [selectedLocation, selectedDate]);

  // Compute active layer inspection metrics per requirement #15 & #16
  const activeLayerInfo = useMemo(() => {
    const predictedTemp = getDepthTemperature(surfaceParams.sst, activeDepthLayer);
    const referenceTemp = Number((predictedTemp - (Math.sin(activeDepthLayer * 0.02) * 0.18 - 0.04)).toFixed(2));
    const difference = Number((predictedTemp - referenceTemp).toFixed(2));

    const suitability =
      predictedTemp >= 24 && predictedTemp <= 29
        ? 'High (Pelagic Mixed Layer)'
        : predictedTemp >= 18
        ? 'Moderate (Thermocline Subsurface)'
        : 'Stable (Abyssal Floor)';

    return {
      depth: activeDepthLayer,
      predictedTemp: Number(predictedTemp.toFixed(2)),
      referenceTemp,
      difference,
      suitability,
      lat: selectedLocation.lat,
      lng: selectedLocation.lng,
    };
  }, [activeDepthLayer, surfaceParams, selectedLocation]);

  // Plotly 3D Grid Data with interactive layer selection - Strict Blue Tones
  const plotlyData = useMemo(() => {
    const gridSize = 24;
    const gridStep = 0.08;
    const x = Array.from({ length: gridSize }, (_, i) => selectedLocation.lng + (i - gridSize / 2) * gridStep);
    const y = Array.from({ length: gridSize }, (_, i) => selectedLocation.lat + (i - gridSize / 2) * gridStep);

    return ALL_DEPTHS.map((depth) => {
      const baseTemp = getDepthTemperature(surfaceParams.sst, depth);
      const depthIndex = ALL_DEPTHS.indexOf(depth);
      const isSelected = activeDepthLayer === depth;

      // Realistic oceanic thermal gradient
      const zValues = y.map((lat) =>
        x.map((lng) => {
          const dist = Math.sqrt(Math.pow(lat - selectedLocation.lat, 2) + Math.pow(lng - selectedLocation.lng, 2));
          const waveNoise = Math.sin(lat * 5) * Math.cos(lng * 5) * 0.35 + Math.sin(lat * 12 + lng * 12) * 0.12;
          return baseTemp - dist * 0.35 + waveNoise;
        })
      );

      return {
        type: 'surface' as const,
        z: y.map(() => x.map(() => -depthIndex * 1.6)),
        x: x,
        y: y,
        surfacecolor: zValues,
        // OceanEmbed Blue Palette Shading (Abyssal Deep to Warm Mixed Layer)
        colorscale: [
          [0, '#051C40'],
          [0.25, '#0B3A82'],
          [0.55, '#1D58B5'],
          [0.8, '#458BF0'],
          [1, '#C3DCF7'],
        ],
        cmin: 4,
        cmax: 31,
        showscale: depth === 0,
        opacity: isSelected ? 0.98 : 0.72,
        colorbar: {
          title: 'Temperature (°C)',
          titleside: 'right' as const,
          tickfont: { color: '#0B3A82', size: 10, family: 'Inter' },
          titlefont: { color: '#0B3A82', size: 11, family: 'Inter' },
          thickness: 14,
          len: 0.6,
          y: 0.5,
          bgcolor: '#ffffff',
          bordercolor: '#CBDDF3',
        },
        name: `${depth}m Depth`,
        hovertemplate: `Temp: %{surfacecolor:.2f}°C<br>Depth: ${depth}m<br>Lat: %{y:.2f}°N<br>Lng: %{x:.2f}°E<extra></extra>`,
      };
    });
  }, [selectedLocation, activeDepthLayer, surfaceParams]);

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans select-none overflow-x-hidden">
      <Header />

      {/* Main 3D Canvas Area */}
      <div className="flex-1 relative w-full flex flex-col bg-white" style={{ minHeight: 'calc(100vh - 60px)' }}>
        
        {/* Floating Top Control Strip - Responsive */}
        <div className="relative z-20 bg-white border-b border-slate-200 p-2 sm:p-3 flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="bg-white px-2.5 sm:px-3.5 py-1.5 sm:py-2 border border-slate-300 shadow-sm flex items-center gap-2 sm:gap-3 rounded-none">
            <div className="p-1 bg-[#0B3A82] text-white">
              <Box className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  3D Ocean Visualizer
                </span>
                <span className="text-[10px] text-[#0B3A82] font-mono font-bold bg-[#F0F5FC] px-1.5 py-0.5 border border-[#CBDDF3]">
                  0m to 1000m
                </span>
              </div>
              <span className="text-[10px] text-slate-600 font-mono hidden sm:block">
                {selectedLocation.name} ({selectedLocation.lat.toFixed(2)}°N, {selectedLocation.lng.toFixed(2)}°E)
              </span>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="bg-white p-1 border border-slate-300 shadow-sm flex items-center gap-1 rounded-none">
            <button
              onClick={() => setViewMode('subsurface')}
              className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer rounded-none ${
                viewMode === 'subsurface'
                  ? 'bg-[#0B3A82] text-white'
                  : 'text-slate-700 hover:bg-[#F0F5FC]'
              }`}
            >
              <Layers className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span className="hidden sm:inline">Subsurface Layers</span>
              <span className="inline sm:hidden">Layers</span>
            </button>
            <button
              onClick={() => setViewMode('globe')}
              className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer rounded-none ${
                viewMode === 'globe'
                  ? 'bg-[#0B3A82] text-white'
                  : 'text-slate-700 hover:bg-[#F0F5FC]'
              }`}
            >
              <Globe2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span className="hidden sm:inline">3D Cesium Globe</span>
              <span className="inline sm:hidden">Globe</span>
            </button>
          </div>

          {/* Layer Inspection Probe - Inline on mobile */}
          {viewMode === 'subsurface' && (
            <div className="bg-white border border-slate-300 shadow-sm p-2 sm:p-3 text-slate-900 rounded-none flex-1 min-w-0 sm:max-w-xs animate-in fade-in duration-100">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0B3A82] flex items-center gap-1">
                  <Crosshair className="w-3 h-3 text-[#0B3A82]" />
                  Layer Probe
                </span>
                <span className="text-[10px] font-mono font-bold text-white bg-[#0B3A82] px-1.5 py-0.5 rounded-none">
                  {activeLayerInfo.depth}m
                </span>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[10px] font-mono">
                <span className="text-slate-600 font-sans">Predicted:</span>
                <span className="font-bold text-[#0B3A82]">{activeLayerInfo.predictedTemp}°C</span>
                <span className="text-slate-600 font-sans">GLORYS Ref:</span>
                <span className="text-slate-800 font-semibold">{activeLayerInfo.referenceTemp}°C</span>
                <span className="text-slate-600 font-sans">Δ Diff:</span>
                <span className="font-bold text-[#0B3A82]">{activeLayerInfo.difference > 0 ? `+${activeLayerInfo.difference}` : activeLayerInfo.difference}°C</span>
              </div>
            </div>
          )}
        </div>

        {/* 3D Scene Viewport */}
        <div className="flex-1 w-full relative z-0 flex items-center justify-center bg-white" style={{ minHeight: '350px' }}>
          {viewMode === 'subsurface' ? (
            <div className="w-full h-full" style={{ minHeight: '350px' }}>
              <Plot
                data={plotlyData as any}
                layout={{
                  autosize: true,
                  margin: { l: 0, r: 0, b: 0, t: 0 },
                  paper_bgcolor: '#ffffff',
                  plot_bgcolor: '#ffffff',
                  scene: {
                    aspectratio: { x: 1.1, y: 1.1, z: 0.8 },
                    camera: {
                      eye: { x: 1.4, y: -1.3, z: 1.0 },
                      center: { x: 0, y: 0, z: -0.1 },
                    },
                    xaxis: {
                      title: 'Longitude (°E)',
                      color: '#0B3A82',
                      gridcolor: '#e2e8f0',
                      showbackground: true,
                      backgroundcolor: '#f8fafc',
                    },
                    yaxis: {
                      title: 'Latitude (°N)',
                      color: '#0B3A82',
                      gridcolor: '#e2e8f0',
                      showbackground: true,
                      backgroundcolor: '#f8fafc',
                    },
                    zaxis: {
                      title: 'Depth (m)',
                      color: '#0B3A82',
                      gridcolor: '#e2e8f0',
                      showbackground: true,
                      backgroundcolor: '#f8fafc',
                      tickvals: ALL_DEPTHS.map((_, i) => -i * 1.6),
                      ticktext: ALL_DEPTHS.map((d) => `${d}m`),
                    },
                  },
                }}
                config={{
                  responsive: true,
                  displayModeBar: true,
                  modeBarButtonsToRemove: ['toImage', 'sendDataToCloud'],
                  displaylogo: false,
                }}
                style={{ width: '100%', height: '100%' }}
                useResizeHandler={true}
              />
            </div>
          ) : (
            <div className="w-full h-full" style={{ minHeight: '350px' }}>
              <OceanMap
                selectedLocation={selectedLocation}
                onLocationSelect={(loc) => setSelectedLocation(loc)}
              />
            </div>
          )}
        </div>

        {/* Structured Bottom Controls Strip */}
        <div className="bg-white border-t-2 border-slate-300 p-2.5 sm:p-3.5 flex flex-wrap items-center justify-between gap-2 sm:gap-3 text-xs z-20">
          
          {/* Depth Layer Selector Buttons */}
          {viewMode === 'subsurface' && (
            <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-800 mr-1 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-[#0B3A82]" />
                <span className="hidden sm:inline">Select Depth Layer:</span>
                <span className="inline sm:hidden">Depth:</span>
              </span>
              {MAJOR_LAYERS.map((d) => (
                <button
                  key={d}
                  onClick={() => setActiveDepthLayer(d)}
                  className={`px-2 sm:px-3 py-1 font-mono text-xs font-bold border transition-colors cursor-pointer rounded-none ${
                    activeDepthLayer === d
                      ? 'bg-[#0B3A82] text-white border-[#0B3A82] shadow-sm'
                      : 'bg-white hover:bg-[#F0F5FC] text-slate-800 border-slate-300'
                  }`}
                >
                  {d}m
                </button>
              ))}
            </div>
          )}

          {/* Date Selector */}
          <div className="flex items-center gap-2 border border-slate-300 px-2.5 py-1 bg-white">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#0B3A82]">DATE:</span>
            <input
              type="date"
              value={selectedDate}
              min="2018-01-01"
              max="2024-12-31"
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-slate-900 font-mono text-xs focus:outline-none cursor-pointer"
            />
          </div>

          {/* Presets */}
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1 mr-1">
              <MapPin className="w-3 h-3 text-[#0B3A82]" />
              <span className="hidden sm:inline">Station:</span>
            </span>
            {PRESET_LOCATIONS.map((loc) => (
              <button
                key={loc.name}
                onClick={() => setSelectedLocation(loc)}
                className={`px-2 py-0.5 text-xs font-semibold border transition-colors cursor-pointer rounded-none ${
                  selectedLocation.name === loc.name
                    ? 'bg-[#F0F5FC] text-[#0B3A82] font-bold border-[#0B3A82]'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span className="hidden md:inline">{loc.name}</span>
                <span className="inline md:hidden">{loc.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>

          {/* Reset View */}
          <button
            onClick={() => setActiveDepthLayer(100)}
            className="flex items-center gap-1 px-2 sm:px-3 py-1 bg-white hover:bg-[#F0F5FC] text-[#0B3A82] border border-[#0B3A82] font-bold text-xs cursor-pointer rounded-none"
            title="Reset layer selection"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">RESET VIEW</span>
          </button>
        </div>
      </div>
    </div>
  );
};
