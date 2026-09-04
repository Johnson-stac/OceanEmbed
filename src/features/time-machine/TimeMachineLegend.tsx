import React from 'react';
import type { VariableType, ViewMode } from './timeMachineTypes';
import { VARIABLE_META } from './timeMachineData';

interface TimeMachineLegendProps {
  variable: VariableType;
  mode: ViewMode;
}

export const TimeMachineLegend: React.FC<TimeMachineLegendProps> = ({ variable, mode }) => {
  const meta = VARIABLE_META[variable] || VARIABLE_META['Temperature'];
  const isAnomalyMode = mode === 'Anomaly' || mode === 'Change' || variable === 'Temperature Anomaly';

  return (
    <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex flex-col gap-2 min-w-[260px]">
      <div className="flex items-center justify-between text-xs font-bold text-slate-800">
        <span>{isAnomalyMode ? `${variable} Anomaly` : variable}</span>
        <span className="text-cyan-700 font-mono text-[11px]">({meta.unit})</span>
      </div>

      {/* Gradient Bar */}
      <div className="h-3.5 w-full rounded-lg overflow-hidden shadow-inner border border-slate-200 relative">
        <div 
          className="w-full h-full"
          style={{
            background: isAnomalyMode
              ? 'linear-gradient(to right, #2563eb, #93c5fd, #ffffff, #fda4af, #e11d48)'
              : 'linear-gradient(to right, #0e7490, #10b981, #f59e0b, #ef4444)'
          }}
        />
      </div>

      {/* Value Ticks */}
      <div className="flex justify-between items-center text-[10px] font-semibold text-slate-600 font-mono">
        {isAnomalyMode ? (
          <>
            <span>-3.0</span>
            <span>-1.5</span>
            <span className="text-slate-900 font-bold">0.0</span>
            <span>+1.5</span>
            <span>+3.0</span>
          </>
        ) : (
          <>
            <span>{meta.min}</span>
            <span>{(meta.min + (meta.max - meta.min) * 0.25).toFixed(1)}</span>
            <span>{(meta.min + (meta.max - meta.min) * 0.5).toFixed(1)}</span>
            <span>{(meta.min + (meta.max - meta.min) * 0.75).toFixed(1)}</span>
            <span>{meta.max}</span>
          </>
        )}
      </div>

      <div className="text-[10px] text-slate-500 font-medium text-center mt-0.5">
        {meta.desc}
      </div>
    </div>
  );
};
