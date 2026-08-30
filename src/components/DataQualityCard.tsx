import React from 'react';
import { Card } from './Card';

export const DataQualityCard: React.FC = () => {
  return (
    <Card className="p-6 border-slate-200 shadow-sm h-full flex flex-col justify-between">
      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
        <span className="text-sm font-medium text-slate-500">Spatial Resolution</span>
        <span className="text-sm font-semibold text-slate-900">0.25°</span>
      </div>
      <div className="flex justify-between items-center border-b border-slate-100 py-3">
        <span className="text-sm font-medium text-slate-500">Temporal Resolution</span>
        <span className="text-sm font-semibold text-slate-900">Daily</span>
      </div>
      <div className="flex justify-between items-center border-b border-slate-100 py-3">
        <span className="text-sm font-medium text-slate-500">Surface Variables</span>
        <span className="text-sm font-semibold text-slate-900">7</span>
      </div>
      <div className="flex justify-between items-center border-b border-slate-100 py-3">
        <span className="text-sm font-medium text-slate-500">Prediction Depths</span>
        <span className="text-sm font-semibold text-slate-900">6</span>
      </div>
      <div className="flex justify-between items-center pt-3">
        <span className="text-sm font-medium text-slate-500">Model Status</span>
        <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 uppercase tracking-wide">Demo</span>
      </div>
    </Card>
  );
};
