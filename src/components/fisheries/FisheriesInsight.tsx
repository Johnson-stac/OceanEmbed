import React from 'react';
import type { HabitatAnalysisResult } from '../../services/habitatAnalysis';
import type { MockSpecies } from '../../data/mockSpecies';
import { Lightbulb } from 'lucide-react';

interface FisheriesInsightProps {
  analysis: HabitatAnalysisResult | null;
  species: MockSpecies;
}

export const FisheriesInsight: React.FC<FisheriesInsightProps> = ({ analysis, species }) => {
  if (!analysis) return null;

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl p-6 shadow-sm relative overflow-hidden h-full">
      <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
        <Lightbulb className="w-32 h-32 text-indigo-900" />
      </div>
      
      <div className="flex items-start gap-4 relative z-10">
        <div className="bg-indigo-600 text-white p-2.5 rounded-xl shadow-md shrink-0">
          <Lightbulb className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-base font-bold text-indigo-950 mb-2 tracking-tight">OceanEmbed Fisheries Insight</h4>
          
          <div className="space-y-3 text-sm text-indigo-900 leading-relaxed font-medium">
            {analysis.compatibleDepths ? (
              <p>
                At the selected location, the predicted temperature profile remains within the demonstration thermal range ({species.minTemp}–{species.maxTemp}°C) of the selected species between approximately <span className="font-bold bg-indigo-100 px-1 rounded">{analysis.compatibleDepths[0]}m and {analysis.compatibleDepths[1]}m</span>.
              </p>
            ) : (
              <p>
                At the selected location, the predicted temperature profile does not intersect the demonstration thermal range ({species.minTemp}–{species.maxTemp}°C) of the selected species.
              </p>
            )}
            
            <p className="text-indigo-800/80 italic text-xs mt-4">
              This thermal information could be combined with biological observations, chlorophyll, productivity, currents and fisheries data in a future habitat modeling system.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
