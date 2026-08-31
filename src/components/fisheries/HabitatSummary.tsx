import React from 'react';
import type { HabitatAnalysisResult } from '../../services/habitatAnalysis';
import { Target, ThermometerSnowflake, Activity } from 'lucide-react';

interface HabitatSummaryProps {
  analysis: HabitatAnalysisResult | null;
}

export const HabitatSummary: React.FC<HabitatSummaryProps> = ({ analysis }) => {
  if (!analysis) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center h-full flex flex-col items-center justify-center">
        <Activity className="w-8 h-8 text-slate-300 mb-3" />
        <h3 className="text-sm font-semibold text-slate-700">No Location Selected</h3>
        <p className="text-xs text-slate-500 mt-1">Select a location on the map to analyze habitat suitability.</p>
      </div>
    );
  }

  const getScoreColor = (category: string) => {
    switch(category) {
      case 'High': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'Moderate': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'Low': return 'text-rose-600 bg-rose-50 border-rose-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const scoreStyle = getScoreColor(analysis.category);

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-900 tracking-tight">Thermal Habitat Analysis</h3>
        <div className="px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full text-[10px] font-bold uppercase tracking-wider">
          Demo Values
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className={`border rounded-xl p-4 ${scoreStyle} flex flex-col justify-center items-center text-center relative overflow-hidden`}>
          <div className="text-[10px] font-bold uppercase tracking-wider mb-1 opacity-80">Thermal Suitability</div>
          <div className="text-3xl font-black mb-1">{analysis.score}<span className="text-sm opacity-70">/100</span></div>
          <div className="text-xs font-semibold uppercase">{analysis.category}</div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-center">
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <Target className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Compatible Depth</span>
          </div>
          <div className="text-xl font-bold text-slate-900">
            {analysis.compatibleDepths ? `${analysis.compatibleDepths[0]} - ${analysis.compatibleDepths[1]} m` : 'None'}
          </div>
          
          <div className="flex items-center gap-2 text-slate-500 mt-3 mb-1">
            <ThermometerSnowflake className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Surface Temp</span>
          </div>
          <div className="text-lg font-bold text-slate-900">
            {analysis.surfaceTemp ? `${analysis.surfaceTemp.toFixed(1)}°C` : 'N/A'}
          </div>
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-slate-100">
        <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
          <span className="font-bold text-slate-700">Note:</span> This score represents compatibility between the predicted temperature profile and the selected demonstration thermal preference range. It is not a prediction of actual species presence.
        </p>
      </div>
    </div>
  );
};
