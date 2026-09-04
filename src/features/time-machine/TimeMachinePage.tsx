import { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from '../../components/Header';
import { TimeMachineControls } from './TimeMachineControls';
import { TimeMachineMap } from './TimeMachineMap';
import { TimeMachineTimeline } from './TimeMachineTimeline';
import { TimeMachineLegend } from './TimeMachineLegend';
import { TimeMachineInfoPanel } from './TimeMachineInfoPanel';
import { 
  MONTH_STATES, 
  getMonthlyGridData, 
  getLocationSnapshot, 
  getLocationTimeSeries, 
  getDepthTimeHeatmap 
} from './timeMachineData';
import type { VariableType, DepthType, ViewMode } from './timeMachineTypes';
import { Sparkles, Globe2, ShieldCheck, Compass } from 'lucide-react';

export default function TimeMachinePage() {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

  const [variable, setVariable] = useState<VariableType>('Temperature');
  const [depth, setDepth] = useState<DepthType>(100);
  const [mode, setMode] = useState<ViewMode>('Normal');

  const [compareIndexA, setCompareIndexA] = useState<number>(0);
  const [compareIndexB, setCompareIndexB] = useState<number>(41);

  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number }>({
    lat: 15.25,
    lng: 72.50
  });

  const [isRevealed, setIsRevealed] = useState<boolean>(false);

  // Playback timer effect
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      const ms = Math.max(80, Math.round(1000 / playbackSpeed));
      interval = setInterval(() => {
        setCurrentIndex(prev => {
          if (prev >= MONTH_STATES.length - 1) {
            return 0;
          }
          return prev + 1;
        });
      }, ms);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, playbackSpeed]);

  const currentMonthState = MONTH_STATES[currentIndex] || MONTH_STATES[0];
  const compareStateA = MONTH_STATES[compareIndexA] || MONTH_STATES[0];
  const compareStateB = MONTH_STATES[compareIndexB] || MONTH_STATES[41];

  const gridData = useMemo(() => {
    return getMonthlyGridData(
      currentMonthState.year,
      currentMonthState.month,
      variable,
      depth,
      mode,
      compareStateA.year,
      compareStateA.month
    );
  }, [currentMonthState, variable, depth, mode, compareStateA]);

  const locationSnapshot = useMemo(() => {
    if (!selectedLocation) return null;
    return getLocationSnapshot(
      selectedLocation.lat,
      selectedLocation.lng,
      currentMonthState,
      depth,
      variable
    );
  }, [selectedLocation, currentMonthState, depth, variable]);

  const locationTimeSeries = useMemo(() => {
    if (!selectedLocation) return [];
    return getLocationTimeSeries(
      selectedLocation.lat,
      selectedLocation.lng,
      currentIndex,
      depth,
      variable
    );
  }, [selectedLocation, currentIndex, depth, variable]);

  const depthTimeMatrix = useMemo(() => {
    if (!selectedLocation) return [];
    return getDepthTimeHeatmap(
      selectedLocation.lat,
      selectedLocation.lng,
      currentMonthState
    );
  }, [selectedLocation, currentMonthState]);

  const handleToggleReveal = useCallback(() => {
    setIsRevealed(prev => {
      const next = !prev;
      if (next) {
        setDepth(100);
      } else {
        setDepth(0);
      }
      return next;
    });
  }, []);

  const handleReset = () => {
    setCurrentIndex(0);
    setIsPlaying(false);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans text-slate-900 pb-20">
      
      {/* Header Navigation */}
      <Header />

      {/* Main Page Workspace */}
      <main className="flex-grow max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex flex-col gap-6">
        
        {/* Page Hero Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2.5 bg-cyan-50 text-cyan-600 rounded-xl border border-cyan-100 shadow-sm">
                <Globe2 className="w-6 h-6 text-cyan-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
                  <span>OCEAN TIME MACHINE</span>
                  <span className="text-xs font-bold text-cyan-800 bg-cyan-50 px-2.5 py-1 rounded-full border border-cyan-200 uppercase tracking-widest">
                    4D WebGL Explorer
                  </span>
                </h1>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Explore how the hidden ocean changes through time across the North Indian Ocean (January 2021 → January 2025).
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-xs text-slate-700 font-semibold shadow-sm">
              <Compass className="w-4 h-4 text-cyan-600" />
              <span>North Indian Ocean (5°N–30°N, 60°E–100°E)</span>
            </div>
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Simulated Prototype Data</span>
            </div>
          </div>
        </div>

        {/* Top Control Bar */}
        <TimeMachineControls
          variable={variable}
          onVariableChange={setVariable}
          depth={depth}
          onDepthChange={setDepth}
          mode={mode}
          onModeChange={setMode}
          monthStates={MONTH_STATES}
          compareIndexA={compareIndexA}
          compareIndexB={compareIndexB}
          onCompareAChange={setCompareIndexA}
          onCompareBChange={setCompareIndexB}
        />

        {/* Main Map Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 items-stretch">
          
          {/* WebGL Animated Map */}
          <div className="h-[640px] w-full relative">
            <TimeMachineMap
              gridData={gridData}
              currentMonthState={currentMonthState}
              depth={depth}
              variable={variable}
              mode={mode}
              selectedLocation={selectedLocation}
              onLocationSelect={setSelectedLocation}
              isRevealed={isRevealed}
              onToggleReveal={handleToggleReveal}
            />
          </div>

          {/* Right Sidebar */}
          <div className="flex flex-col gap-5 justify-between">
            <TimeMachineLegend variable={variable} mode={mode} />

            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-700 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-cyan-600" />
                <span>Feature Guide</span>
              </div>
              <ul className="text-xs text-slate-600 space-y-2.5 list-disc pl-4 font-medium">
                <li>Press <strong className="text-cyan-700">PLAY TIMELINE</strong> to watch the ocean heatmap continuously evolve across 49 months.</li>
                <li>Switch depth from <strong className="text-cyan-700">0m to 1000m</strong> to explore thermoclines beneath the surface.</li>
                <li>Click any point on the map to pin telemetry & inspect time-series trends.</li>
                <li>Click <strong className="text-amber-700">REVEAL HIDDEN OCEAN</strong> to plunge below satellite surface views.</li>
              </ul>
            </div>
          </div>

        </div>

        {/* Main Bottom Timeline Bar */}
        <TimeMachineTimeline
          monthStates={MONTH_STATES}
          currentIndex={currentIndex}
          onIndexChange={setCurrentIndex}
          isPlaying={isPlaying}
          onTogglePlay={() => setIsPlaying(prev => !prev)}
          onReset={handleReset}
          playbackSpeed={playbackSpeed}
          onSpeedChange={setPlaybackSpeed}
        />

        {/* Telemetry & Analysis Panel */}
        <TimeMachineInfoPanel
          snapshot={locationSnapshot}
          timeSeries={locationTimeSeries}
          depthTimeMatrix={depthTimeMatrix}
          currentMonthState={currentMonthState}
          variable={variable}
          depth={depth}
          mode={mode}
          compareDateA={compareStateA}
          compareDateB={compareStateB}
          onSelectCompareA={ms => setCompareIndexA(MONTH_STATES.indexOf(ms))}
          onSelectCompareB={ms => setCompareIndexB(MONTH_STATES.indexOf(ms))}
        />

      </main>
    </div>
  );
}
