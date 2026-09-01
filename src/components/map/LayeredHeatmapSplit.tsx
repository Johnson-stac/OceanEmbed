import React, { useMemo, useState } from 'react';
import Plot from 'react-plotly.js';
import { Layers } from 'lucide-react';
import type { OceanLocation, SurfaceParameters, PredictionResponse } from '../../types';
import { getDepthTemperature } from '../../services/fakeModel';

interface LayeredHeatmapSplitProps {
  location: OceanLocation;
  surfaceParameters: SurfaceParameters | null;
  predictionData: PredictionResponse | null;
}

export const LayeredHeatmapSplit: React.FC<LayeredHeatmapSplitProps> = ({ location, surfaceParameters, predictionData }) => {
  const depths = [0, 5, 10, 20, 30, 50, 75, 100, 125, 150, 200, 300, 500, 700, 1000];
  const [selectedLayerIdx, setSelectedLayerIdx] = useState<number>(0);

  const gridData = useMemo(() => {
    if (!surfaceParameters) return null;

    const gridSize = 35;
    const gridStep = 0.07;
    
    const x = Array.from({ length: gridSize }, (_, i) => location.lng + (i - gridSize/2) * gridStep);
    const y = Array.from({ length: gridSize }, (_, i) => location.lat + (i - gridSize/2) * gridStep);

    const traces: any[] = depths.map((depth, depthIdx) => {
      let baseTemp = surfaceParameters.sst;
      if (predictionData && predictionData.predictions && predictionData.predictions[depthIdx]) {
        baseTemp = predictionData.predictions[depthIdx].predicted_temperature;
      } else {
        baseTemp = getDepthTemperature(surfaceParameters.sst, depth);
      }

      const z = y.map(lat => 
        x.map(lng => {
          const dist = Math.sqrt(Math.pow(lat - location.lat, 2) + Math.pow(lng - location.lng, 2));
          const noise = Math.sin(lat * 6) * Math.cos(lng * 6) * 0.4 + Math.sin(lat * 14 + lng * 14) * 0.15;
          return baseTemp - dist * 0.5 + noise;
        })
      );

      return {
        type: 'surface',
        z: y.map(() => x.map(() => depthIdx)),
        x: x,
        y: y,
        name: `${depth}m Depth`,
        colorscale: 'Jet',
        showscale: depthIdx === 0,
        opacity: 0.85,
        surfacecolor: z,
        colorbar: depthIdx === 0 ? { title: 'Temperature (°C)', thickness: 10, len: 0.5, y: 0.8, outlinewidth: 0, tickfont: {size: 10} } : undefined,
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
      colorbar: { title: 'Temp (°C)', thickness: 12, outlinewidth: 0, tickfont: {size: 10} },
      hovertemplate: `Temp: %{z:.2f}°C<br>Lat: %{y:.2f}<br>Lng: %{x:.2f}<extra></extra>`
    }];
  }, [selectedLayerIdx, gridData]);

  if (!surfaceParameters) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-slate-50 border border-slate-200 rounded-xl">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col md:flex-row gap-4 bg-white rounded-xl shadow-sm border border-slate-300 p-2 overflow-hidden">
      {/* Left Side: 3D Layers */}
      <div className="flex-[1.2] relative bg-slate-50 rounded-lg overflow-hidden border border-slate-200">
        <div className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur px-2.5 py-1 rounded-md text-[11px] font-bold text-slate-700 shadow-sm border border-slate-200 uppercase tracking-wide">
          3D Layers
        </div>
        {gridData ? (
          <Plot
            data={gridData}
            layout={{
              autosize: true,
              margin: { l: 0, r: 0, b: 0, t: 0 },
              paper_bgcolor: 'transparent',
              plot_bgcolor: 'transparent',
              font: { color: '#475569', family: 'Inter' },
              scene: {
                aspectmode: 'manual',
                aspectratio: { x: 1.5, y: 1.5, z: 1.2 },
                camera: {
                  eye: { x: -1.4, y: -1.4, z: 0.5 },
                  center: { x: 0, y: 0, z: -0.1 }
                },
                xaxis: { title: '', gridcolor: '#e2e8f0', zerolinecolor: '#cbd5e1', showticklabels: false },
                yaxis: { title: '', gridcolor: '#e2e8f0', zerolinecolor: '#cbd5e1', showticklabels: false },
                zaxis: { 
                  title: 'Depth', gridcolor: '#e2e8f0', zerolinecolor: '#cbd5e1', titlefont: { size: 10 },
                  tickmode: 'array',
                  tickvals: Array.from({ length: 15 }, (_, i) => i),
                  ticktext: ['0m', '', '', '20m', '', '50m', '', '100m', '', '150m', '', '300m', '', '700m', '1000m'],
                  autorange: 'reversed',
                  tickfont: { size: 9 }
                }
              }
            }}
            useResizeHandler={true}
            style={{ width: '100%', height: '100%', minHeight: '400px' }}
            config={{ displayModeBar: false, responsive: true }}
            onClick={(e) => {
              if (e.points && e.points.length > 0) {
                setSelectedLayerIdx(e.points[0].curveNumber);
              }
            }}
          />
        ) : null}
      </div>

      {/* Right Side: 2D Inspection */}
      <div className="flex-1 relative bg-slate-50 rounded-lg overflow-hidden border border-slate-200 flex flex-col">
        <div className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur px-2.5 py-1 rounded-md text-[11px] font-bold text-slate-700 shadow-sm border border-slate-200 uppercase tracking-wide">
          2D Slice
        </div>
        
        {selectedLayerIdx !== null && selectedLayerData ? (
          <>
            <div className="absolute top-3 right-3 z-10 bg-cyan-600 text-white px-2.5 py-1 rounded-md text-[11px] font-bold shadow-sm uppercase tracking-wider">
              {depths[selectedLayerIdx]}m
            </div>
            <div className="flex-1 w-full h-full relative">
              <Plot
                data={selectedLayerData}
                layout={{
                  autosize: true,
                  margin: { l: 40, r: 10, b: 40, t: 30 },
                  paper_bgcolor: 'transparent',
                  plot_bgcolor: 'transparent',
                  font: { color: '#475569', family: 'Inter' },
                  xaxis: { title: 'Longitude', titlefont: { size: 10 }, tickfont: { size: 9 }, gridcolor: '#e2e8f0' },
                  yaxis: { title: 'Latitude', titlefont: { size: 10 }, tickfont: { size: 9 }, gridcolor: '#e2e8f0' }
                }}
                useResizeHandler={true}
                style={{ width: '100%', height: '100%', minHeight: '300px' }}
                config={{ displayModeBar: false, responsive: true }}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <Layers className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-xs text-slate-500 font-medium">Click a layer in 3D to inspect</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
