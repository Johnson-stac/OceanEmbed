import React from 'react';
import type { VariableType, DepthType, ViewMode, MonthState } from './timeMachineTypes';
import { DEPTH_OPTIONS } from './timeMachineData';
import { Sliders, Layers, Eye, ArrowRightLeft } from 'lucide-react';

interface TimeMachineControlsProps {
  variable: VariableType;
  onVariableChange: (v: VariableType) => void;
  depth: DepthType;
  onDepthChange: (d: DepthType) => void;
  mode: ViewMode;
  onModeChange: (m: ViewMode) => void;
  monthStates: MonthState[];
  compareIndexA: number;
  compareIndexB: number;
  onCompareAChange: (idx: number) => void;
  onCompareBChange: (idx: number) => void;
}

const VARIABLES: VariableType[] = [
  'Temperature',
  'Temperature Anomaly',
  'Salinity',
  'Sea Level Anomaly',
  'Surface Current',
  'Ocean Heat Content',
  'Habitat Suitability'
];

export const TimeMachineControls: React.FC<TimeMachineControlsProps> = ({
  variable,
  onVariableChange,
  depth,
  onDepthChange,
  mode,
  onModeChange,
  monthStates,
  compareIndexA,
  compareIndexB,
  onCompareAChange,
  onCompareBChange
}) => {
  return (
    <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 w-full">
      
      {/* 1. Variable Selector */}
      <div className="flex flex-col gap-1.5 w-full lg:w-auto">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
          <Sliders className="w-3.5 h-3.5 text-cyan-600" />
          <span>Variable</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {VARIABLES.map(v => (
            <button
              key={v}
              onClick={() => onVariableChange(v)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                variable === v
                  ? 'bg-cyan-600 text-white border-cyan-700 shadow-sm'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Depth Selector */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
          <Layers className="w-3.5 h-3.5 text-cyan-600" />
          <span>Depth</span>
        </div>
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          {DEPTH_OPTIONS.map(d => (
            <button
              key={d}
              onClick={() => onDepthChange(d)}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                depth === d
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {d === 0 ? 'Surface (0m)' : `${d}m`}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Mode Selector */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
          <Eye className="w-3.5 h-3.5 text-cyan-600" />
          <span>Visualization Mode</span>
        </div>
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          {(['Normal', 'Anomaly', 'Change'] as ViewMode[]).map(m => (
            <button
              key={m}
              onClick={() => onModeChange(m)}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                mode === m
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Compare Inputs */}
      {mode === 'Change' && (
        <div className="flex items-center gap-3 bg-amber-50 p-2.5 rounded-xl border border-amber-200 w-full lg:w-auto">
          <ArrowRightLeft className="w-4 h-4 text-amber-700 shrink-0" />
          <div className="flex items-center gap-2 text-xs">
            <span className="text-amber-900 font-bold">Compare:</span>
            <select
              value={compareIndexA}
              onChange={e => onCompareAChange(parseInt(e.target.value, 10))}
              className="bg-white text-slate-800 text-xs font-semibold px-2 py-1 rounded border border-amber-300 focus:outline-none"
            >
              {monthStates.map((ms, idx) => (
                <option key={idx} value={idx}>{ms.label}</option>
              ))}
            </select>
            <span className="text-amber-900 font-bold">vs</span>
            <select
              value={compareIndexB}
              onChange={e => onCompareBChange(parseInt(e.target.value, 10))}
              className="bg-white text-slate-800 text-xs font-semibold px-2 py-1 rounded border border-amber-300 focus:outline-none"
            >
              {monthStates.map((ms, idx) => (
                <option key={idx} value={idx}>{ms.label}</option>
              ))}
            </select>
          </div>
        </div>
      )}

    </div>
  );
};
