import React, { useMemo } from 'react';
import Plot from 'react-plotly.js';
import { Layers, Info } from 'lucide-react';
import type { OceanLocation, SurfaceParameters, PredictionResponse } from '../types';

interface VisualizationDashboardProps {
  location: OceanLocation | null;
  surfaceParameters: SurfaceParameters | null;
  predictionData: PredictionResponse | null;
}

export const VisualizationDashboard: React.FC<VisualizationDashboardProps> = ({ location, surfaceParameters, predictionData }) => {
  // Generate a mock 0.25d grid around the selected point for the 3D surfaces
  const gridData = useMemo(() => {
    if (!location || !surfaceParameters) return null;

    const gridSize = 10;
    const gridStep = 0.25;
    const depths = [0, 5, 10, 20, 30, 50, 75, 100, 125, 150, 200, 300, 500, 700, 1000];
    
    // Create grid coordinates
    const x = Array.from({ length: gridSize }, (_, i) => location.lng + (i - gridSize/2) * gridStep);
    const y = Array.from({ length: gridSize }, (_, i) => location.lat + (i - gridSize/2) * gridStep);

    // Create surface traces for each depth
    const traces: any[] = depths.map((depth, depthIdx) => {
      // Base temp for this depth
      let baseTemp = surfaceParameters.sst;
      if (predictionData && predictionData.predictions.length > depthIdx) {
        baseTemp = predictionData.predictions[Math.min(depthIdx * 2, predictionData.predictions.length - 1)].predicted_temperature;
      } else {
        baseTemp -= depth * 0.03; // Mock cooling if no prediction
      }

      // Generate z matrix (temperature values with some procedural noise for realism)
      const z = y.map(lat => 
        x.map(lng => {
          const dist = Math.sqrt(Math.pow(lat - location.lat, 2) + Math.pow(lng - location.lng, 2));
          const noise = Math.sin(lat * 10) * Math.cos(lng * 10) * 0.5;
          return baseTemp - dist * 2 + noise;
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
    <div className="flex-1 flex flex-col h-[calc(100vh-140px)] w-full">
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

      <div className="flex-1 bg-[#0f172a] rounded-2xl shadow-xl border border-slate-800 overflow-hidden relative">
        {gridData ? (
          <Plot
            data={gridData}
            layout={{
              autosize: true,
              margin: { l: 0, r: 0, b: 0, t: 0 },
              paper_bgcolor: 'transparent',
              plot_bgcolor: 'transparent',
              font: { color: '#94a3b8' },
              scene: {
                aspectmode: 'manual',
                aspectratio: { x: 1.2, y: 1.2, z: 0.8 },
                camera: {
                  eye: { x: -1.5, y: -1.5, z: 0.5 },
                  center: { x: 0, y: 0, z: -0.2 }
                },
                xaxis: { 
                  title: 'Longitude', 
                  gridcolor: '#334155',
                  zerolinecolor: '#475569',
                  tickfont: { color: '#94a3b8' },
                  titlefont: { color: '#cbd5e1' }
                },
                yaxis: { 
                  title: 'Latitude',
                  gridcolor: '#334155',
                  zerolinecolor: '#475569',
                  tickfont: { color: '#94a3b8' },
                  titlefont: { color: '#cbd5e1' }
                },
                zaxis: { 
                  title: 'Depth (m)',
                  gridcolor: '#334155',
                  zerolinecolor: '#475569',
                  tickfont: { color: '#94a3b8' },
                  titlefont: { color: '#cbd5e1' },
                  tickmode: 'array',
                  tickvals: Array.from({ length: 15 }, (_, i) => i),
                  ticktext: ['0m', '5m', '10m', '20m', '30m', '50m', '75m', '100m', '125m', '150m', '200m', '300m', '500m', '700m', '1000m'],
                  autorange: 'reversed' // So index 0 (surface) is at top
                }
              }
            }}
            useResizeHandler={true}
            style={{ width: '100%', height: '100%' }}
            config={{ displayModeBar: false, responsive: true }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
          </div>
        )}
      </div>
    </div>
  );
};
