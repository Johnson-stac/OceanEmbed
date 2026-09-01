import React from 'react';
import type { PredictionResponse } from '../../types';
import type { MockSpecies } from '../../data/mockSpecies';
import { generateMockDepthProfile } from '../../services/fakeModel';
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
  const predictions = predictionData?.predictions || generateMockDepthProfile(28.5);

  const data = predictions.map(p => ({
    depth: p.depth,
    temperature: Number(p.predicted_temperature.toFixed(2))
  }));

  const minTempInData = Math.min(...data.map(d => d.temperature));
  const maxTempInData = Math.max(...data.map(d => d.temperature));
  
  const xDomainMin = Math.floor(Math.min(minTempInData, species.minTemp) - 2);
  const xDomainMax = Math.ceil(Math.max(maxTempInData, species.maxTemp) + 2);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 h-full flex flex-col justify-between">
      <div>
        <div className="mb-4 pb-3 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Vertical Thermal Envelope</h3>
            <p className="text-xs text-slate-500 mt-0.5">{species.name} thermal window across depth layers</p>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
            {species.minTemp}°C – {species.maxTemp}°C Window
          </span>
        </div>

        <div className="h-[340px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} layout="vertical" margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
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
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ fontSize: '12px', fontWeight: 600, color: '#4f46e5' }}
                labelStyle={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}
                formatter={(value: any) => [`${value}°C`, 'Subsurface Temp']}
                labelFormatter={(label) => `Depth: ${label}m`}
              />

              {/* Thermal Preference Band */}
              <ReferenceArea 
                x1={species.minTemp} 
                x2={species.maxTemp} 
                fill="#10b981" 
                fillOpacity={0.18} 
              />

              <Line 
                type="monotone" 
                dataKey="temperature" 
                stroke="#4f46e5" 
                strokeWidth={3}
                dot={{ r: 4, fill: '#4f46e5', strokeWidth: 0 }}
                activeDot={{ r: 6, fill: '#3730a3', strokeWidth: 0 }}
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="flex items-center justify-center gap-6 pt-3 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#4f46e5]"></div>
          <span className="text-xs text-slate-600 font-medium">Subsurface Temp Profile</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#10b981] opacity-25 border border-[#10b981]"></div>
          <span className="text-xs text-slate-600 font-medium">{species.name} Range ({species.minTemp}-{species.maxTemp}°C)</span>
        </div>
      </div>
    </div>
  );
};
