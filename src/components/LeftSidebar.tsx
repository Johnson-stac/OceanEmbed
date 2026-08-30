import React from 'react';
import { Calendar, MapPin, RefreshCw, Info } from 'lucide-react';
import type { SurfaceParameters, OceanLocation } from '../types';

interface LeftSidebarProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  location: OceanLocation | null;
  parameters: SurfaceParameters | null;
  onResetSelection: () => void;
  error?: string | null;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({ 
  selectedDate, 
  onDateChange, 
  location, 
  parameters,
  onResetSelection,
  error
}) => {
  
  const StatItem = ({ label, fullName, value, unit, tooltip }: { label: string, fullName: string, value: number | undefined, unit: string, tooltip: string }) => (
    <div className="flex flex-col p-3 border border-slate-200 bg-white group relative">
      {/* Tooltip */}
      <div className="absolute top-1/2 right-full -translate-y-1/2 mr-2 w-48 p-2 bg-slate-800 text-slate-100 text-[10px] leading-tight rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 text-center">
        {tooltip}
        <div className="absolute top-1/2 right-[-4px] -translate-y-1/2 border-4 border-transparent border-l-slate-800"></div>
      </div>

      <div className="flex justify-between items-start mb-1">
        <div>
          <span className="text-xs font-bold text-slate-800 tracking-tight">{label}</span>
          <div className="text-[10px] text-slate-500 uppercase tracking-wide leading-tight">{fullName}</div>
        </div>
        <Info className="h-3 w-3 text-slate-300 group-hover:text-ocean-500 transition-colors" />
      </div>
      
      <div className="mt-2 flex items-baseline gap-1">
        {value === undefined ? (
          <span className="text-slate-300 text-sm font-medium">--</span>
        ) : (
          <span className="text-lg font-bold text-slate-900 tracking-tight">{value.toFixed(2)}</span>
        )}
        <span className="text-[10px] text-slate-500 font-medium">{unit}</span>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-5 h-full">
      
      {/* Date Selector */}
      <section>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">01</div>
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Observation Date</h2>
        </div>
        <div className="border border-slate-200 bg-white p-3 flex flex-col gap-2">
          <label htmlFor="obs-date" className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Available dataset · 2021–2025</label>
          <div className="flex items-center border border-slate-300 rounded px-2 py-1.5 focus-within:border-ocean-500 focus-within:ring-1 focus-within:ring-ocean-500 transition-all">
            <Calendar className="h-4 w-4 text-slate-400 mr-2" />
            <input 
              id="obs-date"
              type="date" 
              min="2021-01-01"
              max="2025-12-31"
              value={selectedDate.split('T')[0]} 
              onChange={(e) => onDateChange(`${e.target.value}T00:00:00.000Z`)}
              className="text-sm font-medium text-slate-800 bg-transparent outline-none w-full cursor-pointer"
            />
          </div>
        </div>
      </section>

      {/* Selected Location */}
      <section>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">02</div>
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Selected Location</h2>
        </div>
        <div className="border border-slate-200 bg-white p-3">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Map input</span>
            {location && (
              <button onClick={onResetSelection} className="text-[10px] text-ocean-600 hover:text-ocean-800 font-semibold flex items-center gap-1">
                <RefreshCw className="h-3 w-3" /> Reset
              </button>
            )}
          </div>
          
          {location ? (
            <div className="flex items-center gap-2 bg-slate-50 p-2 border border-slate-100">
              <MapPin className="h-4 w-4 text-ocean-600" />
              <div className="text-xs font-bold text-slate-800 font-mono tracking-tight leading-5">
                <div>Latitude&nbsp;&nbsp;{location.lat.toFixed(2)}° N</div>
                <div>Longitude {location.lng.toFixed(2)}° E</div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400 p-2 bg-slate-50 border border-slate-100 text-center leading-relaxed">
              Click an ocean location on the map to begin.
            </div>
          )}
          {error && <p role="alert" className="mt-2 border-l-2 border-red-500 bg-red-50 px-2 py-1.5 text-[11px] leading-relaxed text-red-700">{error}</p>}
        </div>
      </section>

      {/* Surface Observations */}
      <section className="flex-grow flex flex-col">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">03</div>
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Surface Observations</h2>
        </div>
        
        <p className="-mt-1 mb-1 text-[10px] font-bold tracking-wider text-ocean-700 uppercase">Observed / input</p>
        <div className="flex flex-col gap-2 flex-grow">
          {location && parameters ? (
            <>
              <StatItem 
                label="SST" fullName="Sea Surface Temperature" value={parameters.sst} unit="°C"
                tooltip="Temperature of the ocean surface."
              />
              <StatItem 
                label="SSS" fullName="Sea Surface Salinity" value={parameters.sss} unit="PSU"
                tooltip="Salinity of the ocean surface."
              />
              <StatItem 
                label="SLA" fullName="Sea Level Anomaly" value={parameters.sla} unit="m"
                tooltip="Deviation of sea surface height from the reference mean."
              />
              <div className="grid grid-cols-2 gap-2">
                <StatItem 
                label="U" fullName="Eastward Current Component" value={parameters.current_u} unit="m/s"
                  tooltip="Eastward component of surface ocean current."
                />
                <StatItem 
                label="V" fullName="Northward Current Component" value={parameters.current_v} unit="m/s"
                  tooltip="Northward component of surface ocean current."
                />
              </div>
            </>
          ) : (
            <div className="border border-slate-200 bg-white p-6 flex items-center justify-center h-full min-h-[200px]">
              <span className="text-xs text-slate-400 text-center">Select a location on the map to view surface observations.</span>
            </div>
          )}
        </div>
      </section>

    </div>
  );
};
