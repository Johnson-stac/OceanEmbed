import React from 'react';
import type { SpatialHabitatSummary } from '../../services/habitatAnalysis';
import type { MockSpecies } from '../../data/mockSpecies';
import { Lightbulb, Anchor, Compass } from 'lucide-react';

interface FisheriesInsightProps {
  summary: SpatialHabitatSummary | null;
  species: MockSpecies;
}

export const FisheriesInsight: React.FC<FisheriesInsightProps> = ({ summary, species }) => {
  if (!summary) return null;

  return (
    <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white rounded-2xl p-6 shadow-md relative overflow-hidden h-full flex flex-col justify-between">
      <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
        <Anchor className="w-36 h-36 text-cyan-400" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-indigo-600 text-white p-2.5 rounded-xl shadow-md shrink-0">
            <Lightbulb className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white tracking-tight">Fisheries Intelligence Insight</h4>
            <div className="text-xs text-indigo-200">
              {species.name} <span className="italic text-indigo-300">({species.scientificName})</span>
            </div>
          </div>
        </div>

        <div className="space-y-3 text-xs text-indigo-100 leading-relaxed font-normal bg-white/5 p-4 rounded-xl border border-white/10">
          <p>
            Based on subsurface thermal predictions at <span className="font-bold text-cyan-300">{summary.targetDepth}m depth</span>, <span className="font-semibold text-white">{species.name}</span> shows optimal thermal suitability across <span className="font-bold text-emerald-400">{summary.optimalAreaSqKm.toLocaleString()} km²</span> of the North Indian Ocean.
          </p>

          <p>
            Optimal thermal preference is centered at <span className="font-bold text-amber-300">{species.optTemp}°C</span> (tolerance range: {species.minTemp}°C to {species.maxTemp}°C). Primary fishing ground suitability is concentrated near <span className="font-bold text-cyan-300">{species.primaryRegion}</span>.
          </p>

          {summary.peakLocation && (
            <div className="flex items-center gap-2 pt-2 border-t border-white/10 text-emerald-300 font-medium">
              <Compass className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Highest Suitability Index ({summary.peakLocation.suitability}%) detected near {summary.peakLocation.lat}°N, {summary.peakLocation.lng}°E ({summary.peakLocation.temp}°C).</span>
            </div>
          )}
        </div>
      </div>

      <div className="relative z-10 mt-4 text-[10px] text-indigo-300/80 italic border-t border-white/10 pt-3">
        * Biological note: Thermal suitability maps indicate environmental temperature compatibility. Actual fish distribution is also governed by ocean currents, upwelling, salinity, and chlorophyll-a availability.
      </div>
    </div>
  );
};
