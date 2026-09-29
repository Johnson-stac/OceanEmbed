import React from 'react';
import { X, ArrowRightLeft, Layers, Waves } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import type { OceanLocation, SurfaceParameters, DepthPrediction } from '../../types';

interface ComparisonPointData {
  location: OceanLocation;
  surface: SurfaceParameters;
  profile: DepthPrediction[];
}

interface LocationComparisonPanelProps {
  pointA: ComparisonPointData;
  pointB: ComparisonPointData;
  onClose: () => void;
}

export const LocationComparisonPanel: React.FC<LocationComparisonPanelProps> = ({
  pointA,
  pointB,
  onClose,
}) => {
  const depthsToDisplay = [0, 50, 100, 200, 500];

  const chartData = pointA.profile.map((pA, index) => {
    const pB = pointB.profile[index];
    return {
      depth: pA.depth,
      tempA: pA.predicted_temperature,
      tempB: pB ? pB.predicted_temperature : undefined,
    };
  });

  return (
    <div className="bg-white border border-slate-300 rounded-none p-6 shadow-none text-slate-900 mt-5 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-[#F0F5FC] text-[#0B3A82] border border-[#CBDDF3]">
            <ArrowRightLeft className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight uppercase">
              Location Comparison
            </h2>
            <p className="text-xs text-slate-500">
              Contrasting surface satellite parameters &amp; reconstructed vertical temperature profiles between Point A and Point B.
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="px-3.5 py-1.5 bg-white hover:bg-[#F0F5FC] text-[#0B3A82] border border-[#0B3A82] text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
          title="Clear comparison"
        >
          <X className="w-4 h-4" />
          <span>CLEAR COMPARISON</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-5 items-start">
        {/* Left: Comparison Table */}
        <div className="lg:col-span-6 space-y-4">
          <div className="border border-slate-300 bg-white">
            <div className="px-4 py-2.5 bg-[#F0F5FC] border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0B3A82] flex items-center gap-1.5">
                <Waves className="w-3.5 h-3.5 text-[#0B3A82]" />
                Surface &amp; Subsurface Parameters
              </span>
              <span className="text-[10px] text-slate-600 font-mono">OceanEmbed Reconstructed</span>
            </div>

            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-100 text-slate-800 text-[10px] uppercase border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2.5 font-bold font-sans">PARAMETER / DEPTH</th>
                  <th className="px-4 py-2.5 text-[#0B3A82] font-black">POINT A</th>
                  <th className="px-4 py-2.5 text-[#155BBD] font-black">POINT B</th>
                  <th className="px-4 py-2.5 text-right font-bold font-sans">DIFFERENCE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50">
                  <td className="px-4 py-2 text-slate-700 font-sans font-medium">Latitude</td>
                  <td className="px-4 py-2 text-[#0B3A82] font-bold">{pointA.location.lat.toFixed(2)}°</td>
                  <td className="px-4 py-2 text-[#155BBD] font-bold">{pointB.location.lat.toFixed(2)}°</td>
                  <td className="px-4 py-2 text-right text-slate-400">—</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="px-4 py-2 text-slate-700 font-sans font-medium">Longitude</td>
                  <td className="px-4 py-2 text-[#0B3A82] font-bold">{pointA.location.lng.toFixed(2)}°</td>
                  <td className="px-4 py-2 text-[#155BBD] font-bold">{pointB.location.lng.toFixed(2)}°</td>
                  <td className="px-4 py-2 text-right text-slate-400">—</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="px-4 py-2 text-slate-700 font-sans font-medium">SST</td>
                  <td className="px-4 py-2 text-slate-900 font-bold">{pointA.surface.sst.toFixed(1)}°C</td>
                  <td className="px-4 py-2 text-slate-900 font-bold">{pointB.surface.sst.toFixed(1)}°C</td>
                  <td className="px-4 py-2 text-right font-bold text-[#0B3A82]">
                    {(pointA.surface.sst - pointB.surface.sst) > 0 ? '+' : ''}
                    {(pointA.surface.sst - pointB.surface.sst).toFixed(1)}°C
                  </td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="px-4 py-2 text-slate-700 font-sans font-medium">SSS</td>
                  <td className="px-4 py-2">{pointA.surface.sss.toFixed(1)} PSU</td>
                  <td className="px-4 py-2">{pointB.surface.sss.toFixed(1)} PSU</td>
                  <td className="px-4 py-2 text-right text-slate-600">
                    {(pointA.surface.sss - pointB.surface.sss) > 0 ? '+' : ''}
                    {(pointA.surface.sss - pointB.surface.sss).toFixed(1)} PSU
                  </td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="px-4 py-2 text-slate-700 font-sans font-medium">SLA</td>
                  <td className="px-4 py-2">{pointA.surface.sla.toFixed(2)}m</td>
                  <td className="px-4 py-2">{pointB.surface.sla.toFixed(2)}m</td>
                  <td className="px-4 py-2 text-right text-slate-600">
                    {(pointA.surface.sla - pointB.surface.sla) > 0 ? '+' : ''}
                    {(pointA.surface.sla - pointB.surface.sla).toFixed(2)}m
                  </td>
                </tr>

                {/* Subsurface Depth Slices */}
                {depthsToDisplay.map((d) => {
                  const tempA = pointA.profile.find((p) => p.depth === d)?.predicted_temperature ?? 0;
                  const tempB = pointB.profile.find((p) => p.depth === d)?.predicted_temperature ?? 0;
                  const diff = tempA - tempB;
                  return (
                    <tr key={d} className="hover:bg-slate-50 bg-[#F0F5FC]/40">
                      <td className="px-4 py-2 text-slate-800 font-sans font-semibold">{d}m</td>
                      <td className="px-4 py-2 font-bold text-[#0B3A82]">{tempA.toFixed(1)}°C</td>
                      <td className="px-4 py-2 font-bold text-[#155BBD]">{tempB.toFixed(1)}°C</td>
                      <td className="px-4 py-2 text-right font-bold text-[#0B3A82]">
                        <span className="px-1.5 py-0.5 bg-[#F0F5FC] border border-[#CBDDF3]">
                          {diff > 0 ? '+' : ''}{diff.toFixed(1)}°C
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Comparative Temperature Depth Curve */}
        <div className="lg:col-span-6 border border-slate-300 p-4 bg-white">
          <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#0B3A82]" />
              Subsurface Temperature Comparison
            </span>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-[#0B3A82] font-bold">
                <span className="w-3.5 h-1 bg-[#0B3A82] inline-block" /> Point A ({pointA.location.lat.toFixed(1)}°N)
              </span>
              <span className="flex items-center gap-1.5 text-[#155BBD] font-bold">
                <span className="w-3.5 h-0.5 bg-[#155BBD] inline-block border-t-2 border-dashed border-[#155BBD]" /> Point B ({pointB.location.lat.toFixed(1)}°N)
              </span>
            </div>
          </div>

          <div className="h-[330px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                layout="vertical"
                data={chartData}
                margin={{ top: 10, right: 30, left: 10, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  type="number"
                  domain={['dataMin - 1', 'dataMax + 1']}
                  tick={{ fontSize: 10, fill: '#475569' }}
                  label={{ value: 'Temperature (°C)', position: 'bottom', offset: 0, fill: '#0B3A82', fontSize: 11 }}
                  stroke="#cbd5e1"
                />
                <YAxis
                  dataKey="depth"
                  type="number"
                  reversed={true}
                  tick={{ fontSize: 10, fill: '#475569' }}
                  label={{ value: 'Depth (m)', angle: -90, position: 'insideLeft', offset: -5, fill: '#0B3A82', fontSize: 11 }}
                  stroke="#cbd5e1"
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#0B3A82', borderRadius: '0', fontSize: '11px', color: '#0f172a' }}
                  formatter={(val: any, name: any) => [`${Number(val).toFixed(2)} °C`, name === 'tempA' ? 'Point A Temp' : 'Point B Temp']}
                  labelFormatter={(depth) => `Depth: ${depth}m`}
                />
                <Line
                  type="monotone"
                  dataKey="tempA"
                  name="Point A"
                  stroke="#0B3A82"
                  strokeWidth={3}
                  dot={{ r: 3, fill: '#0B3A82' }}
                />
                <Line
                  type="monotone"
                  dataKey="tempB"
                  name="Point B"
                  stroke="#155BBD"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 3, fill: '#155BBD' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
