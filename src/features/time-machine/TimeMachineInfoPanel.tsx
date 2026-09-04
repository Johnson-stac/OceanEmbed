import React from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ReferenceDot,
  CartesianGrid 
} from 'recharts';
import { MapPin, Activity, Layers, ArrowRightLeft, Sparkles } from 'lucide-react';
import type { 
  LocationSnapshot, 
  TimeSeriesPoint, 
  DepthTimeCell, 
  MonthState,
  DepthType,
  VariableType,
  ViewMode
} from './timeMachineTypes';
import { DEPTH_OPTIONS } from './timeMachineData';

interface TimeMachineInfoPanelProps {
  snapshot: LocationSnapshot | null;
  timeSeries: TimeSeriesPoint[];
  depthTimeMatrix: DepthTimeCell[];
  currentMonthState: MonthState;
  variable: VariableType;
  depth: DepthType;
  mode: ViewMode;
  compareDateA: MonthState;
  compareDateB: MonthState;
  onSelectCompareA: (ms: MonthState) => void;
  onSelectCompareB: (ms: MonthState) => void;
}

export const TimeMachineInfoPanel: React.FC<TimeMachineInfoPanelProps> = ({
  snapshot,
  timeSeries,
  depthTimeMatrix,
  currentMonthState,
  variable,
  depth,
  mode,
  compareDateA,
  compareDateB
}) => {
  const currentPt = timeSeries.find(pt => pt.isCurrent);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
      
      {/* Card 1: Selected Location Snapshot */}
      <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-700 uppercase tracking-wider">
              <MapPin className="w-4 h-4 text-cyan-600" />
              <span>Location Snapshot</span>
            </div>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Confidence: {snapshot ? `${snapshot.confidence}%` : '95.0%'}
            </span>
          </div>

          {snapshot ? (
            <div className="space-y-4">
              <div>
                <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {snapshot.lat}°N, {snapshot.lng}°E
                </div>
                <div className="text-xs text-slate-600 font-semibold mt-0.5 flex flex-wrap items-center gap-1.5">
                  <span>Depth: <strong className="text-cyan-700">{snapshot.depth}m</strong></span>
                  <span>•</span>
                  <span>Date: <strong className="text-cyan-700">{snapshot.dateLabel}</strong></span>
                  {mode === 'Change' && (
                    <span className="text-amber-800 text-[11px] block w-full mt-1">
                      Comparing: <strong>{compareDateA.label}</strong> vs <strong>{compareDateB.label}</strong>
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="text-[11px] font-semibold text-slate-500">{variable}</div>
                  <div className="text-xl font-extrabold text-slate-900 mt-1">
                    {snapshot.val} <span className="text-xs text-cyan-700 font-normal">{snapshot.unit}</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="text-[11px] font-semibold text-slate-500">Thermal Anomaly</div>
                  <div className={`text-xl font-extrabold mt-1 ${snapshot.anomaly >= 0 ? 'text-amber-600' : 'text-cyan-700'}`}>
                    {snapshot.anomaly >= 0 ? `+${snapshot.anomaly}` : snapshot.anomaly} <span className="text-xs font-normal">°C</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400 text-xs font-medium">
              Click any point on the map to inspect location telemetry.
            </div>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
          <span>Interactive linked view: Map ↔ Timeline ↔ Location Telemetry</span>
        </div>
      </div>

      {/* Card 2: Multi-Year Time-Series Chart */}
      <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-700 uppercase tracking-wider">
            <Activity className="w-4 h-4 text-cyan-600" />
            <span>Time-Series Profile (2021 → 2025)</span>
          </div>
          <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            {depth}m Depth
          </span>
        </div>

        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timeSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="dateLabel" 
                tick={{ fill: '#64748b', fontSize: 9 }}
                interval={11}
              />
              <YAxis 
                tick={{ fill: '#64748b', fontSize: 9 }} 
                domain={['auto', 'auto']}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '0.75rem', fontSize: '11px', color: '#0f172a' }}
              />
              <Line 
                type="monotone" 
                dataKey="val" 
                stroke="#0891b2" 
                strokeWidth={2.5} 
                dot={false}
                activeDot={{ r: 5, fill: '#0891b2' }}
              />
              {currentPt && (
                <ReferenceDot
                  x={currentPt.dateLabel}
                  y={currentPt.val}
                  r={6}
                  fill="#d97706"
                  stroke="#ffffff"
                  strokeWidth={2}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="text-[10px] text-slate-500 text-center font-medium mt-1">
          Highlighted dot indicates active timeline month (<strong className="text-amber-600">{currentMonthState.label}</strong>).
        </div>
      </div>

      {/* Card 3: Depth x Time Matrix */}
      <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-700 uppercase tracking-wider">
            <Layers className="w-4 h-4 text-cyan-600" />
            <span>Depth × Time Profile</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-500">
            <ArrowRightLeft className="w-3.5 h-3.5 text-cyan-600" />
            <span>Thermocline Slicer</span>
          </div>
        </div>

        <div className="space-y-1.5">
          {DEPTH_OPTIONS.map(d => {
            const isCurrentDepth = d === depth;
            const cells = depthTimeMatrix.filter(c => c.depth === d);
            return (
              <div key={d} className={`flex items-center gap-2 text-[10px] font-semibold ${isCurrentDepth ? 'text-cyan-800 font-extrabold' : 'text-slate-600'}`}>
                <span className="w-10 text-right font-mono">{d}m</span>
                <div className="flex-1 flex gap-1 h-3 rounded overflow-hidden bg-slate-100 p-0.5 border border-slate-200">
                  {cells.map((cell, idx) => {
                    const norm = Math.max(0, Math.min(1, (cell.val - 4) / 28));
                    const color = norm > 0.6 ? '#f59e0b' : norm > 0.3 ? '#06b6d4' : '#1d4ed8';
                    return (
                      <div
                        key={idx}
                        className="flex-1 h-full rounded-xs transition-opacity hover:opacity-100 opacity-90"
                        style={{ backgroundColor: color }}
                        title={`${cell.dateLabel} @ ${d}m: ${cell.val}°C`}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-[10px] text-slate-500 text-center font-medium mt-2 pt-2 border-t border-slate-100">
          Subsurface ocean thermal structure across depths (0m to 1000m).
        </div>
      </div>

    </div>
  );
};
