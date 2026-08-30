import React from 'react';
import { Card } from './Card';
import { Play, Loader2 } from 'lucide-react';
import type { SurfaceParameters, OceanLocation } from '../types';

interface InfoPanelProps {
  location: OceanLocation | null;
  parameters: SurfaceParameters | null;
  isPredicting: boolean;
  onRunPrediction: () => void;
  predictionReady: boolean;
}

export const InfoPanel: React.FC<InfoPanelProps> = ({ location, parameters, isPredicting, onRunPrediction, predictionReady }) => {
  const StatItem = ({ label, fullName, value, unit, tooltip }: { label: string, fullName: string, value: number | undefined, unit: string, tooltip: string }) => (
    <div className="flex flex-col p-3 rounded-lg border border-slate-100 bg-slate-50 group relative">
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 text-slate-100 text-[10px] leading-tight rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 text-center">
        {tooltip}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
      </div>

      <div className="flex items-baseline justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-800">{label}</span>
          <span className="text-[10px] text-slate-400 hidden sm:inline-block truncate max-w-[120px]">{fullName}</span>
        </div>
        <span className="text-[10px] text-slate-500 font-medium">{unit}</span>
      </div>
      
      {value === undefined ? (
        <div className="text-slate-300 text-sm font-medium">--</div>
      ) : (
        <div className="text-xl font-bold text-slate-900 tracking-tight">
          {value.toFixed(2)}
        </div>
      )}
    </div>
  );

  const canPredict = location && parameters && !isPredicting;

  return (
    <Card className="h-full flex flex-col border-slate-200 shadow-none">
      <div className="mb-5 border-b border-slate-100 pb-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1">Selected Location</h2>
        {location ? (
          <div className="text-lg font-semibold text-ocean-700">
            {location.lat.toFixed(3)}°N, {location.lng.toFixed(3)}°E
          </div>
        ) : (
          <div className="text-slate-400 text-sm">Select a location on the map</div>
        )}
      </div>

      <div className="mb-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Surface Observations</h3>
      </div>

      <div className="grid grid-cols-2 gap-3 flex-grow overflow-y-auto pr-1">
        <div className="col-span-2 sm:col-span-1">
          <StatItem 
            label="SST" fullName="Sea Surface Temperature" value={parameters?.sst} unit="°C"
            tooltip="Sea Surface Temperature — temperature of the ocean surface."
          />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <StatItem 
            label="SSS" fullName="Sea Surface Salinity" value={parameters?.sss} unit="PSU"
            tooltip="Sea Surface Salinity — salinity of the ocean surface."
          />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <StatItem 
            label="SLA" fullName="Sea Level Anomaly" value={parameters?.sla} unit="m"
            tooltip="Sea Level Anomaly — deviation of sea surface height from the reference mean."
          />
        </div>
        <div className="col-span-2 sm:col-span-1">
          {/* Placeholder for grid alignment */}
        </div>
        <div className="col-span-2 sm:col-span-1">
          <StatItem 
            label="Current U" fullName="Eastward Current" value={parameters?.current_u} unit="m/s"
            tooltip="Eastward component of surface ocean current."
          />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <StatItem 
            label="Current V" fullName="Northward Current" value={parameters?.current_v} unit="m/s"
            tooltip="Northward component of surface ocean current."
          />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <StatItem 
            label="Wind U" fullName="Eastward Wind" value={parameters?.wind_u} unit="m/s"
            tooltip="Eastward component of surface wind."
          />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <StatItem 
            label="Wind V" fullName="Northward Wind" value={parameters?.wind_v} unit="m/s"
            tooltip="Northward component of surface wind."
          />
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100">
        <button
          onClick={onRunPrediction}
          disabled={!canPredict}
          className={`w-full py-3 px-4 rounded-lg flex items-center justify-center font-medium transition-all ${
            isPredicting 
              ? 'bg-slate-100 text-slate-500 cursor-wait' 
              : predictionReady
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : canPredict
                  ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-sm'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          {isPredicting ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              <div className="flex flex-col items-start text-left leading-tight">
                <span className="text-sm">Analyzing surface observations...</span>
                <span className="text-[10px] opacity-70">Estimating subsurface temperature...</span>
              </div>
            </>
          ) : predictionReady ? (
            'Prediction Ready'
          ) : location ? (
            <>
              <Play className="h-4 w-4 mr-2" /> Run Prediction
            </>
          ) : (
            'Select a location'
          )}
        </button>
      </div>
    </Card>
  );
};
