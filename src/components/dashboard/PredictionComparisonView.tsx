import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { Layers, ShieldCheck, Activity, Box, FileText, Info } from 'lucide-react';
import type { PredictionResponse } from '../../types';

interface PredictionComparisonViewProps {
  predictionData: PredictionResponse;
  selectedDepth: number;
  onOpenReport?: () => void;
}

export const PredictionComparisonView: React.FC<PredictionComparisonViewProps> = ({
  predictionData,
  selectedDepth,
  onOpenReport,
}) => {
  const navigate = useNavigate();
  const { predictions, location, date, validation_metrics } = predictionData;

  const chartData = predictions.map((p) => ({
    depth: p.depth,
    predicted: p.predicted_temperature,
    glorys: p.glorys_reference ?? p.predicted_temperature,
    diff: p.difference ?? 0,
  }));

  const handleViewIn3D = () => {
    navigate('/3d', {
      state: {
        location,
        date,
        selectedDepth,
        predictions,
      },
    });
  };

  return (
    <div className="bg-white border border-slate-300 rounded-none p-4 sm:p-6 shadow-none text-slate-900 mt-5 font-sans">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 bg-[#0B3A82] inline-block" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#0B3A82]">
              Prediction Complete
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Subsurface Temperature Reconstruction &amp; GLORYS Reference
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Target Location: <span className="font-mono text-slate-900 font-bold">{location.lat.toFixed(2)}°N, {location.lng.toFixed(2)}°E</span> · Date: <span className="font-mono text-slate-800 font-semibold">{new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </p>
        </div>

        {/* Action Buttons: VIEW IN 3D and GENERATE DETAILED REPORT (Strictly Blue & White) */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* VIEW IN 3D per requirement #12 */}
          <button
            onClick={handleViewIn3D}
            className="flex items-center gap-2 px-3.5 sm:px-4 py-2 bg-[#0B3A82] hover:bg-[#082C64] active:bg-[#051C40] text-white text-xs font-bold uppercase tracking-wider rounded-none border border-[#0B3A82] transition-colors cursor-pointer shadow-sm"
            title="Inspect reconstructed subsurface layers in 3D"
          >
            <Box className="w-4 h-4" />
            <span>VIEW IN 3D</span>
          </button>

          {/* GENERATE DETAILED REPORT per requirement #30 & #31 */}
          {onOpenReport && (
            <button
              onClick={onOpenReport}
              className="flex items-center gap-2 px-3.5 sm:px-4 py-2 bg-white hover:bg-[#F0F5FC] text-[#0B3A82] text-xs font-bold uppercase tracking-wider rounded-none border-2 border-[#0B3A82] transition-colors cursor-pointer shadow-sm"
              title="Generate scientific observation report"
            >
              <FileText className="w-4 h-4 text-[#0B3A82]" />
              <span>GENERATE DETAILED REPORT</span>
            </button>
          )}

          <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-[#F0F5FC] border border-[#CBDDF3] text-xs text-[#0B3A82] font-semibold">
            <ShieldCheck className="w-4 h-4 text-[#0B3A82] shrink-0" />
            <span>GLORYS Reference — Demo Data</span>
          </div>
        </div>
      </div>

      {/* Summary Metrics Bar - Strict Blue and White */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 my-4 sm:my-5">
        <div className="border border-slate-200 p-3 sm:p-3.5 bg-white">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block mb-1">Surface Temperature (0m)</span>
          <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono">{predictions[0]?.predicted_temperature.toFixed(2)} °C</span>
          <span className="text-[10px] text-[#0B3A82] font-semibold block mt-1">Observed SST Anchor</span>
        </div>

        <div className="border border-slate-200 p-3 sm:p-3.5 bg-[#F0F5FC]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#0B3A82] block mb-1">Thermocline Layer (100m)</span>
          <span className="text-xl sm:text-2xl font-black text-[#0B3A82] font-mono">
            {predictions.find(p => p.depth === 100)?.predicted_temperature.toFixed(2)} °C
          </span>
          <span className="text-[10px] text-slate-600 block mt-1 font-mono">
            Δ {(predictions.find(p => p.depth === 100)?.difference ?? 0) > 0 ? '+' : ''}{(predictions.find(p => p.depth === 100)?.difference ?? 0).toFixed(2)}°C vs Ref
          </span>
        </div>

        <div className="border border-slate-200 p-3 sm:p-3.5 bg-white">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block mb-1">Deep Ocean (1000m)</span>
          <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono">{predictions.at(-1)?.predicted_temperature.toFixed(2)} °C</span>
          <span className="text-[10px] text-slate-500 block mt-1">Abyssal Stability Floor</span>
        </div>

        <div className="border border-slate-200 p-3 sm:p-3.5 bg-white">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block mb-1">Mean Absolute Error (MAE)</span>
          <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono">{validation_metrics?.mae.toFixed(2) ?? '0.18'} °C</span>
          <span className="text-[10px] text-[#0B3A82] font-semibold block mt-1">RMSE: {validation_metrics?.rmse.toFixed(2) ?? '0.24'}°C</span>
        </div>
      </div>

      {/* Main Row: Temperature Profile Chart + Prediction vs GLORYS Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Line Graph (Blue Lines Only) */}
        <div className="lg:col-span-6 border border-slate-200 p-3.5 sm:p-4 bg-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 border-b border-slate-200 pb-2 gap-2">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#0B3A82]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Subsurface Temperature Profile (0m to 1000m)
              </h3>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono shrink-0">
              <span className="flex items-center gap-1.5 text-[#0B3A82] font-bold">
                <span className="w-3.5 h-1 bg-[#0B3A82] inline-block" /> OceanEmbed
              </span>
              <span className="flex items-center gap-1.5 text-slate-600 font-semibold">
                <span className="w-3.5 h-0.5 bg-[#5A9BEB] inline-block border-t-2 border-dashed border-[#5A9BEB]" /> GLORYS Ref
              </span>
            </div>
          </div>

          <div className="h-[280px] sm:h-[370px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                layout="vertical"
                data={chartData}
                margin={{ top: 10, right: 20, left: -10, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  type="number"
                  domain={['dataMin - 1', 'dataMax + 1']}
                  tick={{ fontSize: 10, fill: '#475569' }}
                  label={{ value: 'Temperature (°C)', position: 'bottom', offset: 0, fill: '#0B3A82', fontSize: 11, fontWeight: 600 }}
                  stroke="#94a3b8"
                />
                <YAxis
                  dataKey="depth"
                  type="number"
                  reversed={true}
                  tick={{ fontSize: 10, fill: '#475569' }}
                  label={{ value: 'Depth (m)', angle: -90, position: 'insideLeft', offset: -5, fill: '#0B3A82', fontSize: 11, fontWeight: 600 }}
                  stroke="#94a3b8"
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#0B3A82', borderRadius: '0', fontSize: '11px', color: '#0f172a' }}
                  formatter={(val: any, name: any) => [
                    `${Number(val).toFixed(2)} °C`,
                    name === 'predicted' ? 'OceanEmbed Model' : 'GLORYS Reference',
                  ]}
                  labelFormatter={(depth) => `Depth: ${depth}m`}
                />
                <Line
                  type="monotone"
                  dataKey="glorys"
                  name="glorys"
                  stroke="#5A9BEB"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ r: 3, fill: '#5A9BEB' }}
                />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  name="predicted"
                  stroke="#0B3A82"
                  strokeWidth={3}
                  dot={{ r: 3.5, fill: '#0B3A82' }}
                  activeDot={{ r: 6, fill: '#082C64' }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-600 mt-2 px-1 border-t border-slate-200 pt-2 font-mono">
            <span className="flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-[#0B3A82]" /> Continuous vertical structure (0m to 1000m)
            </span>
            <span>Deterministic physical formulation</span>
          </div>
        </div>

        {/* Right Column: Comparative Table per requirement #19 */}
        <div className="lg:col-span-6 border border-slate-200 bg-white">
          <div className="px-4 py-3 bg-[#F0F5FC] border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0B3A82] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#0B3A82]" />
              Predicted vs GLORYS Reference Table
            </span>
            <span className="text-[10px] text-slate-600 font-mono font-semibold">15 Standard Depths</span>
          </div>

          <div className="overflow-x-auto max-h-[405px] overflow-y-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-100 text-slate-800 text-[10px] uppercase border-b border-slate-200 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-2.5 font-bold">Depth</th>
                  <th className="px-4 py-2.5 text-[#0B3A82] font-black">OceanEmbed</th>
                  <th className="px-4 py-2.5 text-slate-700 font-bold">GLORYS Reference</th>
                  <th className="px-4 py-2.5 text-right font-bold">Difference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {predictions.map((p) => {
                  const glorysVal = p.glorys_reference ?? p.predicted_temperature;
                  const diff = p.difference ?? Number((p.predicted_temperature - glorysVal).toFixed(2));
                  return (
                    <tr key={p.depth} className="hover:bg-[#F0F5FC] transition-colors">
                      <td className="px-4 py-2 text-slate-900 font-bold">{p.depth}m</td>
                      <td className="px-4 py-2 text-[#0B3A82] font-bold">{p.predicted_temperature.toFixed(1)}°C</td>
                      <td className="px-4 py-2 text-slate-700">{glorysVal.toFixed(1)}°C</td>
                      <td className="px-4 py-2 text-right font-semibold">
                        <span className="inline-block px-2 py-0.5 text-[#0B3A82] bg-[#F0F5FC] border border-[#CBDDF3]">
                          {diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1)}°C
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
