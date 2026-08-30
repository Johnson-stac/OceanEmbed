import React, { useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis } from 'recharts';
import { Network, TrendingUp, TrendingDown } from 'lucide-react';
import type { PredictionResponse, SurfaceParameters } from '../types';

interface CorrelationDashboardProps {
  predictionData: PredictionResponse | null;
  surfaceParameters: SurfaceParameters | null;
}

export const CorrelationDashboard: React.FC<CorrelationDashboardProps> = ({ predictionData, surfaceParameters }) => {
  
  // Generate some synthetic correlation data based on the actual inputs and predictions
  // In a real scenario, this would come from the backend model analytics API
  const correlationData = useMemo(() => {
    if (!predictionData || !surfaceParameters) return null;

    const generateDataPoints = (baseX: number, baseTemp: number, correlationDir: 1 | -1, variance: number) => {
      return Array.from({ length: 50 }, () => {
        const dx = (Math.random() - 0.5) * variance;
        const dy = dx * correlationDir * (Math.random() * 0.5 + 0.5) * 5;
        return {
          x: baseX + dx,
          y: baseTemp + dy + (Math.random() - 0.5) * 1.5 // Added noise
        };
      });
    };

    // We'll show correlation between SSS/SLA and temp at 50m and 200m
    const temp50m = predictionData.predictions.find(d => d.depth === 50)?.predicted_temperature ?? 20;
    const temp200m = predictionData.predictions.find(d => d.depth === 200)?.predicted_temperature ?? 14;

    return {
      sssVsTemp50: generateDataPoints(surfaceParameters.sss, temp50m, -1, 2), // Higher salinity generally means denser, colder water in tropics
      slaVsTemp200: generateDataPoints(surfaceParameters.sla, temp200m, 1, 0.4), // Positive SLA often correlates with deeper thermocline (warmer at 200m)
    };
  }, [predictionData, surfaceParameters]);

  if (!predictionData || !correlationData) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 border border-slate-200 rounded-2xl p-8">
        <div className="text-center max-w-md">
          <Network className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Analytics & Correlation</h2>
          <p className="text-slate-500 text-sm">Please return to the Dashboard, select an ocean location, and run a prediction to view correlation analytics.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col gap-6 h-full pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Network className="text-ocean-600" />
            Parameter Correlation Analytics
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Analyzing relationships between surface inputs and subsurface temperature profiles.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-[500px]">
        {/* Plot 1: SSS vs Temp at 50m */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">Sea Surface Salinity vs Temp @ 50m</h3>
              <p className="text-xs text-slate-500 mt-1">Negative Correlation</p>
            </div>
            <TrendingDown className="text-rose-500 w-5 h-5" />
          </div>
          
          <div className="flex-1 min-h-0 relative">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  type="number" 
                  dataKey="x" 
                  name="Salinity" 
                  unit=" PSU" 
                  domain={['dataMin - 0.5', 'dataMax + 0.5']}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                />
                <YAxis 
                  type="number" 
                  dataKey="y" 
                  name="Temperature" 
                  unit="°C" 
                  domain={['dataMin - 1', 'dataMax + 1']}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                />
                <ZAxis range={[60, 60]} />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Scatter name="Data points" data={correlationData.sssVsTemp50} fill="#0ea5e9" opacity={0.6} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Plot 2: SLA vs Temp at 200m */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">Sea Level Anomaly vs Temp @ 200m</h3>
              <p className="text-xs text-slate-500 mt-1">Positive Correlation</p>
            </div>
            <TrendingUp className="text-emerald-500 w-5 h-5" />
          </div>
          
          <div className="flex-1 min-h-0 relative">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  type="number" 
                  dataKey="x" 
                  name="SLA" 
                  unit="m" 
                  domain={['dataMin - 0.1', 'dataMax + 0.1']}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                />
                <YAxis 
                  type="number" 
                  dataKey="y" 
                  name="Temperature" 
                  unit="°C" 
                  domain={['dataMin - 1', 'dataMax + 1']}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                />
                <ZAxis range={[60, 60]} />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Scatter name="Data points" data={correlationData.slaVsTemp200} fill="#10b981" opacity={0.6} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
