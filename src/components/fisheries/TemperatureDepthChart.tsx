import React from 'react';
import type { PredictionResponse } from '../../types';
import type { MockSpecies } from '../../data/mockSpecies';
import type { PotentialHabitatPoint } from '../../services/habitatAnalysis';
import { generateMockDepthProfile } from '../../services/fakeModel';
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
} from 'recharts';

interface TemperatureDepthChartProps {
  predictionData: PredictionResponse | null;
  species: MockSpecies;
  selectedPoint?: PotentialHabitatPoint | null;
}

export const TemperatureDepthChart: React.FC<TemperatureDepthChartProps> = ({
  predictionData,
  species,
  selectedPoint,
}) => {
  const baseSst = selectedPoint ? selectedPoint.temp : 28.2;
  const predictions = predictionData?.predictions || generateMockDepthProfile(baseSst);

  const data = predictions.map((p) => ({
    depth: p.depth,
    temperature: Number(p.predicted_temperature.toFixed(2)),
  }));

  const minTempInData = Math.min(...data.map((d) => d.temperature));
  const maxTempInData = Math.max(...data.map((d) => d.temperature));

  const xDomainMin = Math.floor(Math.min(minTempInData, species.minTemp) - 2);
  const xDomainMax = Math.ceil(Math.max(maxTempInData, species.maxTemp) + 2);

  return (
    <div className="bg-white border-2 border-slate-300 rounded-none p-5 h-full flex flex-col justify-between shadow-none">
      <div>
        <div className="mb-4 pb-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Vertical Thermal Profile vs Species Window
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {selectedPoint
                ? `Location: ${selectedPoint.lat.toFixed(1)}°N, ${selectedPoint.lng.toFixed(1)}°E (${selectedPoint.regionName})`
                : `${species.name} thermal envelope across reconstructed depths`}
            </p>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-[#F0F5FC] text-[#0B3A82] px-2.5 py-1 rounded-none border border-[#CBDDF3] self-start sm:self-auto font-mono">
            {species.minTemp}°C – {species.maxTemp}°C Window
          </span>
        </div>

        <div className="h-[310px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={data}
              layout="vertical"
              margin={{ top: 20, right: 20, bottom: 20, left: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={true} stroke="#e2e8f0" />

              <XAxis
                type="number"
                dataKey="temperature"
                domain={[xDomainMin, xDomainMax]}
                axisLine={true}
                tickLine={true}
                stroke="#64748b"
                tick={{ fontSize: 10, fill: '#475569' }}
                label={{
                  value: 'Temperature (°C)',
                  position: 'top',
                  offset: 0,
                  fontSize: 10,
                  fill: '#0B3A82',
                  fontWeight: 600,
                }}
                orientation="top"
              />

              <YAxis
                type="number"
                dataKey="depth"
                reversed={true}
                axisLine={true}
                tickLine={true}
                stroke="#64748b"
                tick={{ fontSize: 10, fill: '#475569' }}
                label={{
                  value: 'Depth (m)',
                  angle: -90,
                  position: 'left',
                  offset: 0,
                  fontSize: 10,
                  fill: '#0B3A82',
                  fontWeight: 600,
                }}
              />

              <Tooltip
                contentStyle={{
                  borderRadius: '0px',
                  border: '1px solid #0B3A82',
                  boxShadow: 'none',
                  backgroundColor: '#ffffff',
                }}
                itemStyle={{ fontSize: '11px', fontWeight: 600, color: '#0B3A82' }}
                labelStyle={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}
                formatter={(value: any) => [`${value}°C`, 'Subsurface Temp']}
                labelFormatter={(label) => `Depth: ${label}m`}
              />

              {/* Thermal Preference Band in Soft Blue Tint */}
              <ReferenceArea
                x1={species.minTemp}
                x2={species.maxTemp}
                fill="#C3DCF7"
                fillOpacity={0.4}
              />

              <Line
                type="monotone"
                dataKey="temperature"
                stroke="#0B3A82"
                strokeWidth={3}
                dot={{ r: 3.5, fill: '#0B3A82', strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#082C64', strokeWidth: 0 }}
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-5 pt-3 border-t border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-1 bg-[#0B3A82]"></div>
          <span className="text-[11px] text-slate-700 font-semibold">Reconstructed Profile</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3 bg-[#C3DCF7] border border-[#94C0F2]"></div>
          <span className="text-[11px] text-slate-700 font-semibold">
            {species.name} Preference ({species.minTemp}°C–{species.maxTemp}°C)
          </span>
        </div>
      </div>
    </div>
  );
};
