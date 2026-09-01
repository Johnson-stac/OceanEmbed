import React from 'react';
import type { MockSpecies } from '../../data/mockSpecies';
import { Fish, Thermometer, Layers, CheckCircle2, Waves } from 'lucide-react';

interface SpeciesSelectorProps {
  speciesList: MockSpecies[];
  selectedSpeciesId: string;
  onSelectSpecies: (id: string) => void;
}

export const SpeciesSelector: React.FC<SpeciesSelectorProps> = ({
  speciesList,
  selectedSpeciesId,
  onSelectSpecies
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Fish className="w-4 h-4 text-indigo-600" />
          Target Marine Species
        </h3>
        <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
          {speciesList.length} Species
        </span>
      </div>

      {/* Species Card List */}
      <div className="space-y-3 flex-grow overflow-y-auto pr-1">
        {speciesList.map((species) => {
          const isSelected = species.id === selectedSpeciesId;

          return (
            <div
              key={species.id}
              onClick={() => onSelectSpecies(species.id)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                isSelected
                  ? 'bg-indigo-50/70 border-indigo-500 shadow-sm ring-1 ring-indigo-500'
                  : 'bg-slate-50/70 border-slate-200/80 hover:border-indigo-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div>
                  <div className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                    {species.name}
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />}
                  </div>
                  <div className="text-[11px] italic font-medium text-slate-500">
                    {species.scientificName}
                  </div>
                </div>

                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider shrink-0 ${
                    species.category === 'Commercial'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : species.category === 'Highly Migratory'
                      ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                      : species.category === 'Deepwater'
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}
                >
                  {species.category}
                </span>
              </div>

              <p className="text-[11px] text-slate-600 leading-snug mb-3 line-clamp-2">
                {species.description}
              </p>

              {/* Thermal & Depth Metrics */}
              <div className="grid grid-cols-2 gap-2 text-[10px] font-medium pt-2 border-t border-slate-200/60">
                <div className="flex items-center gap-1.5 text-slate-700 bg-white/80 p-1.5 rounded-md border border-slate-100">
                  <Thermometer className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <div>
                    <div className="text-[9px] text-slate-400 font-semibold uppercase">Opt. Temp</div>
                    <div className="font-bold text-slate-900">{species.optTemp}°C <span className="font-normal text-slate-500">({species.minTemp}–{species.maxTemp}°C)</span></div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-slate-700 bg-white/80 p-1.5 rounded-md border border-slate-100">
                  <Layers className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                  <div>
                    <div className="text-[9px] text-slate-400 font-semibold uppercase">Depth Range</div>
                    <div className="font-bold text-slate-900">{species.minDepth}m – {species.maxDepth}m</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span className="flex items-center gap-1">
          <Waves className="w-3.5 h-3.5 text-indigo-500" /> Model: Thermal Gaussian Index
        </span>
        <span className="font-semibold text-indigo-700">Live Spatial Map</span>
      </div>
    </div>
  );
};
