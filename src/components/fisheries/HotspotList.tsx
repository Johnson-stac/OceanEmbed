import React from 'react';
import type { HabitatHotspot } from '../../services/habitatAnalysis';
import { Flame, MapPin, TrendingUp } from 'lucide-react';

interface HotspotListProps {
  hotspots: HabitatHotspot[];
  speciesName: string;
}

export const HotspotList: React.FC<HotspotListProps> = ({ hotspots, speciesName }) => {
  if (!hotspots || hotspots.length === 0) {
    return (
      <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5 text-center text-xs text-slate-500">
        No significant thermal hotspots detected in the current region.
      </div>
    );
  }

  const categoryStyle = (cat: HabitatHotspot['category']) => {
    if (cat === 'High') return {
      bg: 'bg-emerald-950/50',
      border: 'border-emerald-800/60',
      dot: 'bg-emerald-400',
      text: 'text-emerald-400',
      label: 'bg-emerald-900/60 text-emerald-300 border-emerald-700'
    };
    if (cat === 'Moderate') return {
      bg: 'bg-amber-950/30',
      border: 'border-amber-800/50',
      dot: 'bg-amber-400',
      text: 'text-amber-400',
      label: 'bg-amber-900/60 text-amber-300 border-amber-700'
    };
    return {
      bg: 'bg-slate-800/40',
      border: 'border-slate-700',
      dot: 'bg-slate-500',
      text: 'text-slate-400',
      label: 'bg-slate-800 text-slate-400 border-slate-700'
    };
  };

  return (
    <div className="bg-slate-900/80 border border-slate-700 rounded-2xl overflow-hidden shadow-lg">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-slate-700/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="bg-amber-500/20 p-1.5 rounded-lg border border-amber-700/40">
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Thermal Habitat Hotspots</h4>
            <p className="text-[10px] text-slate-500 mt-0.5">Data-derived from OceanEmbed spatial analysis</p>
          </div>
        </div>
        <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 border border-amber-800/50 px-2 py-0.5 rounded">
          {speciesName}
        </span>
      </div>

      {/* Hotspot List */}
      <div className="p-4 space-y-2.5">
        {hotspots.map((hs) => {
          const style = categoryStyle(hs.category);
          return (
            <div
              key={hs.regionName}
              className={`${style.bg} border ${style.border} rounded-xl px-3.5 py-2.5 flex items-center gap-3 transition-colors`}
            >
              {/* Rank */}
              <div className="text-base font-black text-slate-600 w-5 text-center shrink-0">
                {hs.rank}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${style.dot}`} />
                  <span className="text-sm font-bold text-white truncate">{hs.regionName}</span>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {hs.lat.toFixed(1)}°N, {hs.lng.toFixed(1)}°E
                  </span>
                  <span>Avg temp: <span className="text-cyan-400 font-semibold">{hs.peakTemp}°C</span></span>
                </div>
              </div>

              {/* Suitability */}
              <div className="text-right shrink-0">
                <div className={`text-lg font-black ${style.text}`}>{hs.avgSuitability}%</div>
                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border ${style.label}`}>
                  {hs.category}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <div className="px-4 pb-3 text-[9px] text-slate-600 italic flex items-center gap-1.5">
        <TrendingUp className="w-3 h-3" />
        Hotspot rankings computed from aggregated spatial grid suitability. Classified as "Potential Thermal Habitat" only.
      </div>
    </div>
  );
};
