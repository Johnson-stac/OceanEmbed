import React from 'react';
import { Calendar, Compass, Waves, Play, CheckCircle2, Loader2, RefreshCw } from 'lucide-react';
import type { OceanLocation, SurfaceParameters } from '../../types';

interface DashboardControlsBarProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  location: OceanLocation | null;
  onLocationChange?: (lat: number, lng: number) => void;
  parameters: SurfaceParameters | null;
  selectedDepth: number;
  onSelectDepth: (depth: number) => void;
  onRunPrediction: () => void;
  isPredicting: boolean;
  predictionStep: number;
  error: string | null;
  isResearcher: boolean;
}

const PREDICTION_DEPTHS = [0, 50, 100, 150, 200, 300, 500, 700, 1000];

export const DashboardControlsBar: React.FC<DashboardControlsBarProps> = ({
  selectedDate,
  onDateChange,
  location,
  onLocationChange,
  parameters,
  selectedDepth,
  onSelectDepth,
  onRunPrediction,
  isPredicting,
  predictionStep,
  error,
}) => {
  const formattedDate = new Date(selectedDate).toISOString().split('T')[0];

  return (
    <div className="w-full bg-white border border-slate-300 rounded-none p-3 sm:p-5 shadow-none text-slate-900 font-sans mt-4">
      {/* Top Grid: Date, Location, Surface Observations, Action Button */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4 items-stretch">
        
        {/* 1. Date */}
        <div className="sm:col-span-1 lg:col-span-3 border border-slate-200 p-3 bg-white flex flex-col justify-between rounded-none">
          <label className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#0B3A82]" />
              Date
            </span>
            <span className="text-[10px] text-[#0B3A82] font-mono font-medium">NASA GIBS Feed</span>
          </label>
          <input
            type="date"
            value={formattedDate}
            min="2018-01-01"
            max="2024-12-31"
            onChange={(e) => onDateChange(`${e.target.value}T00:00:00.000Z`)}
            className="w-full bg-slate-50 border border-slate-300 rounded-none px-3 py-1.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-[#0B3A82] cursor-pointer"
          />
        </div>

        {/* 2. Location Coordinates */}
        <div className="sm:col-span-1 lg:col-span-3 border border-slate-200 p-3 bg-white flex flex-col justify-between rounded-none">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            <span className="flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-[#0B3A82]" />
              Location
            </span>
            <span className="text-[10px] text-slate-500 font-mono hidden sm:block">5°N–30°N | 60°E–100°E</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center bg-slate-50 border border-slate-300 px-2 py-1 text-xs font-mono">
              <span className="text-slate-500 text-[10px] mr-1">LAT</span>
              <input
                type="number"
                step="0.1"
                min="5"
                max="30"
                value={location ? location.lat : ''}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  if (!isNaN(val) && location && onLocationChange) {
                    onLocationChange(val, location.lng);
                  }
                }}
                className="w-full bg-transparent text-slate-900 font-bold focus:outline-none"
                placeholder="15.50"
              />
              <span className="text-slate-500 text-[10px]">°N</span>
            </div>

            <div className="flex-1 flex items-center bg-slate-50 border border-slate-300 px-2 py-1 text-xs font-mono">
              <span className="text-slate-500 text-[10px] mr-1">LNG</span>
              <input
                type="number"
                step="0.1"
                min="60"
                max="100"
                value={location ? location.lng : ''}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  if (!isNaN(val) && location && onLocationChange) {
                    onLocationChange(location.lat, val);
                  }
                }}
                className="w-full bg-transparent text-slate-900 font-bold focus:outline-none"
                placeholder="65.20"
              />
              <span className="text-slate-500 text-[10px]">°E</span>
            </div>
          </div>
        </div>

        {/* 3. Surface Observations */}
        <div className="sm:col-span-2 lg:col-span-4 border border-slate-200 p-3 bg-white flex flex-col justify-between rounded-none">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            <span className="flex items-center gap-1.5">
              <Waves className="w-3.5 h-3.5 text-[#0B3A82]" />
              Surface Observations
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Telemetry</span>
          </div>

          {parameters ? (
            <div className="grid grid-cols-5 gap-1 sm:gap-1.5 text-center font-mono text-xs">
              <div className="bg-[#F0F5FC] p-1 border border-slate-200">
                <span className="text-[9px] text-[#0B3A82] block font-sans font-bold">SST</span>
                <span className="text-[#0B3A82] font-black text-[10px] sm:text-[11px]">{parameters.sst.toFixed(1)}°C</span>
              </div>
              <div className="bg-slate-50 p-1 border border-slate-200">
                <span className="text-[9px] text-slate-500 block font-sans">SSS</span>
                <span className="text-slate-800 font-semibold text-[10px] sm:text-[11px]">{parameters.sss.toFixed(1)}</span>
              </div>
              <div className="bg-slate-50 p-1 border border-slate-200">
                <span className="text-[9px] text-slate-500 block font-sans">SLA</span>
                <span className="text-slate-800 font-semibold text-[10px] sm:text-[11px]">{parameters.sla.toFixed(2)}m</span>
              </div>
              <div className="bg-slate-50 p-1 border border-slate-200">
                <span className="text-[9px] text-slate-500 block font-sans">U</span>
                <span className="text-slate-800 font-semibold text-[10px] sm:text-[11px]">{parameters.current_u.toFixed(2)}</span>
              </div>
              <div className="bg-slate-50 p-1 border border-slate-200">
                <span className="text-[9px] text-slate-500 block font-sans">V</span>
                <span className="text-slate-800 font-semibold text-[10px] sm:text-[11px]">{parameters.current_v.toFixed(2)}</span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400 italic py-1 text-center bg-slate-50 border border-slate-200">
              Select coordinates to load surface telemetry
            </div>
          )}
        </div>

        {/* 4. Action Button - Pure OceanEmbed Blue */}
        <div className="sm:col-span-2 lg:col-span-2 flex flex-col justify-end">
          <button
            onClick={onRunPrediction}
            disabled={!location || isPredicting}
            className="w-full py-3 sm:py-3.5 px-4 bg-[#0B3A82] hover:bg-[#082C64] active:bg-[#051C40] disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs uppercase tracking-wider rounded-none border border-[#0B3A82] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            {isPredicting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Reconstructing...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current text-white" />
                <span>RUN PREDICTION</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Prediction Depth Selector Row */}
      <div className="mt-3 sm:mt-4 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
            Prediction Depth:
          </span>
          <div className="flex items-center gap-1 flex-wrap">
            {PREDICTION_DEPTHS.map((d) => (
              <button
                key={d}
                onClick={() => onSelectDepth(d)}
                className={`px-2 sm:px-3 py-1 text-xs font-mono border transition-colors rounded-none cursor-pointer ${
                  selectedDepth === d
                    ? 'bg-[#0B3A82] text-white border-[#0B3A82] font-bold shadow-sm'
                    : 'bg-white hover:bg-[#F0F5FC] text-slate-700 border-slate-300'
                }`}
              >
                {d}m
              </button>
            ))}
          </div>
        </div>

        <div className="text-[11px] text-slate-600 font-mono hidden md:block">
          Model: OceanEmbed Multi-Depth Transformer (0m to 1000m)
        </div>
      </div>

      {/* Loading Steps Sequence */}
      {isPredicting && (
        <div className="mt-3 sm:mt-4 pt-3 border-t border-slate-200 bg-[#F0F5FC] p-3 sm:p-4 border border-blue-200 rounded-none animate-in fade-in duration-150">
          <div className="flex items-center justify-between text-xs font-bold text-[#0B3A82] uppercase tracking-wider mb-2.5 flex-wrap gap-2">
            <span className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-[#0B3A82]" />
              <span className="hidden sm:inline">OCEANEMBED SUBSURFACE RECONSTRUCTION IN PROGRESS</span>
              <span className="inline sm:hidden">RECONSTRUCTING...</span>
            </span>
            <span className="font-mono text-slate-600">Phase {predictionStep} of 4</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
            <div className={`flex items-center gap-2 p-2.5 border ${predictionStep >= 1 ? 'bg-white border-[#0B3A82] text-[#0B3A82] font-bold' : 'bg-slate-100 border-slate-200 text-slate-400'}`}>
              {predictionStep >= 2 ? <CheckCircle2 className="w-4 h-4 text-[#0B3A82] shrink-0" /> : <div className="w-2 h-2 bg-[#0B3A82] animate-ping shrink-0" />}
              <span>Loading surface observations...</span>
            </div>

            <div className={`flex items-center gap-2 p-2.5 border ${predictionStep >= 2 ? 'bg-white border-[#0B3A82] text-[#0B3A82] font-bold' : 'bg-slate-100 border-slate-200 text-slate-400'}`}>
              {predictionStep >= 3 ? <CheckCircle2 className="w-4 h-4 text-[#0B3A82] shrink-0" /> : predictionStep === 2 ? <Loader2 className="w-4 h-4 animate-spin text-[#0B3A82] shrink-0" /> : <div className="w-2 h-2 bg-slate-300 shrink-0" />}
              <span>Reconstructing subsurface temperature...</span>
            </div>

            <div className={`flex items-center gap-2 p-2.5 border ${predictionStep >= 3 ? 'bg-white border-[#0B3A82] text-[#0B3A82] font-bold' : 'bg-slate-100 border-slate-200 text-slate-400'}`}>
              {predictionStep >= 4 ? <CheckCircle2 className="w-4 h-4 text-[#0B3A82] shrink-0" /> : predictionStep === 3 ? <Loader2 className="w-4 h-4 animate-spin text-[#0B3A82] shrink-0" /> : <div className="w-2 h-2 bg-slate-300 shrink-0" />}
              <span>Comparing reference profile...</span>
            </div>

            <div className={`flex items-center gap-2 p-2.5 border ${predictionStep >= 4 ? 'bg-white border-[#0B3A82] text-[#0B3A82] font-bold' : 'bg-slate-100 border-slate-200 text-slate-400'}`}>
              {predictionStep === 5 ? <CheckCircle2 className="w-4 h-4 text-[#0B3A82] shrink-0" /> : predictionStep === 4 ? <Loader2 className="w-4 h-4 animate-spin text-[#0B3A82] shrink-0" /> : <div className="w-2 h-2 bg-slate-300 shrink-0" />}
              <span>Preparing analysis...</span>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-3 p-3 bg-[#F0F5FC] border border-[#0B3A82] text-[#0B3A82] text-xs font-semibold">
          {error}
        </div>
      )}
    </div>
  );
};
