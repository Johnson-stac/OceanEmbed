import React from 'react';
import type { PredictionResponse } from '../../types';
import type { MockSpecies } from '../../data/mockSpecies';
import { 
  ComposedChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceArea
} from 'recharts';

interface TemperatureDepthChartProps {
  predictionData: PredictionResponse | null;
  species: MockSpecies;
}

export const TemperatureDepthChart: React.FC<TemperatureDepthChartProps> = ({ predictionData, species }) => {
  if (!predictionData || !predictionData.predictions) return null;

  // We need to invert the Y-axis conceptually so depth goes down.
  // Recharts YAxis reversed={true} handles this.
  const data = predictionData.predictions.map(p => ({
    depth: p.depth,
    temperature: Number(p.predicted_temperature.toFixed(2))
  }));

  const minTempInData = Math.min(...data.map(d => d.temperature));
  const maxTempInData = Math.max(...data.map(d => d.temperature));
  
  const xDomainMin = Math.floor(Math.min(minTempInData, species.minTemp) - 2);
  const xDomainMax = Math.ceil(Math.max(maxTempInData, species.maxTemp) + 2);

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
      <div className="mb-6">
        <h3 className="text-base font-bold text-slate-900">Temperature vs Depth Profile</h3>
        <p className="text-xs text-slate-500 mt-0.5">Predicted subsurface temperature with species thermal preference overlaid</p>
      </div>

      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} layout="vertical" margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={true} stroke="#e2e8f0" />
            
            <XAxis 
              type="number" 
              dataKey="temperature" 
              domain={[xDomainMin, xDomainMax]}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#64748b' }}
              label={{ value: 'Temperature (°C)', position: 'top', offset: 0, fontSize: 11, fill: '#64748b' }}
              orientation="top"
            />
            
            <YAxis 
              type="number" 
              dataKey="depth" 
              reversed={true} 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#64748b' }}
              label={{ value: 'Depth (m)', angle: -90, position: 'left', offset: 0, fontSize: 11, fill: '#64748b' }}
            />
            
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ fontSize: '13px', fontWeight: 600, color: '#0ea5e9' }}
              labelStyle={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}
              formatter={(value: any) => [`${value}°C`, 'Temperature']}
              labelFormatter={(label) => `Depth: ${label}m`}
            />

            {/* Thermal Preference Band */}
            <ReferenceArea 
              x1={species.minTemp} 
              x2={species.maxTemp} 
              fill="#10b981" 
              fillOpacity={0.15} 
            />

            <Line 
              type="monotone" 
              dataKey="temperature" 
              stroke="#0ea5e9" 
              strokeWidth={3}
              dot={{ r: 4, fill: '#0ea5e9', strokeWidth: 0 }}
              activeDot={{ r: 6, fill: '#0284c7', strokeWidth: 0 }}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#0ea5e9]"></div>
          <span className="text-xs text-slate-600 font-medium">Predicted Temperature</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#10b981] opacity-20 border border-[#10b981]"></div>
          <span className="text-xs text-slate-600 font-medium">{species.name} Preference ({species.minTemp}-{species.maxTemp}°C)</span>
        </div>
      </div>
    </div>
  );
};
