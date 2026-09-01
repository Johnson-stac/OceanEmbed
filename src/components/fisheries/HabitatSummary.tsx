import React from 'react';
import type { SpatialHabitatSummary } from '../../services/habitatAnalysis';
import { Target, Flame, Compass, Layers, Globe2 } from 'lucide-react';

interface HabitatSummaryProps {
  summary: SpatialHabitatSummary | null;
}

export const HabitatSummary: React.FC<HabitatSummaryProps> = ({ summary }) => {
  if (!summary) return null;

  const { species, optimalAreaSqKm, coveragePercent, peakLocation, targetDepth, optimalCells, totalCells } = summary;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Globe2 className="w-5 h-5 text-indigo-600" />
              Regional Spatial Habitat Metrics
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              North Indian Ocean Study Region (5°N–28°N, 60°E–98°E)
            </p>
          </div>
          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-[10px] font-bold uppercase tracking-wider">
            {species.name}
          </span>
        </div>

        {/* 4 Key Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-emerald-800 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider">Optimal Habitat Area</span>
              <Target className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <div className="text-2xl font-black text-emerald-950">
                {optimalAreaSqKm.toLocaleString()} <span className="text-xs font-semibold text-emerald-700">km²</span>
              </div>
              <div className="text-[10px] font-semibold text-emerald-700 mt-1">
                {optimalCells} of {totalCells} spatial grid zones
              </div>
            </div>
          </div>

          <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-indigo-800 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider">Regional Coverage</span>
              <Compass className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <div className="text-2xl font-black text-indigo-950">
                {coveragePercent}%
              </div>
              <div className="text-[10px] font-semibold text-indigo-700 mt-1">
                Suitable thermal conditions
              </div>
            </div>
          </div>

          <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-amber-900 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider">Peak Hotspot Coords</span>
              <Flame className="w-4 h-4 text-amber-600 animate-pulse" />
            </div>
            <div>
              <div className="text-lg font-bold text-amber-950 font-mono">
                {peakLocation ? `${peakLocation.lat}°N, ${peakLocation.lng}°E` : 'N/A'}
              </div>
              <div className="text-[10px] font-semibold text-amber-800 mt-1">
                {peakLocation ? `${peakLocation.temp}°C (${peakLocation.suitability}% Match)` : 'Searching...'}
              </div>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-700 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider">Analyzed Layer</span>
              <Layers className="w-4 h-4 text-slate-500" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">
                {targetDepth === 0 ? 'Surface' : `${targetDepth}m`}
              </div>
              <div className="text-[10px] font-semibold text-slate-500 mt-1">
                Depth Layer Filter
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
