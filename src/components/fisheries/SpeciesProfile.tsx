import React, { useState } from 'react';
import type { MockSpecies } from '../../data/mockSpecies';
import { Thermometer, Layers, Globe2, Waves, ChevronDown, ChevronUp, ExternalLink, ShieldCheck, MapPin } from 'lucide-react';

interface SpeciesProfileProps {
  species: MockSpecies;
  suitabilityScore: number;
}

export const SpeciesProfile: React.FC<SpeciesProfileProps> = ({ species, suitabilityScore }) => {
  const [expanded, setExpanded] = useState(false);

  const scoreColor =
    suitabilityScore >= 75 ? 'text-emerald-400' :
    suitabilityScore >= 45 ? 'text-amber-400' : 'text-slate-400';

  const scoreBg =
    suitabilityScore >= 75 ? 'bg-emerald-950 border-emerald-800' :
    suitabilityScore >= 45 ? 'bg-amber-950 border-amber-800' : 'bg-slate-800 border-slate-700';

  const scoreLabel =
    suitabilityScore >= 75 ? 'High Suitability' :
    suitabilityScore >= 45 ? 'Moderate Suitability' : 'Low Suitability';

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
      
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-slate-700/60">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border ${
                species.category === 'Highly Migratory' ? 'bg-indigo-900/60 text-indigo-300 border-indigo-700' :
                species.category === 'Commercial' ? 'bg-emerald-900/60 text-emerald-300 border-emerald-700' :
                species.category === 'Deepwater' ? 'bg-blue-900/60 text-blue-300 border-blue-700' :
                'bg-amber-900/60 text-amber-300 border-amber-700'
              }`}>
                {species.category}
              </span>
              <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">
                {species.habitatType}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white leading-tight">{species.name}</h3>
            <p className="text-xs italic text-slate-400 mt-0.5">{species.scientificName}</p>
            {species.localNames.length > 0 && (
              <p className="text-[10px] text-slate-500 mt-1 font-medium">
                Also: {species.localNames.slice(0, 3).join(' · ')}
              </p>
            )}
          </div>

          {/* Suitability Score Badge */}
          <div className={`shrink-0 px-3 py-2.5 rounded-xl border text-center min-w-[72px] ${scoreBg}`}>
            <div className={`text-2xl font-black ${scoreColor}`}>{suitabilityScore}%</div>
            <div className="text-[9px] font-bold text-slate-400 mt-0.5 uppercase tracking-wide">Thermal</div>
            <div className={`text-[9px] font-bold ${scoreColor}`}>{scoreLabel.split(' ')[0]}</div>
          </div>
        </div>
      </div>

      {/* Key Stats Grid */}
      <div className="grid grid-cols-2 gap-px bg-slate-700/40 border-b border-slate-700/40">
        <div className="bg-slate-800/60 px-4 py-3">
          <div className="flex items-center gap-1.5 text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-1">
            <Thermometer className="w-3 h-3 text-rose-400" /> Thermal Window
          </div>
          <div className="text-xs font-bold text-white">{species.minTemp}°C – {species.maxTemp}°C</div>
          <div className="text-[10px] text-emerald-400 font-semibold">Optimal: {species.optTempMin}–{species.optTempMax}°C</div>
        </div>
        <div className="bg-slate-800/60 px-4 py-3">
          <div className="flex items-center gap-1.5 text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-1">
            <Layers className="w-3 h-3 text-cyan-400" /> Depth Range
          </div>
          <div className="text-xs font-bold text-white">{species.minDepth} – {species.maxDepth} m</div>
          <div className="text-[10px] text-cyan-400 font-semibold">
            {species.maxDepth > 200 ? 'Subsurface / Deep' : species.maxDepth > 100 ? 'Mixed Layer' : 'Epipelagic'}
          </div>
        </div>
        <div className="bg-slate-800/60 px-4 py-3">
          <div className="flex items-center gap-1.5 text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-1">
            <Globe2 className="w-3 h-3 text-indigo-400" /> Distribution
          </div>
          <div className="flex items-center gap-2 mt-1">
            {species.arabianSea && (
              <span className="text-[10px] font-bold bg-indigo-900/60 text-indigo-300 border border-indigo-700 px-2 py-0.5 rounded">Arabian Sea</span>
            )}
            {species.bayOfBengal && (
              <span className="text-[10px] font-bold bg-teal-900/60 text-teal-300 border border-teal-700 px-2 py-0.5 rounded">Bay of Bengal</span>
            )}
          </div>
        </div>
        <div className="bg-slate-800/60 px-4 py-3">
          <div className="flex items-center gap-1.5 text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-1">
            <Waves className="w-3 h-3 text-blue-400" /> Confidence
          </div>
          <div className={`text-xs font-bold ${species.sourceConfidence === 'High' ? 'text-emerald-400' : 'text-amber-400'}`}>
            {species.sourceConfidence}
          </div>
          <div className="text-[10px] text-slate-500">{species.sources[0]?.name.split('–')[0]}</div>
        </div>
      </div>

      {/* Primary Region */}
      <div className="px-4 py-2.5 border-b border-slate-700/40 flex items-center gap-2">
        <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span className="text-[11px] text-slate-300 font-medium">{species.primaryRegion}</span>
      </div>

      {/* Learn More Section */}
      <div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full px-4 py-2.5 flex items-center justify-between text-[11px] text-slate-400 hover:text-white transition-colors group"
        >
          <span className="font-bold uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /> Learn More & Sources
          </span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {expanded && (
          <div className="px-4 pb-4 space-y-3 border-t border-slate-700/40 pt-3">
            <div>
              <p className="text-[11px] text-slate-400 leading-relaxed">{species.description}</p>
            </div>

            <div>
              <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Seasonality</div>
              <p className="text-[10px] text-slate-400">{species.seasonality}</p>
            </div>

            <div>
              <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Temperature Relationship</div>
              <p className="text-[10px] text-slate-400">{species.temperatureRelationship}</p>
            </div>

            <div>
              <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">OceanEmbed Relevance</div>
              <p className="text-[10px] text-emerald-400/80 italic">{species.ecologicalNote}</p>
            </div>

            <div>
              <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Scientific Sources</div>
              <div className="space-y-1">
                {species.sources.map((src, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                      src.type === 'Government' ? 'bg-emerald-900/50 text-emerald-400' :
                      src.type === 'International' ? 'bg-blue-900/50 text-blue-400' :
                      src.type === 'Academic' ? 'bg-purple-900/50 text-purple-400' :
                      'bg-slate-700 text-slate-400'
                    }`}>{src.type}</span>
                    <span className="text-[10px] text-slate-400">{src.name}</span>
                    {src.url && <ExternalLink className="w-2.5 h-2.5 text-slate-600 shrink-0 mt-0.5" />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
