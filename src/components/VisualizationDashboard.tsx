import React, { useMemo, useState } from 'react';
import Plot from 'react-plotly.js';
import { Layers, Info } from 'lucide-react';
import type { OceanLocation, SurfaceParameters, PredictionResponse } from '../types';
import { getDepthTemperature } from '../services/fakeModel';

interface VisualizationDashboardProps {
  location: OceanLocation | null;
  surfaceParameters: SurfaceParameters | null;
  predictionData: PredictionResponse | null;
}

export const VisualizationDashboard: React.FC<VisualizationDashboardProps> = ({ location, surfaceParameters, predictionData }) => {
  const depths = [0, 5, 10, 20, 30, 50, 75, 100, 125, 150, 200, 300, 500, 700, 1000];
  const [selectedLayerIdx, setSelectedLayerIdx] = useState<number | null>(null);

  // Generate a smooth grid around the selected point for the 3D surfaces
  const gridData = useMemo(() => {
    if (!location || !surfaceParameters) return null;

    const gridSize = 35;
    const gridStep = 0.07;
    
    // Create grid coordinates
    const x = Array.from({ length: gridSize }, (_, i) => location.lng + (i - gridSize/2) * gridStep);
    const y = Array.from({ length: gridSize }, (_, i) => location.lat + (i - gridSize/2) * gridStep);

    const minTemp = 4;
    const maxTemp = Math.ceil(surfaceParameters.sst + 1);

    // Create surface traces for each depth
    const traces: any[] = depths.map((depth, depthIdx) => {
      // Base temp for this depth
      let baseTemp = surfaceParameters.sst;
      if (predictionData && predictionData.predictions && predictionData.predictions[depthIdx]) {
        baseTemp = predictionData.predictions[depthIdx].predicted_temperature;
      } else {
        baseTemp = getDepthTemperature(surfaceParameters.sst, depth);
      }

      // Generate z matrix (temperature values with smooth procedural noise for realistic ocean gradients)
      const z = y.map(lat => 
        x.map(lng => {
          const dist = Math.sqrt(Math.pow(lat - location.lat, 2) + Math.pow(lng - location.lng, 2));
          const noise = Math.sin(lat * 6) * Math.cos(lng * 6) * 0.4 + Math.sin(lat * 14 + lng * 14) * 0.15;
          return baseTemp - dist * 0.5 + noise;
        })
      );

      return {
        type: 'surface',
        z: y.map(() => x.map(() => depthIdx)), // Plot Z by index so they are evenly spaced visually
        x: x,
        y: y,
        name: `${depth}m Depth`,
        colorscale: 'Jet',
        showscale: depthIdx === 0,
        opacity: 0.8,
        // We use 'surfacecolor' for temperature, and 'z' for depth representation.
        surfacecolor: z,
        colorbar: depthIdx === 0 ? { title: 'Temperature (°C)', thickness: 15, len: 0.5, y: 0.8 } : undefined,
        hovertemplate: `Temp: %{surfacecolor:.2f}°C<br>Depth: ${depth}m<extra></extra>`
      };
    });

    return traces;
  }, [location, surfaceParameters, predictionData]);

  const selectedLayerData = useMemo(() => {
    if (selectedLayerIdx === null || !gridData) return null;
    const trace3D = gridData[selectedLayerIdx];
    if (!trace3D) return null;
    
    return [{
      type: 'heatmap' as const,
      x: trace3D.x,
      y: trace3D.y,
      z: trace3D.surfacecolor,
      colorscale: 'Jet',
      zauto: true,
      zsmooth: 'best' as const,
      colorbar: { title: 'Temp (°C)', thickness: 15 },
      hovertemplate: `Temp: %{z:.2f}°C<br>Lat: %{y:.2f}<br>Lng: %{x:.2f}<extra></extra>`
    }];
  }, [selectedLayerIdx, gridData]);

  if (!location) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 border border-slate-200 rounded-2xl p-8">
        <div className="text-center max-w-md">
          <Layers className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-800 mb-2">3D Layer Profiler</h2>
          <p className="text-slate-500 text-sm">Please return to the Dashboard and select an ocean location on the map to visualize subsurface layers.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col w-full pb-12">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="text-ocean-600" />
            3D Subsurface Layer Visualization
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Analyzing 0.25° grid around {location.lat.toFixed(2)}°N, {location.lng.toFixed(2)}°E across 15 depth layers (0m to 1000m).
          </p>
        </div>
        <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm border border-blue-100 shadow-sm">
          <Info className="w-4 h-4" />
          <span>Interactive 3D Plot: Click layers to inspect values, drag to rotate, scroll to zoom</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 mb-8 h-[700px]">
        {/* Left Side: 3D Layers */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
          <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 shadow-sm border border-slate-200">
            3D Overview (Click a layer)
          </div>
          {gridData ? (
            <Plot
              data={gridData}
              layout={{
                autosize: true,
                margin: { l: 20, r: 20, b: 20, t: 40 },
                paper_bgcolor: '#ffffff',
                plot_bgcolor: '#ffffff',
                font: { color: '#334155' },
                scene: {
                  aspectmode: 'manual',
                  aspectratio: { x: 1.5, y: 1.5, z: 1.2 },
                  camera: {
                    eye: { x: -1.2, y: -1.2, z: 0.4 },
                    center: { x: 0, y: 0, z: -0.1 }
                  },
                  xaxis: { title: 'Longitude', gridcolor: '#e2e8f0', zerolinecolor: '#cbd5e1', tickfont: { color: '#64748b' }, titlefont: { color: '#334155', size: 12 } },
                  yaxis: { title: 'Latitude', gridcolor: '#e2e8f0', zerolinecolor: '#cbd5e1', tickfont: { color: '#64748b' }, titlefont: { color: '#334155', size: 12 } },
                  zaxis: { 
                    title: 'Depth (m)', gridcolor: '#e2e8f0', zerolinecolor: '#cbd5e1', tickfont: { color: '#64748b' }, titlefont: { color: '#334155', size: 12 },
                    tickmode: 'array',
                    tickvals: Array.from({ length: 15 }, (_, i) => i),
                    ticktext: ['0m', '5m', '10m', '20m', '30m', '50m', '75m', '100m', '125m', '150m', '200m', '300m', '500m', '700m', '1000m'],
                    autorange: 'reversed'
                  }
                }
              }}
              useResizeHandler={true}
              style={{ width: '100%', height: '100%' }}
              config={{ displayModeBar: false, responsive: true }}
              onClick={(e) => {
                if (e.points && e.points.length > 0) {
                  setSelectedLayerIdx(e.points[0].curveNumber);
                }
              }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
            </div>
          )}
        </div>

        {/* Right Side: 2D Inspection */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative flex flex-col">
          <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 shadow-sm border border-slate-200">
            2D Layer Inspection
          </div>
          {selectedLayerIdx !== null && selectedLayerData ? (
            <>
              <div className="absolute top-4 right-4 z-10 bg-cyan-50 border border-cyan-200 text-cyan-800 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm">
                Depth: {depths[selectedLayerIdx]}m
              </div>
              <div className="flex-1 mt-12 relative">
                <Plot
                  data={selectedLayerData}
                  layout={{
                    autosize: true,
                    margin: { l: 50, r: 20, b: 50, t: 20 },
                    paper_bgcolor: '#ffffff',
                    plot_bgcolor: '#ffffff',
                    xaxis: { title: 'Longitude' },
                    yaxis: { title: 'Latitude' }
                  }}
                  useResizeHandler={true}
                  style={{ width: '100%', height: '100%', minHeight: '500px' }}
                  config={{ displayModeBar: false, responsive: true }}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-slate-50 p-8">
              <div className="text-center">
                <Layers className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-sm font-semibold text-slate-700">No Layer Selected</h3>
                <p className="text-xs text-slate-500 mt-2">Click on any depth layer in the 3D plot to inspect it in 2D.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Depth Information Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <h3 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Ocean Depth Zones & Marine Environments</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="bg-sky-50 rounded-xl p-6 border border-sky-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-sky-200 rounded-bl-full -mr-4 -mt-4 opacity-50 group-hover:scale-110 transition-transform"></div>
            <h4 className="text-lg font-bold text-sky-900 relative z-10">Epipelagic Zone</h4>
            <div className="inline-block bg-sky-200 text-sky-800 text-[10px] font-bold px-2 py-0.5 rounded mt-1 mb-3 uppercase tracking-wider relative z-10">Sunlight Zone (0m - 200m)</div>
            <p className="text-sm text-sky-800/80 mb-4 relative z-10">
              The illuminated surface zone where enough light penetrates for photosynthesis. This layer hosts the vast majority of commercial fisheries and marine life.
            </p>
            <ul className="text-xs text-sky-800 space-y-2 relative z-10 font-medium">
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span> Phytoplankton & Zooplankton</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span> Tuna, Marlin, Mackerel</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span> Sea Turtles & Dolphins</li>
            </ul>
          </div>

          <div className="bg-blue-50 rounded-xl p-6 border border-blue-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-200 rounded-bl-full -mr-4 -mt-4 opacity-50 group-hover:scale-110 transition-transform"></div>
            <h4 className="text-lg font-bold text-blue-900 relative z-10">Mesopelagic Zone</h4>
            <div className="inline-block bg-blue-200 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded mt-1 mb-3 uppercase tracking-wider relative z-10">Twilight Zone (200m - 1000m)</div>
            <p className="text-sm text-blue-800/80 mb-4 relative z-10">
              A dim zone where light rapidly fades. Rapid temperature drops occur here (the thermocline). Many species here migrate to the surface at night to feed.
            </p>
            <ul className="text-xs text-blue-800 space-y-2 relative z-10 font-medium">
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span> Lanternfish (Myctophids)</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span> Swordfish & Bigeye Tuna</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span> Giant Squid & Cuttlefish</li>
            </ul>
          </div>

          <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-slate-200 rounded-bl-full -mr-4 -mt-4 opacity-50 group-hover:scale-110 transition-transform"></div>
            <h4 className="text-lg font-bold text-slate-900 relative z-10">Bathypelagic Zone</h4>
            <div className="inline-block bg-slate-200 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded mt-1 mb-3 uppercase tracking-wider relative z-10">Midnight Zone (1000m+)</div>
            <p className="text-sm text-slate-600 mb-4 relative z-10">
              Complete darkness except for bioluminescence. The water here is near freezing and under immense pressure. Life is sparse but highly adapted.
            </p>
            <ul className="text-xs text-slate-700 space-y-2 relative z-10 font-medium">
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Anglerfish & Bristlemouths</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Vampire Squid</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Deep-sea Sponges</li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
};
