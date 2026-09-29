import React from 'react';
import type { MockSpecies } from '../../data/mockSpecies';
import { CheckCircle2, Info, Thermometer, Layers, Activity, AlertTriangle } from 'lucide-react';
import { calculateThermalSuitability } from '../../services/habitatAnalysis';
import { getDepthTemperature } from '../../services/fakeModel';

interface ExplainabilityPanelProps {
  species: MockSpecies;
  selectedDepth: number;
  avgRegionTemp: number;
  modelConfidence?: number;
}

export const ExplainabilityPanel: React.FC<ExplainabilityPanelProps> = ({
  species,
  selectedDepth,
  avgRegionTemp,
  modelConfidence = 87,
}) => {
  // Compute temp at selected depth from the regional average SST
  const tempAtDepth = Number(getDepthTemperature(avgRegionTemp, selectedDepth).toFixed(1));
  const suitability = calculateThermalSuitability(tempAtDepth, species);

  const inOptimal = tempAtDepth >= species.optTempMin && tempAtDepth <= species.optTempMax;
  const inTolerance = tempAtDepth >= species.minTemp && tempAtDepth <= species.maxTemp;

  const suitClass = suitability >= 75 ? 'text-emerald-400' : suitability >= 45 ? 'text-amber-400' : 'text-slate-400';
  const suitLabel = suitability >= 75 ? 'High' : suitability >= 45 ? 'Moderate' : 'Low';
  const suitBg = suitability >= 75 ? 'border-emerald-800/60 bg-emerald-950/40' : suitability >= 45 ? 'border-amber-800/60 bg-amber-950/30' : 'border-slate-700 bg-slate-800/40';

  const CheckRow = ({ icon, label, value, pass }: { icon: React.ReactNode; label: string; value: string; pass: boolean }) => (
    <div className={`flex items-center justify-between py-2 px-3 rounded-lg border ${pass ? 'border-emerald-800/40 bg-emerald-950/30' : 'border-slate-700/60 bg-slate-800/30'} transition-colors`}>
      <div className="flex items-center gap-2">
        <div className={`${pass ? 'text-emerald-400' : 'text-slate-500'}`}>{icon}</div>
        <span className="text-[11px] text-slate-300 font-medium">{label}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className={`text-[11px] font-bold ${pass ? 'text-white' : 'text-slate-400'}`}>{value}</span>
        {pass
          ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          : <AlertTriangle className="w-3.5 h-3.5 text-slate-500 shrink-0" />
        }
      </div>
    </div>
  );

  return (
    <div className={`rounded-xl border p-4 ${suitBg}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-cyan-400 shrink-0" />
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Why This Region?</h4>
        </div>
        <div className={`text-xs font-black ${suitClass}`}>
          {suitLabel} Suitability
        </div>
      </div>

      {/* Check rows */}
      <div className="space-y-1.5 mb-3">
        <CheckRow
          icon={<Thermometer className="w-3.5 h-3.5" />}
          label={`Regional avg. temp at ${selectedDepth === 0 ? 'surface' : `${selectedDepth}m`}`}
          value={`${tempAtDepth}°C`}
          pass={inTolerance}
        />
        <CheckRow
          icon={<Activity className="w-3.5 h-3.5" />}
          label="Species optimal range"
          value={`${species.optTempMin}–${species.optTempMax}°C`}
          pass={inOptimal}
        />
        <CheckRow
          icon={<Layers className="w-3.5 h-3.5" />}
          label={`Depth within species range`}
          value={`${selectedDepth}m ∈ ${species.minDepth}–${species.maxDepth}m`}
          pass={selectedDepth >= species.minDepth && selectedDepth <= species.maxDepth}
        />
        <CheckRow
          icon={<Activity className="w-3.5 h-3.5" />}
          label="Thermal suitability score"
          value={`${suitability}% (${suitLabel})`}
          pass={suitability >= 45}
        />
      </div>

      {/* Model confidence */}
      <div className="flex items-center justify-between text-[10px] py-2 border-t border-slate-700/50">
        <span className="text-slate-400 font-medium">OceanEmbed model confidence</span>
        <span className="font-bold text-cyan-400">{modelConfidence}%</span>
      </div>

      {/* Disclaimer */}
      <div className="mt-2 text-[9px] text-slate-500 italic leading-relaxed">
        Other ecological factors (chlorophyll, salinity, O₂, currents, prey) are not included in this score.
      </div>
    </div>
  );
};
