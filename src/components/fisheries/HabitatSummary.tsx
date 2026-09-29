import React from 'react';
import type { SpatialHabitatSummary } from '../../services/habitatAnalysis';
import { Target, Compass, Layers, Globe } from 'lucide-react';

interface HabitatSummaryProps {
  summary: SpatialHabitatSummary | null;
}

export const HabitatSummary: React.FC<HabitatSummaryProps> = ({ summary }) => {
  if (!summary) return null;

  const {
    species,
    optimalAreaSqKm,
    coveragePercent,
    peakLocation,
    targetDepth,
    optimalPoints,
    totalPoints,
  } = summary;

  return (
    <div className="bg-white border-2 border-slate-300 rounded-none p-5 shadow-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-slate-200 gap-2 mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#0B3A82]" />
            Regional Spatial Habitat Metrics
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            North Indian Ocean Study Region (2°N–25°N, 58°E–97°E) · Model-Derived Potential Habitat
          </p>
        </div>
        <span className="self-start sm:self-auto px-3 py-1 bg-[#F0F5FC] text-[#0B3A82] border border-[#CBDDF3] rounded-none text-[10px] font-bold uppercase tracking-wider">
          {species.name}
        </span>
      </div>

      {/* 4 Key Stat Panels - Strict Blue & White */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-none p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-600 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Optimal Habitat Area
            </span>
            <Target className="w-4 h-4 text-[#0B3A82]" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 font-mono">
              {optimalAreaSqKm.toLocaleString()}{' '}
              <span className="text-xs font-semibold text-slate-600">km²</span>
            </div>
            <div className="text-[10px] font-medium text-slate-500 mt-1 font-mono">
              {optimalPoints} of {totalPoints} ocean coordinates
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-none p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-600 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Regional Coverage
            </span>
            <Compass className="w-4 h-4 text-[#0B3A82]" />
          </div>
          <div>
            <div className="text-2xl font-black text-[#0B3A82] font-mono">
              {coveragePercent}%
            </div>
            <div className="text-[10px] font-medium text-slate-500 mt-1">
              Suitable thermal window coverage
            </div>
          </div>
        </div>

        <div className="bg-[#F0F5FC] border border-[#CBDDF3] rounded-none p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#0B3A82] mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Peak Hotspot Coordinates
            </span>
            <span className="w-2.5 h-2.5 bg-[#0B3A82] rounded-none" />
          </div>
          <div>
            <div className="text-base font-bold text-slate-900 font-mono">
              {peakLocation ? `${peakLocation.lat}°N, ${peakLocation.lng}°E` : 'N/A'}
            </div>
            <div className="text-[10px] font-bold text-[#0B3A82] mt-1 font-mono">
              {peakLocation
                ? `${peakLocation.temp}°C (${peakLocation.suitability}% Match · ${peakLocation.regionName})`
                : 'Evaluating...'}
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-none p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-600 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Target Analyzed Depth
            </span>
            <Layers className="w-4 h-4 text-[#0B3A82]" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 font-mono">
              {targetDepth === 0 ? 'Surface (0m)' : `${targetDepth}m`}
            </div>
            <div className="text-[10px] font-medium text-slate-500 mt-1 font-mono">
              Subsurface Reconstruction Layer
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
