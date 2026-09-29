import React from 'react';
import type { MockSpecies } from '../../data/mockSpecies';
import { Fish, Thermometer, Layers, Check, Globe } from 'lucide-react';

interface SpeciesSelectorProps {
  speciesList: MockSpecies[];
  selectedSpeciesId: string;
  onSelectSpecies: (id: string) => void;
}

export const SpeciesSelector: React.FC<SpeciesSelectorProps> = ({
  speciesList,
  selectedSpeciesId,
  onSelectSpecies,
}) => {
  return (
    <div className="bg-white border-2 border-slate-300 rounded-none p-3.5 h-full flex flex-col shadow-none">
      <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-slate-200">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest flex items-center gap-1.5">
          <Fish className="w-4 h-4 text-[#0B3A82]" />
          Marine Species Profiles
        </h3>
        <span className="text-[10px] font-bold text-[#0B3A82] bg-[#F0F5FC] border border-[#CBDDF3] px-2 py-0.5 rounded-none font-mono">
          {speciesList.length} SPECIES
        </span>
      </div>

      <div className="space-y-2.5 flex-grow overflow-y-auto pr-0.5">
        {speciesList.map((species) => {
          const isSelected = species.id === selectedSpeciesId;

          return (
            <div
              key={species.id}
              onClick={() => onSelectSpecies(species.id)}
              className={`p-3.5 rounded-none border transition-colors cursor-pointer text-left ${
                isSelected
                  ? 'bg-[#F0F5FC] border-[#0B3A82] border-l-4 border-l-[#0B3A82] shadow-sm'
                  : 'bg-white border-slate-200 hover:border-[#0B3A82] hover:bg-[#F0F5FC]/50'
              }`}
            >
              {/* Name + Category */}
              <div className="flex items-start justify-between gap-1.5 mb-1.5">
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-slate-900 flex items-center gap-1.5 truncate">
                    {species.name}
                    {isSelected && <Check className="w-4 h-4 text-[#0B3A82] shrink-0" />}
                  </div>
                  <div className="text-[11px] italic text-slate-600 truncate font-medium">
                    {species.scientificName}
                  </div>
                </div>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-none border uppercase tracking-wider shrink-0 bg-[#F0F5FC] text-[#0B3A82] border-[#CBDDF3]">
                  {species.category === 'Highly Migratory' ? 'Migratory' : species.category}
                </span>
              </div>

              {/* Geographic Region Badges in Pure Blue Tints */}
              <div className="flex items-center gap-1 mb-2.5">
                {species.arabianSea && (
                  <span className="text-[9px] font-semibold bg-white text-[#0B3A82] border border-[#CBDDF3] px-1.5 py-0.5 rounded-none font-mono">
                    Arabian Sea
                  </span>
                )}
                {species.bayOfBengal && (
                  <span className="text-[9px] font-semibold bg-white text-[#0B3A82] border border-[#CBDDF3] px-1.5 py-0.5 rounded-none font-mono">
                    Bay of Bengal
                  </span>
                )}
              </div>

              {/* Thermal & Depth Metrics */}
              <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                <div className="flex items-center gap-1.5 bg-white p-1.5 border border-slate-200 rounded-none">
                  <Thermometer className="w-3.5 h-3.5 text-[#0B3A82] shrink-0" />
                  <div>
                    <div className="text-[8px] text-slate-500 font-bold uppercase">Optimal Temp</div>
                    <div className="font-bold text-[#0B3A82] font-mono text-[11px]">
                      {species.optTempMin}–{species.optTempMax}°C
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 bg-white p-1.5 border border-slate-200 rounded-none">
                  <Layers className="w-3.5 h-3.5 text-[#0B3A82] shrink-0" />
                  <div>
                    <div className="text-[8px] text-slate-500 font-bold uppercase">Depth Range</div>
                    <div className="font-bold text-slate-900 font-mono text-[11px]">
                      {species.minDepth}–{species.maxDepth}m
                    </div>
                  </div>
                </div>
              </div>

              {/* Source Confidence */}
              <div className="mt-2.5 flex items-center justify-between text-[9px] text-slate-500 pt-1.5 border-t border-slate-100">
                <span className="flex items-center gap-1">
                  <Globe className="w-3 h-3 text-slate-400" /> Literature Source:
                </span>
                <span className="font-bold text-[#0B3A82] uppercase">
                  {species.sourceConfidence} Confidence
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
        <span>Trapezoidal-Gaussian Function</span>
        <span className="font-bold text-[#0B3A82]">CMFRI / FAO</span>
      </div>
    </div>
  );
};
