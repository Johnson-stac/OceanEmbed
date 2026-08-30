import React from 'react';

export const MapLegend: React.FC = () => {
  return (
    <div className="absolute bottom-4 right-4 z-[400] bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-md border border-slate-200 pointer-events-none">
      <h4 className="text-[10px] font-bold tracking-wider text-slate-700 mb-2 uppercase">Subsurface Temperature</h4>
      <div className="flex items-center space-x-1">
        <span className="text-[10px] text-slate-500 w-7">Cool</span>
        <div className="h-2 w-32 bg-gradient-to-r from-blue-500 via-cyan-400 to-red-500 rounded-full"></div>
        <span className="text-[10px] text-slate-500 w-8 text-right">Warm</span>
      </div>
      <p className="mt-1 text-[9px] text-slate-500">°C · model output</p>
    </div>
  );
};
