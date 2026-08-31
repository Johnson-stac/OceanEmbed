import React from 'react';
import type { MockSpecies } from '../../data/mockSpecies';
import { Fish, Info } from 'lucide-react';

interface SpeciesSelectorProps {
  speciesList: MockSpecies[];
  selectedSpeciesId: string;
  onSelectSpecies: (id: string) => void;
}

export const SpeciesSelector: React.FC<SpeciesSelectorProps> = ({ speciesList, selectedSpeciesId, onSelectSpecies }) => {
  const selected = speciesList.find(s => s.id === selectedSpeciesId);

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 h-full flex flex-col">
      <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wide flex items-center gap-2">
        <Fish className="w-4 h-4 text-cyan-500" />
        Species Profile
      </h3>
      
      <div className="space-y-4 flex-grow">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Select Species</label>
          <div className="relative">
            <select 
              value={selectedSpeciesId}
              onChange={(e) => onSelectSpecies(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 pl-3 pr-8 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 appearance-none cursor-pointer"
            >
              {speciesList.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        {selected && (
          <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 space-y-3">
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Demo Thermal Preference</div>
              <div className="text-sm font-semibold text-slate-900">{selected.minTemp}°C – {selected.maxTemp}°C</div>
            </div>
            
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Description</div>
              <div className="text-xs text-slate-600 leading-relaxed">{selected.description}</div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-start gap-2 bg-blue-50/50 p-3 rounded-lg border border-blue-100">
        <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
        <p className="text-[10px] text-blue-800 font-medium leading-relaxed">
          These are demonstration thermal preference profiles. Do not present them as authoritative biological thresholds.
        </p>
      </div>
    </div>
  );
};
