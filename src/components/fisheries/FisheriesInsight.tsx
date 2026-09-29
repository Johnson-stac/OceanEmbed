import React from 'react';
import type { SpatialHabitatSummary } from '../../services/habitatAnalysis';
import type { MockSpecies } from '../../data/mockSpecies';
import { Lightbulb, Compass, FileText } from 'lucide-react';

interface FisheriesInsightProps {
  summary: SpatialHabitatSummary | null;
  species: MockSpecies;
}

export const FisheriesInsight: React.FC<FisheriesInsightProps> = ({ summary, species }) => {
  if (!summary) return null;

  return (
    <div className="bg-white border-2 border-slate-300 rounded-none p-5 h-full flex flex-col justify-between shadow-none">
      <div>
        <div className="flex items-center gap-2.5 mb-3.5 pb-2.5 border-b border-slate-200">
          <div className="p-1.5 bg-[#F0F5FC] text-[#0B3A82] border border-[#CBDDF3]">
            <Lightbulb className="w-4 h-4 text-[#0B3A82]" />
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-900 tracking-tight uppercase">
              Fisheries Intelligence Synthesis
            </h4>
            <div className="text-[11px] text-[#0B3A82] font-semibold">
              {species.name} <span className="italic">({species.scientificName})</span> · {species.family}
            </div>
          </div>
        </div>

        <div className="space-y-2.5 text-xs text-slate-700 leading-relaxed bg-[#F0F5FC] p-4 border border-[#CBDDF3] rounded-none">
          <p>
            Based on subsurface thermal reconstruction at{' '}
            <strong className="text-[#0B3A82] font-mono">{summary.targetDepth}m depth</strong>,{' '}
            <span className="font-semibold text-slate-900">{species.name}</span> displays optimal thermal
            compatibility across an estimated{' '}
            <strong className="text-[#0B3A82] font-mono">
              {summary.optimalAreaSqKm.toLocaleString()} km²
            </strong>{' '}
            of the North Indian Ocean basin.
          </p>

          <p>
            Species optimal thermal plateau is defined at{' '}
            <strong className="text-slate-900 font-mono">
              {species.optTempMin}–{species.optTempMax}°C
            </strong>{' '}
            (broad tolerance: {species.minTemp}°C to {species.maxTemp}°C). Primary habitat
            suitability is concentrated in{' '}
            <strong className="text-[#0B3A82]">{species.primaryRegion}</strong>.
          </p>

          {summary.peakLocation && (
            <div className="flex items-start gap-1.5 pt-2 border-t border-[#CBDDF3] text-slate-800 text-[11px]">
              <Compass className="w-3.5 h-3.5 text-[#0B3A82] shrink-0 mt-0.5" />
              <span>
                Maximum suitability index (<span className="text-[#0B3A82] font-bold">{summary.peakLocation.suitability}%</span>) detected near{' '}
                <span className="font-mono font-bold text-slate-900">
                  {summary.peakLocation.lat}°N, {summary.peakLocation.lng}°E
                </span>{' '}
                ({summary.peakLocation.temp}°C · {summary.peakLocation.regionName}).
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-200 flex items-start gap-1.5 text-[10px] text-slate-500 leading-normal">
        <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
        <span>
          <strong>Oceanographic Advisory:</strong> Thermal suitability values represent environmental temperature compatibility derived from OceanEmbed vertical profiles. Actual marine biomass density also correlates with dissolved oxygen, surface chlorophyll fronts, upwelling dynamics, and food-web trophic structure.
        </span>
      </div>
    </div>
  );
};
