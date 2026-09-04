import React from 'react';
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight, Gauge } from 'lucide-react';
import type { MonthState } from './timeMachineTypes';

interface TimeMachineTimelineProps {
  monthStates: MonthState[];
  currentIndex: number;
  onIndexChange: (idx: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
  playbackSpeed: number;
  onSpeedChange: (speed: number) => void;
}

export const TimeMachineTimeline: React.FC<TimeMachineTimelineProps> = ({
  monthStates,
  currentIndex,
  onIndexChange,
  isPlaying,
  onTogglePlay,
  onReset,
  playbackSpeed,
  onSpeedChange
}) => {
  const currentMonth = monthStates[currentIndex] || monthStates[0];

  const handleStepBack = () => {
    onIndexChange(Math.max(0, currentIndex - 1));
  };

  const handleStepForward = () => {
    onIndexChange(Math.min(monthStates.length - 1, currentIndex + 1));
  };

  const speeds = [0.5, 1, 2, 5, 10];

  return (
    <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex flex-col gap-4 w-full">
      
      {/* Top: Timeline Slider & Year Indicators */}
      <div className="relative px-2">
        
        {/* Year Markers Row */}
        <div className="flex justify-between items-center text-xs font-bold text-slate-500 mb-2 px-1">
          <span>2021</span>
          <span>2022</span>
          <span>2023</span>
          <span>2024</span>
          <span>Jan 2025</span>
        </div>

        {/* Range Slider Track */}
        <div className="relative flex items-center">
          <input
            type="range"
            min={0}
            max={monthStates.length - 1}
            value={currentIndex}
            onChange={e => onIndexChange(parseInt(e.target.value, 10))}
            className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600 focus:outline-none border border-slate-300"
          />
        </div>

        {/* Selected Month Bubble below slider */}
        <div className="flex justify-center mt-2">
          <div className="bg-cyan-50 border border-cyan-300 text-cyan-800 text-xs font-black px-4 py-1 rounded-full shadow-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-600 animate-pulse" />
            <span>{currentMonth.label}</span>
          </div>
        </div>
      </div>

      {/* Bottom: Playback Controls Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100">
        
        {/* Play / Pause / Step Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl transition-colors border border-slate-200 shadow-sm"
            title="Reset to January 2021"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handleStepBack}
            className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl transition-colors border border-slate-200 shadow-sm"
            title="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={onTogglePlay}
            className={`px-6 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md flex items-center gap-2.5 border ${
              isPlaying
                ? 'bg-amber-600 hover:bg-amber-500 text-white border-amber-700'
                : 'bg-cyan-600 hover:bg-cyan-500 text-white border-cyan-700'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-white" />
                <span>PAUSE</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>PLAY TIMELINE</span>
              </>
            )}
          </button>

          <button
            onClick={handleStepForward}
            className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl transition-colors border border-slate-200 shadow-sm"
            title="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Current Date Text Label */}
        <div className="text-center">
          <div className="text-lg font-black text-slate-900 tracking-tight">
            {currentMonth.fullLabel}
          </div>
          <div className="text-[11px] font-semibold text-slate-500">
            Monthly Step: {currentIndex + 1} of {monthStates.length}
          </div>
        </div>

        {/* Playback Speed Selector */}
        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
          <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 pl-2 pr-1">
            <Gauge className="w-3.5 h-3.5 text-cyan-600" />
            <span>Speed:</span>
          </div>
          {speeds.map(sp => (
            <button
              key={sp}
              onClick={() => onSpeedChange(sp)}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                playbackSpeed === sp
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {sp}×
            </button>
          ))}
        </div>

      </div>

    </div>
  );
};
