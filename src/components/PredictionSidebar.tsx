import React from 'react';
import { Loader2 } from 'lucide-react';
import type { PredictionResponse } from '../types';

interface PredictionSidebarProps {
  canPredict: boolean;
  isPredicting: boolean;
  predictionData: PredictionResponse | null;
  onRunPrediction: () => void;
  error?: string | null;
}

export const PredictionSidebar: React.FC<PredictionSidebarProps> = ({
  canPredict,
  isPredicting,
  predictionData,
  onRunPrediction,
  error
}) => {
  return (
    <div className="flex flex-col gap-5 h-full">
      <section className="flex-grow flex flex-col">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">04</div>
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Subsurface Temperature</h2>
        </div>

        <div className="border border-slate-200 bg-white p-4 flex flex-col min-h-[360px] lg:h-[600px]">
          <p className="mb-4 text-[10px] font-bold tracking-wider text-ocean-700 uppercase">Predicted / model output</p>
          
          {!predictionData && !isPredicting && (
            <div className="flex-grow flex flex-col items-center justify-center text-center gap-4 py-8">
              <span className="text-xs leading-relaxed text-slate-500 font-medium">
                {canPredict ? "Surface observations ready. Run the model to estimate subsurface temperature." : "Select a location and run the model."}
              </span>
              <button
                onClick={onRunPrediction}
                disabled={!canPredict}
                className={`w-full py-2.5 px-4 text-xs font-bold uppercase tracking-wider transition-all border ${
                  canPredict
                    ? 'bg-ocean-600 text-white border-ocean-600 hover:bg-ocean-700'
                    : 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
                }`}
              >
                Run Prediction
              </button>
            </div>
          )}

          {error && <p role="alert" className="mb-4 border-l-2 border-red-500 bg-red-50 px-2 py-2 text-xs text-red-700">{error}</p>}

          {isPredicting && (
            <div className="flex-grow flex flex-col items-center justify-center text-center gap-4 py-8">
              <Loader2 className="h-6 w-6 text-ocean-600 animate-spin" />
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-slate-800">Analyzing surface observations...</span>
                <span className="text-[10px] text-slate-500">Estimating subsurface temperature profile...</span>
              </div>
            </div>
          )}

          {predictionData && !isPredicting && (
            <div className="flex flex-col h-full">
              <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Prediction Complete
              </div>

              <div className="flex justify-between items-end border-b border-slate-200 pb-2 mb-2 px-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Depth</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Temperature</span>
              </div>

              <div className="flex flex-col gap-1 flex-grow overflow-y-auto mb-4">
                {predictionData.predictions.map((p, idx) => (
                  <div key={idx} className="flex justify-between items-center py-1.5 px-1 hover:bg-slate-50 transition-colors">
                    <span className="text-xs font-semibold text-slate-700">{p.depth} m</span>
                    <span className="text-xs font-bold text-slate-900 tracking-tight">{p.predicted_temperature.toFixed(2)} °C</span>
                  </div>
                ))}
              </div>

              <div className="mt-auto pt-4 border-t border-slate-200">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Model confidence</span>
                  <span className="text-[10px] font-bold text-slate-700">{predictionData.demo_confidence}%</span>
                </div>
                {/* Visual bar for uncertainty */}
                <div className="w-full h-1.5 bg-slate-100 flex overflow-hidden" role="progressbar" aria-label="Demonstration model confidence" aria-valuemin={0} aria-valuemax={100} aria-valuenow={predictionData.demo_confidence}>
                  <div className="h-full bg-ocean-600" style={{ width: `${predictionData.demo_confidence}%` }}></div>
                </div>
                <p className="mt-2 text-[10px] leading-relaxed text-slate-500">Demonstration value only; not scientifically validated.</p>
              </div>
              
              <button
                onClick={onRunPrediction}
                className="w-full mt-4 py-2 text-[10px] font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 uppercase tracking-wider transition-colors"
              >
                Re-run Prediction
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
