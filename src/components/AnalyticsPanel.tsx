import React, { useState } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, Line, ComposedChart, BarChart, Bar, Cell } from 'recharts';
import type { PredictionResponse } from '../types';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface AnalyticsPanelProps {
  predictionData: PredictionResponse;
}

export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({ predictionData }) => {
  const [showDetailedData, setShowDetailedData] = useState(false);

  const predictions = predictionData.predictions;
  const correlations = predictionData.correlations.filter(({ parameter }) =>
    ['SST', 'SSS', 'SLA', 'Current U', 'Current V'].includes(parameter)
  );

  const profileData = predictions.map(p => ({
    ...p,
    bounds: [p.lower_bound, p.upper_bound]
  }));

  const getCorrelationColor = (val: number) => {
    if (val > 0.5) return '#0f172a'; // Navy
    if (val > 0) return '#0ea5e9'; // Ocean Blue
    if (val > -0.5) return '#94a3b8'; // Slate
    return '#475569'; // Dark Slate
  };

  return (
    <div className="flex flex-col gap-12">
      
      {/* -------------------------------------------------- */}
      {/* TEMPERATURE DEPTH VISUALIZATION */}
      {/* -------------------------------------------------- */}
      <section>
        <div className="mb-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Temperature Depth Profile</h2>
          <p className="text-[10px] text-slate-500 uppercase tracking-wide">Predicted vertical structure of the ocean</p>
        </div>
        <div className="border border-slate-200 bg-white p-4 sm:p-6">
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                layout="vertical"
                data={profileData}
                margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={true} stroke="#f8fafc" />
                <XAxis 
                  type="number" 
                  dataKey="predicted_temperature" 
                  domain={['dataMin - 1', 'dataMax + 1']} 
                  label={{ value: 'Temperature (°C)', position: 'bottom', offset: 0, fill: '#64748b', fontSize: 11, fontWeight: 600, textAnchor: 'middle' }} 
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  stroke="#e2e8f0"
                  orientation="bottom"
                />
                <YAxis 
                  dataKey="depth" 
                  type="number" 
                  reversed={true} 
                  label={{ value: 'Depth (m)', angle: -90, position: 'insideLeft', offset: -10, fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  stroke="#e2e8f0"
                  domain={[0, 'dataMax']}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '0', border: '1px solid #cbd5e1', boxShadow: 'none' }}
                  formatter={(value: any, name: any) => {
                    if (name === 'predicted_temperature') return [`${Number(value).toFixed(2)} °C`, 'Predicted Temp'];
                    if (name === 'bounds') return [`${value[0].toFixed(2)} – ${value[1].toFixed(2)} °C`, 'Uncertainty Interval'];
                    return [value, name];
                  }}
                  labelFormatter={(label) => `Depth: ${label}m`}
                />
                {/* Uncertainty Band */}
                <Area 
                  dataKey="bounds" 
                  stroke="none" 
                  fill="#f1f5f9" 
                  fillOpacity={1} 
                />
                {/* Main Line */}
                <Line 
                  type="monotone" 
                  dataKey="predicted_temperature" 
                  stroke="#0f172a" 
                  strokeWidth={2} 
                  dot={{ r: 3, fill: '#fff', strokeWidth: 1.5, stroke: '#0f172a' }}
                  activeDot={{ r: 5, fill: '#0ea5e9', stroke: 'none' }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------- */}
      {/* CORRELATION ANALYSIS */}
      {/* -------------------------------------------------- */}
      <section>
        <div className="mb-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Correlation Analysis</h2>
          <p className="text-[10px] text-slate-500 uppercase tracking-wide">Surface parameters vs Predicted Subsurface Temperature</p>
        </div>
        <div className="border border-slate-200 bg-white p-4 sm:p-6">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={correlations}
                margin={{ top: 10, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={true} stroke="#f8fafc" />
                <XAxis 
                  type="number" 
                  domain={[-1, 1]} 
                  tick={{ fontSize: 10, fill: '#64748b' }} 
                  stroke="#e2e8f0" 
                  label={{ value: 'Correlation Coefficient (r)', position: 'bottom', offset: 0, fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                />
                <YAxis dataKey="parameter" type="category" tick={{ fontSize: 10, fill: '#334155', fontWeight: 600 }} width={60} stroke="#e2e8f0" />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '0', border: '1px solid #cbd5e1', boxShadow: 'none' }}
                  formatter={(value: any) => {
                    const num = Number(value);
                    let label = 'Near zero';
                    if (num >= 0.6) label = 'Strong pos';
                    else if (num > 0.2) label = 'Weak pos';
                    else if (num > -0.2) label = 'Near zero';
                    else if (num > -0.6) label = 'Weak neg';
                    else label = 'Strong neg';
                    return [`${num > 0 ? '+' : ''}${num.toFixed(2)} (${label})`, 'Correlation'];
                  }}
                />
                <Bar dataKey="correlationCoefficient" radius={0} barSize={20}>
                  {correlations.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getCorrelationColor(entry.correlationCoefficient)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Correlation heatmap</h2>
          <p className="mt-1 text-[10px] text-slate-500 uppercase tracking-wide">Observed input vs predicted temperature</p>
          <div className="mt-5 space-y-2">
            {correlations.map((item) => {
              const intensity = Math.round(Math.abs(item.correlationCoefficient) * 100);
              const positive = item.correlationCoefficient >= 0;
              return <div key={item.parameter} className="grid grid-cols-[76px_1fr_42px] items-center gap-3 text-xs">
                <span className="font-semibold text-slate-700">{item.parameter}</span>
                <div className="h-7 border border-slate-100 bg-slate-50 p-0.5">
                  <div className={positive ? 'h-full bg-ocean-600' : 'h-full bg-slate-500'} style={{ width: `${intensity}%` }} aria-label={`${item.parameter}: ${item.correlationCoefficient.toFixed(2)}`} />
                </div>
                <span className="text-right font-mono text-slate-600">{item.correlationCoefficient > 0 ? '+' : ''}{item.correlationCoefficient.toFixed(2)}</span>
              </div>;
            })}
          </div>
          <p className="mt-4 text-[10px] leading-relaxed text-slate-500">Correlation describes association in this demonstration output; it does not establish causation.</p>
        </div>
        <div className="border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Input &amp; prediction summary</h2>
          <p className="mt-1 text-[10px] text-slate-500 uppercase tracking-wide">Model run statistics</p>
          <dl className="mt-5 divide-y divide-slate-100 text-xs">
            <div className="flex justify-between py-3"><dt className="text-slate-500">Surface SST (observed)</dt><dd className="font-semibold text-slate-900">{predictionData.surface_parameters.sst.toFixed(2)} °C</dd></div>
            <div className="flex justify-between py-3"><dt className="text-slate-500">Deepest prediction</dt><dd className="font-semibold text-slate-900">{predictions.at(-1)?.depth} m</dd></div>
            <div className="flex justify-between py-3"><dt className="text-slate-500">Temperature range</dt><dd className="font-semibold text-slate-900">{predictions.at(-1)?.predicted_temperature.toFixed(2)}–{predictions[0]?.predicted_temperature.toFixed(2)} °C</dd></div>
            <div className="flex justify-between py-3"><dt className="text-slate-500">Uncertainty at deepest depth</dt><dd className="font-semibold text-slate-900">±{((predictions.at(-1)!.upper_bound - predictions.at(-1)!.lower_bound) / 2).toFixed(2)} °C</dd></div>
          </dl>
          <p className="mt-4 text-[10px] leading-relaxed text-slate-500">Error metrics require validation observations and are not available in this demo model.</p>
        </div>
      </section>

      {/* -------------------------------------------------- */}
      {/* DETAILED DATA */}
      {/* -------------------------------------------------- */}
      <section className="mb-12">
        <button 
          onClick={() => setShowDetailedData(!showDetailedData)}
          className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider hover:text-ocean-600 transition-colors mb-2"
        >
          View Detailed Data {showDetailedData ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {showDetailedData && (
          <div className="border border-slate-200 bg-white overflow-hidden animate-in slide-in-from-top-2 duration-300">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700 whitespace-nowrap">
                <thead className="text-[10px] text-slate-500 bg-slate-50 uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 font-bold">Date</th>
                    <th className="px-4 py-3 font-bold">Lat</th>
                    <th className="px-4 py-3 font-bold">Lng</th>
                    <th className="px-4 py-3 font-bold">SST (°C)</th>
                    <th className="px-4 py-3 font-bold">SSS (PSU)</th>
                    <th className="px-4 py-3 font-bold">SLA (m)</th>
                    <th className="px-4 py-3 font-bold">U (m/s)</th>
                    <th className="px-4 py-3 font-bold">V (m/s)</th>
                    <th className="px-4 py-3 font-bold">Depth (m)</th>
                    <th className="px-4 py-3 font-bold">Temp (°C)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium">
                  {predictions.map((p, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 text-slate-500">{new Date(predictionData.date).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-slate-500">{predictionData.location.lat.toFixed(2)}</td>
                      <td className="px-4 py-3 text-slate-500">{predictionData.location.lng.toFixed(2)}</td>
                      <td className="px-4 py-3">{predictionData.surface_parameters.sst.toFixed(2)}</td>
                      <td className="px-4 py-3">{predictionData.surface_parameters.sss.toFixed(2)}</td>
                      <td className="px-4 py-3">{predictionData.surface_parameters.sla.toFixed(2)}</td>
                      <td className="px-4 py-3">{predictionData.surface_parameters.current_u.toFixed(2)}</td>
                      <td className="px-4 py-3">{predictionData.surface_parameters.current_v.toFixed(2)}</td>
                      <td className="px-4 py-3 font-bold text-slate-900">{p.depth}</td>
                      <td className="px-4 py-3 font-bold text-ocean-700">{p.predicted_temperature.toFixed(3)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

    </div>
  );
};
